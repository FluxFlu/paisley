const assert = require("node:assert/strict");

const { token } = require("../../src/compilation_steps/tokenizer");
const { finalize } = require("../../src/compilation_steps/final");
const { RESET, BOLD_RED, BOLD_BLUE, RED } = require("../../src/utils/colors");
const { overwriteFileReader } = require("../../src/utils/file_data");
const { setCompilerFlag } = require("../../src/utils/compiler_flags");

module.exports = (consoleStorage) => {
    setCompilerFlag("debug", "true");
    overwriteFileReader(new Map([["TEST.sly", "300()"]]));
    const file = finalize("TEST.sly", [
        token("Number", "300", 0, 0),
        token("Operator", "(", 0, 3),
        token("Operator", ")", 0, 4),
    ]);
    eval(file);
    assert.deepStrictEqual(
        consoleStorage,
        [
            {
                type: "Error",
                args: [
                    BOLD_RED + "RuntimeError[not_a_function]: " + RESET + "\"300\" is not a function.\n" +
                    "# ./tests/runtime/token_locations.sly:1:4\n" +
                    "\n" +
                    `${BOLD_BLUE} 1 | ${RESET}300()\n` +
                    `${BOLD_BLUE}   | ${RESET}   ${RED}^ Attempted to call non-function value here${RESET}\n` +
                    `${BOLD_BLUE}   | ${RESET}\n`
                ],
            },
        ]
    );
};