

class Store {
    
    async read (path) {
        throwOperationNotDefined("Read", path);            
    }
    
    async write (path, source) {
        throwOperationNotDefined("Write", path);
    }

    async delete (path) {
        throwOperationNotDefined("Delete", path);            
    }
    
    
    static createEmptyDocument (path) {
        return "";
    }
    
    static createContainerDocument (path, ...items) {
        return `<% items = ${JSON.stringify(items)} %>`;
    }
}


function throwOperationNotDefined (operation, path) {
    throw new Error(`${operation} operation not defined on path ${Path.from(path)}`);
}


module.exports = Store;
