const express = require('express');
const cors = require('cors');
const schemeRoutes = require('./routes/stationRoutes');
const reportRoutes = require('./routes/feedbackRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL || '*'
    : '*',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Inclusive Urban Mobility Intelligence Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      schemes: '/api/schemes',
      reports: '/api/reports',
      issues: '/api/issues',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Urban Mobility API is running' });
});

app.use('/api/schemes', schemeRoutes);
app.use('/api', reportRoutes);

app.use(errorHandler);

module.exports = app;
