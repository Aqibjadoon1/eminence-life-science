import jwt from 'jsonwebtoken';

/**
 * Verifies the JWT from the httpOnly cookie or Authorization header.
 * Attaches decoded user payload to req.user.
 */
export function requireAuth(req, res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Optional auth — attaches user if token present, continues without it.
 */
export function optionalAuth(req, _res, next) {
  try {
    const token =
      req.cookies?.token ||
      req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    }
  } catch {
    // swallow — no token is fine for optional routes
  }
  next();
}
