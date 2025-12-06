#include <Arduino.h>
#include <esp_now.h>
#include <WiFi.h>
#include <vector>

#include "config.h"
#include "lcd.h"
#include "encoder.h"
#include "rfid.h"
#include "mqtt.h"
#include "handle.h"
#include "esp_now_recv.h"

int state = 0;
int checkpoint = 0;
String lastName = "";
int lastIndex = 0;

// Đây là biến trước khi xóa
int selectedIndexDelete = 0;
bool checkpointConvert = true;

static int scrollOffset = 0;

void reset()
{
    state = 0;
    checkpoint = 0;
    receivedName = "";
    lastName = "";
    lastIndex = 0;
    encoderCount = 0;

    Serial.println("[STATE_1] Exiting to STATE 0");
}

void button(int nextState)
{
    if (digitalRead(RE_pinSW) == LOW)
    {
        while (digitalRead(RE_pinSW) == LOW)
            ;
        state = nextState;
        encoderCount = 0;
        checkpoint = 0;
    }
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
    initEspNow();
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
            lastSel = -1;
            lastScroll = -1;
            checkpointConvert = false;
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
            while (digitalRead(RE_pinSW) == LOW)
                ;
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
        if (checkpoint == 0)
        {
            lcd.clear();
            checkpoint = 1;

            lastSel = -1;
            lastScroll = -1;
            checkpointConvert = false;
        }
        // Serial.println("[STATE_2] Showing Device List");
        handleScroll(lastIndex, scrollOffset, deviceList.size());
        showDeviceList(lastIndex, scrollOffset, checkpointConvert);
        selectedIndexDelete = lastIndex;
        button(3);
    }
    else if (state == 3)
    {
        if (checkpoint == 0)
        {
            lcd.clear();
            checkpoint = 1;
        }

        int index = getEncoderValue(0, 1);
        if (index != -999 && index != lastIndex)
        {
            lastIndex = index;
        }

        showDeleteConfirmation(deviceList[selectedIndexDelete].name, lastIndex);

        int data = digitalRead(RE_pinSW);
        if (data == LOW)
        {
            while (digitalRead(RE_pinSW) == LOW)
                ;
            Serial.println("[STATE_3] Button Pressed at index: " + String(lastIndex));
            if (lastIndex == 1)
            {
                deviceList.erase(deviceList.begin() + selectedIndexDelete);
                state = 2;
                checkpoint = 0;
                checkpointConvert = false;
                selectedIndexDelete = 0;
                lastIndex = 0;
                scrollOffset = 0;
                lastSel = -1;
                lastScroll = -1;
            }
            else
            {
                state = 2;
                lastIndex = selectedIndexDelete;
                checkpoint = 0;
                checkpointConvert = false;
            }
        }
    }
}
