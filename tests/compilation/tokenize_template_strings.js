const assert = require("node:assert/strict");

const { Tokenize } = require("../../src/compilation_steps/tokenizer");

module.exports = () => {
    const out = Tokenize("example.dm", "`${300}, ${300}` + `(${300}, ${300})`");
    assert.deepStrictEqual(
        out.map(e => { return { type: e.type, value: e.value }; }),
        [
            {
                type: "Operator",
                value: "(",
            },
            {
                type: "Number",
                value: "300",
            },
            {
                type: "Operator",
                value: ")",
            },
            {
                type: "Operator",
                value: "+",
            },
            {
                type: "String",
                value: "`, `",
            },
            {
                type: "Operator",
                value: "+",
            },
            {
                type: "Operator",
                value: "(",
            },
            {
                type: "Number",
                value: "300",
            },
            {
                type: "Operator",
                value: ")",
            },
            {
                type: "Operator",
                value: "+",
            },
            {
                type: "String",
                value: "`(`",
            },
            {
                type: "Operator",
                value: "+",
            },
            {
                type: "Operator",
                value: "(",
            },
            {
                type: "Number",
                value: "300",
            },
            {
                type: "Operator",
                value: ")",
            },
            {
                type: "Operator",
                value: "+",
            },
            {
                type: "String",
                value: "`, `",
            },
            {
                type: "Operator",
                value: "+",
            },
            {
                type: "Operator",
                value: "(",
            },
            {
                type: "Number",
                value: "300",
            },
            {
                type: "Operator",
                value: ")",
            },
            {
                type: "Operator",
                value: "+",
            },
            {
                type: "String",
                value: "`)`",
            },
        ]
    );
};