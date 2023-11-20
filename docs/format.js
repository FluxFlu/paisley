document.addEventListener("DOMContentLoaded", () => {
    Array.from(document.getElementsByTagName("p")).forEach(element => {
        element.innerHTML = element.innerHTML.split("\n").map(e => e.trim()).join("\n");
    });
});