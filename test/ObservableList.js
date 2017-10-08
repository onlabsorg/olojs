
const expect = require("chai").expect;

const client = require("../lib/client");
const Change = client.Change;
const Observable = client.Observable;
const ObservableDict = client.ObservableDict;
const ObservableList = client.ObservableList;
const exceptions = client.exceptions;

describe(`ObservableList`, () => {

    it("should be a class inheriting from Observable", () => {
        expect(ObservableList.prototype).to.be.instanceof(Observable);
    });

    describe("ObservableList.prototype[@@iterator]()", () => {
        it("should iterate over the list items", () => {
            var list = new ObservableList(10, 20, 30);
            var copy = [];
            for (let item of list) copy.push(item);
            expect(copy).to.deep.equal([10, 20, 30]);
        });
    });

    describe("ObservableList.prototype.getSnapshot()", () => {

        it("should return the ObservableList as a Javascript Array", () => {
            var list = [10, 20, {z:30}];
            var olist = new ObservableList(...list);
            expect(olist.getSnapshot()).to.deep.equal(list);
        });
    });

    describe("ObservableList.prototype.values()", () => {

        it("should return an iterator", () => {
            var olist = new ObservableList(10, 20, 30);
            var values = olist.values();
            expect(values[Symbol.iterator]).to.be.a("function");
        });

        it("should iterate over the list items", () => {
            var list = new ObservableList(10, 20, 30);
            var copy = [];
            for (let item of list.values()) copy.push(item);
            expect(copy).to.deep.equal([10, 20, 30]);
        });
    });

    describe(`ObservableList.prototype.size - getter`, () => {
        it("should return the number of items in the array", () => {
            var list = new ObservableList(10, 20, 30);
            expect(list.size).to.equal(3);
        });
    });

    describe('ObservableList.prototype.indexOf(item)', () => {

        it("should return the index of the given element", () => {
            var list = new ObservableList(10, 20, 30);
            expect(list.indexOf(10)).to.equal(0);
            expect(list.indexOf(20)).to.equal(1);
            expect(list.indexOf(30)).to.equal(2);
        });

        it("should return -1 if the item is not contained in the list", () => {
            var list = new ObservableList(10, 20, 30);
            expect(list.indexOf(40)).to.equal(-1);
        });
    });

    describe('ObservableList.prototype.has(item)', () => {

        it("should return true if the list contains the item", () => {
            var list = new ObservableList(10, 20, 30);
            expect(list.has(10)).to.be.true;
            expect(list.has(20)).to.be.true;
            expect(list.has(30)).to.be.true;
            expect(list.has(40)).to.be.false;
        });
    });

    describe('ObservableList.prototype.get(index)', () => {

        it("should return the item at the give index", () => {
            var list = new ObservableList(10, 20, 30);
            expect(list.get(0)).to.equal(10);
            expect(list.get(1)).to.equal(20);
            expect(list.get(2)).to.equal(30);
        });

        it("should interpret negative indexes as relative to the end", () => {
            var list = new ObservableList(10, 20, 30);
            expect(list.get(-1)).to.equal(30);
            expect(list.get(-2)).to.equal(20);
            expect(list.get(-3)).to.equal(10);
        });

        it("should return undefined if the index is out of range", () => {
            var list = new ObservableList(10, 20, 30);
            expect(list.get(100)).to.be.undefined;
            expect(list.get(-100)).to.be.undefined;
            expect(list.get("x")).to.be.undefined;
        });
    });

    describe("ObservableList.prototype.slice(begin, end)", () => {
        it("should return the sub array starting at index begin and ending, but not including, index end", () => {
            var list = new ObservableList(10, 11, 12, 13, 14, 15, 16, 17, 18, 19);
            expect(list.slice(1,4)).to.deep.equal([11, 12, 13]);
            expect(list.slice(-9, -6)).to.deep.equal([11, 12, 13]);
            expect(list.slice(7)).to.deep.equal([17, 18, 19]);
            expect(list.slice(undefined,3)).to.deep.equal([10, 11, 12]);
        });
    });

    describe(`ObservableList.prototype.set(index, value)`, () => {

        it("should be a function", () => {
            var list = new ObservableList();
            expect(list.set).to.be.instanceof(Function);
        });

        it("should set the value of the item at the given index", () => {
            var list = new ObservableList(10, 20, 30);
            list.set(1, 21);
            expect(list.size).to.equal(3);
            expect(list.get(0)).to.equal(10);
            expect(list.get(1)).to.equal(21);
            expect(list.get(2)).to.equal(30);

            list.set(1, null);
            expect(list.size).to.equal(3);
            expect(list.get(0)).to.equal(10);
            expect(list.get(1)).to.equal(null);
            expect(list.get(2)).to.equal(30);
        });

        it("should interpret negative indexes as relative to the end", () => {
            var list = new ObservableList(10, 20, 30);
            list.set(-1, 31);
            expect(list.size).to.equal(3);
            expect(list.get(0)).to.equal(10);
            expect(list.get(1)).to.equal(20);
            expect(list.get(2)).to.equal(31);
        });

        it("should throw a RangeError if index is out of range", () => {
            var list = new ObservableList(10, 20, 30);
            expect(() => {list.set(100, 1)}).to.throw(RangeError);
            expect(() => {list.set(-100, 1)}).to.throw(RangeError);
            expect(list.size).to.equal(3);
            expect(list.get(0)).to.equal(10);
            expect(list.get(1)).to.equal(20);
            expect(list.get(2)).to.equal(30);
        });

        it("should throw a TypeError if index is not a number", () => {
            var list = new ObservableList(10, 20, 30);
            expect(() => {list.set('x', 1)}).to.throw(TypeError);
            expect(list.size).to.equal(3);
            expect(list.get(0)).to.equal(10);
            expect(list.get(1)).to.equal(20);
            expect(list.get(2)).to.equal(30);
        });

        it("should convert plain objects to ObservableDict objects", () => {
            var list = new ObservableList(10, 20, 30);
            list.set(1, {x:1, y:2, z:3});
            expect(list.get(1)).to.be.instanceof(ObservableDict);
        });

        it("should convert arrays to ObservableList objects", () => {
            var list = new ObservableList(10, 20, 30);
            list.set(1, [1,2,3]);
            expect(list.get(1)).to.be.instanceof(ObservableList);
        });

        it("should assign Observable objects as is", () => {
            var list = new ObservableList(10, 20, 30);

            var od = new ObservableDict();
            list.set(1, od);
            expect(list.get(1)).to.equal(od);

            var ol = new ObservableList();
            list.set(1, ol);
            expect(list.get(1)).to.equal(ol);

            class ObservableX extends Observable {};
            var ox = new ObservableX();
            list.set(1, ox);
            expect(list.get(1)).to.equal(ox);
        });

        it("Should throw a TypeError if the assigned value is not a valid type", () => {
            var list = new ObservableList(10, 20, 30);

            expect(() => list.set(1, function () {})).to.throw(TypeError);
            expect(list.get(1)).to.equal(20);

            expect(() => list.set(1, Object.create({}))).to.throw(TypeError);
            expect(list.get(1)).to.equal(20);
        });

        it("Should throw a CyclicReferenceError if trying to create a cyclic reference", () => {
            var list = new ObservableList(10, 20, 30);

            expect(() => list.set(1, list)).to.throw(exceptions.CyclicReferenceError);
            expect(list.get(1)).to.equal(20);

            var od = new ObservableDict({ol:list});
            expect(() => list.set(1, od)).to.throw(exceptions.CyclicReferenceError);
            expect(list.get(1)).to.equal(20);

            expect(() => list.set(1, {od:list})).to.throw(exceptions.CyclicReferenceError);
            expect(list.get(1)).to.equal(20);

            expect(() => list.set(1, {ol1:{ol2:list}})).to.throw(exceptions.CyclicReferenceError);
            expect(list.get(1)).to.equal(20);
        });

        it("should return the applied Change object", () => {
            const list = new ObservableList(10, 20, 30);
            const change = list.set(1, 21);
            expect(change).to.be.instanceof(Change);
            expect(change.path).to.deep.equal(['1']);
            expect(change.op).to.deep.equal({type:'list', del:20, ins:21});
        });

        it("should return null if assign the same current value", () => {
            const list = new ObservableList(10, 20, 30);
            const change = list.set(1, 20);
            expect(change).to.be.null;
        });
    });

    describe(`ObservableList.prototype.insert(index, item)`, () => {

        it("should be a function", () => {
            var list = new ObservableList();
            expect(list.insert).to.be.instanceof(Function);
        });

        it("should insert the given items at the given index", () => {
            var list = new ObservableList(10, 20, 30);
            list.insert(1, 11);
            list.insert(4, 40);
            expect(list.size).to.equal(5);
            expect(list.get(0)).to.equal(10);
            expect(list.get(1)).to.equal(11);
            expect(list.get(2)).to.equal(20);
            expect(list.get(3)).to.equal(30);
            expect(list.get(4)).to.equal(40);
        });

        it("should interpret negative indexes as relative to the end", () => {
            var list = new ObservableList(10, 20, 30);
            list.insert(-1, 21);
            expect(list.size).to.equal(4);
            expect(list.get(0)).to.equal(10);
            expect(list.get(1)).to.equal(20);
            expect(list.get(2)).to.equal(21);
            expect(list.get(3)).to.equal(30);
        });

        it("should throw a RangeRrror if index is out of range", () => {
            var list = new ObservableList(10, 20, 30);
            expect(() => {list.insert(100, 1)}).to.throw(RangeError);
            expect(() => {list.insert(-100, 1)}).to.throw(RangeError);
            expect(list.size).to.equal(3);
            expect(list.get(0)).to.equal(10);
            expect(list.get(1)).to.equal(20);
            expect(list.get(2)).to.equal(30);
        });

        it("should throw a TypeError if index is not a number", () => {
            var list = new ObservableList(10, 20, 30);
            expect(() => {list.insert('x', 1)}).to.throw(TypeError);
            expect(list.size).to.equal(3);
            expect(list.get(0)).to.equal(10);
            expect(list.get(1)).to.equal(20);
            expect(list.get(2)).to.equal(30);
        });

        it("should convert plain objects to ObservableDict objects", () => {
            var list = new ObservableList(10, 20, 30);
            list.insert(1, {x:1, y:2, z:3});
            expect(list.get(1)).to.be.instanceof(ObservableDict);
        });

        it("should convert arrays to ObservableList objects", () => {
            var list = new ObservableList(10, 20, 30);
            list.insert(1, [1,2,3]);
            expect(list.get(1)).to.be.instanceof(ObservableList);
        });

        it("should assign Observable objects as is", () => {
            var list = new ObservableList(10, 20, 30);

            var od = new ObservableDict();
            list.insert(1, od);
            expect(list.get(1)).to.equal(od);

            var ol = new ObservableList();
            list.insert(1, ol);
            expect(list.get(1)).to.equal(ol);

            class ObservableX extends Observable {};
            var ox = new ObservableX();
            list.insert(1, ox);
            expect(list.get(1)).to.equal(ox);
        });

        it("Should throw a TypeError if the assigned value is not a valid type", () => {
            var list = new ObservableList(10, 20, 30);

            expect(() => list.insert(1, function () {})).to.throw(TypeError);
            expect(list.get(1)).to.equal(20);

            expect(() => list.insert(1, Object.create({}))).to.throw(TypeError);
            expect(list.get(1)).to.equal(20);
        });

        it("Should throw a CyclicReferenceError if trying to create a cyclic reference", () => {
            var list = new ObservableList(10, 20, 30);

            expect(() => list.insert(1, list)).to.throw(exceptions.CyclicReferenceError);
            expect(list.get(1)).to.equal(20);

            var od = new ObservableDict({ol:list});
            expect(() => list.insert(1, od)).to.throw(exceptions.CyclicReferenceError);
            expect(list.get(1)).to.equal(20);

            expect(() => list.insert(1, {od:list})).to.throw(exceptions.CyclicReferenceError);
            expect(list.get(1)).to.equal(20);

            expect(() => list.insert(1, {ol1:{ol2:list}})).to.throw(exceptions.CyclicReferenceError);
            expect(list.get(1)).to.equal(20);
        });

        it("should return the applied Change object", () => {
            const list = new ObservableList(10, 20, 30);
            const change = list.insert(1, 11);
            expect(change).to.be.instanceof(Change);
            expect(change.path).to.deep.equal(['1']);
            expect(change.op).to.deep.equal({type:'list', del:undefined, ins:11});
        });
    });

    describe(`ObservableList.prototype.append(item)`, () => {

        it("should be a function", () => {
            var list = new ObservableList();
            expect(list.append).to.be.instanceof(Function);
        });

        it("should add the given items at the end", () => {
            var list = new ObservableList(10, 20, 30);
            list.append(40);
            expect(list.getSnapshot()).to.deep.equal([10, 20, 30, 40]);
        });

        it("should convert plain objects to ObservableDict objects", () => {
            var list = new ObservableList(10, 20, 30);
            list.append({x:1, y:2, z:3});
            expect(list.get(3)).to.be.instanceof(ObservableDict);
        });

        it("should convert arrays to ObservableList objects", () => {
            var list = new ObservableList(10, 20, 30);
            list.append([1,2,3]);
            expect(list.get(3)).to.be.instanceof(ObservableList);
        });

        it("should assign Observable objects as is", () => {
            var list = new ObservableList(10, 20, 30);

            var od = new ObservableDict();
            list.append(od);
            expect(list.get(3)).to.equal(od);

            var ol = new ObservableList();
            list.append(ol);
            expect(list.get(4)).to.equal(ol);

            class ObservableX extends Observable {};
            var ox = new ObservableX();
            list.append(ox);
            expect(list.get(5)).to.equal(ox);
        });

        it("Should throw a TypeError if the assigned value is not a valid type", () => {
            var list = new ObservableList(10, 20, 30);

            expect(() => list.append(function () {})).to.throw(TypeError);
            expect(list.size).to.equal(3);

            expect(() => list.append(Object.create({}))).to.throw(TypeError);
            expect(list.size).to.equal(3);
        });

        it("Should throw a CyclicReferenceError if trying to create a cyclic reference", () => {
            var list = new ObservableList(10, 20, 30);

            expect(() => list.append(list)).to.throw(exceptions.CyclicReferenceError);
            expect(list.size).to.equal(3);

            var od = new ObservableDict({ol:list});
            expect(() => list.append(od)).to.throw(exceptions.CyclicReferenceError);
            expect(list.size).to.equal(3);

            expect(() => list.append({od:list})).to.throw(exceptions.CyclicReferenceError);
            expect(list.size).to.equal(3);

            expect(() => list.append({ol1:{ol2:list}})).to.throw(exceptions.CyclicReferenceError);
            expect(list.size).to.equal(3);
        });

        it("should return the applied Change object", () => {
            const list = new ObservableList(10, 20, 30);
            const change = list.append(40);
            expect(change).to.be.instanceof(Change);
            expect(change.path).to.deep.equal(['3']);
            expect(change.op).to.deep.equal({type:'list', del:undefined, ins:40});
        });
    });

    describe(`ObservableList.prototype.delete(index)`, () => {

        it("should be a function", () => {
            var list = new ObservableList();
            expect(list.delete).to.be.instanceof(Function);
        });

        it("should remove the item at `index`", () => {
            var list = new ObservableList(10, 11, 12, 13, 14);
            list.delete(1);
            expect(list.getSnapshot()).to.deep.equal([10,12,13,14]);
        });

        it("should interpret negative indexes as relative to the end", () => {
            var list = new ObservableList(10, 11, 12, 13, 14);
            list.delete(-4);
            expect(list.getSnapshot()).to.deep.equal([10,12,13,14]);
        });

        it("should throw a RangeRrror if index is out of range", () => {
            var list = new ObservableList(10, 20, 30);
            expect(() => {list.delete(100, 1)}).to.throw(RangeError);
            expect(() => {list.delete(-100, 1)}).to.throw(RangeError);
            expect(list.getSnapshot()).to.deep.equal([10, 20, 30]);
        });

        it("should throw a TypeError if index is not a number", () => {
            var list = new ObservableList(10, 20, 30);
            expect(() => {list.delete('x')}).to.throw(TypeError);
            expect(list.getSnapshot()).to.deep.equal([10, 20, 30]);
        });

        it("should return the applied Change object", () => {
            const list = new ObservableList(10, 20, 30);
            const change = list.delete(1);
            expect(change).to.be.instanceof(Change);
            expect(change.path).to.deep.equal(['1']);
            expect(change.op).to.deep.equal({type:'list', del:20, ins:undefined});
        });
    });

    describe("ObservableList.prototype.assign(list)", () => {

        it("should apply and return the minimum amount of changes to the object", () => {
            const oldValue = [1, "abc", true, [10, 20, 30],         {x:10}, null];
            const newValue = [1, "def", true, [10, 21, 30, 40, 50], {x:10},     ];

            const list = new ObservableList(...oldValue);
            const changeList = list.assign(newValue);

            expect(list.getSnapshot()).to.deep.equal(newValue);

            var changeMap = {};
            for (let change of changeList) changeMap[change.path] = {del:change.del, ins:change.ins};
            expect(changeMap).to.deep.equal({
                '1': {del:"abc", ins:"def"},
                '3.1': {del:20, ins:21},
                '3.3': {del:undefined, ins:40},
                '3.4': {del:undefined, ins:50},
                '5': {del:null, ins:undefined},
            });
        });

        it("should throw a TypeError if the argument is not an array or an ObservableList", () => {
            const list = new ObservableList(10, 20, 30);

            expect(() => list.assign(1)).to.throw(TypeError);
            expect(() => list.assign("abc")).to.throw(TypeError);
            expect(() => list.assign({x:10})).to.throw(TypeError);
            expect(() => list.assign(true)).to.throw(TypeError);
            expect(() => list.assign(null)).to.throw(TypeError);
            expect(list.getSnapshot()).to.deep.equal([10, 20, 30]);

            expect(() => list.assign([10, 2, 3])).to.not.throw();
            expect(list.getSnapshot()).to.deep.equal([10, 2, 3]);

            expect(() => list.assign(new ObservableList(10, 2, 3, 4))).to.not.throw();
            expect(list.getSnapshot()).to.deep.equal([10, 2, 3, 4]);
        });
    });

    describe("ObservableList.prototype.apply(change)", () => {
        var list, change;

        it("should apply the passed change to te list", () => {
            list = new ObservableList(10, 20, 30);
            list.apply(new Change('1', {type:'list', del:20, ins:21}));
            expect(list.getSnapshot()).to.deep.equal([10, 21, 30]);

            list = new ObservableList(10, 20, 30);
            list.apply(new Change('1', {type:'list', del:undefined, ins:15}));
            expect(list.getSnapshot()).to.deep.equal([10, 15, 20, 30]);

            list = new ObservableList(10, 20, 30);
            list.apply(new Change('1', {type:'list', del:20, ins:undefined}));
            expect(list.getSnapshot()).to.deep.equal([10, 30]);

            list = new ObservableList(10, 20, 30);
            list.apply(new Change('1', {type:'list', del:20, ins:[21, 22, 23]}));
            expect(list.getSnapshot()).to.deep.equal([10, [21, 22, 23], 30]);

            list = new ObservableList(10, 20, 30);
            list.apply(new Change('1', {type:'list', del:20, ins:20}));
            expect(list.getSnapshot()).to.deep.equal([10, 20, 30]);

            list = new ObservableList(1, 2, [10, 20, 30]);
            list.apply(new Change('2', new Change('1', {type:'list', del:20, ins:21})));
            expect(list.getSnapshot()).to.deep.equal([1, 2, [10, 21, 30]]);

            list = new ObservableList(1, 2, [10, 20, 30]);
            list.apply(new Change('2', new Change('1', {type:'list', del:undefined, ins:15})));
            expect(list.getSnapshot()).to.deep.equal([1, 2, [10, 15, 20, 30]]);

            list = new ObservableList(1, 2, [10, 20, 30]);
            list.apply(new Change('2', new Change('1', {type:'list', del:20, ins:undefined})));
            expect(list.getSnapshot()).to.deep.equal([1, 2, [10, 30]]);
        });

        it("should return the applied change", () => {
            list = new ObservableList(10, 20, 30);
            change = list.apply(new Change('1', {type:'list', del:20, ins:21}));
            expect(change.key).to.equal(1);
            expect(change.op).to.deep.equal({type:'list', del:20, ins:21});

            list = new ObservableList(10, 20, 30);
            change = list.apply(new Change('1', {type:'list', del:undefined, ins:15}));
            expect(change.key).to.equal(1);
            expect(change.op).to.deep.equal({type:'list', del:undefined, ins:15});

            list = new ObservableList(10, 20, 30);
            change = list.apply(new Change('1', {type:'list', del:20, ins:undefined}));
            expect(change.key).to.equal(1);
            expect(change.op).to.deep.equal({type:'list', del:20, ins:undefined});

            list = new ObservableList(10, 20, 30);
            change = list.apply(new Change('1', {type:'list', del:20, ins:[21, 22, 23]}));
            expect(change.key).to.equal(1);
            expect(change.op).to.deep.equal({type:'list', del:20, ins:[21, 22, 23]});

            list = new ObservableList(10, 20, 30);
            change = list.apply(new Change('1', {type:'list', del:20, ins:20}));
            expect(change).to.be.null;

            list = new ObservableList(1, 2, [10, 20, 30]);
            change = list.apply(new Change(2, new Change(1, {type:'list', del:20, ins:21})));
            expect(change.key).to.equal(2);
            expect(change.op.key).to.equal(1);
            expect(change.op.op).to.deep.equal({type:'list', del:20, ins:21});

            list = new ObservableList(1, 2, [10, 20, 30]);
            change = list.apply(new Change(2, new Change(1, {type:'list', del:undefined, ins:15})));
            expect(change.key).to.equal(2);
            expect(change.op.key).to.equal(1);
            expect(change.op.op).to.deep.equal({type:'list', del:undefined, ins:15});

            list = new ObservableList(1, 2, [10, 20, 30]);
            change = list.apply(new Change(2, new Change(1, {type:'list', del:20, ins:undefined})));
            expect(change.key).to.equal(2);
            expect(change.op.key).to.equal(1);
            expect(change.op.op).to.deep.equal({type:'list', del:20, ins:undefined});
        });

        it("should throw a ValueError if the change is not applicable", () => {
            list = new ObservableList(10, 20, 30);

            change = "abc";
            expect(() => list.apply(change)).to.throw(exceptions.ValueError);
            expect(list.getSnapshot()).to.deep.equal([10, 20, 30]);

            change = new Change(1, {type:'dict', del:20, ins:21});
            expect(() => list.apply(change)).to.throw(exceptions.ValueError);
            expect(list.getSnapshot()).to.deep.equal([10, 20, 30]);

            change = new Change(2, new Change(1, {type:'list', del:10, ins:11}));
            expect(() => list.apply(change)).to.throw(exceptions.ValueError);
            expect(list.getSnapshot()).to.deep.equal([10, 20, 30]);

            change = new Change(1, {type:'list', del:100, ins:200});
            expect(() => list.apply(change)).to.throw(exceptions.ValueError);
            expect(list.getSnapshot()).to.deep.equal([10, 20, 30]);
        });
    });

    describe("ObservableList.prototype.parents", () => {

        it("should return an iterator", () => {
            const list = new ObservableList();
            const parents = list.parents();
            expect(parents[Symbol.iterator]).to.be.instanceof(Function);
        });

        it("should yield the [parent, key] parent links", () => {
            const parent1 = new ObservableDict();
            const parent2 = new ObservableDict();
            const child = new ObservableList();
            parent1.set('p1', child);
            parent2.set('p2', child);
            parent2.set('p3', child);
            expect(Array.from(child.parents())).to.deep.equal([
                [parent1, 'p1'],
                [parent2, 'p2'],
                [parent2, 'p3']
            ]);
        });

        it("should shift the parent reference on insert and delete operations", () => {
            const cDict = new ObservableList()
            const cList = new ObservableList()
            const pList = new ObservableList(10, 20, 30, cList, cDict);

            expect(Array.from(cList.parents())).to.deep.equal([ [pList, 3] ]);
            expect(Array.from(cDict.parents())).to.deep.equal([ [pList, 4] ]);

            pList.insert(1, 15);
            expect(Array.from(cList.parents())).to.deep.equal([ [pList, 4] ]);
            expect(Array.from(cDict.parents())).to.deep.equal([ [pList, 5] ]);

            pList.delete(1);
            pList.delete(1);
            expect(Array.from(cList.parents())).to.deep.equal([ [pList, 2] ]);
            expect(Array.from(cDict.parents())).to.deep.equal([ [pList, 3] ]);
        });
    });

    describe("observableList.beforeChangeCallbacks", () => {
        var list, lastChange, snapshot, callback;

        before (() => {
            list = new ObservableList(10, 20, 30);
            callback = (change) => {
                snapshot = list.getSnapshot();
                lastChange = change;
            };
            list.beforeChangeCallbacks.add(callback);
        });

        it("should call the callback on 'set' operations", () => {
            lastChange = null;
            list.set(1, 21);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op).to.deep.equal({type:'list', del:20, ins:21});
            expect(snapshot).to.deep.equal([10, 20, 30]);

            list.set(1, 20);
        });

        it("should call the callback on 'insert' operations", () => {
            lastChange = null;
            list.insert(1, 11);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op).to.deep.equal({type:'list', del:undefined, ins:11});
            expect(snapshot).to.deep.equal([10, 20, 30]);
        });

        it("should call the callback on 'delete' operations", () => {
            lastChange = null;
            list.delete(1);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op).to.deep.equal({type:'list', del:11, ins:undefined});
            expect(snapshot).to.deep.equal([10, 11, 20, 30]);
        });

        it("should not callback on null operations", () => {
            list.set(1, 11);
            lastChange = null;
            list.set(1, 11);
            expect(lastChange).to.be.null;
        });

        it("should callback on deep changes", () => {
            list.set(1, new ObservableList(100, 200, 300));

            lastChange = null;
            list.get(1).set(0, 101);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(0);
            expect(lastChange.op.op).to.deep.equal({type:'list', del:100, ins:101});

            lastChange = null;
            list.get(1).insert(2, 102);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(2);
            expect(lastChange.op.op).to.deep.equal({type:'list', del:undefined, ins:102});

            lastChange = null;
            list.get(1).delete(2);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(2);
            expect(lastChange.op.op).to.deep.equal({type:'list', del:102, ins:undefined});

            list.get(1).set(0, new ObservableList(1000, 2000, 3000))
            lastChange = null;
            list.get(1).get(0).set(2, 3001);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(0);
            expect(lastChange.op.op.key).to.equal(2);
            expect(lastChange.op.op.op).to.deep.equal({type:'list', del:3000, ins:3001});

            lastChange = null;
            list.get(1).get(0).insert(1, 1001);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(0);
            expect(lastChange.op.op.key).to.equal(1);
            expect(lastChange.op.op.op).to.deep.equal({type:'list', del:undefined, ins:1001});

            lastChange = null;
            list.get(1).get(0).delete(1);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(0);
            expect(lastChange.op.op.key).to.equal(1);
            expect(lastChange.op.op.op).to.deep.equal({type:'list', del:1001, ins:undefined});
        });

        it("should not callback on deep changes once the child is removed", () => {
            var deepList = new ObservableList(100, 200, 300);
            list.set(1, deepList);

            lastChange = null;
            deepList.set(0, 101);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(0);
            expect(lastChange.op.op).to.deep.equal({type:'list', del:100, ins:101});

            list.delete(1);

            lastChange = null;
            deepList.set(1, 102);
            expect(lastChange).to.be.null;
        });

        it("should not callback anymore once cancelled", () => {
            list.set(1, 20);

            list.beforeChangeCallbacks.delete(callback);
            lastChange = null;
            list.set(1, 21);
            expect(lastChange).to.be.null;
        });

        it("should callback multiple listeners in order", () => {
            list.set(1, 20);

            var calls = [];
            var cb1 = (change) => calls.push('cb1');
            var cb2 = (change) => calls.push('cb2');

            list.beforeChangeCallbacks.add(cb1);
            list.beforeChangeCallbacks.add(cb2);

            list.set(1, 21);
            expect(calls).to.deep.equal(['cb1','cb2']);

            list.beforeChangeCallbacks.delete(cb1);
            list.beforeChangeCallbacks.delete(cb2);
        });
    });

    describe("observableList.afterChangeCallbacks", () => {
        var list, lastChange, snapshot, callback;

        before (() => {
            list = new ObservableList(10, 20, 30);
            callback = (change) => {
                snapshot = list.getSnapshot();
                lastChange = change;
            };
            list.afterChangeCallbacks.add(callback);
        });

        it("should call the callback on 'set' operations", () => {
            lastChange = null;
            list.set(1, 21);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op).to.deep.equal({type:'list', del:20, ins:21});
            expect(snapshot).to.deep.equal([10, 21, 30]);

            list.set(1, 20);
        });

        it("should call the callback on 'insert' operations", () => {
            lastChange = null;
            list.insert(1, 11);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op).to.deep.equal({type:'list', del:undefined, ins:11});
            expect(snapshot).to.deep.equal([10, 11, 20, 30]);
        });

        it("should call the callback on 'delete' operations", () => {
            lastChange = null;
            list.delete(1);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op).to.deep.equal({type:'list', del:11, ins:undefined});
            expect(snapshot).to.deep.equal([10, 20, 30]);
        });

        it("should not callback on null operations", () => {
            list.set(1, 11);
            lastChange = null;
            list.set(1, 11);
            expect(lastChange).to.be.null;
        });

        it("should callback on deep changes", () => {
            list.set(1, new ObservableList(100, 200, 300));

            lastChange = null;
            list.get(1).set(0, 101);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(0);
            expect(lastChange.op.op).to.deep.equal({type:'list', del:100, ins:101});

            lastChange = null;
            list.get(1).insert(2, 102);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(2);
            expect(lastChange.op.op).to.deep.equal({type:'list', del:undefined, ins:102});

            lastChange = null;
            list.get(1).delete(2);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(2);
            expect(lastChange.op.op).to.deep.equal({type:'list', del:102, ins:undefined});

            list.get(1).set(0, new ObservableList(1000, 2000, 3000))
            lastChange = null;
            list.get(1).get(0).set(2, 3001);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(0);
            expect(lastChange.op.op.key).to.equal(2);
            expect(lastChange.op.op.op).to.deep.equal({type:'list', del:3000, ins:3001});

            lastChange = null;
            list.get(1).get(0).insert(1, 1001);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(0);
            expect(lastChange.op.op.key).to.equal(1);
            expect(lastChange.op.op.op).to.deep.equal({type:'list', del:undefined, ins:1001});

            lastChange = null;
            list.get(1).get(0).delete(1);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(0);
            expect(lastChange.op.op.key).to.equal(1);
            expect(lastChange.op.op.op).to.deep.equal({type:'list', del:1001, ins:undefined});
        });

        it("should not callback on deep changes once the child is removed", () => {
            var deepList = new ObservableList(100, 200, 300);
            list.set(1, deepList);

            lastChange = null;
            deepList.set(0, 101);
            expect(lastChange.key).to.equal(1);
            expect(lastChange.op.key).to.equal(0);
            expect(lastChange.op.op).to.deep.equal({type:'list', del:100, ins:101});

            list.delete(1);

            lastChange = null;
            deepList.set(1, 102);
            expect(lastChange).to.be.null;
        });

        it("should not callback anymore once cancelled", () => {
            list.set(1, 20);

            list.afterChangeCallbacks.delete(callback);
            lastChange = null;
            list.set(1, 21);
            expect(lastChange).to.be.null;
        });

        it("should callback multiple listeners in order", () => {
            list.set(1, 20);

            var calls = [];
            var cb1 = (change) => calls.push('cb1');
            var cb2 = (change) => calls.push('cb2');

            list.afterChangeCallbacks.add(cb1);
            list.afterChangeCallbacks.add(cb2);

            list.set(1, 21);
            expect(calls).to.deep.equal(['cb1','cb2']);

            list.afterChangeCallbacks.delete(cb1);
            list.afterChangeCallbacks.delete(cb2);
        });
    });
});
