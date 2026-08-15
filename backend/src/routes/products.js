import { Router } from 'express';
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getBestSellers,
  getRelatedProducts,
  getProductsByCategory,
  getCategoryAttributes,
} from '../controllers/products.js';

const router = Router();

// Order matters: specific named routes before :slug param
router.get('/featured',                      getFeaturedProducts);
router.get('/bestsellers',                   getBestSellers);
router.get('/by-category/:slug',             getProductsByCategory);
router.get('/attributes/:categorySlug',      getCategoryAttributes);
router.get('/',                              getProducts);
router.get('/:slug',                         getProductBySlug);
router.get('/:slug/related',                 getRelatedProducts);

export default router;
