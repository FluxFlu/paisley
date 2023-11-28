(token) => {
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        false,
        `Pound sign (#) used but no directive name provided.`,
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, space(token.character + token.value.length, " ") + Color.red + " ^ No directive specified." + Color.reset),
            emptyLine(),
        )
    ];
};