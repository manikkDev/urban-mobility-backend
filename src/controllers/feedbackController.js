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

    const schemeDoc = await db.collection('schemes').doc(schemeId).get();
    if (!schemeDoc.exists) {
      return errorResponse(res, 'Scheme not found', [], 404);
    }

    const classification = classifyReport(description, issueType);

    const reportData = {
      schemeId,
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

    const schemeData = schemeDoc.data();
    if (schemeData.officialStatus === 'completed' &&
        (classification.schemeCondition === 'not_working' || classification.schemeCondition === 'ignored')) {
      reportData.officialClaimMismatch = true;
    }

    const reportRef = await db.collection('reports').add(reportData);

    await updateSchemeAnalytics(schemeId);

    return successResponse(res, 'Report submitted successfully. Thank you for helping improve accessibility.', {
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
    const { schemeId, issueCategory, issueType, reviewStatus, severity } = req.query;

    const snapshot = await db.collection('reports').get();
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

    issues.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    const schemesSnapshot = await db.collection('schemes').get();
    const schemesMap = {};
    schemesSnapshot.forEach((doc) => {
      schemesMap[doc.id] = doc.data();
    });

    const enrichedIssues = issues.map((issue) => ({
      ...issue,
      schemeTitle: schemesMap[issue.schemeId]?.title || 'Unknown Scheme',
      schemeCategory: schemesMap[issue.schemeId]?.category || '',
      schemeAreaName: schemesMap[issue.schemeId]?.areaName || '',
    }));

    return successResponse(res, 'Issues retrieved successfully', enrichedIssues);
  } catch (error) {
    next(error);
  }
};

module.exports = { submitReport, getIssues };
