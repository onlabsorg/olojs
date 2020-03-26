var expect = require("chai").expect;
var Path = require("../lib/tools/path");

describe("Path", () => {
    
    describe("Path.prototype.toString()", () => {
        
        it("should return the normalized version of the original pathString", () => {
            var path = new Path("/path/to/./xxx/../doc");
            expect(String(path)).to.equal("/path/to/doc");

            var path = new Path("path/to/./xxx/../doc");
            expect(String(path)).to.equal("/path/to/doc");
        });
        
        it("should preserv the trailing slash", () => {
            var path = new Path("/path/to/./xxx/../doc/");
            expect(String(path)).to.equal("/path/to/doc/");            
        });
        
        it("should work also with URL's", () => {
            var path = new Path("protocol://host/path/to/./xxx/../doc");
            expect(String(path)).to.equal("protocol://host/path/to/doc");            

            var path = new Path("protocol://host/path/to/./xxx/../doc/");
            expect(String(path)).to.equal("protocol://host/path/to/doc/");            

            var path = new Path("protocol://host");
            expect(String(path)).to.equal("protocol://host/");            

            var path = new Path("protocol://");
            expect(String(path)).to.equal("protocol://");            

            var path = new Path("protocol:///");
            expect(String(path)).to.equal("protocol://");            
        });
        
        it("should not normalize the host part of an url", () => {
            var path = new Path("protocol://host/../path/to/./xxx/../doc");
            expect(String(path)).to.equal("protocol://host/path/to/doc");            
        });
    });
    
    describe("Path.prototype.resolve(subPath)", () => {
        
        it("should return a Path object", () => {
            var path = new Path("/path/to/doc");
            expect(path.resolve("../doc2")).to.be.instanceof(Path);
        });
        
        it("should return the normalized subPath relative to the path object", () => {
            var path1 = new Path("/path/to/doc");
            var path2 = path1.resolve("../doc2");
            expect(String(path2)).to.equal("/path/doc2");

            var path1 = new Path("/path/to/doc/");
            var path2 = path1.resolve("../doc3");
            expect(String(path2)).to.equal("/path/to/doc3");
        });
        
        it("should work as well if path is an url", () => {
            var path1 = new Path("protocol://host/path/to/doc");
            var path2 = path1.resolve("../doc2");
            expect(String(path2)).to.equal("protocol://host/path/doc2");

            var path1 = new Path("protocol://host/path/to/doc/");
            var path2 = path1.resolve("../doc3");
            expect(String(path2)).to.equal("protocol://host/path/to/doc3");            

            var path1 = new Path("protocol://host/path/to/doc/");
            var path2 = path1.resolve("../../../../doc3");
            expect(String(path2)).to.equal("protocol://host/doc3");
        });
        
        it("should return subPath itself if it is a root path", () => {
            var path1 = new Path("/path/to/doc");
            var path2 = path1.resolve("/doc2");
            expect(String(path2)).to.equal("/doc2");            

            var path1 = new Path("protocol://host/path/to/doc");
            var path2 = path1.resolve("/doc3");
            expect(String(path2)).to.equal("protocol://host/doc3");            
        });
        
        it("should return subPath itself if it is an url", () => {
            var path1 = new Path("/path/to/doc");
            var path2 = path1.resolve("xxx://hhh/doc2");
            expect(String(path2)).to.equal("xxx://hhh/doc2");            

            var path1 = new Path("protocol://host/path/to/doc");
            var path2 = path1.resolve("xxx://hhh/doc3");
            expect(String(path2)).to.equal("xxx://hhh/doc3");            
        });
    });
    
    describe("Path.prototype.getSubPath(childPath)", () => {
        
        it("should return the childPath part relative to path", () => {
            var path = new Path("/path/to");
            expect(path.getSubPath("/path/to/store/doc")).to.equal("/store/doc");
        });
        
        it("should return '/' if childPath equals path", () => {
            var path = new Path("/path/to");
            expect(path.getSubPath("/path/to")).to.equal("/");            
        });
        
        it("should return '' if childPath is not a sub-path of path", () => {
            var path = new Path("/path/to");
            expect(path.getSubPath("/path2/to/doc")).to.equal("");            
        });
    });
    
    describe("Path.from(path)", () => {
        
        it("should return new Path(path) if path is not already a Path instance", () => {
            var path = Path.from("/path/to/doc");
            expect(path).to.be.instanceof(Path);
            expect(String(path)).to.equal("/path/to/doc");
        });
        
        it("shoulr return path itself if it is already a Path instance", () => {
            var path = new Path("/path/to/doc");
            expect(Path.from(path)).to.equal(path);
        });
    });
});
