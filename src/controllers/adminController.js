const { successResponse, errorResponse } = require('../utils/response');
const {
  getAdminSummary,
  getProblemStations,
  getTrends,
  getRecentFeedback,
} = require('../services/analyticsService');

const getSummary = async (req, res, next) => {
  try {
    const summary = await getAdminSummary();
    return successResponse(res, 'Summary loaded successfully', summary);
  } catch (error) {
    next(error);
  }
};

const getProblemStationsList = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const problemStations = await getProblemStations(limit);
    return successResponse(res, 'Problem stations loaded successfully', problemStations);
  } catch (error) {
    next(error);
  }
};

const getTrendsData = async (req, res, next) => {
  try {
    const trends = await getTrends();
    return successResponse(res, 'Trends loaded successfully', trends);
  } catch (error) {
    next(error);
  }
};

const getRecentFeedbackList = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const recentFeedback = await getRecentFeedback(limit);
    return successResponse(res, 'Recent feedback loaded successfully', recentFeedback);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSummary,
  getProblemStationsList,
  getTrendsData,
  getRecentFeedbackList,
};
