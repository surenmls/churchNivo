export function roleMiddleware(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export function churchAccessMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role === 'super_admin') {
    return next();
  }

  if (req.user.role === 'church_admin') {
    const targetChurchId = parseInt(
      req.params.id || req.params.churchId || req.body.church_id || req.resolvedChurch?.id,
      10
    );

    if (targetChurchId && req.user.church_id !== targetChurchId) {
      return res.status(403).json({ error: 'Access denied to this church' });
    }

    return next();
  }

  return res.status(403).json({ error: 'Insufficient permissions' });
}
