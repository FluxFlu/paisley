(copyline, initialDeclaration) => {
    const token = copyline[2];
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];

    const initialDeclarationFile = getRawFile(initialDeclaration.from.file);
    const initialDeclarationFormat = surroundingBlock(initialDeclarationFile, initialDeclaration.from.line);
    const initialDeclarationCodeBlock = initialDeclarationFormat[0];
    const initialDeclarationFormattedLinePosition = initialDeclarationFormat[1];

    calcList(token.line);
    return [
        false,
        `Redeclaration of \`${token.value}\`.`,
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, repeat(token.character, " ") + Color.red + repeat(token.value.length, "^") + " Invalid name provided" + Color.reset),
            emptyLine(),
            constructLineCheck(initialDeclaration.from),
            emptyLine(),
            insertLineFormat(initialDeclaration.from.line, initialDeclarationCodeBlock, initialDeclarationFormattedLinePosition, repeat(initialDeclaration.from.character, " ") + Color.red + repeat(initialDeclaration.from.value.length, "^") + " Initial declaration here" + Color.reset),
        )
    ];
};