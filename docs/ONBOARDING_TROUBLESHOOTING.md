# PILDHORA Onboarding Troubleshooting Guide

## Overview

This guide provides detailed troubleshooting steps for issues encountered during the PILDHORA onboarding process, including device provisioning for patients and device connection for caregivers.

## Table of Contents

1. [Patient Device Provisioning Issues](#patient-device-provisioning-issues)
2. [Caregiver Connection Issues](#caregiver-connection-issues)
3. [WiFi Configuration Problems](#wifi-configuration-problems)
4. [Device Verification Issues](#device-verification-issues)
5. [Post-Setup Problems](#post-setup-problems)
6. [Error Messages Reference](#error-messages-reference)
7. [Getting Additional Help](#getting-additional-help)

---

## Patient Device Provisioning Issues

### Cannot Start Provisioning Wizard

**Symptoms**:
- Wizard doesn't open after signup
- App crashes when trying to start wizard
- Stuck on loading screen
- "Setup not available" message

**Diagnostic Steps**:

1. **Verify Account Type**
   ```
   ✓ Logged in as patient (not caregiver)
   ✓ Account creation completed
   ✓ Email verified
   ✓ Not already provisioned
   ```

2. **Check App State**
   ```
   ✓ App is up to date
   ✓ Internet connection active
   ✓ Sufficient storage space
   ✓ No pending app updates
   ```

**Solutions**:

1. **Force Restart Wizard**
   ```
   1. Log out of app
   2. Close app completely
   3. Reopen app
   4. Log back in
   5. Wizard should start automatically
   ```

2. **Clear App Cache**
   ```
   iOS:
   Settings > General > iPhone Storage > PILDHORA > Offload App
   Then reinstall from App Store
   
   Android:
   Settings > Apps > PILDHORA > Storage > Clear Cache
   ```

3. **Manual Navigation**
   ```
   If wizard doesn't auto-start:
   1. Go to Settings
   2. Tap "Device Settings"
   3. Tap "Set Up Device"
   4. Wizard should open
   ```

4. **Reinstall App**
   ```
   1. Delete PILDHORA app
   2. Restart device
   3. Reinstall from store
   4. Log in
   5. Wizard should start
   ```

**Still Not Working?**
- Contact support: support@pildhora.com
- Provide: Account email, device type, OS version
- Include: Screenshots of any error messages

---

### Device ID Validation Errors

**Symptoms**:
- "Invalid device ID" error
- "Device ID too short" message
- "Invalid characters" warning
- Red X on validation

**Common Causes**:
- Device ID is too short (< 5 characters)
- Contains invalid characters
- Contains spaces
- Incorrect format

**Solutions**:

1. **Verify Device ID Format**
   ```
   Requirements:
   ✓ Minimum 5 characters
   ✓ Maximum 100 characters
   ✓ Only: letters, numbers, hyphens, underscores
   ✓ No spaces
   ✓ Case-sensitive
   ```

2. **Check for Common Mistakes**
   ```
   ❌ Wrong: "DEV 001" (space)
   ❌ Wrong: "DEV-1" (too short)
   ❌ Wrong: "DEVICE#001" (invalid char)
   ❌ Wrong: "device-001" (wrong case)
   ✅ Correct: "DEVICE-001"
   ✅ Correct: "DEV_12345"
   ✅ Correct: "PILDHORA-ABC123"
   ```

3. **Locate Device ID**
   ```
   Device ID is usually found:
   - On bottom of device
   - On back panel
   - On device label/sticker
   - In device manual
   - On packaging
   ```

4. **Copy from Photo**
   ```
   1. Take clear photo of device ID
   2. Zoom in to read clearly
   3. Type carefully
   4. Double-check each character
   5. Try copy-paste if digital
   ```

5. **Contact Support for Verification**
   ```
   If unsure about device ID:
   Email: support@pildhora.com
   Include: Photo of device label
   Subject: Device ID Verification
   ```

---

### "Device Already Claimed" Error

**Symptoms**:
- "Device already claimed" error message
- "Device is registered to another account"
- Cannot proceed with provisioning
- Validation fails at device check

**Possible Causes**:
- Device was previously registered
- You already set up this device
- Device is registered to different account
- Used/refurbished device not properly reset

**Solutions**:

1. **Check Your Own Devices**
   ```
   1. Go to Settings > Device Settings
   2. Check if device is already listed
   3. If yes, you're already set up
   4. No need to provision again
   ```

2. **Verify Device ID**
   ```
   1. Double-check device ID is correct
   2. Ensure no typos
   3. Verify you have the right device
   4. Check device label again
   ```

3. **Previous Owner Must Unlink**
   ```
   If you purchased used device:
   1. Contact previous owner
   2. Ask them to unlink device
   3. They go to Device Settings
   4. Tap "Unlink Device"
   5. Confirm unlinking
   6. Wait 5 minutes
   7. Try provisioning again
   ```

4. **Factory Reset Device**
   ```
   If you own the device:
   1. Locate reset button on device
   2. Press and hold for 10 seconds
   3. Device will reset
   4. Wait for device to reboot
   5. Try provisioning again
   ```

5. **Contact Support**
   ```
   If device should be available:
   Email: support@pildhora.com
   Include:
   - Device ID
   - Purchase receipt
   - Previous owner info (if applicable)
   - Your account email
   ```

---

### Device Verification Fails

**Symptoms**:
- Stuck on "Verifying device..." screen
- "Verification failed" error
- "Device not found" message
- Timeout during verification

**Diagnostic Steps**:

1. **Check Internet Connection**
   ```
   ✓ WiFi or cellular data enabled
   ✓ Strong signal strength
   ✓ Can access other websites
   ✓ Not on airplane mode
   ```

2. **Check Device Status**
   ```
   ✓ Device is powered on
   ✓ Power indicator light is on
   ✓ Device is not in error state
   ✓ Device is within WiFi range
   ```

**Solutions**:

1. **Wait and Retry**
   ```
   1. Verification can take up to 2 minutes
   2. Don't close app during verification
   3. Keep phone screen on
   4. Wait for completion
   ```

2. **Check Firebase Status**
   ```
   1. Visit status.firebase.google.com
   2. Check if all services are operational
   3. If outage, wait and try later
   4. Retry when services restored
   ```

3. **Restart Verification**
   ```
   1. Tap "Cancel" if stuck
   2. Go back to device ID entry
   3. Re-enter device ID
   4. Try verification again
   ```

4. **Switch Networks**
   ```
   1. Try switching WiFi to cellular
   2. Or cellular to WiFi
   3. Ensure stable connection
   4. Retry verification
   ```

5. **Restart App**
   ```
   1. Close app completely
   2. Wait 30 seconds
   3. Reopen app
   4. Resume wizard
   5. Try verification again
   ```

---

## Caregiver Connection Issues

### Connection Code Validation Errors

**Symptoms**:
- "Invalid code format" error
- "Code not found" message
- "Code expired" warning
- "Code already used" error

**Solutions by Error Type**:

#### "Invalid Code Format"

**Cause**: Code doesn't meet format requirements

**Solutions**:
```
1. Verify code is 6-8 characters
2. Use only letters and numbers
3. Remove spaces
4. Remove special characters
5. Try copy-paste to avoid typos
```

**Valid Examples**:
- ✅ `ABC123`
- ✅ `XYZ789AB`
- ✅ `CODE1234`

**Invalid Examples**:
- ❌ `ABC` (too short)
- ❌ `ABC 123` (space)
- ❌ `ABC-123` (hyphen)

#### "Code Not Found"

**Cause**: Code doesn't exist in system

**Solutions**:
```
1. Verify code with patient
2. Check for typos
3. Ensure code was generated
4. Ask patient to verify code
5. Request new code if needed
```

**Checklist**:
- ✓ Code copied correctly
- ✓ No extra spaces
- ✓ Correct case (case-insensitive but check)
- ✓ Patient generated code successfully

#### "Code Expired"

**Cause**: Code is older than 24 hours

**Solutions**:
```
1. Codes expire after 24 hours
2. Ask patient to generate new code
3. Use new code immediately
4. Complete connection within 24 hours
```

**Prevention**:
- Use codes within 24 hours
- Complete connection promptly
- Generate new code if delayed

#### "Code Already Used"

**Cause**: Code was previously used

**Solutions**:
```
1. Each code is single-use only
2. Check if you're already connected
3. Go to Device Management
4. See if patient is in your list
5. If not, ask for new code
```

**Note**: If you're already connected, no need for new code.

---

### Cannot See Patient After Connection

**Symptoms**:
- Connection succeeds but patient not in list
- Empty dashboard after connection
- "No patients" message
- Patient selector is empty

**Solutions**:

1. **Refresh Dashboard**
   ```
   1. Pull down on dashboard
   2. Wait for refresh to complete
   3. Patient should appear
   ```

2. **Check Connection Status**
   ```
   1. Go to Device Management
   2. Check linked devices list
   3. Verify patient device is listed
   4. Check connection status is "Active"
   ```

3. **Restart App**
   ```
   1. Close app completely
   2. Clear from recent apps
   3. Reopen app
   4. Log in if needed
   5. Check dashboard
   ```

4. **Verify Account Type**
   ```
   1. Go to Settings > Profile
   2. Verify role is "Caregiver"
   3. If "Patient", wrong account type
   4. Log out and use caregiver account
   ```

5. **Re-establish Connection**
   ```
   1. Ask patient for new code
   2. Go to Device Management
   3. Tap "Link New Device"
   4. Enter new code
   5. Complete connection
   ```

---

## WiFi Configuration Problems

### Cannot Connect to WiFi Network

**Symptoms**:
- "Cannot connect to network" error
- "Connection failed" message
- "Network not found" error
- Stuck on "Connecting..." screen

**Diagnostic Steps**:

1. **Verify Network Information**
   ```
   ✓ Network name (SSID) is correct
   ✓ Password is correct
   ✓ Both are case-sensitive
   ✓ No extra spaces
   ```

2. **Check Network Requirements**
   ```
   ✓ 2.4GHz or 5GHz network
   ✓ WPA2 or WPA3 security
   ✓ Not hidden network
   ✓ Not enterprise network
   ```

3. **Check Device Location**
   ```
   ✓ Device is in WiFi range
   ✓ No physical obstructions
   ✓ Not in metal enclosure
   ✓ Router is working
   ```

**Solutions**:

1. **Verify Network Name**
   ```
   Common mistakes:
   ❌ "MyWiFi" vs "My WiFi" (space)
   ❌ "mywifi" vs "MyWiFi" (case)
   ❌ "MyWiFi2" vs "MyWiFi" (number)
   
   Tips:
   1. Copy network name from router
   2. Check for hidden characters
   3. Verify exact spelling
   4. Check case sensitivity
   ```

2. **Verify Password**
   ```
   Common mistakes:
   ❌ Wrong case (password vs Password)
   ❌ Similar characters (0 vs O, 1 vs l)
   ❌ Extra spaces
   ❌ Wrong keyboard layout
   
   Tips:
   1. Show password while typing
   2. Type slowly and carefully
   3. Copy from secure location
   4. Verify with router settings
   ```

3. **Check Network Type**
   ```
   Supported:
   ✅ WPA2-Personal
   ✅ WPA3-Personal
   ✅ 2.4GHz networks
   ✅ 5GHz networks
   
   Not Supported:
   ❌ WEP (outdated)
   ❌ Enterprise networks
   ❌ Captive portals
   ❌ Hidden networks (may have issues)
   ```

4. **Move Device Closer**
   ```
   1. Unplug device
   2. Move closer to router
   3. Plug back in
   4. Try connection again
   5. If successful, find better location
   ```

5. **Restart Router**
   ```
   1. Unplug router
   2. Wait 30 seconds
   3. Plug back in
   4. Wait for router to boot (2-3 min)
   5. Try device connection again
   ```

6. **Try Different Network**
   ```
   If available:
   1. Try 2.4GHz instead of 5GHz
   2. Try guest network
   3. Try mobile hotspot temporarily
   4. Verify device can connect
   ```

---

### Weak WiFi Signal

**Symptoms**:
- "Weak signal" warning
- Connection drops frequently
- Slow sync times
- Intermittent connectivity

**Solutions**:

1. **Improve Device Placement**
   ```
   Best practices:
   ✓ Central location in home
   ✓ Away from walls
   ✓ Not in cabinets or drawers
   ✓ Away from metal objects
   ✓ Not near microwave or cordless phones
   ```

2. **Optimize Router Placement**
   ```
   ✓ Central location
   ✓ Elevated position
   ✓ Away from walls
   ✓ Not in basement
   ✓ Antennas positioned correctly
   ```

3. **Reduce Interference**
   ```
   Move device away from:
   - Microwave ovens
   - Cordless phones
   - Baby monitors
   - Bluetooth devices
   - Other WiFi routers
   ```

4. **Use WiFi Extender**
   ```
   If device is far from router:
   1. Install WiFi extender
   2. Place between router and device
   3. Configure extender
   4. Connect device to extender
   ```

5. **Upgrade Router**
   ```
   Consider if:
   - Router is old (> 5 years)
   - Many devices on network
   - Large home
   - Frequent connectivity issues
   ```

---

## Device Verification Issues

### "Device Not Found" Error

**Symptoms**:
- "Device not found in system"
- "Device does not exist"
- "Invalid device ID"
- Verification fails immediately

**Possible Causes**:
- Device ID is incorrect
- Device not registered in system
- Typo in device ID
- Device not activated by manufacturer

**Solutions**:

1. **Verify Device ID**
   ```
   1. Check device label carefully
   2. Verify each character
   3. Check for similar characters:
      - 0 (zero) vs O (letter)
      - 1 (one) vs l (lowercase L)
      - 5 vs S
      - 8 vs B
   4. Try different lighting
   5. Take photo and zoom in
   ```

2. **Check Device Activation**
   ```
   New devices may need activation:
   1. Check device manual
   2. Look for activation instructions
   3. May need to power on first time
   4. May need to complete initial setup
   5. Contact support if unsure
   ```

3. **Contact Manufacturer**
   ```
   If device is new:
   Email: support@pildhora.com
   Include:
   - Device ID
   - Purchase date
   - Purchase location
   - Serial number
   - Photos of device and label
   ```

---

### "Permission Denied" During Setup

**Symptoms**:
- "Permission denied" error
- "Access denied" message
- "Unauthorized" error
- Cannot complete verification

**Solutions**:

1. **Check Authentication**
   ```
   1. Verify you're logged in
   2. Check account is active
   3. Log out and log back in
   4. Try setup again
   ```

2. **Check Account Status**
   ```
   1. Go to Settings > Profile
   2. Verify account is verified
   3. Check email verification
   4. Resend verification if needed
   ```

3. **Check Permissions**
   ```
   iOS:
   Settings > PILDHORA > Check all permissions
   
   Android:
   Settings > Apps > PILDHORA > Permissions
   ```

4. **Update App**
   ```
   1. Check for app updates
   2. Install latest version
   3. Restart app
   4. Try setup again
   ```

---

## Post-Setup Problems

### Device Shows Offline After Setup

**Symptoms**:
- Device status shows offline
- Gray dot indicator
- "Last seen" timestamp shown
- Cannot sync changes

**Solutions**:

1. **Check Device Power**
   ```
   ✓ Device is plugged in
   ✓ Power indicator is on
   ✓ Outlet is working
   ✓ Power cable is secure
   ```

2. **Check WiFi Connection**
   ```
   1. Verify router is working
   2. Check other devices can connect
   3. Ensure WiFi password didn't change
   4. Check device is in range
   ```

3. **Restart Device**
   ```
   1. Unplug device
   2. Wait 30 seconds
   3. Plug back in
   4. Wait 2-3 minutes for boot
   5. Check status in app
   ```

4. **Reconfigure WiFi**
   ```
   1. Go to Device Settings
   2. Tap "WiFi Configuration"
   3. Re-enter network information
   4. Save and test connection
   ```

5. **Check Firewall Settings**
   ```
   Device needs access to:
   - Firebase Realtime Database
   - Firestore
   - Port 443 (HTTPS)
   - Port 5353 (mDNS)
   
   Check router firewall settings
   ```

---

### Alarms Not Working After Setup

**Symptoms**:
- Device doesn't alarm at scheduled times
- Silent alarms
- No LED indication
- No vibration

**Solutions**:

1. **Check Alarm Configuration**
   ```
   1. Go to Device Settings
   2. Check alarm mode
   3. Verify not set to "Silent"
   4. Check volume > 0
   5. Verify LED intensity > 0
   ```

2. **Check Medication Schedule**
   ```
   1. Go to Medications
   2. Verify medication has schedule
   3. Check times are correct
   4. Verify frequency is set
   5. Ensure medication is active
   ```

3. **Check Device Time**
   ```
   1. Go to Device Settings
   2. Check device time
   3. Verify timezone is correct
   4. Sync time if needed
   ```

4. **Test Alarm**
   ```
   1. Go to Device Settings
   2. Tap "Test Alarm"
   3. Device should alarm immediately
   4. If not, check device power
   5. Contact support if still not working
   ```

---

### Cannot Add Medications After Setup

**Symptoms**:
- "Add Medication" button doesn't work
- Medication wizard crashes
- "Save" button disabled
- Medications don't appear in list

**Solutions**:

1. **Check Device Status**
   ```
   ✓ Device is online
   ✓ Green dot indicator
   ✓ Not showing offline
   ✓ Recent "last seen" time
   ```

2. **Check Internet Connection**
   ```
   ✓ Phone has internet
   ✓ Stable connection
   ✓ Not on airplane mode
   ✓ Can access other features
   ```

3. **Complete All Required Fields**
   ```
   Required fields:
   ✓ Medication name
   ✓ Dosage amount
   ✓ Dosage unit
   ✓ Quantity type
   ✓ At least one schedule time
   ```

4. **Restart App**
   ```
   1. Close app completely
   2. Clear from recent apps
   3. Reopen app
   4. Try adding medication again
   ```

---

## Error Messages Reference

### Patient Provisioning Errors

| Error Code | Message | Cause | Solution |
|------------|---------|-------|----------|
| `DEVICE_NOT_FOUND` | Device not found in system | Invalid device ID | Verify device ID, check for typos |
| `DEVICE_ALREADY_CLAIMED` | Device already claimed | Device registered to another account | Contact previous owner or support |
| `INVALID_DEVICE_ID` | Invalid device ID format | Wrong format | Use 5+ characters, letters/numbers only |
| `WIFI_CONFIG_FAILED` | WiFi configuration failed | Cannot connect to network | Check network name and password |
| `DEVICE_OFFLINE` | Device is offline | Device not connected | Check power and WiFi connection |
| `PERMISSION_DENIED` | Permission denied | Authentication issue | Log out and log back in |
| `VERIFICATION_TIMEOUT` | Verification timed out | Network issue | Check internet, try again |
| `NETWORK_ERROR` | Network error | No internet connection | Check internet connection |

### Caregiver Connection Errors

| Error Code | Message | Cause | Solution |
|------------|---------|-------|----------|
| `CODE_NOT_FOUND` | Connection code not found | Invalid code | Verify code with patient |
| `CODE_EXPIRED` | Connection code expired | Code > 24 hours old | Request new code |
| `CODE_ALREADY_USED` | Code already used | Code was used before | Request new code |
| `INVALID_CODE_FORMAT` | Invalid code format | Wrong format | Use 6-8 characters, letters/numbers only |
| `DEVICE_NOT_FOUND` | Device not found | Device doesn't exist | Verify patient has device |
| `CONNECTION_FAILED` | Connection failed | Network issue | Check internet, try again |
| `PERMISSION_DENIED` | Permission denied | Authentication issue | Log out and log back in |

---

## Getting Additional Help

### Before Contacting Support

**Gather This Information**:

For Patient Issues:
- Account email
- Device ID
- Phone/tablet model and OS version
- App version
- Step where issue occurred
- Error messages
- Screenshots

For Caregiver Issues:
- Account email
- Connection code (if applicable)
- Patient name (if known)
- Phone/tablet model and OS version
- App version
- Error messages
- Screenshots

### How to Find App Version

**iOS**:
```
1. Open Settings app
2. Scroll to PILDHORA
3. Tap PILDHORA
4. Version shown at bottom
```

**Android**:
```
1. Open Settings
2. Tap Apps
3. Find and tap PILDHORA
4. Version shown in app info
```

### Contact Methods

**Email**: support@pildhora.com
- Response time: 24-48 hours
- Include all information above
- Attach screenshots

**Phone**: 1-800-PILDHORA
- Available: Mon-Fri, 9am-5pm EST
- Have information ready
- Note ticket number

**Live Chat**: In-app
- Available: Mon-Fri, 9am-5pm EST
- Fastest response time
- Real-time assistance

**Emergency**: 24/7 Support
- For critical issues only
- Call: 1-800-PILDHORA-911
- Email: emergency@pildhora.com

### Additional Resources

**Documentation**:
- Patient Device Provisioning Guide
- Caregiver Connection Guide
- User Guides
- FAQ

**Video Tutorials**:
- Device provisioning walkthrough
- Connection code usage
- WiFi configuration
- Troubleshooting common issues

**Community**:
- User Forum: forum.pildhora.com
- Facebook Group
- Twitter: @PILDHORA

---

## Preventive Tips

### For Patients

**Before Starting Setup**:
1. Ensure device is powered on
2. Have WiFi information ready
3. Ensure stable internet connection
4. Update app to latest version
5. Have device ID accessible

**During Setup**:
1. Don't rush through steps
2. Read instructions carefully
3. Verify information before proceeding
4. Keep phone screen on
5. Don't close app during setup

**After Setup**:
1. Test device immediately
2. Add test medication
3. Verify alarms work
4. Check device stays online
5. Save WiFi information

### For Caregivers

**Before Connecting**:
1. Verify you have correct code
2. Ensure stable internet
3. Update app to latest version
4. Confirm patient identity
5. Have patient information ready

**During Connection**:
1. Enter code carefully
2. Verify patient information
3. Don't close app during process
4. Wait for confirmation
5. Check patient appears in list

**After Connection**:
1. Verify access to patient data
2. Check device status
3. Review medications
4. Test features
5. Communicate with patient

---

*Last Updated: 2024*
*Version: 1.0*

For the latest troubleshooting guide, visit: https://pildhora.com/docs/onboarding-troubleshooting

