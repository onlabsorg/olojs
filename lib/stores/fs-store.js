const Path = require("path");
const fs = require("fs");


class FSStore {

    constructor (rootPath) {
        this.rootPath = Path.resolve(rootPath);
    }
    
    fetch (path) {
        return new Promise((resolve, reject) => {
            var fullPath = Path.join(this.rootPath, Path.join("/", path));
            if (fullPath.slice(-1) !== "/") fullPath += ".olo";
            if (!fs.existsSync(fullPath)) resolve("");
            else fs.readFile(fullPath, {encoding:'utf8'}, (err, content) => {
                if (err) reject(err);
                else resolve(content);
            });                
        });                          
    }
}


module.exports = FSStore;
