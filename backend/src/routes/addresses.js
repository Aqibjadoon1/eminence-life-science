import { Router } from 'express';
import { createAddress, getAddresses } from '../controllers/addresses.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/',  requireAuth, getAddresses);
router.post('/', requireAuth, createAddress);

export default router;
