#include <Arduino.h>

#define LED_PIN 4 

void setup() {
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);  
  Serial.begin(115200);
  Serial.println("LED Blink Started!");
}

void loop() {
  Serial.println("LED ON");
  digitalWrite(LED_PIN, HIGH);
  delay(500);

  Serial.println("LED OFF");
  digitalWrite(LED_PIN, LOW);  
  delay(500);
}
