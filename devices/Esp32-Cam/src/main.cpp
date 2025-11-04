#include <Arduino.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include "esp_camera.h"
#include <esp_now.h>
#include <WiFi.h>


#include "ESP32QRCodeReader.h"

LiquidCrystal_I2C lcd(0x27, 20, 4);

uint8_t receiverAddress[] = {0xE4, 0x65, 0xB8, 0x7A, 0x90, 0x30};

ESP32QRCodeReader reader(CAMERA_MODEL_AI_THINKER);
QRCodeData qrCodeData;

int led = 4;

void onSent(const uint8_t *mac_addr, esp_now_send_status_t status){
  Serial.print("\n[INFO] Last Packet Send Status: ");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}

void setup()
{
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  pinMode(led, OUTPUT);
  if(esp_now_init() != ESP_OK){
    Serial.println("[ERROR] Error initializing ESP-NOW");
    return;
  }


  esp_now_register_send_cb(onSent);

  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, receiverAddress, 6);
  peerInfo.channel = 0;       
  peerInfo.encrypt = false;   
  esp_now_add_peer(&peerInfo);

  reader.setup();
  reader.beginOnCore(1);

  Serial.println("\n[INFO] QR scanner started.");
}

void loop()
{
  if (reader.receiveQrCode(&qrCodeData, 300))
  {
    
    if (qrCodeData.valid)
    {
      digitalWrite(led, HIGH);
      String payload = (const char *)qrCodeData.payload;
      esp_now_send(receiverAddress, (uint8_t *)payload.c_str(), payload.length() + 1);
      Serial.print("[INFO] QR Code Detected: ");
      Serial.println(payload);
      delay(200);
      digitalWrite(led, LOW);
    }
    else
    {
      Serial.println("[WARN] Invalid QR Code");
    }
  }

  delay(200);
}
