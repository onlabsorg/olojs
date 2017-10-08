
const expect = require("chai").expect;

const client = require("../lib/client");

const docURL = "http://localhost:8010/olostore/main.yaml";

describe("Document", () => {

    describe("Document.prototype.load() - async method", () => {

        it("should resolve the remote yaml file represented as a Document object", (done) => {
            async function test () {
                const doc = await client.Document(docURL).load();

                expect(doc).to.be.instanceof(client.Document);

                expect(doc.get('a')).to.be.instanceof(client.ObservableList);
                expect(doc.get('a').size).to.equal(3);
                expect(doc.get('a').get(0)).to.equal("item0");
                expect(doc.get('a').get(1)).to.equal("item1");
                expect(doc.get('a').get(2)).to.equal("item2");

                expect(doc.get('b')).to.be.a("boolean");
                expect(doc.get('b')).to.be.true;

                expect(doc.get('n')).to.be.a("number");

                expect(doc.get('d')).to.be.instanceof(client.ObservableDict);
                expect(doc.get('d').size).to.equal(3);
                expect(doc.get('d').get('x')).to.equal(11);
                expect(doc.get('d').get('y')).to.equal(12);
                expect(doc.get('d').get('z')).to.equal(13);

                expect(doc.get('sub1')).to.be.instanceof(client.Document);
                expect(doc.get('sub1').size).to.equal(3);
                expect(doc.get('sub1').get('sa')).to.equal("sub1-a");
                expect(doc.get('sub1').get('sb')).to.equal("sub1-b");
                expect(doc.get('sub1').get('sc')).to.equal("sub1-c");
            }
            test().then(done).catch(done);
        });
    });

    describe("Document.prototype.url - getter", () => {
        it("should return the url of the document", (done) => {
            async function test () {
                const doc = await client.Document(docURL).load();
                expect(doc.url.href).to.equal(docURL);
            }
            test().then(done).catch(done);
        });
    });

    describe("Document.prototype.store() - async method", () => {
        it("should save a copy of the current document on the server", (done) => {
            async function test () {
                const doc = await client.Document(docURL).load();
                const n = doc.get('n');
                doc.set('n', n+1);
                await doc.store();

                doc.delete('n');
                await doc.load(false);
                expect(doc.get('n')).to.equal(n+1);
            }
            test().then(done).catch(done);
        });
    });

    describe("Document.prototype.update() - async method", () => {

        it("should update the document with the remote changes", (done) => {
            async function test () {
                const doc = await client.Document(docURL).load();
                const n = doc.get('n');
                doc.set('n', n+1);
                await doc.store();

                doc.delete('n');

                const changes = [];
                const listener = (change) => changes.push(change);
                doc.afterChangeCallbacks.add(listener);

                await doc.update();
                doc.afterChangeCallbacks.delete(listener);

                expect(doc.get('n')).to.equal(n+1);
                expect(changes.length).to.equal(1);
                expect(changes[0].path).to.deep.equal(['n']);
                expect(changes[0].del).to.be.undefined;
                expect(changes[0].ins).to.equal(n+1);
            }
            test().then(done).catch(done);
        });
    });

});
