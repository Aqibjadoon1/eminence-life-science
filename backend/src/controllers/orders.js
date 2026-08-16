import pool from '../db/pool.js';

const SHIPPING_FEE = 200; // PKR flat rate

export async function createOrder(req, res, next) {
  const client = await pool.connect();
  try {
    const {
      address_id,
      payment_method = 'whatsapp',
      items,
      customer_name,
      order_note,
    } = req.body;

    if (!address_id || !items?.length) {
      return res.status(400).json({ error: 'address_id and items are required.' });
    }

    // Single hand-off path: orders are conveyed over WhatsApp — no
    // payment gateways exist anymore. Kept as a column for the record.
    if (payment_method !== 'whatsapp') {
      return res.status(400).json({ error: 'Invalid payment method.' });
    }

    await client.query('BEGIN');

    // Address must belong to the signed-in user
    const addrRes = await client.query(
      'SELECT id FROM addresses WHERE id = $1 AND user_id = $2',
      [address_id, req.user.id]
    );
    if (!addrRes.rows.length) {
      throw { status: 400, message: 'Invalid delivery address.' };
    }

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await client.query(
        'SELECT id, price, sale_price, stock FROM products WHERE id = $1',
        [item.product_id]
      );
      if (!product.rows.length) throw { status: 404, message: `Product ${item.product_id} not found.` };

      const p = product.rows[0];
      if (p.stock < item.quantity) {
        throw { status: 400, message: `Insufficient stock for product ${item.product_id}.` };
      }

      const unit_price = p.sale_price ?? p.price;
      subtotal += unit_price * item.quantity;
      orderItems.push({ product_id: p.id, quantity: item.quantity, unit_price });

      // Deduct stock
      await client.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2',
        [item.quantity, p.id]
      );
    }

    const total = subtotal + SHIPPING_FEE;

    const orderRes = await client.query(
      `INSERT INTO orders(user_id, address_id, subtotal, shipping_fee, total, payment_method, payment_status, customer_name, order_note)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        req.user.id,
        address_id,
        subtotal,
        SHIPPING_FEE,
        total,
        payment_method,
        'sent_to_whatsapp',
        customer_name || null,
        order_note || null,
      ]
    );
    const order = orderRes.rows[0];

    for (const oi of orderItems) {
      await client.query(
        'INSERT INTO order_items(order_id, product_id, quantity, unit_price) VALUES($1,$2,$3,$4)',
        [order.id, oi.product_id, oi.quantity, oi.unit_price]
      );
    }

    // Clear user cart
    const cartRes = await client.query(
      'SELECT id FROM carts WHERE user_id = $1 LIMIT 1',
      [req.user.id]
    );
    if (cartRes.rows.length) {
      await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartRes.rows[0].id]);
    }

    await client.query('COMMIT');
    res.status(201).json({ data: order });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

export async function getMyOrders(req, res, next) {
  try {
    const orders = await pool.query(
      `SELECT o.*, 
              json_agg(json_build_object(
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'name', p.name,
                'image_url', p.image_urls[1]
              )) AS items
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.user_id = $1
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    res.json({ data: orders.rows });
  } catch (err) {
    next(err);
  }
}

export async function getOrderById(req, res, next) {
  try {
    const order = await pool.query(
      `SELECT o.*, a.line1, a.city, a.phone AS address_phone, a.label,
              json_agg(json_build_object(
                'product_id', oi.product_id,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'name', p.name,
                'slug', p.slug,
                'image_url', p.image_urls[1]
              )) AS items
       FROM orders o
       LEFT JOIN addresses a ON a.id = o.address_id
       LEFT JOIN order_items oi ON oi.order_id = o.id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.id = $1 AND o.user_id = $2
       GROUP BY o.id, a.id`,
      [req.params.id, req.user.id]
    );
    if (!order.rows.length) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json({ data: order.rows[0] });
  } catch (err) {
    next(err);
  }
}
