const { getCompilerFlag } = require("../../paisley");

const keyboards = {
    "qwerty": [
        "1234567890-=",
        "QWERTYUIOP[]\\",
        "ASDFGHJKL;'",
        "ZXCVBNM,./",
    ],
    "dvorak": [
        "1234567890[]",
        "',.pyfgcrl/=\\",
        "AOEUIDHTNS-",
        ";QJKXBMWVZ",
    ],
    "colemac": [
        "1234567890-=",
        "QWFPGJLUY;[]\\",
        "ARSTDHNEIO'",
        "ZXCVBKM.,/",
    ],
    "azerty": [
        "1234567890)",
        "AZERTYUIOP^$",
        "QSDFGHJKLM%",
        "WXCVBN,;:=",
    ]
};

function calcTypoVector(keyboard, letter) {
    letter = letter.toUpperCase();
    const vec = { x: keyboard.findIndex(e => e.includes(letter)) };
    if (vec.x == -1)
        return null;
    vec.y = keyboard[vec.x].indexOf(letter);
    return vec;
}

function typoCheck(i, f) {
    const keyboard = keyboards[getCompilerFlag("keyboard-layout")];
    const vec1 = calcTypoVector(keyboard, i);
    const vec2 = calcTypoVector(keyboard, f);
    if (!vec1 || !vec2)
        return false;
    const distanceVector = { x: Math.abs(vec1.x - vec2.x), y: Math.abs(vec1.y - vec2.y) };
    
    return Math.hypot(distanceVector) <= +getCompilerFlag("typo-threshold");
}

function spellCheck(listOfValidValues, value) {
    if (value.length < 3)
        return [];
    const accepted = [];
    for (let i = 0; i < listOfValidValues.length; i++) {
        const currentValue = listOfValidValues[i];
        if (Math.abs(value.length - currentValue.length) > 2) continue;
        let bigger = currentValue;
        let smaller = value;
        if (value.length > currentValue.length) {
            bigger = value;
            smaller = currentValue;
        }
        let errors = 0;
        for (let i = 0; i < bigger.length; i++) {
            if (errors > +getCompilerFlag("error-threshold")) break;
            if (smaller[i] == bigger[i]) continue;
            
            if (smaller[i + 1] == bigger[i + 1] && smaller[i + 2] == bigger[i + 2]) {
                errors++;
            } else if (typoCheck(smaller[i], bigger[i])) {
                errors++;
            } else {
                bigger = bigger.split("");
                bigger.splice(i, 1);
                bigger = bigger.join("");
                i--;
                errors++;
                continue;
            }
        }
        if (errors > +getCompilerFlag("error-threshold")) continue;
        accepted.push(currentValue);
    }
    return accepted;
}

module.exports = { spellCheck };