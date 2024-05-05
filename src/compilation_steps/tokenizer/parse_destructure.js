function parseDestructure(tokens, i, addVariable) {
    const objStack = [];
    let squareBraces = 0;
    let curlyBraces = 0;
    let currentlyObj = false;
    while (i < tokens.length) {
        if (tokens[i].type == "Operator") {
            if (tokens[i].value == "[") {
                squareBraces++;
                objStack.push(currentlyObj);
                currentlyObj = false;
            } else if (tokens[i].value == "]") {
                squareBraces--;
                currentlyObj = objStack.pop();
            } else if (tokens[i].value == "{") {
                curlyBraces++;
                objStack.push(currentlyObj);
                currentlyObj = true;
            } else if (tokens[i].value == "}") {
                curlyBraces--;
                currentlyObj = objStack.pop();
            }
        }
        if (!(squareBraces | curlyBraces)) {
            break;
        }

        if (
            tokens[i].type == "Identifier" &&
            tokens[i + 1] &&
            tokens[i + 1].value !== ":" &&
            (
                tokens[i - 1] &&
                tokens[i - 1].value !== "="
            )
        ) {
            addVariable(tokens[i]);
        }
        i++;
    }
    return i;
}

module.exports = { parseDestructure };