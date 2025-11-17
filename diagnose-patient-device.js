/**
 * Diagnostic Script: Patient Device & Connection Codes
 * 
 * This script checks why device-001 and connection codes aren't showing
 * in the patient's device settings panel.
 */

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://pildhora-app2-default-rtdb.firebaseio.com/'
  });
}

const db = admin.firestore();
const rtdb = admin.database();

async function diagnosePatientDevice() {
  console.log('\n🔍 DIAGNOSING PATIENT DEVICE ISSUE\n');
  console.log('=' .repeat(60));

  try {
    // Step 1: Find patient users
    console.log('\n📋 Step 1: Finding patient users...');
    const usersSnapshot = await db.collection('users')
      .where('role', '==', 'patient')
      .get();

    if (usersSnapshot.empty) {
      console.log('❌ No patient users found!');
      return;
    }

    console.log(`✅ Found ${usersSnapshot.size} patient(s)`);

    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      const patientId = userDoc.id;
      
      console.log('\n' + '-'.repeat(60));
      console.log(`\n👤 Patient: ${userData.name || 'Unknown'}`);
      console.log(`   ID: ${patientId}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Device ID in user doc: ${userData.deviceId || 'NOT SET ❌'}`);

      // Step 2: Check RTDB for device links
      console.log('\n📡 Step 2: Checking RTDB device links...');
      const rtdbDevicesRef = rtdb.ref(`users/${patientId}/devices`);
      const rtdbDevicesSnapshot = await rtdbDevicesRef.once('value');
      const rtdbDevices = rtdbDevicesSnapshot.val();

      if (rtdbDevices) {
        console.log('✅ RTDB devices found:');
        Object.keys(rtdbDevices).forEach(deviceId => {
          console.log(`   - ${deviceId}`);
        });
      } else {
        console.log('❌ No devices in RTDB for this patient');
      }

      // Step 3: Check Firestore deviceLinks
      console.log('\n🔗 Step 3: Checking Firestore deviceLinks...');
      const deviceLinksSnapshot = await db.collection('deviceLinks')
        .where('userId', '==', patientId)
        .where('role', '==', 'patient')
        .get();

      if (!deviceLinksSnapshot.empty) {
        console.log(`✅ Found ${deviceLinksSnapshot.size} deviceLink(s):`);
        deviceLinksSnapshot.forEach(doc => {
          const link = doc.data();
          console.log(`   - Device: ${link.deviceId}`);
          console.log(`     Status: ${link.status}`);
          console.log(`     Linked: ${link.linkedAt?.toDate?.() || link.linkedAt}`);
        });
      } else {
        console.log('❌ No deviceLinks found for this patient');
      }

      // Step 4: Check for device-001 specifically
      console.log('\n🔍 Step 4: Checking for device-001...');
      const device001Doc = await db.collection('devices').doc('DEVICE-001').get();
      
      if (device001Doc.exists) {
        const device001Data = device001Doc.data();
        console.log('✅ device-001 exists in Firestore:');
        console.log(`   Linked Users: ${JSON.stringify(device001Data.linkedUsers || {})}`);
        console.log(`   Metadata: ${JSON.stringify(device001Data.metadata || {})}`);
        
        // Check if patient is in linkedUsers (object format)
        if (device001Data.linkedUsers && device001Data.linkedUsers[patientId]) {
          console.log('   ✅ Patient IS in linkedUsers');
        } else {
          console.log('   ❌ Patient NOT in linkedUsers');
        }
      } else {
        console.log('❌ device-001 does NOT exist in Firestore');
      }

      // Check RTDB for device-001
      const rtdbDevice001Ref = rtdb.ref(`devices/DEVICE-001`);
      const rtdbDevice001Snapshot = await rtdbDevice001Ref.once('value');
      const rtdbDevice001 = rtdbDevice001Snapshot.val();

      if (rtdbDevice001) {
        console.log('✅ DEVICE-001 exists in RTDB:');
        console.log(`   State: ${JSON.stringify(rtdbDevice001.state || {})}`);
      } else {
        console.log('❌ DEVICE-001 does NOT exist in RTDB');
      }

      // Step 5: Check connection codes
      console.log('\n🔑 Step 5: Checking connection codes...');
      const codesSnapshot = await db.collection('connectionCodes')
        .where('patientId', '==', patientId)
        .get();

      if (!codesSnapshot.empty) {
        console.log(`✅ Found ${codesSnapshot.size} connection code(s):`);
        codesSnapshot.forEach(doc => {
          const code = doc.data();
          const now = new Date();
          const expiresAt = code.expiresAt?.toDate?.() || new Date(code.expiresAt);
          const isExpired = expiresAt < now;
          const isUsed = code.usedBy != null;
          const isRevoked = code.status === 'revoked';
          
          console.log(`\n   Code: ${code.code}`);
          console.log(`   Status: ${code.status}`);
          console.log(`   Expires: ${expiresAt.toLocaleString()}`);
          console.log(`   Expired: ${isExpired ? '❌ YES' : '✅ NO'}`);
          console.log(`   Used: ${isUsed ? '✅ YES' : '❌ NO'}`);
          console.log(`   Revoked: ${isRevoked ? '✅ YES' : '❌ NO'}`);
          
          if (isUsed) {
            console.log(`   Used by: ${code.usedBy}`);
            console.log(`   Used at: ${code.usedAt?.toDate?.() || code.usedAt}`);
          }
        });
      } else {
        console.log('❌ No connection codes found for this patient');
      }

      // Step 6: Recommendations
      console.log('\n💡 Step 6: Recommendations...');
      
      if (!userData.deviceId) {
        console.log('\n⚠️  ISSUE: deviceId not set in user document');
        console.log('   FIX: Run the following command:');
        console.log(`   await db.collection('users').doc('${patientId}').update({ deviceId: 'DEVICE-001' });`);
      }

      if (!rtdbDevices || !rtdbDevices['DEVICE-001']) {
        console.log('\n⚠️  ISSUE: DEVICE-001 not in RTDB users/{patientId}/devices');
        console.log('   FIX: Run the following command:');
        console.log(`   await rtdb.ref('users/${patientId}/devices/DEVICE-001').set(true);`);
      }

      const hasActiveDeviceLink = !deviceLinksSnapshot.empty && 
        deviceLinksSnapshot.docs.some(doc => {
          const link = doc.data();
          return link.deviceId === 'DEVICE-001' && link.status === 'active';
        });

      if (!hasActiveDeviceLink) {
        console.log('\n⚠️  ISSUE: No active deviceLink for DEVICE-001');
        console.log('   FIX: Create a deviceLink document');
      }

      if (!device001Doc.exists) {
        console.log('\n⚠️  ISSUE: DEVICE-001 document missing in Firestore');
        console.log('   FIX: Create the device document');
      } else {
        const device001Data = device001Doc.data();
        if (!device001Data.linkedUsers || !device001Data.linkedUsers[patientId]) {
          console.log('\n⚠️  ISSUE: Patient not in DEVICE-001 linkedUsers');
          console.log('   FIX: Add patient to linkedUsers');
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Diagnosis complete!\n');

  } catch (error) {
    console.error('\n❌ Error during diagnosis:', error);
    console.error(error.stack);
  }
}

// Run diagnosis
diagnosePatientDevice()
  .then(() => {
    console.log('\n👋 Diagnosis finished. Exiting...\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
