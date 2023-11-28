const fs = require("fs");
const { checkInvalidNames } = require("./compilation_steps/check_invalid_names");
const { cook } = require("./compilation_steps/cook");
const { handleEarlyFunctions } = require("./compilation_steps/early_function");
const { finalize } = require("./compilation_steps/final");
const { handleFlag, definitions, publicDefinitions } = require("./compilation_steps/flag");
const { handleDefinitions } = require("./compilation_steps/sub_definitions");
const { Tokenize, token } = require("./compilation_steps/tokenizer");
const { setCurrentFile, logUsageError } = require("../paisley");
const { logError } = require("./error");
const { stripSingleLineComments } = require("./compilation_steps/strip_single_line_comments");

function compile(filename, requireValues) {

    let originalFile;

    try {
        originalFile = fs.readFileSync(filename, "utf-8");
    } catch (e) {
        if (requireValues) {
            logError("required_file_doesnt_exist", filename, requireValues[0]);
            return "";
        }
        logUsageError("entry_file_doesnt_exist", filename);
    }

    originalFile = originalFile
        .replaceAll("\r\n", "\n")
        .replaceAll("\r", "\n");

    setCurrentFile(filename);

    publicDefinitions[filename] = definitions[filename] = {};

    const file = Tokenize(filename, stripSingleLineComments(originalFile));

    checkInvalidNames(file);

    for (let i = 0; i < file.length; i++) {
        const currentToken = file[i];
        if (currentToken.value == "#" && file[i + 1]) {
            const flag = [];
            const back = i;
            let brack = 0;
            while (file[i] && (file[i].type != "LineBreak" || brack)) {
                if (file[i].value == "[") brack++;
                if (file[i].value == "]") brack--;
                flag.push(file.splice(i, 1)[0]);
            }
            const flagOut = handleFlag(compile, filename, flag, i);
            file.splice(back, 0, token(flagOut.isReal ? "PostFlag" : "CompilerValue", flagOut.value, flagOut.line, flagOut.character));
        }
    }

    let preDefinitions = cook(filename, file);
    let postDefinitions = handleDefinitions(filename, preDefinitions.map(e => e.copy()));

    while (postDefinitions.length != preDefinitions.length || postDefinitions.map((e, i) => e.value == preDefinitions[i].value && e.type == preDefinitions[i].type).filter(e => !e).length) {
        preDefinitions = postDefinitions.map(e => e.copy());
        postDefinitions = handleDefinitions(filename, postDefinitions);
    }

    const final = handleEarlyFunctions(filename, cook(filename, postDefinitions));

    return finalize(filename, final);
}

module.exports = { compile };