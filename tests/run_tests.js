#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const { Color } = require("../src/error");

function pad(str, len) {
    while (len > str.length)
        str = ' ' + str;
    return str;
}

fs.readdirSync(__dirname).forEach(dir => {
    if (fs.statSync(path.join(__dirname, dir)).isDirectory()) {
        const files = fs.readdirSync(path.join(__dirname, dir));
        const padLen = files.reduce((a, b) => a > b.length ? a : b.length, 0);
        files.forEach(file => {
            file = file.slice(0, -3)
            try {
                require("./" + path.normalize(path.join(dir, file)).replaceAll(path.win32.sep, path.posix.sep))();
                console.log(Color.darkGreen + `[TEST ${pad(file.toUpperCase(), padLen)}   PASSED]` + Color.reset)
            } catch (e) {
                console.error(Color.darkRed + `[TEST ${pad(file.toUpperCase(), padLen)}   FAILED]` + Color.reset)
                throw e;
            }
        })
    }
})