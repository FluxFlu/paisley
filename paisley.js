#!/usr/bin/env node

/*
 *  `Paisley` is a grindy precompiler for Javascript.
 *   Copyright (C) 2023  Missy "FluxFlu"
 *
 *   This program is free software: you can redistribute it and/or modify
 *   it under the terms of the GNU General Public License as published by
 *   the Free Software Foundation, either version 3 of the License, or
 *   (at your option) any later version.
 *
 *   This program is distributed in the hope that it will be useful,
 *   but WITHOUT ANY WARRANTY; without even the implied warranty of
 *   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *   GNU General Public License for more details.
 *
 *   You should have received a copy of the GNU General Public License
 *   along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const compilerFlags = {
    "type": "node",
    "make-script": "false",
    "ignore-early-fn-name-check": "false",
    "use-abnormal-filenames": "false",

    "keyboard-layout": "qwerty",
    "typo-threshold": "2",
    "error-threshold": "3",
};

function getCompilerFlag(i) { return compilerFlags[i]; }

function setCompilerFlag(i, f) { compilerFlags[i] = f; }


const fileData = {
    currentFile: "",
    rawText: {},
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

function getRawFile(filename) {
    return fileData.rawText[filename];
}

function setRawFile(filename, data) {
    fileData.rawText[filename] = data;
}

const FILE_EXTENSION = ".sly";

const fs = require("node:fs");
const { getErrorLogged } = require("./src/error");

const note = "\x1b[1;29mNote: \x1b[0m";
const usageErrors = {
    "invalid_filename": filename => [
        `Invalid filename "${filename}".`,
        note + "Keep in mind that the filename must be the first argument, and must end in `" + FILE_EXTENSION + "`.",
        note + "You can compile alternative filenames by passing the flag \x1b[1;34m`--use-abnormal-filenames true`\x1b[0;m.",
    ],
    "entry_file_doesnt_exist": filename => [
        `File "${filename}" doesn't exist.`,
    ],
};

function throwUsageError(error, ...args) {
    console.error("\x1b[1;31mUsageError[" + error + "]: \x1b[0m" + usageErrors[error].apply(null, args).join("\n\n") + "\n\nAborting...\n");
    if (getCompilerFlag("throw-for-errors") == "true")
        throw error;
    process.exit(1);
}

function writeFile(name, text) {
    if (getErrorLogged()) return;
    fs.writeFileSync(name, text);
}

module.exports = { FILE_EXTENSION, getCompilerFlag, setCompilerFlag, getCurrentFile, setCurrentFile, getOriginalFile, getRawFile, setRawFile, throwUsageError, writeFile };
if (require.main == module) {
    const { main } = require("./src/main");

    process.exit(main());
}