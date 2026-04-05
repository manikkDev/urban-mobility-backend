const express = require('express');
const router = express.Router();
const { getSchemes, getSchemeById } = require('../controllers/railwaySchemeController');

router.get('/', getSchemes);
router.get('/:id', getSchemeById);

module.exports = router;
