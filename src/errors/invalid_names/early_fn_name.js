(token) => {
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        false,
        `Attempted to declare a variable with invalid name ${Color.red}\`paisley_early_fn_[0-9]*\`${Color.reset}.`,
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, space(token.character, " ") + Color.red + space(token.value.length, "^") + " Invalid identifier" + Color.reset),
            emptyLine(),
            emptyLine() + `This can be ignored by passing the flag ${Color.blue}\`--ignore-early-fn-name-check true\`${Color.reset}, but it is not supported behavior, and will likely lead to bugs.`,
        )
    ];
};