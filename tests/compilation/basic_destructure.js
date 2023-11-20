const assert = require("node:assert/strict");

const { token } = require("../../src/compilation_steps/tokenizer");
const { parseDestructure } = require("../../src/compilation_steps/tokenizer/parse_destructure");

module.exports = () => {
    const variables = [];
    const addVariable = variable => variables.push(variable);
    parseDestructure(
        [
            token("Operator",    "["),
            token("Operator",    "{"),
            token("Identifier",  "a"),
            token("Operator",    ":"),
            token("Operator",    "["),
            token("Operator",    "{"),
            token("Identifier",  "x"),
            token("Operator",    ":"),
            token("Identifier",  "30"),
            token("Operator",    ","),
            token("Identifier",  "y"),
            token("Operator",    ":"),
            token("Identifier",  "40"),
            token("Operator",    "}"),
            token("Operator",    "]"),
            token("Operator",    "}"),
            token("Operator",    "]"),
        ],
        0,
        addVariable
    );
    assert.deepStrictEqual(
        variables.map(e => { return { type: e.type, value: e.value }; }),
        [
            {
                type: "Identifier",
                value: "30",
            },
            {
                type: "Identifier",
                value: "40",
            }
        ]
    );
};