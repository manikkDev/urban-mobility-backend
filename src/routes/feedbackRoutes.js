const express = require('express');
const router = express.Router();
const { submitReport, getIssues } = require('../controllers/feedbackController');
const { validateReport } = require('../middleware/validate');

router.post('/reports', validateReport, submitReport);
router.get('/issues', getIssues);

module.exports = router;
