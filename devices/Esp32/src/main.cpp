#include <Arduino.h>
#include <esp_now.h>
#include <WiFi.h>

#include "config.h"
#include "lcd.h"
#include "encoder.h"
#include "rfid.h"
#include "mqtt.h"
#include "handle.h"

int state = 0;
int checkpoint = 0;
String lastName = "";
int lastIndex = 0;

void reset()
{
    state = 0;
    checkpoint = 0;
    receivedName = "";
    lastName = "";
    lastIndex = 0;

    Serial.println("[STATE_1] Exiting to STATE 0");
}

void setup()
{
    Serial.begin(115200);

    WiFi.mode(WIFI_STA);
    WiFi.begin(ssid, password);
    Serial.print("[WIFI] Connecting");
    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\n[WIFI] Connected!");
    Serial.print("[WIFI] IP: ");
    Serial.println(WiFi.localIP());

    initLCD();
    initEncoder();
    initRFID();
    initMQTT();
}

void loop()
{
    if (!client.connected())
    {
        reconnectMQTT();
    }

    client.loop();
    if (state == 0)
    {
        if (checkpoint == 0)
        {
            lcd.clear();
            showWelcome();
            checkpoint = 1;
            Serial.println("[STATE] Initialized LCD");
        }
        Serial.println("[STATE] Waiting for RFID scan...");
        String uid = readRFID();

        if (uid != "" && ready)
        {
            Serial.print("[RFID] UID: " + String(uid));
            sendRFID(uid);
            state = 1;
            checkpoint = 0;
        }
        delay(500);
    }
    else if (state == 1)
    {
        if (checkpoint == 0)
        {
            lcd.clear();
            checkpoint = 1;
        }
        if (receivedName != "" && receivedName != lastName)
        {
            Serial.println("[STATE_1] Received Name: " + receivedName);
            lcd.clear();
            showUser(receivedName, 0);
            lastName = receivedName;
        }

        int index = getEncoderValue(0, 2);
        if (index != -999 && index != lastIndex)
        {
            showUser(receivedName, index);
            lastIndex = index;
        }
        int data = digitalRead(RE_pinSW);
        if (data == LOW)
        {
            delay(10);
            Serial.println("[STATE_1] Button Pressed at index: " + String(lastIndex));
            if (lastIndex == 2)
            {
                reset();
            }
            else
            {
                state = 2;
                checkpoint = 0;
                mode = lastIndex + 1;
                encoderCount = 0;
                Serial.println("[STATE_1] Mode: " + String(mode));
            }
        }
    }
    else if (state == 2)
    {
        lcd.clear();
    }
}
