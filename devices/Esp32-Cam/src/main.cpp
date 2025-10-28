#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "esp_camera.h"

#include "ESP32QRCodeReader.h"

LiquidCrystal_I2C lcd(0x27, 20, 4);


ESP32QRCodeReader reader(CAMERA_MODEL_AI_THINKER);
QRCodeData qrCodeData;

void printLCD(String text)
{
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(text);
}

void setup()
{
  Serial.begin(115200);
  Wire.begin(14, 15); // SCL, SDA
  lcd.init();
  lcd.backlight();


  reader.setup();
  reader.beginOnCore(1);

  Serial.println("\n[INFO] QR scanner started.");
  printLCD("QR Scanner Ready");
}

void loop()
{
  // Nhận dữ liệu QR

  if (reader.receiveQrCode(&qrCodeData, 300))
  {
    if (qrCodeData.valid)
    {
      String payload = (const char *)qrCodeData.payload;
      Serial.print("[INFO] QR Code Detected: ");
      Serial.println(payload);

      // Hiển thị lên LCD
      printLCD(payload);
    }
    else
    {
      Serial.println("[WARN] Invalid QR Code");
    }
  }

  delay(200);
}
