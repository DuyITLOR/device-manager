#include "config.h"

// WiFi credentials
const char *ssid = "THREE O'CLOCK";
const char *password = "3open24h";

// MQTT broker settings
const char* mqtt_server = "d88f57c7216c42dcb02df9d78d1c49ed.s1.eu.hivemq.cloud";
const int   mqtt_port = 8883;
const char* mqtt_user = "Robotics";
const char* mqtt_pass = "Robotics@123";

// RFID pins
const int RFID_SDA = 5;
const int RFID_RST = 17;

// Rotary encoder pins
const int RE_pinA = 14;
const int RE_pinB = 27;
const int RE_pinSW = 26;

// MQTT topics
const char* TOPIC_RFID_SEND = "rfid/esp32/code";
const char* TOPIC_NAME_RECV = "rfid/server/name";


int mode = 0;