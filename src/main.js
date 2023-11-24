const fs = require("node:fs");
const path = require("node:path");

const { getCompilerFlag, FILE_EXTENSION, logUsageError, setCompilerFlag, writeFile, getErrorLogged, printAborting, setOriginalFile } = require("../paisley");
const { compile } = require("./compile");

function printFileLocation(fileLocation) {
    console.log(" - File Path:\x1b[1;32m " + path.join(__dirname, fileLocation) + "\x1b[0;0m\n");
    console.log(" - URL:      \x1b[1;32m " + path.join("file://", __dirname, fileLocation) + "\x1b[0;0m\n");
}

const strMap = JSON.parse(fs.readFileSync(path.join(__dirname, "/errors/error_docs.json")));
function printDocLink(docObj) {
    if (typeof docObj == "string") {
        docObj = strMap[docObj];
        console.log("\n- " + docObj.name + ":");
        if (docObj.url.includes("http")) {
            console.log(" - URL:      \x1b[1;32m " + docObj.url + "\x1b[0;0m\n");
        } else {
            printFileLocation(path.join("../docs", docObj.url + ".html"));
        }
    } else {
        docObj.forEach(printDocLink);
    }
}

function readDocsDirectory() {
    const baseDir = fs.readdirSync(path.join(__dirname, "/errors"));
    const ret = {};
    baseDir.forEach(dir => {
        if (path.extname(dir) == ".json") return;
        const obj = JSON.parse(fs.readFileSync(path.join(__dirname, "/errors", dir, dir + ".json"), "utf-8"));
        Object.keys(obj).forEach(key => {
            ret[key] = obj[key];
        });
    });
    return ret;
}

function main() {
    const args = process.argv.slice(2);

    if (args.includes("--docs")) {
        while (args[0] !== "--docs")
            args.shift();
        args.shift();
        const errorLocations = readDocsDirectory();
        if (errorLocations[args[0]]) {
            console.log("Potentially relevant documentation for error \x1b[1;31m" + args[0] + "\x1b[0;m:");
            printDocLink(errorLocations[args[0]]);
        } else {
            printFileLocation("../docs/index.html");
            // console.log("Use \x1b[1;32mpaisley --docs <errorName>\x1b[0;0m to see relevant documentation for any given error.");
        }
        process.exit(0);
    } else if (args.includes("--license")) {
        printFileLocation("../LICENSE");
        process.exit(0);
    } else if (args.includes("--help") || args.length == 0) {
        console.log("Usage: \x1b[1;32mpaisley [file" + FILE_EXTENSION + "] [options]\x1b[0;0m\n\nLocate documentation with \x1b[1;32mpaisley --docs\x1b[0;0m\n\nLocate license with \x1b[1;32mpaisley --license\x1b[0;0m.");
        process.exit(0);
    }

    const filename = args.shift();

    for (let i = 0; i < args.length; i += 2) setCompilerFlag(args[i].slice(2), args[i + 1]);

    if (!filename || filename[0] == "-" || filename.slice(filename.lastIndexOf(".")) !== FILE_EXTENSION && getCompilerFlag("use-abnormal-filenames") !== "true")
        logUsageError("invalid_filename", filename);

    setOriginalFile(filename);
    let file = compile(filename);

    // Add in shebangs
    if (getCompilerFlag("make-script") == "true" && !file.match(/^#!(.*)/gm)) {
        switch (getCompilerFlag("type")) {
            case "commonjs":
                file = "#!/usr/bin/env node\n'" + file;
                break;
        }
    }

    const outfile = filename.slice(0, filename.lastIndexOf(".")) + ".js";

    if (getErrorLogged()) {
        printAborting();
        process.exit(1);
    }

    writeFile(outfile, file);

    // chmod +x
    if (getCompilerFlag("make-script") == "true")
        fs.chmodSync(outfile, 500);

    return 0;
}

module.exports = { main };