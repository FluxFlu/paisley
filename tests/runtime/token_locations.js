const assert = require("node:assert/strict");

const { token } = require("../../src/compilation_steps/tokenizer");
const { finalize } = require("../../src/compilation_steps/final");
const { setCompilerFlag, overwriteFileReader } = require("../../paisley");

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
                    "\x1B[1;31mRuntimeError[not_a_function]: \x1B[0m\"300\" is not a function.\n" +
                    "# ./tests/runtime/token_locations.sly:1:4\n" +
                    "\n" +
                    "\x1B[1;34m 1 | \x1B[0m300()\n" +
                    "\x1B[1;34m   | \x1B[0m   \x1B[0;31m^ Attempted to call non-function value here\x1B[0m\n" +
                    "\x1B[1;34m   | \x1B[0m\n"
                ],
            },
        ]
    );
};