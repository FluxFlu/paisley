const terminateCharacters = { ";": true };

const slightTerminateCharacters = { ")": true, ",": true };

const { logError } = require("../error/error");
const { token } = require("./tokenizer");

function handleEarlyFunctions(filename, file) {
    let currentEarlyFunction = 0;
    for (let i in file) {
        if (file[i].value == "==>" && file[i].type == "Operator") {
            const originalToken = file[i];
            file.splice(i, 1);
            const curr = [ ];
            i--;
            if (file[i].value == ")") {
                const firstToken = file[i];
                let braceCount = -1;
                for (curr.push(file.splice(i--, 1)[0]); braceCount; i--) {
                    if (!file[i]) {
                        logError("unbalanced_lambda_braces", firstToken);
                    }
                    if (file[i].value == "(") {
                        braceCount++;
                    } else if (file[i].value == ")") {
                        braceCount--;
                    }
                    curr.unshift(file.splice(i, 1)[0]);
                }
                i++;
            } else {
                curr.push(file.splice(i, 1)[0]);
            }
            curr.push(token("Operator", "=>"));
            const firstToken = file[i];
            if (file[i].value == "{") {
                let braceCount = 1;
                curr.push(file.splice(i, 1)[0]);
                while (braceCount) {
                    if (!file[i]) {
                        logError("unbalanced_lambda_braces", firstToken);
                    }
                    if (file[i].value == "{") {
                        braceCount++;
                    } else if (file[i].value == "}") {
                        braceCount--;
                    }
                    curr.push(file.splice(i, 1)[0]);
                }
            } else {
                let braceCount = 0;
                while (!(terminateCharacters[file[i].value] || slightTerminateCharacters[file[i].value] && !braceCount)) {
                    if (!file[i]) {
                        logError("unbalanced_lambda_braces", firstToken);
                    }
                    if (file[i].value == "(") {
                        braceCount++;
                    } else if (file[i].value == ")") {
                        braceCount--;
                    }
                    curr.push(file.splice(i, 1)[0]);
                }
            }
            file.splice(i, 0, token("Identifier", "paisley_early_fn_" + currentEarlyFunction, originalToken.line, originalToken.character));
            let fnLocation = 0;
            for (let j = 0; j < file.length; j++) {
                if (file[j].type == "CompilerValue" && file[j].value == "fnLocation") {
                    fnLocation = j;
                    break;
                }
            }
            file.splice(fnLocation, 0, token("LineBreak", "\n"));
            file.splice(fnLocation + 1, 0, token("Identifier", "const"));
            file.splice(fnLocation + 2, 0, token("Identifier", "paisley_early_fn_" + currentEarlyFunction++));
            file.splice(fnLocation + 3, 0, token("Operator", "="));
            file.splice(fnLocation + 4, 0, curr);
            file.splice(fnLocation + 5, 0, token("Separator", ";"));
            file = file.flat();
        }
    }
    return file;
}

module.exports = { handleEarlyFunctions };