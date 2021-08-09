const expect = require("chai").expect;
const document = require('../lib/document');
const Store = require('../lib/store');
const MemoryStore = require('../lib/memory-store');
const Library = require('../lib/library');


describe("Library", () => {
    
    describe('Library.create', () => {
        
        it("should return an instance of Library", async () => {
            const rootStore = new MemoryStore({
                '/path/to/doc': "doc @ /path/to/doc"
            });
            const library = Library.create(rootStore);
            expect(library).to.be.instanceof(Library);
            expect(await library.store.read('/path/to/doc')).to.equal("doc @ /path/to/doc");
        });
    });

    describe('Library.parseId', () => {
        
        it("should return an object", () => {
            expect(Library.parseId('ppp:/path/to/doc?x=10')).to.be.an("object");
        });
        
        it("should contain a 'scheme' property holding the uri scheme of the docId", () => {
            
            // valid scheme
            expect(Library.parseId('ppp:/path/to/doc').scheme).to.equal('ppp');
            expect(Library.parseId('qqq://path/to/doc').scheme).to.equal('qqq');
            expect(Library.parseId('rrr:///path/to/doc').scheme).to.equal('rrr');

            // default scheme
            expect(Library.parseId('default://path/to/doc').scheme).to.equal('default');
            expect(Library.parseId('/path/to/doc').scheme).to.equal('default');

            // non valid scheme considered as path segment (with default protocol)
            expect(Library.parseId('123://path/to/doc').scheme).to.equal('default');
        });

        it("should contain a 'path' property holding the uri path of the docId", () => {

            // valid scheme
            expect(Library.parseId('ppp:/path/to/doc').path).to.equal('/path/to/doc');
            expect(Library.parseId('qqq://path/to/doc').path).to.equal('/path/to/doc');
            expect(Library.parseId('rrr:///path/to/doc').path).to.equal('/path/to/doc');
            expect(Library.parseId('rrr:/path/to/../doc').path).to.equal('/path/doc');

            // default scheme
            expect(Library.parseId('default://path/to/doc').path).to.equal('/path/to/doc');
            expect(Library.parseId('/path/to/doc').path).to.equal('/path/to/doc');
            expect(Library.parseId('path/to/../doc').path).to.equal('/path/doc');

            // non valid scheme considered as path segment (with default protocol)
            expect(Library.parseId('123://path/to/doc').path).to.equal('/123:/path/to/doc');
        });
        
        it("should contain a 'query' property holding the uri query property of the docId", () => {
            
            // docId with query string
            expect(Library.parseId('/path/to/doc?x=10;s=abc&b;z=1.2').query).to.deep.equal({x:10, s:"abc", b:true, z:1.2});
            
            // docId without query string
            expect(Library.parseId('/path/to/doc').query).to.deep.equal({});
            expect(Library.parseId('/path/to/doc?').query).to.deep.equal({});
            expect(Library.parseId('/path/to/doc?  ').query).to.deep.equal({});
        });  
    });

    describe('Library.stringifyId', () => {
        
        it("should return the docId string defined by the passed docIdObj", () => {
            
            // complete id
            expect(Library.stringifyId({
                scheme: 'ppp',
                path: '/path/to/doc',
                query: {x:10, s:"abc", b:true}
            })).to.equal("ppp://path/to/doc?x=10&s=abc&b=true");

            // missing scheme
            expect(Library.stringifyId({
                path: '/path/to/doc',
                query: {x:10, s:"abc", b:true}
            })).to.equal("/path/to/doc?x=10&s=abc&b=true");

            // default scheme
            expect(Library.stringifyId({
                scheme: 'default',
                path: '/path/to/doc',
                query: {x:10, s:"abc", b:true}
            })).to.equal("/path/to/doc?x=10&s=abc&b=true");

            // missing path
            expect(Library.stringifyId({
                scheme: 'ppp',
                query: {x:10, s:"abc", b:true}
            })).to.equal("ppp://?x=10&s=abc&b=true");

            // missing query
            expect(Library.stringifyId({
                scheme: 'ppp',
                path: '/path/to/doc',
            })).to.equal("ppp://path/to/doc");
        });
    });
    
    describe('Library.resolveId(docId, baseId)', () => {
        
        it("should return the normalized docId it is alread an absolute id", () => {
            
            expect(Library.resolveId("ppp:/path/to/my/../doc?x=10;b;s=abc", '/'))
                    .to.equal("ppp://path/to/doc?x=10&b=true&s=abc");

            expect(Library.resolveId("default:/path/to/my/../doc?x=10;b;s=abc", '/'))
                    .to.equal("/path/to/doc?x=10&b=true&s=abc");
        });
        
        it("should return the normalized docId no baseId is provided", () => {
            
            expect(Library.resolveId("ppp:/path/to/my/../doc?x=10;b;s=abc"))
                    .to.equal("ppp://path/to/doc?x=10&b=true&s=abc");

            expect(Library.resolveId("default:/path/to/my/../doc?x=10;b;s=abc"))
                    .to.equal("/path/to/doc?x=10&b=true&s=abc");            

            expect(Library.resolveId("path/to/my/../doc?x=10;b;s=abc"))
                    .to.equal("/path/to/doc?x=10&b=true&s=abc");            
        });
        
        describe("when docId is a relative id and a baseId is provided", () => {
            
            it("should assign to docId the same scheme of baseId", () => {
                
                expect(Library.resolveId("/path/to/doc", "ppp://host"))
                        .to.equal("ppp://path/to/doc");
                
                expect(Library.resolveId("/path/to/doc", "/host"))
                        .to.equal("/path/to/doc");
            });
            
            it("should resolve the docId path as relative to the baseId path", () => {

                // path starting with '..'
                expect(Library.resolveId("../path/to/doc", "/host/home/dir/"))
                        .to.equal("/host/home/path/to/doc");
                expect(Library.resolveId("../path/to/doc", "/host/home/doc"))
                        .to.equal("/host/path/to/doc");

                // path starting with '.'
                expect(Library.resolveId("./path/to/doc", "/host/home/dir/"))
                        .to.equal("/host/home/dir/path/to/doc");

                expect(Library.resolveId("./path/to/doc", "/host/home/doc"))
                        .to.equal("/host/home/path/to/doc");

                // path starting with '/'
                expect(Library.resolveId("/path/to/doc", "/host/home/dir/"))
                        .to.equal("/path/to/doc");

                expect(Library.resolveId("/path/to/doc", "/host/home/doc"))
                        .to.equal("/path/to/doc");
                        
                // path starting neither with '..' nor '.' nor '/'
                expect(Library.resolveId("path/to/doc", "/host/home/dir/"))
                        .to.equal("/host/home/dir/path/to/doc");

                expect(Library.resolveId("path/to/doc", "/host/home/doc"))
                        .to.equal("/host/home/path/to/doc");
            });
            
            it("should keep docId query unchanged", () => {
                
                expect(Library.resolveId("../path/to/doc?x=10", "/host/home/dir/?y=20"))
                        .to.equal("/host/home/path/to/doc?x=10");

                expect(Library.resolveId("../path/to/doc", "/host/home/dir/?y=20"))
                        .to.equal("/host/home/path/to/doc");

                expect(Library.resolveId("../path/to/doc?x=10", "/host/home/dir/"))
                        .to.equal("/host/home/path/to/doc?x=10");
            });
        })
    });

    describe('Library.parseDocument', () => {
        
        it("should delegate to document.parse", () => {
            const document_parse = document.parse;
            
            var parsed_source = "";
            document.parse = (source) => {
                parsed_source = source;
                return document_parse(source);
            }
            const evaluate = Library.parseDocument("Hello World!");
            expect(parsed_source).to.equal("Hello World!");
            
            document.parse = document_parse;
        });
    });
    
    describe("Library instance", () => {
        
        describe("library.read (docId)", () => {
            
            it("should return a promise", () => {
                var library = new Library();
                expect(library.read('doc')).to.be.instanceof(Promise);
            });
            
            it("should resolve the source of the document mapped to docId", async () => {
                
                var library = new Library( new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2"
                }) );
                
                Library.protocols.set('ppp', new MemoryStore({
                    '/path/to/doc1': "doc @ ppp://path/to/doc1",
                    '/path/to/doc2': "doc @ ppp://path/to/doc2"
                }));
                
                // read document from root store
                expect(await library.read('/path/to/doc1')).to.equal("doc @ /path/to/doc1");
                
                // read document from protocol store
                expect(await library.read('ppp:/path/to/doc1')).to.equal("doc @ ppp://path/to/doc1");

                // read document from default protocol
                expect(await library.read('default://path/to/doc2')).to.equal("doc @ /path/to/doc2");
                
                Library.protocols.delete('ppp');
            });
            
            it("should return an empty string if no match is found", async () => {
                var library = new Library( new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2"
                }) );
                
                Library.protocols.set('ppp', new MemoryStore({
                    '/path/to/doc1': "doc @ ppp://path/to/doc1",
                    '/path/to/doc2': "doc @ ppp://path/to/doc2"
                }));

                // read document from root store
                expect(await library.read('/path/to/doc3')).to.equal("");
                
                // read document from protocol store
                expect(await library.read('ppp:/path/to/doc4')).to.equal("");

                // read document from default protocol
                expect(await library.read('default://path/to/doc5')).to.equal("");

                Library.protocols.delete('ppp');
            });

            it("should ignore the query string part of the docId", async () => {
                var library = new Library( new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2"
                }) );
                
                expect(await library.read('/path/to/doc1?x=10;y=20&z=30')).to.equal("doc @ /path/to/doc1");            
            });
            
            it("should throw an error on undefined docId schemes", async () => {
                const library = new Library();
                
                try {
                    await library.read("ppp:/path/to/doc1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error.message).to.equal("Unknown protocol: 'ppp'");
                }
            });   
            
            it("should acceptd docId objects", async () => {
                var library = new Library( new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2"
                }) );
                                
                const docIdObj = Library.parseId('/path/to/doc1');
                expect(await library.read(docIdObj)).to.equal("doc @ /path/to/doc1");                
            });
        });

        describe("library.list (dirId)", () => {
            
            it("should return a promise", () => {
                var library = new Library();
                expect(library.list('dir')).to.be.instanceof(Promise);
            });
            
            it("should resolve the list of the item contained under the gien directory-id", async () => {
                
                var library = new Library( new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2",
                    '/path/to/dir/doc3': "doc @ /path/to/dir/doc3"
                }) );
                
                Library.protocols.set('ppp', new MemoryStore({
                    '/path/to/doc4': "doc @ ppp://path/to/doc4",
                    '/path/to/doc5': "doc @ ppp://path/to/doc5",
                    '/path/to/dir/doc6': "doc @ ppp://path/to/dir/doc6"
                }));
                
                // list directory of root store
                expect(await library.list('/path/to')).to.deep.equal(['doc1', 'doc2', 'dir/']);
                
                // list directory of protocol store
                expect(await library.list('ppp:/path/to')).to.deep.equal(['doc4', 'doc5', 'dir/']);
                
                // list directory of default protocol
                expect(await library.list('default://path/to/')).to.deep.equal(['doc1', 'doc2', 'dir/']);
                
                Library.protocols.delete('ppp');
            });
            
            it("should return an empty array if no match is found", async () => {
                var library = new Library( new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2"
                }) );
                
                Library.protocols.set('ppp', new MemoryStore({
                    '/path/to/doc4': "doc @ ppp://path/to/doc4",
                    '/path/to/doc5': "doc @ ppp://path/to/doc5"
                }));

                // list directory of root store
                expect(await library.list('/path/to/dir')).to.deep.equal([]);

                // list directory of protocol store
                expect(await library.list('ppp:/path/to/dir')).to.deep.equal([]);
                
                // list directory of default protocol
                expect(await library.list('default://path/to/dir')).to.deep.equal([]);

                Library.protocols.delete('ppp');
            });

            it("should ignore the query string part of the docId", async () => {
                var library = new Library( new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2",
                    '/path/to/dir/doc3': "doc @ /path/to/dir/doc3"
                }) );
                
                // list directory of root store
                expect(await library.list('/path/to?x=10;y=20;z=30')).to.deep.equal(['doc1', 'doc2', 'dir/']);
            });

            it("should throw an error on undefined docId schemes", async () => {
                const library = new Library();
                
                try {
                    await library.list("ppp:/path/to/doc1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error.message).to.equal("Unknown protocol: 'ppp'");
                }
            });
            
            it("should acceptd dirId objects", async () => {
                var library = new Library( new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2",
                    '/path/to/dir/doc3': "doc @ /path/to/dir/doc3"
                }) );

                const dirIdObj = Library.parseId('/path/to');
                expect(await library.list(dirIdObj)).to.deep.equal(['doc1', 'doc2', 'dir/']);
            });            
        });

        describe("library.write (docId, source)", () => {
            
            it("should return a promise", () => {
                var library = new Library();
                expect(library.write('doc', 'content')).to.be.instanceof(Promise);
            });
            
            it("should map the passed source to the passed docId", async () => {
                const rootStore = new MemoryStore();
                const protStore = new MemoryStore();
                
                var library = new Library(rootStore);
                Library.protocols.set('ppp', protStore);
                
                // write document to root store
                await library.write('/path/to/doc1', "doc @ /path/to/doc1")
                expect(await rootStore.read('/path/to/doc1')).to.equal("doc @ /path/to/doc1");
                
                // write document to protocol store
                await library.write('ppp:/path/to/doc2', "doc @ ppp://path/to/doc2")
                expect(await protStore.read('/path/to/doc2')).to.equal("doc @ ppp://path/to/doc2");

                // write document to default protocol
                await library.write('default:/path/to/doc3', "doc @ /path/to/doc3")
                expect(await rootStore.read('/path/to/doc3')).to.equal("doc @ /path/to/doc3");
                
                Library.protocols.delete('ppp');
            });
            
            it("should ignore the query string part of the docId", async () => {
                const rootStore = new MemoryStore();            
                const library = new Library(rootStore);
                
                // write document to root store
                await library.write('/path/to/doc1?x=10;y=20;z=30', "doc @ /path/to/doc1")
                expect(await rootStore.read('/path/to/doc1')).to.equal("doc @ /path/to/doc1");
            });

            it("should throw an error on undefined docId schemes", async () => {
                const library = new Library();
                
                try {
                    await library.write("ppp:/path/to/doc1", "source of doc 1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error.message).to.equal("Unknown protocol: 'ppp'");
                }
            });
            
            it("should acceptd docId objects", async () => {
                const rootStore = new MemoryStore();                
                const library = new Library(rootStore);
                
                const docIdObj = Library.parseId('/path/to/doc1');
                await library.write(docIdObj, "doc @ /path/to/doc1")
                expect(await rootStore.read('/path/to/doc1')).to.equal("doc @ /path/to/doc1");
            });                        
        });

        describe("library.delete (docId)", () => {
            
            it("should return a promise", () => {
                var library = new Library();
                expect(library.delete('doc')).to.be.instanceof(Promise);
            });
            
            it("should remove the document mapping to the passed docId", async () => {
                const rootStore = new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2",
                    '/path/to/doc3': "doc @ /path/to/doc3"
                });
                const protStore = new MemoryStore({
                    '/path/to/doc1': "doc @ ppp://path/to/doc1",
                    '/path/to/doc2': "doc @ ppp://path/to/doc2"
                });
                
                var library = new Library(rootStore);
                Library.protocols.set('ppp', protStore);
                
                // delete document from root store
                await library.delete('/path/to/doc1')
                expect(await rootStore.read('/path/to/doc1')).to.equal("");
                
                // delete document from protocol store
                await library.delete('ppp:/path/to/doc2')
                expect(await protStore.read('/path/to/doc2')).to.equal("");

                // delete document from default protocol store
                await library.delete('default:/path/to/doc3')
                expect(await rootStore.read('/path/to/doc3')).to.equal("");
                
                Library.protocols.delete('ppp');
            });
            
            it("should resolve silently if the document does not exist already", async () => {
                const rootStore = new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2",
                });
                const protStore = new MemoryStore({
                    '/path/to/doc1': "doc @ ppp://path/to/doc1",
                    '/path/to/doc2': "doc @ ppp://path/to/doc2"
                });
                
                var library = new Library(rootStore);
                Library.protocols.set('ppp', protStore);
                
                // delete document from root store
                await library.delete('/path/to/doc3')
                expect(await rootStore.read('/path/to/doc3')).to.equal("");
                
                // delete document from protocol store
                await library.delete('ppp:/path/to/doc4')
                expect(await protStore.read('/path/to/doc4')).to.equal("");

                // delete document from default protocol store
                await library.delete('default:/path/to/doc5')
                expect(await rootStore.read('/path/to/doc5')).to.equal("");
                
                Library.protocols.delete('ppp');            
            });
            
            it("should ignore the query string part of the docId", async () => {
                const rootStore = new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2",
                });            
                const library = new Library(rootStore);
                
                // delete document from root store
                await library.delete('/path/to/doc1?x=10;y=20;z=30')
                expect(await rootStore.read('/path/to/doc1')).to.equal("");
            });

            it("should throw an error on undefined docId schemes", async () => {
                const library = new Library();
                
                try {
                    await library.delete("ppp:/path/to/doc1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error.message).to.equal("Unknown protocol: 'ppp'");
                }
            });

            it("should acceptd docId objects", async () => {
                const rootStore = new MemoryStore({
                    '/path/to/doc1': "doc @ /path/to/doc1",
                    '/path/to/doc2': "doc @ /path/to/doc2",
                    '/path/to/doc3': "doc @ /path/to/doc3"
                });
                const library = new Library(rootStore);
                
                const docIdObj = Library.parseId('/path/to/doc1');
                await library.delete(docIdObj)
                expect(await rootStore.read('/path/to/doc1')).to.equal("");
            });                        
        });
        
        describe("library.deleteAll (dirId)", () => {

            it("should return a promise", () => {
                var library = new Library();
                expect(library.deleteAll('dir')).to.be.instanceof(Promise);
            });
            
            it("should remove all the document whose id starts with dirId", async () => {
                
                const library = new Library( new MemoryStore({
                    '/path/to/doc1': "...",
                    '/path/to/doc2': "...",
                    '/path/to/dir/doc3': "...",
                    '/path/dir1/doc4': "...",
                    '/path/doc5': "...",
                }) );
                
                Library.protocols.set('ppp', new MemoryStore({
                    '/path/to/doc6': "...",
                    '/path/to/doc7': "...",
                    '/path/to/dir/doc8': "...",
                    '/path/to/dir/doc9': "...",
                }));
                
                // delete directory of root store
                await library.deleteAll('/path/to');
                expect(await library.read('/path/to/doc1')).to.equal("");
                expect(await library.read('/path/to/doc2')).to.equal("");
                expect(await library.read('/path/to/dir/doc3')).to.equal("");
                expect(await library.list('/path')).to.deep.equal(['dir1/', 'doc5']);
                
                // list directory of protocol store
                await library.deleteAll('ppp:/path/to/dir');
                expect(await library.read('ppp:/path/to/dir/doc8')).to.equal("");
                expect(await library.read('ppp:/path/to/dir/doc9')).to.equal("");
                expect(await library.list('ppp:/path/to')).to.deep.equal(['doc6', 'doc7']);
                
                Library.protocols.delete('ppp');
            });
            
            it("should return silently if no match is found", async () => {
                const library = new Library();                
                await library.deleteAll('/path/to');
                
                expect(await library.read('/path/to/doc1')).to.equal("");
                expect(await library.read('/path/to/doc2')).to.equal("");
                expect(await library.read('/path/to/dir/doc3')).to.equal("");
                expect(await library.list('/path/to')).to.deep.equal([]);
            });

            it("should ignore the query string part of the docId", async () => {                

                const library = new Library( new MemoryStore({
                    '/path/to/doc1': "...",
                    '/path/to/doc2': "...",
                    '/path/to/dir/doc3': "...",
                    '/path/dir1/doc4': "...",
                    '/path/doc5': "...",
                }) );
                
                await library.deleteAll('/path/to?x=10');
                expect(await library.read('/path/to/doc1')).to.equal("");
                expect(await library.read('/path/to/doc2')).to.equal("");
                expect(await library.read('/path/to/dir/doc3')).to.equal("");
                expect(await library.list('/path')).to.deep.equal(['dir1/', 'doc5']);
            });

            it("should throw an error on undefined docId schemes", async () => {
                const library = new Library();
                
                try {
                    await library.deleteAll("ppp:/path/to/doc1");
                    throw new Error("Id didn't throw");
                } catch (error) {
                    expect(error.message).to.equal("Unknown protocol: 'ppp'");
                }
            });
            
            it("should acceptd dirId objects", async () => {
                
                const library = new Library( new MemoryStore({
                    '/path/to/doc1': "...",
                    '/path/to/doc2': "...",
                    '/path/to/dir/doc3': "...",
                    '/path/dir1/doc4': "...",
                    '/path/doc5': "...",
                }) );

                const dirIdObj = Library.parseId('/path/to');
                await library.deleteAll(dirIdObj);
                expect(await library.read('/path/to/doc1')).to.equal("");
                expect(await library.read('/path/to/doc2')).to.equal("");
                expect(await library.read('/path/to/dir/doc3')).to.equal("");
                expect(await library.list('/path')).to.deep.equal(['dir1/', 'doc5']);
            });            
        });

        describe("library.mount (path, store)", () => {
            
            it("should map an esternal store to a path of the root store", async () => {
                const library = new Library();
                
                library.mount('/path/to/store', new MemoryStore({
                    'doc1': "doc @ /path/to/store/doc1",
                    'doc2': "doc @ /path/to/store.doc2"
                }));
                
                expect(await library.read('/path/to/store/doc1')).to.equal("doc @ /path/to/store/doc1");
            });
        });

        describe("library.unmount (path)", () => {
            
            it("should unmap an esternal store from a path of the root store", async () => {
                const library = new Library();
                
                library.mount('/path/to/store', new MemoryStore({
                    'doc1': "doc @ /path/to/store/doc1",
                    'doc2': "doc @ /path/to/store.doc2"
                }));
                library.unmount('path/to/store');
                
                expect(await library.read('/path/to/store/doc1')).to.equal("");
            });
            
            it("should return silently if no store is mounted to the given path", async () => {
                const library = new Library();                
                library.unmount('path/to/store');
                expect(await library.read('/path/to/store/doc1')).to.equal("");
            });            
        });

        describe("context = library.createContext(docId)", () => {
            
            testContext((library, docId) => library.createContext(docId));
        });

        describe("doc = library.load(docId)", () => {
            
            describe("doc.id", () => {
                
                it("should be the docIdObj of the document", async () => {
                    var library = new Library();
                    Library.protocols.set('ppp', new MemoryStore({
                        '/path/to/doc1': "doc @ /path/to/doc1",
                        '/path/to/doc2': "doc @ /path/to/doc2"
                    }))
                    
                    const doc = await library.load('ppp:/path/to/doc1?x=1');
                    expect(doc.id.scheme).to.equal('ppp');
                    expect(doc.id.path).to.equal('/path/to/doc1');
                    expect(doc.id.query).to.deep.equal({x:1});
                    
                    Library.protocols.delete('ppp');
                });

                it("should be serializable using String", async () => {
                    var library = new Library();
                    Library.protocols.set('ppp', new MemoryStore({
                        '/path/to/doc1': "doc @ /path/to/doc1",
                        '/path/to/doc2': "doc @ /path/to/doc2"
                    }))
                    
                    const doc = await library.load('ppp:/path/to/doc1?x=1');
                    expect(String(doc.id)).to.equal('ppp://path/to/doc1?x=1');
                    
                    Library.protocols.delete('ppp');
                });
            });

            describe("doc.source", () => {
                
                it("should contain the document source", async () => {
                    var library = new Library(new MemoryStore({
                        '/path/to/doc1': "doc @ /path/to/doc1",
                        '/path/to/doc2': "doc @ /path/to/doc2"
                    }));
                    
                    const doc = await library.load('/path/to/doc1');
                    expect(doc.source).to.equal('doc @ /path/to/doc1');
                });
            });

            describe("doc.context", () => {
                
                testContext(async (library, docId) => (await library.load(docId)).context);
            });

            describe("doc.namespace", () => {
                
                it("should contains the document namespace", async () => {
                    var library = new Library(new MemoryStore({
                        '/path/to/doc1': "x + 1 = <% y:__id__.query.x+1 %>",
                        '/path/to/doc2': "doc @ /path/to/doc2"
                    }));
                    const doc = await library.load('/path/to/doc1?x=10');
                    expect(doc.namespace.y).to.equal(11);
                    expect(await doc.context.str(doc.namespace.__id__)).to.equal("/path/to/doc1?x=10");
                });
                
                it("should contain a '$toString' function that return the swan namespace serialization", async () => {
                    var library = new Library(new MemoryStore({
                        '/path/to/doc1': "x + 1 = <% y:__id__.query.x+1 %>",
                        '/path/to/doc2': "doc @ /path/to/doc2"
                    }));
                    const doc = await library.load('/path/to/doc1?x=10');
                    expect(await doc.namespace.$toString()).to.equal("x + 1 = 11");
                });
            });
        });
    });   
    
    describe("Library bultin http protocols", () => {
        
        it("should map to the entire http and https namespace", async () => {
            
            // fetch the README.md file of this project
            const response = await fetch("https://raw.githubusercontent.com/onlabsorg/olojs/master/README.md");
            const README = await response.text();
            
            // read the README.md file via a Library instance
            const library = new Library();
            expect(await library.read("https://raw.githubusercontent.com/onlabsorg/olojs/master/README.md")).to.equal(README);            
            expect(await library.read("http://raw.githubusercontent.com/onlabsorg/olojs/master/README.md")).to.equal(README);            
        })
    });
});


function testContext (createContext) {

    it("should be a document context", async () => {
        var library = new Library(new MemoryStore({
            '/path/to/doc1': "doc @ /path/to/doc1",
            '/path/to/doc2': "doc @ /path/to/doc2"
        }));
        const context = await createContext(library, '/path/to/doc1');
        
        const documentContextPrototype = Object.getPrototypeOf(document.createContext());
        expect(documentContextPrototype.isPrototypeOf(context)).to.be.true;
    })
    
    it("should contain the document id as '__id__'", async () => {
        var library = new Library();
        Library.protocols.set('ppp', new MemoryStore({
            '/path/to/doc1': "doc @ /path/to/doc1",
            '/path/to/doc2': "doc @ /path/to/doc2"
        }))
        const context = await createContext(library, 'ppp:/path/to/doc1?x=1');
        
        expect(context.__id__.scheme).to.equal('ppp');
        expect(context.__id__.path).to.equal('/path/to/doc1');
        expect(context.__id__.query).to.deep.equal({x:1});
        
        expect(await context.str(context.__id__)).to.equal('ppp://path/to/doc1?x=1');
        
        expect(context.__id__.resolve('../2/doc')).to.equal("ppp://path/2/doc");
        
        Library.protocols.delete('ppp');                    
    });
    
    it("should contain an 'import' function", async () => {
        const library = new Library();
        const context = await createContext(library, '/path/to/doc1?x=1');                
        expect(context.import).to.be.a("function");
    });

    describe("doc.context.import", () => {
        
        it("should return the namespace of the passed object", async () => {
            var library = new Library( new MemoryStore({
                '/path/to/doc1': "<% docnum = 1 %>",
                '/path/to/doc2': "<% docnum = 2 %>",
                '/path/to/doc3': "<% docnum = 3 %>"
            }) );
            
            Library.protocols.set('ppp', new MemoryStore({
                '/path/to/doc4': "<% docnum = 4 %>",
                '/path/to/doc5': "<% docnum = 5 %>"
            }));
            
            // import documents from a document loaded from the root store
            const ctx1 = await createContext(library, '/path/to/doc1');
            const doc2_ns = await ctx1.import('/path/to/doc2');
            expect(doc2_ns.docnum).to.equal(2);
            const doc4_ns = await ctx1.import('ppp:/path/to/doc4');
            expect(doc4_ns.docnum).to.equal(4);
            
            // import documents from a document loaded from a protocol store
            const ctx4 = await createContext(library, 'ppp:/path/to/doc4');
            const doc3_ns = await ctx4.import('default:/path/to/doc3');
            expect(doc3_ns.docnum).to.equal(3);
            const doc5_ns = await ctx4.import('ppp:/path/to/doc5');
            expect(doc5_ns.docnum).to.equal(5);
            
            Library.protocols.delete('ppp');                    
        });

        it("should resolve relative ids", async () => {
            var library = new Library( new MemoryStore({
                '/path/to/doc1': "<% docnum = 1 %>",
                '/path/to/doc2': "<% docnum = 2 %>",
            }) );
            
            Library.protocols.set('ppp', new MemoryStore({
                '/path/to/doc3': "<% docnum = 3 %>",
                '/path/to/doc4': "<% docnum = 4 %>",
                '/path/to/doc5': "<% docnum = 5 %>"
            }));
            
            // import documents from a document loaded from the root store
            const ctx1 = await createContext(library, '/path/to/doc1');
            const doc2_ns = await ctx1.import('doc2');
            expect(doc2_ns.docnum).to.equal(2);
            
            // import documents from a document loaded from a protocol store
            const ctx3 = await createContext(library, 'ppp:/path/to/doc3');
            const doc4_ns = await ctx3.import('/path/to/doc4');
            expect(doc4_ns.docnum).to.equal(4);
            const doc5_ns = await ctx3.import('../to/doc5');
            expect(doc5_ns.docnum).to.equal(5);
            
            Library.protocols.delete('ppp');                    
        });

        it("should cache the documents", async () => {
            var count;
            const rootStore =  new MemoryStore();                    
            rootStore.read = path => {
                count += 1;
                return `doc @ ${path}<% x = __id__.query.x %>`;
            }
            var library = new Library(rootStore);

            const ctx = await createContext(library, '/path/to/doc');
            count = 0;

            var ns = await ctx.import("/path/to/doc1");
            expect(count).to.equal(1);

            var ns = await ctx.import("/path/to/doc1");
            expect(count).to.equal(1);

            var ns = await ctx.import("/path/to/doc2?x=10");
            expect(count).to.equal(2);
            expect(ns.x).to.equal(10);

            var ns = await ctx.import("/path/to/doc2?x=20");
            expect(count).to.equal(2);
            expect(ns.x).to.equal(20);
        });
    });    
}

