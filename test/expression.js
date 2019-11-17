"NOTHING"
var expect = require("chai").expect;
var {parse, createContext, evaluate} = require("../lib/expression");
var errors = require("../lib/errors");


async function expectRuntimeError (ctx, testFn, message) {
    try {
        await testFn();
        throw new Error("id didn't throw");
    } catch (e) {
        expect(e).to.be.instanceof(errors.RuntimeError);
        expect(e.message).to.equal(message);
    }    
}

async function expectTuple (ctx, expression, expectedTuple) {
    var tuple = await evaluate(expression, ctx);
    expect(tuple[Symbol.iterator]).to.be.a("function");
    expect(Array.from(tuple)).to.deep.equal(expectedTuple);    
}

async function expectValue (ctx, expression, value) {
    expect(await evaluate(expression, ctx)).to.deep.equal(value);
}



describe("expression", () => {
    
    describe("Core operations", () => {
        
        it("should evaluate numeric literals", async () => {
            var ctx = createContext();
            expect(await evaluate("10", ctx)).to.equal(10);
        });

        it("should evaluate string literals", async () => {
            var ctx = createContext();
            expect(await evaluate(`"abc"`, ctx)).to.equal("abc");
            expect(await evaluate(`'def'`, ctx)).to.equal("def");
            expect(await evaluate("`ghi`", ctx)).to.equal("ghi");
        });

        it("should evaluate nothingness", async () => {
            var ctx = createContext();
            expect(await evaluate("", ctx)).to.equal(null);
            expect(await evaluate("()", ctx)).to.equal(null);
        });

        it("should resolve names", async () => {
            var ctx = createContext({a:10, _b:20});
            expect(await evaluate("a", ctx)).to.equal(10);
            expect(await evaluate("_b", ctx)).to.equal(20);
            expect(await evaluate("d", ctx)).to.equal(null);
        });

        it("should evaluate tuples as iterables", async () => {
            var ctx = createContext();
            await expectTuple(ctx, "1,(2,3),4,(5,(6,7)),8,(),9", [1,2,3,4,5,6,7,8,null,9]);
        });

        it("should evaluate lists", async () => {
            var ctx = createContext();
            // expect(await evaluate("[1,2,3]", ctx)).to.deep.equal([1,2,3]);
            // expect(await evaluate("[]", ctx)).to.deep.equal([]);
            expect(await evaluate("[[1,2],3,4]", ctx)).to.deep.equal([[1,2],3,4]);
        });

        it("should execute assignment operations", async () => {
            var ctx = createContext();
            
            var retval = await evaluate("x = 10", ctx);
            expect(retval).to.be.null;
            expect(ctx.x).to.equal(10);
            
            var retval = await evaluate("(a,b,c) = (1,2,3)", ctx);
            expect(retval).to.be.null;
            expect(ctx.a).to.equal(1);        
            expect(ctx.b).to.equal(2);        
            expect(ctx.c).to.equal(3);        

            var retval = await evaluate("(d,e,f) = (10,20)", ctx);
            expect(retval).to.be.null;
            expect(ctx.d).to.equal(10);        
            expect(ctx.e).to.equal(20);        
            expect(ctx.f).to.equal(null);        

            var retval = await evaluate("(g,h) = (100,200,300)", ctx);
            expect(retval).to.be.null;
            expect(ctx.g).to.equal(100);        
            expect(ctx.h).to.equal(200);        
        });
        
        it("should evaluate fnction definitions", async () => {
            var ctx = createContext();        
            var foo = await evaluate("(x, y) -> [y,x]", ctx);
            expect(foo).to.be.a("function");
            expect(await foo(10,20)).to.deep.equal([20,10]);
        });
        
        it("should evaluate namespace definitions", async () => {
            var ctx = createContext();                    
            expect(await evaluate("{x=1, 10, y=2, z=3}", ctx)).to.deep.equal({x:1,y:2,z:3});
        });
    });

    describe("'apply' operation: L R", () => {
        
        it("should call L with the parameter R, if L is a function", async () => {
            var ctx = createContext();                    
            expect(await evaluate("(x -> [x]) 10", ctx)).to.deep.equal([10]);
            expect(await evaluate("((x, y) -> [y,x])(10, 20)", ctx)).to.deep.equal([20,10]);
            
            ctx.double = x => 2 * x;
            expect(await evaluate("double 25", ctx)).to.equal(50);

            ctx.add = (a,b) => a + b;
            expect(await evaluate("add(10, 20)", ctx)).to.equal(30);
        });
        
        it("should set `this` to the context when calling javascript functions", async () => {
            var ctx = createContext();                    
            ctx.x = 10;
            ctx.f = function (n) {return n * this.x};
            expect(await evaluate("f 1", ctx)).to.equal(10);            
            expect(await evaluate("f 3", ctx)).to.equal(30);            
        });
        
        it("should return the R-th item if L is a list", async () => {
            var ctx = createContext();                    
            ctx.x = [10,20,30];
            expect(await evaluate("x 1", ctx)).to.equal(10);            
            expect(await evaluate("x 2", ctx)).to.equal(20);            
            expect(await evaluate("x 3", ctx)).to.equal(30);                        
            expect(await evaluate("x 4", ctx)).to.equal(null);                        
            expect(await evaluate("x (-1)", ctx)).to.equal(30);                        
            expect(await evaluate("x (-2)", ctx)).to.equal(20);                        
            expect(await evaluate("x (-3)", ctx)).to.equal(10);                        
            expect(await evaluate("x (-4)", ctx)).to.equal(null);                        
            expect(await evaluate("x [1,2,3]", ctx)).to.equal(null);                        
            await expectTuple(ctx, "x (-1,2,1)", [30,20,10]);
        });
        
        it("should return the R-th character if L is a string", async () => {
            var ctx = createContext();                    
            ctx.x = "abc";
            expect(await evaluate("x 1", ctx)).to.equal('a');            
            expect(await evaluate("x 2", ctx)).to.equal('b');            
            expect(await evaluate("x 3", ctx)).to.equal('c');                        
            expect(await evaluate("x 4", ctx)).to.equal('');                        
            expect(await evaluate("x (-1)", ctx)).to.equal('c');                        
            expect(await evaluate("x (-2)", ctx)).to.equal('b');                        
            expect(await evaluate("x (-3)", ctx)).to.equal('a');                        
            expect(await evaluate("x (-4)", ctx)).to.equal('');                        
            expect(await evaluate("x [1,2,3]", ctx)).to.equal('');                        
            await expectTuple(ctx, "x (-1,2,1)", ['c','b','a']);
        });
        
        it("should return the value mapped to R if L is a namespace", async () => {
            var ctx = createContext();                    
            ctx.x = {a:1,b:2,c:3};
            expect(await evaluate("x 'a'", ctx)).to.equal(1);            
            expect(await evaluate("x 'b'", ctx)).to.equal(2);            
            expect(await evaluate("x 'c'", ctx)).to.equal(3);                        
            expect(await evaluate("x 'd'", ctx)).to.equal(null);                        
            expect(await evaluate("x ['a','b','c']", ctx)).to.equal(null);                        
            await expectTuple(ctx, "x ('a','b','c')", [1,2,3]);
        });
        
        it("should return a tuple obtained by calling of the items of L if L is a tuple", async () => {
            var ctx = createContext();
            ctx.x2 = a => 2*a;
            ctx.x3 = a => 3*a;
            ctx.x4 = a => 4*a;
            await expectTuple(ctx, "(x2,x3,x4) 2", [4,6,8]);
        });

        it("throw a runtime error if L is of any other type", async () => {
            var ctx = createContext();              
            var test = (expr, type) => expectRuntimeError(ctx, () => evaluate(expr, ctx), `Apply operation not defined on '${type}' type`);
            await test("() 10"      , "NOTHING");
            await test("10 10"      , "NUMBER");
        });
    });
    
    describe("L.R", () => {
        
        it("should evaluate 'R' in the 'L' context if 'L' is a namespace", async () => {
            var ctx = createContext({x:10});
            ctx.ns = {y:20, z:30, _h:40};
            expect(await evaluate("ns.y", ctx)).to.equal(20);
            expect(await evaluate("ns.[1,y,z]", ctx)).to.deep.equal([1,20,30]);
            expect(await evaluate("ns.x", ctx)).to.be.null;
            expect(await evaluate("ns._h", ctx)).to.equal(40);
        });

        it("should throw a runtime error if 'L' is of any other type", async () => {
            var ctx = createContext();              
            var test = (expr) => expectRuntimeError(ctx, () => evaluate(expr, ctx), "NAMESPACE expected on the left side of the '.' operator");
            await test("().name");
            await test("(10).name");
            await test("'abc'.name");
            await test("[].name");
            await test("(x -> x).name");
        });
    });
    
    describe("size X", () => {
        
        it("should return 0 if X is nothing", async () => {
            var ctx = createContext();
            await expectValue(ctx, "size ()", 0);
        });
        
        it("should return 0 if x is `false` and 1 if x is `true`", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "size F", 0);
            await expectValue(ctx, "size T", 1);
        });
        
        it("should return |x| if X is a number", async () => {
            var ctx = createContext();
            await expectValue(ctx, "size 0", 0);
            await expectValue(ctx, "size 3.5", 3.5);
            await expectValue(ctx, "size(-4)", 4);
        });
        
        it("should return the numer of characters of X if it is a string", async () => {
            var ctx = createContext();
            await expectValue(ctx, "size 'abc'", 3);
            await expectValue(ctx, "size ''", 0);
        });
        
        it("should return the numer of items of X if it is a list", async () => {
            var ctx = createContext();
            await expectValue(ctx, "size [10,20,30]", 3);
            await expectValue(ctx, "size []", 0);
        });

        it("should return the numer of names of X if it is a namespace", async () => {
            var ctx = createContext();
            await expectValue(ctx, "size {a=1,b=2,c=3}", 3);
            await expectValue(ctx, "size {}", 0);
        });
        
        it("should return the number of operations in X if X is a function", async () => {
            var ctx = createContext();
            await expectValue(ctx, "size (x -> 2*x+1)", 5);
            await expectValue(ctx, "size (x -> ())", 0);
        });
        
        it("should return the number of characters in X body if X is a native javascript function", async () => {
            var ctx = createContext({jsFn: (x) => 2*x+1});
            await expectValue(ctx, "size jsFn", ctx.jsFn.toString().length);
        });

        it("should return the sum of the item sizes if X is a tuple", async () => {
            var ctx = createContext();
            await expectValue(ctx, "size(2,'abc',[1,2,3,4])", 9);
        });
    });

    describe("bool X", () => {
        
        it("should return `true` if `size x` is not 0, otherwise `false`", async () => {
            var ctx = createContext({T:true, F:false});
            
            await expectValue(ctx, "bool ()", false);
            
            await expectValue(ctx, "bool F", false);
            await expectValue(ctx, "bool T", true);

            await expectValue(ctx, "bool 0", false);
            await expectValue(ctx, "bool 10", true);
            await expectValue(ctx, "bool(-8)", true);

            await expectValue(ctx, "bool ''", false);
            await expectValue(ctx, "bool 'abc'", true);

            await expectValue(ctx, "bool []", false);
            await expectValue(ctx, "bool [1,2,3]", true);

            await expectValue(ctx, "bool {}", false);
            await expectValue(ctx, "bool {a=1,b=2}", true);

            await expectValue(ctx, "bool(x -> ())", false);
            await expectValue(ctx, "bool(x -> 2*x)", true);

            await expectValue(ctx, "bool(0,0,0)", false);
            await expectValue(ctx, "bool(0,2,0)", true);
        });
    });

    describe("not X", () => {
        
        it("should return `true` if `size x` is 0, otherwise `false`", async () => {
            var ctx = createContext({T:true, F:false});
            
            await expectValue(ctx, "not ()", true);
            
            await expectValue(ctx, "not F", true);
            await expectValue(ctx, "not T", false);

            await expectValue(ctx, "not 0", true);
            await expectValue(ctx, "not 10", false);
            await expectValue(ctx, "not(-8)", false);

            await expectValue(ctx, "not ''", true);
            await expectValue(ctx, "not 'abc'", false);

            await expectValue(ctx, "not []", true);
            await expectValue(ctx, "not [1,2,3]", false);

            await expectValue(ctx, "not {}", true);
            await expectValue(ctx, "not {a=1,b=2}", false);

            await expectValue(ctx, "not(x -> ())", true);
            await expectValue(ctx, "not(x -> 2*x)", false);

            await expectValue(ctx, "not(0,0,0)", true);
            await expectValue(ctx, "not(0,2,0)", false);
        });
    });
    
    describe("X or Y", () => {
        
        it("should return true only if any of `bool X` or `bool Y` is true", async () => {
            var ctx = createContext({T:true, F:false});
            
            // true or true
            expect(await evaluate("T or T", ctx)).to.be.true;
            expect(await evaluate("T or 10", ctx)).to.be.true;
            expect(await evaluate("10 or T", ctx)).to.be.true;
            expect(await evaluate("10 or 10", ctx)).to.be.true;
            
            // true or false
            expect(await evaluate("T or F", ctx)).to.be.true;
            expect(await evaluate("T or 0", ctx)).to.be.true;
            expect(await evaluate("10 or F", ctx)).to.be.true;
            expect(await evaluate("10 or 0", ctx)).to.be.true;
            
            // false or true
            expect(await evaluate("F or T", ctx)).to.be.true;
            expect(await evaluate("F or 10", ctx)).to.be.true;
            expect(await evaluate("0 or T", ctx)).to.be.true;
            expect(await evaluate("0 or 10", ctx)).to.be.true;
            
            // false or false
            expect(await evaluate("F or F", ctx)).to.be.false;
            expect(await evaluate("F or 0", ctx)).to.be.false;
            expect(await evaluate("0 or F", ctx)).to.be.false;
            expect(await evaluate("0 or 0", ctx)).to.be.false;
        })
    });
    
    describe("X and Y", () => {
        
        it("should return true only if both of `bool X` and `bool Y` are true", async () => {
            var ctx = createContext({T:true, F:false});
            
            // true and true
            expect(await evaluate("T and T", ctx)).to.be.true;
            expect(await evaluate("T and 10", ctx)).to.be.true;
            expect(await evaluate("10 and T", ctx)).to.be.true;
            expect(await evaluate("10 and 10", ctx)).to.be.true;
            
            // true and false
            expect(await evaluate("T and F", ctx)).to.be.false;
            expect(await evaluate("T and 0", ctx)).to.be.false;
            expect(await evaluate("10 and F", ctx)).to.be.false;
            expect(await evaluate("10 and 0", ctx)).to.be.false;
            
            // false and true
            expect(await evaluate("F and T", ctx)).to.be.false;
            expect(await evaluate("F and 10", ctx)).to.be.false;
            expect(await evaluate("0 and T", ctx)).to.be.false;
            expect(await evaluate("0 and 10", ctx)).to.be.false;
            
            // false and false
            expect(await evaluate("F and F", ctx)).to.be.false;
            expect(await evaluate("F and 0", ctx)).to.be.false;
            expect(await evaluate("0 and F", ctx)).to.be.false;
            expect(await evaluate("0 and 0", ctx)).to.be.false;
        })
    });
    
    describe("X if Y", () => {
        
        it("should return X is `bool Y` is true, or else null", async () => {
            var ctx = createContext({T:true, F:false});
            
            // Y is true
            expect(await evaluate("[1,2,3] if T", ctx)).to.deep.equal([1,2,3]);
            expect(await evaluate("[1,2,3] if 10", ctx)).to.deep.equal([1,2,3]);
            
            // Y is false
            expect(await evaluate("[1,2,3] if F", ctx)).to.be.null;
            expect(await evaluate("[1,2,3] if 0", ctx)).to.be.null;
        })
    });
    
    describe("X else Y", () => {
        
        it("should return X if not `null`, otherwise Y", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("[1,2,3] else [3,4,5]", ctx)).to.deep.equal([1,2,3]);
            expect(await evaluate("() else [3,4,5]", ctx)).to.deep.equal([3,4,5]);
        })
    });
    
    describe("str X", () => {
        
        it("should return an empty string if X is nothing", async () => {
            var ctx = createContext();
            expectValue(ctx, "str ()", "");
        });
        
        it("should return 'TRUE' if X is true", async () => {
            var ctx = createContext({T:true, F:false});
            expectValue(ctx, "str T", "TRUE");
        });
        
        it("should return 'FALSE' if X is true", async () => {
            var ctx = createContext({T:true, F:false});
            expectValue(ctx, "str F", "FALSE");
        });
        
        it("should return String(X) if X is a number", async () => {
            var ctx = createContext({T:true, F:false});
            expectValue(ctx, "str 123.4", "123.4");
        });
        
        it("should return X itself if it is a string", async () => {
            var ctx = createContext({T:true, F:false});
            expectValue(ctx, "str 'abc'", "abc");
        });
        
        it("should return the expression source if X is a function", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "str(x -> ())", "(x) -> (())");
            await expectValue(ctx, "str(x -> name)", "(x) -> (name)");
            await expectValue(ctx, "str(x -> 10)", "(x) -> (10)");
            await expectValue(ctx, "str(x -> `abc`)", "(x) -> (`abc`)");
            await expectValue(ctx, `str(x -> 'abc')`, "(x) -> ('abc')");
            await expectValue(ctx, `str(x -> "abc")`, `(x) -> ("abc")`);
            await expectValue(ctx, "str(x -> [1,2,3])", "(x) -> ([1,2,3])");
            await expectValue(ctx, "str(x -> {a=1,b=2,c=3})", "(x) -> ({(a) = (1),(b) = (2),(c) = (3)})");
            await expectValue(ctx, "str(x -> a/2+b*c)", "(x) -> (((a) / (2)) + ((b) * (c)))");
        });
        
        it("should return '[n]' when n is the number of items", async () => {
            var ctx = createContext({T:true, F:false});            
            await expectValue(ctx, "str[1,2,'abc']", "[3]")
        });

        it("should return '{n}' when n is the number of items", async () => {
            var ctx = createContext({T:true, F:false});            
            await expectValue(ctx, "str{a=1,b=2,c=3}", "{3}")
        });

        it("should concatenate the serialized item if X is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            expectValue(ctx, "str('it is ',T,' that 1+2 is ',1+2)", "it is TRUE that 1+2 is 3");
        });
    });
    
    describe("X + Y", () => {
        
        it("should return Y if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "() + ()", null);
            await expectValue(ctx, "() + T", true);
            await expectValue(ctx, "() + F", false);
            await expectValue(ctx, "() + 10", 10);
            await expectValue(ctx, "() + 'abc'", "abc");
            await expectValue(ctx, "() + fn", ctx.fn);
            await expectValue(ctx, "() + ls", ctx.ls);
            await expectValue(ctx, "() + ns", ctx.ns);
            await expectTuple(ctx, "() + (1,2,3)", [1,2,3]);
        });
        
        it("should return X if Y is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "T + ()", true);
            await expectValue(ctx, "F + ()", false);
            await expectValue(ctx, "10 + ()", 10);
            await expectValue(ctx, "'abc' + ()", "abc");
            await expectValue(ctx, "fn + ()", ctx.fn);
            await expectValue(ctx, "ls + ()", ctx.ls);
            await expectValue(ctx, "ns + ()", ctx.ns);
            await expectTuple(ctx, "(1,2,3) + ()", [1,2,3]);
        });
        
        it("should return `X||Y` if both X and Y are booleans", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "T + T", true);
            await expectValue(ctx, "T + F", true);
            await expectValue(ctx, "F + T", true);
            await expectValue(ctx, "F + F", false);
        });
        
        it("should return `X+Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "10 + 1", 11);
            await expectValue(ctx, "20 + 0", 20);
            await expectValue(ctx, "5 + (-7)", -2);
        });
        
        it("should concatenate X and Y if they are both strings", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "'abc' + 'def'", "abcdef");
            await expectValue(ctx, "'abc' + ''", "abc");
            await expectValue(ctx, "'' + 'def'", "def");
        });
        
        it("should concatenate X and Y if they are both lists", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "[1,2,3] + [4,5,6]", [1,2,3,4,5,6]);
            await expectValue(ctx, "[1,2,3] + []", [1,2,3]);
            await expectValue(ctx, "[] + [4,5,6]", [4,5,6]);
        });
        
        it("should metge X and Y if they are both namespaces", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "{a=1,b=2} + {b=20,c=30}", {a:1,b:20,c:30});
            await expectValue(ctx, "{a=1,b=2} + {}", {a:1,b:2});
            await expectValue(ctx, "{} + {b=20,c=30}", {b:20,c:30});
        });
        
        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectError = (expression, XType, YType) => expectRuntimeError(ctx, ()=>evaluate(expression,ctx), `Sum operation not defined between ${XType} and ${YType}`);
            
            var LTYPE = "BOOLEAN"; ctx.L = ctx.T; 
            await expectError("L + 1"       , LTYPE, "NUMBER");
            await expectError("L + 'abc'"   , LTYPE, "STRING");
            await expectError("L + [1,2,3]" , LTYPE, "LIST");
            await expectError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L + (x->x)"  , LTYPE, "FUNCTION");
            
            var LTYPE = "BOOLEAN"; ctx.L = ctx.T; 
            await expectError("L + 1"       , LTYPE, "NUMBER");
            await expectError("L + 'abc'"   , LTYPE, "STRING");
            await expectError("L + [1,2,3]" , LTYPE, "LIST");
            await expectError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L + (x->x)"  , LTYPE, "FUNCTION");
            
            var LTYPE = "NUMBER"; ctx.L = 10; 
            await expectError("L + T"       , LTYPE, "BOOLEAN");
            await expectError("L + F"       , LTYPE, "BOOLEAN");
            await expectError("L + 'abc'"   , LTYPE, "STRING");
            await expectError("L + [1,2,3]" , LTYPE, "LIST");
            await expectError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L + (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "STRING"; ctx.L = "abc"; 
            await expectError("L + T"       , LTYPE, "BOOLEAN");
            await expectError("L + F"       , LTYPE, "BOOLEAN");
            await expectError("L + 1"       , LTYPE, "NUMBER");
            await expectError("L + [1,2,3]" , LTYPE, "LIST");
            await expectError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L + (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "LIST"; ctx.L = [1,2,3]; 
            await expectError("L + T"       , LTYPE, "BOOLEAN");
            await expectError("L + F"       , LTYPE, "BOOLEAN");
            await expectError("L + 1"       , LTYPE, "NUMBER");
            await expectError("L + 'abc'"   , LTYPE, "STRING");
            await expectError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L + (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "NAMESPACE"; ctx.L = {a:1,b:2}; 
            await expectError("L + T"       , LTYPE, "BOOLEAN");
            await expectError("L + F"       , LTYPE, "BOOLEAN");
            await expectError("L + 1"       , LTYPE, "NUMBER");
            await expectError("L + 'abc'"   , LTYPE, "STRING");
            await expectError("L + [1,2,3]" , LTYPE, "LIST");
            await expectError("L + (x->x)"  , LTYPE, "FUNCTION");
            
            var LTYPE = "FUNCTION"; ctx.L = x=>x; 
            await expectError("L + T"       , LTYPE, "BOOLEAN");
            await expectError("L + F"       , LTYPE, "BOOLEAN");
            await expectError("L + 1"       , LTYPE, "NUMBER");
            await expectError("L + 'abc'"   , LTYPE, "STRING");
            await expectError("L + [1,2,3]" , LTYPE, "LIST");
            await expectError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L + (x->x)"  , LTYPE, "FUNCTION");
        });
        
        it("should return (x1+y1, x2+y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            await expectTuple(ctx, "(T, 1, 'a', [1], {a=1}) + (F, 2, 'b', [2], {b=2})", [true, 3, "ab", [1,2], {a:1,b:2}]);
            await expectTuple(ctx, "(T, 1, 'a', [1], {a=1}) + (F, 2, 'b')", [true, 3, "ab", [1], {a:1}]);
            await expectTuple(ctx, "(T, 1, 'a') + (F, 2, 'b', [2], {b=2})", [true, 3, "ab", [2], {b:2}]);
            await expectTuple(ctx, "10 + (1, 2, 3)", [11, 2, 3]);
            await expectTuple(ctx, "(1, 2, 3) + 10", [11, 2, 3]);
        });
    });

    describe("X - Y", () => {
        
        it("should return Y if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "() - ()"     , null);
            await expectValue(ctx, "T - ()"      , true);
            await expectValue(ctx, "F - ()"      , false);
            await expectValue(ctx, "10 - ()"     , 10);
            await expectValue(ctx, "'abc' - ()"  , "abc");
            await expectValue(ctx, "fn - ()"     , ctx.fn);
            await expectValue(ctx, "ls - ()"     , ctx.ls);
            await expectValue(ctx, "ns - ()"     , ctx.ns);
            await expectTuple(ctx, "(1,2,3) - ()", [1,2,3]);
        });
        
        it("should return `X-Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "10 - 1"     , 9);
            await expectValue(ctx, "20 - 0"     , 20);
            await expectValue(ctx, "10 - (-7)"  , 17);
        });
        
        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectError = (expression, XType, YType) => expectRuntimeError(ctx, ()=>evaluate(expression,ctx), `Subtraction operation not defined between ${XType} and ${YType}`);

            var LTYPE = "NOTHING"; ctx.L = null; 
            await expectError("L - T"       , LTYPE, "BOOLEAN");
            await expectError("L - F"       , LTYPE, "BOOLEAN");
            await expectError("L - 1"       , LTYPE, "NUMBER");
            await expectError("L - 'abc'"   , LTYPE, "STRING");
            await expectError("L - [1,2,3]" , LTYPE, "LIST");
            await expectError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L - (x->x)"  , LTYPE, "FUNCTION");
            
            var LTYPE = "BOOLEAN"; ctx.L = ctx.T; 
            await expectError("L - T"       , LTYPE, "BOOLEAN");
            await expectError("L - F"       , LTYPE, "BOOLEAN");
            await expectError("L - 1"       , LTYPE, "NUMBER");
            await expectError("L - 'abc'"   , LTYPE, "STRING");
            await expectError("L - [1,2,3]" , LTYPE, "LIST");
            await expectError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L - (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "BOOLEAN"; ctx.L = ctx.F; 
            await expectError("L - T"       , LTYPE, "BOOLEAN");
            await expectError("L - F"       , LTYPE, "BOOLEAN");
            await expectError("L - 1"       , LTYPE, "NUMBER");
            await expectError("L - 'abc'"   , LTYPE, "STRING");
            await expectError("L - [1,2,3]" , LTYPE, "LIST");
            await expectError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L - (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "NUMBER"; ctx.L = 10; 
            await expectError("L - T"       , LTYPE, "BOOLEAN");
            await expectError("L - F"       , LTYPE, "BOOLEAN");
            await expectError("L - 'abc'"   , LTYPE, "STRING");
            await expectError("L - [1,2,3]" , LTYPE, "LIST");
            await expectError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L - (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "STRING"; ctx.L = "abc"; 
            await expectError("L - T"       , LTYPE, "BOOLEAN");
            await expectError("L - F"       , LTYPE, "BOOLEAN");
            await expectError("L - 1"       , LTYPE, "NUMBER");
            await expectError("L - 'abc'"   , LTYPE, "STRING");
            await expectError("L - [1,2,3]" , LTYPE, "LIST");
            await expectError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L - (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "LIST"; ctx.L = [1,2,3]; 
            await expectError("L - T"       , LTYPE, "BOOLEAN");
            await expectError("L - F"       , LTYPE, "BOOLEAN");
            await expectError("L - 1"       , LTYPE, "NUMBER");
            await expectError("L - 'abc'"   , LTYPE, "STRING");
            await expectError("L - [1,2,3]" , LTYPE, "LIST");
            await expectError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L - (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "NAMESPACE"; ctx.L = {a:1}; 
            await expectError("L - T"       , LTYPE, "BOOLEAN");
            await expectError("L - F"       , LTYPE, "BOOLEAN");
            await expectError("L - 1"       , LTYPE, "NUMBER");
            await expectError("L - 'abc'"   , LTYPE, "STRING");
            await expectError("L - [1,2,3]" , LTYPE, "LIST");
            await expectError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L - (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "FUNCTION"; ctx.L = x=>x; 
            await expectError("L - T"       , LTYPE, "BOOLEAN");
            await expectError("L - F"       , LTYPE, "BOOLEAN");
            await expectError("L - 1"       , LTYPE, "NUMBER");
            await expectError("L - 'abc'"   , LTYPE, "STRING");
            await expectError("L - [1,2,3]" , LTYPE, "LIST");
            await expectError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L - (x->x)"  , LTYPE, "FUNCTION");
        });
        
        it("should return (x1-y1, x2-y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            var expectError = (expression, XType, YType) => expectRuntimeError(ctx, ()=>evaluate(expression,ctx), `Subtraction operation not defined between ${XType} and ${YType}`);
            await expectTuple(ctx, "(10,20,30) - (1,2,3)", [9,18,27]);
            await expectTuple(ctx, "(10,20,30) - (1,2)"  , [9,18,30]);
            await expectTuple(ctx, "(10,20,30) - 1"      , [9,20,30]);
            await expectError("(10,20) - (1,2,3)", "NOTHING","NUMBER");
            await expectError("10 - (1,2,3)"     , "NOTHING","NUMBER");
        });
    });
    
    describe("X * Y", () => {
        
        it("should return () if either X or Y is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            
            await expectValue(ctx, "() * ()"     , null);
            await expectValue(ctx, "() * T"      , null);
            await expectValue(ctx, "() * F"      , null);
            await expectValue(ctx, "() * 10"     , null);
            await expectValue(ctx, "() * 'abc'"  , null);
            await expectValue(ctx, "() * fn"     , null);
            await expectValue(ctx, "() * ls"     , null);
            await expectValue(ctx, "() * ns"     , null);
            await expectTuple(ctx, "() * (1,2,3)", [null,null,null]);
            
            await expectValue(ctx, "() * ()"     , null);
            await expectValue(ctx, "T * ()"      , null);
            await expectValue(ctx, "F * ()"      , null);
            await expectValue(ctx, "10 * ()"     , null);
            await expectValue(ctx, "'abc' * ()"  , null);
            await expectValue(ctx, "fn * ()"     , null);
            await expectValue(ctx, "ls * ()"     , null);
            await expectValue(ctx, "ns * ()"     , null);
            await expectTuple(ctx, "(1,2,3) * ()", [null,null,null]);            
        });
        
        it("should return `X&&Y` if both X and Y are booleans", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "T * T", true);
            await expectValue(ctx, "T * F", false);
            await expectValue(ctx, "F * T", false);
            await expectValue(ctx, "F * F", false);
        });
        
        it("should return `X*Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "10 * 2", 20);
            await expectValue(ctx, "10 * 0", 0);
            await expectValue(ctx, "10 * (-2)", -20);
        });
        
        it("should concatenate X times Y if X is a number and Y is a string", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "3 * 'Abc'"  , "AbcAbcAbc");
            await expectValue(ctx, "3.1 * 'Abc'", "AbcAbcAbc");
            await expectValue(ctx, "3.9 * 'Abc'", "AbcAbcAbc");
            await expectValue(ctx, "0 * 'Abc'"  , "");
            await expectValue(ctx, "-2 * 'Abc'" , "");
        });
        
        it("should concatenate Y times X if Y is a number and X is a string", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "'Abc' * 3"   , "AbcAbcAbc");
            await expectValue(ctx, "'Abc' * 3.1" , "AbcAbcAbc");
            await expectValue(ctx, "'Abc' * 3.9" , "AbcAbcAbc");
            await expectValue(ctx, "'Abc' * 0"   , "");
            await expectValue(ctx, "'Abc' * (-2)", "");
        });

        it("should concatenate X times Y if X is a number and Y is a list", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "3 * [1,2,3]"  , [1,2,3,1,2,3,1,2,3]);
            await expectValue(ctx, "3.1 * [1,2,3]", [1,2,3,1,2,3,1,2,3]);
            await expectValue(ctx, "3.9 * [1,2,3]", [1,2,3,1,2,3,1,2,3]);
            await expectValue(ctx, "0 * [1,2,3]"  , []);
            await expectValue(ctx, "-2 * [1,2,3]" , []);
        });
        
        it("should concatenate Y times X if Y is a number and X is a list", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "[1,2,3] * 3"   , [1,2,3,1,2,3,1,2,3]);
            await expectValue(ctx, "[1,2,3] * 3.1" , [1,2,3,1,2,3,1,2,3]);
            await expectValue(ctx, "[1,2,3] * 3.9" , [1,2,3,1,2,3,1,2,3]);
            await expectValue(ctx, "[1,2,3] * 0"   , []);
            await expectValue(ctx, "[1,2,3] * (-2)", []);
        });

        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectError = (expression, XType, YType) => expectRuntimeError(ctx, ()=>evaluate(expression,ctx), `Product operation not defined between ${XType} and ${YType}`);
            
            var LTYPE = "BOOLEAN"; ctx.L = ctx.T; 
            await expectError("L * 1"       , LTYPE, "NUMBER");
            await expectError("L * 'abc'"   , LTYPE, "STRING");
            await expectError("L * [1,2,3]" , LTYPE, "LIST");
            await expectError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L * (x->x)"  , LTYPE, "FUNCTION");
            
            var LTYPE = "BOOLEAN"; ctx.L = ctx.F; 
            await expectError("L * 1"       , LTYPE, "NUMBER");
            await expectError("L * 'abc'"   , LTYPE, "STRING");
            await expectError("L * [1,2,3]" , LTYPE, "LIST");
            await expectError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L * (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "NUMBER"; ctx.L = 10; 
            await expectError("L * T"       , LTYPE, "BOOLEAN");
            await expectError("L * F"       , LTYPE, "BOOLEAN");
            await expectError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L * (x->x)"  , LTYPE, "FUNCTION");
            
            var LTYPE = "STRING"; ctx.L = "abc"; 
            await expectError("L * T"       , LTYPE, "BOOLEAN");
            await expectError("L * F"       , LTYPE, "BOOLEAN");
            await expectError("L * 'def'"   , LTYPE, "STRING");
            await expectError("L * [1,2,3]" , LTYPE, "LIST");
            await expectError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L * (x->x)"  , LTYPE, "FUNCTION");
            
            var LTYPE = "LIST"; ctx.L = [1,2,3]; 
            await expectError("L * T"       , LTYPE, "BOOLEAN");
            await expectError("L * F"       , LTYPE, "BOOLEAN");
            await expectError("L * 'abc'"   , LTYPE, "STRING");
            await expectError("L * [4,5]"   , LTYPE, "LIST");
            await expectError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L * (x->x)"  , LTYPE, "FUNCTION");
            
            var LTYPE = "NAMESPACE"; ctx.L = {a:1,b:2}; 
            await expectError("L * T"       , LTYPE, "BOOLEAN");
            await expectError("L * F"       , LTYPE, "BOOLEAN");
            await expectError("L * 1"       , LTYPE, "NUMBER");
            await expectError("L * 'abc'"   , LTYPE, "STRING");
            await expectError("L * [1,2,3]" , LTYPE, "LIST");
            await expectError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L * (x->x)"  , LTYPE, "FUNCTION");
            
            var LTYPE = "FUNCTION"; ctx.L = x=>x; 
            await expectError("L * T"       , LTYPE, "BOOLEAN");
            await expectError("L * F"       , LTYPE, "BOOLEAN");
            await expectError("L * 1"       , LTYPE, "NUMBER");
            await expectError("L * 'abc'"   , LTYPE, "STRING");
            await expectError("L * [1,2,3]" , LTYPE, "LIST");
            await expectError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L * (x->x)"  , LTYPE, "FUNCTION");
        });
        
        it("should return (x1*y1, x2*y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            await expectTuple(ctx, "(T, 3, 'a', [1]) * (F, 2, 2, 2)", [false, 6, "aa", [1,1]]);
            await expectTuple(ctx, "(10,20,30) * (2,3,4)", [20,60,120]);
            await expectTuple(ctx, "(10,20,30) * (2,3)"  , [20,60,null]);
            await expectTuple(ctx, "(10,20) * (2,3,4)"   , [20,60,null]);
            await expectTuple(ctx, "10 * (2,3,4)"        , [20,null,null]);
            await expectTuple(ctx, "(10,20,30) * 2"      , [20,null,null]);
        });
    });

    describe("X / Y", () => {
        
        it("should return nothing if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "() / ()"     , null);
            await expectValue(ctx, "() / T"      , null);
            await expectValue(ctx, "() / F"      , null);
            await expectValue(ctx, "() / 10"     , null);
            await expectValue(ctx, "() / 'abc'"  , null);
            await expectValue(ctx, "() / fn"     , null);
            await expectValue(ctx, "() / ls"     , null);
            await expectValue(ctx, "() / ns"     , null);
        });
        
        it("should return `X/Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "10 / 2"     , 5);
            await expectValue(ctx, "20 / 0"     , Infinity);
            await expectValue(ctx, "10 / (-2)"  , -5);
        });
        
        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectError = (expression, XType, YType) => expectRuntimeError(ctx, ()=>evaluate(expression,ctx), `Division operation not defined between ${XType} and ${YType}`);

            var LTYPE = "BOOLEAN"; ctx.L = ctx.T; 
            await expectError("L / ()"      , LTYPE, "NOTHING");
            await expectError("L / T"       , LTYPE, "BOOLEAN");
            await expectError("L / F"       , LTYPE, "BOOLEAN");
            await expectError("L / 1"       , LTYPE, "NUMBER");
            await expectError("L / 'abc'"   , LTYPE, "STRING");
            await expectError("L / [1,2,3]" , LTYPE, "LIST");
            await expectError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L / (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "BOOLEAN"; ctx.L = ctx.F; 
            await expectError("L / ()"      , LTYPE, "NOTHING");
            await expectError("L / T"       , LTYPE, "BOOLEAN");
            await expectError("L / F"       , LTYPE, "BOOLEAN");
            await expectError("L / 1"       , LTYPE, "NUMBER");
            await expectError("L / 'abc'"   , LTYPE, "STRING");
            await expectError("L / [1,2,3]" , LTYPE, "LIST");
            await expectError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L / (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "NUMBER"; ctx.L = 10; 
            await expectError("L / ()"      , LTYPE, "NOTHING");
            await expectError("L / T"       , LTYPE, "BOOLEAN");
            await expectError("L / F"       , LTYPE, "BOOLEAN");
            await expectError("L / 'abc'"   , LTYPE, "STRING");
            await expectError("L / [1,2,3]" , LTYPE, "LIST");
            await expectError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L / (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "STRING"; ctx.L = "abc"; 
            await expectError("L / ()"      , LTYPE, "NOTHING");
            await expectError("L / T"       , LTYPE, "BOOLEAN");
            await expectError("L / F"       , LTYPE, "BOOLEAN");
            await expectError("L / 1"       , LTYPE, "NUMBER");
            await expectError("L / 'abc'"   , LTYPE, "STRING");
            await expectError("L / [1,2,3]" , LTYPE, "LIST");
            await expectError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L / (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "LIST"; ctx.L = [1,2,3]; 
            await expectError("L / ()"      , LTYPE, "NOTHING");
            await expectError("L / T"       , LTYPE, "BOOLEAN");
            await expectError("L / F"       , LTYPE, "BOOLEAN");
            await expectError("L / 1"       , LTYPE, "NUMBER");
            await expectError("L / 'abc'"   , LTYPE, "STRING");
            await expectError("L / [1,2,3]" , LTYPE, "LIST");
            await expectError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L / (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "NAMESPACE"; ctx.L = {a:1}; 
            await expectError("L / ()"      , LTYPE, "NOTHING");
            await expectError("L / T"       , LTYPE, "BOOLEAN");
            await expectError("L / F"       , LTYPE, "BOOLEAN");
            await expectError("L / 1"       , LTYPE, "NUMBER");
            await expectError("L / 'abc'"   , LTYPE, "STRING");
            await expectError("L / [1,2,3]" , LTYPE, "LIST");
            await expectError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L / (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "FUNCTION"; ctx.L = x=>x; 
            await expectError("L / ()"      , LTYPE, "NOTHING");
            await expectError("L / T"       , LTYPE, "BOOLEAN");
            await expectError("L / F"       , LTYPE, "BOOLEAN");
            await expectError("L / 1"       , LTYPE, "NUMBER");
            await expectError("L / 'abc'"   , LTYPE, "STRING");
            await expectError("L / [1,2,3]" , LTYPE, "LIST");
            await expectError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L / (x->x)"  , LTYPE, "FUNCTION");
        });
        
        it("should return (x1/y1, x2/y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            var expectError = (expression, XType, YType) => expectRuntimeError(ctx, ()=>evaluate(expression,ctx), `Division operation not defined between ${XType} and ${YType}`);
            await expectTuple(ctx, "(10,20,30) / (2,5,3)", [5,4,10]);
            await expectTuple(ctx, "(10,20) / (2,5,3)"   , [5,4,null]);
            await expectTuple(ctx, "10 / (2,5,3)"        , [5,null,null]);
            await expectTuple(ctx, "() / (2,4,3)"        , [null,null,null]);
            await expectError("(10,20,30) / (2,4)"       , "NUMBER","NOTHING");
            await expectError("(10,20,30) / 2"           , "NUMBER","NOTHING");
        });
    });
    
    describe("X ^ Y", () => {
        
        it("should return nothing if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "() ^ ()"     , null);
            await expectValue(ctx, "() ^ T"      , null);
            await expectValue(ctx, "() ^ F"      , null);
            await expectValue(ctx, "() ^ 10"     , null);
            await expectValue(ctx, "() ^ 'abc'"  , null);
            await expectValue(ctx, "() ^ fn"     , null);
            await expectValue(ctx, "() ^ ls"     , null);
            await expectValue(ctx, "() ^ ns"     , null);
        });
        
        it("should return `X**Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            await expectValue(ctx, "10 ^ 2"     , 100);
            await expectValue(ctx, "20 ^ 0"     , 1);
            await expectValue(ctx, "10 ^ (-2)"  , 0.01);
        });
        
        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectError = (expression, XType, YType) => expectRuntimeError(ctx, ()=>evaluate(expression,ctx), `Exponentiation operation not defined between ${XType} and ${YType}`);

            var LTYPE = "BOOLEAN"; ctx.L = ctx.T; 
            await expectError("L ^ ()"      , LTYPE, "NOTHING");
            await expectError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectError("L ^ 1"       , LTYPE, "NUMBER");
            await expectError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L ^ (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "BOOLEAN"; ctx.L = ctx.F; 
            await expectError("L ^ ()"      , LTYPE, "NOTHING");
            await expectError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectError("L ^ 1"       , LTYPE, "NUMBER");
            await expectError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L ^ (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "NUMBER"; ctx.L = 10; 
            await expectError("L ^ ()"      , LTYPE, "NOTHING");
            await expectError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L ^ (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "STRING"; ctx.L = "abc"; 
            await expectError("L ^ ()"      , LTYPE, "NOTHING");
            await expectError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectError("L ^ 1"       , LTYPE, "NUMBER");
            await expectError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L ^ (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "LIST"; ctx.L = [1,2,3]; 
            await expectError("L ^ ()"      , LTYPE, "NOTHING");
            await expectError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectError("L ^ 1"       , LTYPE, "NUMBER");
            await expectError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L ^ (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "NAMESPACE"; ctx.L = {a:1}; 
            await expectError("L ^ ()"      , LTYPE, "NOTHING");
            await expectError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectError("L ^ 1"       , LTYPE, "NUMBER");
            await expectError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L ^ (x->x)"  , LTYPE, "FUNCTION");

            var LTYPE = "FUNCTION"; ctx.L = x=>x; 
            await expectError("L ^ ()"      , LTYPE, "NOTHING");
            await expectError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectError("L ^ 1"       , LTYPE, "NUMBER");
            await expectError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectError("L ^ (x->x)"  , LTYPE, "FUNCTION");
        });
        
        it("should return (x1^y1, x2^y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            var expectError = (expression, XType, YType) => expectRuntimeError(ctx, ()=>evaluate(expression,ctx), `Exponentiation operation not defined between ${XType} and ${YType}`);
            await expectTuple(ctx, "(10,20,30) ^ (2,3,4)", [10**2,20**3,30**4]);
            await expectTuple(ctx, "(10,20) ^ (2,3,4)"   , [10**2,20**3,null]);
            await expectTuple(ctx, "10 ^ (2,3,4)"        , [10**2,null,null]);
            await expectTuple(ctx, "() ^ (2,3,4)"        , [null,null,null]);
            await expectError("(10,20,30) ^ (2,4)"       , "NUMBER","NOTHING");
            await expectError("(10,20,30) ^ 2"           , "NUMBER","NOTHING");
        });
    });

    describe("int X", () => {

        it("should return the integer part of X if it is a number", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "int 10.2", 10);
            await expectValue(ctx, "int 10.9", 10);
            await expectValue(ctx, "int 0", 0);
            await expectValue(ctx, "int (-10.2)", -10);
            await expectValue(ctx, "int (-10.9)", -10);
        });
        
        it("should return the size of X if it is not a number", async () => {
            var ctx = createContext({T:true, F:false, jsFn:x=>2*x});
            await expectValue(ctx, "int F", 0);
            await expectValue(ctx, "int T", 1);
            await expectValue(ctx, "int 'abc'", 3);
            await expectValue(ctx, "int ''", 0);
            await expectValue(ctx, "int [10,20,30]", 3);
            await expectValue(ctx, "int []", 0);
            await expectValue(ctx, "int {a=1,b=2,c=3}", 3);
            await expectValue(ctx, "int {}", 0);
            await expectValue(ctx, "int (x -> 2*x+1)", 5);
            await expectValue(ctx, "int (x -> ())", 0);
            await expectValue(ctx, "int jsFn", ctx.jsFn.toString().length);
            await expectValue(ctx, "int(2,'abc',[1,2,3,4])", 9);            
        });
    });
    
    describe("X == Y", () => {
        
        it("should return true if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "() == ()", true);            
        });

        it("should return true if X and Y are both true or both false", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "T == T", true);            
            await expectValue(ctx, "F == F", true);            
            await expectValue(ctx, "T == F", false);            
            await expectValue(ctx, "F == T", false);            
        });

        it("should return true if X and Y are the same number", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "3 == 3"  , true);            
            await expectValue(ctx, "0 == 0"  , true);            
            await expectValue(ctx, "-3 == -3", true);            
            await expectValue(ctx, "3 == 2"  , false);            
            await expectValue(ctx, "0 == -4" , false);            
        });

        it("should return true if X and Y are the same string", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "'abc' == 'abc'", true);            
            await expectValue(ctx, "'' == ''"      , true);            
            await expectValue(ctx, "'abc' == 'def'", false);                        
            await expectValue(ctx, "'abc' == ''"   , false);                        
        });
        
        it("should return true if X and Y are both lists with equal items", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "[1,2,3] == [1,2,3]", true);                        
            await expectValue(ctx, "[] == []"          , true);            
            await expectValue(ctx, "[1,2,3] == [4,5,6]", false);                        
            await expectValue(ctx, "[1,2,3] == []"     , false);                        
        });

        it("should return true if X and Y are both namespace with sname name:value pairs", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "{a=1,b=2} == {a=1,b=2}", true);                        
            await expectValue(ctx, "{} == {}"              , true);            
            await expectValue(ctx, "{a=1,b=2} == {a=1,c=2}", false);                        
            await expectValue(ctx, "{a=1,b=2} == {a=1,b=3}", false);                        
            await expectValue(ctx, "{a=1,b=2} == {a=1}"    , false);                        
            await expectValue(ctx, "{a=1,b=2} == {}"       , false);                        
            await expectValue(ctx, "{a=1} == {a=1,b=2}"    , false);                        
            await expectValue(ctx, "{} == {a=1,b=2}"       , false);                        
        });

        it("should compare str X with str Y if both X and Y are functions", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(x->2*x) == (x->2*x)", true);                                    
            await expectValue(ctx, "fn == fn"            , true);                                    
            await expectValue(ctx, "(x->2*x) == (x->3*x)", false);                                    
            await expectValue(ctx, "(x->2*x) == fn"      , false);                                    
            await expectValue(ctx, "fn == (x->2*x)"      , false);                                    
        });
        
        it("should return false if X and Y are of different types", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});

            await expectValue(ctx, "() == T"    , false);                                    
            await expectValue(ctx, "() == F"    , false);                                    
            await expectValue(ctx, "() == 1"    , false);                                    
            await expectValue(ctx, "() == 'abc'", false);                                    
            await expectValue(ctx, "() == ls"   , false);                                    
            await expectValue(ctx, "() == ns"   , false);                                    
            await expectValue(ctx, "() == fn"   , false);                                    
            
            await expectValue(ctx, "T == ()"   , false);                                    
            await expectValue(ctx, "T == 1"    , false);                                    
            await expectValue(ctx, "T == 'abc'", false);                                    
            await expectValue(ctx, "T == ls"   , false);                                    
            await expectValue(ctx, "T == ns"   , false);                                    
            await expectValue(ctx, "T == fn"   , false);                                    
            
            await expectValue(ctx, "F == ()"   , false);                                    
            await expectValue(ctx, "F == 1"    , false);                                    
            await expectValue(ctx, "F == 'abc'", false);                                    
            await expectValue(ctx, "F == ls"   , false);                                    
            await expectValue(ctx, "F == ns"   , false);                                    
            await expectValue(ctx, "F == fn"   , false);                                    
            
            await expectValue(ctx, "1 == ()"   , false);                                    
            await expectValue(ctx, "1 == T"    , false);                                    
            await expectValue(ctx, "1 == F"    , false);                                    
            await expectValue(ctx, "1 == 'abc'", false);                                    
            await expectValue(ctx, "1 == ls"   , false);                                    
            await expectValue(ctx, "1 == ns"   , false);                                    
            await expectValue(ctx, "1 == fn"   , false);                                    
            
            await expectValue(ctx, "'abc' == ()" , false);                                    
            await expectValue(ctx, "'abc' == T"  , false);                                    
            await expectValue(ctx, "'abc' == F"  , false);                                    
            await expectValue(ctx, "'abc' == 1"  , false);                                    
            await expectValue(ctx, "'abc' == ls" , false);                                    
            await expectValue(ctx, "'abc' == ns" , false);                                    
            await expectValue(ctx, "'abc' == fn" , false);                                    
            
            await expectValue(ctx, "ls == ()"   , false);                                    
            await expectValue(ctx, "ls == T"    , false);                                    
            await expectValue(ctx, "ls == F"    , false);                                    
            await expectValue(ctx, "ls == 1"    , false);                                    
            await expectValue(ctx, "ls == 'abc'", false);                                    
            await expectValue(ctx, "ls == ns"   , false);                                    
            await expectValue(ctx, "ls == fn"   , false);                                    
            
            await expectValue(ctx, "ns == ()"   , false);                                    
            await expectValue(ctx, "ns == T"    , false);                                    
            await expectValue(ctx, "ns == F"    , false);                                    
            await expectValue(ctx, "ns == 1"    , false);                                    
            await expectValue(ctx, "ns == 'abc'", false);                                    
            await expectValue(ctx, "ns == ls"   , false);                                    
            await expectValue(ctx, "ns == fn"   , false);                                    
            
            await expectValue(ctx, "fn == ()"   , false);                                    
            await expectValue(ctx, "fn == T"    , false);                                    
            await expectValue(ctx, "fn == F"    , false);                                    
            await expectValue(ctx, "fn == 1"    , false);                                    
            await expectValue(ctx, "fn == 'abc'", false);                                    
            await expectValue(ctx, "fn == ls"   , false);                                    
            await expectValue(ctx, "fn == ns"   , false);                                    
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(1,2,3) == (1,2,3)", true);                        
            await expectValue(ctx, "(1,2,3) == (1,2)"  , false);                        
            await expectValue(ctx, "(1,2) == (1,2,3)"  , false);                                    
            await expectValue(ctx, "1 == (1,2,3)"      , false);                                    
            await expectValue(ctx, "(1,2,3) == 1"      , false);                                    
        });
    });
    
    describe("X != Y", () => {
        
        it("should return false if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "() != ()", false);            
        });

        it("should return false if X and Y are both false or both true", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "T != T", false);            
            await expectValue(ctx, "F != F", false);            
            await expectValue(ctx, "T != F", true);            
            await expectValue(ctx, "F != T", true);            
        });

        it("should return false if X and Y are the same number", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "3 != 3"  , false);            
            await expectValue(ctx, "0 != 0"  , false);            
            await expectValue(ctx, "-3 != -3", false);            
            await expectValue(ctx, "3 != 2"  , true);            
            await expectValue(ctx, "0 != -4" , true);            
        });

        it("should return false if X and Y are the same string", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "'abc' != 'abc'", false);            
            await expectValue(ctx, "'' != ''"      , false);            
            await expectValue(ctx, "'abc' != 'def'", true);                        
            await expectValue(ctx, "'abc' != ''"   , true);                        
        });
        
        it("should return false if X and Y are both lists with equal items", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "[1,2,3] != [1,2,3]", false);                        
            await expectValue(ctx, "[] != []"          , false);            
            await expectValue(ctx, "[1,2,3] != [4,5,6]", true);                        
            await expectValue(ctx, "[1,2,3] != []"     , true);                        
        });

        it("should return false if X and Y are both namespace with sname name:value pairs", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "{a=1,b=2} != {a=1,b=2}", false);                        
            await expectValue(ctx, "{} != {}"              , false);            
            await expectValue(ctx, "{a=1,b=2} != {a=1,c=2}", true);                        
            await expectValue(ctx, "{a=1,b=2} != {a=1,b=3}", true);                        
            await expectValue(ctx, "{a=1,b=2} != {a=1}"    , true);                        
            await expectValue(ctx, "{a=1,b=2} != {}"       , true);                        
            await expectValue(ctx, "{a=1} != {a=1,b=2}"    , true);                        
            await expectValue(ctx, "{} != {a=1,b=2}"       , true);                        
        });

        it("should compare str X with str Y if both X and Y are functions", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(x->2*x) != (x->2*x)", false);                                    
            await expectValue(ctx, "fn != fn"            , false);                                    
            await expectValue(ctx, "(x->2*x) != (x->3*x)", true);                                    
            await expectValue(ctx, "(x->2*x) != fn"      , true);                                    
            await expectValue(ctx, "fn != (x->2*x)"      , true);                                    
        });
        
        it("should return true if X and Y are of different types", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});

            await expectValue(ctx, "() != T"    , true);                                    
            await expectValue(ctx, "() != F"    , true);                                    
            await expectValue(ctx, "() != 1"    , true);                                    
            await expectValue(ctx, "() != 'abc'", true);                                    
            await expectValue(ctx, "() != ls"   , true);                                    
            await expectValue(ctx, "() != ns"   , true);                                    
            await expectValue(ctx, "() != fn"   , true);                                    
            
            await expectValue(ctx, "T != ()"   , true);                                    
            await expectValue(ctx, "T != 1"    , true);                                    
            await expectValue(ctx, "T != 'abc'", true);                                    
            await expectValue(ctx, "T != ls"   , true);                                    
            await expectValue(ctx, "T != ns"   , true);                                    
            await expectValue(ctx, "T != fn"   , true);                                    
            
            await expectValue(ctx, "F != ()"   , true);                                    
            await expectValue(ctx, "F != 1"    , true);                                    
            await expectValue(ctx, "F != 'abc'", true);                                    
            await expectValue(ctx, "F != ls"   , true);                                    
            await expectValue(ctx, "F != ns"   , true);                                    
            await expectValue(ctx, "F != fn"   , true);                                    
            
            await expectValue(ctx, "1 != ()"   , true);                                    
            await expectValue(ctx, "1 != T"    , true);                                    
            await expectValue(ctx, "1 != F"    , true);                                    
            await expectValue(ctx, "1 != 'abc'", true);                                    
            await expectValue(ctx, "1 != ls"   , true);                                    
            await expectValue(ctx, "1 != ns"   , true);                                    
            await expectValue(ctx, "1 != fn"   , true);                                    
            
            await expectValue(ctx, "'abc' != ()" , true);                                    
            await expectValue(ctx, "'abc' != T"  , true);                                    
            await expectValue(ctx, "'abc' != F"  , true);                                    
            await expectValue(ctx, "'abc' != 1"  , true);                                    
            await expectValue(ctx, "'abc' != ls" , true);                                    
            await expectValue(ctx, "'abc' != ns" , true);                                    
            await expectValue(ctx, "'abc' != fn" , true);                                    
            
            await expectValue(ctx, "ls != ()"   , true);                                    
            await expectValue(ctx, "ls != T"    , true);                                    
            await expectValue(ctx, "ls != F"    , true);                                    
            await expectValue(ctx, "ls != 1"    , true);                                    
            await expectValue(ctx, "ls != 'abc'", true);                                    
            await expectValue(ctx, "ls != ns"   , true);                                    
            await expectValue(ctx, "ls != fn"   , true);                                    
            
            await expectValue(ctx, "ns != ()"   , true);                                    
            await expectValue(ctx, "ns != T"    , true);                                    
            await expectValue(ctx, "ns != F"    , true);                                    
            await expectValue(ctx, "ns != 1"    , true);                                    
            await expectValue(ctx, "ns != 'abc'", true);                                    
            await expectValue(ctx, "ns != ls"   , true);                                    
            await expectValue(ctx, "ns != fn"   , true);                                    
            
            await expectValue(ctx, "fn != ()"   , true);                                    
            await expectValue(ctx, "fn != T"    , true);                                    
            await expectValue(ctx, "fn != F"    , true);                                    
            await expectValue(ctx, "fn != 1"    , true);                                    
            await expectValue(ctx, "fn != 'abc'", true);                                    
            await expectValue(ctx, "fn != ls"   , true);                                    
            await expectValue(ctx, "fn != ns"   , true);                                    
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(1,2,3) != (1,2,3)", false);                        
            await expectValue(ctx, "(1,2,3) != (1,2)"  , true);                        
            await expectValue(ctx, "(1,2) != (1,2,3)"  , true);                                    
            await expectValue(ctx, "1 != (1,2,3)"      , true);                                    
            await expectValue(ctx, "(1,2,3) != 1"      , true);                                    
        });
    });    

    describe("X < Y", () => {
        
        it("should return false if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "() < ()", false);            
        });

        it("should return true if X is false and Y is true", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "T < T", false);            
            await expectValue(ctx, "F < F", false);            
            await expectValue(ctx, "T < F", false);            
            await expectValue(ctx, "F < T", true);            
        });

        it("should return true if X is a lower number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "1 < 2"   , true);            
            await expectValue(ctx, "0 < 2"   , true);            
            await expectValue(ctx, "-1 < 2"  , true);            
            await expectValue(ctx, "2 < 1"   , false);            
            await expectValue(ctx, "2 < 0"   , false);            
            await expectValue(ctx, "2 < (-2)", false);            
            await expectValue(ctx, "2 < 2"   , false);            
        });

        it("should return true if X and Y are both strings and X precedes Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "'abc' < 'def'", true);            
            await expectValue(ctx, "'abc' < 'abd'", true);            
            await expectValue(ctx, "'ab' < 'abc'" , true);            
            await expectValue(ctx, "'' < 'abc'"   , true);            
            await expectValue(ctx, "'abc' < 'abc'", false);                        
            await expectValue(ctx, "'abd' < 'abc'", false);                        
            await expectValue(ctx, "'abc' < 'ab'" , false);                        
            await expectValue(ctx, "'abc' < ''"   , false);                        
        });
        
        it("should return true if X and Y are both lists and X precedes Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "[1,2,3] < [4,5,6]", true);            
            await expectValue(ctx, "[1,2,3] < [1,2,4]", true);            
            await expectValue(ctx, "[1,2] < [1,2,4]"  , true);            
            await expectValue(ctx, "[] < [1,2,3]"     , true);            
            await expectValue(ctx, "[1,2,3] < [1,2,3]", false);                        
            await expectValue(ctx, "[1,2,4] < [1,2,3]", false);                        
            await expectValue(ctx, "[1,2,4] < [1,2]"  , false);                        
            await expectValue(ctx, "[1,2,3] < []"     , false);                        
        });

        it("should return true if X and Y are both namespaces and X precedes Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "{a=1,b=2} < {a=3,b=4}", true);            
            await expectValue(ctx, "{a=1,b=2} < {c=1,d=2}", true);            
            await expectValue(ctx, "{a=1} < {a=1,b=2}"    , true);            
            await expectValue(ctx, "{a=1} < {a=1,b=2}"    , true);            
            await expectValue(ctx, "{} < {a=1,b=2}"       , true);            
            await expectValue(ctx, "{a=1,b=2} < {a=1,b=2}", false);            
            await expectValue(ctx, "{a=3,b=4} < {a=1,b=2}", false);            
            await expectValue(ctx, "{c=1,d=2} < {a=1,b=2}", false);            
            await expectValue(ctx, "{a=1,b=2} < {a=1}"    , false);            
            await expectValue(ctx, "{a=1,b=2} < {a=1}"    , false);            
            await expectValue(ctx, "{a=1,b=2} < {}"       , false);            
        });

        it("should compare str X with str Y if both X and Y are functions", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(x->2*x) < (x->2*x)", false);                                    
            await expectValue(ctx, "(x->2*x) < (x->3*x)", true);                                    
            await expectValue(ctx, "(x->3*x) < (x->2*x)", false);                                    
        });
        
        it("should order differnt type as follows: NOTHING < BOOLEAN < NUMBER < STRING < LIST < NAMESPACE < FUNCTION", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});

            await expectValue(ctx, "() < T"    , true);                                    
            await expectValue(ctx, "() < F"    , true);                                    
            await expectValue(ctx, "() < 1"    , true);                                    
            await expectValue(ctx, "() < 'abc'", true);                                    
            await expectValue(ctx, "() < ls"   , true);                                    
            await expectValue(ctx, "() < ns"   , true);                                    
            await expectValue(ctx, "() < fn"   , true);                                    
            
            await expectValue(ctx, "T < ()"   , false);                                    
            await expectValue(ctx, "T < 1"    , true);                                    
            await expectValue(ctx, "T < 'abc'", true);                                    
            await expectValue(ctx, "T < ls"   , true);                                    
            await expectValue(ctx, "T < ns"   , true);                                    
            await expectValue(ctx, "T < fn"   , true);                                    
            
            await expectValue(ctx, "F < ()"   , false);                                    
            await expectValue(ctx, "F < 1"    , true);                                    
            await expectValue(ctx, "F < 'abc'", true);                                    
            await expectValue(ctx, "F < ls"   , true);                                    
            await expectValue(ctx, "F < ns"   , true);                                    
            await expectValue(ctx, "F < fn"   , true);                                    
            
            await expectValue(ctx, "1 < ()"   , false);                                    
            await expectValue(ctx, "1 < T"    , false);                                    
            await expectValue(ctx, "1 < F"    , false);                                    
            await expectValue(ctx, "1 < 'abc'", true);                                    
            await expectValue(ctx, "1 < ls"   , true);                                    
            await expectValue(ctx, "1 < ns"   , true);                                    
            await expectValue(ctx, "1 < fn"   , true);                                    

            await expectValue(ctx, "'abc' < ()" , false);                                    
            await expectValue(ctx, "'abc' < T"  , false);                                    
            await expectValue(ctx, "'abc' < F"  , false);                                    
            await expectValue(ctx, "'abc' < 1"  , false);                                    
            await expectValue(ctx, "'abc' < ls" , true);                                    
            await expectValue(ctx, "'abc' < ns" , true);                                    
            await expectValue(ctx, "'abc' < fn" , true);                                    

            await expectValue(ctx, "ls < ()"   , false);                                    
            await expectValue(ctx, "ls < T"    , false);                                    
            await expectValue(ctx, "ls < F"    , false);                                    
            await expectValue(ctx, "ls < 1"    , false);                                    
            await expectValue(ctx, "ls < 'abc'", false);                                    
            await expectValue(ctx, "ls < ns"   , true);                                    
            await expectValue(ctx, "ls < fn"   , true);                                    

            await expectValue(ctx, "ns < ()"   , false);                                    
            await expectValue(ctx, "ns < T"    , false);                                    
            await expectValue(ctx, "ns < F"    , false);                                    
            await expectValue(ctx, "ns < 1"    , false);                                    
            await expectValue(ctx, "ns < 'abc'", false);                                    
            await expectValue(ctx, "ns < ls"   , false);                                    
            await expectValue(ctx, "ns < fn"   , true);                                    

            await expectValue(ctx, "fn < ()"   , false);                                    
            await expectValue(ctx, "fn < T"    , false);                                    
            await expectValue(ctx, "fn < F"    , false);                                    
            await expectValue(ctx, "fn < 1"    , false);                                    
            await expectValue(ctx, "fn < 'abc'", false);                                    
            await expectValue(ctx, "fn < ls"   , false);                                    
            await expectValue(ctx, "fn < ns"   , false);                                    
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(1,2,3) < (4,5,6)", true);            
            await expectValue(ctx, "(1,2,3) < (1,2,4)", true);            
            await expectValue(ctx, "(1,2) < (1,2,4)"  , true);            
            await expectValue(ctx, "() < (1,2,3)"     , true);            
            await expectValue(ctx, "(1,2,3) < (1,2,3)", false);                        
            await expectValue(ctx, "(1,2,4) < (1,2,3)", false);                        
            await expectValue(ctx, "(1,2,4) < (1,2)"  , false);                        
            await expectValue(ctx, "(1,2,3) < ()"     , false);                        
        });
    });
    
    describe("X >= Y", () => {
        
        it("should return true if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "() >= ()", true);            
        });

        it("should return false if X is false and Y is true", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "T >= T", true);            
            await expectValue(ctx, "F >= F", true);     
            await expectValue(ctx, "T >= F", true);            
            await expectValue(ctx, "F >= T", false);            
        });

        it("should return false if X is a lower number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "1 >= 2"   , false);            
            await expectValue(ctx, "0 >= 2"   , false);            
            await expectValue(ctx, "-1 >= 2"  , false);            
            await expectValue(ctx, "2 >= 1"   , true);            
            await expectValue(ctx, "2 >= 0"   , true);            
            await expectValue(ctx, "2 >= (-2)", true);            
            await expectValue(ctx, "2 >= 2"   , true);            
        });

        it("should return false if X and Y are both strings and X precedes Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "'abc' >= 'def'", false);            
            await expectValue(ctx, "'abc' >= 'abd'", false);            
            await expectValue(ctx, "'ab' >= 'abc'" , false);            
            await expectValue(ctx, "'' >= 'abc'"   , false);            
            await expectValue(ctx, "'abc' >= 'abc'", true);                        
            await expectValue(ctx, "'abd' >= 'abc'", true);                        
            await expectValue(ctx, "'abc' >= 'ab'" , true);                        
            await expectValue(ctx, "'abc' >= ''"   , true);                        
        });
        
        it("should return false if X and Y are both lists and X precedes Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "[1,2,3] >= [4,5,6]", false);            
            await expectValue(ctx, "[1,2,3] >= [1,2,4]", false);            
            await expectValue(ctx, "[1,2] >= [1,2,4]"  , false);            
            await expectValue(ctx, "[] >= [1,2,3]"     , false);            
            await expectValue(ctx, "[1,2,3] >= [1,2,3]", true);                        
            await expectValue(ctx, "[1,2,4] >= [1,2,3]", true);                        
            await expectValue(ctx, "[1,2,4] >= [1,2]"  , true);                        
            await expectValue(ctx, "[1,2,3] >= []"     , true);                        
        });

        it("should return false if X and Y are both namespaces and X precedes Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "{a=1,b=2} >= {a=3,b=4}", false);            
            await expectValue(ctx, "{a=1,b=2} >= {c=1,d=2}", false);            
            await expectValue(ctx, "{a=1} >= {a=1,b=2}"    , false);            
            await expectValue(ctx, "{a=1} >= {a=1,b=2}"    , false);            
            await expectValue(ctx, "{} >= {a=1,b=2}"       , false);            
            await expectValue(ctx, "{a=1,b=2} >= {a=1,b=2}", true);            
            await expectValue(ctx, "{a=3,b=4} >= {a=1,b=2}", true);            
            await expectValue(ctx, "{c=1,d=2} >= {a=1,b=2}", true);            
            await expectValue(ctx, "{a=1,b=2} >= {a=1}"    , true);            
            await expectValue(ctx, "{a=1,b=2} >= {a=1}"    , true);            
            await expectValue(ctx, "{a=1,b=2} >= {}"       , true);            
        });

        it("should compare str X with str Y if both X and Y are functions", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(x->2*x) >= (x->2*x)", true);                                    
            await expectValue(ctx, "(x->2*x) >= (x->3*x)", false);                                    
            await expectValue(ctx, "(x->3*x) >= (x->2*x)", true);                                    
        });
        
        it("should order differnt type as follows: NOTHING >= BOOLEAN >= NUMBER >= STRING >= LIST >= NAMESPACE >= FUNCTION", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});

            await expectValue(ctx, "() >= T"    , false);                                    
            await expectValue(ctx, "() >= F"    , false);                                    
            await expectValue(ctx, "() >= 1"    , false);                                    
            await expectValue(ctx, "() >= 'abc'", false);                                    
            await expectValue(ctx, "() >= ls"   , false);                                    
            await expectValue(ctx, "() >= ns"   , false);                                    
            await expectValue(ctx, "() >= fn"   , false);                                    
            
            await expectValue(ctx, "T >= ()"   , true);                                    
            await expectValue(ctx, "T >= 1"    , false);                                    
            await expectValue(ctx, "T >= 'abc'", false);                                    
            await expectValue(ctx, "T >= ls"   , false);                                    
            await expectValue(ctx, "T >= ns"   , false);                                    
            await expectValue(ctx, "T >= fn"   , false);                                    
            
            await expectValue(ctx, "F >= ()"   , true);                                    
            await expectValue(ctx, "F >= 1"    , false);                                    
            await expectValue(ctx, "F >= 'abc'", false);                                    
            await expectValue(ctx, "F >= ls"   , false);                                    
            await expectValue(ctx, "F >= ns"   , false);                                    
            await expectValue(ctx, "F >= fn"   , false);                                    
            
            await expectValue(ctx, "1 >= ()"   , true);                                    
            await expectValue(ctx, "1 >= T"    , true);                                    
            await expectValue(ctx, "1 >= F"    , true);                                    
            await expectValue(ctx, "1 >= 'abc'", false);                                    
            await expectValue(ctx, "1 >= ls"   , false);                                    
            await expectValue(ctx, "1 >= ns"   , false);                                    
            await expectValue(ctx, "1 >= fn"   , false);                                    

            await expectValue(ctx, "'abc' >= ()" , true);                                    
            await expectValue(ctx, "'abc' >= T"  , true);                                    
            await expectValue(ctx, "'abc' >= F"  , true);                                    
            await expectValue(ctx, "'abc' >= 1"  , true);                                    
            await expectValue(ctx, "'abc' >= ls" , false);                                    
            await expectValue(ctx, "'abc' >= ns" , false);                                    
            await expectValue(ctx, "'abc' >= fn" , false);                                    

            await expectValue(ctx, "ls >= ()"   , true);                                    
            await expectValue(ctx, "ls >= T"    , true);                                    
            await expectValue(ctx, "ls >= F"    , true);                                    
            await expectValue(ctx, "ls >= 1"    , true);                                    
            await expectValue(ctx, "ls >= 'abc'", true);                                    
            await expectValue(ctx, "ls >= ns"   , false);                                    
            await expectValue(ctx, "ls >= fn"   , false);                                    

            await expectValue(ctx, "ns >= ()"   , true);                                    
            await expectValue(ctx, "ns >= T"    , true);                                    
            await expectValue(ctx, "ns >= F"    , true);                                    
            await expectValue(ctx, "ns >= 1"    , true);                                    
            await expectValue(ctx, "ns >= 'abc'", true);                                    
            await expectValue(ctx, "ns >= ls"   , true);                                    
            await expectValue(ctx, "ns >= fn"   , false);                                    

            await expectValue(ctx, "fn >= ()"   , true);                                    
            await expectValue(ctx, "fn >= T"    , true);                                    
            await expectValue(ctx, "fn >= F"    , true);                                    
            await expectValue(ctx, "fn >= 1"    , true);                                    
            await expectValue(ctx, "fn >= 'abc'", true);                                    
            await expectValue(ctx, "fn >= ls"   , true);                                    
            await expectValue(ctx, "fn >= ns"   , true);                                    
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(1,2,3) >= (4,5,6)", false);            
            await expectValue(ctx, "(1,2,3) >= (1,2,4)", false);            
            await expectValue(ctx, "(1,2) >= (1,2,4)"  , false);            
            await expectValue(ctx, "() >= (1,2,3)"     , false);            
            await expectValue(ctx, "(1,2,3) >= (1,2,3)", true);                        
            await expectValue(ctx, "(1,2,4) >= (1,2,3)", true);                        
            await expectValue(ctx, "(1,2,4) >= (1,2)"  , true);                        
            await expectValue(ctx, "(1,2,3) >= ()"     , true);                        
        });
    });    

    describe("X > Y", () => {
        
        it("should return false if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "() > ()", false);            
        });

        it("should return true if X is true and Y is false", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "T > T", false);            
            await expectValue(ctx, "F > F", false);            
            await expectValue(ctx, "T > F", true);            
            await expectValue(ctx, "F > T", false);            
        });

        it("should return true if X is a higher number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "1 > 2"   , false);            
            await expectValue(ctx, "0 > 2"   , false);            
            await expectValue(ctx, "-1 > 2"  , false);            
            await expectValue(ctx, "2 > 1"   , true);            
            await expectValue(ctx, "2 > 0"   , true);            
            await expectValue(ctx, "2 > (-2)", true);            
            await expectValue(ctx, "2 > 2"   , false);            
        });

        it("should return true if X and Y are both strings and X follows Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "'abc' > 'def'", false);            
            await expectValue(ctx, "'abc' > 'abd'", false);            
            await expectValue(ctx, "'ab' > 'abc'" , false);            
            await expectValue(ctx, "'' > 'abc'"   , false);            
            await expectValue(ctx, "'abc' > 'abc'", false);                        
            await expectValue(ctx, "'abd' > 'abc'", true);                        
            await expectValue(ctx, "'abc' > 'ab'" , true);                        
            await expectValue(ctx, "'abc' > ''"   , true);                        
        });
        
        it("should return true if X and Y are both lists and X follows Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "[1,2,3] > [4,5,6]", false);            
            await expectValue(ctx, "[1,2,3] > [1,2,4]", false);            
            await expectValue(ctx, "[1,2] > [1,2,4]"  , false);            
            await expectValue(ctx, "[] > [1,2,3]"     , false);            
            await expectValue(ctx, "[1,2,3] > [1,2,3]", false);                        
            await expectValue(ctx, "[1,2,4] > [1,2,3]", true);                        
            await expectValue(ctx, "[1,2,4] > [1,2]"  , true);                        
            await expectValue(ctx, "[1,2,3] > []"     , true);                        
        });

        it("should return true if X and Y are both namespaces and X follows Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "{a=1,b=2} > {a=3,b=4}", false);            
            await expectValue(ctx, "{a=1,b=2} > {c=1,d=2}", false);            
            await expectValue(ctx, "{a=1} > {a=1,b=2}"    , false);            
            await expectValue(ctx, "{a=1} > {a=1,b=2}"    , false);            
            await expectValue(ctx, "{} > {a=1,b=2}"       , false);            
            await expectValue(ctx, "{a=1,b=2} > {a=1,b=2}", false);            
            await expectValue(ctx, "{a=3,b=4} > {a=1,b=2}", true);            
            await expectValue(ctx, "{c=1,d=2} > {a=1,b=2}", true);            
            await expectValue(ctx, "{a=1,b=2} > {a=1}"    , true);            
            await expectValue(ctx, "{a=1,b=2} > {a=1}"    , true);            
            await expectValue(ctx, "{a=1,b=2} > {}"       , true);            
        });

        it("should compare str X with str Y if both X and Y are functions", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(x->2*x) > (x->2*x)", false);                                    
            await expectValue(ctx, "(x->2*x) > (x->3*x)", false);                                    
            await expectValue(ctx, "(x->3*x) > (x->2*x)", true);                                    
        });
        
        it("should order differnt type as follows: NOTHING > BOOLEAN > NUMBER > STRING > LIST > NAMESPACE > FUNCTION", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});

            await expectValue(ctx, "() > T"    , false);                                    
            await expectValue(ctx, "() > F"    , false);                                    
            await expectValue(ctx, "() > 1"    , false);                                    
            await expectValue(ctx, "() > 'abc'", false);                                    
            await expectValue(ctx, "() > ls"   , false);                                    
            await expectValue(ctx, "() > ns"   , false);                                    
            await expectValue(ctx, "() > fn"   , false);                                    
            
            await expectValue(ctx, "T > ()"   , true);                                    
            await expectValue(ctx, "T > 1"    , false);                                    
            await expectValue(ctx, "T > 'abc'", false);                                    
            await expectValue(ctx, "T > ls"   , false);                                    
            await expectValue(ctx, "T > ns"   , false);                                    
            await expectValue(ctx, "T > fn"   , false);                                    
            
            await expectValue(ctx, "F > ()"   , true);                                    
            await expectValue(ctx, "F > 1"    , false);                                    
            await expectValue(ctx, "F > 'abc'", false);                                    
            await expectValue(ctx, "F > ls"   , false);                                    
            await expectValue(ctx, "F > ns"   , false);                                    
            await expectValue(ctx, "F > fn"   , false);                                    
            
            await expectValue(ctx, "1 > ()"   , true);                                    
            await expectValue(ctx, "1 > T"    , true);                                    
            await expectValue(ctx, "1 > F"    , true);                                    
            await expectValue(ctx, "1 > 'abc'", false);                                    
            await expectValue(ctx, "1 > ls"   , false);                                    
            await expectValue(ctx, "1 > ns"   , false);                                    
            await expectValue(ctx, "1 > fn"   , false);                                    

            await expectValue(ctx, "'abc' > ()" , true);                                    
            await expectValue(ctx, "'abc' > T"  , true);                                    
            await expectValue(ctx, "'abc' > F"  , true);                                    
            await expectValue(ctx, "'abc' > 1"  , true);                                    
            await expectValue(ctx, "'abc' > ls" , false);                                    
            await expectValue(ctx, "'abc' > ns" , false);                                    
            await expectValue(ctx, "'abc' > fn" , false);                                    

            await expectValue(ctx, "ls > ()"   , true);                                    
            await expectValue(ctx, "ls > T"    , true);                                    
            await expectValue(ctx, "ls > F"    , true);                                    
            await expectValue(ctx, "ls > 1"    , true);                                    
            await expectValue(ctx, "ls > 'abc'", true);                                    
            await expectValue(ctx, "ls > ns"   , false);                                    
            await expectValue(ctx, "ls > fn"   , false);                                    

            await expectValue(ctx, "ns > ()"   , true);                                    
            await expectValue(ctx, "ns > T"    , true);                                    
            await expectValue(ctx, "ns > F"    , true);                                    
            await expectValue(ctx, "ns > 1"    , true);                                    
            await expectValue(ctx, "ns > 'abc'", true);                                    
            await expectValue(ctx, "ns > ls"   , true);                                    
            await expectValue(ctx, "ns > fn"   , false);                                    

            await expectValue(ctx, "fn > ()"   , true);                                    
            await expectValue(ctx, "fn > T"    , true);                                    
            await expectValue(ctx, "fn > F"    , true);                                    
            await expectValue(ctx, "fn > 1"    , true);                                    
            await expectValue(ctx, "fn > 'abc'", true);                                    
            await expectValue(ctx, "fn > ls"   , true);                                    
            await expectValue(ctx, "fn > ns"   , true);                                    
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(1,2,3) > (4,5,6)", false);            
            await expectValue(ctx, "(1,2,3) > (1,2,4)", false);            
            await expectValue(ctx, "(1,2) > (1,2,4)"  , false);            
            await expectValue(ctx, "() > (1,2,3)"     , false);            
            await expectValue(ctx, "(1,2,3) > (1,2,3)", false);                        
            await expectValue(ctx, "(1,2,4) > (1,2,3)", true);                        
            await expectValue(ctx, "(1,2,4) > (1,2)"  , true);                        
            await expectValue(ctx, "(1,2,3) > ()"     , true);                        
        });
    });
    
    describe("X <= Y", () => {
        
        it("should return true if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "() <= ()", true);            
        });

        it("should return false if X is true and Y is false", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "T <= T", true);            
            await expectValue(ctx, "F <= F", true);            
            await expectValue(ctx, "T <= F", false);            
            await expectValue(ctx, "F <= T", true);            
        });

        it("should return false if X is a higher number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "1 <= 2"   , true);            
            await expectValue(ctx, "0 <= 2"   , true);            
            await expectValue(ctx, "-1 <= 2"  , true);            
            await expectValue(ctx, "2 <= 1"   , false);            
            await expectValue(ctx, "2 <= 0"   , false);            
            await expectValue(ctx, "2 <= (-2)", false);            
            await expectValue(ctx, "2 <= 2"   , true);            
        });

        it("should return false if X and Y are both strings and X follows Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "'abc' <= 'def'", true);            
            await expectValue(ctx, "'abc' <= 'abd'", true);            
            await expectValue(ctx, "'ab' <= 'abc'" , true);            
            await expectValue(ctx, "'' <= 'abc'"   , true);            
            await expectValue(ctx, "'abc' <= 'abc'", true);                        
            await expectValue(ctx, "'abd' <= 'abc'", false);                        
            await expectValue(ctx, "'abc' <= 'ab'" , false);                        
            await expectValue(ctx, "'abc' <= ''"   , false);                        
        });
        
        it("should return false if X and Y are both lists and X follows Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "[1,2,3] <= [4,5,6]", true);            
            await expectValue(ctx, "[1,2,3] <= [1,2,4]", true);            
            await expectValue(ctx, "[1,2] <= [1,2,4]"  , true);            
            await expectValue(ctx, "[] <= [1,2,3]"     , true);            
            await expectValue(ctx, "[1,2,3] <= [1,2,3]", true);                        
            await expectValue(ctx, "[1,2,4] <= [1,2,3]", false);                        
            await expectValue(ctx, "[1,2,4] <= [1,2]"  , false);                        
            await expectValue(ctx, "[1,2,3] <= []"     , false);                        
        });

        it("should return false if X and Y are both namespaces and X follows Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "{a=1,b=2} <= {a=3,b=4}", true);            
            await expectValue(ctx, "{a=1,b=2} <= {c=1,d=2}", true);            
            await expectValue(ctx, "{a=1} <= {a=1,b=2}"    , true);            
            await expectValue(ctx, "{a=1} <= {a=1,b=2}"    , true);            
            await expectValue(ctx, "{} <= {a=1,b=2}"       , true);            
            await expectValue(ctx, "{a=1,b=2} <= {a=1,b=2}", true);            
            await expectValue(ctx, "{a=3,b=4} <= {a=1,b=2}", false);            
            await expectValue(ctx, "{c=1,d=2} <= {a=1,b=2}", false);            
            await expectValue(ctx, "{a=1,b=2} <= {a=1}"    , false);            
            await expectValue(ctx, "{a=1,b=2} <= {a=1}"    , false);            
            await expectValue(ctx, "{a=1,b=2} <= {}"       , false);            
        });

        it("should compare str X with str Y if both X and Y are functions", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(x->2*x) <= (x->2*x)", true);                                    
            await expectValue(ctx, "(x->2*x) <= (x->3*x)", true);                                    
            await expectValue(ctx, "(x->3*x) <= (x->2*x)", false);                                    
        });
        
        it("should order differnt type as follows: NOTHING <= BOOLEAN <= NUMBER <= STRING <= LIST <= NAMESPACE <= FUNCTION", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});

            await expectValue(ctx, "() <= T"    , true);                                    
            await expectValue(ctx, "() <= F"    , true);                                    
            await expectValue(ctx, "() <= 1"    , true);                                    
            await expectValue(ctx, "() <= 'abc'", true);                                    
            await expectValue(ctx, "() <= ls"   , true);                                    
            await expectValue(ctx, "() <= ns"   , true);                                    
            await expectValue(ctx, "() <= fn"   , true);                                    
            
            await expectValue(ctx, "T <= ()"   , false);                                    
            await expectValue(ctx, "T <= 1"    , true);                                    
            await expectValue(ctx, "T <= 'abc'", true);                                    
            await expectValue(ctx, "T <= ls"   , true);                                    
            await expectValue(ctx, "T <= ns"   , true);                                    
            await expectValue(ctx, "T <= fn"   , true);                                    
            
            await expectValue(ctx, "F <= ()"   , false);                                    
            await expectValue(ctx, "F <= 1"    , true);                                    
            await expectValue(ctx, "F <= 'abc'", true);                                    
            await expectValue(ctx, "F <= ls"   , true);                                    
            await expectValue(ctx, "F <= ns"   , true);                                    
            await expectValue(ctx, "F <= fn"   , true);                                    
            
            await expectValue(ctx, "1 <= ()"   , false);                                    
            await expectValue(ctx, "1 <= T"    , false);                                    
            await expectValue(ctx, "1 <= F"    , false);                                    
            await expectValue(ctx, "1 <= 'abc'", true);                                    
            await expectValue(ctx, "1 <= ls"   , true);                                    
            await expectValue(ctx, "1 <= ns"   , true);                                    
            await expectValue(ctx, "1 <= fn"   , true);                                    

            await expectValue(ctx, "'abc' <= ()" , false);                                    
            await expectValue(ctx, "'abc' <= T"  , false);                                    
            await expectValue(ctx, "'abc' <= F"  , false);                                    
            await expectValue(ctx, "'abc' <= 1"  , false);                                    
            await expectValue(ctx, "'abc' <= ls" , true);                                    
            await expectValue(ctx, "'abc' <= ns" , true);                                    
            await expectValue(ctx, "'abc' <= fn" , true);                                    

            await expectValue(ctx, "ls <= ()"   , false);                                    
            await expectValue(ctx, "ls <= T"    , false);                                    
            await expectValue(ctx, "ls <= F"    , false);                                    
            await expectValue(ctx, "ls <= 1"    , false);                                    
            await expectValue(ctx, "ls <= 'abc'", false);                                    
            await expectValue(ctx, "ls <= ns"   , true);                                    
            await expectValue(ctx, "ls <= fn"   , true);                                    

            await expectValue(ctx, "ns <= ()"   , false);                                    
            await expectValue(ctx, "ns <= T"    , false);                                    
            await expectValue(ctx, "ns <= F"    , false);                                    
            await expectValue(ctx, "ns <= 1"    , false);                                    
            await expectValue(ctx, "ns <= 'abc'", false);                                    
            await expectValue(ctx, "ns <= ls"   , false);                                    
            await expectValue(ctx, "ns <= fn"   , true);                                    

            await expectValue(ctx, "fn <= ()"   , false);                                    
            await expectValue(ctx, "fn <= T"    , false);                                    
            await expectValue(ctx, "fn <= F"    , false);                                    
            await expectValue(ctx, "fn <= 1"    , false);                                    
            await expectValue(ctx, "fn <= 'abc'", false);                                    
            await expectValue(ctx, "fn <= ls"   , false);                                    
            await expectValue(ctx, "fn <= ns"   , false);                                    
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            await expectValue(ctx, "(1,2,3) <= (4,5,6)", true);            
            await expectValue(ctx, "(1,2,3) <= (1,2,4)", true);            
            await expectValue(ctx, "(1,2) <= (1,2,4)"  , true);            
            await expectValue(ctx, "() <= (1,2,3)"     , true);            
            await expectValue(ctx, "(1,2,3) <= (1,2,3)", true);                        
            await expectValue(ctx, "(1,2,4) <= (1,2,3)", false);                        
            await expectValue(ctx, "(1,2,4) <= (1,2)"  , false);                        
            await expectValue(ctx, "(1,2,3) <= ()"     , false);                        
        });
    });

    describe("map (fn, items)", () => {
        
        it("should return a tuple obtained by applying the passed function to each of the given items", async () => {
            var ctx = createContext({T:true, F:false, fn:x=>2*x});
            await expectTuple(ctx, "map(fn,1,2,3,4)", [2,4,6,8]);            
        });

        it("should return a mapping function if no items are provided", async () => {
            var ctx = createContext({T:true, F:false, fn:x=>2*x});
            ctx.mapFn = await evaluate("map fn", ctx);
            expect(ctx.mapFn).to.be.a("function");
            await expectTuple(ctx, "mapFn (1,2,3,4)", [2,4,6,8]);            
            await expectTuple(ctx, "map fn (1,2,3,4)", [2,4,6,8]);            
            await expectTuple(ctx, "map (x->2*x) (1,2,3,4)", [2,4,6,8]); 
        });
        
        it("should throw a runtime error if the first parameter is not a function", async () => {
            var ctx = createContext({T:true, F:false, fn:x=>2*x});
            var expectError = (expression) => expectRuntimeError(ctx, ()=>evaluate(expression,ctx), "Function required as first argument of map");
            await expectError("map ()");
            await expectError("map F");
            await expectError("map T");
            await expectError("map 1");
            await expectError("map 'abc'");
            await expectError("map [1,2,3]");
            await expectError("map {a=1}");
            await expectError("map (1,2,3)");
        });
    });

    describe("fil (testFn, items)", () => {
        
        it("should return only the items that pass the testFn", async () => {
            var ctx = createContext({T:true, F:false, fn:x=>x>0});
            await expectTuple(ctx, "fil (fn, -1,2,0,4)", [2,4]);            
            await expectTuple(ctx, "fil (x->x>0, -1,2,0,4)", [2,4]);            
        });

        it("should return a filterFunction if no items are provided", async () => {
            var ctx = createContext({T:true, F:false, fn:x=>x>0});
            ctx.filFn = await evaluate("fil fn", ctx);
            expect(ctx.filFn).to.be.a("function");
            var tuple = await ctx.filFn(2,-1,0,4);
            expect(Array.from(tuple)).to.deep.equal([2,4]);
            
            await expectTuple(ctx, "fil (x->x>0) (-1,2,0,4)", [2,4]);            
            await expectTuple(ctx, "fil (x->2*x) (-1,2,0,4)", [-1,2,4]);            
        });

    });

    describe("red(reducerFn, items)", () => {

        it("should reduce the given items to a singleton using the reducer function", async () => {
            var ctx = createContext({T:true, F:false, fn:x=>x>0});
            await expectValue(ctx, "red ((x,y)->x*y, 1,2,3,4)", 1*2*3*4);            
        });
        
        it("should return a function that processes the args tuple one item at the time and returns only the args x that match bool(fn x)", async () => {
            var ctx = createContext({T:true, F:false, fn:(x,y)=>x+y});
            ctx.redFn = await evaluate("red fn", ctx);
            expect(ctx.redFn).to.be.a("function");
            expect(await ctx.redFn(1,2,3,4)).to.equal(1+2+3+4);
            
            await expectValue(ctx, "red ((x,y)->x*y) (1,2,3,4)", 1*2*3*4);            
        });

        it("should throw a runtime error if the first parameter is not a function", async () => {
            var ctx = createContext({T:true, F:false, fn:x=>2*x});
            var expectError = (expression) => expectRuntimeError(ctx, ()=>evaluate(expression,ctx), "Function required as first argument of red");
            await expectError("red ()");
            await expectError("red F");
            await expectError("red T");
            await expectError("red 1");
            await expectError("red 'abc'");
            await expectError("red [1,2,3]");
            await expectError("red {a=1}");
            await expectError("red (1,2,3)");
        });
    });
});
