(file, token) => {
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    const lastToken = file.at(-1);
    const lastFormat = surroundingBlock(originalFile, lastToken.line);
    const lastCodeBlock = lastFormat[0];
    const lastFormattedLinePosition = lastFormat[1];
    calcList(token.line);
    return [
        true,
        "File ends while cooking.",
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, space(token.character, " ") + Color.red + "^^ Cooking starts here" + Color.reset),
            emptyLine(),
            insertLineFormat(lastToken.line, lastCodeBlock, lastFormattedLinePosition, space(lastToken.character + lastToken.value.length, " ") + Color.red + "^ File ends here without closing angle braces" + Color.reset),
        )
    ];
};