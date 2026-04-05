const { getFirestore } = require('../config/firebase');
const { successResponse, errorResponse } = require('../utils/response');
const { classifyReport } = require('../services/classificationService');
const { updateSchemeAnalytics } = require('../services/analyticsService');

const submitReport = async (req, res, next) => {
  try {
    const db = getFirestore();
    const {
      schemeId, reportMode, issueType, severity, description,
      locationLabel, coordinates, ignoredByOfficials, schemeCondition,
    } = req.body;

    const schemeDoc = await db.collection('railway_schemes').doc(schemeId).get();
    if (!schemeDoc.exists) {
      return errorResponse(res, 'Railway scheme not found', [], 404);
    }

    const classification = classifyReport(description, issueType);

    const schemeData = schemeDoc.data();
    
    const reportData = {
      schemeId,
      stationName: schemeData.stationName || '',
      reportMode: reportMode || 'ground_issue',
      schemeCondition: schemeCondition || classification.schemeCondition,
      issueType: classification.issueType,
      issueCategory: classification.issueCategory,
      severity,
      description: description.trim(),
      locationLabel: locationLabel ? locationLabel.trim() : '',
      coordinates: coordinates || null,
      evidenceImageUrl: '',
      officialClaimMismatch: false,
      ignoredByOfficials: ignoredByOfficials || false,
      reviewStatus: 'new',
      escalationStatus: 'not_started',
      adminNote: '',
      classifiedBy: classification.classifiedBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add authenticated user info if available
    if (req.user) {
      reportData.submittedByUid = req.user.uid;
      reportData.submittedByEmail = req.user.email;
      reportData.submittedByName = req.user.fullName;
    }

    if (schemeData.officialStatus === 'completed' &&
        (classification.schemeCondition === 'not_working' || classification.schemeCondition === 'ignored')) {
      reportData.officialClaimMismatch = true;
    }

    const reportRef = await db.collection('railway_reports').add(reportData);

    await updateSchemeAnalytics(schemeId);

    return successResponse(res, 'Railway accessibility report submitted successfully. Thank you for helping improve railway accessibility.', {
      id: reportRef.id,
      ...reportData,
    }, 201);
  } catch (error) {
    next(error);
  }
};

const getIssues = async (req, res, next) => {
  try {
    const db = getFirestore();
    const { schemeId, issueCategory, issueType, reviewStatus, severity, stationName } = req.query;

    const snapshot = await db.collection('railway_reports').get();
    let issues = [];

    snapshot.forEach((doc) => {
      issues.push({ id: doc.id, ...doc.data() });
    });

    if (schemeId) {
      issues = issues.filter((i) => i.schemeId === schemeId);
    }
    if (issueCategory) {
      issues = issues.filter((i) => i.issueCategory === issueCategory);
    }
    if (issueType) {
      issues = issues.filter((i) => i.issueType === issueType);
    }
    if (reviewStatus) {
      issues = issues.filter((i) => i.reviewStatus === reviewStatus);
    }
    if (severity) {
      issues = issues.filter((i) => i.severity === parseInt(severity));
    }
    if (stationName) {
      const station = stationName.toLowerCase().trim();
      issues = issues.filter((i) => i.stationName && i.stationName.toLowerCase().includes(station));
    }

    issues.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    const schemesSnapshot = await db.collection('railway_schemes').get();
    const schemesMap = {};
    schemesSnapshot.forEach((doc) => {
      schemesMap[doc.id] = doc.data();
    });

    const enrichedIssues = issues.map((issue) => ({
      ...issue,
      schemeTitle: schemesMap[issue.schemeId]?.title || 'Unknown Railway Scheme',
      schemeCategory: schemesMap[issue.schemeId]?.category || '',
      schemeStationName: schemesMap[issue.schemeId]?.stationName || '',
      schemeDivisionName: schemesMap[issue.schemeId]?.divisionName || '',
    }));

    return successResponse(res, 'Railway issues retrieved successfully', enrichedIssues);
  } catch (error) {
    next(error);
  }
};

module.exports = { submitReport, getIssues };
