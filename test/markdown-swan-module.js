
const expect = require("chai").expect;
const olojs = require("..");

describe("markdown swan module", () => {

    it("should expose a function that converts markdown to HTML", async () => {
        const store = new olojs.MemoryStore();
        const doc = store.createDocument('/path/to/doc',
                "<% require 'markdown' '*bold*' %>");
        const docns = await doc.evaluate(doc.createContext());
        expect(docns.__text__).to.equal("<p><em>bold</em></p>\n");
    });
});
