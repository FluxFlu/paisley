(filename, variableName, tokenList, checkedExports, allDeclarations) => {
    const token = tokenList[0];
    const firstToken = tokenList[tokenList.findIndex(token => token.value == variableName)];
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
            insertLineFormat(token.line, codeBlock, formattedLinePosition, space(firstToken.character, " ") + Color.red + space(firstToken.value.length, "^") + " This item is never exported from `" + relativeFormatPath(filename) + "`" + Color.reset),
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