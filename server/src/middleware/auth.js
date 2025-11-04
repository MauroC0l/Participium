/**
 * Authentication middleware
 */

/**
 * Middleware to check if the user is logged in
 */
export const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Not authenticated' });
};

/**
 * Middleware to check if the user is a citizen
 */
export const isCitizen = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.role !== 'citizen') {
    return res.status(403).json({ 
      error: 'Access denied. Citizen role required.' 
    });
  }
  return next();
};

/**
 * Middleware to check if the user is an admin
 */
export const isAdmin = (req, res, next) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: 'Access denied. Admin role required.' 
    });
  }
  return next();
};

/**
 * Role-based authorization middleware factory
 * @param {string} requiredRole The role required to access the route
 * @returns {function} Middleware function
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (!req.user || req.user.role !== requiredRole) {
      return res.status(403).json({ 
        error: `Access denied. ${requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} role required.` 
      });
    }
    return next();
  };
};
