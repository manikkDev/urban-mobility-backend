const express = require('express');
const router = express.Router();
const { submitReport, getIssues } = require('../controllers/feedbackController');
const { validateReport } = require('../middleware/validate');

router.post('/railway-reports', validateReport, submitReport);
router.get('/railway-issues', getIssues);

module.exports = router;
