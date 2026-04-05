const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const { errorResponse } = require('../utils/response');

/**
 * Middleware to verify Firebase ID token and attach user to request
 */
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No authentication token provided', [], 401);
    }

    const token = authHeader.split('Bearer ')[1];
    
    if (!token) {
      return errorResponse(res, 'Invalid token format', [], 401);
    }

    // Verify the Firebase ID token
    const decodedToken = await getAuth().verifyIdToken(token);
    
    // Fetch user profile from Firestore
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    
    if (!userDoc.exists) {
      return errorResponse(res, 'User profile not found', [], 404);
    }

    const userData = userDoc.data();
    
    if (!userData.isActive) {
      return errorResponse(res, 'User account is inactive', [], 403);
    }

    // Attach user info to request
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userData.role,
      fullName: userData.fullName,
      ...userData
    };

    next();
  } catch (error) {
    console.error('Token verification error:', error);
    
    if (error.code === 'auth/id-token-expired') {
      return errorResponse(res, 'Authentication token has expired', [], 401);
    }
    
    if (error.code === 'auth/argument-error') {
      return errorResponse(res, 'Invalid authentication token', [], 401);
    }
    
    return errorResponse(res, 'Authentication failed', [], 401);
  }
};

/**
 * Middleware to require admin role
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', [], 401);
  }

  if (req.user.role !== 'admin') {
    return errorResponse(res, 'Admin access required', [], 403);
  }

  next();
};

/**
 * Middleware to require citizen role
 */
const requireCitizen = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', [], 401);
  }

  if (req.user.role !== 'citizen') {
    return errorResponse(res, 'Citizen access required', [], 403);
  }

  next();
};

/**
 * Middleware to require any authenticated user
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', [], 401);
  }

  next();
};

module.exports = {
  verifyToken,
  requireAdmin,
  requireCitizen,
  requireAuth
};
