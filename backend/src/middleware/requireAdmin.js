import { requireAuth } from './auth.js';

/**
 * requireAuth + is_admin check. Rejects with 403 unless the authenticated
 * user is an admin.
 */
export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user && req.user.is_admin === true) return next();
    return res.status(403).json({ error: 'Admin access required.' });
  });
}