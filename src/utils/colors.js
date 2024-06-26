const colors = {
    RED: "\x1b[0;31m",
    BOLD_RED: "\x1b[1;31m",
    GREEN: "\x1b[0;32m",
    BOLD_GREEN: "\x1b[1;32m",
    BLUE: "\x1b[0;34m",
    BOLD_BLUE: "\x1b[1;34m",
    WHITE: "\x1b[0;29m",
    BOLD_WHITE: "\x1b[1;29m",
    RESET: "\x1b[0m"
};

// We check if the current terminal allows colors.
let colorSupported = false;

if (process.argv.includes("--colors")) {
    colorSupported = true;
}

if (process.env.FORCE_COLOR || process.env.COLORTERM || process.env.CLICOLOR) {
    colorSupported = true;
}

if (process.stderr.isTTY && process.stderr.hasColors(16)) {

    // If bold colors aren't supported, we must replace the bold colors with their regular variants.
    if (!colorSupported && process.stderr.hasColors(256)) {
        Object.keys(colors).forEach(key => {
            if (key.slice(0, 4) == "BOLD") {
                colors[key] = colors[key.slice(5)];
            }
        });
    }
    colorSupported = true;
}

if (!colorSupported) {
    Object.keys(colors).forEach(key => colors[key] = "");
}

module.exports = colors;