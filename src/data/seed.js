require('dotenv').config();
const { initializeFirebase, getFirestore } = require('../config/firebase');
const seedData = require('./seedData.json');

const seedDatabase = async () => {
  try {
    initializeFirebase();
    const db = getFirestore();

    console.log('Clearing existing collections...');
    const collections = ['schemes', 'reports', 'scheme_analytics'];
    for (const col of collections) {
      const snapshot = await db.collection(col).get();
      const batch = db.batch();
      snapshot.docs.forEach((doc) => batch.delete(doc.ref));
      if (snapshot.size > 0) await batch.commit();
      console.log(`  Cleared ${snapshot.size} docs from ${col}`);
    }

    console.log('\nSeeding schemes...');
    for (const scheme of seedData.schemes) {
      const { id, ...data } = scheme;
      data.createdAt = new Date().toISOString();
      data.updatedAt = new Date().toISOString();
      data.lastReportedAt = '';
      await db.collection('schemes').doc(id).set(data);
      console.log(`  Added scheme: ${data.title}`);
    }

    console.log('\nSeeding reports...');
    for (const report of seedData.reports) {
      const data = { ...report };
      data.createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
      data.updatedAt = data.createdAt;
      await db.collection('reports').add(data);
    }
    console.log(`  Added ${seedData.reports.length} reports`);

    console.log('\nUpdating scheme analytics...');
    const { updateSchemeAnalytics } = require('../services/analyticsService');
    for (const scheme of seedData.schemes) {
      await updateSchemeAnalytics(scheme.id);
      console.log(`  Updated analytics for: ${scheme.title}`);
    }

    console.log('\nSeed complete!');
    console.log(`  Schemes: ${seedData.schemes.length}`);
    console.log(`  Reports: ${seedData.reports.length}`);
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
};

seedDatabase();
