var Path = require("path");
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var fs = require("fs");


module.exports = async function (rootPath, content) {
    
    // clear the store
    await new Promise((resolve, reject) => {
        rimraf(`${rootPath}`, (err) => {
            if (err) reject(err);
            else resolve();
        })
    });
    
    fs.mkdirSync(rootPath);
    
    // document creation routine
    var createDoc = (fullPath, content) => {
        var ppath = Path.parse(fullPath);
        if (!fs.existsSync(ppath.dir+"/")) {
            mkdirp.sync(ppath.dir+"/");
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(fullPath+".olo", content, {encoding:'utf8'}, (err) => {
                if (err) reject(err);
                else resolve();
            });            
        });                        
    }
    
    // create all the listed documents
    for (let path in content) {
        let fullPath = `${rootPath}${path}`;
        await createDoc(fullPath, content[path]);
    }    
}
