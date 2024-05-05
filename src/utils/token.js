const { getCurrentFile } = require("./file_data");

class Token {
    static potentialAttributes = [
        "type",
        "value",
        "line",
        "character",
        "macroResult",
        "file",
    ];
    constructor(type, value, line, character) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.character = character;
        this.file = getCurrentFile();
    }
    copy() {
        const copy = new Token(this.type, this.value, this.line, this.character);
        Token.potentialAttributes.forEach(attribute => {
            if (this[attribute] !== undefined) {
                copy[attribute] = this[attribute];
            }
        });
        return copy;
    }
}

function token(type, value, line, character) {
    return new Token(type, value, line, character);
}

module.exports = { token };