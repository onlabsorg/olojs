// =============================================================================
//  File-system based store for olojs environment.
// =============================================================================

const Path = require("path");
const fs = require("fs");
const mkdirp = require("mkdirp");
const rimraf = require("rimraf");
const Store = require("./base-store");


const defaultOptions = {
    documentFileExtension: ".olo"
}


class FSStore extends Store {

    //  Creates a store instance that manages the files under the given root 
    //  path.
    constructor (rootPath, options=defaultOptions) {
        super();
        this.rootPath = Path.resolve(rootPath);
        
        this.options = {};
        
        // parse the file extension option
        const ext = options.documentFileExtension;
        if (typeof ext !== "string" || ext === "." || ext === "") {
            this.options.documentFileExtension = defaultOptions.documentFileExtension;            
        }
        else if (ext[0] === ".") {
            this.options.documentFileExtension = ext;
        } else {
            this.options.documentFileExtension = "." + ext;
        }
    }
    
    //  Asynchronously reads and returns the file under rootPath/path.
    //  If the path ends with `/` it returns an index document containing an
    //  `item` name mapped to the list of the subpaths.
    async read (path) {
        const fullPath = this._resolvePath(path);
        if (matchDirPath(fullPath)) {
            let items = await listDirContent(fullPath, this.options.documentFileExtension);
            return this.constructor.createContainerDocument(path, ...items);
        }
        if (!fs.existsSync(fullPath)) {
            return this.constructor.createEmptyDocument(path);
        }
        return await new Promise((resolve, reject) => {
            fs.readFile(fullPath, {encoding:'utf8'}, (err, content) => {
                if (err) reject(err);
                else resolve(content);
            });                        
        });                          
    }    
    
    //  Modifies a document content.
    //  If the source parameter is missing or "", it will delete the file.
    async write (path, source="") {
        if (this.readOnly || matchDirPath(path)) {
            // delegate to the parent store, which should throw an error
            return await super.write(path, source);
        }        
        
        if (source === "") return await this.delete(path);
        
        const parentPath = Path.join("/", path, "..") + "/";
        const fullParentPath = this._resolvePath(parentPath);
        if (!fs.existsSync(fullParentPath)) {
            mkdirp.sync(fullParentPath);
        }

        const fullPath = this._resolvePath(path);
        return await new Promise((resolve, reject) => {
            fs.writeFile(fullPath, source, {encoding:'utf8'}, (err) => {
                if (err) reject(err);
                else resolve();
            });            
        });                
    }    

    //  Delete the document file at rootPath/path
    async delete (path) {
        if (this.readOnly) {
            // delegate to the parent store, which should throw an error
            return await super.delete(path);
        }        

        const fullPath = this._resolvePath(path);
        if (!fs.existsSync(fullPath)) return;

        return await new Promise((resolve, reject) => {
            rimraf(fullPath, (err) => {
                if (err) reject(err);
                else resolve();
            });            
        });                        
    }    

    // Convert the fiven relative `path` to an absolute path starting with `this.rootPath`
    _resolvePath (path) {
        if (matchDirPath(path)) {
            return Path.join(this.rootPath, Path.join("/", path));
        } else {
            return Path.join(this.rootPath, Path.join("/", path)) + this.options.documentFileExtension;
        }
    }
}



function matchDocumentName (name, fileExtension) {
    return name.substr(-fileExtension.length) === fileExtension;
}

function matchDirPath (path) {
    return path.substr(-1) === "/";
}

async function listDirContent (fullPath, fileExtension) {
    const files = await new Promise((resolve, reject) => {
        fs.readdir(fullPath, (err, files) => {
            if (err) resolve([]);
            else resolve(files);
        });
    });
    
    const paths = [];
    for (let name of files) {
        const stat = fs.lstatSync(fullPath+name);
        if (stat.isDirectory()) {
            let subPaths = await listDirContent(fullPath+name+"/", fileExtension);
            for (let subPath of subPaths) paths.push(`${name}/${subPath}`);
        } else if (stat.isFile() && matchDocumentName(name, fileExtension)) {    
            paths.push( name.slice(0, -fileExtension.length) );
        }
    }
    return paths;
}


module.exports = FSStore;
