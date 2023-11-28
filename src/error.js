const fs = require("node:fs");
const path = require("node:path");

const { getCompilerFlag, getRawFile, getCurrentFile, getOriginalFile, setErrorLogged, logCompilerError, printAborting } = require("../paisley");
const { traverseDir } = require("./error_utils/fileUtils");
const { spellCheck } = require("./error_utils/spellCheck");

function repeat(num, char) {
    let out = "";
    if (num < 0) num = 0;
    while (num--) out += char;
    return out;
};

const Color = {
    red: "\x1b[0;31m",
    darkRed: "\x1b[1;31m",
    green: "\x1b[0;32m",
    darkGreen: "\x1b[1;32m",
    blue: "\x1b[1;34m",
    reset: "\x1b[0m",
};

function constructError(...args) {
    return args.join("\n") + "\n";
}

function constructLineCheck(token) {
    let out = "";

    if (token.line != undefined)
        out += `:${token.line + 1}`;
    if (token.character != undefined)
        out += `:${token.character + 1}`;

    return out;
}

function surroundingBlock(block, line, terminate = true, length = 3) {
    line++;
    if (line - length < 0)
        length = line;
    if (terminate) // Whether or not the code block should end at the specified line or if it should be centered around the line
        return [block.split("\n").slice(line - length, line).join("\n"), length - 1];
    else
        return [block.split("\n").slice(line - length / 2, line + length / 2).join("\n"), length / 2];
}

// function lastRealLine(block, line) {
//     const blockLines = block.split("\n");
//     for (let i = line - 1; ; i--) {
//         if (i < 0)
//             return -1;
//         if (blockLines[i].match(/\S/))
//             return i;
//     }
// }

let listNum = -1;

let currentError = "";

function calcList(...numbers) {
    numbers.forEach(number => {
        number = (+number + 1).toString().length;
        if (number > listNum)
            listNum = number;
    });
}

function calcListCheck() {
    if (listNum == -1) throw "\x1b[1;31mYou forgot to call calcList when creating the error: " + currentError + ".\x1b[0m";
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
    block = block.split("\n");
    let lineCount = 0;
    let hasPrinted = false;
    for (let i = 0; i < block.length; i++, lineCount++) {
        if (block[i] || hasPrinted) {
            block[i] = lineNum(startNumber + lineCount) + block[i];
            hasPrinted = true;
        } else
            block.splice(i--, 1);
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
        } else
            block.splice(i--, 1);
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
    errorDir = fs.readdirSync(errorDirName);
    for (let errorSubDir of errorDir) {
        if (path.extname(errorSubDir) == ".json") continue;
        const errorNames = fs.readdirSync(path.join(errorDirName, errorSubDir));
        for (let errorName of errorNames) {
            if (path.extname(errorName) == ".js") {
                errors[errorName.slice(0, -3)] = eval(fs.readFileSync(path.join(errorDirName, errorSubDir, errorName), "utf-8"));
            }
        }
    }
}

function parseErrorPosition(error) {
    error = error.stack.toString().split("\n");
    error.shift();
    while (error[0].split(":").length < 3) error.shift();
    error = error[0];
    const character = +error.slice(error.lastIndexOf(":") + 1, -1) - 1;
    const line = +error.slice(error.slice(0, error.lastIndexOf(":")).lastIndexOf(":") + 1, error.lastIndexOf(":")) - 1;
    return { line, character }
}

function formatPath(str) {
    return "./" + path.normalize(str).replaceAll(path.win32.sep, path.posix.sep);
}

function relativeFormatPath(str) {
    return formatPath(path.relative(path.dirname(getCurrentFile()), str));
}

let errorListRead = false;
function logError(error, ...args) {
    if (!errorListRead) {
        readErrorList(path.join(__dirname, "errors"));
        errorListRead = true;
    }
    currentError = error;
    if (!errors[error]) {
        logCompilerError("invalid_error", null, error);
        return;
    }
    const errorText = errors[error].apply(null, args);
    console.error(Color.darkRed + "Error[" + error + "]: " + Color.reset + errorText[1] + "\n# " + formatPath(getCurrentFile()) + errorText[2] + "\n\n" + errorText[3]);
    setErrorLogged(error);
    if (getCompilerFlag("throw-for-errors") == "true")
        throw error;
    if (errorText[0]) {
        printAborting();
        process.exit(1);
    }
}

Error.log = (error, errorText) => {
    console.error(Color.darkRed + "Error[" + error + "]: " + Color.reset + errorText[1] + "\n# " + formatPath(getCurrentFile()) + errorText[2] + "\n\n" + errorText[3]);
    if (errorText[0]) {
        console.log("Aborting...\n");
        process.exit(1);
    }
}

module.exports = {
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

    parseErrorPosition,
    errors
};