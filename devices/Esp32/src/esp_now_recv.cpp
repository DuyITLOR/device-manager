#include "esp_now_recv.h"
#include "config.h"
#include "mqtt.h"

String receivedQR = "";

void onDataRecv(const uint8_t * mac, const uint8_t *data, int len) {
    receivedQR = String((char*)data);
    Serial.print("[ESP-NOW] QR Received: ");
    Serial.println(receivedQR);
    
    sendDeviceId(receivedQR);
}

void initEspNowReceiver() {
    WiFi.mode(WIFI_STA);
    WiFi.disconnect();

    if (esp_now_init() != ESP_OK) {
        Serial.println("ESP-NOW init failed!");
        return;
    }

    esp_now_register_recv_cb(onDataRecv);

    Serial.println("[ESP32] Ready to receive QR via ESP-NOW.");
}