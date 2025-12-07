#include "rfid.h"
#include <SPI.h>
#include <MFRC522.h>
#include "config.h"

MFRC522 rfid(RFID_SDA, RFID_RST);

void initRFID() {
    SPI.begin();
    rfid.PCD_Init();
}

String readRFID()
{
  if (!rfid.PICC_IsNewCardPresent())
    return "";
  if (!rfid.PICC_ReadCardSerial())
    return "";

  String id = "";
  for (byte i = 0; i < rfid.uid.size; i++)
    id += String(rfid.uid.uidByte[i], HEX);

  id.toUpperCase();
  Serial.println("[RFID] Scanned ID: " + id);
  rfid.PICC_HaltA();
  rfid.PCD_StopCrypto1();
  return id;
}