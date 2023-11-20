function parseDestructure(tokens, i, addVariable) {
    let squareBraces = 0;
    let curlyBraces = 0;
    let currentlyObj = false;
    let objStack = [];
    while (i < tokens.length) {
        if (tokens[i].type == "Operator") {
            if (tokens[i].value == "[") {
                squareBraces++;
                objStack.push(currentlyObj);
                currentlyObj = false;
            }
            if (tokens[i].value == "]") {
                squareBraces--;
                currentlyObj = objStack.pop();
            }
            if (tokens[i].value == "{") {
                curlyBraces++;
                objStack.push(currentlyObj);
                currentlyObj = true;
            }
            if (tokens[i].value == "}") {
                curlyBraces--;
                currentlyObj = objStack.pop();
            }
        }
        if (!(squareBraces | curlyBraces))
            break;

        
        // if (tokens[i].type == "String")
        //     console.log(tokens[i]);

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