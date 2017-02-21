
var AbstractStore = require("olojs/stores/AbstractStore");
var utils = require("olojs/utils");


module.exports = function describeStore (storeName, TestStore, host) {


    describe(storeName, function () {

        it("should be a class extending AbstractStore", () => {
            expect(TestStore).to.be.a("function");
            expect(TestStore.prototype).to.be.instanceof(AbstractStore);
        });

        describe(`${storeName}.protocol`, () => {

            it("should be a string ending with ':'", function () {
                expect(TestStore.protocol).to.be.a("string");
                expect(TestStore.protocol[TestStore.protocol.length-1]).to.equal(":");
            });
        });

        describe(`${storeName}.Document`, () => {

            it("should be a class extending AbstractStore.Document", () => {
                expect(TestStore.Document).to.be.a("function");
                expect(TestStore.Document.prototype).to.be.instanceof(AbstractStore.Document);
            });
        });
    });



    describe(`store = new ${storeName}(id)`, () => {
        var store, doc;

        before(() => {
            store = new TestStore(host);
        });

        describe("store.Store", () => {
            it(`should refer to the ${storeName} class`, () => {
                expect(store.Store).to.equal(TestStore);
            });
        });

        describe("store.host", () => {
            it("should be the host string passed to the constructor", () => {
                expect(store.host).to.equal(host);
            });
        });

        describe("store.url", () => {
            it("should return the store protocol followed by the store id", () => {
                expect(store.url).to.equal(TestStore.protocol + "//"+host);
            });
        });

        describe("store.connect", () => {
            var connectionPromise;

            it("should be a function", () => {
                expect(store.connect).to.be.instanceof(Function);
            });

            it("should return a promise", () => {
                connectionPromise = store.connect();
                expect(connectionPromise).to.be.instanceof(Promise);
            });

            it("should resolve when the connection is established", (done) => {
                connectionPromise.then((retval) => {
                    expect(store.connected).to.be.true;
                    done();
                });
            });
        });

        describe("store.getDocument", () => {
            var docPromise;

            it("should be a function", () => {
                expect(store.getDocument).to.be.instanceof(Function);
            });

            it("should return a promise", () => {
                docPromise = store.getDocument('test-doc');
                expect(docPromise).to.be.instanceof(Promise);
            });

            it(`should resolve a ${storeName}.Document instance`, (done) => {
                async function test () {
                    doc = await docPromise;
                    expect(doc).to.be.instanceof(TestStore.Document);
                }
                test().then(done).catch(done);
            });

            it("should return the same document for the same id", (done) => {
                async function test () {
                    var doc1 = await store.getDocument('test-doc');
                    var doc2 = await store.getDocument('test-doc');
                    expect(doc1).to.equal(doc2);
                }
                test().then(done).catch(done);
            });
        });

        describe("store.disconnect", () => {
            var disconnectPromise;

            it("should be a function", () => {
                expect(store.disconnect).to.be.instanceof(Function);
            });                

            it("should return a promise", () => {
                disconnectPromise = store.disconnect();
                expect(disconnectPromise).to.be.instanceof(Promise);
            });

            it("should resolve when the connection is closed", (done) => {
                disconnectPromise.then((retval) => {
                    expect(store.connected).to.be.false;
                    done();
                });
            });
        });
    });



    describe(`doc = new ${storeName}.Document(store, id)`, () => {
        var store, doc;

        var content = {
            'n1': 1,
            't1': "abc",
            'b1': true,
            'l1': ['a', 'b', 'c'],
            'd1': {
                'n2': 2,
                't2': "defg",
                'b2': false,
                'l2': ['d', 'e', 'f', 'g'],
                'd2': {
                    'n3': 3,
                    't3': "hijkl",
                    'b3': true,
                    'l3': ['h', 'i', 'j', 'k', 'l'],
                    'd3': {}
                }
            }
        }

        before((done) => {
            async function init () {
                store = new TestStore(host);
                await store.connect();
                doc = await store.getDocument('test-doc');
                for (let key of doc.getDictKeys()) doc.removeDictItem('', key);
                doc.setDictItem('', 'd0', utils.clone(content));
            }
            init().then(done).catch(done);
        });

        describe("doc.Store", () => {
            it(`should refer to the ${storeName} class`, () => {
                expect(doc.Store).to.equal(TestStore);
            });                
        });

        describe("doc.store", () => {
            it("should refer to the store that contains doc", () => {
                expect(doc.store).to.equal(store);
            });
        });

        describe("doc.id", () => {
            it("should be a string", () => {
                expect(doc.id).to.be.a("string");
            });
        });

        describe("doc.url", () => {
            it("should return the store url followed by the doc id", () => {
                expect(doc.url).to.equal(store.url + "/" + doc.id);
            });
        });

        describe('doc.get', () => {

            it("should be a function", () => {
                expect(doc.get).to.be.a("function");
            });     

            it("should return the value of the item at the given path", () => {
                expect(doc.get('')).to.deep.equal({'d0':content});
                expect(doc.get('d0')).to.deep.equal(content);
                expect(doc.get('d0/n1')).to.equal(1);
                expect(doc.get('d0/b1')).to.be.true;
                expect(doc.get('d0/t1')).to.equal("abc");
                expect(doc.get('d0/l1')).to.deep.equal(['a','b','c']);
                expect(doc.get('d0/d1/n2')).to.equal(2);
                expect(doc.get('d0/d1/b2')).to.be.false;
                expect(doc.get('d0/d1/t2')).to.equal("defg");
                expect(doc.get('d0/d1/l2')).to.deep.equal(['d','e','f','g']);
                expect(doc.get('d0/d1/d2/n3')).to.equal(3);
                expect(doc.get('d0/d1/d2/b3')).to.be.true;
                expect(doc.get('d0/d1/d2/t3')).to.equal("hijkl");
                expect(doc.get('d0/d1/d2/l3')).to.deep.equal(['h','i','j','k','l']);
            });           

            it("should return null if the path doen't exist", () => {
                expect(doc.get('undefined_path')).to.be.null;
                expect(doc.get('d0/undefined_path')).to.be.null;
                expect(doc.get('d0/d1/undefined_path')).to.be.null;
            });
        });

        describe('doc.type', () => {

            it("should be a function", () => {
                expect(doc.type).to.be.a("function");
            });     

            it("should return the type of the item at the given path", () => {
                expect(doc.type('')).to.equal("dict");
                expect(doc.type('d0')).to.equal("dict");
                expect(doc.type('d0/n1')).to.equal("numb");
                expect(doc.type('d0/b1')).to.equal("bool");
                expect(doc.type('d0/t1')).to.equal("text");
                expect(doc.type('d0/l1')).to.equal("list");
                expect(doc.type('d0/d1')).to.equal("dict");
                expect(doc.type('d0/d1/n2')).to.equal("numb");
                expect(doc.type('d0/d1/b2')).to.equal("bool");
                expect(doc.type('d0/d1/t2')).to.equal("text");
                expect(doc.type('d0/d1/l2')).to.equal("list");
                expect(doc.type('d0/d1/d2')).to.equal("dict");
                expect(doc.type('d0/d1/d2/n3')).to.equal("numb");
                expect(doc.type('d0/d1/d2/b3')).to.equal("bool");
                expect(doc.type('d0/d1/d2/t3')).to.equal("text");
                expect(doc.type('d0/d1/d2/l3')).to.equal("list");
            });           

            it("should return 'none' if the path doen't exist", () => {
                expect(doc.type('undefined_path')).to.equal("none");
                expect(doc.type('d0/undefined_path')).to.equal("none");
                expect(doc.type('d0/d1/undefined_path')).to.equal("none");
            });
        });

        describe('doc.getDictKeys', () => {

            it("should be a function", () => {
                expect(doc.getDictKeys).to.be.a("function");
            });     

            it("should return the keys array of the dictionary at the given path", () => {
                expect(doc.getDictKeys('').sort()).to.deep.equal(['d0']);
                expect(doc.getDictKeys('d0').sort()).to.deep.equal(['b1','d1','l1','n1','t1']);
                expect(doc.getDictKeys('d0/d1').sort()).to.deep.equal(['b2','d2','l2','n2','t2']);
                expect(doc.getDictKeys('d0/d1/d2').sort()).to.deep.equal(['b3','d3','l3','n3','t3']);
            });           
        });

        describe('doc.getListSize', () => {

            it("should be a function", () => {
                expect(doc.getListSize).to.be.a("function");
            });     

            it("should return the number of items of the list at the given path", () => {
                expect(doc.getListSize('d0/l1')).to.equal(3);
                expect(doc.getListSize('d0/d1/l2')).to.equal(4);
                expect(doc.getListSize('d0/d1/d2/l3')).to.equal(5);
            });           
        });

        describe('doc.getTextSize', () => {

            it("should be a function", () => {
                expect(doc.getTextSize).to.be.a("function");
            });     

            it("should return the number of characters of the text at the given path", () => {
                expect(doc.getTextSize('d0/t1')).to.equal(3);
                expect(doc.getTextSize('d0/d1/t2')).to.equal(4);
                expect(doc.getTextSize('d0/d1/d2/t3')).to.equal(5);
            });           
        });

        describe('doc.setDictItem', () => {

            before(() => {
                doc.setDictItem('', 'd0', utils.clone(content));
            });

            it("should be a function", () => {
                expect(doc.setDictItem).to.be.a("function");
            });    

            it("should change a key:value item", () => {
                doc.setDictItem('d0', 'x1', 10);
                expect(doc.get('d0/x1')).to.equal(10);
                doc.setDictItem('d0', 't1', 'xxx');
                expect(doc.get('d0/t1')).to.equal("xxx");

                doc.setDictItem('d0/d1', 'x2', 20);
                expect(doc.get('d0/d1/x2')).to.equal(20);
                doc.setDictItem('d0/d1', 't2', 'xxxx');
                expect(doc.get('d0/d1/t2')).to.equal("xxxx");
            });

            it("should dispatch the change event to the subscribed callbacks", () => {
                var change0, change3;
                var subscription0 = doc.subscribe('d0', (change) => {change0 = change});
                var subscription3 = doc.subscribe('d0/d1/d2/d3', (change) => {change3 = change});

                change0 = change3 = null;
                doc.setDictItem('d0', 't1', 'abc');
                expect(change0.type).to.equal("dict");
                expect(String(change0.path)).to.equal('t1');
                expect(change0.removed).to.equal("xxx");
                expect(change0.inserted).to.equal("abc");
                expect(change3).to.be.null;

                change0 = change3 = null;
                doc.setDictItem('d0/d1/d2/d3', 'x', 10);
                expect(change0.type).to.equal("dict");
                expect(String(change0.path)).to.equal('d1/d2/d3/x');
                expect(change0.removed).to.be.null;
                expect(change0.inserted).to.equal(10);
                expect(change3.type).to.equal("dict");
                expect(String(change3.path)).to.equal('x');
                expect(change3.removed).to.be.null;
                expect(change3.inserted).to.equal(10);

                change0 = change3 = null;
                var d2 = utils.clone(doc.get('d0/d1/d2'));
                doc.setDictItem('d0/d1', 'd2', 0);
                expect(change0.type).to.equal("dict");
                expect(String(change0.path)).to.equal('d1/d2');
                expect(change0.removed).to.deep.equal(d2);
                expect(change0.inserted).to.equal(0);
                expect(change3.type).to.equal("dict");
                expect(String(change3.path)).to.equal("");
                expect(change3.removed).to.deep.equal(d2.d3);
                expect(change3.inserted).to.be.null;

                change0 = change3 = null;
                doc.setDictItem('d0/d1', 'd2', {d3:1});
                expect(change0.type).to.equal("dict");
                expect(String(change0.path)).to.equal( 'd1/d2');
                expect(change0.removed).to.equal(0);
                expect(change0.inserted).to.deep.equal({d3:1});
                expect(change3.type).to.equal("dict");
                expect(String(change3.path)).to.equal("");
                expect(change3.removed).to.equal(null);
                expect(change3.inserted).to.deep.equal(1);

                doc.unsubscribe(subscription0);
                doc.unsubscribe(subscription3);                    

                change0 = change3 = null;
                doc.setDictItem('d0/d1/d2', 'd3', 2);
                expect(change0).to.be.null;
                expect(change3).to.be.null;
            });
        });

        describe('doc.removeDictItem', () => {

            before(() => {
                doc.setDictItem('', 'd0', utils.clone(content));
            });

            it("should be a function", () => {
                expect(doc.removeDictItem).to.be.a("function");
            });                

            it("should remove the item mapped to the given key", () => {
                
                doc.setDictItem('d0', 'x1', 10);
                doc.removeDictItem('d0', 'x1');
                expect(doc.get('d0/x1')).to.be.null;

                doc.setDictItem('d0/d1', 'x2', 20);
                doc.removeDictItem('d0/d1', 'x2');
                expect(doc.get('d0/d1/x2')).to.be.null;

                doc.removeDictItem('d0/d1/d2', 'x3');
                expect(doc.get('d0/d1/d2/x3')).to.be.null;
            });              

            it("should dispatch the change event to the subscribed callbacks", () => {
                var change0, change3;
                var subscription0 = doc.subscribe('d0', (change) => {change0 = change});
                var subscription3 = doc.subscribe('d0/d1/d2/d3', (change) => {change3 = change});

                change0 = change3 = null;
                doc.removeDictItem('d0', 't1');
                expect(change0.type).to.equal("dict");
                expect(String(change0.path)).to.equal('t1');
                expect(change0.removed).to.equal("abc");
                expect(change0.inserted).to.be.null;
                expect(change3).to.be.null;

                change0 = change3 = null;
                doc.setDictItem('d0/d1/d2/d3', 'x', 10);
                doc.removeDictItem('d0/d1/d2/d3', 'x');
                expect(change0.type).to.equal("dict");
                expect(String(change0.path)).to.equal('d1/d2/d3/x');
                expect(change0.removed).to.equal(10);
                expect(change0.inserted).to.be.null;
                expect(change3.type).to.equal("dict");
                expect(String(change3.path)).to.equal('x');
                expect(change0.removed).to.equal(10);
                expect(change0.inserted).to.be.null;

                change0 = change3 = null;
                var d2 = utils.clone(doc.get('d0/d1/d2'));
                doc.removeDictItem('d0/d1', 'd2');
                expect(change0.type).to.equal("dict");
                expect(String(change0.path)).to.equal('d1/d2');
                expect(change0.removed).to.deep.equal(d2);
                expect(change0.inserted).to.be.null;
                expect(change3.type).to.equal("dict");
                expect(String(change3.path)).to.equal("");
                expect(change3.removed).to.deep.equal(d2.d3);
                expect(change3.inserted).to.be.null;

                change0 = change3 = null;
                doc.removeDictItem('d0/d1', 'd2');
                expect(change0).to.be.null;
                expect(change3).to.be.null;

                doc.unsubscribe(subscription0);
                doc.unsubscribe(subscription3);                    

                change0 = change3 = null;
                doc.setDictItem('d0', 'd1');
                expect(change0).to.be.null;
                expect(change3).to.be.null;
            });
        });

        describe('doc.setListItem', () => {

            before(() => {
                doc.setDictItem('', 'd0', utils.clone(content));
            });

            it("should be a function", () => {
                expect(doc.setListItem).to.be.a("function");
            });

            it("should change the value of the item at the give index", () => {
                doc.setListItem('d0/l1', 1, 'bb');
                expect(doc.get('d0/l1')).to.deep.equal(['a','bb','c']);
            });

            it("should dispatch the change event to the doc.callbacks", () => {
                var change0;
                var subscription0 = doc.subscribe('d0', (change) => {change0 = change});

                doc.setListItem('d0/l1', 2, 'cc');

                expect(change0.type).to.equal("list");
                expect(String(change0.path)).to.equal('l1/2');
                expect(change0.removed).to.deep.equal(['c']);
                expect(change0.inserted).to.deep.equal(['cc']);

                doc.unsubscribe(subscription0);
            });
        });

        describe('doc.insertListItems', () => {

            before(() => {
                doc.setDictItem('', 'd0', utils.clone(content));
            });

            it("should be a function", () => {
                expect(doc.insertListItems).to.be.a("function");
            });

            it("should insert the passed items at the given index", () => {
                doc.insertListItems('d0/l1', 1, 'x', 'y', 'z');
                expect(doc.get('d0/l1')).to.deep.equal(['a','x','y','z','b','c']);
            });

            it("should dispatch the change event to the doc.callbacks", () => {
                var change0;
                var subscription0 = doc.subscribe('d0', (change) => {change0 = change});
                doc.insertListItems('d0/l1', 1, 'i1');

                expect(change0.type).to.equal("list");
                expect(String(change0.path)).to.equal('l1/1');
                expect(change0.removed).to.deep.equal([]);
                expect(change0.inserted).to.deep.equal(['i1']);

                doc.unsubscribe(subscription0);
            });
        });

        describe('doc.removeListItems', () => {

            before(() => {
                doc.setDictItem('', 'd0', utils.clone(content));
            });

            it("should be a function", () => {
                expect(doc.removeListItems).to.be.a("function");
            });

            it("should remove count items from the list, starting the i-th item", () => {
                doc.insertListItems('d0/l1', 1, 'x', 'y', 'z');
                expect(doc.get('d0/l1')).to.deep.equal(['a','x','y','z','b','c']);
                doc.removeListItems('d0/l1', 1, 3);
                expect(doc.get('d0/l1')).to.deep.equal(['a','b','c']);
            });

            it("should dispatch the change event to the doc.callbacks", () => {
                var change0;
                var subscription0 = doc.subscribe('d0', (change) => {change0 = change});

                doc.insertListItems('d0/l1', 1, 'x', 'y', 'z');
                doc.removeListItems('d0/l1', 1, 1);

                expect(change0.type).to.equal("list");
                expect(String(change0.path)).to.equal('l1/1');
                expect(change0.removed).to.deep.equal(['x']);
                expect(change0.inserted).to.deep.equal([]);

                doc.unsubscribe(subscription0);
            });
        });

        describe('doc.insertText', () => {

            before(() => {
                doc.setDictItem('', 'd0', utils.clone(content));
            });

            it("should be a function", () => {
                expect(doc.insertText).to.be.a("function");
            });

            it("should insert the given sub-string at the given index", () => {
                doc.insertText('d0/t1', 1, 'xxx');
                expect(doc.get('d0/t1')).to.equal('axxxbc');
            });

            it("should dispatch the change event to the doc.callbacks", () => {
                var change0;
                var subscription0 = doc.subscribe('d0', (change) => {change0 = change});

                doc.setDictItem('d0', 't1', "abc");
                doc.insertText('d0/t1', 1, 'xxx');

                expect(change0.type).to.equal("text");
                expect(String(change0.path)).to.equal('t1/1');
                expect(change0.removed).to.equal("");
                expect(change0.inserted).to.equal("xxx");

                doc.unsubscribe(subscription0);
            });
        });

        describe('doc.removeText', () => {

            before(() => {
                doc.setDictItem('', 'd0', utils.clone(content));
            });

            it("should be a function", () => {
                expect(doc.removeText).to.be.a("function");
            });

            it("should remove count charaters starting from at index", () => {
                doc.insertText('d0/t1', 1, 'xxx');
                expect(doc.get('d0/t1')).to.equal('axxxbc');
                doc.removeText('d0/t1', 1, 3);
                expect(doc.get('d0/t1')).to.equal('abc');
            })

            it("should dispatch the change event to the doc.callbacks", () => {
                var change0;
                var subscription0 = doc.subscribe('d0', (change) => {change0 = change});

                doc.setDictItem('d0', 't1', "axxxbc");
                doc.removeText('d0/t1', 1, 3);

                expect(change0.type).to.equal("text");
                expect(String(change0.path)).to.equal('t1/1');
                expect(change0.removed).to.equal("xxx");
                expect(change0.inserted).to.equal("");

                doc.unsubscribe(subscription0);
            });
        });

        after((done) => {
            store.disconnect().then(done).catch(done);
        });
    });
}
