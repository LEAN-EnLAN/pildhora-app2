const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://pildhora-app2-default-rtdb.firebaseio.com"
  });
}

const db = admin.firestore();
const rtdb = admin.database();

async function diagnoseCaregiver() {
  console.log('\n=== Diagnosing Caregiver Data Access ===\n');
  
  const caregiverId = 'ZsoeNjnLOGgj1rNomcbJF7QSWTZ2'; // Tomas
  const deviceId = 'device-001';
  
  try {
    // 1. Get patients linked to this device
    console.log('1. Getting patients with deviceId = device-001...');
    const patientsSnapshot = await db.collection('users')
      .where('role', '==', 'patient')
      .where('deviceId', '==', deviceId)
      .get();
    
    console.log(`Found ${patientsSnapshot.size} patient(s)\n`);
    
    for (const patientDoc of patientsSnapshot.docs) {
      const patientData = patientDoc.data();
      const patientId = patientDoc.id;
      
      console.log(`\n--- Patient: ${patientData.name} (${patientId}) ---`);
      
      // 2. Get medications for this patient
      console.log('\n  Medications:');
      const medsSnapshot = await db.collection('medications')
        .where('userId', '==', patientId)
        .get();
      
      if (medsSnapshot.empty) {
        console.log('    ❌ No medications found');
      } else {
        console.log(`    ✅ Found ${medsSnapshot.size} medication(s):`);
        medsSnapshot.forEach(medDoc => {
          const med = medDoc.data();
          console.log(`       - ${med.name} (${med.icon || 'no icon'})`);
        });
      }
      
      // 3. Get medication events for this patient (skip ordering to avoid index requirement)
      console.log('\n  Recent Medication Events:');
      try {
        const eventsSnapshot = await db.collection('medicationEvents')
          .where('userId', '==', patientId)
          .limit(5)
          .get();
        
        if (eventsSnapshot.empty) {
          console.log('    ❌ No events found');
        } else {
          console.log(`    ✅ Found ${eventsSnapshot.size} event(s):`);
          eventsSnapshot.forEach(eventDoc => {
            const event = eventDoc.data();
            const timestamp = event.timestamp?.toDate?.() || event.timestamp;
            console.log(`       - ${event.eventType}: ${event.medicationName || 'Unknown'} at ${timestamp}`);
          });
        }
      } catch (error) {
        console.log(`    ⚠️  Error fetching events: ${error.message}`);
      }
      
      // 4. Check device config in RTDB
      console.log('\n  Device Configuration:');
      const deviceConfigSnapshot = await rtdb.ref(`devices/${deviceId}/config`).once('value');
      
      if (deviceConfigSnapshot.exists()) {
        const config = deviceConfigSnapshot.val();
        console.log('    ✅ Device config found:');
        console.log(`       - Alarm Mode: ${config.alarm_mode || 'not set'}`);
        console.log(`       - LED Color: ${JSON.stringify(config.led_color_rgb || 'not set')}`);
        console.log(`       - LED Intensity: ${config.led_intensity || 'not set'}`);
      } else {
        console.log('    ❌ No device config found');
      }
      
      // 5. Check device state in RTDB
      console.log('\n  Device State:');
      const deviceStateSnapshot = await rtdb.ref(`devices/${deviceId}/state`).once('value');
      
      if (deviceStateSnapshot.exists()) {
        const state = deviceStateSnapshot.val();
        console.log('    ✅ Device state found:');
        console.log(`       - Status: ${state.current_status || 'unknown'}`);
        console.log(`       - Online: ${state.is_online ? 'Yes' : 'No'}`);
        console.log(`       - Battery: ${state.battery_level || 'unknown'}%`);
      } else {
        console.log('    ❌ No device state found');
      }
    }
    
    // 6. Check Firestore security rules simulation
    console.log('\n\n2. Checking data access permissions...');
    console.log('   Testing if caregiver can read patient medications...');
    
    // Try to read medications as caregiver would
    const testMedsSnapshot = await db.collection('medications')
      .where('userId', 'in', patientsSnapshot.docs.map(d => d.id))
      .limit(1)
      .get();
    
    if (testMedsSnapshot.empty) {
      console.log('   ⚠️  No medications accessible (might be security rules issue)');
    } else {
      console.log('   ✅ Medications are accessible');
    }
    
    console.log('\n=== Diagnosis Complete ===\n');
    
  } catch (error) {
    console.error('Error during diagnosis:', error);
  }
  
  process.exit(0);
}

diagnoseCaregiver();
