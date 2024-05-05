const path = require("path");
const { Color, repeat, constructError, constructLineCheck, surroundingBlock, insertLine, replaceLine, formatPath, readErrorList, errors, parseErrorPosition } = require("../src/error/error");
const { Tokenize } = require("../src/compilation_steps/tokenizer");
const { compilerError } = require("../src/error/internal_compiler_error");
const { getCurrentFile } = require("../src/utils/file_data");
const { FILE_EXTENSION } = require("../src/utils/file_extension");

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
        compilerError("Invalid error [%s].", error);
        return;
    }
    context.tokenList = Tokenize(getCurrentFile(), context.originalFile);
    context.filename = path.relative(process.cwd(), path.normalize(module.parent.filename.replaceAll(".js", FILE_EXTENSION)));
    const errorText = errors[error](context);
    console.error(Color.darkRed + "RuntimeError[" + error + "]: " + Color.reset + errorText[1] + "\n" + errorText[2] + "\n" + errorText[3]);
    if (errorText[0]) {
        printAborting();
        process.exit(1);
    }
}

module.exports = { logRuntimeError }