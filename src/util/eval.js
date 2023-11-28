const {
    Color,
    space,
    constructError, constructLineCheck,
    surroundingBlock, lastRealLine,
    calcList, lineNum, emptyLine, quoteLine, quoteFormat, helpLine,
    insertLine, insertLineFormat,
    replaceLine, replaceLines,
    formatPath, relativeFormatPath
} = require("../error");

const { getCompilerFlag, getRawFile, getCurrentFile, getOriginalFile, setErrorLogged, logCompilerError, printAborting, getDirOf } = require("../../paisley");

const fs = require("node:fs");
const path = require("node:path");

const { traverseDir } = require("../error_utils/fileUtils");
const { spellCheck } = require("../error_utils/spellCheck");

function evaluate(code) {
    return eval(code);
}

module.exports = { evaluate }