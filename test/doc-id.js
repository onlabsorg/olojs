var expect = require("chai").expect;
var DocId = require("../lib/doc-id");


describe("docId", () => {
    
    describe("docId.parse(href)", () => {
        
        it("should return an DocId instance", () => {
            var pDocId = DocId.parse("http://uid:pwd@host.name:8080/path/to/doc?x=10&s=abc#frag");
            expect(pDocId).to.be.instanceof(DocId);
            expect(pDocId.scheme).to.equal("http");
            expect(pDocId.userinfo).to.equal("uid:pwd");
            expect(pDocId.host).to.equal("host.name");
            expect(pDocId.port).to.equal(8080);
            expect(pDocId.path).to.equal("/path/to/doc");
            expect(pDocId.query).to.deep.equal({s:"abc", x:10});
            expect(pDocId.fragment).to.equal("frag");
            expect(pDocId.authority).to.equal("//uid:pwd@host.name:8080")
            expect(pDocId.root).to.equal("http://uid:pwd@host.name:8080")
            expect(String(pDocId)).to.equal("http://uid:pwd@host.name:8080/path/to/doc")
            expect(pDocId.uri).to.equal("http://uid:pwd@host.name:8080/path/to/doc?s=abc&x=10#frag")
        });
    });
    
    describe("DocId.prototype.resolve(relativeDocId)", () => {

        it("should resolve the relativeDocId to the baseDocId", () => {
            expect(DocId.parse("http://host.name/path/to/doc").resolve("doc2")).to.equal("http://host.name/path/to/doc2");
            expect(DocId.parse("http://host.name/path/to/doc").resolve("./doc2")).to.equal("http://host.name/path/to/doc2");
            expect(DocId.parse("http://host.name/path/to/doc").resolve("../to_doc2")).to.equal("http://host.name/path/to_doc2");
            expect(DocId.parse("http://host.name/path/to/doc").resolve("../../../../doc2")).to.equal("http://host.name/doc2");
            expect(DocId.parse("http://host.name/path/to/doc").resolve("/doc2")).to.equal("http://host.name/doc2");
        });        
    });
});
