const expect = require("chai").expect;
const MemoryStore = require("../lib/memory-store");
const HTTPStore = require("../lib/http-store");


module.exports = (Hub, describeLocal) => describe("Hub", () => {
    
    describe("'/home' route", () => {
        
        it("should map the passed homeStore", () => {
            const homeStore = new MemoryStore();
            const hub = new Hub(homeStore);
            const [store, subPath] = hub._match('/home/path/to/doc');
            expect(store).to.equal(homeStore);
            expect(subPath).to.equal('/path/to/doc');
        });
    });

    describe("'/http' route", () => {
        
        it("should map a HTTPStore with root URL 'http:/'", () => {
            const hub = new Hub(new MemoryStore());
            const [store, subPath] = hub._match('/http/path/to/doc');
            expect(store).to.be.instanceof(HTTPStore);
            expect(store.rootURL).to.equal('http://');
            expect(subPath).to.equal('/path/to/doc');
        });
    });

    describe("'/https' route", () => {
        
        it("should map a HTTPStore with root URL 'http:/'", () => {
            const hub = new Hub(new MemoryStore());
            const [store, subPath] = hub._match('/https/path/to/doc');
            expect(store).to.be.instanceof(HTTPStore);
            expect(store.rootURL).to.equal('https://');
            expect(subPath).to.equal('/path/to/doc');
        });
    });
    
    describe("'/temp' route", () => {
        
        it("should map a MemoryStore", () => {
            const hub = new Hub(new HTTPStore("http://www.host.com/"));
            const [store, subPath] = hub._match('/temp/path/to/doc');
            expect(store).to.be.instanceof(MemoryStore);
            expect(subPath).to.equal('/path/to/doc');
        });
    });

    
    describe("'/local' route", () => {
        
        it("should map a local router", () => {
            const hub = new Hub(new MemoryStore());
            describeLocal(hub);
        });
    });
});

