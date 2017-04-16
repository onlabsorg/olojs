
var Store = require("olojs/Store");
var Path = require("olojs/Path");
var utils = require("olojs/utils");
var errors = require("olojs/errors");


module.exports = function describeStore (storeName, store) {
    var doc;

    describe(storeName, function () {

        it("should be an instance of Store", () => {
            expect(store).to.be.instanceof(Store);
        });

        describe(`${storeName}.prototype.connect()`, () => {

            it("should be a function", () => {
                expect(store.connect).to.be.instanceof(Function);
            });

            it("should resolve when the connection to the backend is made", (done) => {
                store.connect("TestUser")
                .then(() => {
                    expect(store.connected).to.be.true;
                    done();
                })
                .catch(done);
            });

            it("should fail silently if the store is already connected", (done) => {
                store.connect("TestUser")
                .then(() => {
                    expect(store.connected).to.be.true;
                    done();
                })
                .catch(done);
            });
        });

        describe(`${storeName}.prototype.getDocument(collection, id)`, () => {

            it("should be a function", () => {
                expect(store.getDocument).to.be.instanceof(Function);
            });

            it("should return an instance of Store.Document", () => {
                var doc = store.getDocument("writable", "testDoc");
                expect(doc).to.be.instanceof(Store.Document);
            });

            it("should return the same object when passing the same id", () => {
                var doc1 = store.getDocument("writable", "testDoc");
                var doc2 = store.getDocument("writable", "testDoc");
                expect(doc1).to.equal(doc2);
            });

            describeDocument();
        });

        describe(`${storeName}.prototype.disconnect()`, () => {

            it("should be a function", () => {
                expect(store.disconnect).to.be.instanceof(Function);
            });

            it("should resolve when the connection to the backend is closed", (done) => {
                async function test () {
                    await store.disconnect();
                    expect(store.connected).to.be.false;
                }
                test().then(done).catch(done);
            });
        });
    });


    function describeDocument () {

        describe(`${storeName}.Document - Writable`, function () {

            before((done) => {
                async function init () {
                    doc = store.getDocument("writable", "testDoc");
                }
                init().then(done).catch(done);
            });

            describe(`${storeName}.Document.prototype.store - getter`, () => {
                it("should return the store containing the document", () => {
                    expect(doc.store).to.equal(store);
                });
            });

            describe(`${storeName}.Document.prototype.collection - getter`, () => {
                it("should return the collection name", () => {
                    expect(doc.collection).to.equal("writable");
                });
            });

            describe(`${storeName}.Document.prototype.id - getter`, () => {
                it("should return the document name", () => {
                    expect(doc.id).to.equal("testDoc");
                });
            });

            describe(`${storeName}.Document.prototype.open()`, () => {

                it("should be a function", () => {
                    expect(doc.open).to.be.instanceof(Function);
                });

                it("should connect to the document backend", (done) => {
                    async function test () {
                        expect(Boolean(doc.isOpen)).to.be.false;
                        await doc.open();
                        expect(doc.isOpen).to.be.true;
                    }
                    test().then(done).catch(done);
                });
            });

            describe(`${storeName}.Document.prototype.readable - getter`, () => {
                it("should return 'true'", () => {
                    expect(doc.readable).to.be.true;
                });
            });

            describe(`${storeName}.Document.prototype.writable - getter`, () => {
                it("should returnbe 'true'", () => {
                    expect(doc.writable).to.be.true;
                });
            });

            describe(`${storeName}.Document.prototype.get(path)`, () => {

                it("should be a function", () => {
                    expect(doc.get).to.be.instanceof(Function);
                });

                it("should return an Item object", () => {
                    var root = doc.get('root');
                    expect(root).to.be.instanceof(Store.Document.Item);
                });

                it("should return the same object for the same path", () => {
                    var root = doc.get('root');
                    expect(doc.get('root')).to.equal(root);
                });

                it("should return null if the path points to a root anchestor", () => {
                    expect(doc.get("..")).to.be.null;
                });

                describeItem();
                describeDict();
                describeList();
                describeText();
            });

            describe(`${storeName}.Document.prototype.close()`, () => {

                it("should be a function", () => {
                    expect(doc.close).to.be.instanceof(Function);
                });

                it("should disconnect the document", (done) => {
                    async function test () {
                        expect(doc.isOpen).to.be.true;
                        await doc.close();
                        expect(doc.isOpen).to.be.false;
                    }
                    test().then(done).catch(done);
                });

                it("should clear the cache", (done) => {
                    async function test () {
                        await doc.open();
                        var item = doc.get('item');
                        expect(doc.get('item')).to.equal(item);
                        await doc.close();

                        await doc.open();
                        expect(doc.get('item')).to.not.equal(item);
                        await doc.close();
                    }
                    test().then(done).catch(done);
                });

                it("should cancel all the change subscriptions", (done) => {
                    async function test () {
                        var change;

                        await doc.open();
                        var item = doc.get('item');
                        item.value = 10;
                        var subscription = item.subscribe((c) => {change = c});
                        item.value = 11;
                        expect(change).to.be.instanceof(Store.Document.Change);
                        await doc.close();

                        await doc.open();
                        var item = doc.get('item');
                        change = null;
                        item.value = 12;
                        expect(change).to.be.null;
                        await doc.close();
                    }
                    test().then(done).catch(done);
                });
            });
        });

        describe(`${storeName}.Document - ReadOnly`, function () {

            before((done) => {
                async function init () {
                    doc = await store.getDocument("readonly", "testDoc");
                    await doc.open();
                }
                init().then(done).catch(done);
            });

            describe(`${storeName}.Document.prototype.readable - getter`, () => {
                it("should return 'true'", () => {
                    expect(doc.readable).to.be.true;
                });
            });

            describe(`${storeName}.Document.prototype.writable - getter`, () => {
                it("should returnbe 'false'", () => {
                    expect(doc.writable).to.be.false;
                });
            });

            describe(`${storeName}.Document.prototype.open`, () => {
                it("should throw a WritePermissionError if the document doesn't exist", (done) => {
                    var doc2 = store.getDocument("readonly", "newDoc");
                    doc2.open()
                    .then(() => {
                        done("The open method didn't fire any error.");
                    })
                    .catch((err) => {
                        expect(err).to.be.instanceof(errors.WritePermissionError);
                        done();
                    });
                });
            });

            describe(`${storeName}.Document.prototype.get`, () => {
                it("should be allowed", () => {
                    var item = doc.get('item');
                    expect(item).to.be.instanceof(Store.Document.Item);
                });
            });

            describe(`${storeName}.Document.Dict`, () => {
                var dict;

                before(() => {
                    dict = doc.get('dict');
                });

                it("should allow read operations", () => {
                    expect(dict.value).to.deep.equal({a:10, b:11, c:12});
                    expect(dict.get('a').value).to.equal(10);
                    expect(dict.keys.sort()).to.deep.equal(['a','b','c']);
                });

                it("should throw a WritePermissionError when invoking 'set'", () => {
                    expect(() => dict.set('a', 100)).to.throw(errors.WritePermissionError);
                    expect(dict.value).to.deep.equal({a:10, b:11, c:12});
                });

                it("should throw a WritePermissionError when invoking 'remove'", () => {
                    expect(() => dict.remove('a')).to.throw(errors.WritePermissionError);
                    expect(dict.value).to.deep.equal({a:10, b:11, c:12});
                });

                it("should allow subscriptions", () => {
                    expect(() => dict.subscribe(()=>{}).cancel()).to.not.throw();
                });
            });

            describe(`${storeName}.Document.List`, () => {
                var list;

                before(() => {
                    list = doc.get('list');
                });

                it("should allow read operations", () => {
                    expect(list.value).to.deep.equal([10, 11, 12]);
                    expect(list.get(1).value).to.equal(11);
                    expect(list.size).to.equal(3);
                });

                it("should throw a WritePermissionError when invoking 'set'", () => {
                    expect(() => list.set(1, 110)).to.throw(errors.WritePermissionError);
                    expect(list.value).to.deep.equal([10, 11, 12]);
                });

                it("should throw a WritePermissionError when invoking 'insert'", () => {
                    expect(() => list.insert(1, 110)).to.throw(errors.WritePermissionError);
                    expect(list.value).to.deep.equal([10, 11, 12]);
                });

                it("should throw a WritePermissionError when invoking 'append'", () => {
                    expect(() => list.append(13)).to.throw(errors.WritePermissionError);
                    expect(list.value).to.deep.equal([10, 11, 12]);
                });

                it("should throw a WritePermissionError when invoking 'remove'", () => {
                    expect(() => list.remove(1)).to.throw(errors.WritePermissionError);
                    expect(list.value).to.deep.equal([10, 11, 12]);
                });

                it("should allow subscriptions", () => {
                    expect(() => list.subscribe(()=>{}).cancel()).to.not.throw();
                });
            });

            describe(`${storeName}.Document.Text`, () => {
                var text;

                before(() => {
                    text = doc.get('text');
                });

                it("should allow read operations", () => {
                    expect(text.value).to.equal("abc");
                    expect(text.size).to.equal(3);
                });

                it("should throw a WritePermissionError when invoking 'insert'", () => {
                    expect(() => text.insert(1,"xxx")).to.throw(errors.WritePermissionError);
                    expect(text.value).to.equal("abc");
                });

                it("should throw a WritePermissionError when invoking 'append'", () => {
                    expect(() => text.append("xxx")).to.throw(errors.WritePermissionError);
                    expect(text.value).to.equal("abc");
                });

                it("should throw a WritePermissionError when invoking 'remove'", () => {
                    expect(() => text.remove(1)).to.throw(errors.WritePermissionError);
                    expect(text.value).to.equal("abc");
                });

                it("should allow subscriptions", () => {
                    expect(() => text.subscribe(()=>{}).cancel()).to.not.throw();
                });
            });

            describe(`${storeName}.Document.Item`, () => {
                var item;

                before(() => {
                    item = doc.get('item');
                });

                it("should allow read operations", () => {
                    expect(item.value).to.equal(10);
                    expect(item.get('x')).to.be.instanceof(Store.Document.Item);
                });

                it("should throw a WritePermissionError when trying to set the value", () => {
                    expect(() => {item.value = 11}).to.throw(errors.WritePermissionError);
                    expect(item.value).to.equal(10);
                });

                it("should allow subscriptions", () => {
                    expect(() => item.subscribe(()=>{}).cancel()).to.not.throw();
                });
            });

            after((done) => {
                async function teardown () {
                    await doc.close();
                }
                teardown().then(done).catch(done);
            });
        });

        describe(`${storeName}.Document - Private`, function () {
            var doc;

            before(() => {
                doc = store.getDocument("private", "testDoc");
            });

            it("should throw a ReadPermissionError when trying to open the document", (done) => {
                doc.open()
                .then(() => {
                    done("The open method didn't fire any error.");
                })
                .catch((err) => {
                    expect(err).to.be.instanceof(errors.ReadPermissionError);
                    expect(doc.isOpen).to.be.false;
                    done();
                });
            });

            it("should throw a DocumentClosedError when trying to access the document content", () => {
                expect(() => doc.get('item').value).to.throw(errors.DocumentClosedError);
            });
        });
    }


    function describeItem () {
        describe(`${storeName}.Document.Item`, () => {
            var item;

            describe(`${storeName}.Document.Item.prototype.path - getter`, () => {
                it("should return the path the item points to", () => {
                    item = doc.get('path/to/item');
                    var path = item.path;
                    expect(path).to.be.instanceof(Path);
                    expect(path).to.deep.equal(['path','to','item']);
                });
            });

            describe(`${storeName}.Document.Item.prototype.doc - getter`, () => {
                it("should return the parent document", () => {
                    item = doc.get('item');
                    expect(item.doc).to.equal(doc);
                });
            });

            describe(`${storeName}.Document.Item.prototype.fullPath - getter`, () => {
                it("should return the full store path of the item", () => {
                    item = doc.get('item');
                    expect(item.fullPath).to.deep.equal([doc.store.host, doc.collection, doc.id, 'item']);
                });
            });

            describe(`${storeName}.Document.Item.prototype.get(subPath)`, () => {

                it("should be a function", () => {
                    var item = doc.get('a/b/c');
                    expect(item.get).to.be.instanceof(Function);
                });

                it("should return an item given a relative path", () => {
                    var item = doc.get('a/b/c');

                    var subItem = item.get('n/m');
                    expect(subItem).to.be.instanceof(Store.Document.Item);
                    expect(subItem.path).to.deep.equal(['a','b','c','n','m']);

                    var subItem = item.get('.././x');
                    expect(subItem.path).to.deep.equal(['a','b','x']);
                });

                it("should return null if the trying to retrieve a root anchestor", () => {
                    var item = doc.get('a');
                    var subItem = item.get('../..');
                    expect(subItem).to.be.null;
                });
            });

            describe(`${storeName}.Document.Item.prototype.value - getter/setter`, () => {

                it("should get/set the item value", () => {
                    item = doc.get('item');

                    var newValue = {
                        dict: {a:1, b:2, c:3},
                        list: [10, 20, 30],
                        text: "abc",
                        numb: 10,
                        bool: true
                    };

                    item.value = newValue;

                    expect(item.value).to.deep.equal(newValue);

                    expect(item.get('dict').value).to.deep.equal(newValue.dict);
                    expect(item.get('dict/a').value).to.equal(newValue.dict.a);
                    expect(item.get('dict/b').value).to.equal(newValue.dict.b);
                    expect(item.get('dict/c').value).to.equal(newValue.dict.c);

                    expect(item.get('list').value).to.deep.equal(newValue.list);
                    expect(item.get('list/0').value).to.equal(newValue.list[0]);
                    expect(item.get('list/1').value).to.equal(newValue.list[1]);
                    expect(item.get('list/2').value).to.equal(newValue.list[2]);

                    expect(item.get('text').value).to.equal(newValue.text);
                    expect(item.get('numb').value).to.equal(newValue.numb);
                    expect(item.get('bool').value).to.equal(newValue.bool);
                    expect(item.get('xxxx').value).to.be.null;
                });

                it("should get/set a deep copy of the value", () => {
                    item = doc.get('item');

                    var newValue = {a:1, b:2, c:3};

                    item.value = newValue;
                    expect(item.value).to.deep.equal({a:1, b:2, c:3});
                    expect(newValue).to.deep.equal({a:1, b:2, c:3})

                    newValue.a = 10;
                    expect(item.value).to.deep.equal({a:1, b:2, c:3});
                    expect(newValue).to.deep.equal({a:10, b:2, c:3})

                    item.get('b').value = 20;
                    expect(item.value).to.deep.equal({a:1, b:20, c:3});
                    expect(newValue).to.deep.equal({a:10, b:2, c:3})
                });

                it("should work also with the root item", () => {
                    var root = doc.get();

                    root.value = {a:1, b:2, c:3};
                    expect(root.value).to.deep.equal({a:1, b:2, c:3});

                    root.value = {a:1, b:20};
                    expect(root.value).to.deep.equal({a:1, b:20});
                });

                it("should throw an error if trying to assign a non-dict to the root item", () => {
                    var root = doc.get();
                    expect(() => {root.value = 10}).to.throw(Error);
                });

                it("should throw an error if trying to assign to a parent-less item", () => {
                    var item = doc.get('item');
                    item.value = "abc";

                    var subItem = item.get('x/y');
                    expect(() => {subItem.value = 10}).to.throw(Error);
                });
            });

            describe(`${storeName}.Document.Item.prototype.type - getter`, () => {
                it("should return the type of this item", () => {
                    item = doc.get('item');
                    item.value = {
                        dict: {a:1, b:2, c:3},
                        list: [10, 20, 30],
                        text: "abc",
                        numb: 10,
                        bool: true
                    };

                    expect(item.get('dict').type).to.equal("dict");
                    expect(item.get('dict/a').type).to.equal("numb");
                    expect(item.get('dict/b').type).to.equal("numb");
                    expect(item.get('dict/c').type).to.equal("numb");
                    expect(item.get('list').type).to.equal("list");
                    expect(item.get('list/0').type).to.equal("numb");
                    expect(item.get('list/1').type).to.equal("numb");
                    expect(item.get('list/2').type).to.equal("numb");
                    expect(item.get('text').type).to.equal("text");
                    expect(item.get('numb').type).to.equal("numb");
                    expect(item.get('bool').type).to.equal("bool");
                    expect(item.get('xxxx').type).to.equal("none");
                });
            });

            describe(`${storeName}.Document.Item.prototype.subscribe(callback)`, () => {
                var item, subscription, change;

                it("should be a function", () => {
                    item = doc.get('item');
                    expect(item.subscribe).to.be.instanceof(Function);
                });

                it("should return a subscription object", () => {
                    item = doc.get('item');
                    subscription = item.subscribe((c) => {change = c});
                    expect(subscription).to.be.instanceof(Store.Document.Subscription);
                });

                it("should call the callback when the item value changes", () => {
                    item = doc.get('item');
                    item.value = 10;
                    change = null;
                    item.value = 11;
                    expect(change).to.be.instanceof(Store.Document.Change);
                    expect(change.path).to.deep.equal([]);
                    expect(change.removed).to.equal(10);
                    expect(change.inserted).to.equal(11);
                });

                it("should stop notifying the callback when the subscription is cancelled", () => {
                    item = doc.get('item');
                    item.value = 10;
                    change = null;
                    item.value = 11;
                    expect(change).to.be.instanceof(Store.Document.Change);

                    subscription.cancel();

                    change = null;
                    item.value = 12;
                    expect(change).to.be.null;
                });

                it("should call the callback when a sub-item value changes", () => {
                    item = doc.get('item');
                    item.value = {x: {y: {z:10}}};
                    var z = item.get("x/y/z");

                    subscription = item.subscribe((c) => {change = c});
                    change = null;

                    z.value = 11;
                    expect(change).to.be.instanceof(Store.Document.Change);
                    expect(change.path).to.deep.equal(['x','y','z']);
                    expect(change.removed).to.equal(10);
                    expect(change.inserted).to.equal(11);

                    subscription.cancel();
                });

                it("should call the callback when the item value changes due to parent value change", () => {
                    item = doc.get('item');
                    item.value = {x: {y: {z:10}}};
                    var z = item.get("x/y/z");

                    subscription = z.subscribe((c) => {change = c});
                    change = null;

                    item.value = "abc";
                    expect(change).to.be.instanceof(Store.Document.Change);
                    expect(change.path).to.deep.equal([]);
                    expect(change.removed).to.equal(10);
                    expect(change.inserted).to.equal(null);

                    subscription.cancel();
                });
            });
        });
    }


    function describeDict () {
        describe(`${storeName}.Document.Dict`, () => {
            var dict;

            it("should be a class inheriting from Item", () => {
                expect(Store.Document.Dict.prototype).to.be.instanceof(Store.Document.Item);
            });

            describe(`${storeName}.Document.Dict.prototype.keys - getter`, () => {
                it("should return an array with the dict keys", () => {
                    dict = doc.get('dict');
                    dict.value = {a:1, b:2, c:3};
                    expect(dict.keys.sort()).to.deep.equal(['a','b','c']);
                });
            });

            describe(`${storeName}.Document.Dict.prototype.set(key, value)`, () => {

                it("should be a function", () => {
                    expect(dict.set).to.be.instanceof(Function);
                });

                it("should set the value of the key", () => {
                    dict = doc.get('dict');
                    dict.value = {a:1};
                    dict.set('a', 10);
                    dict.set('b', 20);
                    expect(dict.value).to.deep.equal({a:10, b:20});
                });

                it("should throw an error if the value is not valid", () => {
                    dict = doc.get('dict');
                    dict.value = {};
                    expect(() => {dict.set('foo', function () {})}).to.throw(Error);
                    expect(() => {dict.set('foo', null)}).to.throw(Error);
                    expect(() => {dict.set('foo', undefined)}).to.throw(Error);
                });

                it("should dispatch the change event to the subscribed callbacks", () => {
                    dict = doc.get('dict');
                    dict.value = {};

                    var change;
                    dict.set('d', {x:10});
                    var subscription = dict.subscribe((c) => {change = c});

                    dict.get('d').set('x', 20);
                    expect(change.path).to.deep.equal(['d','x']);
                    expect(change.removed).to.equal(10);
                    expect(change.inserted).to.equal(20);

                    dict.get('d').set('y', 30);
                    expect(change.path).to.deep.equal(['d','y']);
                    expect(change.removed).to.be.null;
                    expect(change.inserted).to.equal(30);

                    subscription.cancel();
                });
            });

            describe(`${storeName}.Document.Dict.prototype.remove(key)`, () => {

                it("should be a function", () => {
                    expect(dict.remove).to.be.instanceof(Function);
                });

                it("should delete the key", () => {
                    dict = doc.get('dict');
                    dict.value = {x:10, y:20};
                    dict.remove('x');
                    expect(dict.value).to.deep.equal({y:20});
                });

                it("should dispatch the change event to the subscribed callbacks", () => {
                    dict = doc.get('dict');
                    dict.value = {x:10, y:20};

                    var change;
                    var subscription = dict.subscribe((c) => {change = c});

                    dict.remove('x');
                    expect(change.path).to.deep.equal(['x']);
                    expect(change.removed).to.equal(10);
                    expect(change.inserted).to.be.null;

                    change = null;
                    dict.remove('x');
                    expect(change).to.be.null;

                    subscription.cancel();
                });
            });
        });
    }


    function describeList () {
        describe(`${storeName}.Document.List`, () => {
            var list;

            it("should be a class inheriting from Item", () => {
                expect(Store.Document.List.prototype).to.be.instanceof(Store.Document.Item);
            });

            describe(`${storeName}.Document.List.prototype.size - getter`, () => {
                it("should return the number of items in the array", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    expect(list.size).to.equal(3);
                });
            });

            describe(`${storeName}.Document.List.prototype.set(index, value)`, () => {

                it("should be a function", () => {
                    expect(list.set).to.be.instanceof(Function);
                });

                it("should set the value of the item at the given index", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    list.set(1, 21);
                    expect(list.value).to.deep.equal([10, 21, 30]);
                });

                it("should interpret negative indexes as relative to the end", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    list.set(-1, 31);
                    expect(list.value).to.deep.equal([10, 20, 31]);
                });

                it("should throw an error if index is out of range", () => {
                    list = doc.get('list');
                    list.value = [];
                    expect(() => {list.set(100, 1)}).to.throw(Error);
                    expect(() => {list.set(-100, 1)}).to.throw(Error);
                });

                it("should throw an error if index is not a number", () => {
                    list = doc.get('list');
                    list.value = [];
                    expect(() => {list.set('x', 1)}).to.throw(Error);
                });

                it("should throw an error if the new item value is not valid", () => {
                    list = doc.get('list');
                    list.value = [];
                    expect(() => {list.set('x', function () {})}).to.throw(Error);
                    expect(() => {list.set('x', null)}).to.throw(Error);
                    expect(() => {list.set('x', undefined)}).to.throw(Error);
                });

                it("should dispatch the change event to the subscribed callbacks", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];

                    var change;
                    var subscription = list.subscribe((c) => {change = c});

                    list.set(1, 21);
                    expect(change.path).to.deep.equal(['1']);
                    expect(change.removed).to.deep.equal(20);
                    expect(change.inserted).to.deep.equal(21);

                    subscription.cancel();
                });
            });

            describe(`${storeName}.Document.List.prototype.insert(index, ...items)`, () => {

                it("should be a function", () => {
                    expect(list.insert).to.be.instanceof(Function);
                });

                it("should insert the given items at the given index", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    list.insert(1, 11, 12);
                    expect(list.value).to.deep.equal([10, 11, 12, 20, 30]);
                });

                it("should interpret negative indexes as relative to the end", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    list.insert(-1, 21, 22);
                    expect(list.value).to.deep.equal([10, 20, 21, 22, 30]);
                });

                it("should throw an error if index is out of range", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    expect(() => {list.insert(100, 1)}).to.throw(Error);
                    expect(() => {list.insert(-100, 1)}).to.throw(Error);
                    expect(list.value).to.deep.equal([10, 20, 30]);
                });

                it("should throw an error if index is not a number", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    expect(() => {list.insert('x', 1)}).to.throw(Error);
                    expect(list.value).to.deep.equal([10, 20, 30]);
                });

                it("should throw an error if any new item is not a valid value", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    function foo () {list.insert(1, 11, function () {})};
                    expect(foo).to.throw(Error);
                    expect(list.value).to.deep.equal([10, 20, 30]);
                });

                it("should dispatch the change event to the subscribed callbacks", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];

                    var change;
                    var subscription = list.subscribe((c) => {change = c});

                    list.insert(1, 11);
                    expect(change.path).to.deep.equal(['1']);
                    expect(change.removed).to.deep.equal(null);
                    expect(change.inserted).to.deep.equal(11);

                    subscription.cancel();
                });
            });

            describe(`${storeName}.Document.List.prototype.append(...items)`, () => {

                it("should be a function", () => {
                    expect(list.append).to.be.instanceof(Function);
                });

                it("should add the given items at the end of the array", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    list.append(40, 50);
                    expect(list.value).to.deep.equal([10, 20, 30, 40, 50]);
                });

                it("should throw an error if any new item is not a valid value", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    expect(() => {list.append(40, function () {})}).to.throw(Error);
                    expect(list.value).to.deep.equal([10, 20, 30]);
                });

                it("should dispatch the change event to the subscribed callbacks", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];

                    var change;
                    var subscription = list.subscribe((c) => {change = c});

                    list.append(40);
                    expect(change.path).to.deep.equal(['3']);
                    expect(change.removed).to.deep.equal(null);
                    expect(change.inserted).to.deep.equal(40);

                    subscription.cancel();
                });
            });

            describe(`${storeName}.Document.List.prototype.remove(index, count)`, () => {

                it("should be a function", () => {
                    expect(list.remove).to.be.instanceof(Function);
                });

                it("should remove `count` items starting at `index`", () => {
                    list = doc.get('list');
                    list.value = [10, 11, 12, 13, 14];
                    list.remove(1, 3);
                    expect(list.value).to.deep.equal([10, 14]);
                });

                it("should default to `count=1` if omitted", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    list.remove(1);
                    expect(list.value).to.deep.equal([10, 30]);
                });

                it("should interpret negative indexes as relative to the end", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30, 40, 50];
                    list.remove(-3, 2);
                    expect(list.value).to.deep.equal([10, 20, 50]);
                });

                it("should remove up to the end of the list if count overflows", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30, 40, 50];
                    list.remove(3, 100);
                    expect(list.value).to.deep.equal([10, 20, 30]);
                });

                it("should throw an error if index is out of range", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    expect(() => {list.remove(100)}).to.throw(Error);
                    expect(() => {list.remove(-100)}).to.throw(Error);
                    expect(list.value).to.deep.equal([10, 20, 30]);
                });

                it("should throw an error if index is not a number", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    expect(() => {list.remove('x')}).to.throw(Error);
                    expect(list.value).to.deep.equal([10, 20, 30]);
                });

                it("should throw an error if `count` is negative or not a number", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30];
                    expect(() => {list.remove(1, -1)}).to.throw(Error);
                    expect(() => {list.remove(1, 'x')}).to.throw(Error);
                    expect(list.value).to.deep.equal([10, 20, 30]);
                });

                it("should dispatch the change event to the subscribed callbacks", () => {
                    list = doc.get('list');
                    list.value = [10, 20, 30, 40, 50];

                    var change;
                    var subscription = list.subscribe((c) => {change = c});

                    list.remove(1);
                    expect(change.path).to.deep.equal(['1']);
                    expect(change.removed).to.deep.equal(20);
                    expect(change.inserted).to.deep.equal(null);

                    subscription.cancel();
                });
            });
        });
    }


    function describeText () {
        describe(`${storeName}.Document.Text`, () => {
            var text;

            it("should be a class inheriting from Item", () => {
                expect(Store.Document.Text.prototype).to.be.instanceof(Store.Document.Item);
            });

            describe(`${storeName}.Document.Text.prototype.size - getter`, () => {
                it("should return the number of characters in the text", () => {
                    text = doc.get('text');

                    text.value = "abc";
                    expect(text.size).to.equal(3);

                    text.value = "abcdef";
                    expect(text.size).to.equal(6);
                });
            });

            describe(`${storeName}.Document.Text.prototype.insert(index, string)`, () => {

                it("should be a function", () => {
                    expect(text.insert).to.be.instanceof(Function);
                });

                it("should insert the given string at the given index", () => {
                    text = doc.get('text');
                    text.value = "abc";
                    text.insert(1, "xxx");
                    expect(text.value).to.equal("axxxbc");
                });

                it("should interpret negative indexes as relative to the end", () => {
                    text = doc.get('text');
                    text.value = "abc";
                    text.insert(-1, "xxx");
                    expect(text.value).to.equal("abxxxc");
                });

                it("should throw an error if index is out of range", () => {
                    text = doc.get('text');
                    text.value = "abc";
                    expect(() => {text.insert(100, "xxx")}).to.throw(Error);
                    expect(() => {text.insert(-100, "xxx")}).to.throw(Error);
                    expect(text.value).to.equal("abc");
                });

                it("should throw an error if index is not a number", () => {
                    text = doc.get('text');
                    text.value = "abc";
                    expect(() => {text.insert('x', "xxx")}).to.throw(Error);
                    expect(text.value).to.equal("abc");
                });

                it("should dispatch the change event to the subscribed callbacks", () => {
                    text = doc.get('text');
                    text.value = "abc";

                    var change;
                    var subscription = text.subscribe((c) => {change = c});

                    text.insert(1, "xxx");
                    expect(change.path).to.deep.equal(['1']);
                    expect(change.removed).to.deep.equal("");
                    expect(change.inserted).to.deep.equal("xxx");

                    subscription.cancel();
                });
            });

            describe(`${storeName}.Document.Text.prototype.append(string)`, () => {

                it("should be a function", () => {
                    expect(text.append).to.be.instanceof(Function);
                });

                it("should add the given string at the end of the text", () => {
                    text = doc.get('text');
                    text.value = "abc";
                    text.append("xxx");
                    expect(text.value).to.equal("abcxxx");
                });

                it("should dispatch the change event to the subscribed callbacks", () => {
                    text = doc.get('text');
                    text.value = "abc";

                    var change;
                    var subscription = text.subscribe((c) => {change = c});

                    text.append("xxx");
                    expect(change.path).to.deep.equal(['3']);
                    expect(change.removed).to.deep.equal("");
                    expect(change.inserted).to.deep.equal("xxx");

                    subscription.cancel();
                });
            });

            describe(`${storeName}.Document.Text.prototype.remove(index, count)`, () => {

                it("should be a function", () => {
                    expect(text.remove).to.be.instanceof(Function);
                });

                it("should remove `count` characters starting at `index`", () => {
                    text = doc.get('text');
                    text.value = "abcdef";
                    text.remove(1,3);
                    expect(text.value).to.equal("aef");
                });

                it("should default to `count=1` if omitted", () => {
                    text = doc.get('text');
                    text.value = "abcdef";
                    text.remove(2);
                    expect(text.value).to.equal("abdef");
                });

                it("should interpret negative indexes as relative to the end", () => {
                    text = doc.get('text');
                    text.value = "abcdef";
                    text.remove(-3, 2);
                    expect(text.value).to.equal("abcf");
                });

                it("should remove up to the end of the list if count overflows", () => {
                    text = doc.get('text');
                    text.value = "abcdef";
                    text.remove(3, 100);
                    expect(text.value).to.equal("abc");
                });

                it("should throw an error if index is out of range", () => {
                    text = doc.get('text');
                    text.value = "abc";
                    expect(() => {text.remove(100)}).to.throw(Error);
                    expect(() => {text.remove(-100)}).to.throw(Error);
                    expect(text.value).to.equal("abc");
                });

                it("should throw an error if index is negative or not a number", () => {
                    text = doc.get('text');
                    text.value = "abc";
                    expect(() => {text.remove(1, "x")}).to.throw(Error);
                    expect(() => {text.remove(1, -1)}).to.throw(Error);
                    expect(text.value).to.equal("abc");
                });

                it("should dispatch the change event to the subscribed callbacks", () => {
                    text = doc.get('text');
                    text.value = "abcdef";

                    var change;
                    var subscription = text.subscribe((c) => {change = c});

                    text.remove(1, 3);
                    expect(change.path).to.deep.equal(['1']);
                    expect(change.removed).to.deep.equal("bcd");
                    expect(change.inserted).to.deep.equal("");

                    subscription.cancel();
                });
            });
        });
    }
}
