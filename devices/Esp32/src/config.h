#pragma once

// WiFi credentials
extern const char *ssid;
extern const char *password;

// MQTT broker settings
extern const char* mqtt_server;
extern const int   mqtt_port;
extern const char* mqtt_user;
extern const char* mqtt_pass;

// RFID pins
extern const int RFID_SDA;
extern const int RFID_RST;

// Rotary encoder pins
extern const int RE_pinA;
extern const int RE_pinB;
extern const int RE_pinSW;

// MQTT topics
extern const char* TOPIC_RFID_SEND;
extern const char* TOPIC_NAME_RECV;

extern const char* TOPIC_DEVICE_CHECK;
extern const char* TOPIC_DEVICE_RESULT;



extern int mode;
extern int state;
extern bool checkpointConvert;
extern int lastDeviceCount;