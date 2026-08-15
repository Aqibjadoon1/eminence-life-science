import pool from '../db/pool.js';

export async function getAddresses(req, res, next) {
  try {
    const result = await pool.query(
      'SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC',
      [req.user.id]
    );
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
}

export async function createAddress(req, res, next) {
  try {
    const { label = 'Home', line1, city, phone, is_default = false } = req.body;

    if (!line1 || !city) {
      return res.status(400).json({ error: 'line1 and city are required.' });
    }

    // If this is default, unset others
    if (is_default) {
      await pool.query(
        'UPDATE addresses SET is_default = false WHERE user_id = $1',
        [req.user.id]
      );
    }

    const result = await pool.query(
      `INSERT INTO addresses(user_id, label, line1, city, phone, is_default)
       VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
      [req.user.id, label, line1, city, phone || null, is_default]
    );

    res.status(201).json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
}
