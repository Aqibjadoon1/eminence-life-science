import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, mergeCart } from '../controllers/cart.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/',          optionalAuth, getCart);
router.post('/',         optionalAuth, addToCart);
router.patch('/:itemId', optionalAuth, updateCartItem);
router.delete('/:itemId',optionalAuth, removeCartItem);
router.delete('/',       optionalAuth, clearCart);
router.post('/merge',    requireAuth,  mergeCart);

export default router;
