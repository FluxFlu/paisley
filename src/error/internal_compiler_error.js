const { BOLD_RED, RESET } = require("../utils/colors");
const { note } = require("./format");


const reportErrorLink = "https://github.com/FluxFlu/paisley/issues";

function compilerError(error, ...args) {
    console.error(BOLD_RED + "Internal Compiler Error: " + RESET + error + "\n\n" + note + `Please report this error at ${reportErrorLink}`, ...args);
    console.trace();
    process.exit(2);
}

module.exports = { compilerError };