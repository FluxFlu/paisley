(token, procedure, output) => {
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    
    const procedureToken = procedure.from;
    const procedureLastToken = procedure.code.at(-1);
    let length = procedureLastToken.line - procedureToken.line + 2;
    if (length > 4) length = 4;
    const procedureFormat = surroundingBlock(originalFile, procedureToken.line + length - 1, true, length)[0];

    calcList(token.line);
    return [
        false,
        `Procedure \`${procedure.value}\` has returned invalid value \`${output}\`.`,
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, repeat(token.character, " ") + Color.red + repeat(token.value.length, "^") + " Improper call occurs here" + Color.reset),
            emptyLine(),
            emptyLine() + "The relevant procedure is defined as such:",
            emptyLine(),
            lineFormat(procedure.from.line, procedureFormat),
            emptyLine(),
            helpLine() + "All procedures must return a string value, which is then parsed into the resultant code.",
        )
    ];
};