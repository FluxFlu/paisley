const path = require("node:path");
const crypto = require("crypto");
const { getCompilerFlag, writeFile, setCurrentFile, FILE_EXTENSION, linkNameMap } = require("../../paisley");
const { logError, formatPath } = require("../error");
const { variables } = require("./tokenizer");
const { validTypes } = require("./final");

const definitions = {};
const publicDefinitions = {};
const publicDeclarations = {};


function handleFlag(compile, filename, line) {
    const copyLine = line.map(e => e.copy());
    line.shift();
    if (!line[0]) {
        logError("no_directive", copyLine[0]);
        return { value: 0, final: "" };
    }
    const fn = line.shift().value;
    let realValue = true;
    let flag = line.map(e => e.value);
    let brack = 0;
    const values = [[]];
    let value = 0;
    let final = "";
    for (let i = 0; i < flag.length; i++) {
        if (flag[i] == "[") {
            brack++;
        }
        if (flag[i] == "]") {
            brack--;
        }
        if (validTypes[line[i].type] || line[i].type == "LineBreak")
            values[value].push(line[i]);
        if (!brack) {
            values[value] = values[value].slice(1, -1);
            if (!flag[i + 1])
                break;
            if (values[value].length === 0)
                continue;
            values.push([]);
            value++;
        }
    }
    switch (fn) {
        case "define": {
            const name = line[0];
            if (!line[0]) {
                logError("no_define_name_provided", copyLine[1]);
                break;
            }
            if (values[0].length == 0) {
                logError("no_define_value_provided", line[0], line[1]);
                break;
            }
            definitions[filename][name.value] = { value: name.value, type: "Definition", from: line[0], to: values[0] };
            break;
        }
        case "macro": {
            const name = line[0];
            const params = values[0].map(e => e.value).join("").split(",").map(e => e.trim());
            const code = values[1];
            let rest;
            for (let i = 0; i < params.length; i++) {
                if (params[i].slice(0, 3) == "...") {
                    if (i == params.length - 1)
                        rest = params.pop().slice(3);
                    else
                        logError("invalid_rest_in_macro", copyLine, i);
                }
            }
            definitions[filename][name.value] = { value: name.value, type: "Macro", from: name, params, rest, code };
            break;
        }
        case "procedure": {
            const name = line[0];
            const param = values[0][0].value;
            const code = values[1];
            definitions[filename][name.value] = { value: name.value, type: "Procedure", from: name, param, code };
            break;
        }
        case "export": {
            flag = flag.join("").slice(1, -1).split(",");

            const realVariables = Object.entries(variables[filename]).filter(e => flag.includes(e[1].value)).map(e => e[0]);
            if (realVariables.length) {
                switch (getCompilerFlag("type")) {
                    case "commonjs": {
                        final += "module.exports={";
                        let i = 0;
                        while (i < realVariables.length - 1) final += realVariables[i++] + ",";
                        final += realVariables.at(-1);
                        final += "}";
                        break;
                    }
                    case "ecmascript": {
                        final += "export {";
                        let i = 0;
                        while (i < realVariables.length - 1) final += realVariables[i++] + ",";
                        final += realVariables.at(-1);
                        final += "}";
                        break;
                    }
                    case "link": {
                        final += linkNameMap.get(filename.replaceAll(FILE_EXTENSION, ".js")) + "={";
                        let i = 0;
                        while (i < realVariables.length - 1) final += realVariables[i++] + ",";
                        final += realVariables.at(-1);
                        final += "}";
                        break;
                    }
                }
            }
            publicDefinitions[filename] = Object.fromEntries(Object.entries(definitions[filename]).filter(e => flag.includes(e[1].value)));
            const out = {};
            Object.keys(definitions[filename]).forEach(key => out[key] = definitions[filename][key]);
            Object.keys(variables[filename]).forEach(key => out[key] = variables[filename][key]);
            publicDeclarations[filename] = Object.fromEntries(Object.entries(out).filter(e => flag.includes(e[1].value)));

            break;
        }
        case "require": {
            const requires = flag.join("").split("from");
            const include = requires[0].slice(1, -1).split(",");
            let relativePath = requires[1].slice(1, -1);
            if (!path.extname(relativePath))
                relativePath = relativePath + ".sly";
            const from = path.join(path.dirname(filename), relativePath);
            const to = from.replaceAll(FILE_EXTENSION, ".js");

            linkNameMap.set(to, "_" + crypto.randomBytes(6).toString("hex"));
            
            writeFile(to, compile(from, [copyLine]));
            setCurrentFile(filename);

            if (!publicDeclarations[from])
                publicDeclarations[from] = {};
            if (!publicDefinitions[from])
                publicDefinitions[from] = {};
            if (!variables[from])
                variables[from] = {};
            if (!definitions[from])
                definitions[from] = {};

            const allDeclarationNames = Object.keys(publicDeclarations[from]);
            const allDeclarations = Object.fromEntries(Object.entries(variables[from]).concat(Object.entries(definitions[from])));
            for (let i = 0; i < include.length; i++) {
                if (!allDeclarationNames.includes(include[i])) {
                    logError("include_nonreal_variable", from, include[i], copyLine, publicDeclarations[from], allDeclarations);
                }
            }

            const fakeVariables = Object.fromEntries(Object.entries(publicDefinitions[from]).filter(e => include.includes(e[0])));

            const fakeKeys = Object.keys(fakeVariables);
            for (let i = 0; i < fakeKeys.length; i++)
                definitions[filename][fakeKeys[i]] = fakeVariables[fakeKeys[i]];

            const realVariables = include.filter(e => !publicDefinitions[from][e]);

            if (realVariables.length) {
                switch (getCompilerFlag("type")) {
                    case "commonjs": {
                        final += "const{";
                        let i = 0;
                        while (i < realVariables.length - 1) final += realVariables[i++] + ",";
                        final += realVariables.at(-1);
                        final += "}=require(\"" + formatPath(relativePath.replaceAll(FILE_EXTENSION, ".js")) + "\");";
                        break;
                    }
                    case "ecmascript": {
                        final += "import {";
                        let i = 0;
                        while (i < realVariables.length - 1) final += realVariables[i++] + ",";
                        final += realVariables.at(-1);
                        final += "} from \"" + formatPath(relativePath.replaceAll(FILE_EXTENSION, ".js")) + "\"";
                        break;
                    }
                    case "link": {
                        final += "const {";
                        let i = 0;
                        while (i < realVariables.length - 1) final += realVariables[i++] + ",";
                        final += realVariables.at(-1);
                        final += "} = " + linkNameMap.get(to);
                    }
                }
            }
            break;
        }
        case "fn_location": {
            final = "FN_LOCATION";
            realValue = false;
            break;
        }
        // case "with": {
        //     switch (getCompilerFlag("type")) {
        //         case "commonjs": {
        //             final = "#!" + flag.slice(1, -1).join(" ")
        //                 .replaceAll("/ ", "/")
        //                 .replaceAll(" /", "/");
        //             break;
        //         }
        //     }
        //     break;
        // }
    }

    return { value: final, isReal: realValue };
}

module.exports = { handleFlag, definitions, publicDefinitions, validTypes };