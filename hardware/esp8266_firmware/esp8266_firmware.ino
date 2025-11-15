#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>

// Wi-Fi credentials
#define WIFI_SSID "YOUR_WIFI_SSID"
#define WIFI_PASSWORD "YOUR_WIFI_PASSWORD"

// Device ID
#define DEVICE_ID "DEVICE-001"

FirebaseData firebaseData;
FirebaseData configData;

// Simple in-memory representation of device configuration
String currentAlarmMode = "both"; // off | sound | led | both
int currentLedIntensity = 512;    // 0-1023
int currentLedR = 255;
int currentLedG = 255;
int currentLedB = 255;

unsigned long lastStatusUpdateTime = 0;
unsigned long lastConfigUpdateTime = 0;
const unsigned long CONFIG_UPDATE_INTERVAL_MS = 60000; // 60 seconds

void updateConfigFromRTDB() {
  String basePath = "/devices/" + String(DEVICE_ID) + "/config";

  // Alarm mode
  if (Firebase.getString(configData, basePath + "/alarm_mode")) {
    currentAlarmMode = configData.stringData();
    Serial.println("Updated alarm_mode: " + currentAlarmMode);
  }

  // LED intensity
  if (Firebase.getInt(configData, basePath + "/led_intensity")) {
    currentLedIntensity = configData.intData();
    Serial.print("Updated led_intensity: ");
    Serial.println(currentLedIntensity);
  }

  // LED color (optional, expects { r, g, b })
  if (Firebase.getJSON(configData, basePath + "/led_color")) {
    FirebaseJson &json = configData.jsonObject();
    int r, g, b;
    if (json.get(r, "r")) currentLedR = r;
    if (json.get(g, "g")) currentLedG = g;
    if (json.get(b, "b")) currentLedB = b;
    Serial.printf("Updated led_color: r=%d g=%d b=%d\n", currentLedR, currentLedG, currentLedB);
  }
}

void setup() {
  Serial.begin(115200);

  // Connect to Wi-Fi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(300);
  }
  Serial.println();
  Serial.print("Connected with IP: ");
  Serial.println(WiFi.localIP());

  // TODO: initialize Firebase client here using your chosen library and auth model.
  // This sketch focuses on the Realtime Database paths and payloads that the backend expects.

  // Set up Firebase stream to listen for dispense commands
  if (!Firebase.beginStream(firebaseData, "/devices/" + String(DEVICE_ID) + "/dispense")) {
    Serial.println("Could not begin stream");
    Serial.println("REASON: " + firebaseData.errorReason());
    Serial.println();
  }

  // Initial configuration fetch
  updateConfigFromRTDB();
}

void loop() {
  if (Firebase.readStream(firebaseData)) {
    if (firebaseData.streamPath() == "/devices/" + String(DEVICE_ID) + "/dispense") {
      if (firebaseData.dataType() == "boolean" && firebaseData.boolData()) {
        // Mark alarm sounding so backend can schedule missed-dose checks
        Firebase.setString(firebaseData, "/devices/" + String(DEVICE_ID) + "/state/current_status", "ALARM_SOUNDING");

        dispenseMedication();

        // Mark dose taken so backend knows it was successfully dispensed
        Firebase.setString(firebaseData, "/devices/" + String(DEVICE_ID) + "/state/current_status", "DOSE_TAKEN");

        // Clear the command flag
        Firebase.setBool(firebaseData, "/devices/" + String(DEVICE_ID) + "/dispense", false);
      }
    }
  }

  // Periodic heartbeat for device status (optional)
  if (millis() - lastStatusUpdateTime > 5000) {
    lastStatusUpdateTime = millis();
    Firebase.setString(firebaseData, "/devices/" + String(DEVICE_ID) + "/state/current_status", "IDLE");
  }

  // Periodically refresh configuration from RTDB
  if (millis() - lastConfigUpdateTime > CONFIG_UPDATE_INTERVAL_MS) {
    lastConfigUpdateTime = millis();
    updateConfigFromRTDB();
  }
}

void dispenseMedication() {
  // This function should control the dispensing mechanism (servo, LEDs, buzzer, etc.)
  // based on the current configuration.
  Serial.println("Dispensing medication...");
  Serial.println("Alarm mode: " + currentAlarmMode);
  Serial.printf("LED intensity: %d, color: r=%d g=%d b=%d\n", currentLedIntensity, currentLedR, currentLedG, currentLedB);

  // TODO: use currentAlarmMode/currentLed* to drive actual hardware pins.

  // Log a dispense event under /devices/{DEVICE_ID}/dispenseEvents so Cloud Functions
  // can convert it into an intakeRecords document.
  FirebaseJson event;
  unsigned long nowMs = millis();

  event.set("dispensedAt", (int)nowMs);
  event.set("ok", true);
  // Optional: firmware can set more fields if available
  // event.set("medicationName", "Unknown");
  // event.set("dosage", "1 unit");

  String eventsPath = "/devices/" + String(DEVICE_ID) + "/dispenseEvents";
  if (Firebase.pushJSON(firebaseData, eventsPath, event)) {
    Serial.println("Dispense event logged to RTDB");
  } else {
    Serial.println("Failed to log dispense event: " + firebaseData.errorReason());
  }
}
