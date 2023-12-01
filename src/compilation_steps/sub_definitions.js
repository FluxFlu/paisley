const { logError } = require("../error");
const { evaluate, emptyWriteValue } = require("../util/eval");
const { finalize } = require("./final");
const { definitions } = require("./flag");
const { token } = require("./tokenizer");

function endFormat(value) {
    switch (typeof value) {
        case "string": {
            return `"${value.replaceAll("\"", "\\\"")}"`;
        }
        case "object": {
            if (value instanceof Array) {
                return "[" + value.map(e => endFormat(e)).join(",") + "]";
            }
            const obj = { ...value };
            return "{" + Object.keys(obj).map(key => endFormat(key) + ":" + endFormat(obj[key])).join(",") + "}";
        }
        case "bigint": {
            return String(value) + "n";
        }
        default: {
            return String(value);
        }

    }
}

function tokenMatch(sets, file, index) {
    for (let set of sets) {
        if (file[index].value == set.from.value && file[index].type == set.from.type)
            return set;
    }
    return 0;
}

function handleDefinitions(filename, file) {
    const sets = Object.values(definitions[filename]).filter(e => e.type == "Definition");
    for (let i = 0; i < file.length; i++) {
        const set = tokenMatch(sets, file, i);
        if (set) {
            file.splice(i, 1);
            let start = i--;
            while (++i - start < set.to.length) {
                const t = set.to[i - start];
                file.splice(i, 0, t.copy());
            }
            i--;
        }
    }

    const macros = Object.values(definitions[filename]).filter(e => e.type == "Macro");
    for (let i = 0; i < file.length; i++) {
        const macro = tokenMatch(macros, file, i);
        if (macro && (!file[i - 1] || file[i - 1].value !== ".")) {
            if (file[i + 1].value !== "(") continue;
            file.splice(i, 2);

            let params = [[]];
            let brack = 1;
            const firstToken = file[i];
            let finalToken;
            for (; brack; file.splice(i, 1)) {
                if (file[i].value == "(") {
                    brack++;
                }
                if (file[i].value == ")") {
                    brack--;
                    if (brack == 0) {
                        finalToken = file[i];
                        break;
                    }
                }
                if (file[i].value == "," && brack == 1) {
                    params.push([]);
                    continue;
                }
                params.at(-1).push(file[i]);
            }
            if (params.length > macro.params.length) {
                params.rest = [token("Operator", "[", firstToken.line, firstToken.character)];
                while (params.length > macro.params.length) {
                    params[0].forEach(e => params.rest.push(e));
                    params.shift();
                    if (params.length !== macro.params.length) {
                        const lastParam = params.rest.at(-1);
                        params.rest.push(token("Operator", ",", lastParam.line, lastParam.character));
                    }
                }
                params.rest.push(token("Operator", "]", finalToken.line, finalToken.character));
            }

            let start = i;
            while (macro.code[i - start]) {
                let t = macro.code[i - start];
                let replacement = false;
                if (t.value == macro.rest) {
                    for (let f = 0; f < params.rest.length; f++) {
                        const n = params.rest[f];
                        start++;
                        const copy = n.copy();
                        copy.macroResult = true;
                        file.splice(i++, 0, copy);
                    }
                    start--;
                    i--;
                    replacement = true;
                }
                for (let j = 0; j < macro.params.length; j++) {
                    const param = macro.params[j];
                    if (t.value == param && params[j]) {
                        for (let f = 0; f < params[j].length; f++) {
                            const n = params[j][f];
                            start++;
                            const copy = n.copy();
                            copy.macroResult = true;
                            file.splice(i++, 0, copy);
                        }
                        start--;
                        i--;
                        replacement = true;
                        break;
                    }
                }
                if (!replacement) {
                    let tokenToAdd = token(t.type, t.value);
                    if (macro.code.length == i - start + 1) {
                        tokenToAdd.line = finalToken.line;
                        tokenToAdd.character = finalToken.character;
                    } else {
                        tokenToAdd.line = firstToken.line;
                        tokenToAdd.character = firstToken.character;
                    }
                    tokenToAdd.macroResult = true;
                    file.splice(i, 0, tokenToAdd);
                }
                i++;
            }
            file.splice(i, 1);
            i--;
        }
    }

    const procedures = Object.values(definitions[filename]).filter(e => e.type == "Procedure");
    for (let i = 0; i < file.length; i++) {
        const procedure = tokenMatch(procedures, file, i);
        if (procedure && (!file[i - 1] || file[i - 1].value !== ".")) {
            if (file[i + 1].value !== "(") continue;
            const firstToken = file[i];
            file.splice(i, 2);

            let params = [];
            let brack = 1;
            let finalToken;
            for (; brack; file.splice(i, 1)) {
                if (file[i].value == "(") {
                    brack++;
                }
                if (file[i].value == ")") {
                    brack--;
                    if (brack == 0) {
                        finalToken = file[i].copy();
                        finalToken.macroResult = true;
                        break;
                    }
                }
                params.push(file[i]);
            }

            const paramFormat = endFormat(params);
            const toEval = "let paramFormat = " + paramFormat + ";" +
                `paramFormat.toString = ()=>${endFormat(paramFormat)};` +
                "((" + procedure.param + ") => {" + finalize(filename, procedure.code) + "})(paramFormat)";

            file.splice(i, 1);
            try {
                const out = evaluate(toEval);
                if (out !== emptyWriteValue)
                    file.splice(i, 0, token("CookedValue", String(out), firstToken.line, firstToken.character));
            } catch (e) {
                finalToken.character++;
                logError("procedure_js_error", procedure, firstToken, finalToken, e);
            }
            i--;
        }
    }

    return file;
}

module.exports = { handleDefinitions, endFormat };