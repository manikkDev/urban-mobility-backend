const express = require('express');
const router = express.Router();
const { submitReport, getIssues } = require('../controllers/railwayReportController');
const { validateReport } = require('../middleware/validate');
const { verifyToken } = require('../middleware/auth');

// Optional auth middleware - attaches user if token present, but doesn't require it
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      await verifyToken(req, res, next);
    } catch (error) {
      // If token verification fails, continue without user
      next();
    }
  } else {
    next();
  }
};

router.post('/railway-reports', optionalAuth, validateReport, submitReport);
router.get('/railway-issues', getIssues);

module.exports = router;
