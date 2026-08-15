import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';

import authRoutes       from './routes/auth.js';
import productRoutes    from './routes/products.js';
import categoryRoutes   from './routes/categories.js';
import cartRoutes       from './routes/cart.js';
import orderRoutes      from './routes/orders.js';
import newsletterRoutes from './routes/newsletter.js';
import addressRoutes    from './routes/addresses.js';
import { getSitemap }   from './controllers/sitemap.js';

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// Trust the first proxy hop so rate limiting & IP detection work
// behind Render's proxy (otherwise every visitor shares one bucket).
app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);

// ── Security / general rate limit ────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
});

// ── Middleware ────────────────────────────────────────────────
app.use(limiter);
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Routes ───────────────────────────────────────────────────
app.use('/api/auth',       authRoutes);
app.use('/api/products',   productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart',       cartRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/addresses',  addressRoutes);

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Sitemap (DB-generated; proxied on the frontend origin) ─────
app.get('/api/sitemap.xml', getSitemap);

// ── Global error handler ─────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Eminence API running on http://localhost:${PORT}`);
});

export default app;
