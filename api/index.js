require('dotenv').config();
const { initializeFirebase } = require('../src/config/firebase');
const app = require('../src/app');

// Initialize Firebase for serverless function
initializeFirebase();

module.exports = app;
