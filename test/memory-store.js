var expect = require("chai").expect;
var MemoryStore = require("../lib/stores/memory");



describe("MemoryStore", () => {
    
    it("should work as a Map object, with paths as keys", () => {
        var memStore = new MemoryStore();
        memStore.set('/path/to/doc', "Doc source @ /path/to/doc");
        expect(memStore.get('/path/to/doc')).to.equal("Doc source @ /path/to/doc")
        memStore.delete('/path/to/doc');
        expect(memStore._content.has('/path/to/doc')).to.be.false;
    });
    
    it("should normalize the path", () => {
        var memStore = new MemoryStore();
        memStore.set('path/to/doc', "Doc source @ /path/to/doc");
        expect(memStore.get('/path/to/doc')).to.equal("Doc source @ /path/to/doc")
        expect(memStore.get('path/to/./doc')).to.equal("Doc source @ /path/to/doc")
        memStore.delete('/path/to/a/../doc');
        expect(memStore._content.has('/path/to/doc')).to.be.false;
        
    });
    
    it("should ignore the constructor parameters", () => {
        var memStore = new MemoryStore(['kay','vale']);
        expect(memStore._content.size).to.equal(0);
    });
    
    describe("source = memStore.get(path)", () => {
        
        it("should return an empty string if the path doesn't exist", () => {
            var memStore = new MemoryStore();
            expect(memStore.get('/path/to/doc')).to.equal("")                
        });            
    });        

    describe("memStore.set(path, source)", () => {
        
        it("should stringify the source parameter", () => {
            var memStore = new MemoryStore();
            memStore.set('path/to/doc', {
                toString: () => "Doc source @ /path/to/doc"
            });
            expect(memStore.get('/path/to/doc')).to.equal("Doc source @ /path/to/doc")
        });
    });        
});    
