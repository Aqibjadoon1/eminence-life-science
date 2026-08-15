import { validationResult } from 'express-validator';
import pool from '../db/pool.js';

export async function subscribe(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const { email } = req.body;

    await pool.query(
      'INSERT INTO newsletter_subscribers(email) VALUES($1) ON CONFLICT(email) DO NOTHING',
      [email]
    );

    res.json({ message: 'You\'ve been added to the Eminence list.' });
  } catch (err) {
    next(err);
  }
}
