#include "lcd.h"
#include "config.h" 


LiquidCrystal_I2C lcd(0x27, 20, 4);

static int lastSel = -1;
static int lastScroll = -1;

byte arrowRight[] = {
  B00000,
  B00100,
  B00110,
  B11111,
  B11111,
  B00110,
  B00100,
  B00000
};

byte arrowLeft[] = {
  B00000,
  B00100,
  B01100,
  B11111,
  B11111,
  B01100,
  B00100,
  B00000
};


byte devices[] = {
  B00000,
  B10001,
  B11011,
  B11111,
  B11111,
  B11111,
  B11011,
  B00000
};

void initLCD() {
    lcd.init();
    lcd.backlight();
    lcd.createChar(0, arrowRight);
    lcd.createChar(1, devices);
    lcd.createChar(2, arrowLeft);
}

void showWelcome() {
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
    if(index == 0)
    {
        lcd.setCursor(2,2);
    } else if(index == 1){
        lcd.setCursor(14,2);
    } else {
        lcd.setCursor(8,3);
    }

    lcd.write(0);

    lcd.setCursor(0, 0);
    lcd.print("NAME:" + name);

    lcd.setCursor(3, 2);
    lcd.print("MUON");

    lcd.setCursor(15, 2);
    lcd.print("TRA");

    lcd.setCursor(9, 3);
    lcd.print("EXIT");
    
}


void showDeviceList(const std::vector<String>& devices, int selectedIndex, int scrollOffset, bool &checkpointConvert) {
    if (selectedIndex == lastSel && scrollOffset == lastScroll && checkpointConvert)
        return;

    if (!checkpointConvert)
        checkpointConvert = true;
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.write(1);
    lcd.setCursor(1, 0);
    lcd.print   ("Devices: " + String(devices.size()));


    lcd.setCursor(19, 0);
    if(mode == 1)
        lcd.write(0);
    else if(mode == 2)
        lcd.write(2);

    for (int i = 0; i < 3; i++) {
        int displayIndex = scrollOffset + i;
        lcd.setCursor(0, i + 1);
        if (displayIndex < devices.size()) {
            if (displayIndex == selectedIndex) {
                lcd.print("> " + devices[displayIndex] + "   ");
            } else {
                lcd.print("  " + devices[displayIndex] + "   ");
            }
        } else {
            lcd.print("                     ");
        }
    }

    lastSel = selectedIndex;
    lastScroll = scrollOffset;
}


void showDeleteConfirmation(const String& deviceName, int index) {
    lcd.setCursor(0, 1);
    lcd.print("Deleted: " + deviceName + "   ");
    lcd.setCursor(0, 2);
    lcd.print(index == 1 ? "> Yes" : "  Yes");
    lcd.setCursor(0, 3);
    lcd.print(index == 0 ? "> No" : "  No");
}
