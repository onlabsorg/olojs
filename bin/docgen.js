const fs = require("fs");
const olodg = require("./olodg");
const rootPath = `${__dirname}/..`;



function generate (orig, dest) {
    process.stdout.write(`docgen: Generating documentation for ${orig} ... `);
    const documentation = olodg.extractDocumentation(`${rootPath}/${orig}`);
    fs.writeFileSync(`${rootPath}/${dest}`, documentation);
    process.stdout.write("[done].\n");    
}


generate("lib/Path.js", "doc/Path.md");
generate("lib/Store.js", "doc/Store.md");
generate("lib/backends/abstract.js", "doc/AbstractBackend.md");

