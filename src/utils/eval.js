const {
    Color,
    repeat,
    constructError, constructLineCheck,
    surroundingBlock,
    calcList, lineNum, emptyLine, quoteLine, quoteFormat, helpLine,
    insertLine, lineFormat, insertLineFormat,
    replaceLine, replaceLines,
    formatPath, relativeFormatPath
} = require("../error/error");

const { traverseDir } = require("../error/error_utils/fileUtils");
const { spellCheck } = require("../error/error_utils/spellCheck");
const { finalize } = require("../compilation_steps/final");
const { getCompilerFlag } = require("./compiler_flags");
const { getRawFile, getCurrentFile, getOriginalFile } = require("./file_data");

function evaluate(code) {
    return eval(code);
}

module.exports = { evaluate }