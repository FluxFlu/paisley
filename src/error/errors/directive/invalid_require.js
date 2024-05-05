(line) => {
    const token = line[0];
    const originalFile = getRawFile(getCurrentFile());
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        false,
        `Improper use of the \`require\` directive.`,
        constructLineCheck(token),
        constructError(
            lineFormat(token.line, codeBlock),
        )
    ];
};