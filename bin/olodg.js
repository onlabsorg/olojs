var fs = require('fs');


exports.extractDocumentation = function (filePath) {
    const code = fs.readFileSync(filePath, 'utf8');
    const re = /^\s*\/\*{2}([\s\S]+?)\*\/\s*\n/mg;

    var documentation = "";

    var match;
    while ((match = re.exec(code)) !== null) {
        let docBlock = match[0];
        docBlock = docBlock.replace(/^\s*$/mg, "");                 // remove empty lines
        docBlock = docBlock.replace(/^\s*\/\*{2}.*$/mg, "  \n");    // remove `/**` lines
        docBlock = docBlock.replace(/^\s*\*\/\s*$/mg, "  \n");      // remove ` */` lines
        docBlock = docBlock.replace(/^\s*\*$/mg, "  \n");               // remove leading `*` from empty lines
        docBlock = docBlock.replace(/^\s*\*\s{2}/mg, "");           // remove leading ` *  ` from lines
        documentation += docBlock;
    }

    return documentation;
}


exports.generateDocumentation = function (origPath, destPath) {
    const documentation = exports.extractDocumentation(origPath);
    fs.writeFileSync(destPath, documentation);
}


if (process.argv.length > 2) {
    const filePath = process.argv[2];
    const documentation = exports.extractDocumentation(`${__dirname}/../${filePath}`);
    console.log(documentation);
}
