(tokenList, indexOfToken) => {
    let restToken;
    let consecutiveDots = 0;
    let tokensCounted = 0;
    for (let i = 4; i < tokenList.length; i++) {
        if (tokenList[i].value == "." && tokenList[i].type == "Operator") {
            consecutiveDots++;
        } else if (tokenList[i].type == "Identifier") {
            if (tokensCounted < indexOfToken) {
                tokensCounted++;
            } else if (consecutiveDots == 3) {
                restToken = tokenList[i].copy();
                break;
            }
        } else {
            consecutiveDots = 0;
        }
    }
    if (!restToken) {
        compilerError("Rest Token does not exist: [%s%s%s].", Color.red, token, Color.reset);
    }
    restToken.character -= 3;
    restToken.value = "..." + restToken.value;
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, restToken.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(restToken.line);
    return [
        false,
        `Invalid rest parameter used in macro definition.`,
        constructLineCheck(restToken),
        constructError(
            insertLineFormat(restToken.line, codeBlock, formattedLinePosition, repeat(restToken.character, " ") + Color.red + repeat(restToken.value.length, "^") + " Invalid rest syntax" + Color.reset),
            emptyLine(),
            helpLine() + "A macro definition can only have one rest parameter, and the rest parameter must be the last parameter in the macro definition.",
        )
    ];
};