const validTypes = { Identifier: true, RegExp: true, Number: true, BigInt: true, Operator: true, Separator: true, String: true, Variable: true, PostFlag: true, CookedValue: true, TokenGroup: true };

function finalize (filename, file) {
    let final = "";
    for (let i in file) {
        const token = file[i];

        if (validTypes[token.type]) final += token.value;
        if (token.value == "\n" && final.at(-1) != "\n" && final) final += "\n";
        if (token.type == "Identifier") final += " ";
    }
    return final;
}

module.exports = { finalize, validTypes };