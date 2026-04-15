const { getFirestore } = require('firebase-admin/firestore');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Register a new user profile after Firebase Auth signup
 */
const registerProfile = async (req, res, next) => {
  try {
    const { uid, email, fullName, role } = req.body;

    if (!uid || !email || !fullName) {
      return errorResponse(res, 'Missing required fields', ['uid, email, and fullName are required'], 400);
    }

    // Validate role
    const validRoles = ['citizen', 'admin'];
    const userRole = role && validRoles.includes(role) ? role : 'citizen';

    const db = getFirestore();
    
    // Check if user already exists
    const existingUser = await db.collection('users').doc(uid).get();
    if (existingUser.exists) {
      return errorResponse(res, 'User profile already exists', [], 409);
    }

    // Create user profile with selected role
    const userProfile = {
      uid,
      email,
      fullName: fullName.trim(),
      role: userRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    await db.collection('users').doc(uid).set(userProfile);

    return successResponse(res, 'User profile created successfully', userProfile, 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get current authenticated user profile
 */
const getProfile = async (req, res, next) => {
  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(req.user.uid).get();

    if (!userDoc.exists) {
      return errorResponse(res, 'User profile not found', [], 404);
    }

    const userData = userDoc.data();
    let reportCount = 0;

    try {
      const reportsSnapshot = await db.collection('railway_reports')
        .where('submittedByUid', '==', req.user.uid)
        .count()
        .get();

      reportCount = reportsSnapshot.data().count || 0;
    } catch (countError) {
      console.error('Failed to fetch report count for profile:', countError);
    }

    const profile = {
      ...userData,
      reportCount
    };

    return successResponse(res, 'Profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
const updateProfile = async (req, res, next) => {
  try {
    const { fullName } = req.body;

    if (!fullName || fullName.trim().length === 0) {
      return errorResponse(res, 'Full name is required', [], 400);
    }

    const db = getFirestore();
    const updateData = {
      fullName: fullName.trim(),
      updatedAt: new Date().toISOString()
    };

    await db.collection('users').doc(req.user.uid).update(updateData);

    const updatedDoc = await db.collection('users').doc(req.user.uid).get();

    return successResponse(res, 'Profile updated successfully', updatedDoc.data());
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's submitted reports
 */
const getMyReports = async (req, res, next) => {
  try {
    const db = getFirestore();
    
    const reportsSnapshot = await db.collection('railway_reports')
      .where('submittedByUid', '==', req.user.uid)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const reports = [];
    
    for (const doc of reportsSnapshot.docs) {
      const reportData = { id: doc.id, ...doc.data() };
      
      // Fetch scheme details
      if (reportData.schemeId) {
        const schemeDoc = await db.collection('railway_schemes').doc(reportData.schemeId).get();
        if (schemeDoc.exists) {
          reportData.schemeTitle = schemeDoc.data().title;
          reportData.stationName = schemeDoc.data().stationName;
        }
      }
      
      reports.push(reportData);
    }

    return successResponse(res, 'Reports retrieved successfully', reports);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerProfile,
  getProfile,
  updateProfile,
  getMyReports
};
