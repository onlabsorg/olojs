var expect = require("chai").expect;
var expression = require('../lib/expression');

require('@onlabsorg/swan-js/test/index');

describe("olojs expression stdlib", () => {

    describe("markdown module", () => {

        it("should expose a function that converts markdown to HTML", async () => {
            var evaluate = expression.parse(`{
                markdown = require 'markdown',
                html = markdown '*bold*'
            }.html`);
            console.log(await evaluate(expression.createContext()))
            var html = await evaluate(expression.createContext());
            expect(html).to.equal("<p><em>bold</em></p>\n");
        });
    });
});
