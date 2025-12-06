#pragma once
#include <Arduino.h>
#include <vector>


struct DeviceItem {
    String uuid;
    String name;
};

extern std::vector<DeviceItem> deviceList;

void saveDevice(const String &uuid, const String &nameInput);



String getLastTwoWords(String name);
bool readButton();
int handleScroll(int &selectedIndex, int &scrollOffset, int maxItems);
void reset();

extern bool isDelete;