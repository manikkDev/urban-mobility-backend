const express = require('express');
const router = express.Router();
const { verifyToken, requireAuth } = require('../middleware/auth');
const {
  registerProfile,
  getProfile,
  updateProfile,
  getMyReports
} = require('../controllers/authController');

// Public route - register profile after Firebase Auth signup
router.post('/register-profile', registerProfile);

// Protected routes - require authentication
router.get('/me', verifyToken, requireAuth, getProfile);
router.patch('/profile', verifyToken, requireAuth, updateProfile);
router.get('/my-reports', verifyToken, requireAuth, getMyReports);

module.exports = router;
