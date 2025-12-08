#include "handle.h"
#include "config.h"
#include "encoder.h"
#include "lcd.h"

bool isDelete = false;

std::vector<DeviceItem> deviceList;

String getLastTwoWords(String name)
{
    name.trim();

    int lastSpace = name.lastIndexOf(' ');
    if (lastSpace == -1)
        return name;

    int secondLastSpace = name.lastIndexOf(' ', lastSpace - 1);

    if (secondLastSpace == -1)
        return name.substring(lastSpace + 1);

    return name.substring(secondLastSpace + 1);
}

int handleScroll(int &selectedIndex, int &scrollOffset, int maxItems)
{
    int newValue = getEncoderValue(0, maxItems - 1);

    if (newValue == -999)
        return selectedIndex;

    selectedIndex = newValue;

    if (selectedIndex < scrollOffset)
        scrollOffset = selectedIndex;
    else if (selectedIndex > scrollOffset + 2)
        scrollOffset = selectedIndex - 2;

    return selectedIndex;
}

// void saveUUID(const String &uuid) {
//     for (auto &item : deviceList) {
//         if (item.uuid == uuid) {
//             Serial.println("[DEVICE] UUID đã tồn tại → không thêm");
//             return;
//         }
//     }

//     DeviceItem newItem;
//     newItem.uuid = uuid;
//     newItem.name = "";
//     deviceList.push_back(newItem);
//     Serial.println("[DEVICE] Added UUID: " + uuid);
// }

// void saveName(const String &nameInput) {

//     if (deviceList.empty()) {
//         Serial.println("[DEVICE] Warning: No UUID available for this name!");
//         return;
//     }

//     String name = nameInput;
//     if (name.length() > 15)
//         name = name.substring(0, 15);
//     deviceList.back().name = name;

//     Serial.println("[DEVICE] Updated name: " + name);
// }

void saveDevice(const String &uuid, const String &nameInput)
{
    String name = nameInput;
    if (name.length() > 15)
    {
        name = name.substring(0, 13);
    }
    for (auto &item : deviceList)
    {
        if (item.uuid == uuid)
        {
            Serial.println("[DEVICE] UUID already exists, not adding.");

            lastSel = -1;
            lastScroll = -1;
            checkpointConvert = false;
            return;
        }
    }

    DeviceItem newItem;
    newItem.uuid = uuid;
    newItem.name = name;

    deviceList.push_back(newItem);
    lastSel = -1;
    lastScroll = -1;
    checkpointConvert = false;

    Serial.println("[DEVICE] Added -> " + uuid + " | NAME: " + name);
}