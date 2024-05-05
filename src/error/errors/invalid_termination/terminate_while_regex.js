(token) => {
    if (!token) {
        compilerError("Token does not exist: [%s%s%s].", Color.red, token, Color.reset);
    }
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        true,
        "File ends while Regular Expression is being defined.",
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, repeat(token.character, " ") + Color.red + "^ Regular Expression starts here and doesn't stop" + Color.reset),
            emptyLine(),
        )
    ];
};