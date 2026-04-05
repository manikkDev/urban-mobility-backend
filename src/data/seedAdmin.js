const { getFirestore } = require('firebase-admin/firestore');
const { initializeApp } = require('firebase-admin/app');

// Initialize Firebase Admin if not already initialized
try {
  initializeApp();
} catch (error) {
  // Already initialized
}

/**
 * Seed admin user in Firestore
 * Admin credentials should be created manually in Firebase Auth Console
 * This script only creates the Firestore profile with admin role
 */
async function seedAdminUser() {
  try {
    const db = getFirestore();
    
    // Admin user details - update these based on your Firebase Auth user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@railway.gov.in';
    const adminUid = process.env.ADMIN_UID; // Must be set from Firebase Auth Console
    
    if (!adminUid) {
      console.error('ERROR: ADMIN_UID environment variable not set');
      console.log('Steps to create admin user:');
      console.log('1. Go to Firebase Console > Authentication');
      console.log('2. Create a user with email:', adminEmail);
      console.log('3. Copy the User UID');
      console.log('4. Set ADMIN_UID environment variable to that UID');
      console.log('5. Run this script again');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await db.collection('users').doc(adminUid).get();
    
    if (existingAdmin.exists) {
      console.log('Admin user already exists:', existingAdmin.data());
      return;
    }

    // Create admin profile
    const adminProfile = {
      uid: adminUid,
      email: adminEmail,
      fullName: 'Railway Admin',
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true
    };

    await db.collection('users').doc(adminUid).set(adminProfile);
    
    console.log('✅ Admin user created successfully!');
    console.log('Admin Email:', adminEmail);
    console.log('Admin UID:', adminUid);
    console.log('Role: admin');
    
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedAdminUser()
    .then(() => {
      console.log('Admin seed completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Admin seed failed:', error);
      process.exit(1);
    });
}

module.exports = { seedAdminUser };
