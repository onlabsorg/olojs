
var expect = require('chai').expect;

var deep = require("../lib/deep");
var Path = deep.Path;
var Change = deep.Change;

var observable = require('../lib/observable');
var ObservableObject = observable.ObservableObject;
var ObservableArray = observable.ObservableArray;
var Observable = observable.Observable;
var Subscription = observable.Subscription;



describe("ObservableObject", function () {

    describe("value = observableObject[key]", function () {

        it("should return the key value", function () {
            var oo = new ObservableObject({a:1, b:2, c:3});
            expect(oo.a).to.equal(1);
            expect(oo.b).to.equal(2);
            expect(oo.c).to.equal(3);
            expect(oo.d).to.be.undefined;
        });

        it("should lookup the prototype chain when the key is undefined", function () {
            class XObs extends ObservableObject {
                get y () {return 20}
            }
            var xo = new XObs({x:10});
            expect(xo.x).to.equal(10);
            expect(xo.y).to.equal(20);
            expect(xo.z).to.be.undefined;
        });
    });

    describe("observableObject[key] = value", function () {

        it("should set the key to the value", function () {
            var oo = new ObservableObject();
            oo.x = 10;
            expect(oo.x).to.equal(10)
            expect(oo.y).to.be.undefined;
            oo.x = 11;
            expect(oo.x).to.equal(11);
        });

        it("should assign plain objects as ObservableObject instances", function () {
            var oo = new ObservableObject();
            var o = {v:{x:3,y:4}, z:5};
            oo.o = o;
            expect(oo.o).to.be.instanceof(ObservableObject);
            expect(oo.o.v).to.be.instanceof(ObservableObject);
            expect(oo.o.v.x).to.equal(3);
            expect(oo.o.v.y).to.equal(4);
            expect(oo.o.z).to.equal(5);
            oo.o.v.x = 30;
            expect(o.v.x).to.equal(3);
        });

        it("should assign plain arrays as ObservableArray instances", function () {
            var oo = new ObservableObject();
            var a = ['a','b','c'];
            oo.a = a;
            expect(oo.a).to.be.instanceof(ObservableArray);
            expect(oo.a[0]).to.equal('a');
            expect(oo.a[1]).to.equal('b');
            expect(oo.a[2]).to.equal('c');
        });

        it("should assign observables as observable objects", function () {
            var oo = new ObservableObject();

            var coo = new ObservableObject();
            oo.coo = coo;
            expect(oo.coo).to.equal(coo);

            var coa = new ObservableArray();
            oo.coa = coa;
            expect(oo.coa).to.equal(coa);

            class XObsObj extends ObservableObject {}
            var cxoo = new XObsObj();
            oo.cxoo = cxoo;
            expect(oo.cxoo).to.equal(cxoo);
        });

        it("should raise an Error when assigning a non-valid type", function () {
            var oo = new ObservableObject();
            oo.s = "abc";
            oo.n = 123;
            oo.b = true;
            oo.z = null;
            oo.z = undefined;
            function assign_function () {oo.foo = function () {}};
            expect(assign_function).to.throw(TypeError);
        });
    });

    describe("delete observableObject[key]", function () {

        it("should remove the item from the object", function () {
            var oo = new ObservableObject({x:1, y:2, z:3});
            expect(deep.equal(oo, {x:1, y:2, z:3})).to.be.true;

            delete oo.y;
            expect(deep.equal(oo, {x:1, z:3})).to.be.true;

            delete oo.z;
            expect(deep.equal(oo, {x:1})).to.be.true;
        });
    });

    describe("Reflect.ownKeys(observableObject)", function () {

        it("should return the observable keys", function () {
            var oo = new ObservableObject({a:1,b:2,c:3});
            var keys = Reflect.ownKeys(oo);
            expect(keys.length).to.equal(3);
            expect(keys.includes('a')).to.be.true;
            expect(keys.includes('b')).to.be.true;
            expect(keys.includes('c')).to.be.true;
        });
    });

    describe("key in observableObject", function () {
        it("should return true if the key is an objservable property", function () {
            var oo = new ObservableObject({a:1,b:2,c:3});
            expect('a' in oo).to.be.true;
            expect('b' in oo).to.be.true;
            expect('c' in oo).to.be.true;
            expect('x' in oo).to.be.false;
        });
    });
});



describe("ObservableArray", function () {

    it("should produce an ObservableObject instance", function () {
        var oa = new ObservableArray();
        expect(oa).to.be.instanceof(ObservableArray);
        expect(oa).to.be.instanceof(ObservableObject);
    });

    it("should toString-ify to '[object Array]'", function () {
        var oa = new ObservableArray();
        expect(Object.prototype.toString.call(oa)).to.equal("[object Array]");
    });

    describe("observableArray.length", function () {
        it("should return the number of items in the array", function () {            
            var oa = new ObservableArray(['a','b','c']);
            expect(oa.length).to.equal(3);
        });        
    });

    describe("item of observableArray", function () {
        it("should iterate over the array items", function () {
            var oa = new ObservableArray(['a','b','c']);
            var mirror = [];
            for (let item of oa) mirror.push(item);
            expect(mirror).to.deep.equal(['a','b','c']);
            expect(Array.from(oa)).to.deep.equal(['a','b','c']);
        });        
    });

    describe("value = observableArray[index]", function () {

        it("should return the item at the given index", function () {
            var oa = new ObservableArray(['a','b','c']);
            expect(oa[0]).to.equal('a');
            expect(oa[1]).to.equal('b');
            expect(oa[2]).to.equal('c');
            expect(oa['2']).to.equal('c');
        });

        it("should return undefined when the index is out of range", function () {
            var oa = new ObservableArray(['a','b','c']);
            expect(oa[3]).to.be.undefined;
            expect(oa[-4]).to.be.undefined;
        });

        it("should lookup the prototype chain when index is not a number", function () {
            class XOArr extends ObservableArray {
                get x () {return 10}
                get ["1.2"] () {return 1.2}
            }
            var oa = new XOArr(['a','b','c']);
            expect(oa.x).to.equal(10);
            expect(oa["1.2"]).to.equal(1.2);
            expect(oa.push).to.be.a("function");
            expect(oa.y).to.be.undefined;
        });
    });

    describe("observableArray[index] = value", function () {

        it("should set the item at index to the value", function () {
            var oa = new ObservableArray(['a','b','c','d','e']);
            oa[1] = 'bb';
            expect(Array.from(oa)).to.deep.equal(['a','bb','c','d','e']);
        });

        it("should remove the item when assigning undefined", function () {
            var oa = new ObservableArray(['a','b','c']);
            oa[1] = undefined;
            expect(Array.from(oa)).to.deep.equal(['a','c']);
        });

        it("should assign plain objects as observable objects", function () {
            var oa = new ObservableArray(['a','b','c','d','e']);
            var o = {v:{x:3,y:4}, z:5};
            oa[1] = o;
            expect(oa[1]).to.be.instanceof(ObservableObject);
            expect(deep.copy(oa[1])).to.deep.equal(o);
            oa[1].v.x = 30;
            expect(o.v.x).to.equal(3);
        });

        it("should assign plain arrays as observable arrays", function () {
            var oa = new ObservableArray(['a','b','c','d','e']);
            var a = [1,2,3];
            oa[1] = a;
            expect(oa[1]).to.be.instanceof(ObservableArray);
            expect(Array.from(oa[1])).to.deep.equal(a);
            oa[1][2] = 30;
            expect(a[2]).to.equal(3);
        });

        it("should assign observables as observable objects", function () {
            var oa = new ObservableArray(['a','b','c','d','e']);

            var coo = new ObservableObject();
            oa[1] = coo;
            expect(oa[1]).to.equal(coo);
            
            var coa = new ObservableArray();
            oa[2] = coa;
            expect(oa[2]).to.equal(coa);

            class XObsArr extends ObservableArray {}
            var cxoa = new XObsArr();
            oa[3] = cxoa;
            expect(oa[3]).to.equal(cxoa);            
        });

        it("should raise a TypeError when assigning a non-valid type", function () {
            var oa = new ObservableArray([1,2,3,4,5,6,7]);
            oa[1] = "abc";
            oa[1] = 123;
            oa[1] = true;
            function assign_function () {oa[1] = function () {}};
            expect(assign_function).to.throw(TypeError);
        });

        it("should raise an error if index is not a number", function () {
            var oa = new ObservableArray([1,2,3]);
            function set_key () { oa['key'] = 4 }
            expect(set_key).to.throw(Error);  
            expect(oa.key).to.be.undefined;
        });        

        it("should append the item to the array in index equals the length", function () {
            var oa = new ObservableArray(['a','b','c']);
            oa[3] = 'd';
            expect(Array.from(oa)).to.deep.equal(['a','b','c','d']);
        });

        it("should throw an error if index is out of range", function () {
            var oa = new ObservableArray(['a','b','c']);
            expect(function () { oa[100]='x' }).to.throw(Error);
            expect(function () { oa[-100]='x' }).to.throw(Error);
            expect(Array.from(oa)).to.deep.equal(['a','b','c']);
        });
    });

    describe("delete observableArray[key]", function () {

        it("should remove the item at the given position", function () {
            var oa = new ObservableArray(['a','b','c','d','e']);
            delete oa[1];
            expect(Array.from(oa)).to.deep.equal(['a','c','d','e']);
        });

        it("should raise an error if index is not a number", function () {
            var oa = new ObservableArray([1,2,3]);
            function del_key () { delete oa['length'] }
            expect(del_key).to.throw(Error);
            expect(oa.length).to.equal(3);
        });        

        it("should throw an error if index is out of range", function () {
            var oa = new ObservableArray(['a','b','c']);
            expect(function () { delete oa[100] }).to.throw(Error);
            expect(function () { delete oa[-100] }).to.throw(Error);
            expect(function () { delete oa[oa.length] }).to.throw(Error);            
            expect(Array.from(oa)).to.deep.equal(['a','b','c']);
        });
    });

    describe("observableArray.push(item, index)", function () {

        it("should insert a new item at the given position", function () {
            var oa = new ObservableArray(['a','b','c']);
            oa.push('ab',1);
            expect(Array.from(oa)).to.deep.equal(['a','ab','b','c']);
        });

        it("should append the new item at the end if index is omitted or if index = lenght", function () {
            var oa = new ObservableArray(['a','b','c']);

            oa.push('d',3);
            expect(Array.from(oa)).to.deep.equal(['a','b','c','d']);

            oa.push('e');
            expect(Array.from(oa)).to.deep.equal(['a','b','c','d','e']);
        });

        it("should throw an Error if index is not a number", function () {
            var oa = new ObservableArray([1,2,3]);
            function push_to_key () { oa.push('value', 'key')}
            expect(push_to_key).to.throw(Error);
        });        

        it("should throw an error if index is out of range", function () {
            var oa = new ObservableArray(['a','b','c']);
            expect(function () { oa.push('x',100) }).to.throw(Error);
            expect(function () { oa.push('x',-100) }).to.throw(Error);
            expect(Array.from(oa)).to.deep.equal(['a','b','c']);
        });
    });

    describe("observableArray.pop(index)", function () {

        it("should remove and return the item at the given position", function () {
            var oa = new ObservableArray(['a','b','c','d','e']);

            var item = oa.pop(1);
            expect(item).to.equal('b');
            expect(Array.from(oa)).to.deep.equal(['a','c','d','e']);
        });

        it("should remove the last item if index is omitted", function () {
            var oa = new ObservableArray(['a','b','c','d','e']);
            var item = oa.pop();
            expect(item).to.equal('e');
            expect(Array.from(oa)).to.deep.equal(['a','b','c','d']);
        });

        it("should raise an error if index is not a number", function () {
            var oa = new ObservableArray([1,2,3]);
            function pop_key () { oa.pop('key')}
            expect(pop_key).to.throw(Error);            
        });        

        it("should throw an error if index is out of range", function () {
            var oa = new ObservableArray(['a','b','c']);
            expect(function () { oa.pop(100) }).to.throw(Error);
            expect(function () { oa.pop(-100) }).to.throw(Error);
            expect(function () { oa.pop(oa.length) }).to.throw(Error);
            expect(Array.from(oa)).to.deep.equal(['a','b','c']);
        });
    });

    describe("observableArray.splice(index, delCount, ...items)", function () {

        it("should pop delCount items and add items at index", function () {
            var oa = new ObservableArray(['a','b','c','d']);
            oa.splice(1, 2, 'x1', 'x2', 'x3');
            expect(Array.from(oa)).to.deep.equal(['a','x1','x2','x3','d']);
        });

        it("should throw an error if index is not a number", function () {
            var oa = new ObservableArray(['a','b','c']);
            expect(function () { oa.splice('key',1,'x')}).to.throw(Error);
            expect(Array.from(oa)).to.deep.equal(['a','b','c']);
        });

        it("should throw an error if index is out of range", function () {
            var oa = new ObservableArray(['a','b','c']);
            expect(function () { oa.splice(100,2,'x') }).to.throw(Error);
            expect(function () { oa.splice(-100,2,'x') }).to.throw(Error);
            expect(function () { oa.splice(oa.length,2,'x') }).to.throw(Error);
            expect(Array.from(oa)).to.deep.equal(['a','b','c']);

            expect(function () { oa.splice(1,20,'x') }).to.throw(Error);
            expect(Array.from(oa)).to.deep.equal(['a']);
        });
    });

    describe("observableArray.indexOf(item)", function () {

        it("should return the position of item in the array or -1", function () {
            var oa = new ObservableArray(['a','b','c']);
            expect(oa.indexOf('a')).to.equal(0);
            expect(oa.indexOf('b')).to.equal(1);
            expect(oa.indexOf('c')).to.equal(2);
            expect(oa.indexOf('d')).to.equal(-1);
        });
    });

    describe("observableArray.includes(item)", function () {

        it("should return true if array contains the item", function () {
            var oa = new ObservableArray(['a','b','c']);
            expect(oa.includes('a')).to.be.true;
            expect(oa.includes('b')).to.be.true;
            expect(oa.includes('c')).to.be.true;
            expect(oa.includes('d')).to.be.false;
        });
    });
});



describe("Subscription", function () {

    var lastChange, callback;

    before(function () {
        callback = function (change) {
            lastChange = change;
        }
    });

    it("should callback on ObservableObject assign operation", function () {
        var oo = new ObservableObject({x:1});
        var subscription = new Subscription(oo, callback);

        oo.x = 10;
        expect(lastChange.path).to.deep.equal(['x']);
        expect(lastChange.old).to.equal(1);
        expect(lastChange.new).to.equal(10);

        oo.x = undefined;
        expect(lastChange.path).to.deep.equal(['x']);
        expect(lastChange.old).to.equal(10);
        expect(lastChange.new).to.be.undefined;

        oo.y = 20;
        expect(lastChange.path).to.deep.equal(['y']);
        expect(lastChange.old).to.be.undefined;
        expect(lastChange.new).to.equal(20);

        lastChange = null;
        oo.y = 20;
        expect(lastChange).to.be.null;
    });

    it("should callback on ObservableObject delete operation", function () {
        var oo = new ObservableObject({x:1, y:2});
        var subscription = new Subscription(oo, callback);

        delete oo.y;
        expect(lastChange.path).to.deep.equal(['y']);
        expect(lastChange.old).to.equal(2);
        expect(lastChange.new).to.be.undefined;

        lastChange = null;
        delete oo.y;
        expect(lastChange).to.be.null;
    });

    it("should callback on ObservableArray assign operations", function () {
        var oa = new ObservableArray(['a','b','c']);
        var subscription = new Subscription(oa, callback);

        oa[1] = 'bb';
        expect(lastChange.path).to.deep.equal([1]);
        expect(lastChange.old).to.equal('b');
        expect(lastChange.new).to.equal('bb');

        oa[1] = undefined;
        expect(lastChange.path).to.deep.equal([1]);
        expect(lastChange.old).to.equal('bb');
        expect(lastChange.new).to.be.undefined;

        lastChange = null;
        oa[0] = 'a';
        expect(lastChange).to.be.null;
    });

    it("should callback on ObservableArray delete operation", function () {
        var oa = new ObservableArray(['a','b','c']);
        var subscription = new Subscription(oa, callback);

        delete oa[1];
        expect(lastChange.path).to.deep.equal([1]);
        expect(lastChange.old).to.equal('b');
        expect(lastChange.new).to.be.undefined;
    });

    it("should callback on ObservableArray push operation", function () {
        var oa = new ObservableArray(['a','b','c']);
        var subscription = new Subscription(oa, callback);

        oa.push('bc',2);
        expect(lastChange.path).to.deep.equal([2]);
        expect(lastChange.old).to.be.undefined;
        expect(lastChange.new).to.equal('bc');

        oa.push('cc');
        expect(lastChange.path).to.deep.equal([4]);
        expect(lastChange.old).to.be.undefined;
        expect(lastChange.new).to.equal('cc');
    });

    it("should callback on ObservableArray splice operation", function () {
        var oa = new ObservableArray(['a','b','c']);
        var subscription = new Subscription(oa, callback);

        oa.splice(1,1);
        expect(lastChange.path).to.deep.equal([1]);
        expect(lastChange.old).to.equal('b');
        expect(lastChange.new).to.be.undefined;

        oa.splice(1,0,'bb');
        expect(lastChange.path).to.deep.equal([1]);
        expect(lastChange.old).to.be.undefined;
        expect(lastChange.new).to.equal('bb');
    });

    it("should callback on sub-key value changes", function () {
        var oo = new ObservableObject({
            a: {
                b: [1,2,{c:3}]
            }
        });
        var subscription = new Subscription(oo, callback);

        oo.a.b[2].c = 30;
        expect(lastChange.path).to.deep.equal(['a','b',2,'c']);
        expect(lastChange.old).to.equal(3);
        expect(lastChange.new).to.equal(30);

        var a = oo.a;
        a.b[0] = 10;
        expect(lastChange.path).to.deep.equal(['a','b',0]);
        expect(lastChange.old).to.equal(1);
        expect(lastChange.new).to.equal(10);

        delete oo.a;
        lastChange = null;
        a.b[1] = 20;
        expect(lastChange).to.be.null;
    });

    it("should prevent recursive dispatching of the same change", function () {
        var op = new ObservableObject();
        var oc = new ObservableObject();
        op.child = {};
        op.child.child = oc;
        oc.child = op;

        var op_count1 = 0;
        var op_sub1 = new Subscription(op, function () {op_count1 += 1});

        var op_count2 = 0;
        var op_sub2 = new Subscription(op, function () {op_count2 += 1});

        var oc_count1 = 0;
        var oc_sub1 = new Subscription(oc, function () {oc_count1 += 1});

        var oc_count2 = 0;
        var oc_sub2 = new Subscription(oc, function () {oc_count2 += 1});

        op.x = 10;
        expect(op_count1).to.equal(1);
        expect(oc_count1).to.equal(1);
        expect(op_count2).to.equal(1);
        expect(oc_count2).to.equal(1);
    });

    it("should not callback anymore once cancelled", function () {
        var oo = new ObservableObject({x:1});
        var subscription = new Subscription(oo, callback);

        lastChange = null;
        oo.x = 10;
        expect(lastChange).to.not.be.null;

        subscription.cancel();

        lastChange = null;
        oo.x = 100;
        expect(lastChange).to.be.null;
    });
});



describe("Auth", function () {

    it("should be called before every write operation", function () {
        var counter = 0;

        class OAuth extends ObservableObject {
            [observable.$auth] (key, oldValue, newValue) {
                counter = counter+1;
                expect(oa[key]).to.equal(oldValue);
                return true;
            }
        }

        var oa = new OAuth();

        oa.x = 10;
        expect(counter).to.equal(1);

        oa.x = 11;
        expect(counter).to.equal(2);

        delete oa.x;
        expect(counter).to.equal(3);
    });

    it("should cause an error to be thrown when it returns false", function () {

        class OAuth extends ObservableObject {
            [observable.$auth] (key, oldValue, newValue) {
                return false;
            }
        }

        var oa = new OAuth();
        expect(function () { oa.x=10 }).to.throw(Error);
    });
});



describe("deep.equal(observable1, observable2)", function () {

    it("should return true if the two objects are deeply equal", function () {
        var o = {a:1, b:2, c:{x:10}, d:[1,2,[3,4,{y:20}]]}

        var oo1 = new ObservableObject(o);
        expect(deep.equal(oo1,o)).to.be.true;

        var oo2 = new ObservableObject(o);
        expect(deep.equal(oo2,o)).to.be.true;

        expect(deep.equal(oo1,oo2)).to.be.true;        
    });
});



describe("deep.copy(observable)", function () {

    it("should return a deep copy of an ObservableObject instance", function () {
        var o = {a:1, b:2, c:3}
        var oo = new ObservableObject(o);
        var oc = deep.copy(oo);
        expect(oc).to.deep.equal(o);
        expect(oc).to.not.equal(o);
        expect(oc).to.not.equal(oo);
    });

    it("should return a deep copy of an ObservableArray instance", function () {
        var a = [1,2,[3,4,5]]
        var oa = new ObservableArray(a);
        var oc = deep.copy(oa);
        expect(oc).to.deep.equal(a);
        expect(oc).to.not.equal(a);
        expect(oc).to.not.equal(oa);
    });
});



describe("deep.assign(observable, value)", function () {

    it("should assign the content of the passed object to the observable", function () {
        var o1 = {a:1, b:2, c:[3,4,5]};
        var oo = new ObservableObject(o1);

        var o2 = {a:10, b:2, c:[3,4,50]};
        deep.assign(oo,o2);
        expect(deep.equal(oo, {a:10, b:2, c:[3,4,50]})).to.be.true;
    });

    it("should return the array of changes", function () {
        var oo = new ObservableObject({a:1, b:2, c:3});

        expect(deep.assign(oo, {a:1,b:2,c:3})).to.deep.equal([]);

        var changes = deep.assign(oo, {a:1,b:2,c:30});
        expect(changes.length).to.equal(1);
        expect(changes[0].path).to.deep.equal(['c']);
        expect(changes[0].old).to.equal(3);
        expect(changes[0].new).to.equal(30);
    });

    it("should throw a TypeError if trying to assign a different type", function () {
        var oo = new ObservableObject({a:1, b:2, c:3});        
        expect(function () {deep.assign(oo,"")}).to.throw(TypeError);
        expect(function () {deep.assign(oo,[])}).to.throw(TypeError);
        expect(function () {deep.assign(oo,null)}).to.throw(TypeError);
    });
});




