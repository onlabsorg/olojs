const expect = require("chai").expect;
const Store = require("../lib/stores/store");

describe("Store", () => {

    describe(`source = store.read(path)`, () => {

        it("should return an empty document", async () => {
            const store = new Store();
            expect(await store.read('/path/to/doc')).to.equal("");
        });
    });

    describe(`await store.write(path, source)`, () => {

        it("should throw WriteOperationNotAllowedError", async () => {
            const store = new Store();

            try {
                await store.write('/path/to/doc', "xxx");
                throw new Error("It did not throw")
            } catch (e) {
                expect(e).to.be.instanceof(Store.WriteOperationNotAllowedError);
            }
        });
    });

    describe(`await store.delete(path)`, () => {

        it("should throw WriteOperationNotAllowedError", async () => {
            const store = new Store();

            try {
                await store.delete('/path/to/doc');
                throw new Error("It did not throw")
            } catch (e) {
                expect(e).to.be.instanceof(Store.WriteOperationNotAllowedError);
            }
        });
    });
});
