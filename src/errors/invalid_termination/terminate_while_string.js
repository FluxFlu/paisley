(token) => {
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        true,
        "File ends while string is being defined.",
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, space(token.character, " ") + Color.red + "^ String starts here" + Color.reset),
            emptyLine(),
            insertLineFormat(token.line, codeBlock, formattedLinePosition, space(token.character + token.value.length, " ") + Color.red + "^ File ends here without ending string" + Color.reset),
        )
    ];
};