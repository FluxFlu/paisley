const fs = require("node:fs");

const fileData = {
    currentFile: "",
    entryPoint: "",
};

function getCurrentFile() {
    return fileData.currentFile;
}

function setCurrentFile(file) {
    fileData.currentFile = file;
}

function getOriginalFile() {
    return fileData.entryPoint;
}

function setOriginalFile(file) {
    fileData.entryPoint = file;
}

let fileReader;
function overwriteFileReader(map) {
    fileReader = map;
}

function getRawFile(filename) {
    if (fileReader) {
        return fileReader.get(filename);
    }
    return fs.readFileSync(filename, "utf-8")
        .replaceAll("\r\n", "\n")
        .replaceAll("\r", "\n");
}

module.exports = {
    getCurrentFile, setCurrentFile,
    getOriginalFile, setOriginalFile,
    getRawFile, overwriteFileReader,
};