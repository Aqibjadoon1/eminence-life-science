import { Router } from 'express';
import { subscribe } from '../controllers/newsletter.js';
import { body } from 'express-validator';

const router = Router();

router.post(
  '/subscribe',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email required.')],
  subscribe
);

export default router;
