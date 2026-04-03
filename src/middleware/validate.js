const { errorResponse } = require('../utils/response');
const { RAILWAY_ISSUE_TYPES, SCHEME_CONDITIONS, SEVERITY_LEVELS } = require('../config/constants');

const validateReport = (req, res, next) => {
  const { schemeId, description, severity, issueType, schemeCondition, locationLabel } = req.body;
  const errors = [];

  if (!schemeId || typeof schemeId !== 'string' || schemeId.trim() === '') {
    errors.push('Please select a valid scheme');
  }

  if (!description || typeof description !== 'string') {
    errors.push('Please provide a description of the issue');
  } else if (description.trim().length < 10) {
    errors.push('Description must be at least 10 characters long');
  } else if (description.trim().length > 1000) {
    errors.push('Description must not exceed 1000 characters');
  }

  if (severity === undefined || severity === null) {
    errors.push('Please select a severity level');
  } else if (!Number.isInteger(severity) || severity < 1 || severity > 5) {
    errors.push('Severity must be between 1 (very minor) and 5 (critical)');
  }

  if (issueType && !RAILWAY_ISSUE_TYPES.includes(issueType)) {
    errors.push('Please select a valid railway issue type');
  }

  if (schemeCondition && !SCHEME_CONDITIONS.includes(schemeCondition)) {
    errors.push('Please select a valid scheme condition');
  }

  if (locationLabel && typeof locationLabel === 'string' && locationLabel.trim().length > 200) {
    errors.push('Location label must not exceed 200 characters');
  }

  if (errors.length > 0) {
    return errorResponse(res, 'Please fix the following errors', errors, 400);
  }

  next();
};

module.exports = { validateReport };
