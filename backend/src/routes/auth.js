import { Router } from 'express';
import { body } from 'express-validator';
import { register, login, logout, me } from '../controllers/auth.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be 8+ characters.'),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  login
);

router.post('/logout', logout);
router.get('/me', requireAuth, me);

export default router;
