#include <Arduino.h>
#include <LiquidCrystal_I2C.h>
#include <SPI.h>
#include <MFRC522.h>
#include <vector>

// Pin definitions
/*
  LCD pins SDA: 21 - SCL: 22
  RFID pins SDA: 5 - SCK: 18 - MOSI: 23 - MISO: 19 - RST: 17
*/

// RFID pins
const int RIFD_SDA = 5;  // SDA
const int RIFD_RST = 17; // RST

// Rotary encoder pins
const int RE_pinA = 14;  // CLK
const int RE_pinB = 27;  // DT
const int RE_pinSW = 26; // SW

// Global variables
// String deviceList[10] = {"Quat1", "Den1", "Quat2", "Den2", "May do dien1", "May do dien2", "Tivi", "Tu lanh", "May giat", "Dieu hoa"};
std::vector<String> deviceList = {"Quat1", "Den1", "Quat2", "Den2", "May do dien1", "May do dien2", "Tivi", "Tu lanh", "May giat", "Dieu hoa"};
String uid;
volatile long encoderCount = 0;
volatile uint8_t prevAB = 0;
bool lastPressed = false;
uint32_t lastUi = 0;
long lastShown = LONG_MIN;

int RE_index = 0;
int lastRE_index = 0;
int scrollOffset = 0;
double startSession = 0;
int state = 0;
int confirmDelete = 0;
int indexDelete = -1;   // Use to
int lastConfirmed = 0; // Use avoid clear LCD too many times for delete 
int deviceCount = deviceList.size();

// Variable to clear
int screenClear = 0;
int screenDeleteClear = 0;

// table
static const int8_t dirTable[4][4] = {
    /*prev\curr: 00  01  10  11 */
    /*00*/ {0, -1, +1, 0},
    /*01*/ {+1, 0, 0, -1},
    /*10*/ {-1, 0, 0, +1},
    /*11*/ {0, +1, -1, 0}};

MFRC522 mfrc522(RIFD_SDA, RIFD_RST);
LiquidCrystal_I2C lcd(0x27, 20, 4);

void IRAM_ATTR handleEncoder()
{
  uint8_t a = digitalRead(RE_pinA);
  uint8_t b = digitalRead(RE_pinB);

  // Combine to state
  uint8_t currAB = (a << 1) | b;

  // Check current state
  int8_t delta = dirTable[prevAB][currAB];
  if (delta != 0)
  {
    encoderCount += delta;
  }

  prevAB = currAB;
}

void displayWelcome()
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

void displayDelete(String item)
{
  lcd.setCursor(0, 1);
  lcd.print("Deleted: " + item + "   ");
  lcd.setCursor(0, 2);
  lcd.print(confirmDelete == 0 ? "  Yes" : "> Yes");
  lcd.setCursor(0, 3);
  lcd.print(confirmDelete == 1 ? "  No" : "> No");
}

int getRE_Index()
{
  if (millis() - lastUi >= 50)
  {
    lastUi = millis();

    noInterrupts();
    long count = encoderCount;
    interrupts();

    if (count != lastShown)
    {
      lcd.setCursor(0, 1);
      lcd.print("Count: " + String(count) + "   ");
      lastShown = count;

      return count;
    }

  }
  return lastShown;
}

String readRFID()
{
  if (!mfrc522.PICC_IsNewCardPresent())
    return "";
  if (!mfrc522.PICC_ReadCardSerial())
    return "";
  String uid = "";
  for (byte i = 0; i < mfrc522.uid.size; i++)
  {
    uid += String(mfrc522.uid.uidByte[i], HEX);
  }
  uid.toUpperCase();
  return uid;
}

void removeDevices(int index)
{
  if (index >= 0 && index < deviceList.size())
  {
    Serial.println("Removing device: " + deviceList[index]);
    deviceList.erase(deviceList.begin() + index);
    Serial.println("Device removed. Current count: " + String(deviceList.size()));
  }
}

void setup()
{
  Serial.begin(115200);

  pinMode(RE_pinA, INPUT_PULLUP);
  pinMode(RE_pinB, INPUT_PULLUP);
  pinMode(RE_pinSW, INPUT_PULLUP);

  // First state
  prevAB = (digitalRead(RE_pinA) << 1) | digitalRead(RE_pinB);

  // Setup to interupts
  attachInterrupt(digitalPinToInterrupt(RE_pinA), handleEncoder, CHANGE);
  attachInterrupt(digitalPinToInterrupt(RE_pinB), handleEncoder, CHANGE);

  // RFID setup
  SPI.begin();
  mfrc522.PCD_Init();
  Serial.println("Place your RFID card near the reader...");

  // LCD setup
  lcd.init();
  lcd.backlight();
  displayWelcome();
  delay(2000);
  lcd.clear();
}

void loop()
{
  uid = readRFID();
  if (uid != "")
  {
    // Serial.println("UID as String: " + uid);
    if (screenClear == 0)
    {
      lcd.clear();
      screenClear = 1;
    }  

    if (state == 0)
    {
      if (digitalRead(RE_pinSW) == LOW)
      {
        state = 1;
        lcd.clear();
        delay(300);
      }
      screenDeleteClear = 0;
      startSession = millis();
      lcd.setCursor(0, 0);
      lcd.print("UID: " + uid + "   ");

      if (deviceCount <= 0)
      {
        lcd.setCursor(0, 1);
        lcd.print("No devices found.   ");
        return;
      }

      if (deviceCount < 10){
        lcd.setCursor(19, 0);
        lcd.print(deviceCount);
      } else {
        lcd.setCursor(18, 0);
        lcd.print(deviceCount);
      } 
      RE_index = getRE_Index() / 4;
      if (RE_index < 0)
      {
        RE_index = 0;
        encoderCount = 0;
      }
      else if (RE_index >= deviceCount)
      {
        RE_index = deviceCount - 1;
        encoderCount = RE_index * 4;
      }

      Serial.println("RE_index: " + String(RE_index));

      if (RE_index < scrollOffset)
      {
        scrollOffset = RE_index;
      }
      else if (RE_index >= scrollOffset + 3)
      {
        scrollOffset = RE_index - 2;
      }

      if (RE_index != lastRE_index)
      {
        lastRE_index = RE_index;
        lastShown = LONG_MIN;
        lcd.clear();
      }

      for (int i = 0; i < 3; i++)
      {
        int displayRE_Index = scrollOffset + i;
        lcd.setCursor(0, i + 1);
        if (displayRE_Index == RE_index)
        {
          lcd.print("> " + deviceList[displayRE_Index] + "   ");
        }
        else if (displayRE_Index < deviceCount)
        {
          lcd.print("  " + deviceList[displayRE_Index] + "   ");
        }
        else
        {
          lcd.print("                     ");
        }
      }
    }
    else if (state == 1 && indexDelete == -1)
    {
      indexDelete = RE_index;
      Serial.println("indexDelete: " + String(indexDelete));
    }
    else if (state == 1 && indexDelete != -1)
    {
      startSession = millis();
      confirmDelete = (encoderCount / 4) % 2;
      
      if (confirmDelete < 0)
      {
        confirmDelete = 0;
      }

      // Serial.println("confirmDelete: " + String(confirmDelete));
      if (lastConfirmed != confirmDelete)
      {
        lastConfirmed = confirmDelete;
        lcd.clear();
      }
      if(screenDeleteClear == 0)
      {
        lcd.clear();
        screenDeleteClear = 1;
      }

      displayDelete(deviceList[RE_index]);

      if (digitalRead(RE_pinSW) == LOW && confirmDelete == 1)
      {
        while (digitalRead(RE_pinSW) == LOW)
          ;
        removeDevices(indexDelete);
        deviceCount = deviceList.size();
        lcd.clear();
        encoderCount = indexDelete * 4;
        Serial.println("indexDelete: " + String(indexDelete));
        indexDelete = -1;
        state = 0;
      }
      else if (digitalRead(RE_pinSW) == LOW && confirmDelete == 0)
      {
        while (digitalRead(RE_pinSW) == LOW)
          ;
        lcd.clear();
        encoderCount = indexDelete * 4;
        Serial.println("indexDelete: " + String(indexDelete));
        indexDelete = -1;
        state = 0;
      }
    }
  }
  else
  {
    if (millis() - startSession > 5000)
    {
      lcd.clear();
      displayWelcome();
      startSession = millis();
      screenClear = 0;
    }
  }
}
