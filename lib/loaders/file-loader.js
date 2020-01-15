const Path = require("path");
const fs = require("fs");


function Loader (rootPath) {
    return path => new Promise((resolve, reject) => {
        const fullPath = Path.join(rootPath, Path.join("/", path));
        if (!fs.existsSync(fullPath)) resolve("");
        else fs.readFile(fullPath, {encoding:'utf8'}, (err, content) => {
            if (err) reject(err);
            else resolve(content);
        });                        
    });                          
}

module.exports = Loader;
