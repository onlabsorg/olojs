const olodg = require("./olodg");
const rootPath = `${__dirname}/..`;

function generate (orig, dest) {
    process.stdout.write(`docgen: Generating documentation for ${orig} ... `);
    olodg.generateDocumentation(`${rootPath}/${orig}`, `${rootPath}/${dest}`);
    process.stdout.write("[done].\n");    
}



generate("lib/Path.js", "doc/Path.md");
generate("lib/Store.js", "doc/Store.md");
generate("lib/OlodbStore.js", "doc/OlodbStore.md");
generate("lib/MemoryStore.js", "doc/MemoryStore.md");
generate("lib/LocalStore.js", "doc/LocalStore.md");
