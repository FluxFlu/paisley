const { logError } = require("../error/error");
const { evaluate } = require("../utils/eval");
const { handleDefinitions, endFormat } = require("./sub_definitions");
const { token, nonValue } = require("./tokenizer");

function cook(filename, file) {
    for (let i = 0; i < file.length; i++) {
        const currentToken = file[i];
        const firstToken = file[i].copy();
        if (currentToken.value == "$" && file[i + 1] && file[i + 1].value == "<") {
            let braceCount = 1;
            let toCook = [file.splice(i, 2)[1]];
            while (braceCount && file[i]) {
                if (
                    file[i].value == "<" &&
                    (
                        (
                            toCook.length &&
                            nonValue[toCook.at(-1).type] &&
                            toCook.at(-1).value != ")"
                        ) ||
                        !file[+i + 1] ||
                        ( nonValue[file[+i + 1].type] && file[+i + 1].value != "(" )
                    )
                ) {
                    braceCount++;
                } else if (
                    file[i].value == ">" &&
                    (
                        (
                            toCook.length &&
                            nonValue[toCook.at(-1).type] &&
                            toCook.at(-1).value != ")"
                        ) ||
                        !file[+i + 1] ||
                        ( nonValue[file[+i + 1].type] && file[+i + 1].value != "(" )
                    )
                ) {
                    braceCount--;
                }
                toCook.push(file.splice(i, 1)[0]);
            }
            if (!file[i]) {
                for (let i = 0; i < toCook.length; i++) {
                    file.push(toCook[i]);
                }
                logError("terminate_while_cooking", file, firstToken);
            }
            const lastToken = file[i].copy();

            toCook = toCook.slice(1, -1);
            toCook = handleDefinitions(filename, toCook)
                .map(e => e.value)
                .join(" ");
            try {
                const out = evaluate(toCook);
                file.splice(i, 0, token("CookedValue", endFormat(out), firstToken.line, firstToken.character));
            } catch (e) {
                firstToken.character += 2;
                lastToken.character--;
                logError("failure_to_cook", firstToken, lastToken, e);
            }
        }
    }
    return file;
}

module.exports = { endFormat, nonValue, cook };