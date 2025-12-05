#pragma once
#include <Arduino.h>
#include <vector>
#include <LiquidCrystal_I2C.h>


extern LiquidCrystal_I2C lcd;

void initLCD();
void showWelcome();
void showDeviceList(const std::vector<String>& devices, int selectedIndex, int scrollOffset);
void showDeleteConfirmation(const String& deviceName, bool confirmDelete);
void showUser(String name, int index);
