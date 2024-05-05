const fs = require("node:fs");
const path = require("node:path");

const { handleArguments, getCompilerFlag, getFilename } = require("./utils/compiler_flags");
const { compile } = require("./compile");
const { logUsageError } = require("./error/usage_error");
const { FILE_EXTENSION } = require("./utils/file_extension");
const { writeFile, writeLinkedFile } = require("./utils/write_file");
const { getErrorLogged, printAborting } = require("./error/error");
const { setOriginalFile } = require("./utils/file_data");
const { compilerError } = require("./error/internal_compiler_error");
const { BOLD_RED, RESET, BOLD_GREEN } = require("./utils/colors");

function printFileLocation(fileLocation) {
    console.log(" - File Path: " + BOLD_GREEN + path.join(__dirname, fileLocation) + RESET + "\n");
    console.log(" - URL:       " + BOLD_GREEN + path.join("file://", __dirname, fileLocation) + RESET + "\n");
}

const strMap = JSON.parse(fs.readFileSync(path.join(__dirname, "/error/errors/error_docs.json")));
function printDocLink(docObj) {
    if (typeof docObj == "string") {
        docObj = strMap[docObj];
        console.log("\n- " + docObj.name + ":");
        if (docObj.url.includes("http")) {
            console.log(" - URL:       " + BOLD_GREEN + docObj.url + RESET + "\n");
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
        if (path.extname(dir) == ".json") {
            return;
        }
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
        while (args[0] !== "--docs") {
            args.shift();
        }
        args.shift();
        const errorLocations = readDocsDirectory();
        if (errorLocations[args[0]]) {
            console.log("Potentially relevant documentation for error " + BOLD_RED + args[0] + RESET + ":");
            printDocLink(errorLocations[args[0]]);
        
            // TODO: Spellchecking for if the user gets an incorrect doc-name.
            // } else if (args[0]) {

        } else {
            printFileLocation("../docs/index.html");
            // console.log("Use " + BOLD_GREEN + "paisley --docs <errorName>" + RESET + " to see relevant documentation for any given error.");
        }
        process.exit(0);
    } else if (args.includes("--license")) {
        printFileLocation("../LICENSE");
        process.exit(0);
    } else if (args.includes("--help") || args.length == 0) {
        console.log("Usage: " + BOLD_GREEN + "paisley [file" + FILE_EXTENSION + "] [options]" + RESET + "\n\nLocate documentation with " + BOLD_GREEN + "paisley --docs" + RESET + "\n\nLocate license with " + BOLD_GREEN + "paisley --license" + RESET + ".");
        process.exit(0);
    }

    handleArguments(args);

    const filename = getFilename();

    if (getCompilerFlag("type") == "link" && getCompilerFlag("debug") == "true") {
        logUsageError("link_with_debug");
    }

    if (!filename || filename[0] == "-" || filename.slice(filename.lastIndexOf(".")) !== FILE_EXTENSION && getCompilerFlag("use-abnormal-filenames") !== "true") {
        logUsageError("invalid_filename", filename);
    }

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

    if (getCompilerFlag("type") == "link") {
        writeLinkedFile(outfile);
    }

    // chmod +x
    if (getCompilerFlag("make-script") == "true") {
        fs.chmodSync(outfile, 500);
    }

    return 0;
}

try {
    process.exit(main());
} catch (e) {
    compilerError("%s", e);
}