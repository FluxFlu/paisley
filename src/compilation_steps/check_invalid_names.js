const { logError } = require("../error/error");
const { getCompilerFlag } = require("../utils/compiler_flags");

const invalidNames = [
    name => name.match(/paisley_early_fn_[0-9]+/)
];

const flagChecks = [
    "ignore-early-fn-name-check"
];

const nameErrors = [
    "early_fn_name"
];

function checkInvalidNames(file) {
    for (let i = 0; i < invalidNames.length; i++) {
        if (getCompilerFlag(flagChecks[i]) == "true") {
            delete invalidNames[i];
        }
    }
    for (let i = 0; i < file.length; i++) {
        if (file[i].type == "Identifier") {
            for (let name = 0; name < invalidNames.length; name++) {
                if (invalidNames[name](file[i].value)) {
                    logError(nameErrors[name], file[i]);
                }
            }
        }
    }
}

module.exports = { checkInvalidNames };