var expect = require("chai").expect;
var loadlib = require("../lib/expression/stdlib-loader");
var expression = require("../lib/expression");

describe("stdlib", () => {
    
    describe("markdown", () => {
        it("should expose a function that converts markdown to HTML", async () => {
            var markdown = await loadlib("markdown");
            var html = await expression.apply(markdown, "*bold*");
            expect(html).to.equal("<p><em>bold</em></p>\n");
        });
    });
    
    describe("path", () => {
        it("should expose NodeJS path functions", async () => {
            var path = await loadlib("path");
            var pathlib = require("path");
            expect(path.getBaseName).to.equal(pathlib.basename);
            expect(path.getExtName).to.equal(pathlib.extname);
            expect(path.normalize).to.equal(pathlib.normalize);
            expect(path.getDirName).to.equal(pathlib.dirname);
            expect(path.resolve("/path/to/doc1", "../doc2")).to.equal("/path/to/doc2");
        });
    });

    describe("math", () => {
        it("should expose JavaScript Math functions", async () => {
            var math = await loadlib("math");
            expect(math.E).to.equal(Math.E);
            expect(math.PI).to.equal(Math.PI);
            expect(math.abs).to.equal(Math.abs);
            expect(math.acos).to.equal(Math.acos);
            expect(math.acosh).to.equal(Math.acosh);
            expect(math.asin).to.equal(Math.asin);
            expect(math.asinh).to.equal(Math.asinh);
            expect(math.atan).to.equal(Math.atan);
            expect(math.atanh).to.equal(Math.atanh);
            expect(math.ceil).to.equal(Math.ceil);
            expect(math.cos).to.equal(Math.cos);
            expect(math.cosh).to.equal(Math.cosh);
            expect(math.exp).to.equal(Math.exp);
            expect(math.floor).to.equal(Math.floor);
            expect(math.log).to.equal(Math.log);
            expect(math.log10).to.equal(Math.log10);
            expect(math.max).to.equal(Math.max);
            expect(math.min).to.equal(Math.min);
            expect(math.random).to.equal(Math.random);
            expect(math.round).to.equal(Math.round);
            expect(math.sin).to.equal(Math.sin);
            expect(math.sinh).to.equal(Math.sinh);
            expect(math.sqrt).to.equal(Math.sqrt);
            expect(math.tan).to.equal(Math.tan);
            expect(math.tanh).to.equal(Math.tanh);
            expect(math.trunc).to.equal(Math.trunc);    
        });
    });
});
