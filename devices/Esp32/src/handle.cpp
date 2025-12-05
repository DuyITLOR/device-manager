#include "handle.h"
#include "config.h"

String getLastTwoWords(String name) {
    name.trim();

    int lastSpace = name.lastIndexOf(' ');
    if (lastSpace == -1) return name;  

    int secondLastSpace = name.lastIndexOf(' ', lastSpace - 1);

    if (secondLastSpace == -1)
        return name.substring(lastSpace + 1); 

    return name.substring(secondLastSpace + 1);
}


