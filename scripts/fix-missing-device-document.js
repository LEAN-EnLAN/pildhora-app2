/**
 * Fix Missing Device Document
 * 
 * This script creates missing device documents in Firestore for devices
 * that exist in RTDB but don't have corresponding Firestore documents.
 * 
 * This is needed when:
 * - Device was linked via RTDB but Firestore document wasn't created
 * - Device document was accidentally deleted
 * - Migration from old schema to new schema
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pildhora-app2-default-rtdb.firebaseio.com'
});

const db = admin.firestore();
const rtdb = admin.database();

async function fixMissingDeviceDocuments() {
  console.log('🔍 Scanning for missing device documents...\n');
  
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    let totalDevicesChecked = 0;
    let devicesCreated = 0;
    let deviceLinksCreated = 0;
    
    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const userData = userDoc.data();
      const userRole = userData.role;
      
      console.log(`\n👤 Checking user: ${userData.name || userId} (${userRole})`);
      
      // Get devices from RTDB
      const devicesSnapshot = await rtdb.ref(`users/${userId}/devices`).once('value');
      const devices = devicesSnapshot.val();
      
      if (!devices) {
        console.log('   No devices in RTDB');
        continue;
      }
      
      const deviceIds = Object.keys(devices);
      console.log(`   Found ${deviceIds.length} device(s) in RTDB: ${deviceIds.join(', ')}`);
      
      for (const deviceId of deviceIds) {
        totalDevicesChecked++;
        
        // Check if device document exists in Firestore
        const deviceDocRef = db.collection('devices').doc(deviceId);
        const deviceDoc = await deviceDocRef.get();
        
        if (!deviceDoc.exists) {
          console.log(`   ⚠️  Device document missing for: ${deviceId}`);
          
          // Create device document
          const deviceData = {
            id: deviceId,
            primaryPatientId: userId,
            provisioningStatus: 'active',
            provisionedAt: admin.firestore.FieldValue.serverTimestamp(),
            provisionedBy: userId,
            wifiConfigured: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            linkedUsers: {
              [userId]: true
            }
          };
          
          await deviceDocRef.set(deviceData);
          devicesCreated++;
          console.log(`   ✅ Created device document: ${deviceId}`);
        } else {
          console.log(`   ✓ Device document exists: ${deviceId}`);
        }
        
        // Check if deviceLink exists
        const deviceLinkId = `${deviceId}_${userId}`;
        const deviceLinkRef = db.collection('deviceLinks').doc(deviceLinkId);
        const deviceLinkDoc = await deviceLinkRef.get();
        
        if (!deviceLinkDoc.exists) {
          console.log(`   ⚠️  DeviceLink missing for: ${deviceLinkId}`);
          
          // Create deviceLink
          const deviceLinkData = {
            id: deviceLinkId,
            deviceId: deviceId,
            userId: userId,
            role: userRole,
            status: 'active',
            linkedAt: admin.firestore.FieldValue.serverTimestamp(),
            linkedBy: userId
          };
          
          await deviceLinkRef.set(deviceLinkData);
          deviceLinksCreated++;
          console.log(`   ✅ Created deviceLink: ${deviceLinkId}`);
        } else {
          console.log(`   ✓ DeviceLink exists: ${deviceLinkId}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 Summary:');
    console.log('='.repeat(60));
    console.log(`Total devices checked: ${totalDevicesChecked}`);
    console.log(`Device documents created: ${devicesCreated}`);
    console.log(`DeviceLinks created: ${deviceLinksCreated}`);
    console.log('='.repeat(60));
    
    if (devicesCreated > 0 || deviceLinksCreated > 0) {
      console.log('\n✅ Missing documents have been created!');
      console.log('   The app should now work correctly.');
    } else {
      console.log('\n✅ All device documents and links are in sync!');
    }
    
  } catch (error) {
    console.error('\n❌ Error:', error);
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the fix
fixMissingDeviceDocuments();
