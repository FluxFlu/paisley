(filename, tokenList) => {
    const token = tokenList[0];
    let nameToken;
    let i = tokenList.length;
    while (--i) {
        if (tokenList[i].value == "from") {
            i++;
            nameToken = tokenList[i + 1];
            break;
        }
    }
    let lastNameToken;
    while (++i) {
        if (tokenList[i].value == "]") {
            lastNameToken = tokenList[i];
            break;
        }
    }
    const originalFile = getRawFile(getCurrentFile());
    const normalizedFilename = path.basename(filename);
    const potentialFiles = traverseDir(path.dirname(getOriginalFile())).filter(e => e[0] == normalizedFilename).map(e => path.posix.normalize((e[1]).replaceAll(path.win32.sep, path.posix.sep)));
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);
    return [
        false,
        `Invalid file ${Color.red}\`${filename}\`${Color.reset}.`,
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, space(nameToken.character, " ") + Color.red + space(lastNameToken.character - nameToken.character, "^") + " File doesn't exist." + Color.reset),
            emptyLine(),
            potentialFiles?.length ?
                helpLine() + "Did you mean any of the following?" + "\n" +
            quoteLine() + potentialFiles.join("\n" + quoteLine())
                : "",
        )
    ];
};