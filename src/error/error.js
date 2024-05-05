const fs = require("node:fs");
const path = require("node:path");


function printAborting() {
    console.error("Use " + BOLD_GREEN + "paisley --docs <errorName>" + RESET + " to see relevant documentation for any given error.");
    if (errorLogged && getCompilerFlag("show-docs-error-message") !== "false") {
        console.error("For example, " + BOLD_GREEN + "paisley --docs " + errorLogged + RESET);
    }
}

const { getCompilerFlag } = require("../utils/compiler_flags");
const { getCurrentFile } = require("../utils/file_data");
const { compilerError } = require("./internal_compiler_error");
const { RED, BOLD_RED, GREEN, BOLD_GREEN, BOLD_BLUE, RESET } = require("../utils/colors");

function repeat(num, char) {
    let out = "";
    if (num < 0) {
        num = 0;
    }
    while (num--) {
        out += char;
    }
    return out;
}

const Color = {
    red: RED,
    darkRed: BOLD_RED,
    green: GREEN,
    darkGreen: BOLD_GREEN,
    blue: BOLD_BLUE,
    reset: RESET,
};

function constructError(...args) {
    return args.join("\n") + "\n";
}

function constructLineCheck(token) {
    let out = "";

    if (token.line != undefined) {
        out += `:${token.line + 1}`;
        if (token.character != undefined) {
            out += `:${token.character + 1}`;
        }
    }

    return out;
}

function surroundingBlock(block, line, terminate = true, length = 3) {
    line++;
    if (line - length < 0) {
        length = line;
    }
    if (terminate) { // Whether or not the code block should end at the specified line or if it should be centered around the line
        return [block.split("\n").slice(line - length, line).join("\n"), length - 1];
    } else {
        return [block.split("\n").slice(line - length / 2, line + length / 2).join("\n"), length / 2];
    }
}

let listNum = -1;

let currentError = "";

function calcList(...numbers) {
    numbers.forEach(number => {
        number = (+number + 1).toString().length;
        if (number > listNum) {
            listNum = number;
        }
    });
}

function calcListCheck() {
    if (listNum == -1) {
        compilerError("Function `calcList` was not called when creating the error: [%s].", currentError);
    }
}

function lineNum(number) {
    calcListCheck();
    return Color.blue + `${repeat(listNum - (+number + 1).toString().length + 1, " ")}${number + 1} | ` + Color.reset;
}

function emptyLine() {
    calcListCheck();
    return Color.blue + ` ${repeat(listNum, " ")} | ` + Color.reset;
}

function quoteLine() {
    calcListCheck();
    return Color.darkGreen + ` ${repeat(listNum, " ")} * ` + Color.reset;
}

function helpLine() {
    calcListCheck();
    return Color.blue + ` ${repeat(listNum, " ")} - Help: ` + Color.reset;
}

function quoteFormat(block) {
    return quoteLine() + block.split("\n").join("\n" + quoteLine());
}

function lineFormat(startNumber, block) {
    block = block.trim().split("\n");
    let lineCount = 0;
    let hasPrinted = false;
    for (let i = 0; i < block.length; i++, lineCount++) {
        if (block[i] || hasPrinted) {
            block[i] = lineNum(startNumber + lineCount) + block[i];
            hasPrinted = true;
        } else {
            block.splice(i--, 1);
        }
    }
    return block.join("\n");
}

function insertLine(block, line, toInsert) {
    block = block.split("\n").filter(e => e);
    block.splice(line + 1, 0, toInsert);
    return block.join("\n");
}

function insertLineFormat(startNumber, block, line, toInsert) {
    block = block.split("\n");
    let lineCount = 0;
    let hasPrinted = false;
    for (let i = 0; i < block.length; i++, lineCount++) {
        if (block[i] || hasPrinted) {
            block[i] = lineNum(startNumber - line + lineCount) + block[i];
            hasPrinted = true;
        } else {
            block.splice(i--, 1);
        }
    }
    block.splice(line + 1, 0, emptyLine() + toInsert);
    return block.join("\n");
}

function replaceLine(block, line, replaceWith) {
    block = block.split("\n");
    block[line] = replaceWith(block[line]);
    return block.join("\n");
}

function replaceLines(block, replaceWith) {
    block = block.split("\n");
    block = block.map(line => replaceWith(line));
    return block.join("\n");
}

const errors = {};

function readErrorList(errorDirName) {
    const errorDir = fs.readdirSync(errorDirName);
    errorDir.forEach(errorSubDir => {
        if (path.extname(errorSubDir) == ".json") {
            return;
        }
        const errorNames = fs.readdirSync(path.join(errorDirName, errorSubDir));
        errorNames.forEach(errorName => {
            if (path.extname(errorName) == ".js") {
                errors[errorName.slice(0, -3)] = eval(fs.readFileSync(path.join(errorDirName, errorSubDir, errorName), "utf-8"));
            }
        });
    });
}

function parseErrorPosition(error) {
    error = error.stack.toString().split("\n");
    error.shift();
    while (error[0].split(":").length < 3) {
        error.shift();
    }
    error = error[0];
    const character = +error.slice(error.lastIndexOf(":") + 1, -1) - 1;
    const line = +error.slice(error.slice(0, error.lastIndexOf(":")).lastIndexOf(":") + 1, error.lastIndexOf(":")) - 1;
    return { line, character };
}

function formatPath(str) {
    return "./" + path.normalize(str).replaceAll(path.win32.sep, path.posix.sep);
}

function relativeFormatPath(str) {
    return formatPath(path.relative(path.dirname(getCurrentFile()), str));
}


let errorLogged = false;

function getErrorLogged() {
    return errorLogged;
}

function setErrorLogged(errorName) {
    errorLogged = errorName;
}

let errorListRead = false;
function logError(error, ...args) {
    if (!errorListRead) {
        readErrorList(path.join(__dirname, "errors"));
        errorListRead = true;
    }
    currentError = error;
    if (!errors[error]) {
        compilerError("Invalid error [%s].", error);
        return;
    }
    const errorText = errors[error].apply(null, args);
    console.error(Color.darkRed + "Error[" + error + "]: " + Color.reset + errorText[1] + "\n# " + formatPath(getCurrentFile()) + errorText[2] + "\n\n" + errorText[3]);
    setErrorLogged(error);
    if (errorText[0]) {
        process.exit(1);
    }
}

Error.log = (error, errorText) => {
    console.error(Color.darkRed + "Error[" + error + "]: " + Color.reset + errorText[1] + "\n# " + formatPath(getCurrentFile()) + errorText[2] + "\n\n" + errorText[3]);
    if (errorText[0]) {
        console.log("Aborting...\n");
        process.exit(1);
    }
};

module.exports = {
    printAborting,
    logError,
    readErrorList,

    Color,
    repeat,
    constructError, constructLineCheck,
    surroundingBlock,
    calcList, lineNum, emptyLine, quoteLine, quoteFormat, helpLine,
    insertLine, lineFormat, insertLineFormat,
    replaceLine, replaceLines,
    formatPath, relativeFormatPath,

    getErrorLogged,

    parseErrorPosition,
    errors
};