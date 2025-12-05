#pragma once
#include <Arduino.h>
#include <PubSubClient.h> 

void initMQTT();
void reconnectMQTT();
void sendRFID(const String &uid);

extern PubSubClient client;
extern String receivedName;

extern bool ready;