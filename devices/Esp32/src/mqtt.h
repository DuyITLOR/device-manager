#pragma once
#include <Arduino.h>
#include <PubSubClient.h> 
#include <ArduinoJson.h>

void initMQTT();
void reconnectMQTT();
void sendRFID(const String &uid);
void sendDeviceId(const String &deviceID);
void sendLoanRequest(const String &userCode);
void sendReturnRequest(const String &userCode);

extern PubSubClient client;
extern String receivedName;
extern int respone;
extern String code;
extern bool ready;