import pool from '../db/pool.js';

// Same cross-site rules as the auth token cookie (SameSite=None on prod).
const SESSION_COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
};
import { v4 as uuidv4 } from 'uuid';

/** Resolves or creates a cart for the current request */
async function resolveCart(client, req) {
  if (req.user) {
    // Logged-in user — use their user-based cart
    let cart = await client.query(
      'SELECT id FROM carts WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );
    if (!cart.rows.length) {
      cart = await client.query(
        'INSERT INTO carts(user_id) VALUES($1) RETURNING id',
        [req.user.id]
      );
    }
    return cart.rows[0].id;
  } else {
    // Guest — use/create session cart
    const sessionId = req.cookies?.session_id || uuidv4();
    let cart = await client.query(
      'SELECT id FROM carts WHERE session_id = $1 LIMIT 1',
      [sessionId]
    );
    if (!cart.rows.length) {
      cart = await client.query(
        'INSERT INTO carts(session_id) VALUES($1) RETURNING id',
        [sessionId]
      );
    }
    return { cartId: cart.rows[0].id, sessionId };
  }
}

const CART_ITEMS_QUERY = `
  SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.slug, p.price,
         p.sale_price, p.image_urls, p.stock
  FROM cart_items ci
  JOIN products p ON p.id = ci.product_id
  WHERE ci.cart_id = $1
`;

export async function getCart(req, res, next) {
  const client = await pool.connect();
  try {
    const resolved = await resolveCart(client, req);
    const cartId = typeof resolved === 'string' ? resolved : resolved.cartId;
    const items = await client.query(CART_ITEMS_QUERY, [cartId]);

    if (resolved.sessionId) {
      res.cookie('session_id', resolved.sessionId, SESSION_COOKIE_OPTS);
    }
    return res.json({ data: items.rows });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
}

export async function addToCart(req, res, next) {
  const client = await pool.connect();
  try {
    const { product_id, quantity = 1 } = req.body;
    if (!product_id) return res.status(400).json({ error: 'product_id is required.' });

    const resolved = await resolveCart(client, req);
    const cartId = typeof resolved === 'string' ? resolved : resolved.cartId;

    await client.query(
      `INSERT INTO cart_items(cart_id, product_id, quantity)
       VALUES($1, $2, $3)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
      [cartId, product_id, parseInt(quantity)]
    );

    const items = await client.query(CART_ITEMS_QUERY, [cartId]);
    if (resolved.sessionId) {
      res.cookie('session_id', resolved.sessionId, SESSION_COOKIE_OPTS);
    }
    res.json({ data: items.rows });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
}

export async function updateCartItem(req, res, next) {
  const client = await pool.connect();
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    if (!quantity || parseInt(quantity) < 1) {
      return res.status(400).json({ error: 'Quantity must be at least 1.' });
    }

    await client.query(
      'UPDATE cart_items SET quantity = $1 WHERE id = $2',
      [parseInt(quantity), itemId]
    );

    const resolved = await resolveCart(client, req);
    const cartId = typeof resolved === 'string' ? resolved : resolved.cartId;
    const items = await client.query(CART_ITEMS_QUERY, [cartId]);
    res.json({ data: items.rows });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
}

export async function removeCartItem(req, res, next) {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM cart_items WHERE id = $1', [req.params.itemId]);
    const resolved = await resolveCart(client, req);
    const cartId = typeof resolved === 'string' ? resolved : resolved.cartId;
    const items = await client.query(CART_ITEMS_QUERY, [cartId]);
    res.json({ data: items.rows });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
}

export async function clearCart(req, res, next) {
  const client = await pool.connect();
  try {
    const resolved = await resolveCart(client, req);
    const cartId = typeof resolved === 'string' ? resolved : resolved.cartId;
    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
    res.json({ data: [] });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
}

/** Merge guest cart into user cart on login */
export async function mergeCart(req, res, next) {
  const client = await pool.connect();
  try {
    const sessionId = req.cookies?.session_id;
    if (!sessionId) return res.json({ message: 'No guest cart to merge.' });

    const guestCart = await client.query(
      'SELECT id FROM carts WHERE session_id = $1 LIMIT 1',
      [sessionId]
    );
    if (!guestCart.rows.length) return res.json({ message: 'No guest cart found.' });

    const guestCartId = guestCart.rows[0].id;

    let userCart = await client.query(
      'SELECT id FROM carts WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );
    if (!userCart.rows.length) {
      userCart = await client.query(
        'INSERT INTO carts(user_id) VALUES($1) RETURNING id',
        [req.user.id]
      );
    }
    const userCartId = userCart.rows[0].id;

    // Move guest items → user cart (upsert)
    const guestItems = await client.query(
      'SELECT product_id, quantity FROM cart_items WHERE cart_id = $1',
      [guestCartId]
    );
    for (const item of guestItems.rows) {
      await client.query(
        `INSERT INTO cart_items(cart_id, product_id, quantity)
         VALUES($1, $2, $3)
         ON CONFLICT (cart_id, product_id)
         DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity`,
        [userCartId, item.product_id, item.quantity]
      );
    }

    // Remove guest cart
    await client.query('DELETE FROM carts WHERE id = $1', [guestCartId]);
    res.clearCookie('session_id', SESSION_COOKIE_OPTS);

    const items = await client.query(CART_ITEMS_QUERY, [userCartId]);
    res.json({ data: items.rows });
  } catch (err) {
    next(err);
  } finally {
    client.release();
  }
}
