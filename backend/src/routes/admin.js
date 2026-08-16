import { Router } from 'express';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
  listAdminProducts, createProduct, updateProduct, toggleProductActive, PRODUCT_VALIDATORS,
} from '../controllers/adminProducts.js';

const router = Router();

router.use(requireAdmin);
router.get('/',                      listAdminProducts);
router.post('/', PRODUCT_VALIDATORS, createProduct);
router.put('/:id', PRODUCT_VALIDATORS, updateProduct);
router.patch('/:id/active',          toggleProductActive);

export default router;
