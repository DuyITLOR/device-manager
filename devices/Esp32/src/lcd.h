#pragma once
#include <Arduino.h>
#include <vector>
#include <LiquidCrystal_I2C.h>


extern LiquidCrystal_I2C lcd;

void initLCD();
void showWelcome();
void showDeviceList(const std::vector<String>& devices, int selectedIndex, int scrollOffset, bool &checkpointConvert);
void showDeleteConfirmation(const String& deviceName, int index);
void showUser(String name, int index);
