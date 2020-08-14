var expect = require("chai").expect;
var Path = require("../lib/tools/path");

describe("Path", () => {
    
    describe("Path.normalize(path)", () => {
        
        it("should resolve '.', '..'", () => {
            var npath = Path.normalize("/path/to/./xxx/../doc");
            expect(npath).to.equal("/path/to/doc");
        });
        
        it("should add a leading '/' if missing", () => {
            var path = Path.normalize("path/to/./xxx/../doc");
            expect(path).to.equal("/path/to/doc");
        });
        
        it("should preserv the trailing slash", () => {
            var path = Path.normalize("/path/to/./xxx/../doc/");
            expect(path).to.equal("/path/to/doc/");            
        });        
    });
    
    describe("Path.isDirectory(path)", () => {
        it("should return true if path ends with '/'", () => {
            expect( Path.isDirectory("/path/to/resource/")).to.be.true;
            expect( Path.isDirectory("/path/to/resource")).to.be.false;
        });
    });
    
    describe("Path.resolve(rootPath, subPath)", () => {
        
        it("should return the absolute path resolving subPath as relative to rootPath", () => {
            var path = Path.resolve("/path/to/doc", "../doc2");
            expect(path).to.equal("/path/doc2");

            var path = Path.resolve("/path/to/doc/", "../doc3");
            expect(path).to.equal("/path/to/doc3");
        });
        
        it("should return subPath itself if it is a root path", () => {
            var path = Path.resolve("/path/to/doc", "/doc2");
            expect(path).to.equal("/doc2");            
        });
    });
    
    describe("Path.sub(parentPath, childPath)", () => {
        
        it("should return the childPath part relative to path", () => {
            var path = Path.sub("/path/to", "/path/to/store/doc");
            expect(path).to.equal("/store/doc");

            var path = Path.sub("/path/to/", "/path/to/store/doc");
            expect(path).to.equal("/store/doc");
        });
        
        it("should return '' if childPath is not a sub-path of path", () => {
            expect( Path.sub("/path/to", "/path2/to/doc") ).to.equal("");
            expect( Path.sub("/path/to/", "/path/to") ).to.equal("");
            expect( Path.sub("/path/to", "/path/to/") ).to.not.equal("");
        });

        it("should return '/' if childPath equals path", () => {
            expect( Path.sub("/path/to", "/path/to") ).to.equal("/");
            expect( Path.sub("/path/to", "/path/to/") ).to.equal("/");
            expect( Path.sub("/path/to/", "/path/to") ).to.not.equal("/");
        });
        
    });
});
