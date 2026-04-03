const { getFirestore } = require('../config/firebase');
const { successResponse, errorResponse } = require('../utils/response');
const { SCHEME_CATEGORIES, PUBLIC_STATUSES } = require('../utils/constants');

const getSchemes = async (req, res, next) => {
  try {
    const db = getFirestore();
    const { search, category, publicStatus, statusColor, areaName } = req.query;

    const snapshot = await db.collection('schemes').get();
    let schemes = [];

    snapshot.forEach((doc) => {
      schemes.push({ id: doc.id, ...doc.data() });
    });

    if (search && search.trim() !== '') {
      const s = search.toLowerCase().trim();
      schemes = schemes.filter((sc) =>
        (sc.title && sc.title.toLowerCase().includes(s)) ||
        (sc.category && sc.category.toLowerCase().includes(s)) ||
        (sc.areaName && sc.areaName.toLowerCase().includes(s)) ||
        (sc.summary && sc.summary.toLowerCase().includes(s))
      );
    }

    if (category && SCHEME_CATEGORIES.includes(category)) {
      schemes = schemes.filter((sc) => sc.category === category);
    }

    if (publicStatus && PUBLIC_STATUSES.includes(publicStatus)) {
      schemes = schemes.filter((sc) => sc.publicStatus === publicStatus);
    }

    if (statusColor) {
      schemes = schemes.filter((sc) => sc.statusColor === statusColor);
    }

    if (areaName && areaName.trim() !== '') {
      const area = areaName.toLowerCase().trim();
      schemes = schemes.filter((sc) =>
        sc.areaName && sc.areaName.toLowerCase().includes(area)
      );
    }

    return successResponse(res, 'Schemes retrieved successfully', schemes);
  } catch (error) {
    next(error);
  }
};

const getSchemeById = async (req, res, next) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    const schemeDoc = await db.collection('schemes').doc(id).get();

    if (!schemeDoc.exists) {
      return errorResponse(res, 'Scheme not found', [], 404);
    }

    const schemeData = { id: schemeDoc.id, ...schemeDoc.data() };

    const reportsSnapshot = await db
      .collection('reports')
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

    let analyticsDoc = await db.collection('scheme_analytics').doc(id).get();
    const analytics = analyticsDoc.exists ? analyticsDoc.data() : null;

    return successResponse(res, 'Scheme details retrieved successfully', {
      scheme: schemeData,
      recentReports,
      analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getSchemes, getSchemeById };
