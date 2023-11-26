class Token {
    constructor(type, value, line, character) {
        this.type = type;
        this.value = value;
        this.line = line;
        this.character = character;
    }
    copy() {
        return new Token(this.type, this.value, this.line, this.character);
    }
}

function token(type, value, line, character) {
    return new Token(type, value, line, character);
}

module.exports = { token };