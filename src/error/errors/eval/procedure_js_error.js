(procedure, firstToken, lastToken, error) => {
    calcList(firstToken.line);
    const originalFile = getRawFile(getCurrentFile());
    const errorHelp = (
        (error instanceof ReferenceError) ?
            emptyLine() + "\n" +
            helpLine() + "Values declared at runtime (eg. \"let f = 0\") cannot be used at compile-time."
            : ""
    );
    if (firstToken.line == lastToken.line && firstToken.character < lastToken.character) {
        const procedureToken = procedure.from;
        const procedureLastToken = procedure.code.at(-1);
        let length = procedureLastToken.line - procedureToken.line + 2;
        if (length > 4) length = 4;
        const procedureFormat = surroundingBlock(originalFile, procedureToken.line + length - 1, true, length)[0];
        const format = surroundingBlock(originalFile, firstToken.line);
        const codeBlock = format[0];
        const formattedLinePosition = format[1];
        return [
            false,
            "Procedure threw an error.",
            constructLineCheck(firstToken),
            constructError(
                insertLineFormat(firstToken.line, codeBlock, formattedLinePosition, repeat(firstToken.character, " ") + Color.red + repeat(lastToken.character - firstToken.character, "^") + " Compile-time error occurs here" + Color.reset),
                emptyLine(),
                emptyLine() + "The relevant procedure is defined as such:",
                emptyLine(),
                lineFormat(procedureToken.line, procedureFormat),
                emptyLine(),
                emptyLine() + "The javascript error thrown was the following:",
                emptyLine(),
                quoteFormat(error.toString()),
                errorHelp
            )
        ];
    } else {
        const format = surroundingBlock(originalFile, lastToken.line, true, lastToken.line - firstToken.line + 1);
        const codeBlock = format[0];
        let longerString = (lastToken.character > firstToken.character ? lastToken.character : firstToken.character);
        return [
            false,
            "Procedure threw an error.",
            constructLineCheck(firstToken),
            constructError(
                lineFormat(firstToken.line, replaceLines(codeBlock, e => e + repeat((longerString < e.length + 3 ? e.length : longerString) - e.length + 3, " ") + Color.red + "]" + Color.reset)) + Color.red + "  Compile-time error occurs here" + Color.reset,
                emptyLine(),
                emptyLine() + "The javascript error thrown was the following:",
                emptyLine(),
                quoteFormat(error.toString()),
                errorHelp
            )
        ];
    }
};