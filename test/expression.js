var expect = require("chai").expect;
var expression = require('../lib/expression');

require('@onlabsorg/swan-js/test/index');

describe("olojs expression stdlib", () => {

    describe("markdown module", () => {

        it("should expose a function that converts markdown to HTML", async () => {
            var markdown = require('../lib/stdlib/markdown');
            var html = await expression.O.apply(markdown, "*bold*");
            expect(html).to.equal("<p><em>bold</em></p>\n");
        });

        it("should load the markdown module via require", async () => {
            var markdown = await expression.createContext().require('markdown');
            expect(markdown).to.equal(require('../lib/stdlib/markdown'));
        });
    });
});
