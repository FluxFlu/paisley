const {
    Color,
    repeat,
    constructError, constructLineCheck,
    surroundingBlock,
    calcList, lineNum, emptyLine, quoteLine, quoteFormat, helpLine,
    insertLine, lineFormat, insertLineFormat,
    replaceLine, replaceLines,
    formatPath, relativeFormatPath
} = require("../error");

const { getCompilerFlag, getRawFile, getCurrentFile, getOriginalFile } = require("../../paisley");

const { traverseDir } = require("../error_utils/fileUtils");
const { spellCheck } = require("../error_utils/spellCheck");

const emptyWriteValue = Symbol();
const writeEmpty = () => emptyWriteValue;

function evaluate(code) {
    return eval(code);
}

module.exports = { evaluate, emptyWriteValue }