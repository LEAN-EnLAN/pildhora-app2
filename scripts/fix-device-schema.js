/**
 * Fix Device Schema Migration
 * 
 * Migrates old device documents to new schema:
 * - Adds primaryPatientId field
 * - Creates deviceLinks documents from linkedUsers array
 * - Maintains backward compatibility
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixDeviceSchema() {
  console.log('Starting device schema migration...\n');

  try {
    // Get all devices
    const devicesSnapshot = await db.collection('devices').get();
    console.log(`Found ${devicesSnapshot.size} devices to check\n`);

    let fixed = 0;
    let skipped = 0;
    let errors = 0;

    for (const deviceDoc of devicesSnapshot.docs) {
      const deviceId = deviceDoc.id;
      const deviceData = deviceDoc.data();

      console.log(`\nChecking device: ${deviceId}`);

      // Check if device needs migration
      const needsMigration = !deviceData.primaryPatientId && deviceData.linkedUsers && deviceData.linkedUsers.length > 0;

      if (!needsMigration) {
        console.log(`  ✓ Device already has correct schema or no linked users`);
        skipped++;
        continue;
      }

      try {
        // Get the first linked user as primary patient
        const primaryPatientId = deviceData.linkedUsers[0];
        console.log(`  → Setting primaryPatientId: ${primaryPatientId}`);

        // Update device document
        await deviceDoc.ref.update({
          primaryPatientId: primaryPatientId,
          provisioningStatus: 'active',
          provisionedAt: deviceData.createdAt || admin.firestore.Timestamp.now(),
          provisionedBy: primaryPatientId,
          wifiConfigured: true,
          updatedAt: admin.firestore.Timestamp.now()
        });

        console.log(`  ✓ Updated device document`);

        // Create deviceLinks for all linked users
        for (const userId of deviceData.linkedUsers) {
          const linkId = `${deviceId}_${userId}`;
          
          // Check if link already exists
          const linkDoc = await db.collection('deviceLinks').doc(linkId).get();
          
          if (linkDoc.exists) {
            console.log(`  ✓ DeviceLink already exists: ${linkId}`);
            continue;
          }

          // Get user role
          const userDoc = await db.collection('users').doc(userId).get();
          const userRole = userDoc.exists ? userDoc.data().role : 'patient';

          // Create deviceLink
          await db.collection('deviceLinks').doc(linkId).set({
            id: linkId,
            deviceId: deviceId,
            userId: userId,
            role: userRole,
            status: 'active',
            linkedAt: deviceData.createdAt || admin.firestore.Timestamp.now(),
            linkedBy: userId
          });

          console.log(`  ✓ Created deviceLink: ${linkId} (role: ${userRole})`);
        }

        fixed++;
        console.log(`  ✅ Device ${deviceId} migrated successfully`);

      } catch (error) {
        console.error(`  ❌ Error migrating device ${deviceId}:`, error.message);
        errors++;
      }
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log('Migration Summary:');
    console.log(`  Fixed: ${fixed}`);
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
fixDeviceSchema();
