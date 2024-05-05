(token, potentialOther) => {
    if (!token) {
        compilerError("Token does not exist: [%s%s%s].", Color.red, token, Color.reset);
    }
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        false,
        `Attempted to use the \`#define\` directive without providing a value for substitution.`,
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, repeat(token.character + token.value.length, " ") + Color.red + " ^ No value provided." + Color.reset),
            emptyLine(),
            potentialOther ?
                helpLine() + `Did you forget to enclose the value in square braces? For example:\n${emptyLine()}\n` +
                lineNum(token.line) + replaceLine(codeBlock, formattedLinePosition, e => {
                    e = e.split(" ");
                    let final = "";
                    final += e.shift() + " " + e.shift() + " ";
                    final += Color.green + "[" + Color.reset + e.join(" ") + Color.green + "]" + Color.reset;
                    return final;
                })
                : ``,
        )
    ];
};