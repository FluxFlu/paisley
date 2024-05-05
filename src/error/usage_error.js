const { RESET, BOLD_RED, BOLD_BLUE } = require("../utils/colors");
const { FILE_EXTENSION } = require("../utils/file_extension");
const { note, help, quote } = require("./format");
const { compilerError } = require("./internal_compiler_error");

let spellCheck;

const usageErrors = {
    "invalid_filename": filename => [
        `Invalid filename "${filename}".`,
        note + "Keep in mind that the filename must end in `" + FILE_EXTENSION + "`.",
        note + "You can compile alternative filenames by passing the flag " + BOLD_BLUE + "`--use-abnormal-filenames true`" + RESET + ".",
    ],
    "link_with_debug": () => [
        "Unable to use `--type link` with `--debug true`.",
    ],
    "invalid_doc_name": (doc, validDocs) => {
        if (!spellCheck) {
            spellCheck = require("./error_utils/spellCheck").spellCheck;
        }
        const potentialValidDocs = spellCheck(Object.keys(validDocs), doc);
        if (potentialValidDocs.length) {
            return [
                `Invalid error name in [--docs ${doc}].`,
                help + "Did you mean any of the following:",
                quote + potentialValidDocs.join("\n" + quote)
            ];
        }
        return [
            `Invalid error name in [--docs ${doc}].`
        ];
    },
    "invalid_compiler_flag": (flag, compilerFlags) => {
        if (!spellCheck) {
            spellCheck = require("./error_utils/spellCheck").spellCheck;
        }
        const potentialValidFlags = spellCheck(Array.from(compilerFlags.keys()), flag.slice(2));
        if (potentialValidFlags.length) {
            return [
                `Invalid compiler flag "${flag}".`,
                help + "Did you mean any of the following:",
                quote + potentialValidFlags.join("\n" + quote)
            ];
        }
        return [
            `Invalid compiler flag "${flag}".`
        ];
    },
    "entry_file_doesnt_exist": filename => [
        `File "${filename}" doesn't exist.`,
    ],
    "filename_overlap": (x, filename) => [
        "Specified filename twice: both [" + filename + "] and [" + x + "]."
    ],
};

function logUsageError(error, ...args) {
    if (!usageErrors[error]) {
        compilerError("Invalid error [%s].", error);
    }
    console.error(BOLD_RED + "UsageError[" + error + "]: " + RESET + usageErrors[error].apply(null, args).join("\n\n") + "\n\nAborting...\n");
    process.exit(1);
}

module.exports = { logUsageError };