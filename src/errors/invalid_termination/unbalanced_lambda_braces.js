(token) => {
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        true,
        "Unbalanced braces in lambda expression.",
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, space(token.character, " ") + Color.red + "^ \"Initial\" brace is here" + Color.reset),
            emptyLine(),
            emptyLine() + "A corresponding brace does not exist.",
        )
    ];
};