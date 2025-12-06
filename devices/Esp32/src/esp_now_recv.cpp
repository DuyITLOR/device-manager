#include "esp_now_recv.h"
#include "config.h"
#include "mqtt.h"

String receivedQR = "";

void onDataRecv(const uint8_t *mac, const uint8_t *data, int len)
{
    receivedQR = String((char *)data);
    Serial.print("[ESP-NOW] QR Received: ");
    Serial.println(receivedQR);

    if (state == 2)
        sendDeviceId(receivedQR);
}

void initEspNow()
{
    WiFi.mode(WIFI_STA);
    uint8_t mac[6];
    Serial.print("BSSID: ");
    Serial.println(WiFi.BSSIDstr());
    esp_wifi_get_mac(WIFI_IF_STA, mac);
    Serial.printf("[ESP32] ESP-NOW MAC: %02X:%02X:%02X:%02X:%02X:%02X\n",
                  mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
    wifi_config_t conf;
    esp_wifi_get_config(WIFI_IF_STA, &conf);
    Serial.print("Receiver Channel: ");
    Serial.println(conf.sta.channel);
    if (esp_now_init() != ESP_OK)
    {
        Serial.println("ESP-NOW init failed!");
        return;
    }

    esp_now_register_recv_cb(onDataRecv);

    Serial.println("[ESP32] Ready to receive QR via ESP-NOW.");
}