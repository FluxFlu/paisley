(filename, variableName, tokenList, checkedExports, allDeclarations) => {
    const token = tokenList[0];
    if (!token) {
        compilerError("Token does not exist: [%s%s%s].", Color.red, token, Color.reset);
    }
    const firstToken = tokenList.find(token => token.value == variableName);
    if (!firstToken) {
        compilerError("First Token does not exist: [%s%s%s].", Color.red, firstToken, Color.reset);
    }
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    calcList(token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    const potentialSpellChecks = spellCheck(Object.keys(checkedExports), variableName);
    const potentialForgottenExport = allDeclarations[variableName];
    let forgottenSpellCheck;
    if (potentialSpellChecks?.length == 0 && !potentialForgottenExport) {
        forgottenSpellCheck = spellCheck(Object.keys(allDeclarations), variableName);
    }
    return [
        false,
        `Attempted to include nonreal variable \`${variableName}\` from file \`${relativeFormatPath(filename)}\`.`,
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, repeat(firstToken.character, " ") + Color.red + repeat(firstToken.value.length, "^") + " This item is never exported from `" + relativeFormatPath(filename) + "`" + Color.reset),
            emptyLine(),
            (potentialSpellChecks?.length ?
                helpLine() + "Did you mean any of the following?" + "\n" +
                quoteFormat(potentialSpellChecks.join("\n"))
                : "") +
            (potentialForgottenExport ?
                helpLine() + "File `" + relativeFormatPath(filename) + "` contains variable `" + variableName + "`. Did you forget to export it? You can do so as follows:" + "\n" +
                quoteLine() + "#export [" + potentialForgottenExport.value + "]"
                : "") +
            (forgottenSpellCheck?.length ?
                helpLine() + "Did you mean any of the following?" + "\n" +
                quoteFormat(forgottenSpellCheck.join("\n"))
                : ""),
        )
    ];
};