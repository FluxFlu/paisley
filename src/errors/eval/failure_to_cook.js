(firstToken, lastToken, error) => {
    calcList(firstToken.line);
    const originalFile = getRawFile(getCurrentFile());
    const errorHelp = (
        (error instanceof ReferenceError) ?
            emptyLine() + "\n" +
            helpLine() + "Values declared at runtime (eg. \"let f = 0\") cannot be used at compile-time."
            :
            (error.toString() == "SyntaxError: Unexpected token '<'") ?
                emptyLine() + "\n" +
            helpLine() + "Cooking cannot be nested. For example, \"<<1 + 2> + 3>\" will throw an error."
                : ""
    );
    if (firstToken.line == lastToken.line && firstToken.character < lastToken.character) {
        const format = surroundingBlock(originalFile, firstToken.line);
        const codeBlock = format[0];
        const formattedLinePosition = format[1];
        return [
            false,
            "Failure to cook.",
            constructLineCheck(firstToken),
            constructError(
                insertLineFormat(firstToken.line, codeBlock, formattedLinePosition, space(firstToken.character, " ") + Color.red + space(lastToken.character - firstToken.character, "^") + " Compile-time error occurs here" + Color.reset),
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
            "Failure to cook.",
            constructLineCheck(firstToken),
            constructError(
                lineFormat(firstToken.line, replaceLines(codeBlock, e => e + space((longerString < e.length + 3 ? e.length : longerString) - e.length + 3, " ") + Color.red + "]" + Color.reset)) + Color.red + "  Compile-time error occurs here" + Color.reset,
                emptyLine(),
                emptyLine() + "The javascript error thrown was the following:",
                emptyLine(),
                quoteFormat(error.toString()),
                errorHelp
            )
        ];
    }
};