(filename, tokenList) => {
    const token = tokenList[0];
    if (!token) {
        compilerError("Token does not exist: [%s%s%s].", Color.red, token, Color.reset);
    }

    const originalFile = getRawFile(getCurrentFile());
    const normalizedFilename = path.basename(filename);
    const potentialFiles = traverseDir(path.dirname(getOriginalFile())).filter(e => e[0] == normalizedFilename).map(e => relativeFormatPath(e[1]));
    const format = surroundingBlock(originalFile, token.line);
    const codeBlock = format[0];
    const formattedLinePosition = format[1];
    calcList(token.line);

    let nameToken;
    let i = tokenList.length;
    while (--i) {
        if (i < 0) {
            return [
                true,
                `Invalid file ${Color.red}\`${formatPath(filename)}\`${Color.reset}.`,
                constructLineCheck(token),
                constructError(
                    lineFormat(token.line, codeBlock),
                    emptyLine(),
                    helpLine() + "The `require` directive necessitates use of the word \"from\" when including files."
                )
            ];
        }
        if (tokenList[i].value == "from") {
            i++;
            nameToken = tokenList[i + 1];
            break;
        }
    }
    let lastNameToken;
    while (++i) {
        if (!tokenList[i]) {
            return [
                true,
                `Invalid file ${Color.red}\`${formatPath(filename)}\`${Color.reset}.`,
                constructLineCheck(token),
                constructError(
                    lineFormat(token.line, codeBlock),
                    emptyLine(),
                    helpLine() + "The `require` directive necessitates use of square braces [] surrounding the filename.",
                    helpLine() + "Did you mean:",
                    quoteFormat(replaceLine(codeBlock, formattedLinePosition, line => {
                        line = line.split(" ");
                        line[line.length - 1] = Color.green + "[" + Color.reset + line.at(-1) + Color.green + "]" + Color.reset;
                        return line.join(" ");
                    }))
                )
            ];
        }
        if (tokenList[i] && tokenList[i].value == "]") {
            lastNameToken = tokenList[i];
            break;
        }
    }
    return [
        true,
        `Invalid file ${Color.red}\`${formatPath(filename)}\`${Color.reset}.`,
        constructLineCheck(token),
        constructError(
            insertLineFormat(token.line, codeBlock, formattedLinePosition, repeat(nameToken.character, " ") + Color.red + repeat(lastNameToken.character - nameToken.character, "^") + " File doesn't exist." + Color.reset),
            emptyLine(),
            potentialFiles?.length ?
                helpLine() + "Did you mean any of the following?" + "\n" +
                quoteLine() + potentialFiles.join("\n" + quoteLine())
                : "",
        )
    ];
};