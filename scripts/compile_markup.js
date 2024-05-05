const fs = require("fs");
const path = require("path");

function compileMarkdownFile(code, currentPath) {
    let title;
    let outputString = "";
    
    code = code
        // Format newlines for operating system reasons. This will mean all newlines are \n.
        .replaceAll("\r\n", "\n")
        .replaceAll("\r", "\n")
        // Replace angle braces with html codes for angle braces.
        .replaceAll(">", "&gt;")
        .replaceAll("<", "&lt;");

    let isLiteral = false;
    let codeBlockTagIsOpen = false;
    let anchorTagStatus = 0;
    for (let i = 0; i < code.length; i++) {

        // Remove spaces from the beginning of all lines.
        // This means that the only lines with spaces at the beginning will have had them added artificially.
        // Notably relevant to newline handling.
        // We use a while loop to handle the case of multiple space characters.
        while (!isLiteral && code[i] == "\n" && code[i + 1] == " ") {
            code = code.slice(0, i) + "\n" + code.slice(i + 1);
        }
        
        // Each time we see a "```", we alternate between being literal and non-literal.
        if (code[i] == "`" && code[i + 1] == "`" && code[i + 2] == "`") {
            isLiteral = !isLiteral;
        }
        // If we are currently non-literal, and we see a "`" that isn't a "```", replace it with a <cb> tag.
        else if (!isLiteral && code[i] == "`" && code[i + 1] != "`" && code[i - 1] != "`") {
            code = code.slice(0, i) + (codeBlockTagIsOpen ? "</cb>" : "<cb>") + code.slice(i + 1);

            // We alternate between <cb> and </cb> by switching codeBlockTagIsOpen.
            codeBlockTagIsOpen = !codeBlockTagIsOpen;

        // We do basically the same thing but for anchor tags. This time, the value is ternary instead of binary.
        } else if (!isLiteral && code[i] == "%") {
            code = code.slice(0, i) + (anchorTagStatus == 2 ? "</a>" : anchorTagStatus ? "\">" : "<a href=\"") + code.slice(i + 1);

            anchorTagStatus = (anchorTagStatus + 1) % 3;
        }
    }
    code = code

        // Substitute ^hl/ and $hl/ with the <highlight> tag. This tag is implemented in style.css.
        .replaceAll("^hl/", "<highlight>")
        .replaceAll("$hl/", "</highlight>")

        // Substitute /* and */ with the <comment> tag. This tag is implemented in style.css.
        .replaceAll("/*", "<comment>")
        .replaceAll("*/", "</comment>")

        // Substitute \n with a <br> tag. This is how the potential for newlines to be added is implemented.
        // A space is added at the beginning. This is the reason why line breaks aren't shoved into <p> tags later.
        .replaceAll("\\n", " <br>")

        // Split code by \n, allowing us to iterate over the list of lines in the markdown file.
        .split("\n");
    
    // Whether or not a list is currently being interpreted.
    // This exists so that <ul> and </ul> tags can be added to the beginning and end of lists respectively.
    let currentlyList = false;
    for (let i = 0; i < code.length; i++) {
        let line = code[i];
        if (line == "") {
            continue;
        }
        
        // Add <ul> and </ul> to the beginning and end of lists respectively.
        if (line[0] == "-" && !currentlyList) {
            outputString += "\n\t\t\t<ul>";
            currentlyList = true;
        }
        if (line[0] != "-" && currentlyList) {
            outputString += "\n\t\t\t</ul>";
            currentlyList = false;
        }
        
        // If the line is normal, and doesn't start with a special character, add it to the html with a <p> tag like normal.
        if (line[0].match(/[A-Za-z_0-9]/)) {
            outputString += `\n\t\t\t<p>${line}</p>`;
            continue;
        }

        // If the line is special, we take the first character and treat the line differently depending on what that is.
        const command = line[0];

        // Remove the command from the line.
        // Eg. "#Example Title" becomes "Example Title".
        line = line.slice(1);
        switch (command) {
            case " ":
                // This is specifically for line breaks.
                // Line breaks, when they are turned into <br> tags, get spaces added at the beginning.
                // This way, when it comes time to parse the file line-by-line,
                // we can avoid putting these <br> tags into <p> tags simply by checking if there is a space at the beginning.
                outputString += `\n\t\t\t${line}`;
                break;
            case "-":
                outputString += `\n\t\t\t\t<li>${line}</li>\n\t\t\t\t<br>`;
                break;
            case "@":
                title = line;
                break;
            case "#":
                outputString += `\n\t\t\t<h>${line}</h>`;
                break;
            case "`":
                outputString += "\n<pre>";
                line = code[++i];
                while (line.slice(0, 3) !== "```") {
                    outputString += "\n" + line;
                    line = code[++i];
                }
                outputString += "\n</pre>";
                break;
        }
    }
    return (`<!DOCTYPE html>
<html>
\t<head>
\t\t<title>${"Paisley | " + title}</title>
\t\t<link rel="icon" type="image/x-icon" href="${path.relative(path.dirname(currentPath), path.join(workingDir, "./assets/Paisley.png"))}">
\t\t<link rel="stylesheet" type="text/css" href="${path.relative(path.dirname(currentPath), path.join(workingDir, "./style.css"))}" />
\t\t<script>
\t\t\tdocument.addEventListener("DOMContentLoaded", () => {
\t\t\t\tArray.from(document.getElementsByTagName("p")).forEach(element => {
\t\t\t\t\telement.innerHTML = element.innerHTML.split("\\n").map(e => e.trim()).join("\\n");
\t\t\t\t});
\t\t\t});
\t\t</script>
\t</head>
\t<body><br><br>
\t\t<h1>${title}</h1>
\t\t<div>` + outputString + `
\t\t</div>
\t</body>
</html>`
    );
}


// Traverse the directory and compile every .pmu file you see into a .html file.
function traverseAndCompile(dir) {
    if (path.extname(dir) == ".js") {
        console.log(dir);
        console.log("Incorrect directory. Aborting...");
        process.exit(1);
    }
    if (path.extname(dir) == ".pmu") {
        fs.writeFileSync(dir.replaceAll(".pmu", ".html"), compileMarkdownFile(fs.readFileSync(dir, "utf-8"), dir));
        if (shouldDeleteFiles) {
            fs.rmSync(dir);
        }
    } else if (fs.statSync(dir).isDirectory()) {
        fs.readdirSync(dir).forEach(subdirectory => {
            traverseAndCompile(path.join(dir, subdirectory));
        });
    }
}

const workingDir = process.argv[2];
const shouldDeleteFiles = process.argv[3] === "--delete-files";
traverseAndCompile(workingDir);