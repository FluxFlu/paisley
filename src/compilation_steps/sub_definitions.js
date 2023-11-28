const { logError } = require("../error");
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
                    params.at(-1).forEach(e => params.rest.push(e));
                    params.pop();
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
                        file.splice(i++, 0, n.copy());
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
                            file.splice(i++, 0, n.copy());
                        }
                        start--;
                        i--;
                        replacement = true;
                        break;
                    }
                }
                if (!replacement) {
                    if (macro.code.length == i - start + 1)
                        file.splice(i, 0, token(t.type, t.value, finalToken.line, finalToken.character));
                    else
                        file.splice(i, 0, token(t.type, t.value, firstToken.line, firstToken.character));
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
                        break;
                    }
                }
                params.push(file[i]);
            }
            const paramFormat = endFormat(params);
            const toEval = "((" + procedure.param + ") => {" + procedure.code.map(e => e.value).join(" ") + "})(" + paramFormat + ")";
            try {
                const out = eval(toEval);
                file.splice(i, 0, token("CookedValue", endFormat(out), firstToken.line, firstToken.character));
            } catch (e) {
                finalToken.character++;
                logError("procedure_js_error", procedure, firstToken, finalToken, e);
            }
            file.splice(i + 1, 1);
            i--;
        }
    }

    return file;
}

module.exports = { handleDefinitions, endFormat };