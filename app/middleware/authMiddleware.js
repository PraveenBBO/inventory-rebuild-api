const jwt = require('jsonwebtoken');
const { requestContext } = require('@utils/requestContext');

function pickName(p = {}) {
  return (
    p.name ||
    p.full_name ||
    p.username ||
    (p.email ? p.email.split('@')[0] : null) ||
    null
  );
}

module.exports = (req, res, next) => {
  const header = req.headers['authorization'] || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  if (!token) return res.status(403).json({ message: 'Token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = {
      id: decoded.sub || decoded.userId || decoded.id || null,
      name: pickName(decoded),
      email: decoded.email || null,
      role_id: decoded.role_id ?? null,
      _raw: decoded,
    };

    req.user = user;

    // Ensure the user is available via AsyncLocalStorage for downstream services
    const store = requestContext.getStore();
    if (store) {
      store.user = user;
      return next();
    }
    // Fallback: initialize a context if not already set up
    return requestContext.run({ user }, () => next());
  } catch (e) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
