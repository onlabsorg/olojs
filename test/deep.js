
var expect = require('chai').expect;
var deep = require('../lib/deep');



describe("Path", function () {

    describe("new deep.Path(str1,str2,str3,...)", function () {

        it("should return an array of segments", function () {
            var path = new deep.Path('a','b','c');
            expect(path).to.be.instanceof(Array);
            expect(path.length).to.equal(3);
            expect(path[0]).to.equal('a');
            expect(path[1]).to.equal('b');
            expect(path[2]).to.equal('c');
        });

        it("should ignore empty or undefined strings", function () {
            var path = new deep.Path('a','','b',undefined,'c');
            expect(path).to.be.instanceof(Array);
            expect(path.length).to.equal(3);
            expect(path[0]).to.equal('a');
            expect(path[1]).to.equal('b');
            expect(path[2]).to.equal('c');
        });

        it("should make segments from dot-separated strings",function () {
            var path = new deep.Path('a.b','c');
            expect(path).to.be.instanceof(Array);
            expect(path.length).to.equal(3);
            expect(path[0]).to.equal('a');
            expect(path[1]).to.equal('b');
            expect(path[2]).to.equal('c');
        });

        it("should translate [i] as a number", function () {
            expect(new deep.Path("a.b[1].c")).to.deep.equal(['a','b',1,'c']);
            expect(new deep.Path("[1].a.b.c")).to.deep.equal([1,'a','b','c']);
            expect(new deep.Path("[1][2].a.b.c")).to.deep.equal([1,2,'a','b','c']);
            expect(new deep.Path("a.b.c[1]")).to.deep.equal(['a','b','c',1]);
        });
    });

    describe("new deep.Path(arr1,arr2,arr3,...)", function () {

        it("should return an array joining the parameter array", function () {
            var path = new deep.Path(['a'],['b','c']);
            expect(path).to.be.instanceof(Array);
            expect(path.length).to.equal(3);
            expect(path[0]).to.equal('a');
            expect(path[1]).to.equal('b');
            expect(path[2]).to.equal('c');
        });

        it("should ignore empty or undefined arrays", function () {
            var path = new deep.Path(['a'],[],['b'],undefined,['c']);
            expect(path).to.be.instanceof(Array);
            expect(path.length).to.equal(3);
            expect(path[0]).to.equal('a');
            expect(path[1]).to.equal('b');
            expect(path[2]).to.equal('c');
        });

        it("should make segments from dot-separate string items", function () {
            var path = new deep.Path(['a'],['b.c']);
            expect(path).to.be.instanceof(Array);
            expect(path.length).to.equal(3);
            expect(path[0]).to.equal('a');
            expect(path[1]).to.equal('b');
            expect(path[2]).to.equal('c');
        });
    });

    describe("new deep.Path(str1,arr2,str3,path4,...)", function () {

        it("should mixin string segments and array segment in an array", function () {
            var path = new deep.Path('a',['b','c'], new deep.Path("d.e"));
            expect(path).to.be.instanceof(Array);
            expect(path.length).to.equal(5);
            expect(path).to.deep.equal(['a','b','c','d','e']);
        });
    });

    describe("Path.prototype.slice(start,end)", function () {
        it("should return a slice of the path", function () {
            var path = new deep.Path('a.b.c.d.e.f.g');
            expect(path.slice(1,2)).to.be.instanceof(deep.Path);
            expect(path.slice(2,-2)).to.deep.equal(['c','d','e'])
        });
    });

    describe("Path.prototype.lookup(obj)", function () {
        var path,obj;

        it("should return the value at the given path", function () {
            path = new deep.Path('a','b','c');
            obj  = {a:{b:{c:1}}};
            expect(path.lookup(obj)).to.equal(1);

            path = new deep.Path('a',1);
            obj  = {a:[1,2,3]};
            expect(path.lookup(obj)).to.equal(2);
        });

        it("should return undefined if the obj doesn't have this path", function () {

            path = new deep.Path('a','b','c');
            obj  = {a:{b:1}};
            expect(path.lookup(obj)).to.be.undefined;

            path = new deep.Path('a','b','c');
            obj  = null;
            expect(path.lookup(obj)).to.be.undefined;

            path = new deep.Path('a','b','c');
            obj  = "xxx";
            expect(path.lookup(obj)).to.be.undefined;
        });    

        it("should return undefined if the object types on the path don't match the key type", function () {
            obj = {'1':'xxx'};

            path = new deep.Path('1');
            expect(path.lookup(obj)).to.equal('xxx');

            path = new deep.Path(1);
            expect(path.lookup(obj)).to.be.undefined;

            var arr = [1,2,3];

            path = new deep.Path(1);
            expect(path.lookup(arr)).to.equal(2);

            path = new deep.Path('1');
            expect(path.lookup(arr)).to.be.undefined;
        });
    });

    describe("String(path)", function () {
        it("should chain the path into a string", function () {
            expect(String(new deep.Path('a','b',1,'c'))).to.equal("a.b[1].c");
            expect(String(new deep.Path(1,'a','b','c'))).to.equal("[1].a.b.c");
        });
    });
});



describe("deep.equal(obj1, obj2)", function () {

    it("should return true if the two parameters are deeply equal", function () {

        // number comparison
        expect(deep.equal(1,1)).to.be.true;
        expect(deep.equal(1,2)).to.be.false;

        // string comparison
        expect(deep.equal("abc","abc")).to.be.true;
        expect(deep.equal("abc","ab")).to.be.false;

        // boolean comparison
        expect(deep.equal(true,true)).to.be.true;
        expect(deep.equal(true,false)).to.be.false;

        // different types comparison
        expect(deep.equal(1,"1")).to.be.false;
        expect(deep.equal(0,false)).to.be.false;
        expect(deep.equal(0,null)).to.be.false;
        expect(deep.equal(null,"")).to.be.false;
        expect(deep.equal(null,{})).to.be.false;
        expect(deep.equal([],{})).to.be.false;

        // objects comparison
        expect(deep.equal( {a:1, b:2, c:3} , {a:1, b:2, c:3} )).to.be.true;
        expect(deep.equal( {a:1, b:2, c:3} , {a:1, b:2, c:4} )).to.be.false;
        expect(deep.equal( {a:1, b:2, c:3} , {a:1, b:2, d:3} )).to.be.false;
        expect(deep.equal( {a:1, b:2, c:3} , {a:1, b:2, c:3, d:4} )).to.be.false;

        expect(deep.equal( {a:1, b:{c:3}} , {a:1, b:{c:3}} )).to.be.true;
        expect(deep.equal( {a:1, b:{c:3}} , {a:1, b:{c:4}} )).to.be.false;
        expect(deep.equal( {a:1, b:{c:3}} , {a:1, b:{c:3, d:4}} )).to.be.false;
        expect(deep.equal( {a:1, b:{c:3}} , {a:1, b:{d:3}} )).to.be.false;
        expect(deep.equal( {a:1, b:{c:3}} , {a:1, b:{}} )).to.be.false;

        // arrays comparison
        expect(deep.equal( [1,2,3] , [1,2,3] )).to.be.true;
        expect(deep.equal( [1,2,3] , [1,2,4] )).to.be.false;
        expect(deep.equal( [1,2,3] , [1,2] )).to.be.false;
        expect(deep.equal( [1,2] , [1,2,3] )).to.be.false;

        expect(deep.equal( [1,2,[3,4,5]] , [1,2,[3,4,5]] )).to.be.true;
        expect(deep.equal( [1,2,[3,4,5]] , [1,2,[3,4,6]] )).to.be.false;
        expect(deep.equal( [1,2,[3,4]] , [1,2,[3,4,5]] )).to.be.false;
        expect(deep.equal( [1,2,[3,4,5]] , [1,2,[3,4]] )).to.be.false;
    });

    it("should delegate the object comparison to the obj1[$equal] method if it exists", function () {
        var obj1 = {x:10}
        obj1[deep.$equal] = function (other) {
            return other === null;  //obj1 equals only to null and to itself
        }

        var obj2 = {x:10}
        obj2[deep.$equal] = obj1[deep.$equal];

        expect(deep.equal(obj1,null)).to.be.true;
        expect(deep.equal(obj1,obj1)).to.be.true;

        expect(deep.equal(obj1,obj2)).to.be.false;
        expect(deep.equal(obj2,{x:10})).to.be.false;
    });
});



describe("deep.copy(obj)", function () {

    it("should return a deep copy of the given object", function () {

        // primitive values copy
        expect(deep.copy(1)).to.equal(1);
        expect(deep.copy("abc")).to.equal("abc");
        expect(deep.copy(true)).to.be.true;
        expect(deep.copy(null)).to.be.null;

        // objects copy
        var obj;

        obj = {a:1, b:2, c:3};
        expect(deep.copy(obj)).to.not.equal(obj);
        expect(deep.copy(obj)).to.deep.equal(obj);
        expect(deep.equal(deep.copy(obj), obj)).to.be.true;

        obj = {a:1, b:2, c: {d:4, e:5}};
        expect(deep.copy(obj)).to.not.equal(obj);
        expect(deep.copy(obj)).to.deep.equal(obj);
        expect(deep.equal(deep.copy(obj), obj)).to.be.true;

        obj = {};
        expect(deep.copy(obj)).to.not.equal(obj);
        expect(deep.copy(obj)).to.deep.equal(obj);
        expect(deep.equal(deep.copy(obj), obj)).to.be.true;


        // arrays copy
        var arr;

        arr = [1,2,3];
        expect(deep.copy(arr)).to.not.equal(arr);
        expect(deep.copy(arr)).to.deep.equal(arr);
        expect(deep.equal(deep.copy(arr), arr)).to.be.true;

        arr = [1,2,[3,4,[5,6]]];
        expect(deep.copy(arr)).to.not.equal(arr);
        expect(deep.copy(arr)).to.deep.equal(arr);
        expect(deep.equal(deep.copy(arr), arr)).to.be.true;

        arr = [];
        expect(deep.copy(arr)).to.not.equal(arr);
        expect(deep.copy(arr)).to.deep.equal(arr);
        expect(deep.equal(deep.copy(arr), arr)).to.be.true;
    });

    it("should delegate the object copy to the obj[$copy] method if it exists", function () {
        var obj = {x:10}
        obj[deep.$copy] = function () {
            return "obj copy";  //obj copy is always the "obj copy" string
        }

        expect(deep.copy(obj)).to.equal("obj copy");
    });
});



describe("Change", function () {

    describe("Change.prototype.apply(obj)", function () {

        describe("apply on objects", function () {

            it("should apply the change to obj", function () {
                var obj = {'a':{'b':1}};
                var change = new deep.Change(['a','b'], 1, 2);
                var retval = change.apply(obj);
                expect(obj).to.deep.equal({'a':{'b':2}});
                expect(retval).to.equal(change);

                var obj = {'a':{'b':1}}
                var change = new deep.Change(['a','b'], 1);
                var retval = change.apply(obj);
                expect(obj).to.deep.equal({'a':{}});
                expect(retval).to.equal(change);

                var obj = {'a':{'b':1}}
                var change = new deep.Change(['a','c'], undefined, 2);
                var retval = change.apply(obj);
                expect(obj).to.deep.equal({'a':{'b':1,'c':2}});
                expect(retval).to.equal(change);

                var obj = {'a':[1,2,3]}
                var change = new deep.Change(['a',3], undefined, 4);
                var retval = change.apply(obj);
                expect(obj).to.deep.equal({'a':[1,2,3,4]});
                expect(retval).to.equal(change);
            });

            it("should not apply the change when the type doesn't mathc", function () {
                var obj = {'a':{'1':"xxx"}};
                var change = new deep.Change(['a',1], "xxx", "yyy");
                var retval = change.apply(obj);
                expect(obj).to.deep.equal({'a':{'1':"xxx"}});
                expect(retval).to.be.null;            
            });

            it("should not apply the change when the old value doesn't match", function () {
                var obj = {'a':{'b':1}};
                var change = new deep.Change(['a','b'], 5, 2);
                var retval = change.apply(obj);
                expect(obj).to.deep.equal({'a':{'b':1}});
                expect(retval).to.be.null;
            });

            it("should return null when the change doesn't affect the object", function () {
                var obj = {a:1, b:2, c:3};

                var change = new deep.Change(['a'], 1, 1);
                var retval = change.apply(obj);
                expect(obj).to.deep.equal({a:1, b:2, c:3});
                expect(retval).to.be.null;

                var change = new deep.Change(['d'], undefined, undefined);
                var retval = change.apply(obj);
                expect(obj).to.deep.equal({a:1, b:2, c:3});
                expect(retval).to.be.null;
            });
        });

        describe("apply on arrays", function () {

            it("should apply the change to the array", function () {
                var a = ['a','b','c'];
                var change = new deep.Change([1], 'b', 'bb');
                var retval = change.apply(a);
                expect(a).to.deep.equal(['a','bb','c']);
                expect(retval).to.equal(change);

                var a = ['a','b','c'];
                var change = new deep.Change([1], 'b');
                var retval = change.apply(a);
                expect(a).to.deep.equal(['a','c']);
                expect(retval).to.equal(change);

                var a = ['a','b','c'];
                var change = new deep.Change([1], undefined, 'ab');
                var retval = change.apply(a);
                expect(a).to.deep.equal(['a','ab','b','c']);
                expect(retval).to.equal(change);
            });

            it("should not apply the change when the type doesn't mathc", function () {
                var a = ['a','b','c'];
                var change = new deep.Change(['1'], 'b', 'bb');
                var retval = change.apply(a);
                expect(a).to.deep.equal(['a','b','c']);
                expect(retval).to.be.null;
            });

            it("should not apply the change when the old value doesn't match", function () {
                var a = ['a','b','c'];
                var change = new deep.Change([1], 'x', 'bb');
                var retval = change.apply(a);
                expect(a).to.deep.equal(['a','b','c']);
                expect(retval).to.be.null;
            });

            it("should return null when the change doesn't affect the array", function () {
                var a = ['a','b','c'];

                var change = new deep.Change([1], 'b', 'b');
                var retval = change.apply(a);
                expect(a).to.deep.equal(['a','b','c']);
                expect(retval).to.be.null;

                var change = new deep.Change([1], undefined, undefined);
                var retval = change.apply(a);
                expect(a).to.deep.equal(['a','b','c']);
                expect(retval).to.be.null;

                var change = new deep.Change([-10], undefined, 10);
                var retval = change.apply(a);
                expect(a).to.deep.equal(['a','b','c']);
                expect(retval).to.be.null;

                var change = new deep.Change([10], undefined, 10);
                var retval = change.apply(a);
                expect(a).to.deep.equal(['a','b','c']);
                expect(retval).to.be.null;
            });
        });

        describe("apply to custom objects", function () {
            it("should delegate the object change to the obj[$change] method if it exists", function () {
                var obj = {a:{}}
                obj.a[deep.$change] = function (key, oldVal, newVal) {
                    return `changing ${key} from ${oldVal} to ${newVal}`;
                }

                var change = new deep.Change('a.x',1,2);
                expect(change.apply(obj)).to.equal("changing x from 1 to 2");

                var change = new deep.Change('x',1,1);
                expect(change.apply(obj)).to.be.null;
            });
        });
    });

    describe("Change.prototype.SubChange(path)", function () {

        it("should return the change with a relative path when the changed path is under the given sub-path", function () {
            var change,subChange;

            change = new deep.Change("a.b.c", 1, 2);

            subChange = change.SubChange("a.b");
            expect(String(subChange.path)).to.equal("c");
            expect(subChange.old).to.equal(1);
            expect(subChange.new).to.equal(2);

            subChange = change.SubChange("a");
            expect(String(subChange.path)).to.equal("b.c");
            expect(subChange.old).to.equal(1);
            expect(subChange.new).to.equal(2);

            subChange = change.SubChange("");
            expect(String(subChange.path)).to.equal("a.b.c");
            expect(subChange.old).to.equal(1);
            expect(subChange.new).to.equal(2);

            subChange = change.SubChange("a.b.c");
            expect(String(subChange.path)).to.equal("");
            expect(subChange.old).to.equal(1);
            expect(subChange.new).to.equal(2);
        });

        it("should return an empty-path change with old and new value of the model when a parent path changes", function () {
            var change, subChange;

            change = new deep.Change("a.b", {c:{x:1}}, {c:{y:1}});
            subChange = change.SubChange("a.b.c.x");
            expect(String(subChange.path)).to.equal("");
            expect(subChange.old).to.equal(1);
            expect(subChange.new).to.be.undefined;

            change = new deep.Change("a.b", {c:{x:1}}, {c:{x:2}});
            subChange = change.SubChange("a.b.c.x");
            expect(String(subChange.path)).to.equal("");
            expect(subChange.old).to.equal(1);
            expect(subChange.new).to.equal(2);

            change = new deep.Change("a.b", {c:{x:1}}, 1);
            subChange = change.SubChange("a.b.c.x");
            expect(String(subChange.path)).to.equal("");
            expect(subChange.old).to.equal(1);
            expect(subChange.new).to.be.undefined;

            change = new deep.Change("a.b", 1, {c:{x:2}});
            subChange = change.SubChange("a.b.c.x");
            expect(String(subChange.path)).to.equal("");
            expect(subChange.old).to.be.undefined;
            expect(subChange.new).to.equal(2);
        });

        it("should return null if the change doesn't affect the sub-path", function () {
            var change = new deep.Change("a.b.c", 1, 2);
            expect(change.SubChange("a.b.d")).to.be.null;
        });
    });
});



describe("deep.diff(val1, val2)", function () {

    it("should return an empty list if the two values are equal", function () {
        var oldVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3]};
        var newVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3]};
        var changes = deep.diff(oldVal, newVal);
        expect(changes).to.deep.equal([]);
        expect(deep.diff(1,1)).to.deep.equal([]);
        expect(deep.diff("abc","abc")).to.deep.equal([]);
        expect(deep.diff([1,2,3],[1,2,3])).to.deep.equal([]);
    });

    it("should return an array with one change item if val1 and val2 are completely different", function () {
        var oldVal, newVal;

        oldVal = 1;
        newVal = 2;
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [],
            old  : oldVal,
            new  : newVal
        }]);
        
        oldVal = [1,2,3];
        newVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3]};
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [],
            old  : oldVal,
            new  : newVal
        }]);

        oldVal = undefined;
        newVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3]};
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [],
            new  : newVal
        }]);

        oldVal = [1,2,3];
        newVal = undefined;
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [],
            old  : oldVal,
        }]);
    });

    it("should return the minimal array of changes if the two values are different", function () {
        var oldVal, newVal;

        
        // Object diff

        oldVal = {'a':2, 'b':2, 'c':{'d':3}, 'e':[1,2,3]};
        newVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3]};
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : ['a'],
            old  : 2,
            new  : 1
        }]);

        oldVal = {'a':1,        'c':{'d':3}, 'e':[1,2,3]};
        newVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3]};
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : ['b'],
            new  : 2
        }]);

        oldVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3], 'f':4};
        newVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3]};
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : ['f'],
            old  : 4
        }]);


        // Array diff

        oldVal = [1,2,3];
        newVal = [1,2,4];
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [2],
            old  : 3,
            new  : 4
        }]);

        oldVal = [1,2,3,4];
        newVal = [1,2,3];
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [3],
            old  : 4,
        }]);

        oldVal = [1,2,3];
        newVal = [1,2,3,4];
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [3],
            new  : 4,
        }]);

        oldVal = [1,2,3,4];
        newVal = [1,2,0,4];
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [2],
            old  : 3,
            new  : 0,
        }]);

        oldVal = [1,2,  4];
        newVal = [1,2,3,4];
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [2],
            new  : 3,
        }]);

        oldVal = [1,2,3,4];
        newVal = [1,2,  4];
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [2],
            old  : 3,
        }]);

        oldVal = [1,2,3,4];
        newVal = [  2,3,4];
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [0],
            old  : 1,
        }]);

        oldVal = [  2,3,4];
        newVal = [1,2,3,4];
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [0],
            new  : 1,
        }]);


        // Nested diff

        oldVal = {'a':1, 'b':2, 'c':{'d':30}, 'e':[1,2,3]};
        newVal = {'a':1, 'b':2, 'c':{'d': 3}, 'e':[1,2,3]};
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : ['c','d'],
            old  : 30,
            new  : 3
        }]);

        oldVal = {'a':1, 'b':2, 'c':{},      'e':[1,2,3]};
        newVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3]};
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : ['c','d'],
            new  : 3
        }]);

        oldVal = {'a':1, 'b':2, 'c':{'d':3, 'f':4}, 'e':[1,2,3]};
        newVal = {'a':1, 'b':2, 'c':{'d':3       }, 'e':[1,2,3]};
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : ['c','f'],
            old  : 4
        }]);

        oldVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3,4]};
        newVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3]};
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : ['e',3],
            old  : 4
        }]);

        oldVal = [1,2,{a:3}];
        newVal = [1,2,{a:4}];
        expect(deep.diff(oldVal, newVal)).to.deep.equal([{
            path : [2,'a'],
            old  : 3,
            new  : 4
        }]);


        // Multiple diffs
        var change1, change2, change3, changes;

        oldVal = {'a':2, 'b':2, 'c':{'d':3}, 'e':[1,2,4]};
        newVal = {'a':1, 'b':2, 'c':{'d':3}, 'e':[1,2,3]};
        changes = deep.diff(oldVal,newVal);
        change1 = {path:['a'], old:2, new:1};
        change2 = {path:['e',2], old:4, new:3};
        expect(deep.equal(changes,[change1,change2]) || deep.equal(changes,[change2,change1])).to.be.true;

        oldVal = [10, {a:20}, 30, 40];
        newVal = [10, {a:21}, 30, 41];
        changes = deep.diff(oldVal,newVal);
        change1 = {path:[1,'a'], old:20, new:21};
        change2 = {path:[3], old:40, new:41};
        expect(changes).to.deep.deep.equal([change1,change2]);

        oldVal = [10, 30, 41, 50];
        newVal = [10, 20, 30, 40, 50];
        changes = deep.diff(oldVal,newVal);
        change1 = {path:[1], old:30, new:20};
        change2 = {path:[2], old:41, new:30};
        change3 = {path:[3], new:40};
        expect(changes).to.deep.equal([change1, change2, change3]);
    });
});


describe("deep.assign(obj1, obj2)", function () {

    it("should change obj1 to make it equal to obj2 and return the applied changes", function () {
        var obj1, obj2, changes;

        obj1 = {a:1, b:2, c:3};
        changes = deep.assign(obj1, {a:1, b:2, c:30});
        expect(obj1).to.deep.equal({a:1, b:2, c:30});
        expect(changes).to.deep.equal([{path:['c'], old:3, new:30}]);

        var arr1 = [1,2,3];
        changes = deep.assign(arr1, [1,2,30]);
        expect(arr1).to.deep.equal([1,2,30]);
        expect(changes).to.deep.equal([{path:[2], old:3, new:30}]);

        obj1 = {a:1, b:2, c:[1,2,3], d:{x:10,y:20,z:30}};
        obj2 = {s:"abc", c:[1,'i']};
        changes = deep.assign(obj1, obj2);
        expect(obj1).to.deep.equal(obj2);
    });

    it("should throw TypeError if trying to assign a different type", function () {
        var oo = {a:1, b:2, c:3};        
        expect(function () {deep.assign(oo,"")}).to.throw(TypeError);
        expect(function () {deep.assign(oo,[])}).to.throw(TypeError);
        expect(function () {deep.assign(oo,null)}).to.throw(TypeError);        
    });
});

