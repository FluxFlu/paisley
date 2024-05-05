(context) => {
    const token = parseErrorPosition(context.error);
    const tokenLocation = context.locationMap[token.line + ":" + token.character];
    if (!tokenLocation) {
        compilerError("Token location in original file does not exist.");
    }
    token.line = +tokenLocation.split(":")[0];
    token.character = +tokenLocation.split(":")[1];
    token.file = context.filename;
    const valueName = context.error.toString().split(' ')[1];
    const originalFile = context.originalFile;
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        false,
        `"${valueName}" is not a function.`,
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, repeat(token.character, " ") + Color.red + "^ Attempted to call non-function value here" + Color.reset),
            emptyLine(),
        )
    ];
}