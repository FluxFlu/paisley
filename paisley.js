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
    "docs": null,
    "help": null,

    "type": "node",
    "make-script": "false",
    "ignore-early-fn-name-check": "false",
    "use-abnormal-filenames": "false",
    "throw-for-errors": "false",
    
    "show-docs-error-message": "true",

    "keyboard-layout": "qwerty",
    "typo-threshold": "2",
    "error-threshold": "3",
};

function getCompilerFlag(i) { return compilerFlags[i]; }

function setCompilerFlag(i, f) {
    if (!compilerFlags[i])
        logUsageError("invalid_compiler_flag", i);
    compilerFlags[i] = f;
}


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

let errorLogged = false;

function getErrorLogged() {
    return errorLogged;
}

function setErrorLogged(errorName) {
    errorLogged = errorName;
}

function printAborting() {
    console.error("Use \x1b[1;32mpaisley --docs <errorName>\x1b[0;0m to see relevant documentation for any given error.");
    if (errorLogged && getCompilerFlag("show-docs-error-message") !== "false")
        console.error("For example, \x1b[1;32mpaisley --docs " + errorLogged + "\x1b[0;0m.");
    console.error("\nAborting...\n");
}

const FILE_EXTENSION = ".sly";

let spellCheck;

const note = "\x1b[1;29mNote: \x1b[0m";
const help = "\x1b[1;34mHelp: \x1b[0m";
const quote = "\x1b[0;32m* \x1b[0m";
const usageErrors = {
    "invalid_filename": filename => [
        `Invalid filename "${filename}".`,
        note + "Keep in mind that the filename must be the first argument, and must end in `" + FILE_EXTENSION + "`.",
        note + "You can compile alternative filenames by passing the flag \x1b[1;34m`--use-abnormal-filenames true`\x1b[0;m.",
    ],
    "invalid_compiler_flag": flag => {
        if (!spellCheck)
            spellCheck = require("./src/error_utils/spellCheck").spellCheck;
        const potentialValidFlags = spellCheck(Object.keys(compilerFlags), flag);
        if (potentialValidFlags.length) {
            return [
                `Invalid compiler flag "${flag}".`,
                help + "Did you mean any of the following:",
                quote + potentialValidFlags.join("\n" + quote)
            ];
        }
        return [
            `Invalid compiler flag "${flag}".`
        ];
    },
    "entry_file_doesnt_exist": filename => [
        `File "${filename}" doesn't exist.`,
    ]
};

function logUsageError(error, ...args) {
    if (!usageErrors[error])
        logCompilerError("invalid_error", null, error);
    console.error("\x1b[1;31mUsageError[" + error + "]: \x1b[0m" + usageErrors[error].apply(null, args).join("\n\n") + "\n\nAborting...\n");
    if (getCompilerFlag("throw-for-errors") == "true")
        throw error;
    process.exit(1);
}
const compilerErrors = {
    "generic": () => [
        "An error in the compiler has occured."
    ],
    "invalid_error": errorTag => [
        `Attempted to throw invalid error "${errorTag}".`,
    ],
};

const reportErrorLink = "https://github.com/FluxFlu/paisley/issues";

function logCompilerError(error, originalThrow, ...args) {
    console.error("\x1b[1;31mCompilerError[" + error + "]: \x1b[0m" + compilerErrors[error].apply(null, args).join("\n\n") + "\n\n" + note + `Please report this error at ${reportErrorLink}`);
    // if (getCompilerFlag("throw-for-errors") == "true")
    // console.trace();
    console.log("\nAborting...\n");
    if (originalThrow)
        throw originalThrow;
    else
        process.exit(1);
}

const fs = require("node:fs");
function writeFile(name, text) {
    if (getErrorLogged()) return;
    fs.writeFileSync(name, text);
}

module.exports = {
    FILE_EXTENSION,
    getCompilerFlag, setCompilerFlag,
    getCurrentFile, setCurrentFile,
    getOriginalFile,
    getRawFile, setRawFile,
    getErrorLogged, setErrorLogged,
    logUsageError, logCompilerError, printAborting,
    writeFile,
};

if (require.main == module) {
    const { main } = require("./src/main");
    try {
        process.exit(main());
    } catch (e) {
        logCompilerError("generic", e);
    }
}