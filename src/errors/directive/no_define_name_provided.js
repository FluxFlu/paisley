(token) => {
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        false,
        `Attempted to use the \`#define\` directive without providing a name.`,
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, repeat(token.character + token.value.length, " ") + Color.red + " ^ No name provided." + Color.reset),
            emptyLine(),
        )
    ];
};