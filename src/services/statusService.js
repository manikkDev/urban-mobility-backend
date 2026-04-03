const { STATUS_COLOR_MAP } = require('../utils/constants');

const computePublicStatus = (reports) => {
  if (!reports || reports.length === 0) {
    return { publicStatus: 'unverified', statusColor: 'gray' };
  }

  const recentReports = reports
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    })
    .slice(0, 10);

  let workingCount = 0;
  let partialCount = 0;
  let notWorkingCount = 0;
  let ignoredCount = 0;
  let hasMajorOpenIssue = false;

  recentReports.forEach((r) => {
    const condition = r.schemeCondition || 'unverified';
    if (condition === 'working') workingCount++;
    else if (condition === 'partially_working') partialCount++;
    else if (condition === 'not_working') notWorkingCount++;
    else if (condition === 'ignored') ignoredCount++;

    if (r.reviewStatus === 'new' && r.severity >= 4) {
      hasMajorOpenIssue = true;
    }
  });

  const total = recentReports.length;

  if (ignoredCount > 0 && ignoredCount >= total * 0.3) {
    return { publicStatus: 'ignored', statusColor: 'red' };
  }

  if (notWorkingCount >= total * 0.5) {
    return { publicStatus: 'not_working', statusColor: 'red' };
  }

  if (hasMajorOpenIssue && notWorkingCount > 0) {
    return { publicStatus: 'not_working', statusColor: 'red' };
  }

  if (partialCount > 0 || notWorkingCount > 0) {
    return { publicStatus: 'partially_working', statusColor: 'yellow' };
  }

  if (workingCount > 0 && notWorkingCount === 0 && ignoredCount === 0 && !hasMajorOpenIssue) {
    return { publicStatus: 'working', statusColor: 'green' };
  }

  return { publicStatus: 'partially_working', statusColor: 'yellow' };
};

const getStatusColor = (publicStatus) => {
  return STATUS_COLOR_MAP[publicStatus] || 'gray';
};

module.exports = { computePublicStatus, getStatusColor };
