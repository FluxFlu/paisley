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
    for (let i = 0; i < file.length; i++) {
        const token = file[i];

        if (validTypes[token.type]) final += token.value;
        if (
            token.value == "\n" &&
            final &&
            file[i + 1] &&
            (
                !terminators[final.at(-1)] &&
                !lineStart[file[i + 1].value]
            )
        )
            final += "\n";
        if (token.type == "Identifier" && file[i + 1] && file[i + 1].type == "Identifier")
            final += " ";
        if (token.type == "Operator" && file[i + 1] && file[i + 1].type == "Operator" &&
            seperatedOperators.has(token.value) && seperatedOperators.get(token.value).includes(file[i + 1].value))
            final += " ";
    }
    return final;
}

module.exports = { finalize, validTypes };