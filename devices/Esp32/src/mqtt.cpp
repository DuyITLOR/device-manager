#include "mqtt.h"
#include "config.h"
#include "handle.h"
#include <WiFiClientSecure.h>

WiFiClientSecure secureClient;
PubSubClient client(secureClient);

String receivedName = "";
bool ready = false;

void mqttCallback(char *topic, byte *payload, unsigned int length)
{
    String msg = "";
    for (int i = 0; i < length; i++)
        msg += (char)payload[i];
    msg.trim();

    Serial.print("[MQTT] Topic: " + String(topic));

    if (String(topic) == TOPIC_NAME_RECV)
    {
        receivedName = getLastTwoWords(msg);
        Serial.println("Received Name: " + receivedName);
    }
    else if (String(topic) == TOPIC_DEVICE_RESULT)
    {

        StaticJsonDocument<128> doc;
        auto err = deserializeJson(doc, msg);

        if (err)
        {
            Serial.println("[MQTT] JSON Parse Failed");
            return;
        }

        String uuid = doc["uuid"] | "";
        String name = doc["name"] | "";

        if (uuid == "" || name == "")
        {
            Serial.println("[DEVICE] Device Not Found / Invalid");
            return;
        }

        saveUUID(uuid);
        saveName(name);
        Serial.println("[DEVICE] Saved -> UUID: " + uuid + " | NAME: " + name);
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
            client.subscribe(TOPIC_DEVICE_RESULT);
            Serial.println("[MQTT] Subscribed to " + String(TOPIC_DEVICE_RESULT));
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
    Serial.println("[MQTT] Sending devices id: " + deviceID);
    client.publish(TOPIC_DEVICE_CHECK, deviceID.c_str());
}
