#include "encoder.h"
#include "config.h"
#include <Arduino.h>

volatile long encoderCount = 0;
volatile uint8_t prevAB = 0;
uint32_t lastUi = 0;
long lastValue = 0;



static const int8_t dirTable[4][4] = {
    {0, -1, 1, 0},
    {1, 0, 0, -1},
    {-1, 0, 0, 1},
    {0, 1, -1, 0}
};

void IRAM_ATTR handleEncoder() {
    uint8_t a = digitalRead(RE_pinA);
    uint8_t b = digitalRead(RE_pinB);
    uint8_t state = (a << 1) | b;

    int8_t delta = dirTable[prevAB][state];
    if (delta != 0) encoderCount += delta;
    prevAB = state;
}

void initEncoder() {
    pinMode(RE_pinA, INPUT_PULLUP);
    pinMode(RE_pinB, INPUT_PULLUP);
    pinMode(RE_pinSW, INPUT_PULLUP);
    attachInterrupt(digitalPinToInterrupt(RE_pinA), handleEncoder, CHANGE);
    attachInterrupt(digitalPinToInterrupt(RE_pinB), handleEncoder, CHANGE);
}

int getEncoderValue(int minValue, int maxValue) {
    if (millis() - lastUi > 40) {  // chống rung
        lastUi = millis();

        long count = encoderCount;
        int value = count / 4;

        if (value < minValue){
            value = minValue;
            encoderCount = minValue * 4;
        }
        if (value > maxValue){
            value = maxValue;
            encoderCount = maxValue * 4; 
        }

        if (value != lastValue) {
            lastValue = value;
            return value;
        }
    }
    return -999; // không thay đổi
}

