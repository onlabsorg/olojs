const Path = require('path');
const fs = require('fs');

const extension = '.olo';



module.exports = async function (...paths) {    
    const fullPath = Path.join("/", ...paths) + extension;
    return await readTextFile(fullPath);
}



// -----------------------------------------------------------------------------
//  UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

function readTextFile (path) {
    if (!fs.existsSync(path)) return "";

    return new Promise((resolve, reject) => {
        fs.readFile(path, {encoding:'utf8'}, (err, content) => {
            if (err) reject(err);
            else resolve(content);
        });                        
    });                              
}
