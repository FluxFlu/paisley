const path = require("path");
const { getCompilerFlag, getRawFile } = require("../../paisley");

const validTypes = { Identifier: true, RegExp: true, Number: true, BigInt: true, Operator: true, Separator: true, String: true, Variable: true, PostFlag: true, CookedValue: true, TokenGroup: true };

const terminators = {
    ";": true,
    "\n": true,
    "{": true,
    "[": true,
    "(": true,
    ",": true,
};

const lineStart = {
    ";": true,
    "\n": true,
    "}": true,
    "]": true,
    ")": true,
    ",": true,
};

const seperatedOperators = new Map([
    ["+", [
        "+",
    ]],
    ["-", [
        "-",
    ]]
]);

function finalize(filename, file) {
    let final = "";
    const locationMap = {};
    const reverseLocationMap = {};
    let line = 4;
    let character = 0;
    for (let i = 0; i < file.length; i++) {
        const token = file[i];

        if (validTypes[token.type]) {
            locationMap[token.line + ":" + token.character] = line + ":" + character;
            reverseLocationMap[line + ":" + character] = token.line + ":" + token.character;
            final += token.value;
            if (token.value.length)
                character += token.value.length;
        }
        if (
            token.value == "\n" &&
            final &&
            file[i + 1] &&
            (
                !terminators[final.at(-1)] &&
                !lineStart[file[i + 1].value]
            )
        ) {
            final += "\n";
            character = 0;
            line++;
        }
        if (token.type == "Identifier" && file[i + 1] && file[i + 1].type == "Identifier") {
            final += " ";
            character++;
        }
        if (token.type == "Operator" && file[i + 1] && file[i + 1].type == "Operator" &&
            seperatedOperators.has(token.value) && seperatedOperators.get(token.value).includes(file[i + 1].value)) {
            final += " ";
            character++;
        }
    }
    if (getCompilerFlag("debug") == "true") {
        final = `const paisley_debug_original_file = ${JSON.stringify(getRawFile(filename))}\nconst paisley_debug_token_list = ${JSON.stringify(file)}\nconst paisley_debug_location_map = ${JSON.stringify({ forward: locationMap, reverse: reverseLocationMap })}\nconst paisley_runtime_error = require(${JSON.stringify(path.join(__dirname, "../../runtime/paisley_runtime"))}).logRuntimeError\ntry{${final}}catch(e){paisley_runtime_error({originalFile:paisley_debug_original_file,tokenList:paisley_debug_token_list,locationMap:paisley_debug_location_map,error:e},e)}`;
    }
    return final;
}

module.exports = { finalize, validTypes };