const fs = require("node:fs");
const path = require("node:path");
const os = require("os");

function handleFile(dir) {
    if (dir.includes(".git"))
        return;
    if (fs.statSync(dir).isDirectory()) {
        fs.readdirSync(dir).forEach(filename => {
            handleFile(path.join(dir, filename));
        });
    } else {
        if (dir.includes(".png"))
            return;
        fs.writeFileSync(dir, fs.readFileSync(dir, "utf-8")
            .replaceAll(/(\r\n)|(\r)|(\n)/gm, os.EOL)
        );
    }
}

handleFile(process.argv[2]);