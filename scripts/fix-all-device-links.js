/**
 * Fix All Device Links Migration
 * 
 * Creates deviceLinks for all users who have a deviceId in their user document
 * but no corresponding deviceLink document.
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixAllDeviceLinks() {
  console.log('Starting device links migration...\n');

  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    console.log(`Found ${usersSnapshot.size} users to check\n`);

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();

      // Skip users without deviceId
      if (!userData.deviceId) {
        continue;
      }

      const deviceId = userData.deviceId;
      const linkId = `${deviceId}_${userId}`;

      console.log(`\nChecking user: ${userData.name || userId}`);
      console.log(`  Device ID: ${deviceId}`);

      try {
        // Check if deviceLink already exists
        const linkDoc = await db.collection('deviceLinks').doc(linkId).get();

        if (linkDoc.exists) {
          console.log(`  ✓ DeviceLink already exists`);
          skipped++;
          continue;
        }

        // Create deviceLink
        await db.collection('deviceLinks').doc(linkId).set({
          id: linkId,
          deviceId: deviceId,
          userId: userId,
          role: userData.role || 'patient',
          status: 'active',
          linkedAt: userData.createdAt || admin.firestore.Timestamp.now(),
          linkedBy: userId
        });

        console.log(`  ✅ Created deviceLink: ${linkId}`);
        created++;

      } catch (error) {
        console.error(`  ❌ Error creating deviceLink for user ${userId}:`, error.message);
        errors++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('Migration Summary:');
    console.log(`  Created: ${created}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Errors: ${errors}`);
    console.log(`${'='.repeat(60)}\n`);

    if (errors === 0) {
      console.log('✅ Migration completed successfully!');
    } else {
      console.log('⚠️  Migration completed with errors. Please review the logs.');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run migration
fixAllDeviceLinks();
