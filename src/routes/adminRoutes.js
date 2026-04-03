const express = require('express');
const router = express.Router();
const {
  getSummary,
  getProblemStationsList,
  getTrendsData,
  getRecentFeedbackList,
} = require('../controllers/adminController');

router.get('/summary', getSummary);
router.get('/problem-stations', getProblemStationsList);
router.get('/trends', getTrendsData);
router.get('/recent-feedback', getRecentFeedbackList);

module.exports = router;
