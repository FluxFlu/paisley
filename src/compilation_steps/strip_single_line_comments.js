function stripSingleLineComments(file) {
    let postCommentStrip = "";
    let literal;
    for (let i = 0; i < file.length; i++) {
        if (literal && file[i] == literal && file[i - 1] !== "\\") {
            literal = null;
        } else if (file[i] == "`" || file[i] == "\"" || file[i] == "'") {
            literal = file[i];
        } else if (!literal && file[i] == "/" && file[i + 1] == "/") {
            while (file[i] && file[i] !== "\n")
                i++;
            if (!file[i])
                break;
        }
        postCommentStrip += file[i];
    }
    return postCommentStrip;
}

module.exports = { stripSingleLineComments };