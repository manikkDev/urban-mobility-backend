const { getFirestore } = require('../config/firebase');
const { successResponse, errorResponse } = require('../utils/response');

const getRoutes = async (req, res, next) => {
  try {
    const db = getFirestore();
    const snapshot = await db.collection('routes').get();

    const routes = [];
    snapshot.forEach((doc) => {
      routes.push({ id: doc.id, ...doc.data() });
    });

    return successResponse(res, 'Routes retrieved successfully', routes);
  } catch (error) {
    next(error);
  }
};

const getRouteById = async (req, res, next) => {
  try {
    const db = getFirestore();
    const { id } = req.params;

    const routeDoc = await db.collection('routes').doc(id).get();

    if (!routeDoc.exists) {
      return errorResponse(res, 'Route not found', [], 404);
    }

    const routeData = { id: routeDoc.id, ...routeDoc.data() };

    const stationIds = routeData.stationIds || [];
    const stationPromises = stationIds.map((stationId) =>
      db.collection('stations').doc(stationId).get()
    );

    const stationDocs = await Promise.all(stationPromises);
    const stations = stationDocs
      .filter((doc) => doc.exists)
      .map((doc) => ({
        id: doc.id,
        name: doc.data().name,
        city: doc.data().city,
        currentAccessibilityScore: doc.data().currentAccessibilityScore,
        riskLevel: doc.data().riskLevel,
      }));

    const response = {
      route: routeData,
      stations,
    };

    return successResponse(res, 'Route details retrieved successfully', response);
  } catch (error) {
    next(error);
  }
};

module.exports = { getRoutes, getRouteById };
