const { getFirestore } = require('../config/firebase');
const { successResponse, errorResponse } = require('../utils/response');
const { RAILWAY_SCHEME_CATEGORIES, PUBLIC_STATUSES } = require('../config/constants');

const getSchemes = async (req, res, next) => {
  try {
    const db = getFirestore();
    const { search, category, publicStatus, statusColor, stationName, divisionName } = req.query;

    const snapshot = await db.collection('railway_schemes').get();
    let schemes = [];

    snapshot.forEach((doc) => {
      schemes.push({ id: doc.id, ...doc.data() });
    });

    if (search && search.trim() !== '') {
      const s = search.toLowerCase().trim();
      schemes = schemes.filter((sc) =>
        (sc.title && sc.title.toLowerCase().includes(s)) ||
        (sc.category && sc.category.toLowerCase().includes(s)) ||
        (sc.stationName && sc.stationName.toLowerCase().includes(s)) ||
        (sc.divisionName && sc.divisionName.toLowerCase().includes(s)) ||
        (sc.summary && sc.summary.toLowerCase().includes(s))
      );
    }

    if (category && RAILWAY_SCHEME_CATEGORIES.includes(category)) {
      schemes = schemes.filter((sc) => sc.category === category);
    }

    if (publicStatus && PUBLIC_STATUSES.includes(publicStatus)) {
      schemes = schemes.filter((sc) => sc.publicStatus === publicStatus);
    }

    if (statusColor) {
      schemes = schemes.filter((sc) => sc.statusColor === statusColor);
    }

    if (stationName && stationName.trim() !== '') {
      const station = stationName.toLowerCase().trim();
      schemes = schemes.filter((sc) =>
        sc.stationName && sc.stationName.toLowerCase().includes(station)
      );
    }

    if (divisionName && divisionName.trim() !== '') {
      const division = divisionName.toLowerCase().trim();
      schemes = schemes.filter((sc) =>
        sc.divisionName && sc.divisionName.toLowerCase().includes(division)
      );
    }

    return successResponse(res, 'Railway schemes retrieved successfully', schemes);
  } catch (error) {
    next(error);
  }
};

const getSchemeById = async (req, res, next) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    const schemeDoc = await db.collection('railway_schemes').doc(id).get();

    if (!schemeDoc.exists) {
      return errorResponse(res, 'Railway scheme not found', [], 404);
    }

    const schemeData = { id: schemeDoc.id, ...schemeDoc.data() };

    const reportsSnapshot = await db
      .collection('railway_reports')
      .where('schemeId', '==', id)
      .get();

    const allReports = [];
    reportsSnapshot.forEach((doc) => {
      allReports.push({ id: doc.id, ...doc.data() });
    });

    const recentReports = allReports
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      })
      .slice(0, 10);

    let analyticsDoc = await db.collection('railway_scheme_analytics').doc(id).get();
    const analytics = analyticsDoc.exists ? analyticsDoc.data() : null;

    return successResponse(res, 'Railway scheme details retrieved successfully', {
      scheme: schemeData,
      recentReports,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSchemes, getSchemeById };
