const fs = require("node:fs");
const path = require("node:path");

const { getCompilerFlag, FILE_EXTENSION, throwUsageError, setCompilerFlag, writeFile } = require("../paisley");
const { compile } = require("./compile");
const { getErrorLogged } = require("./error");

function printFileLocation(fileLocation) {
    console.log("File Path:\x1b[1;32m " + path.join(__dirname, fileLocation) + "\x1b[0;37m\n");
    console.log("URL:      \x1b[1;32m " + path.join("file://", __dirname, fileLocation) + "\x1b[0;37m\n");
    process.exit(0);
}

function main() {
    const args = process.argv.slice(2);

    if (args.includes("--docs")) {
        printFileLocation("../docs/index.html");
    } else if (args.includes("--license")) {
        printFileLocation("../LICENSE-GPL");
    } else if (args.includes("--help") || args.length == 0) {
        console.log("Usage: \x1b[1;32mpaisley [file" + FILE_EXTENSION + "] [options]\x1b[0;37m\n\nLocate documentation with \x1b[1;32mpaisley --docs\x1b[0;37m.\n\nLocate license with \x1b[1;32mpaisley --license\x1b[0;37m.");
        process.exit(0);
    }

    const filename = args.shift();

    for (let i = 0; i < args.length; i += 2) setCompilerFlag(args[i].slice(2), args[i + 1]);

    if (!filename || filename[0] == "-" || filename.slice(filename.lastIndexOf(".")) !== FILE_EXTENSION && getCompilerFlag("use-abnormal-filenames") !== "true")
        throwUsageError("invalid_filename", filename);

    let file = compile(filename);

    // Add in shebangs
    if (getCompilerFlag("make-script") == "true" && !file.match(/^#!(.*)/gm)) {
        switch (getCompilerFlag("type")) {
            case "node":
                file = "#!/usr/bin/env node\n'" + file;
                break;
        }
    }

    const outfile = filename.slice(0, filename.lastIndexOf(".")) + ".js";

    if (getErrorLogged()) {
        console.error("Aborting...\n");
        process.exit(1);
    }

    writeFile(outfile, file);

    // chmod +x
    if (getCompilerFlag("make-script") == "true")
        fs.chmodSync(outfile, 500);

    return 0;
}

module.exports = { main };