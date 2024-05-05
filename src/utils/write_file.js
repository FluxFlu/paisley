const fs = require("node:fs");
const { getErrorLogged } = require("../error/error");
const { getCompilerFlag } = require("./compiler_flags");

const linkNameMap = new Map();

let outFile = "";

function writeLinkedFile(name) {
    fs.writeFileSync(name, outFile);
}

function writeFile(name, text) {
    if (getErrorLogged()) {
        return;
    }
    if (getCompilerFlag("type") == "link") {
        if (!linkNameMap.get(name)) {
            return outFile += text;
        }
        if (outFile != "") {
            outFile += "\n";
        }
        return outFile += `let ${linkNameMap.get(name)};{${text}}`;
    }
    fs.writeFileSync(name, text);
}

module.exports = { linkNameMap, writeLinkedFile, writeFile };