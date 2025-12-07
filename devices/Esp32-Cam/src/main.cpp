#include <Arduino.h>
#include <WiFi.h>
#include <esp_now.h>
#include <esp_wifi.h>
#include "ESP32QRCodeReader.h"

ESP32QRCodeReader reader(CAMERA_MODEL_AI_THINKER);
QRCodeData qrCodeData;

uint8_t receiverAddress[] = {0xE4, 0x65, 0xB8, 0x7A, 0x90, 0x30};

int led = 4;

void onSent(const uint8_t *mac_addr, esp_now_send_status_t status)
{
  Serial.print("[SEND] Status: ");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Success" : "Fail");
}

void setup()
{
  Serial.begin(115200);

  pinMode(led, OUTPUT);

  Serial.println("\n[ESP32-CAM] Booting...");

  WiFi.mode(WIFI_STA);
  // WiFi.begin("THREE O'CLOCK", "3open24h");
  uint8_t routerBSSID[] = {0x40, 0xE3, 0xD6, 0xD8, 0x12, 0x24}; // BSSID của AP ESP32 chính
  WiFi.begin("i680", "RoboticsLab@1!");
  Serial.print("[WiFi] Connecting");
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(300);
  }
  wifi_ap_record_t ap;
  if (esp_wifi_sta_get_ap_info(&ap) == ESP_OK)
  {
    Serial.printf("[INFO] Synced to Router Channel: %d\n", ap.primary);
  }
  else
  {
    Serial.println("[WARN] Could not read AP info. Channel may be default.");
  }

  if (esp_now_init() != ESP_OK)
  {
    Serial.println("[ERROR] ESP-NOW init failed!");
    return;
  }

  esp_now_register_send_cb(onSent);
  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, receiverAddress, 6);

  wifi_config_t cfg;
  esp_wifi_get_config(WIFI_IF_STA, &cfg);
  peerInfo.channel = cfg.sta.channel;

  peerInfo.encrypt = false;

  if (esp_now_add_peer(&peerInfo) != ESP_OK)
  {
    Serial.println("[ERROR] Failed to add peer!");
  }

  // Serial.print("BSSID: ");
  // Serial.println(WiFi.BSSIDstr());

  // 🟧 6) Start Camera + QR
  reader.setup();
  reader.beginOnCore(1);

  Serial.println("[ESP32-CAM] Ready. Scanning QR...");
}

void loop()
{
  if (reader.receiveQrCode(&qrCodeData, 300))
  {
    if (qrCodeData.valid)
    {
      digitalWrite(led, HIGH);

      String payload = (const char *)qrCodeData.payload;

      Serial.print("[QR] Detected: ");
      Serial.println(payload);

      esp_now_send(receiverAddress, (uint8_t *)payload.c_str(), payload.length() + 1);

      delay(200);
      digitalWrite(led, LOW);
    }
    else
    {
      Serial.println("[QR] Invalid!");
    }
  }

  delay(50);
}
