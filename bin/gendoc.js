const docgen = require("docgen");
const path = require("path");

const sourcePath = name => path.join(__dirname, `../lib/`, `${name}.js`);
const docPath = name => path.join(__dirname, `../doc/`, `${name}.md`);
const generate = name => {
    console.log(`... generating ${name} documentation`)
    docgen.generateDocumentation( sourcePath(name), docPath(name) );
};

console.log("olojs documentation generator:");
generate("expression");
generate("globals");
generate("dom");
generate("hub");
generate("memory-store");
console.log("Done!");
