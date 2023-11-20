const fs = require("node:fs");
const path = require("node:path");

function traverseDir(dirPath) {
    const dir = fs.readdirSync(dirPath);
    const values = [];
    for (let filePath of dir) {
        const fullFilePath = path.join(dirPath, filePath);
        if (fs.statSync(fullFilePath).isDirectory()) {
            traverseDir(fullFilePath).forEach(e => values.push(e));
        } else {
            values.push([filePath, fullFilePath]);
        }
    }
    return values;
}

module.exports = { traverseDir };