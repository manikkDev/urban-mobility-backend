require('dotenv').config();
const { getFirestore } = require('firebase-admin/firestore');
const { initializeFirebase } = require('../config/firebase');
const seedData = require('./railwaySeedData.json');

async function seedRailwayData() {
  console.log('🚂 Starting Railway Accessibility Seed Data Import...\n');
  
  try {
    initializeFirebase();
    const db = getFirestore();
    
    console.log('📋 Clearing existing collections...');
    const schemesSnapshot = await db.collection('railway_schemes').get();
    const reportsSnapshot = await db.collection('railway_reports').get();
    
    const deletionPromises = [];
    schemesSnapshot.docs.forEach((doc) => deletionPromises.push(doc.ref.delete()));
    reportsSnapshot.docs.forEach((doc) => deletionPromises.push(doc.ref.delete()));
    
    await Promise.all(deletionPromises);
    console.log(`✅ Deleted ${schemesSnapshot.size} schemes and ${reportsSnapshot.size} reports\n`);
    
    console.log('🏗️  Importing Railway Schemes...');
    const schemePromises = seedData.railway_schemes.map((scheme) => {
      const { id, ...schemeData } = scheme;
      return db.collection('railway_schemes').doc(id).set(schemeData);
    });
    await Promise.all(schemePromises);
    console.log(`✅ Imported ${seedData.railway_schemes.length} railway schemes\n`);
    
    console.log('📝 Importing Railway Issue Reports...');
    const reportPromises = seedData.railway_reports.map((report) =>
      db.collection('railway_reports').add(report)
    );
    const reportRefs = await Promise.all(reportPromises);
    console.log(`✅ Imported ${seedData.railway_reports.length} railway reports\n`);
    
    console.log('📊 Computing scheme analytics...');
    const { computePublicStatus } = require('../services/statusService');
    
    for (const scheme of seedData.railway_schemes) {
      const schemeReports = await db
        .collection('railway_reports')
        .where('schemeId', '==', scheme.id)
        .get();
      
      const reportsData = schemeReports.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      const reportCount = reportsData.length;
      const openIssueCount = reportsData.filter((r) => r.reviewStatus === 'new').length;
      const criticalIssueCount = reportsData.filter((r) => r.severity >= 4).length;
      
      const { publicStatus, statusColor } = computePublicStatus(reportsData);
      
      const attentionScore = openIssueCount * 2 + criticalIssueCount * 3;
      
      const lastReportedAt = reportsData.length > 0
        ? reportsData.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
          })[0].createdAt
        : null;
      
      await db.collection('railway_schemes').doc(scheme.id).update({
        reportCount,
        openIssueCount,
        attentionScore,
        publicStatus,
        statusColor,
        lastReportedAt,
        updatedAt: new Date().toISOString(),
      });
      
      await db.collection('railway_scheme_analytics').doc(scheme.id).set({
        schemeId: scheme.id,
        totalReports: reportCount,
        openIssues: openIssueCount,
        criticalIssues: criticalIssueCount,
        publicStatus,
        statusColor,
        reportsByCategory: reportsData.reduce((acc, r) => {
          acc[r.issueCategory] = (acc[r.issueCategory] || 0) + 1;
          return acc;
        }, {}),
        reportsByType: reportsData.reduce((acc, r) => {
          acc[r.issueType] = (acc[r.issueType] || 0) + 1;
          return acc;
        }, {}),
        reportsByCondition: reportsData.reduce((acc, r) => {
          acc[r.schemeCondition] = (acc[r.schemeCondition] || 0) + 1;
          return acc;
        }, {}),
        lastReportedAt,
        lastUpdated: new Date().toISOString(),
      });
    }
    
    console.log(`✅ Computed analytics for ${seedData.railway_schemes.length} schemes\n`);
    
    console.log('🎉 Railway Accessibility Seed Data Import Complete!\n');
    console.log('Summary:');
    console.log(`  ✅ ${seedData.railway_schemes.length} railway schemes imported`);
    console.log(`  ✅ ${seedData.railway_reports.length} railway reports imported`);
    console.log(`  ✅ ${seedData.railway_schemes.length} analytics documents created`);
    console.log('\n🚂 Railway Disability Scheme Platform is ready!\n');
    
  } catch (error) {
    console.error('❌ Error seeding railway data:', error);
    throw error;
  }
}

seedRailwayData()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
