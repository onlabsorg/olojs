
const expect = require("chai").expect;

const client = require("../lib/client");
const Change = client.Change;
const Observable = client.Observable;
const ObservableDict = client.ObservableDict;
const ObservableList = client.ObservableList;
const exceptions = client.exceptions;


describe("ObservableDict", () => {

    it("should be a class inheriting from Observable", () => {
        expect(ObservableDict.prototype).to.be.instanceof(Observable);
    });

    describe("ObservableDict.prototype.constructor(dict)", () => {

        it("should initialize a new observable dict", () => {
            var data = {x:1, y:2, z:3};
            var odict = new ObservableDict(data);
            expect(odict._getData()).to.deep.equal(data);

            data = {x:1, y:2, o:{z:3}};
            odict = new ObservableDict(data);
            expect(odict._getData().o).to.be.instanceof(ObservableDict);
            expect(odict._getData().o._getData()).to.deep.equal(data.o);
        });
    });

    describe("ObservableDict[@@iterator]()", () => {
        it("should iterate over the [key, value] pairs of the dict", () => {
            var odict = new ObservableDict({x:1, y:2, z:3});
            var copy = {}
            for (let [key, value] of odict) copy[key] = value;
            expect(copy).to.deep.equal({x:1, y:2, z:3});
        });
    });

    describe("ObservableDict.prototype.getSnapshot()", () => {

        it("should return the ObservableDict as a Javascript plain object", () => {
            var dict = {x:1, y:2, o:{z:3}};
            var odict = new ObservableDict(dict);
            expect(odict.getSnapshot()).to.deep.equal(dict);
        });
    });

    describe("ObservableDict.prototype.size - getter", () => {
        it("should return the number of entries of the dictionary", () => {
            var odict = new ObservableDict({x:1, y:2, z:3});
            expect(odict.size).to.equal(3);
        });
    });

    describe("ObservableDict.prototype.keys()", () => {

        it("should return an iterator", () => {
            var odict = new ObservableDict({x:1, y:2, z:3});
            var keys = odict.keys();
            expect(keys[Symbol.iterator]).to.be.a("function");
        });

        it("should iterate over the dictionary keys", () => {
            var odict = new ObservableDict({x:1, y:2, z:3});
            var keys = [];
            for (let key of odict.keys()) keys.push(key);
            expect(keys.length).to.equal(3);
            expect(keys.sort()).to.deep.equal(['x','y','z']);
        });
    });

    describe("ObservableDict.prototype.values()", () => {

        it("should return an iterator", () => {
            var odict = new ObservableDict({x:1, y:2, z:3});
            var values = odict.values();
            expect(values[Symbol.iterator]).to.be.a("function");
        });

        it("should iterate over the dictionary values", () => {
            var odict = new ObservableDict({x:1, y:2, z:3});
            var values = [];
            for (let value of odict.values()) values.push(value);
            expect(values.length).to.equal(3);
            expect(values.sort()).to.deep.equal([1,2,3]);
        });
    });

    describe("ObservableDict.prototype.has(key)", () => {
        it("should return true if the dictionary contains the given key", () => {
            var odict = new ObservableDict({x:1, y:2});
            expect(odict.has('x')).to.be.true;
            expect(odict.has('y')).to.be.true;
            expect(odict.has('z')).to.be.false;
        });
    });

    describe('ObservableDict.prototype.get(key)', () => {

        it("should return the value mapped to the given key", () => {
            var odict = new ObservableDict({x:1, y:2, o:{z:3}});
            expect(odict.get('x')).to.equal(1);
            expect(odict.get('y')).to.equal(2);
            expect(odict.get('o')).to.be.instanceof(ObservableDict);
            expect(odict.get('o').get('z')).to.equal(3);
        });

        it("should return undefined if the key doesn't exist", () => {
            var odict = new ObservableDict({x:1, y:2});
            expect(odict.get('z')).to.be.undefined;
        });
    });

    describe('ObservableDict.prototype.set(key, value)', () => {

        it('should map the given value to the given key', () => {
            var odict = new ObservableDict({x:1, y:2, z:3});
            odict.set('w', null);
            odict.set('z', 30);
            expect(Array.from(odict.keys()).sort()).to.deep.equal(['w','x','y','z']);
            expect(odict.get('w')).to.equal(null);
            expect(odict.get('x')).to.equal(1);
            expect(odict.get('y')).to.equal(2);
            expect(odict.get('z')).to.equal(30);
        });

        it("should convert plain objects to ObservableDict objects", () => {
            var odict = new ObservableDict();
            odict.set('od', {x:1, y:2, z:3});
            var od = odict.get('od');
            expect(od).to.be.instanceof(ObservableDict);
            expect(Array.from(od.keys()).sort()).to.deep.equal(['x','y','z']);
            expect(od.get('x')).to.equal(1);
            expect(od.get('y')).to.equal(2);
            expect(od.get('z')).to.equal(3);
        });

        it("should convert arrays to ObservableList objects", () => {
            var odict = new ObservableDict();
            odict.set('ol', [10,20,30]);
            var ol = odict.get('ol');
            expect(ol).to.be.instanceof(ObservableList);
        });

        it("should assign Observable objects as is", () => {
            var odict = new ObservableDict();

            var od = new ObservableDict();
            odict.set('od', od);
            expect(odict.get('od')).to.equal(od);

            var ol = new ObservableList();
            odict.set('ol', ol);
            expect(odict.get('ol')).to.equal(ol);

            class ObservableX extends ObservableDict {};
            var ox = new ObservableX();
            odict.set('ox', ox);
            expect(odict.get('ox')).to.equal(ox);
        });

        it("Should throw a TypeError if the assigned value is not a valid type", () => {
            var odict = new ObservableDict();

            expect(() => odict.set('foo', function () {})).to.throw(TypeError);
            expect(odict.get('foo')).to.be.undefined;

            expect(() => odict.set('nu', Object.create({}))).to.throw(TypeError);
            expect(odict.get('foo')).to.be.undefined;
        });

        it("Should throw a CyclicReferenceError if trying to create a cyclic reference", () => {
            var odict = new ObservableDict({od:1});

            expect(() => odict.set('od', odict)).to.throw(exceptions.CyclicReferenceError);
            expect(odict.get('od')).to.equal(1);

            var od = new ObservableDict({od:odict});
            expect(() => odict.set('od', od)).to.throw(exceptions.CyclicReferenceError);
            expect(odict.get('od')).to.equal(1);

            expect(() => odict.set('od', {od:odict})).to.throw(exceptions.CyclicReferenceError);
            expect(odict.get('od')).to.equal(1);
        });

        it("should return the applied Change object", () => {
            var odict = new ObservableDict({s:"abc", o:{x:1}, l:[10,20,30]});

            var change = odict.set('s', 'def');
            expect(change).to.be.instanceof(Change);
            expect(change.path).to.deep.equal(['s']);
            expect(change.del).to.equal('abc');
            expect(change.ins).to.equal('def');

            change = odict.set('o', {y:2});
            expect(change).to.be.instanceof(Change);
            expect(change.path).to.deep.equal(['o']);
            expect(change.del).to.deep.equal({x:1});
            expect(change.ins).to.deep.equal({y:2});

            change = odict.set('o', [1,2,3]);
            expect(change).to.be.instanceof(Change);
            expect(change.path).to.deep.equal(['o']);
            expect(change.del).to.deep.equal({y:2});
            expect(change.ins).to.deep.equal([1,2,3]);

            change = odict.set('l', [40,50,60]);
            expect(change).to.be.instanceof(Change);
            expect(change.path).to.deep.equal(['l']);
            expect(change.del).to.deep.equal([10,20,30]);
            expect(change.ins).to.deep.equal([40,50,60]);
        });

        it("should fail and return null if re-assigning the current value", () => {
            var odict = new ObservableDict({x:1, y:2, z:3});
            var change = odict.set('x', 1);
            expect(change).to.be.null;
            expect(odict.getSnapshot()).to.deep.equal({x:1, y:2, z:3});
        });
    });

    describe("ObservableDict.prototype.delete(key)", () => {

        it('should delete the given key', () => {
            var odict = new ObservableDict({x:1, y:2, z:3});
            odict.delete('y');
            expect(Array.from(odict.keys()).sort()).to.deep.equal(['x','z']);
            expect(odict.get('x')).to.equal(1);
            expect(odict.get('z')).to.equal(3);
        });

        it("should return the applied Change object", () => {
            var odict = new ObservableDict({s:"abc", o:{x:1}, l:[10,20,30]});

            var change = odict.delete('s');
            expect(change).to.be.instanceof(Change);
            expect(change.path).to.deep.equal(['s']);
            expect(change.del).to.equal('abc');
            expect(change.ins).to.be.undefined;

            change = odict.delete('o');
            expect(change).to.be.instanceof(Change);
            expect(change.path).to.deep.equal(['o']);
            expect(change.del).to.deep.equal({x:1});
            expect(change.ins).to.be.undefined;

            change = odict.delete('l');
            expect(change).to.be.instanceof(Change);
            expect(change.path).to.deep.equal(['l']);
            expect(change.del).to.deep.equal([10,20,30]);
            expect(change.ins).to.be.undefined;
        });

        it("should fail and return null if the key doesn't exist", () => {
            var odict = new ObservableDict({x:1, y:2, z:3});
            var change = odict.delete('w');
            expect(change).to.be.null;
            expect(odict.getSnapshot()).to.deep.equal({x:1, y:2, z:3});
        });
    });

    describe("ObservableDict.prototype.assign(dict)", () => {

        it("should apply and return the minimum amount of changes to the object", () => {
            const oldValue = {n:1, s:"abc", d:{x:10, y:20, z:30},       m:{a:100}};
            const newValue = {n:2,          d:{x:11,       z:30, w:40}, m:"xxx"  };

            const dict = new ObservableDict(oldValue);
            const changeList = dict.assign(newValue);

            var changeMap = {};
            for (let change of changeList) changeMap[change.path] = {del:change.del, ins:change.ins};
            expect(changeMap).to.deep.equal({
                'n': {del:1, ins:2},
                's': {del:"abc", ins:undefined},
                'd.x': {del:10, ins:11},
                'd.y': {del:20, ins:undefined},
                'd.w': {del:undefined, ins:40},
                'm': {del:{a:100}, ins:"xxx"}
            });

            expect(dict.getSnapshot()).to.deep.equal(newValue);
        });

        it("should throw a TypeError if the argument is not a plain object or an ObservableDict", () => {
            const dict = new ObservableDict({x:10});

            expect(() => dict.assign(1)).to.throw(TypeError);
            expect(() => dict.assign("abc")).to.throw(TypeError);
            expect(() => dict.assign([1,2,3])).to.throw(TypeError);
            expect(() => dict.assign(true)).to.throw(TypeError);
            expect(() => dict.assign(null)).to.throw(TypeError);
            expect(dict.getSnapshot()).to.deep.equal({x:10});

            expect(() => dict.assign({x:11})).to.not.throw();
            expect(dict.getSnapshot()).to.deep.equal({x:11});

            expect(() => dict.assign(new ObservableDict({x:12}))).to.not.throw();
            expect(dict.getSnapshot()).to.deep.equal({x:12});
        });
    });

    describe("ObservableDict.prototype.apply(change)", () => {
        var dict, change;

        it("should apply the passed change to te dictionary", () => {
            dict = new ObservableDict({x:10});
            dict.apply(new Change('x', {type:'dict', del:10, ins:11}));
            expect(dict.getSnapshot()).to.deep.equal({x:11});

            dict = new ObservableDict({x:10});
            dict.apply(new Change('y', {type:'dict', del:undefined, ins:20}));
            expect(dict.getSnapshot()).to.deep.equal({x:10, y:20});

            dict = new ObservableDict({x:10, y:20});
            dict.apply(new Change('x', {type:'dict', del:10, ins:undefined}));
            expect(dict.getSnapshot()).to.deep.equal({y:20});

            dict = new ObservableDict({x:10});
            dict.apply(new Change('x', {type:'dict', del:10, ins:{val:10}}));
            expect(dict.getSnapshot()).to.deep.equal({x:{val:10}});

            dict = new ObservableDict({x:10});
            dict.apply(new Change('x', {type:'dict', del:10, ins:10}));
            expect(dict.getSnapshot()).to.deep.equal({x:10});

            dict = new ObservableDict({d:{x:10}});
            dict.apply(new Change('d', new Change('x', {type:'dict', del:10, ins:11})));
            expect(dict.getSnapshot()).to.deep.equal({d:{x:11}});

            dict = new ObservableDict({d:{x:10}});
            dict.apply(new Change('d', new Change('y', {type:'dict', del:undefined, ins:20})));
            expect(dict.getSnapshot()).to.deep.equal({d:{x:10, y:20}});

            dict = new ObservableDict({d:{x:10, y:20}});
            dict.apply(new Change('d', new Change('x', {type:'dict', del:10, ins:undefined})));
            expect(dict.getSnapshot()).to.deep.equal({d:{y:20}});
        });

        it("should return the applied change", () => {
            dict = new ObservableDict({x:10});
            change = dict.apply(new Change('x', {type:'dict', del:10, ins:11}));
            expect(change.path).to.deep.equal(['x']);
            expect(change.del).to.equal(10);
            expect(change.ins).to.equal(11);

            dict = new ObservableDict({x:10});
            change = dict.apply(new Change('y', {type:'dict', del:undefined, ins:20}));
            expect(change.path).to.deep.equal(['y']);
            expect(change.del).to.equal(undefined);
            expect(change.ins).to.equal(20);

            dict = new ObservableDict({x:10, y:20});
            change = dict.apply(new Change('x', {type:'dict', del:10, ins:undefined}));
            expect(change.path).to.deep.equal(['x']);
            expect(change.del).to.equal(10);
            expect(change.ins).to.equal(undefined);

            dict = new ObservableDict({x:10});
            change = dict.apply(new Change('x', {type:'dict', del:10, ins:{val:10}}));
            expect(change.path).to.deep.equal(['x']);
            expect(change.del).to.equal(10);
            expect(change.ins).to.deep.equal({val:10});

            dict = new ObservableDict({x:10});
            change = dict.apply(new Change('x', {type:'dict', del:10, ins:10}));
            expect(change).to.be.null;

            dict = new ObservableDict({d:{x:10}});
            change = dict.apply(new Change('d', new Change('x', {type:'dict', del:10, ins:11})));
            expect(change.path).to.deep.equal(['d','x']);
            expect(change.del).to.equal(10);
            expect(change.ins).to.equal(11);

            dict = new ObservableDict({d:{x:10}});
            change = dict.apply(new Change('d', new Change('y', {type:'dict', del:undefined, ins:20})));
            expect(change.path).to.deep.equal(['d','y']);
            expect(change.del).to.equal(undefined);
            expect(change.ins).to.equal(20);

            dict = new ObservableDict({d:{x:10, y:20}});
            change = dict.apply(new Change('d', new Change('x', {type:'dict', del:10, ins:undefined})));
            expect(change.path).to.deep.equal(['d','x']);
            expect(change.del).to.equal(10);
            expect(change.ins).to.equal(undefined);
        });

        it("should throw a ValueError if the change is not applicable", () => {
            dict = new ObservableDict({x:10});

            change = "abc";
            expect(() => dict.apply(change)).to.throw(exceptions.ValueError);
            expect(dict.getSnapshot()).to.deep.equal({x:10});

            change = new Change('x', {type:'list', del:10, ins:11});
            expect(() => dict.apply(change)).to.throw(exceptions.ValueError);
            expect(dict.getSnapshot()).to.deep.equal({x:10});

            change = new Change('d', new Change('x', {type:'dict', del:10, ins:11}));
            expect(() => dict.apply(change)).to.throw(exceptions.ValueError);
            expect(dict.getSnapshot()).to.deep.equal({x:10});

            change = new Change('x', {type:'dict', del:100, ins:200});
            expect(() => dict.apply(change)).to.throw(exceptions.ValueError);
            expect(dict.getSnapshot()).to.deep.equal({x:10});
        });
    });

    describe("ObservableDict.prototype.parents", () => {

        it("should return an iterator", () => {
            const dict = new ObservableDict();
            const parents = dict.parents();
            expect(parents[Symbol.iterator]).to.be.instanceof(Function);
        });

        it("should yield the [parent, key] parent links", () => {
            const parent1 = new ObservableDict();
            const parent2 = new ObservableDict();
            const child = new ObservableDict();
            parent1.set('p1', child);
            parent2.set('p2', child);
            parent2.set('p3', child);
            expect(Array.from(child.parents())).to.deep.equal([
                [parent1, 'p1'],
                [parent2, 'p2'],
                [parent2, 'p3']
            ]);
        });
    });

    describe("observableDict.beforeChangeCallbacks", () => {
        var odict, lastChange, snapshot, callback;

        before (() => {
            odict = new ObservableDict({x:1, y:2, z:3});
            callback = (change) => {
                lastChange = change;
                snapshot = odict.getSnapshot();
            };
            odict.beforeChangeCallbacks.add(callback);
        });

        it("should call the callback on 'set' operations", () => {
            lastChange = null;
            odict.set('z', 30);
            expect(lastChange.key).to.equal('z');
            expect(lastChange.op).to.deep.equal({type:'dict', del:3, ins:30});
            expect(snapshot.z).to.equal(3);

            lastChange = null;
            odict.set('w', 0);
            expect(lastChange.key).to.equal('w');
            expect(lastChange.op).to.deep.equal({type:'dict', del:undefined, ins:0});
            expect(snapshot.w).to.be.undefined;
        });

        it("should call the callback on 'delete' operations", () => {
            lastChange = null;
            odict.delete('y');
            expect(lastChange.key).to.equal('y');
            expect(lastChange.op).to.deep.equal({type:'dict', del:2, ins:undefined});
            expect(snapshot.y).to.equal(2);
        });

        it("should not callback on null operations", () => {
            odict.set('x', 1);
            lastChange = null;
            odict.set('x', 1);
            expect(lastChange).to.be.null;

            odict.delete('x');
            lastChange = null;
            odict.delete('x');
            expect(lastChange).to.be.null;
        });

        it("should callback on deep changes", () => {
            odict.set('od', new ObservableDict({
                a:10,
                b:20,
                c:30,
                d: new ObservableDict({
                    e: 40,
                    f: 50
                })
            }));

            lastChange = null;
            odict.get('od').set('a', 100);
            expect(lastChange.key).to.equal('od');
            expect(lastChange.op.key).to.equal('a');
            expect(lastChange.op.op).to.deep.equal({type:'dict', del:10, ins:100});
            expect(snapshot.od.a).to.equal(10);

            lastChange = null;
            odict.get('od').delete('a');
            expect(lastChange.key).to.equal('od');
            expect(lastChange.op.key).to.equal('a');
            expect(lastChange.op.op).to.deep.equal({type:'dict', del:100, ins:undefined});
            expect(snapshot.od.a).to.equal(100);

            lastChange = null;
            odict.get('od').get('d').set('e', 400);
            expect(lastChange.key).to.equal('od');
            expect(lastChange.op.key).to.equal('d');
            expect(lastChange.op.op.key).to.equal('e');
            expect(lastChange.op.op.op).to.deep.equal({type:'dict', del:40, ins:400});
            expect(snapshot.od.d.e).to.equal(40);

            lastChange = null;
            odict.get('od').get('d').delete('e');
            expect(lastChange.key).to.equal('od');
            expect(lastChange.op.key).to.equal('d');
            expect(lastChange.op.op.key).to.equal('e');
            expect(lastChange.op.op.op).to.deep.equal({type:'dict', del:400, ins:undefined});
            expect(snapshot.od.d.e).to.equal(400);
        });

        it("should not callback on deep changes once the child is removed", () => {
            var od = new ObservableDict({a:10, b:20, c:30});
            odict.set('od', od);

            lastChange = null;
            od.set('a', 100);
            expect(lastChange.key).to.equal('od');
            expect(lastChange.op.key).to.equal('a');
            expect(lastChange.op.op).to.deep.equal({type:'dict', del:10, ins:100});

            odict.delete('od');

            lastChange = null;
            od.set('a', 1000);
            expect(lastChange).to.be.null;
        });

        it("should not callback anymore once the listener is removed", () => {
            odict.set('x', 1);

            odict.beforeChangeCallbacks.delete(callback);
            lastChange = null;
            odict.set('x', 10);
            expect(lastChange).to.be.null;

            odict.beforeChangeCallbacks.add(callback);
            odict.set('x', 100);
            expect(lastChange.key).to.equal('x');
            expect(lastChange.op).to.deep.equal({type:'dict', del:10, ins:100});

            odict.beforeChangeCallbacks.delete(callback);
            lastChange = null;
            odict.set('x', 1000);
            expect(lastChange).to.be.null;
        });

        it("should callback multiple listeners in order", () => {
            odict.set('x', 1);

            var calls = [];
            var cb1 = (change) => calls.push('cb1');
            var cb2 = (change) => calls.push('cb2');

            odict.beforeChangeCallbacks.add(cb1);
            odict.beforeChangeCallbacks.add(cb2);

            odict.set('x', 10);
            expect(calls).to.deep.equal(['cb1','cb2']);

            odict.beforeChangeCallbacks.delete(cb1);
            odict.beforeChangeCallbacks.delete(cb2);
        });
    });

    describe("observableDict.afterChangeCallbacks", () => {
        var odict, lastChange, snapshot, callback;

        before (() => {
            odict = new ObservableDict({x:1, y:2, z:3});
            callback = (change) => {
                lastChange = change;
                snapshot = odict.getSnapshot();
            };
            odict.afterChangeCallbacks.add(callback);
        });

        it("should call the callback on 'set' operations", () => {
            lastChange = null;
            odict.set('z', 30);
            expect(lastChange.key).to.equal('z');
            expect(lastChange.op).to.deep.equal({type:'dict', del:3, ins:30});
            expect(snapshot.z).to.equal(30);

            lastChange = null;
            odict.set('w', 0);
            expect(lastChange.key).to.equal('w');
            expect(lastChange.op).to.deep.equal({type:'dict', del:undefined, ins:0});
            expect(snapshot.w).to.equal(0);
        });

        it("should call the callback on 'delete' operations", () => {
            lastChange = null;
            odict.delete('y');
            expect(lastChange.key).to.equal('y');
            expect(lastChange.op).to.deep.equal({type:'dict', del:2, ins:undefined});
            expect(snapshot.y).to.be.undefined;
        });

        it("should not callback on null operations", () => {
            odict.set('x', 1);
            lastChange = null;
            odict.set('x', 1);
            expect(lastChange).to.be.null;

            odict.delete('x');
            lastChange = null;
            odict.delete('x');
            expect(lastChange).to.be.null;
        });

        it("should callback on deep changes", () => {
            odict.set('od', new ObservableDict({
                a:10,
                b:20,
                c:30,
                d: new ObservableDict({
                    e: 40,
                    f: 50
                })
            }));

            lastChange = null;
            odict.get('od').set('a', 100);
            expect(lastChange.key).to.equal('od');
            expect(lastChange.op.key).to.equal('a');
            expect(lastChange.op.op).to.deep.equal({type:'dict', del:10, ins:100});
            expect(snapshot.od.a).to.equal(100);

            lastChange = null;
            odict.get('od').delete('a');
            expect(lastChange.key).to.equal('od');
            expect(lastChange.op.key).to.equal('a');
            expect(lastChange.op.op).to.deep.equal({type:'dict', del:100, ins:undefined});
            expect(snapshot.od.a).to.be.undefined;

            lastChange = null;
            odict.get('od').get('d').set('e', 400);
            expect(lastChange.key).to.equal('od');
            expect(lastChange.op.key).to.equal('d');
            expect(lastChange.op.op.key).to.equal('e');
            expect(lastChange.op.op.op).to.deep.equal({type:'dict', del:40, ins:400});
            expect(snapshot.od.d.e).to.equal(400);

            lastChange = null;
            odict.get('od').get('d').delete('e');
            expect(lastChange.key).to.equal('od');
            expect(lastChange.op.key).to.equal('d');
            expect(lastChange.op.op.key).to.equal('e');
            expect(lastChange.op.op.op).to.deep.equal({type:'dict', del:400, ins:undefined});
            expect(snapshot.od.d.e).to.be.undefined;
        });

        it("should not callback on deep changes once the child is removed", () => {
            var od = new ObservableDict({a:10, b:20, c:30});
            odict.set('od', od);

            lastChange = null;
            od.set('a', 100);
            expect(lastChange.key).to.equal('od');
            expect(lastChange.op.key).to.equal('a');
            expect(lastChange.op.op).to.deep.equal({type:'dict', del:10, ins:100});

            odict.delete('od');

            lastChange = null;
            od.set('a', 1000);
            expect(lastChange).to.be.null;
        });

        it("should not callback anymore once the listener is removed", () => {
            odict.set('x', 1);

            odict.afterChangeCallbacks.delete(callback);
            lastChange = null;
            odict.set('x', 10);
            expect(lastChange).to.be.null;

            odict.afterChangeCallbacks.add(callback);
            odict.set('x', 100);
            expect(lastChange.key).to.equal('x');
            expect(lastChange.op).to.deep.equal({type:'dict', del:10, ins:100});

            odict.afterChangeCallbacks.delete(callback);
            lastChange = null;
            odict.set('x', 1000);
            expect(lastChange).to.be.null;
        });

        it("should callback multiple listeners in order", () => {
            odict.set('x', 1);

            var calls = [];
            var cb1 = (change) => calls.push('cb1');
            var cb2 = (change) => calls.push('cb2');

            odict.afterChangeCallbacks.add(cb1);
            odict.afterChangeCallbacks.add(cb2);

            odict.set('x', 10);
            expect(calls).to.deep.equal(['cb1','cb2']);

            odict.afterChangeCallbacks.delete(cb1);
            odict.afterChangeCallbacks.delete(cb2);
        });
    });
});
