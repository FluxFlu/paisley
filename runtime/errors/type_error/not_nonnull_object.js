
(context) => {
    const token = parseErrorPosition(context.error);
    const tokenLocation = context.locationMap[token.line + ":" + token.character];
    if (!tokenLocation) {
        compilerError("Token location in original file does not exist.");
    }
    token.line = +tokenLocation.split(":")[0];
    token.character = +tokenLocation.split(":")[1];
    token.file = context.filename;
    for (let i = 0; i < context.tokenList.length; i++) {
        const currentToken = context.tokenList[i];
        if (currentToken.line == token.line && currentToken.character == token.character) {
            token.value = currentToken.value;
        }
    }
    const originalFile = context.originalFile;
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        false,
        `Expected object, received null or non-object.`,
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, repeat(token.character, " ") + Color.red + repeat(token.value.length, "^") + " Attempted to pass invalid value to this" + Color.reset),
            emptyLine(),
        )
    ];
}