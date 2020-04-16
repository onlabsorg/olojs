
class Store {   
    
    static createContainerDocument (path, items) {
        return `<% items = ${JSON.stringify(items)} %>`;
    }
    
    static createEmptyDocument (path) {
        return "";
    }
    
    static createReader (...args) {
        const store = new this(...args);
        return store.read.bind(store);
    }
}

module.exports = Store;
