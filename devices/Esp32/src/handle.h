#pragma once
#include <Arduino.h>
#include <vector>


struct DeviceItem {
    String uuid;
    String name;
};

extern std::vector<DeviceItem> deviceList;

void saveUUID(const String &uuid);

void saveName(const String &name);



String getLastTwoWords(String name);
bool readButton();
int handleScroll(int &selectedIndex, int &scrollOffset, int maxItems);
void reset();

extern bool isDelete;