const path = require("path");
const { Color, space, constructError, constructLineCheck, surroundingBlock, lastRealLine, insertLine, replaceLine, formatPath, readErrorList, errors, parseErrorPosition } = require("../src/error");
const { logCompilerError, FILE_EXTENSION, getCurrentFile } = require("../paisley");
const { Tokenize } = require("../src/compilation_steps/tokenizer");

const errMap = {
    "not_a_function": e => e.includes("is not a function"),
    "not_nonnull_object": e => e.includes("Property description must be an object") || e.includes("Invalid value used in weak set")
}

let errorListRead = false;
function logRuntimeError(context, error) {
    if (!errorListRead) {
        readErrorList(path.join(__dirname, "errors"));
        errorListRead = true;
    }
    const values = Object.values(errMap);
    const originalError = error;
    for (let i = 0; i < values.length; i++) {
        if (values[i](error.toString())) {
            error = Object.keys(errMap)[i];
            break;
        }
    }
    if (error == originalError) {
        throw error;
    }
    if (!errors[error]) {
        logCompilerError("invalid_error", null, error);
        return;
    }
    context.tokenList = Tokenize(getCurrentFile(), context.originalFile);
    const errorText = errors[error](context);
    console.error(Color.darkRed + "RuntimeError[" + error + "]: " + Color.reset + errorText[1] + "\n# " + formatPath(path.relative(process.cwd(), path.normalize(module.parent.filename.replaceAll(".js", FILE_EXTENSION)))) + errorText[2] + "\n\n" + errorText[3]);
    if (errorText[0]) {
        printAborting();
        process.exit(1);
    }
}

module.exports = { logRuntimeError }