
var Path = require("path");
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var fs = require("fs");
var ROOT_PATH = `${__dirname}/fs-store`;
var FSStore = require("../lib/stores/fs-store");


async function createStore (content) {
    
    // clear the store
    await new Promise((resolve, reject) => {
        rimraf(`${ROOT_PATH}`, (err) => {
            if (err) reject(err);
            else resolve();
        })
    });
    
    fs.mkdirSync(ROOT_PATH);
    
    // document creation routine
    var createDoc = (fullPath, content) => {
        var ppath = Path.parse(fullPath);
        if (!fs.existsSync(ppath.dir+"/")) {
            mkdirp.sync(ppath.dir+"/");
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(fullPath, content, {encoding:'utf8'}, (err) => {
                if (err) reject(err);
                else resolve();
            });            
        });                        
    }
    
    // create all the listed documents
    for (let path in content) {
        let fullPath = `${ROOT_PATH}${path}`;
        await createDoc(fullPath, content[path]);
    }
    
    return new FSStore(ROOT_PATH);
}

describe("FSStore", () => {
    var test = require("./store");
    test("FSStore", createStore);    
});
