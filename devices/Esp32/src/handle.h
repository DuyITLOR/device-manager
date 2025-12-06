#pragma once
#include <Arduino.h>

String getLastTwoWords(String name);
bool readButton();
int handleScroll(int &selectedIndex, int &scrollOffset, int maxItems);
void reset();

extern bool isDelete;