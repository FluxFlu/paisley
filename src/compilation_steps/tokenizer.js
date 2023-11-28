const { logError } = require("../error");
const { token } = require("../util/token");
const { parseDestructure } = require("./tokenizer/parse_destructure");

const operatorList = ["(", ")", "#", "=>", "==>", "+", "-", "=", "*", "**", "/", "~", "^", "|", "&", "<<", ">>", ">>>", "%", "||", "&&", "++", "--", "!", "{", "}", "<", ">", "<=", ">=", "!==", "===", "==", "!=", "+=", "-=", "*=", "/=", "%=", "**=", "||=", ",", "&&=", "^=", "&=", "|=", ">>=", ">>>=", "<<=", ":", "[", "]", "$"];

const variables = {};

const nonValue = { Operator: true, Separator: true, LineBreak: true };

function isOperatorCharacter(str) {
    return str.match(/[#(){}[\].+=\-*/~^%!&|,<>:$]/);
}

function Tokenize(filename, string) {
    let templateBrack = 0;
    const tokens = [];
    let currentToken = "";
    let literal;
    let lineBreaks = 0;
    let character = 0;
    let commented = false;
    let currentDirective = null;
    let directiveBraces = 0;

    variables[filename] = {};
    for (let i = 0; i < string.length; i++) {
        if (string[i] == "\n") {
            lineBreaks++;
            character = 0;
            tokens.push(token("LineBreak", "\n", lineBreaks, 0));
            if (!directiveBraces)
                currentDirective = null;
            continue;
        }

        if (string[i] == "/" && string[i + 1] == "*") {
            commented = true;
            i++;
            character += 2;
            continue;
        }
        if (string[i] == "*" && string[i + 1] == "/") {
            commented = false;
            i++;
            character += 2;
            continue;
        }
        if (commented) {
            character++;
            continue;
        }

        if (templateBrack && string[i] == "{") templateBrack++;
        if (templateBrack && string[i] == "}") templateBrack--;

        if (string[i] == "\"" || string[i] == "'" || string[i] == "`") {
            literal = string[i];
            currentToken = string[i];
            const startPos = i;
            let characterOffset = 1;
            i++;
            while (string[i] && !(string[i] === literal && string[i - 1] !== "\\")) {
                characterOffset++;
                if (literal == "`" && string[i] == "$" && string[i + 1] == "{") {
                    if (i - 1 != startPos) {
                        tokens.push(token("String", currentToken + "`", lineBreaks, character));
                        tokens.push(token("Operator", "+", lineBreaks, ++character + characterOffset));
                    }
                    tokens.push(token("Operator", "(", lineBreaks, character + characterOffset));
                    i += 2;
                    break;
                }
                currentToken += string[i];
                i++;
            }
            if (!string[i]) {
                logError("terminate_while_string", { value: currentToken, line: lineBreaks, character });
            } else if (string[i] == literal) {
                tokens.push(token("String", currentToken + literal, lineBreaks, ++character));
                literal = null;
            } else {
                i--;
            }
            character += characterOffset;
            continue;
        } else if (literal == "`" && !templateBrack && string[i] == "}") {
            let characterOffset = 1;

            tokens.push(token("Operator", ")", lineBreaks, character));
            if (string[i + 1] == "`") {
                templateBrack = 0;
                literal = null;
                i++;
                continue;
            }
            if (string[i + 1] !== "$")
                tokens.push(token("Operator", "+", lineBreaks, character));
            currentToken = "`";
            literal = "`";
            i++;
            while (string[i] !== "`" && string[i]) {
                characterOffset++;
                if (string[i] == "$" && string[i + 1] == "{") {
                    tokens.push(token("String", currentToken + "`", lineBreaks, character));
                    tokens.push(token("Operator", "+", lineBreaks, ++character + characterOffset));
                    tokens.push(token("Operator", "(", lineBreaks, character + characterOffset));
                    i += 2;
                    break;
                }
                currentToken += string[i];
                i++;
            }
            if (!string[i]) {
                logError("terminate_while_string", { value: currentToken, line: lineBreaks, character });
            } else if (string[i] == "`") {
                tokens.push(token("String", currentToken + "`", lineBreaks, ++character));
                literal = null;
            } else {
                i--;
            }
            character += characterOffset;
            continue;
        } else if (
            string[i].match(/[0-9-.]/) &&
            (
                string[i + 1].match(/[0-9_]/) ||
                (
                    string[i] != "-" &&
                    string[i] != "."
                ) ||
                (
                    string[i] == "-" &&
                    string[i + 1].match(/[0-9_.]/)
                )
            ) ||
            string[i] == "0" &&
            string[i + 1].match(/[box]/)
        ) {
            currentToken = "";
            let characterOffset = 0;
            let dotCheck = false;
            if (string[i] == "-") {
                i++;
                currentToken += "-";
                characterOffset++;
            }
            let baseType;
            if (string[i] == "0" && string[i + 1] == "b" || string[i + 1] == "o" || string[i + 1] == "x") {
                i++;
                baseType = string[i++];
            }
            if (string[i] == ".") {
                i++;
                currentToken += ".";
                characterOffset++;
                dotCheck = true;
            }
            while (string[i] && (string[i].match(/[0-9_]/) || baseType == "x" && string[i].match(/[0-9a-fA-F_]/)) || string[i] == "." && !dotCheck) {
                if (string[i] == ".")
                    dotCheck = true;
                currentToken += string[i];
                characterOffset++;
                i++;
            }
            let type = "Number";
            if (baseType) {
                currentToken = parseInt(currentToken.replaceAll("_", ""), baseType == "x" ? 16 : baseType == "o" ? 8 : 2).toString();
            }
            if (string[i] == "n" && !dotCheck) {
                currentToken += "n";
                i++;
                type = "BigInt";
            }
            tokens.push(token(type, currentToken, lineBreaks, character));
            character += characterOffset;
            i--;
            continue;
        } else if (string[i] == ";") {
            tokens.push(token("Separator", ";", lineBreaks, character));
        } else if (string[i].match(/[A-Za-z_]/)) {
            currentToken = "";
            let characterOffset = 0;
            while (string[i] && string[i].match(/[A-Za-z_0-9]/)) {
                currentToken += string[i];
                characterOffset++;
                i++;
            }
            tokens.push(token("Identifier", currentToken, lineBreaks, character));
            character += characterOffset;
            i--;
            continue;
        } else if (
            string[i] == "/" &&
            !(
                tokens.at(-1).value == ")" &&
                tokens.at(-1).type == "Operator" ||

                !nonValue[tokens.at(-1).type]
            ) &&
            currentDirective !== "require"
        ) {
            currentToken = "/";
            let characterOffset = 0;
            i++;
            let squareBraces = 0;
            for (; string[i] && !(!squareBraces && string[i] == "/" && string[i - 1] != "\\"); i++) {
                if (string[i] == "[") squareBraces++;
                if (string[i] == "]") squareBraces--;
                currentToken += string[i];
                characterOffset++;
            }
            if (!string[i]) {
                logError("terminate_while_regex", { value: currentToken, line: lineBreaks, character });
            }
            currentToken += "/";
            i++;
            while (string[i] && string[i].match(/[a-z]/)) {
                currentToken += string[i];
                characterOffset++;
                i++;
            }

            let outToken = token("RegExp", currentToken, lineBreaks, character);

            try {
                global.eval(currentToken);
            } catch (error) {
                logError("invalid_regex", outToken, error);
            }

            i--;

            tokens.push(outToken);
            character += characterOffset;
            continue;
        } else if (isOperatorCharacter(string[i])) {
            currentToken = "";
            let characterOffset = 0;
            if (string[i] == "#" && (!tokens.length || tokens.at(-1).type == "LineBreak")) {
                let j = i + 1;
                let str = "";
                while (string[j] && string[j].match(/[A-Za-z_]/)) {
                    str += string[j];
                    j++;
                }
                if (str)
                    currentDirective = str;
            }
            if (currentDirective) {
                if (string[i] == "[") {
                    directiveBraces++;
                }
                if (string[i] == "]") {
                    directiveBraces--;
                }
            }
            while (string[i] && isOperatorCharacter(string[i])) {
                currentToken += string[i];
                characterOffset++;
                i++;
                if (!operatorList.includes(currentToken + string[i]))
                    break;
            }
            tokens.push(token("Operator", currentToken, lineBreaks, character));
            character += characterOffset;
            i--;
            continue;
        }
        character++;
    }
    for (let i = 0; i < tokens.length; i++) {
        if (tokens[i].value == "let" || tokens[i].value == "const" || tokens[i].value == "var" || tokens[i].value == "class" || tokens[i].value == "function") {
            let variableType = tokens[i].value;
            const addVariable = variableToken => {
                if (variables[filename][variableToken.value])
                    return;
                variables[filename][variableToken.value] = token(variableType, variableToken.value, variableToken.line, variableToken.character);
            };
            i++;
            if (variableType == "class" || variableType == "function") {
                addVariable(tokens[i]);
                continue;
            }
            if (tokens[i].type == "Identifier") {
                while (tokens[i].type == "Operator" && tokens[i].value == "," || tokens[i].type == "Identifier") {
                    if (tokens[i].type == "Identifier")
                        addVariable(tokens[i]);
                    i++;
                }
            } else if (tokens[i].type == "Operator" && (tokens[i].value == "[" || tokens[i].value == "{")) {
                i = parseDestructure(tokens, i, addVariable);
            }
        }
    }

    tokens.forEach(e => e.value = String(e.value));
    return tokens;
}


module.exports = { Tokenize, operatorList, token, variables, nonValue };