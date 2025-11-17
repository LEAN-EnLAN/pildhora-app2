# PILDHORA Caregiver Connection Guide

## Welcome

This guide will help you connect to a patient's PILDHORA device using a connection code. Once connected, you'll be able to monitor and manage their medications remotely.

## Table of Contents

1. [Overview](#overview)
2. [Before You Begin](#before-you-begin)
3. [Connection Process](#connection-process)
4. [After Connection](#after-connection)
5. [Managing Multiple Patients](#managing-multiple-patients)
6. [Troubleshooting](#troubleshooting)
7. [Best Practices](#best-practices)

---

## Overview

### What is Device Connection?

Device connection is the process of linking your caregiver account to a patient's PILDHORA device. This allows you to:
- View patient's medication list
- Monitor medication adherence
- Add, edit, and delete medications
- View medication events
- Configure device settings
- Receive critical alerts

### How Does It Work?

1. Patient generates a connection code
2. Patient shares code with you
3. You enter code in your app
4. Connection is established
5. You gain access to patient's device

### How Long Does It Take?

The connection process takes about 2-3 minutes:
- Enter connection code (30 seconds)
- Verify patient information (30 seconds)
- Establish connection (1 minute)
- Confirmation (30 seconds)

---

## Before You Begin

### Requirements

**You Need**:
- PILDHORA app installed
- Caregiver account created
- Logged into your account
- Internet connection
- Connection code from patient

**Patient Needs**:
- PILDHORA device set up
- Device linked to their account
- Connection code generated
- Code shared with you

### Getting a Connection Code

The patient must generate a connection code for you:

**Patient Steps**:
1. Open PILDHORA app
2. Go to Settings > Device Settings
3. Tap "Generate Connection Code"
4. Share code with caregiver

**Code Details**:
- Format: 6-8 alphanumeric characters
- Example: `ABC123` or `XYZ789AB`
- Valid for: 24 hours
- Single use: Can only be used once
- Case-insensitive

### Important Notes

**Multiple Caregivers**:
- Multiple caregivers can connect to same device
- Each caregiver needs their own code
- Patient generates separate code for each caregiver
- All caregivers have equal access

**Security**:
- Codes expire after 24 hours
- Codes are single-use only
- Patient can revoke your access anytime
- All connections are logged

---

## Connection Process

### Step 1: Access Connection Interface

When you first log in as a new caregiver, you'll be directed to the device connection interface.

**If You're Already Logged In**:
1. Go to Device Management
2. Tap "Link New Device"
3. Connection interface opens

**What You'll See**:
- Connection code input field
- Format requirements
- Help text
- Example codes

### Step 2: Enter Connection Code

Enter the code provided by the patient.

**What to Do**:
1. Type or paste the connection code
2. Code is validated in real-time
3. Watch for validation feedback
4. Tap "Validate Code" when ready

**Code Format**:
- 6-8 characters
- Letters and numbers only
- Case-insensitive
- No spaces or special characters

**Valid Examples**:
- `ABC123`
- `XYZ789`
- `CODE1234`
- `LINK5678`

**Invalid Examples**:
- ❌ `ABC` (too short)
- ❌ `ABC 123` (contains space)
- ❌ `ABC-123` (contains hyphen)
- ❌ `ABC#123` (special character)

**Validation Messages**:
- ✅ Green: Valid code format
- ❌ Red: Invalid format
- ⚠️ Yellow: Code expired
- ℹ️ Blue: Checking code

**Common Errors**:

**"Invalid code format"**:
- Check code length (6-8 characters)
- Remove spaces or special characters
- Use only letters and numbers

**"Code not found"**:
- Verify code is correct
- Check for typos
- Ask patient for new code

**"Code expired"**:
- Code is older than 24 hours
- Ask patient to generate new code
- Use new code immediately

**"Code already used"**:
- This code was already used
- Ask patient to generate new code
- Each code is single-use only

### Step 3: Review Patient Information

After validation, you'll see patient information.

**What You'll See**:
- Patient name (if available)
- Device ID
- Device status (online/offline)
- Connection confirmation dialog

**What to Do**:
1. Verify this is the correct patient
2. Review device information
3. Confirm you want to connect
4. Tap "Connect" to proceed
5. Or tap "Cancel" to abort

**Confirmation Dialog**:
```
Connect to Patient?

Patient: [Name]
Device: [Device ID]
Status: [Online/Offline]

By connecting, you will have access to:
- View medications
- Manage medications
- View events
- Configure device
- Receive alerts

[Cancel]  [Connect]
```

**Important**:
- Verify patient identity before connecting
- Ensure you have patient's permission
- Connection is logged for security
- Patient will be notified

### Step 4: Connection Establishment

The app will now establish the connection.

**What Happens**:
1. Connection code is marked as used
2. Device link is created in database
3. Your account is linked to device
4. Patient is notified of connection
5. Initial data sync begins

**What You'll See**:
- Progress indicator
- Status messages
- Connection steps completing
- Success confirmation

**This Takes**:
- Usually 30-60 seconds
- Requires internet connection
- Automatic process
- No action needed from you

**If Connection Fails**:
- Check internet connection
- Verify code is still valid
- Try again
- Contact support if persists

### Step 5: Success Confirmation

Connection is complete!

**What You'll See**:
- Success message
- Patient information
- Dashboard preview
- "Go to Dashboard" button

**Success Message**:
```
✅ Successfully Connected!

You are now connected to:
Patient: [Name]
Device: [Device ID]

You can now:
- View and manage medications
- Monitor medication events
- Configure device settings
- Receive critical alerts

[Go to Dashboard]
```

**What Happened**:
- ✅ Connection established
- ✅ Device link created
- ✅ Patient notified
- ✅ Data synced
- ✅ Ready to use

**Next Steps**:
1. Tap "Go to Dashboard"
2. View patient's medications
3. Check device status
4. Explore caregiver features

---

## After Connection

### Your Dashboard

After connecting, you'll see the caregiver dashboard with:

**Components**:
- Patient selector (if multiple patients)
- Device connectivity card
- Last medication status card
- Quick actions panel
- Navigation menu

### Accessing Patient Data

**View Medications**:
1. Tap "Medications" in Quick Actions
2. See patient's medication list
3. Tap medication for details

**View Events**:
1. Tap "Events Registry" in Quick Actions
2. See medication event history
3. Filter and search events

**Configure Device**:
1. Tap "Device" in Quick Actions
2. View device status
3. Tap "Configure" to change settings

### Your Permissions

As a connected caregiver, you can:

**✅ You Can**:
- View all medications
- Add new medications
- Edit existing medications
- Delete medications
- View all events
- Configure device settings
- Trigger device actions
- Receive critical alerts

**❌ You Cannot**:
- Delete patient account
- Unlink patient's device
- Change patient's password
- Access other patients' data
- Generate connection codes

### Patient Notifications

The patient is notified when:
- You connect to their device
- You add a medication
- You edit a medication
- You delete a medication
- You change device settings

---

## Managing Multiple Patients

### Connecting to Additional Patients

To manage multiple patients:

1. **Get New Connection Code**
   - Ask patient for their code
   - Each patient generates their own code

2. **Link New Device**
   - Go to Device Management
   - Tap "Link New Device"
   - Enter new connection code
   - Complete connection process

3. **Switch Between Patients**
   - Use Patient Selector on dashboard
   - Swipe to see all patients
   - Tap patient card to switch

### Patient Selector

The Patient Selector shows all your connected patients:

**Features**:
- Horizontal scrollable list
- Patient name and device status
- Online/offline indicator
- Tap to switch patients

**Status Indicators**:
- 🟢 Green dot: Device online
- ⚫ Gray dot: Device offline
- 🔋 Battery icon: Battery level
- ⚠️ Warning: Critical alert

### Organizing Patients

**Tips for Managing Multiple Patients**:
1. Use clear patient names
2. Check each patient daily
3. Set up notifications for each
4. Use tasks for patient-specific reminders
5. Generate reports regularly

---

## Troubleshooting

### Connection Issues

#### Cannot Enter Connection Code

**Problem**: Input field doesn't work or code won't validate

**Solutions**:
1. Check internet connection
2. Verify code format (6-8 characters)
3. Remove spaces or special characters
4. Try copying and pasting code
5. Restart app and try again

#### "Code Not Found" Error

**Problem**: Valid-looking code shows as not found

**Solutions**:
1. Verify code is correct (check for typos)
2. Ensure code is from correct patient
3. Ask patient to verify code
4. Request new code if needed
5. Check code wasn't already used

#### "Code Expired" Error

**Problem**: Code shows as expired

**Solutions**:
1. Codes expire after 24 hours
2. Ask patient to generate new code
3. Use new code immediately
4. Complete connection within 24 hours

#### "Code Already Used" Error

**Problem**: Code has been used before

**Solutions**:
1. Each code is single-use only
2. Check if you're already connected
3. Ask patient to generate new code
4. Use new code to connect

#### Connection Fails During Process

**Problem**: Connection process fails or times out

**Solutions**:
1. Check internet connection
2. Ensure stable connection
3. Try again with same code
4. If code expires, get new one
5. Contact support if persists

### Post-Connection Issues

#### Cannot See Patient Data

**Problem**: Connected but no data shows

**Solutions**:
1. Pull down to refresh
2. Check internet connection
3. Verify patient has medications
4. Wait a moment for sync
5. Restart app

#### Patient Not in Selector

**Problem**: Connected patient doesn't appear in list

**Solutions**:
1. Pull down to refresh
2. Check you're logged in correctly
3. Verify connection was successful
4. Restart app
5. Try connecting again

#### "Permission Denied" Errors

**Problem**: Cannot access patient data or features

**Solutions**:
1. Verify connection is active
2. Check patient hasn't revoked access
3. Log out and log back in
4. Reconnect to patient
5. Contact support

---

## Best Practices

### Security

**Protect Connection Codes**:
- Don't share codes publicly
- Use codes immediately
- Delete code messages after use
- Generate new codes if compromised

**Verify Patient Identity**:
- Confirm patient name before connecting
- Ensure you have permission
- Verify device ID if possible
- Ask patient to confirm connection

**Maintain Privacy**:
- Don't share patient data
- Keep login credentials secure
- Log out on shared devices
- Enable app security features

### Communication

**With Patients**:
- Explain what access you'll have
- Discuss medication management
- Set expectations for monitoring
- Respect patient privacy

**With Other Caregivers**:
- Coordinate medication changes
- Communicate through app notes
- Use tasks for handoffs
- Review events together

### Monitoring

**Daily Tasks**:
- Check device status
- Review recent events
- Monitor medication adherence
- Respond to alerts

**Weekly Tasks**:
- Review medication list
- Check inventory levels
- Generate adherence reports
- Update schedules if needed

**Monthly Tasks**:
- Review all medications
- Update device settings
- Check battery health
- Plan refills

---

## Frequently Asked Questions

### General Questions

**Q: How many patients can I connect to?**
A: There's no limit. You can connect to as many patients as needed.

**Q: Can multiple caregivers connect to the same patient?**
A: Yes! Multiple caregivers can connect to the same device.

**Q: How long does a connection last?**
A: Connections are permanent until patient revokes access or you unlink.

**Q: Can I connect without a code?**
A: No, you must have a valid connection code from the patient.

### Connection Code Questions

**Q: How long is a connection code valid?**
A: Connection codes expire after 24 hours.

**Q: Can I reuse a connection code?**
A: No, each code is single-use only.

**Q: What if I lose the connection code?**
A: Ask the patient to generate a new code.

**Q: Can I generate my own connection code?**
A: No, only patients can generate connection codes.

### Access Questions

**Q: What can I do after connecting?**
A: You can view and manage medications, view events, and configure device settings.

**Q: Can I delete the patient's account?**
A: No, only the patient can delete their own account.

**Q: Can the patient see what I do?**
A: Yes, all actions are logged and visible in the events registry.

**Q: Can the patient revoke my access?**
A: Yes, patients can unlink caregivers at any time.

---

## Getting Help

### Support Options

**Email**: support@pildhora.com
- Response: 24-48 hours
- Include connection code (if applicable)

**Phone**: 1-800-PILDHORA
- Mon-Fri, 9am-5pm EST
- Have patient information ready

**Live Chat**: In-app
- Mon-Fri, 9am-5pm EST
- Real-time assistance

### Before Contacting Support

Gather this information:
- Your account email
- Patient name (if known)
- Device ID (if known)
- Connection code (if applicable)
- Error messages
- Screenshots

### Additional Resources

**Documentation**:
- Caregiver User Guide
- Troubleshooting Guide
- FAQ
- Video Tutorials

**Community**:
- User Forum
- Facebook Group
- Twitter: @PILDHORA

---

## Conclusion

Congratulations on connecting to your patient's PILDHORA device! You're now ready to help manage their medications and monitor their adherence.

**What You've Accomplished**:
- ✅ Connected to patient's device
- ✅ Gained access to medication data
- ✅ Ready to manage medications
- ✅ Can monitor adherence
- ✅ Will receive critical alerts

**Next Steps**:
1. Explore the caregiver dashboard
2. Review patient's medications
3. Check device status
4. Set up notifications
5. Communicate with patient

**Remember**:
- Respect patient privacy
- Communicate changes
- Monitor regularly
- Respond to alerts
- Contact support with questions

**Welcome to PILDHORA Caregiving!**

---

*Last Updated: 2024*
*Version: 1.0*

For the latest guide, visit: https://pildhora.com/docs/caregiver-connection-guide

