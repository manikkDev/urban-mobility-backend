const express = require('express');
const cors = require('cors');
const schemeRoutes = require('./routes/railwaySchemeRoutes');
const reportRoutes = require('./routes/railwayReportRoutes');
const authRoutes = require('./routes/authRoutes');
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
      // Allow all origins in development
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }

      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);

      // If no FRONTEND_URL is set, allow all (fallback for initial deployment)
      if (allowedOrigins.length === 0) {
        console.warn('FRONTEND_URL not set - allowing all origins. Set FRONTEND_URL in production!');
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error('CORS blocked origin:', normalizedOrigin, 'Allowed:', allowedOrigins);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
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
app.use('/api/auth', authRoutes);

app.use(errorHandler);

module.exports = app;
