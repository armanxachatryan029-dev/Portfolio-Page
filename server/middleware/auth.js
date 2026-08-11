/**
 * Auth middleware — checks if user is logged in as admin.
 * Used to protect admin API routes.
 */

function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized. Please log in." });
}

module.exports = { requireAuth };
