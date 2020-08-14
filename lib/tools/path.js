const Path = module.exports = {};

const pathlib = require("path");

Path.normalize = function normalize (path) {
    return pathlib.join('/', String(path));
}

Path.resolve = function (rootPath, subPath) {
    if (subPath[0] === '/') {
        return pathlib.normalize(subPath);        
        
    } else if (Path.isDirectory(rootPath)) {
        return pathlib.join('/', rootPath, subPath);
        
    } else {
        return pathlib.join('/', rootPath, "..", subPath);                
        
    }
}

Path.sub = function (parentPath, childPath) {
    parentPath = Path.normalize(parentPath);
    childPath = Path.normalize(childPath);
    if (parentPath === childPath) return '/';
    parentPath = pathlib.join(parentPath, '/');
    if (childPath.indexOf(parentPath) !== 0) return "";
    return childPath.slice(parentPath.length-1);    
}

Path.isDirectory = function (path) {
    return String(path).slice(-1) === '/';
}


// HELPER FUNCTIONS

function matchURL (path) {
    return String(path).match(/^(\w+\:\/\/[\w\.\:]*)(\/.*)?$/);
}
