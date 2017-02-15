
import Path from "olojs/Path";

describe("Path", function () {

    describe("constructor", function () {

        it("should return an array of keys", function () {
            var path = new Path('a','b','c');
            expect(path).to.be.instanceof(Array);
            expect(path.length).to.equal(3);
            expect(path[0]).to.equal('a');
            expect(path[1]).to.equal('b');
            expect(path[2]).to.equal('c');
        });

        it("should split slash-separated keys",function () {
            var path = new Path('a/b','c');
            expect(path).to.be.instanceof(Array);
            expect(path.length).to.equal(3);
            expect(path[0]).to.equal('a');
            expect(path[1]).to.equal('b');
            expect(path[2]).to.equal('c');
        });

        it("should recursively process array or Path arguments", function () {
            var path = new Path(['a'], ['b',['c','d']], new Path('e','f'));
            expect(path).to.be.instanceof(Array);
            expect(path.length).to.equal(6);
            expect(path[0]).to.equal('a');
            expect(path[1]).to.equal('b');
            expect(path[2]).to.equal('c');
            expect(path[3]).to.equal('d');
            expect(path[4]).to.equal('e');
            expect(path[5]).to.equal('f');
        });

        it("should ignore empty or undefined or null keys", function () {
            var path = new Path('a', '', 'b', undefined, 'c', [], '/d/e//f', new Path(), null, 'g');
            expect(path).to.be.instanceof(Array);
            expect(path.length).to.equal(7);
            expect(path[0]).to.equal('a');
            expect(path[1]).to.equal('b');
            expect(path[2]).to.equal('c');
            expect(path[3]).to.equal('d');
            expect(path[4]).to.equal('e');
            expect(path[5]).to.equal('f');
            expect(path[6]).to.equal('g');
        });
    });

    describe("Path.prototype.slice(start, end)", function () {

        it("should return a slice Path of the path", function () {
            var path = new Path('a/b/c/d/e/f/g');
            expect(path.slice(1,2)).to.be.instanceof(Path);
            expect(Array.from(path.slice(2,-2))).to.deep.equal(['c','d','e'])
        });
    });

    describe("Path.prototype.parent", function () {

        it("should return .slice(0,-1)", function () {
            var path = new Path('a/b/c');
            expect(path.parent).to.be.instanceof(Path);
            expect(Array.from(path.parent)).to.deep.equal(['a','b'])            
        });
    });

    describe("Path.prototype.leaf", function () {

        it("should return the last key", function () {
            var path = new Path('a/b/c');
            expect(path.leaf).to.equal('c');            
        });
    });

    describe("String(path)", function () {

        it("should chain the path into a string", function () {
            expect(String(new Path('a','b','c'))).to.equal("a/b/c");
        });
    });

    describe("path1.equals(path2)", function () {

        it("should return true if path2 is a path representation of path1", function () {
            var path1 = new Path('a','b','c');
            expect(path1.equals("a/b/c")).to.be.true;
        });
    });

    describe("path1.isSubPathOf(path2)", function () {

        it("should return true if path1 is a subpath of path2", function () {
            expect( (new Path("a/b/c")).isSubPathOf("")).to.be.true;
            expect( (new Path("a/b/c")).isSubPathOf("a")).to.be.true;
            expect( (new Path("a/b/c")).isSubPathOf("a/b")).to.be.true;
            expect( (new Path("a/b/c")).isSubPathOf("a/b/c")).to.be.true;
            expect( (new Path("a/b/c")).isSubPathOf("a/b/c/d")).to.be.false;
            expect( (new Path("a/b/c")).isSubPathOf('a/x')).to.be.false;
        });
    });

    describe("Path.prototype.lookup(obj)", function () {

        it("should return the value at the given path", function () {
            var obj = {'a': {'b': {'c':1} } }            
            expect( (new Path('a/b')).lookup(obj) ).to.deep.equal(obj.a.b);
            expect( (new Path('a/b/c')).lookup(obj) ).to.equal(obj.a.b.c);
        });

        it("should apply to arrays", function () {
            var obj = {'a': ['b', 'c', {'d': ['e','f','g']}] }            
            expect( (new Path('a/2/d/0')).lookup(obj) ).to.equal(obj.a[2].d[0]);
        });

        it("should apply to strings", function () {
            var obj = {'a': "bcdefg" }            
            expect( (new Path('a/2')).lookup(obj) ).to.equal(obj.a[2]);
        });

        it("should return null if the obj doesn't contain this path", function () {
            var obj = {'a': {'b': {'c':1} } }            
            expect( (new Path('a/b/x')).lookup(obj) ).to.be.null;
            expect( (new Path('a/b/c/x')).lookup(obj) ).to.be.null;
        });

        it("should return undefined if trying to access an inherited property of objects", function () {
            var obj = {'a': {'b': {'c':1} } }            
            expect( (new Path('a/isPrototypeOf')).lookup(obj) ).to.be.null;
        });

        it("should return undefined if trying to access a non-index property of arrays", function () {
            var obj = {'a': ['b','c','d'] }
            expect( (new Path('a/length')).lookup(obj) ).to.be.null;
        });

        it("should return undefined if trying to access a non-index property of strings", function () {
            var obj = {'a': "bcdefg" }            
            expect( (new Path('a/length')).lookup(obj) ).to.be.null;
        });
    });
});
