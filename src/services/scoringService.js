const { getFirestore } = require('../config/firebase');

const calculateBaseScore = (facilities) => {
  let baseScore = 0;

  if (facilities.ramps) baseScore += 15;
  if (facilities.elevators) baseScore += 20;
  if (facilities.seating) baseScore += 10;
  if (facilities.tactilePaths) baseScore += 10;
  if (facilities.accessibleToilet) baseScore += 10;
  if (facilities.staffAssistanceAvailable) baseScore += 10;
  if (facilities.clearSignage) baseScore += 10;
  if (facilities.safeBoardingSupport) baseScore += 15;

  return Math.min(baseScore, 100);
};

const categoryPenaltyMultiplier = {
  infrastructure: 2.5,
  safety: 3.0,
  crowding: 2.0,
  reliability: 1.5,
  information_gap: 1.0,
};

const calculateIssuePenalty = async (stationId) => {
  const db = getFirestore();
  const feedbackSnapshot = await db
    .collection('feedback')
    .where('stationId', '==', stationId)
    .where('status', '==', 'open')
    .get();

  let totalPenalty = 0;

  feedbackSnapshot.forEach((doc) => {
    const feedback = doc.data();
    const multiplier = categoryPenaltyMultiplier[feedback.issueCategory] || 1.0;
    const penalty = feedback.severity * multiplier;
    totalPenalty += penalty;
  });

  return totalPenalty;
};

const calculateAccessibilityScore = async (stationId, facilities) => {
  const baseScore = calculateBaseScore(facilities);
  const issuePenalty = await calculateIssuePenalty(stationId);
  
  let currentScore = baseScore - issuePenalty;
  currentScore = Math.max(0, Math.min(100, currentScore));

  return Math.round(currentScore);
};

const getRiskLevel = (score) => {
  if (score >= 80) return 'low';
  if (score >= 50) return 'medium';
  return 'high';
};

const updateStationScore = async (stationId) => {
  const db = getFirestore();
  const stationRef = db.collection('stations').doc(stationId);
  const stationDoc = await stationRef.get();

  if (!stationDoc.exists) {
    throw new Error('Station not found');
  }

  const stationData = stationDoc.data();
  const facilities = stationData.facilities || {};

  const currentScore = await calculateAccessibilityScore(stationId, facilities);
  const riskLevel = getRiskLevel(currentScore);

  await stationRef.update({
    currentAccessibilityScore: currentScore,
    riskLevel: riskLevel,
    lastScoreUpdatedAt: new Date().toISOString(),
  });

  return { currentScore, riskLevel };
};

module.exports = {
  calculateBaseScore,
  calculateAccessibilityScore,
  getRiskLevel,
  updateStationScore,
};
