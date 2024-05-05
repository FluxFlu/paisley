(token, error) => {
    if (!token) {
        compilerError("Token does not exist: [%s%s%s].", Color.red, token, Color.reset);
    }
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        false,
        "Invalid Regular Expression.",
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, repeat(token.character, " ") + Color.red + repeat(token.value.length, "^") + " Invalid Regular Expression" + Color.reset),
            emptyLine(),
            emptyLine() + "The javascript error thrown was the following:",
            emptyLine(),
            quoteFormat(error.toString()),
        )
    ];
};