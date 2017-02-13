define([
    "olojs/utils",
    "olojs/Path",
    "olojs/stores/MemoryStore",
    "olojs/Model"
], function (utils, Path, MemoryStore, Model) {

    function describeModel (url) {

        describe("Model", function () {
            var store, doc, model;

            var root = {
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
            };


            before((done) => {
                async function init () {
                    doc = await Model(url);
                }
                init().then(done).catch(done);
            });


            it("should be a function", () => {
                expect(Model).to.be.instanceof(Function);
            });


            describe("model = await Model(url)", () => {

                before(() => {
                    doc.set('root', utils.clone(root));
                });

                it("should resolve a Model.Item object", (done) => {
                    async function test () {
                        model = await Model(url+"/root");
                        expect(model).to.be.instanceof(Model.Item);
                    }
                    test().then(done).catch(done);
                });

                it("should return the same object for the same url", (done) => {
                    async function test () {
                        var m = await Model(url+"/root");
                        expect(m).to.equal(model);
                    }
                    test().then(done).catch(done);
                });

                it("should point to a Model.Dict object if the store item type is 'dict'", (done) => {
                    async function test () {
                        var d1 = await Model(url+"/root/d1");
                        expect(d1).to.be.instanceof(Model.Dict);
                    }
                    test().then(done).catch(done);
                });

                it("should point to a Model.List object if the store item type is 'list'", (done) => {
                    async function test () {
                        var l1 = await Model(url+"/root/l1");
                        expect(l1).to.be.instanceof(Model.List);
                    }
                    test().then(done).catch(done);
                });

                it("should point to a Model.Text object if the store item type is 'text'", (done) => {
                    async function test () {
                        var t1 = await Model(url+"/root/t1");
                        expect(t1).to.be.instanceof(Model.Text);
                    }
                    test().then(done).catch(done);
                });

                it("should point to a Model.Item object if the store item type is 'bool'", (done) => {
                    async function test () {
                        var b1 = await Model(url+"/root/b1");
                        expect(b1).to.be.instanceof(Model.Item);
                        expect(b1).to.not.be.instanceof(Model.Dict);
                        expect(b1).to.not.be.instanceof(Model.List);
                        expect(b1).to.not.be.instanceof(Model.Text);
                    }
                    test().then(done).catch(done);
                });

                it("should point to a Model.Item object if the store item type is 'numb'", (done) => {
                    async function test () {
                        var n1 = await Model(url+"/root/n1");
                        expect(n1).to.be.instanceof(Model.Item);
                        expect(n1).to.not.be.instanceof(Model.Dict);
                        expect(n1).to.not.be.instanceof(Model.List);
                        expect(n1).to.not.be.instanceof(Model.Text);
                    }
                    test().then(done).catch(done);
                });

                it("should point to a Model.Item object if the store item type is 'none'", (done) => {
                    async function test () {
                        var nn = await Model(url+"/root/non-existing-key");
                        expect(nn).to.be.instanceof(Model.Item);
                        expect(nn).to.not.be.instanceof(Model.Dict);
                        expect(nn).to.not.be.instanceof(Model.List);
                        expect(nn).to.not.be.instanceof(Model.Text);
                    }
                    test().then(done).catch(done);
                });

                it("should change type if the store item type changes", (done) => {
                    async function test () {
                        var d1 = await Model(url+"/root/d1");
                        expect(d1).to.be.instanceof(Model.Dict);
                        doc.set('root', {d1: "abc"});
                        expect(d1).to.be.instanceof(Model.Text);                    
                    }
                    test().then(done).catch(done);
                });            
            });


            describe("Model.Item.prototype.path - getter", () => {
                it("should return the model path relative to the document", (done) => {
                    async function test () {
                        var m = await Model(url+"/root/a/b/c");
                        expect(m.path).to.deep.equal(['root', 'a', 'b', 'c']);                    
                    }
                    test().then(done);
                });
            });


            describe("Model.Item.prototype.url - getter", () => {
                it("should return the model url", (done) => {
                    async function test () {
                        var m = await Model(url+"/root/a/b/c");
                        expect(m.url).to.equal(url+"/root/a/b/c");
                    }
                    test().then(done);
                });
            });


            describe("Model.Item.prototype.type - getter", () => {
                it("should return the type name of the model item", (done) => {
                    async function test () {
                        var doc = await Model(url);
                        doc.set('root', root);

                        var d1 = await Model(url+"/root/d1");
                        expect(d1.type).to.equal("dict");

                        var l1 = await Model(url+"/root/l1");
                        expect(l1.type).to.equal("list");

                        var t1 = await Model(url+"/root/t1");
                        expect(t1.type).to.equal("text");

                        var n1 = await Model(url+"/root/n1");
                        expect(n1.type).to.equal("numb");

                        var b1 = await Model(url+"/root/b1");
                        expect(b1.type).to.equal("bool");

                        var nn = await Model(url+"/root/nn");
                        expect(nn.type).to.equal("none");
                    }
                    test().then(done).catch(done);
                });            
            });


            describe("Model.Item.prototype.value - getter", () => {

                before(() => {
                    doc.set('root', utils.clone(root));
                });

                it("should return the value of the document item at path", (done) => {
                    async function test () {
                        var n1 = await Model(url+"/root/n1");
                        expect(n1.value).to.equal(root.n1);

                        var b1 = await Model(url+"/root/b1");
                        expect(b1.value).to.equal(root.b1);

                        var d1 = await Model(url+"/root/d1");
                        expect(d1.value).to.deep.equal(root.d1);

                        var l1 = await Model(url+"/root/l1");
                        expect(l1.value).to.deep.equal(root.l1);

                        var t1 = await Model(url+"/root/t1");
                        expect(t1.value).to.equal(root.t1);
                    }
                    test().then(done);
                });

                it("should return null it the document path doesn't exist", (done) => {
                    async function test () {
                        var nn = await Model(url+"/root/non-existing-key");
                        expect(nn.value).to.be.null;                
                    }
                    test().then(done);
                });

                it("should return a deep copy of the document item", (done) => {
                    async function test () {
                        var d1 = await Model(url+"/root/d1");
                        expect(d1.value.n2).to.equal(2);
                        d1.value.n2 = 20;
                        expect(d1.value.n2).to.equal(2);
                    }
                    test().then(done);
                });
            });


            describe("Model.Item.prototype.getSubModel(url)", () => {
                var rootModel;

                before((done) => {
                    async function init () {
                        doc.set('root', utils.clone(root));
                        rootModel = await Model(url+"/root");
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(rootModel.getSubModel).to.be.a("function");
                });

                it("should return a sub model given a relative path", (done) => {
                    async function test () {
                        expect(rootModel.getSubModel("./a/b")).to.equal(await Model(url+"/root/a/b"));
                        expect(rootModel.getSubModel("a/././b")).to.equal(await Model(url+"/root/a/b"));
                        expect(rootModel.getSubModel("../a")).to.equal(await Model(url+"/a"));
                        expect(rootModel.getSubModel("a/../b/../c")).to.equal(await Model(url+"/root/c"));
                        expect(rootModel.getSubModel("a/../b/././../c")).to.equal(await Model(url+"/root/c"));
                        expect(rootModel.getSubModel("/a/b/c")).to.equal(await Model(url+"/a/b/c"));
                        expect(rootModel.getSubModel("../../../../..")).to.be.null;
                    }
                    test().then(done);
                });
            });


            describe("Model.Item.prototype.parent - getter", () => {

                before(() => {
                    doc.set('root', utils.clone(root));
                });

                it("should return the parent model", (done) => {
                    async function test () {
                        var d1 = await Model(url+"/root/d1");
                        var n2 = await Model(url+"/root/d1/n2");
                        expect(n2.parent).to.equal(d1);

                        var l1 = await Model(url+"/root/l1");
                        var l1_i0 = await Model(url+"/root/l1/0");
                        expect(l1_i0.parent).to.equal(l1);                
                    }
                    test().then(done);
                });
            });


            describe("Model.Dict.prototype.keys - getter", () => {

                before(() => {
                    doc.set('root', utils.clone(root));
                });

                it("should return an array with the dictionary keys", (done) => {
                    async function test () {
                        var rootModel = await Model(url+"/root");
                        var keys = rootModel.keys;
                        expect(keys.sort()).to.deep.equal(['b1', 'd1', 'l1', 'n1', 't1']);
                    }
                    test().then(done);
                });
            });


            describe("Model.Dict.prototype.get(key)", () => {
                var d1;

                before((done) => {
                    async function init () {
                        doc.set('root', utils.clone(root));
                        d1 = await Model(url+"/root/d1");
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(d1.get).to.be.a("function");
                });

                it("should return the sub-model mapped to the passed key", (done) => {
                    async function test () {
                        expect(d1.get('b1')).to.equal(await Model(url+"/root/d1/b1"));
                        expect(d1.get('d1')).to.equal(await Model(url+"/root/d1/d1"));
                        expect(d1.get('l1')).to.equal(await Model(url+"/root/d1/l1"));
                        expect(d1.get('n1')).to.equal(await Model(url+"/root/d1/n1"));
                        expect(d1.get('t1')).to.equal(await Model(url+"/root/d1/t1"));
                        expect(d1.get('nn')).to.equal(await Model(url+"/root/d1/nn"));
                    }
                    test().then(done);
                });
            });


            describe("Model.Dict.prototype.set(key, value)", () => {
                var d1;

                before((done) => {
                    async function init () {
                        doc.set('root', utils.clone(root));
                        d1 = await Model(url+"/root/d1");                    
                    }
                    init().then(done).catch(done);
                });

                it("should be a function", () => {
                    expect(d1.set).to.be.a("function");
                });

                it("should map the key to the passed value", () => {
                    d1.set('x', 10);
                    expect(d1.get('x').value).to.equal(10);

                    d1.set('d', {y:20})
                    expect(d1.get('d').value).to.deep.equal({y:20});

                    d1.set('l', [1,2,3])
                    expect(d1.get('l').value).to.deep.equal([1,2,3]);

                    d1.set('t', "abc")
                    expect(d1.get('t').value).to.equal("abc");

                    d1.set('b', true)
                    expect(d1.get('b').value).to.be.true;
                });

                it("should convert the key to a string", () => {
                    var key = {toString: () => 'keyStr'};
                    d1.set(key, 'kk');
                    expect(d1.get('keyStr').value).to.equal('kk');
                });

                it("should assign a deep copy of the value", () => {
                    var value = {z:20};
                    d1.set('d', value);
                    value.z = 21;
                    expect(d1.get('d').get('z').value).to.equal(20);
                });

                it("should throw an exception if trying to assign a non-valid value", () => {
                    expect(() => {d1.set('f', ()=>{})}).to.throw(Error);
                    expect(() => {d1.set('u', undefined)}).to.throw(Error);
                    expect(() => {d1.set('n', null)}).to.throw(Error);
                });
            });


            describe("Model.Dict.prototype.remove(key)", () => {
                var d1;

                before((done) => {
                    async function init () {
                        doc.set('root', utils.clone(root));
                        d1 = await Model(url+"/root/d1");
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(d1.remove).to.be.a("function");
                });

                it("should remove the key from the dictionary", () => {
                    d1.set('x', 10);
                    d1.remove('x');
                    expect(d1.get('x').value).to.be.null;

                    d1.remove('non-existing-key');
                    expect(d1.get('non-existing-key').value).to.be.null;
                });

                it("should convert the key to a string", () => {
                    var key = {toString: () => 'keyStr'};
                    d1.set(key, 'kk');
                    expect(d1.get('keyStr').value).to.equal('kk');
                    d1.remove(key);
                    expect(d1.get('keyStr').value).to.be.null;
                });
            });


            describe("Model.List.prototype.size - getter", () => {
                var docModel;

                before((done) => {
                    async function init () {
                        doc.set('root', utils.clone(root));
                        docModel = await Model(url);                    
                    }
                    init().then(done);
                });

                it("should return the number of items in the array", () => {
                    docModel.set('list', [1,2,3]);
                    expect(docModel.getSubModel('list').size).to.equal(3);

                    docModel.set('list', []);
                    expect(docModel.getSubModel('list').size).to.equal(0);

                    docModel.set('list', [1,2,3,4,5]);
                    expect(docModel.getSubModel('list').size).to.equal(5);
                });
            });


            describe("Model.List.prototype.get(index)", () => {
                var rootModel, l1;

                before((done) => {
                    async function init (done) {
                        doc.set('root', utils.clone(root));
                        rootModel = await Model(url+"/root");
                        l1 = rootModel.getSubModel('l1');
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(l1.get).to.be.a("function");
                });

                it("should return the sub-model mapped to the passed index", (done) => {
                    async function test () {
                        expect(l1.get(0)).to.equal(await Model(url+"/root/l1/0"));
                        expect(l1.get(1)).to.equal(await Model(url+"/root/l1/1"));
                        expect(l1.get(2)).to.equal(await Model(url+"/root/l1/2"));                    
                    }
                    test().then(done);
                });

                it("should consider a negative index as relative to the end of the list", () => {
                    doc.set('root', {l1: ['a','b','c']});
                    expect(l1.get(-1).value).to.equal('c');
                    expect(l1.get(-2).value).to.equal('b');
                    expect(l1.get(-3).value).to.equal('a');
                });

                it("should throw an exception if index is not an integer", () => {
                    expect(() => l1.get('key')).to.throw(Error);
                });

                it("should throw an exception if index is out of range", () => {
                    expect(() => l1.get(100)).to.throw(Error);
                    expect(() => l1.get(-100)).to.throw(Error);
                });
            });


            describe("Model.List.prototype.set(index, item)", () => {
                var l1;

                before((done) => {
                    async function init () {
                        doc.set('root', utils.clone(root));
                        l1 = await Model(url+"/root/l1");
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(l1.get).to.be.a("function");
                });

                it("should map the list index to the passed item", () => {
                    l1.set(1, 10);
                    expect(l1.get(1).value).to.equal(10);

                    l1.set(1, {y:20});
                    expect(l1.get(1).value).to.deep.equal({y:20});

                    l1.set(1, [1,2,3]);
                    expect(l1.get(1).value).to.deep.equal([1,2,3]);

                    l1.set(1, "abc");
                    expect(l1.get(1).value).to.equal("abc");

                    l1.set(1, true);
                    expect(l1.get(1).value).to.be.true;

                    l1.set('1', false);
                    expect(l1.get(1).value).to.be.false;
                });

                it("should consider a negative index as relative to the end of the list", () => {
                    doc.set('root', {'l1': ['a','b','c']});

                    l1.set(-1, 'cc');
                    expect(l1.value).to.deep.equal(['a','b','cc']);

                    l1.set(-2, 'bb');
                    expect(l1.value).to.deep.equal(['a','bb','cc']);

                    l1.set(-3, 'aa');
                    expect(l1.value).to.deep.equal(['aa','bb','cc']);
                });

                it("should assign a deep copy of the value", () => {
                    var value = {z:20};
                    l1.set(1, value);
                    value.z = 21;
                    expect(l1.get(1).get('z').value).to.equal(20);
                });

                it("should throw an exception if index is not an integer", () => {
                    expect(() => {l1.set('key', 10)}).to.throw(Error);
                });

                it("should throw an exception if index is out of range", () => {
                    expect(() => {l1.set(100, 10)}).to.throw(Error);
                    expect(() => {l1.set(-100, 10)}).to.throw(Error);
                });

                it("should throw an exception if trying to assign a non-valid value", () => {
                    expect(() => {l1.set(1, ()=>{})}).to.throw(Error);
                    expect(() => {l1.set(1, undefined)}).to.throw(Error);
                    expect(() => {l1.set(1, null)}).to.throw(Error);
                });
            });


            describe("Model.List.prototype.insert(index, ...items)", () => {
                var rm, lm;

                before((done) => {
                    async function init () {
                        doc.set('root', {list: ['a','b','c']});
                        rm = await Model(url+"/root");
                        lm = await Model(url+"/root/list");                    
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(lm.insert).to.be.a("function");
                });

                it("should insert the passed items at the given index", () => {
                    lm.insert(1, 'x', 'y', 'z');
                    expect(lm.value).to.deep.equal(['a','x','y','z','b','c']);

                    lm.insert(6, 'u', 'v', 'w');
                    expect(lm.value).to.deep.equal(['a','x','y','z','b','c','u','v','w']);

                    lm.insert(0, 'r', 's', 't');
                    expect(lm.value).to.deep.equal(['r','s','t','a','x','y','z','b','c','u','v','w']);
                });

                it("should consider a negative index as relative to the end of the list", () => {
                    rm.set('list', ['a','b','c']);
                    lm.insert(-1, 'x', 'y');
                    expect(lm.value).to.deep.equal(['a','b','x','y','c']);
                });

                it("should assign a deep copy of the value", () => {
                    rm.set('list', ['a','b','c']);
                    var value = {z:20};
                    lm.insert(1, value);
                    value.z = 21;
                    expect(lm.get(1).get('z').value).to.equal(20);
                });

                it("should throw an exception if index is not an integer", () => {
                    expect(() => {lm.insert('key', 10)}).to.throw(Error);
                });

                it("should throw an exception if index is out of range", () => {
                    expect(() => {lm.insert(100, 10)}).to.throw(Error);
                    expect(() => {lm.insert(-100, 10)}).to.throw(Error);
                });

                it("should throw an exception if trying to assign a non-valid value", () => {
                    rm.set('list', ['a','b','c']);
                    expect(() => {lm.insert(1, 10, 20, ()=>{})}).to.throw(Error);
                    expect(() => {lm.insert(1, 10, 20, undefined)}).to.throw(Error);
                    expect(() => {lm.insert(1, 10, 20, null)}).to.throw(Error);
                    expect(lm.value).to.deep.equal(['a','b','c']);
                });
            });


            describe("Model.List.prototype.append(...items)", () => {
                var rm, lm;

                before((done) => {
                    async function init () {
                        doc.set('root', {list: ['a','b','c']});
                        rm = await Model(url+"/root");
                        lm = await Model(url+"/root/list");
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(lm.append).to.be.a("function");
                });

                it("should insert the passed items at the end of the list", () => {
                    rm.set('list', ['a','b','c']);
                    lm.append('x', 'y', 'z');
                    expect(lm.value).to.deep.equal(['a','b','c','x','y','z']);
                });
            });


            describe("Model.List.prototype.remove(index, count)", () => {
                var rm, lm;

                before((done) => {
                    async function init () {
                        doc.set('root', {list: ['a','b','c']});
                        rm = await Model(url+"/root");
                        lm = await Model(url+"/root/list");
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(lm.remove).to.be.a("function");
                });

                it("should remove count values starting at index", () => {
                    rm.set('list', ['a','b','c','d','e']);
                    lm.remove(1, 3);
                    expect(lm.value).to.deep.equal(['a','e']);
                });

                it("should remove 1 value if count is not specified", () => {
                    rm.set('list', ['a','b','c']);
                    lm.remove(1);
                    expect(lm.value).to.deep.equal(['a','c']);                
                });

                it("should remove up to the end of the array if count overflows the list size", () => {
                    rm.set('list', ['a','b','c','d','e']);
                    lm.remove(2, 100);
                    expect(lm.value).to.deep.equal(['a','b']);                
                });

                it("should throw an exception if index is not an integer", () => {
                    rm.set('list', ['a','b','c']);
                    expect(() => {lm.remove('key')}).to.throw(Error);
                    expect(lm.value).to.deep.equal(['a','b','c']);                
                });

                it("should throw an exception if index is out of range", () => {
                    rm.set('list', ['a','b','c']);
                    expect(() => {lm.remove(100)}).to.throw(Error);
                    expect(() => {lm.remove(-100)}).to.throw(Error);
                    expect(lm.value).to.deep.equal(['a','b','c']);                
                });            

                it("should throw an exception if count is not an integer", () => {
                    rm.set('list', ['a','b','c']);
                    expect(() => {lm.remove(1, 'count')}).to.throw(Error);
                    expect(lm.value).to.deep.equal(['a','b','c']);                
                });
            });


            describe("Model.Text.prototype.size - getter", () => {
                var rm, tm;

                before((done) => {
                    async function init () {
                        rm = await Model(url+"/root");
                        tm = await Model(url+"/root/text");
                    }
                    init().then(done);
                });

                it("should return the number of items in the array", () => {
                    rm.set('text', "abc");
                    expect(tm.size).to.equal(3);

                    rm.set('text', "");
                    expect(tm.size).to.equal(0);

                    rm.set('text', "abcdef");
                    expect(tm.size).to.equal(6);
                });
            });


            describe("Model.Text.prototype.insert(index, subString)", () => {
                var rm, tm;

                before((done) => {
                    async function init () {
                        rm = await Model(url+"/root");
                        tm = await Model(url+"/root/text");
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(tm.insert).to.be.a("function");
                });

                it("should insert the passed string at the given index", () => {
                    rm.set('text', "abc")

                    tm.insert(1, "xxx");
                    expect(tm.value).to.equal("axxxbc");

                    tm.insert(6, "yyy");
                    expect(tm.value).to.equal("axxxbcyyy");

                    tm.insert(0, "zzz");
                    expect(tm.value).to.equal("zzzaxxxbcyyy");
                });

                it("should consider a negative index as relative to the end of the text", () => {
                    rm.set('text', "abc")
                    tm.insert(-1, 'xxx');
                    expect(tm.value).to.equal("abxxxc");
                });

                it("should throw an exception if index is not an integer", () => {
                    expect(() => {tm.insert('key', "xxx")}).to.throw(Error);
                });

                it("should throw an exception if index is out of range", () => {
                    rm.set('text', "abc")
                    expect(() => {tm.insert(100, "xxx")}).to.throw(Error);
                    expect(() => {tm.insert(-100, "xxx")}).to.throw(Error);
                    expect(tm.value).to.equal("abc");
                });

                it("should convert subString to a string", () => {
                    rm.set('text', "abc")
                    var subString = {toString: () => "xxx"};
                    tm.insert(1, subString)
                    expect(tm.value).to.equal("axxxbc");
                });
            });


            describe("Model.Text.prototype.append(subString)", () => {
                var rm, tm;

                before((done) => {
                    async function init () {
                        rm = await Model(url+"/root");
                        tm = await Model(url+"/root/text");
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(tm.append).to.be.a("function");
                });

                it("should insert the passed string at the end of the text", () => {
                    rm.set('text', "abc")
                    tm.append("xxx");
                    expect(tm.value).to.equal("abcxxx");
                });
            });


            describe("Model.Text.prototype.remove(index, count)", () => {
                var rm, tm;

                before((done) => {
                    async function init () {
                        rm = await Model(url+"/root");
                        tm = await Model(url+"/root/text");
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(tm.remove).to.be.a("function");
                });

                it("should remove count characters starting at index", () => {
                    rm.set('text', "abcdef");
                    tm.remove(1, 3);
                    expect(tm.value).to.equal("aef");
                });

                it("should remove 1 character if count is not specified", () => {
                    rm.set('text', "abcdef");
                    tm.remove(1);
                    expect(tm.value).to.equal("acdef");
                });

                it("should remove up to the end of the array if count overflows the text size", () => {
                    rm.set('text', "abcdef");
                    tm.remove(2, 100);
                    expect(tm.value).to.equal("ab");
                });

                it("should throw an exception if index is not an integer", () => {
                    rm.set('text', "abcdef");
                    expect(() => {tm.remove('key')}).to.throw(Error);
                    expect(tm.value).to.equal("abcdef");
                });

                it("should throw an exception if index is out of range", () => {
                    rm.set('text', "abcdef");
                    expect(() => {tm.remove(100)}).to.throw(Error);
                    expect(() => {tm.remove(-100)}).to.throw(Error);
                    expect(tm.value).to.equal("abcdef");
                });            

                it("should throw an exception if count is not an integer", () => {
                    rm.set('text', "abcdef");
                    expect(() => {tm.remove(1, 'count')}).to.throw(Error);
                    expect(tm.value).to.equal("abcdef");
                });
            });


            describe("Model.Item.prototype.value - setter", () => {
                var item;

                before((done) => {
                    async function init () {
                        doc.set('root', {item:10, d:{}});
                        item = await Model(url+"/root/item");
                    }
                    init().then(done);
                });

                it("should change the item value", () => {
                    item.value = 11;
                    expect(item.value).to.equal(11);

                    item.value = "abc";
                    expect(item.value).to.equal("abc");
                    expect(item).to.be.instanceof(Model.Text);

                    item.value = {x:10};
                    expect(item.value).to.deep.equal({x:10});
                    expect(item).to.be.instanceof(Model.Dict);

                    item.value = [1,2,3];
                    expect(item.value).to.deep.equal([1,2,3]);
                    expect(item).to.be.instanceof(Model.List);
                });

                it("should assign a deep copy of the value", () => {
                    var value = {z:20};
                    item.value = value;
                    value.z = 21;
                    expect(item.get('z').value).to.equal(20);
                });

                it("should throw an exception if trying to assign a non-valid value", () => {
                    expect(() => {item.value = ()=>{}}).to.throw(Error);
                    expect(() => {item.value = undefined}).to.throw(Error);
                    expect(() => {item.value = null}).to.throw(Error);
                });
            });


            describe("Model.Item.prototype.subscribe", () => {
                var dm, subscription, lastChange;

                before((done) => {
                    async function init () {
                        dm = await Model(url);
                        dm.set('root', root);
                        d1 = dm.get('root').get('d1');
                        subscription = d1.subscribe((change) => lastChange = change);
                    }
                    init().then(done);
                });

                it("should be a function", () => {
                    expect(d1.subscribe).to.be.a("function");
                });

                it("should call the callback every time the model changes", () => {
                    lastChange = null;
                    d1.get('d2').set('n3', 30);
                    expect(lastChange.type).to.equal('dict');
                    expect(lastChange.path).to.deep.equal(['d2','n3']);
                    expect(lastChange.removed).to.equal(3);
                    expect(lastChange.inserted).to.equal(30);
                });

                it("should stop notifying changes after cancelling the subscription", () => {
                    lastChange = null;
                    d1.get('d2').set('n3', 40);
                    expect(lastChange.path).to.deep.equal(['d2','n3']);

                    lastChange = null;
                    subscription.cancel();
                    d1.get('d2').set('n3', 400);
                    expect(lastChange).to.be.null;
                });
            });
        });
    }

    return describeModel;
});


