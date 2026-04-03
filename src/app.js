const express = require('express');
const cors = require('cors');
const schemeRoutes = require('./routes/stationRoutes');
const reportRoutes = require('./routes/feedbackRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

const normalizeOrigin = (value) => {
  if (typeof value !== 'string') return value;
  return value.endsWith('/') ? value.slice(0, -1) : value;
};

const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((o) => normalizeOrigin(o.trim()))
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);

      if (allowedOrigins.length === 0) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Urban Mobility - Railway Disability Scheme Tracking Platform API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      railwaySchemes: '/api/railway-schemes',
      railwayReports: '/api/railway-reports',
      railwayIssues: '/api/railway-issues',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Urban Mobility API is running' });
});

app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Urban Mobility API base path',
    endpoints: {
      railwaySchemes: '/api/railway-schemes',
      railwayReports: '/api/railway-reports',
      railwayIssues: '/api/railway-issues',
    },
  });
});

app.use('/api/railway-schemes', schemeRoutes);
app.use('/api', reportRoutes);

app.use(errorHandler);

module.exports = app;
