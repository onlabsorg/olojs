var expect = require("chai").expect;
var Parser = require("../lib/expression/parser");

var parse = Parser({
    binaryOperations: {
        "+": {precedence:1, handler:"$add"},
        "*": {precedence:2, handler:"$mul"},
        "":  {precedence:3, handler:"$apply"},
        ".": {precedence:3, handler:"$dot"},
        "or":{precedence:4, handler:"$or"},
    },
    voidHandler: "$void",
    nameHandler: "$get",
    stringHandler: "$str",
    numberHandler: "$num",
    squareGroupHandler: "$sqc",
    curlyGroupHandler: "$clc",
});

var context = {
    async $add (L, R) {
        return await L(this) + await R(this)
    },
    async $mul (L, R) {
        return await L(this) * await R(this)
    },
    async $apply (L, R) {
        return await R(this) + "->" + await L(this)
    },
    async $sqc (X) {
        return `[[ ${await X(this)} ]]`;
    },
    async $clc (X) {
        return `{{ ${await X(this)} }}`;
    },
    async $dot (L, R) {
        return `${await L(this)} (.) ${await R(this)}`;
    },
    async $or (L, R) {
        return `${await L(this)} (or) ${await R(this)}`;
    },
    async $get (name) {
        return `[${name}]`;
    },
    async $str (value) {
        return value;
    },
    async $num (value) {
        return value;
    },
    async $void () {
        return null;
    }
};



describe("parser", () => {
    
    it("should parse binary operations", async () => {
        var evaluate = parse("7+3");
        var value = await evaluate(context);
        expect(value).to.equal(10);
    });

    it("should parse sequence of binary operations with precedence", async () => {
        var evaluate = parse("7+3*2");
        var value = await evaluate(context);
        expect(value).to.equal(13);
    });

    it("should parse grouping parenthesis", async () => {
        var evaluate = parse("2*(7+3)");
        var value = await evaluate(context);
        expect(value).to.equal(20);
    });
    
    it("should parse the apply operation", async () => {
        var evaluate = parse("'y' 'x'");
        var value = await evaluate(context);
        expect(value).to.equal("x->y");
    });

    it("should parse square brackets closures", async () => {
        var evaluate = parse("[10]");
        var value = await evaluate(context);
        expect(value).to.equal("[[ 10 ]]");
    });
    
    it("should parse curly brackets closures", async () => {
        var evaluate = parse("{10}");
        var value = await evaluate(context);
        expect(value).to.equal("{{ 10 }}");
    });
    
    it("should parse identifiers", async () => {
        var evaluate = parse("'container'.field");
        var value = await evaluate(context);
        expect(value).to.equal("container (.) [field]");
    });

    it("should parse text operators", async () => {
        var evaluate = parse("10 or 20");
        var value = await evaluate(context);
        expect(value).to.equal("10 (or) 20");
    });

    it("should return null in case of empty expression", async () => {
        var evaluate = parse(" ");
        var value = await evaluate(context);
        expect(value).to.equal(null);

        var evaluate = parse("[]");
        var value = await evaluate(context);
        expect(value).to.equal("[[ null ]]");
    });
});
