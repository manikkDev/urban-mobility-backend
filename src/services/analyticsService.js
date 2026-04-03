const { getFirestore } = require('../config/firebase');
const { computePublicStatus } = require('./statusService');

const updateSchemeAnalytics = async (schemeId) => {
  const db = getFirestore();

  const reportsSnapshot = await db
    .collection('railway_reports')
    .where('schemeId', '==', schemeId)
    .get();

  const reports = [];
  reportsSnapshot.forEach((doc) => {
    reports.push({ id: doc.id, ...doc.data() });
  });

  const reportCount = reports.length;
  let openIssueCount = 0;
  let ignoredCount = 0;
  let criticalCount = 0;
  const categoryCounts = {};
  const conditionCounts = {};

  reports.forEach((r) => {
    if (r.reviewStatus === 'new' || r.reviewStatus === 'under_review') {
      openIssueCount++;
    }
    if (r.ignoredByOfficials) {
      ignoredCount++;
    }
    if (r.severity >= 4) {
      criticalCount++;
    }

    const cat = r.issueCategory || 'other';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;

    const cond = r.schemeCondition || 'unverified';
    conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
  });

  const { publicStatus, statusColor } = computePublicStatus(reports);

  const attentionScore = Math.min(100, Math.round(
    (openIssueCount * 8) + (ignoredCount * 10) + (criticalCount * 12) + (reportCount * 2)
  ));

  const analyticsData = {
    schemeId,
    publicStatus,
    statusColor,
    reportCount,
    openIssueCount,
    ignoredCount,
    criticalCount,
    categoryCounts,
    conditionCounts,
    attentionScore,
    lastUpdatedAt: new Date().toISOString(),
  };

  await db.collection('railway_scheme_analytics').doc(schemeId).set(analyticsData, { merge: true });

  await db.collection('railway_schemes').doc(schemeId).update({
    publicStatus,
    statusColor,
    reportCount,
    openIssueCount,
    attentionScore,
    lastReportedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  return analyticsData;
};

module.exports = { updateSchemeAnalytics };
