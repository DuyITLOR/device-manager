#include "handle.h"
#include "config.h"
#include "encoder.h"

bool isDelete = false;

String getLastTwoWords(String name) {
    name.trim();

    int lastSpace = name.lastIndexOf(' ');
    if (lastSpace == -1) return name;  

    int secondLastSpace = name.lastIndexOf(' ', lastSpace - 1);

    if (secondLastSpace== -1)
        return name.substring(lastSpace + 1); 

    return name.substring(secondLastSpace + 1);
}


int handleScroll(int &selectedIndex, int &scrollOffset, int maxItems)
{
    int newValue = getEncoderValue(0, maxItems - 1);

    if (newValue == -999) return selectedIndex;  

    selectedIndex = newValue;

    if (selectedIndex < scrollOffset)
        scrollOffset = selectedIndex;
    else if (selectedIndex > scrollOffset + 2)  
        scrollOffset = selectedIndex - 2;



    return selectedIndex;
}
