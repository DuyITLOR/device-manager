#include "mqtt.h"
#include "config.h"
#include "handle.h"
#include <WiFiClientSecure.h>
#include <lcd.h>

WiFiClientSecure secureClient;
PubSubClient client(secureClient);

String receivedName = "";
bool ready = false;
int respone = -1;
String code = "";

void mqttCallback(char *topic, byte *payload, unsigned int length)
{
    String msg = "";
    for (int i = 0; i < length; i++)
        msg += (char)payload[i];
    msg.trim();

    Serial.print("[MQTT] Topic: " + String(topic));

    if (String(topic) == TOPIC_NAME_RECV)
    {
        StaticJsonDocument<128> doc;
        auto err = deserializeJson(doc, msg);

        if (err)
        {
            Serial.println("[MQTT] JSON Parse Failed");
            return;
        }
        receivedName = getLastTwoWords(doc["name"] | "");
        code = doc["code"] | "";
        Serial.println("Received Name: " + receivedName + " | Code: " + code);
    }
    else if (String(topic) == TOPIC_DEVICE_CHECK_RESPONSE)
    {

        StaticJsonDocument<128> doc;
        auto err = deserializeJson(doc, msg);

        if (err)
        {
            Serial.println("[MQTT] JSON Parse Failed");
             Serial.println("[DEVICE] Device Not Found / Invalid");
            lcd.clear();
            lcd.setCursor(0, 1);
            lcd.print(" DEVICE NOT FOUND ");
            delay(1000);
            checkpointConvert = false;
            lcd.clear();
            return;
        }

        String id = doc["id"] | "";
        String name = doc["name"] | "";

        if (id == "" || name == "")
        {
            Serial.println("[DEVICE] Device Not Found / Invalid");
            lcd.clear();
            lcd.setCursor(0, 1);
            lcd.print(" DEVICE NOT FOUND ");
            delay(1000);
            checkpointConvert = false;
            lcd.clear();
            return;
        }

        saveDevice(id, name);
        Serial.println("[Device] Count: " + String(deviceList.size()));
        Serial.println("[DEVICE] Saved -> UUID: " + id + " | NAME: " + name);
    } else if (String(topic) == TOPIC_DEVICE_RESPONSE)
    {
        Serial.println("[MQTT] Device Operation Response: " + msg);
        if (msg == "LOAN_SUCCESS") {
            respone = 1;
            Serial.println("[MQTT] Device operation successful.");
        } else {
            respone = 0;
            Serial.println("[MQTT] Device operation failed: " + msg);
        }
    }
    else
    {
        Serial.println("Unknown Topic");
    }
}

void initMQTT()
{
    secureClient.setInsecure();
    client.setServer(mqtt_server, mqtt_port);
    client.setCallback(mqttCallback);
}

void reconnectMQTT()
{
    while (!client.connected())
    {
        Serial.print("[MQTT] Connecting...");

        if (client.connect("ESP32Client", mqtt_user, mqtt_pass))
        {
            Serial.println(" Connected!");
            ready = true;
            client.subscribe(TOPIC_NAME_RECV);
            Serial.println("[MQTT] Subscribed to " + String(TOPIC_NAME_RECV));
            client.subscribe(TOPIC_DEVICE_CHECK_RESPONSE);
            Serial.println("[MQTT] Subscribed to " + String(TOPIC_DEVICE_CHECK_RESPONSE));
            client.subscribe(TOPIC_DEVICE_RESPONSE);
            Serial.println("[MQTT] Subscribed to " + String(TOPIC_DEVICE_RESPONSE));
        }
        else
        {
            Serial.print(" Failed, rc=");
            Serial.println(client.state());
            delay(2000);
        }
    }
}

void sendRFID(const String &uid)
{
    Serial.println("[MQTT] Sending UID: " + uid);
    client.publish(TOPIC_RFID_SEND, uid.c_str());
}

void sendDeviceId(const String &deviceID)
{
    
    if (mode == 1){
        Serial.println("[MQTT] Sending devices id to loan: " + deviceID);
        client.publish(TOPIC_DEVICE_CHECK_LOAN, deviceID.c_str());
    } else {
        StaticJsonDocument<256> doc;
        doc["code"] = code;
        doc["deviceId"] = deviceID;
        String json;
        serializeJson(doc, json);
        Serial.println("[MQTT] Sending devices id to return: " + json);
        client.publish(TOPIC_DEVICE_CHECK_RETURN, json.c_str());
    }
}


void sendLoanRequest(const String &userCode)
{
    StaticJsonDocument<256> doc;
    doc["code"] = userCode;

    JsonArray arr = doc.createNestedArray("devices");
    for (auto &item : deviceList)
    {
        arr.add(item.uuid);
    }

    String json;
    serializeJson(doc, json);
    Serial.println("[MQTT] Sending Loan Request: " + json);
    client.publish(TOPIC_DEVICE_LOAN, json.c_str());
}

void sendReturnRequest(const String &userCode)
{
    StaticJsonDocument<256> doc;
    doc["code"] = userCode;

    JsonArray arr = doc.createNestedArray("devices");
    for (auto &item : deviceList)
    {
        arr.add(item.uuid);
    }

    String json;
    serializeJson(doc, json);
    Serial.println("[MQTT] Sending Return Request: " + json);
    client.publish(TOPIC_DEVICE_RETURN, json.c_str());
}