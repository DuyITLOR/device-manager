#include "lcd.h"
#include "config.h"
#include "handle.h"

LiquidCrystal_I2C lcd(0x27, 20, 4);

int lastSel = -1;
int lastScroll = -1;
int lastIndexDelete = 0;

byte arrowRight[] = {
    B00000,
    B00100,
    B00110,
    B11111,
    B11111,
    B00110,
    B00100,
    B00000};

byte arrowLeft[] = {
    B00000,
    B00100,
    B01100,
    B11111,
    B11111,
    B01100,
    B00100,
    B00000};

byte devices[] = {
    B00000,
    B10001,
    B11011,
    B11111,
    B11111,
    B11111,
    B11011,
    B00000};

void initLCD()
{
    lcd.init();
    lcd.backlight();
    lcd.createChar(0, arrowRight);
    lcd.createChar(1, devices);
    lcd.createChar(2, arrowLeft);
}

void showWelcome()
{
    lcd.setCursor(7, 0);
    lcd.print("Welcome!");
    lcd.setCursor(2, 1);
    lcd.print("Robotics Iot Club");
    lcd.setCursor(0, 2);
    lcd.print("CREATED BY:");
    lcd.setCursor(1, 3);
    lcd.print("N.Duy-M.Dang-A.Khoa");
}

void showUser(String name, int index = 0)
{
    lcd.clear();
    lcd.setCursor(0, 0);
    if (index == 0)
    {
        lcd.setCursor(2, 2);
    }
    else if (index == 1)
    {
        lcd.setCursor(14, 2);
    }

    lcd.write(0);

    lcd.setCursor(0, 0);
    lcd.print("NAME:" + name);

    lcd.setCursor(3, 2);
    lcd.print("BORROW");

    lcd.setCursor(13, 2);
    lcd.print("RETURN");
}


void showDeviceList(int selectedIndex, int &scrollOffset, bool &checkpointConvert)
{
    int deviceCount = deviceList.size();
    
    if (deviceCount != lastDeviceCount)
    {
        lastSel = -1;
        lastScroll = -1;
        scrollOffset = 0;
        checkpointConvert = false;
        lastDeviceCount = deviceCount;
    }

    if (selectedIndex == lastSel && scrollOffset == lastScroll && checkpointConvert)
        return;

    if (!checkpointConvert)
        checkpointConvert = true;

    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.write(1);
    lcd.setCursor(1, 0);
    lcd.print("Devices: " + String(deviceCount));

    lcd.setCursor(19, 0);
    if (mode == 1) lcd.write(0);
    else if (mode == 2) lcd.write(2);

    if (deviceCount == 0)
    {
        lcd.setCursor(0, 1);
        lcd.print("NotFound     ");

        lcd.setCursor(0, 2);
        lcd.print(selectedIndex == 0 ? "> SUBMIT" : "  SUBMIT");

        lcd.setCursor(0, 3);
        lcd.print(selectedIndex == 1 ? "> EXIT"   : "  EXIT");

        lastSel = selectedIndex;
        lastScroll = 0;
        return;
    }

    for (int i = 0; i < 3; i++)
    {
        int displayIndex = scrollOffset + i;
        lcd.setCursor(0, i + 1);

        if (displayIndex < deviceCount)
        {
            lcd.print(displayIndex == selectedIndex ?
                      "> " + deviceList[displayIndex].name :
                      "  " + deviceList[displayIndex].name);
        }
        else if (displayIndex == deviceCount)
        {
            lcd.print(selectedIndex == displayIndex ? "> SUBMIT" : "  SUBMIT");
        }
        else if (displayIndex == deviceCount + 1)
        {
            lcd.print(selectedIndex == displayIndex ? "> EXIT" : "  EXIT");
        }
        else
        {
            lcd.print("                    ");
        }
    }

    lastSel = selectedIndex;
    lastScroll = scrollOffset;
}


void showDeleteConfirmation(const String &deviceName, int index)
{
    if (index != lastIndexDelete) {
        lastIndexDelete = index;
        lcd.clear();
    }
    lcd.setCursor(0, 1);
    lcd.print("Delete: " + deviceName + "   ");
    lcd.setCursor(0, 2);
    lcd.print(index == 1 ? "> Yes" : "  Yes");
    lcd.setCursor(0, 3);
    lcd.print(index == 0 ? "> No" : "  No");
}


void showSubmitting(){
    lcd.setCursor(0, 1);
    lcd.print("Submitting...");
}


void showError(String message){
    lcd.clear();
    lcd.setCursor(0, 1);
    lcd.print(message);
    checkpointConvert = false;
    delay(1500);
}