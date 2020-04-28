var expect = require("chai").expect;
var {parse, createContext, evaluate, Exception, Tuple} = require("../lib/expression");


class ExceptionExpected extends Error {};

async function expectException (testFn, message) {
    try {
        await testFn();
        throw new ExceptionExpected();
    } catch (e) {
        expect(e).to.be.instanceof(Exception);
        expect(e.message).to.equal(message);
    }    
}


describe("expression", () => {
    
    
    // CORE
    
    describe("numeric literals", () => {
        
        it("should evaluate decimal numeric literals to numbers", async () => {
            var ctx = createContext();
            expect(await evaluate("10", ctx)).to.equal(10);
            expect(await evaluate("0", ctx)).to.equal(0);
            expect(await evaluate("-10", ctx)).to.equal(-10);
            expect(await evaluate("3.2", ctx)).to.equal(3.2);
            expect(await evaluate("-3.2", ctx)).to.equal(-3.2);
            expect(await evaluate("1.2e3", ctx)).to.equal(1200);
        });
    });
    
    describe("string literals", () => {
        
        it(`should evaluate string literals between double quotes '""'`, async () => {
            var ctx = createContext();
            expect(await evaluate(`"abc"`, ctx)).to.equal("abc");
            expect(await evaluate(`""`, ctx)).to.equal("");
        });        

        it("should evaluate string literals between single quotes `''`", async () => {
            var ctx = createContext();
            expect(await evaluate(`'def'`, ctx)).to.equal("def");
            expect(await evaluate(`''`, ctx)).to.equal("");
        });        

        it("should evaluate string literals between accent quotes '``'", async () => {
            var ctx = createContext();
            expect(await evaluate("`ghi`", ctx)).to.equal("ghi");
            expect(await evaluate("``", ctx)).to.equal("");
        });        
    });
    
    describe("tuples: `exp1, exp2, exp3, ...`", () => {
        
        it("should return the comma-separated values as an iterable", async () => {
            var ctx = createContext();
            var tuple = await evaluate("10,'abc'", ctx);
            expect(tuple).to.be.instanceof(Tuple);
            expect(Array.from(tuple)).to.deep.equal([10,"abc"]);            
        });

        it("should flatten tuples of tuples: `(X,Y),Z` results in `X,Y,Z`", async () => {
            var ctx = createContext();
            var tuple = await evaluate("1,(2,3),4,(5,(6,7)),8,9", ctx);
            expect(tuple).to.be.instanceof(Tuple);
            expect(Array.from(tuple)).to.deep.equal([1,2,3,4,5,6,7,8,9]);
        });

        it("should ignore empty tuples when flattening tuples: `X,(),Y` results in `X,Y`", async () => {
            var ctx = createContext();
            
            var tuple = await evaluate("1,(),2", ctx);
            expect(tuple).to.be.instanceof(Tuple);
            expect(Array.from(tuple)).to.deep.equal([1,2]);

            var tuple = await evaluate("(),(1,(),2),(),3", ctx);
            expect(tuple).to.be.instanceof(Tuple);
            expect(Array.from(tuple)).to.deep.equal([1,2,3]);            
        });
        
        it("should evaluate empty tuples `()` as null", async () => {
            var ctx = createContext();
            expect(await evaluate("", ctx)).to.equal(null);
            expect(await evaluate("()", ctx)).to.equal(null);
            expect(await evaluate("(), (), ()", ctx)).to.equal(null);
        });

        it("should evaluate 1-uples (x,()) as x", async () => {
            var ctx = createContext();
            expect(await evaluate("(), 10, ()", ctx)).to.equal(10);
        });
    });
    
    describe("ranges: `a:b`", () => {
    
        it("should return the tuple of all the integers between a and b", async () => {
            var ctx = createContext();
            var range = await evaluate("2:6", ctx);
            expect(range).to.be.instanceof(Tuple);
            expect(Array.from(range)).to.deep.equal([2,3,4,5,6]);            
        });

        it("should work also if b < a", async () => {
            var ctx = createContext();
            var range = await evaluate("6:2", ctx);
            expect(range).to.be.instanceof(Tuple);
            expect(Array.from(range)).to.deep.equal([6,5,4,3,2]);            
        });

        it("should return a if a == b", async () => {
            var ctx = createContext();
            var range = await evaluate("2:2", ctx);
            expect(range).to.equal(2);
        });
        
        it("should truncate the boundaries a and/or b if decimal", async () => {
            var ctx = createContext();
            var range = await evaluate("2.7:6.1", ctx);
            expect(range).to.be.instanceof(Tuple);
            expect(Array.from(range)).to.deep.equal([2,3,4,5,6]);            

            var ctx = createContext();
            var range = await evaluate("6.1:2.7", ctx);
            expect(range).to.be.instanceof(Tuple);
            expect(Array.from(range)).to.deep.equal([6,5,4,3,2]);            
        });
        
        it("should throw an exception if a and/or b are not numbers", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            var expectRangeError = (expression, xType, yType) => expectException(() => evaluate(expression, ctx), `Range operation not defined between ${xType} and ${yType}`);
            
            var xType='NOTHING'; ctx.x = null;
            await expectRangeError("x:()",    xType, 'NOTHING');                                                
            await expectRangeError("x:F",     xType, 'BOOLEAN');                                    
            await expectRangeError("x:1",     xType, 'NUMBER');                                    
            await expectRangeError("x:'abc'", xType, 'STRING');                                    
            await expectRangeError("x:ls",    xType, 'LIST');                                    
            await expectRangeError("x:ns",    xType, 'NAMESPACE');                                    
            await expectRangeError("x:fn",    xType, 'FUNCTION');                                                
            await expectRangeError("x:(1,2)", xType, 'TUPLE');                                                

            var xType='BOOLEAN'; ctx.x = false;
            await expectRangeError("x:()",    xType, 'NOTHING');                                                
            await expectRangeError("x:F",     xType, 'BOOLEAN');                                    
            await expectRangeError("x:1",     xType, 'NUMBER');                                    
            await expectRangeError("x:'abc'", xType, 'STRING');                                    
            await expectRangeError("x:ls",    xType, 'LIST');                                    
            await expectRangeError("x:ns",    xType, 'NAMESPACE');                                    
            await expectRangeError("x:fn",    xType, 'FUNCTION');                                                
            await expectRangeError("x:(1,2)", xType, 'TUPLE');                                                
            
            var xType='NUMBER'; ctx.x = 1;
            await expectRangeError("x:()",    xType, 'NOTHING');                                                
            await expectRangeError("x:F",     xType, 'BOOLEAN');                                    
            await expectRangeError("x:'abc'", xType, 'STRING');                                    
            await expectRangeError("x:ls",    xType, 'LIST');                                    
            await expectRangeError("x:ns",    xType, 'NAMESPACE');                                    
            await expectRangeError("x:fn",    xType, 'FUNCTION');                                                
            await expectRangeError("x:(1,2)", xType, 'TUPLE');                                                

            var xType='STRING'; ctx.x = "abc";
            await expectRangeError("x:()",    xType, 'NOTHING');                                                
            await expectRangeError("x:F",     xType, 'BOOLEAN');                                    
            await expectRangeError("x:1",     xType, 'NUMBER');                                    
            await expectRangeError("x:'abc'", xType, 'STRING');                                    
            await expectRangeError("x:ls",    xType, 'LIST');                                    
            await expectRangeError("x:ns",    xType, 'NAMESPACE');                                    
            await expectRangeError("x:fn",    xType, 'FUNCTION');                                                
            await expectRangeError("x:(1,2)", xType, 'TUPLE');                                                

            var xType='LIST'; ctx.x = [1,2,3];
            await expectRangeError("x:()",    xType, 'NOTHING');                                                
            await expectRangeError("x:F",     xType, 'BOOLEAN');                                    
            await expectRangeError("x:1",     xType, 'NUMBER');                                    
            await expectRangeError("x:'abc'", xType, 'STRING');                                    
            await expectRangeError("x:ls",    xType, 'LIST');                                    
            await expectRangeError("x:ns",    xType, 'NAMESPACE');                                    
            await expectRangeError("x:fn",    xType, 'FUNCTION');                                                
            await expectRangeError("x:(1,2)", xType, 'TUPLE');                                                

            var xType='FUNCTION'; ctx.x = x=>2*x;
            await expectRangeError("x:()",    xType, 'NOTHING');                                                
            await expectRangeError("x:F",     xType, 'BOOLEAN');                                    
            await expectRangeError("x:1",     xType, 'NUMBER');                                    
            await expectRangeError("x:'abc'", xType, 'STRING');                                    
            await expectRangeError("x:ls",    xType, 'LIST');                                    
            await expectRangeError("x:ns",    xType, 'NAMESPACE');                                    
            await expectRangeError("x:fn",    xType, 'FUNCTION');                                                
            await expectRangeError("x:(1,2)", xType, 'TUPLE');                                                

            var xType='NAMESPACE'; ctx.x = {a:1,b:2,c:3};
            await expectRangeError("x:()",    xType, 'NOTHING');                                                
            await expectRangeError("x:F",     xType, 'BOOLEAN');                                    
            await expectRangeError("x:1",     xType, 'NUMBER');                                    
            await expectRangeError("x:'abc'", xType, 'STRING');                                    
            await expectRangeError("x:ls",    xType, 'LIST');                                    
            await expectRangeError("x:ns",    xType, 'NAMESPACE');                                    
            await expectRangeError("x:fn",    xType, 'FUNCTION');                                                
            await expectRangeError("x:(1,2)", xType, 'TUPLE');                                                

            var xType='TUPLE'; ctx.x = new Tuple(1,2,3);
            await expectRangeError("x:()",    xType, 'NOTHING');                                                
            await expectRangeError("x:F",     xType, 'BOOLEAN');                                    
            await expectRangeError("x:1",     xType, 'NUMBER');                                    
            await expectRangeError("x:'abc'", xType, 'STRING');                                    
            await expectRangeError("x:ls",    xType, 'LIST');                                    
            await expectRangeError("x:ns",    xType, 'NAMESPACE');                                    
            await expectRangeError("x:fn",    xType, 'FUNCTION');                                                
            await expectRangeError("x:(1,2)", xType, 'TUPLE');                                                
        });
    });
    
    describe("lists: `[expression]`", () => {
        
        it("should return an array", async () => {
            var ctx = createContext();
            
            var list = await evaluate("[1,'abc',3]", ctx);
            expect(list).to.deep.equal([1,"abc",3]);
            
            var list = await evaluate("[1]", ctx);
            expect(list).to.deep.equal([1]);
            
            var list = await evaluate("[]", ctx);
            expect(list).to.deep.equal([]);
        });
        
        it("should not flatten deep lists", async () => {
            var ctx = createContext();
            var list = await evaluate("[[1,2],3,4,[]]", ctx)
            expect(list).to.deep.equal([[1,2],3,4,[]]);            
        });
    });
    
    describe("name resolution", () => {
        
        it("should return the value mapped to the name in the current context", async () => {
            var ctx = createContext({a:10, _b:20, __c__:"xxx"});
            expect(await evaluate("a", ctx)).to.equal(10);
            expect(await evaluate("_b", ctx)).to.equal(20);
            expect(await evaluate("__c__", ctx)).to.equal("xxx");
        });
        
        it("should return `null` (empty tuple) if the name is not mapped", async () => {
            var ctx = createContext({a:10, _b:20});
            expect(await evaluate("d", ctx)).to.equal(null);
        });        
        
        it("should throw an error if an invalid name is used", async () => {
            var ctx = createContext({$a:10});
            
            try {
                expect(await evaluate("$a", ctx)).to.equal(10);            
                throw new ExceptionExpected();                
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
            }
            
            try {
                expect(await evaluate("1x", ctx)).to.equal(10);            
                throw new ExceptionExpected();                
            } catch (e) {
                expect(e).to.not.be.instanceof(ExceptionExpected);
            }
        });
        
        it("should not return properties inherited from javascript Object", async () => {
            var ctx = createContext();
            expect(await evaluate("isPrototypeOf", ctx)).to.be.null;
            expect(await evaluate("hasOwnProperty", ctx)).to.be.null;
        });

        describe("name resolution in a child context", () => {
            
            it("should return the child name value if name is mapped in the child context", async () => {
                var ctx = createContext({a:10, b:20});
                var cctx = Object.create(Object.assign(ctx, {a:100}));
                expect(await evaluate("a", cctx)).to.equal(100);
            });

            it("should return the parent name value if name is not mapped in the child context", async () => {
                var ctx = createContext({a:10, b:20});
                var cctx = Object.create(Object.assign(ctx, {a:100}));
                expect(await evaluate("b", cctx)).to.equal(20);
            });

            it("should return null if the name is not mapped in the child context nor in the parent context", async () => {
                var ctx = createContext({a:10, b:20});
                var cctx = Object.create(Object.assign(ctx, {a:100}));
                expect(await evaluate("c", cctx)).to.equal(null);                            
            });
        });
    });
    
    describe("TRUE constant", () => {
        it("should return true", async () => {
            var ctx = createContext();
            expect(await evaluate("TRUE", ctx)).to.equal(true);
        });
    });
    
    describe("FALSE constant", () => {
        it("should return false", async () => {
            var ctx = createContext();
            expect(await evaluate("FALSE", ctx)).to.equal(false);
        });
    });
    
    describe("assignment operation: name = expression", () => {        
        
        it("should return null", async () => {
            var ctx = createContext();
            expect(await evaluate("x = 10", ctx)).to.equal(null);            
        });

        it("should create a new name in the current context and map it to the given value", async () => {
            var ctx = createContext();                        
            await evaluate("x = 10", ctx);
            expect(ctx.x).to.equal(10);            
        });
        
        it("should assign a tuple of values to a tuple of names", async () => {
            var ctx = createContext();            
            await evaluate("(a,b,c) = (1,2,3)", ctx);
            expect(ctx.a).to.equal(1);        
            expect(ctx.b).to.equal(2);        
            expect(ctx.c).to.equal(3);        
        });
        
        it("should assign null to the last names if the values tuple is smaller than the names tuple", async () => {
            var ctx = createContext();
            await evaluate("(a,b,c,d) = (10,20)", ctx);
            expect(ctx.a).to.equal(10);        
            expect(ctx.b).to.equal(20);        
            expect(ctx.c).to.be.null;                    
            expect(ctx.d).to.be.null;                    
        });
        
        it("should assign to the last name the tuple of remaining values if the names tuple is smaller than the values tuple", async () => {
            var ctx = createContext();
            
            await evaluate("(a,b) = (100,200,300)", ctx);
            expect(ctx.a).to.equal(100);        
            expect(ctx.b).to.be.instanceof(Tuple);
            expect(Array.from(ctx.b)).to.deep.equal([200,300]);
            
            await evaluate("c = (10,20,30)", ctx);
            expect(ctx.c).to.be.instanceof(Tuple);
            expect(Array.from(ctx.c)).to.deep.equal([10,20,30]);
        });
        
        it("should overwrite an existing name-value mapping", async () => {
            var ctx = createContext({a:1});
            await evaluate("a = 2", ctx);            
            await evaluate("a = 3", ctx);            
            expect(ctx.a).to.equal(3);
        });        
    });
    
    describe("namespace definition: {expression}", () => {

        it("return an object with the mapped names", async () => {
            var ctx = createContext();                    
            expect(await evaluate("{x=1, y=2, z=3}", ctx)).to.deep.equal({x:1,y:2,z:3});
        });
        
        it("should ignore the non-assignment operations", async () => {
            var ctx = createContext();                    
            expect(await evaluate("{x=1, 10, y=2, z=3}", ctx)).to.deep.equal({x:1,y:2,z:3});
        });

        it("should not assign the names to the parent context", async () => {
            var ctx = createContext({x:10});                    
            expect(await evaluate("{x=20}", ctx)).to.deep.equal({x:20});
            expect(ctx.x).to.equal(10);
        });
    });

    describe("function definition: names_tuple -> expression", () => {

        it("should return a function resolving the expression in a context augumented with the argument names", async () => {
            var ctx = createContext();        
            var foo = await evaluate("(x, y) -> [y,x]", ctx);
            expect(foo).to.be.a("function");
            expect(await foo(10,20)).to.deep.equal([20,10]);
        });
        
        it("should follow the assignment rules when mapping argument names to parameters", async () => {
            var ctx = createContext();        

            var foo = await evaluate("(x, y) -> {a=x,b=y}", ctx);
            expect(await foo(10)).to.deep.equal({a:10, b:null});            

            var retval = await foo(10,20,30);
            expect(retval.a).to.equal(10);
            expect(retval.b).to.be.instanceof(Tuple);
            expect(Array.from(retval.b)).to.deep.equal([20,30]);
        });
        
        it("should be righ-to-left associative", async () => {
            var ctx = createContext();        

            var foo = await evaluate("x -> y -> {a=x,b=y}", ctx);
            var foo10 = await foo(10);
            expect(foo10).to.be.a("function");
            expect(await foo10(20)).to.deep.equal({a:10, b:20});                        
        });
    });
    
    describe("'apply' operation: X Y", async () => {
        
        describe("when X is a function", () => {
            
            it("should call the function with the parameter Y and return its return value", async () => {
                var ctx = createContext({
                    double: x => 2 * x,
                    sum: (x,y) => x + y
                });                    
                expect(await evaluate("(x -> [x]) 10", ctx)).to.deep.equal([10]);
                expect(await evaluate("((x, y) -> [y,x])(10, 20)", ctx)).to.deep.equal([20,10]);
                expect(await evaluate("double 25", ctx)).to.equal(50);
                expect(await evaluate("sum(10, 20)", ctx)).to.equal(30);
            });
        });
        
        describe("when X is a string", async () => {
            
            it("shoudl return the character at Y if Y is an integer", async () => {
                var ctx = createContext();
                expect(await evaluate("'abcdef' 2", ctx)).to.equal('c');                    
            });
            
            it("should consider only the integer part of Y if Y is a decimal number", async () => {
                var ctx = createContext();
                expect(await evaluate("'abcdef' 2.3", ctx)).to.equal('c');                                        
            });

            it("should consider negative indexes as relative to the string end", async () => {
                var ctx = createContext();
                expect(await evaluate("'abcdef' (-2)", ctx)).to.equal('e');                                        
            });
            
            it("should return an empty string if Y is an out of range number", async () => {
                var ctx = createContext();
                expect(await evaluate("'abcdef' 100", ctx)).to.equal("");
                expect(await evaluate("'abcdef' (-100)", ctx)).to.equal("");                                                            
            });

            it("should return an empty string if Y is not a number", async () => {
                var ctx = createContext();
                expect(await evaluate("'abcdef' '2'", ctx)).to.equal("");  
                expect(await evaluate("'abcdef' (1,3)", ctx)).to.equal("");  
            });     
        });
        
        describe("when X is a list", () => {
            
            it("shoudl return the item at index Y if Y is an integer", async () => {
                var ctx = createContext();
                expect(await evaluate("['a','b','c','d','e','f'] 2", ctx)).to.equal('c');                    
            });
            
            it("should consider only the integer part of Y if it is a decimal number", async () => {
                var ctx = createContext();
                expect(await evaluate("['a','b','c','d','e','f'] 2.3", ctx)).to.equal('c');                                        
            });

            it("should consider a negative indexe Y as relative to the list end", async () => {
                var ctx = createContext();
                expect(await evaluate("['a','b','c','d','e','f'] (-2)", ctx)).to.equal('e');                                                            
            });
            
            it("should return null if the index Y is out of range", async () => {
                var ctx = createContext();
                expect(await evaluate("['a','b','c','d','e','f'] 100", ctx)).to.equal(null);                                                            
                expect(await evaluate("['a','b','c','d','e','f'] (-100)", ctx)).to.equal(null);                                                            
            });

            it("should return null if Y is not a number", async () => {
                var ctx = createContext();
                expect(await evaluate("['a','b','c','d','e','f'] '2'", ctx)).to.equal(null);                                                            
                expect(await evaluate("['a','b','c','d','e','f'] (2,4)", ctx)).to.equal(null);                                                            
            });
        });
        
        describe("when X is a namespace", () => {
            
            it("should return the value mapped to the name Y", async () => {
                var ctx = createContext();
                expect(await evaluate("{a=1,b=2,c=3} 'c'", ctx)).to.equal(3);
            });
            
            it("should return null if Y is not a valid name", async () => {                    
                var ctx = createContext();
                expect(await evaluate("{a=1,b=2,c=3} 1", ctx)).to.equal(null);
                expect(await evaluate("{a=1,b=2,c=3} '$key'", ctx)).to.equal(null);
                expect(await evaluate("{a=1,b=2,c=3} ('a','b')", ctx)).to.equal(null);
            });
            
            it("should return null if Y is a name not mapped to any value", async () => {
                var ctx = createContext();
                expect(await evaluate("{a=1,b=2,c=3} 'd'", ctx)).to.equal(null);
            });

            it("should delegate to `X.__apply__` if it exists and it is a function", async () => {
                var ctx = createContext();
                
                var val = await evaluate("{__apply__ = s -> ['val of', s]}('x')", ctx);
                expect(val).to.deep.equal(["val of", "x"]);

                var val = await evaluate("{__apply__ = (x,y) -> ['val:', y, x]}(10,20)", ctx);
                expect(val).to.deep.equal(["val:", 20, 10]);
                
                val = await evaluate("{__apply__=1, a=2}('a')", ctx);
                expect(val).to.equal(2);
            });            
        });
        
        describe("when X is a number", () => {
            
            it("should throw an exception", async () => {
                var ctx = createContext();

                try {
                    await evaluate("(10)(1)", ctx);
                    throw new Error();
                } catch (e) {
                    expect(e).to.be.instanceof(Exception);
                    expect(e.message).to.equal("Apply operation not defined on NUMBER type");
                }
            });            
        });

        describe("when X is a boolean", () => {
            
            it("should throw an exception", async () => {
                var ctx = createContext({b:true});

                try {
                    await evaluate("b(1)", ctx);
                    throw new Error();
                } catch (e) {
                    expect(e).to.be.instanceof(Exception);
                    expect(e.message).to.equal("Apply operation not defined on BOOLEAN type");
                }
            });            
        });
        
        describe("when X is a tuple", () => {
            
            it("should return a tuple obtained by calling the items of X", async () => {
                var ctx = createContext({
                    x2: a => 2*a,
                    x3: a => 3*a,
                    x4: [100,200,300],
                });
                
                var retval = await evaluate("(x2,x3,x4) 2", ctx);
                expect(retval).to.be.instanceof(Tuple);
                expect(Array.from(retval)).to.deep.equal([4,6,300]);
            });
            
            it("should throw an exception if any of the items of X throw an exception", async () => {
                var ctx = createContext({
                    x2: a => 2*a,
                    x3: a => 3*a,
                    x4: [100,200,300],
                });
                
                try {
                    await evaluate("(x2, 10, x3)(1)", ctx);
                    throw new Error();
                } catch (e) {
                    expect(e).to.be.instanceof(Exception);
                    expect(e.message).to.equal("Apply operation not defined on NUMBER type");
                }                
            });
            
            it("should return always null if X is an empty tuple", async () => {
                var ctx = createContext();
                expect(await evaluate("()1", ctx)).to.equal(null);            
                expect(await evaluate("()'abc'", ctx)).to.equal(null);            
                expect(await evaluate("()[1,2,3]", ctx)).to.equal(null);            
                expect(await evaluate("()(1,2,3)", ctx)).to.equal(null);            
            });
        });        
    });    
    
    describe("sub-contexting: namespace.expression", () => {
        
        it("should evaluate 'Y' in the 'X' context if 'X' is a namespace", async () => {
            var ctx = createContext({x:10});
            await evaluate("ns = {y=20, z=30, _h=40}", ctx);
            expect(await evaluate("ns.y", ctx)).to.equal(20);
            expect(await evaluate("ns.[1,y,z]", ctx)).to.deep.equal([1,20,30]);
            expect(await evaluate("ns.x", ctx)).to.equal(10);
            expect(await evaluate("ns._h", ctx)).to.equal(40);

            var ctx = createContext({ns:{x:10,y:20,z:30}});
            expect(await evaluate("ns.[x,y,z]", ctx)).to.deep.equal([10,20,30]);
        });
        
        it("should restore the context in which X was created", async () => {
            var ctx = createContext({x:10});
            await evaluate("ns = {y=20}.{z=30}", ctx);
            expect(await evaluate("ns.x", ctx)).to.equal(10);
            expect(await evaluate("ns.y", ctx)).to.equal(20);
            expect(await evaluate("ns.z", ctx)).to.equal(30);
        });
        
        it("should return a tuple obtained by sub-contexting each item of X if X is a tuple", async () => {
            var ctx = createContext({
                ns1: {a:11, b:12, c:13},
                ns2: {a:21, b:22, c:23},
                ns3: {},
            });
            var value = await evaluate("(ns1, ns2, ns3).b", ctx);
            expect(value).to.be.instanceof(Tuple);
            expect(Array.from(value)).to.deep.equal([12,22]);
        });

        it("should return null if X is an empty tuple", async () => {
            var ctx = createContext();
            expect(await evaluate("().b", ctx)).to.equal(null);
        });

        it("should throw an exception if 'X' is of any other type", async () => {
            var ctx = createContext();
            await expectException(() => evaluate("(10).name", ctx), "Namespace expected on the left size of the '.' operator");
            await expectException(() => evaluate("[].name", ctx), "Namespace expected on the left size of the '.' operator");
            await expectException(() => evaluate("(x->x).name", ctx), "Namespace expected on the left size of the '.' operator");
        });
    });
    
    describe("comments", () => {
        
        it("should ignore the text following the `#` character up to the end of the line or of the expression", async () => {
            var ctx = createContext();
            var expression = `
                # this is a comment
                12.345 # this is another comment
                # this is the last comment`
            expect(await evaluate(expression, ctx)).to.equal(12.345);
        });
        
        it("should not parse `#` characters in a string as comments", async () => {
            var ctx = createContext();
            expect(await evaluate("`this # is a string`", ctx)).to.equal("this # is a string");
            expect(await evaluate("'this # is a string'", ctx)).to.equal("this # is a string");
            expect(await evaluate(`"this # is a string"`, ctx)).to.equal("this # is a string");
        });
    });
    
    
    // BUILT-IN FUNCTIONS
    
    describe("bool X", () => {
        
        it("should return X if it is a boolean", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("bool F", ctx)).to.equal(false);
            expect(await evaluate("bool T", ctx)).to.equal(true);                
        });
        
        it("should return true if X is a non-zero number", async () => {
            var ctx = createContext();            
            expect(await evaluate("bool 0", ctx)).to.equal(false);
            expect(await evaluate("bool 10", ctx)).to.equal(true);
            expect(await evaluate("bool (-1)", ctx)).to.equal(true);
        });

        it("should return true if X is a non-empty string", async () => {
            var ctx = createContext();            
            expect(await evaluate("bool ''", ctx)).to.equal(false);
            expect(await evaluate("bool 'abc'", ctx)).to.equal(true);
        });

        it("should return true if X is a non-empty list", async () => {
            var ctx = createContext();            
            expect(await evaluate("bool []", ctx)).to.equal(false);
            expect(await evaluate("bool [1,2,3]", ctx)).to.equal(true);
        });

        it("should return true if X is a non-empty namespace", async () => {
            var ctx = createContext();            
            expect(await evaluate("bool {}", ctx)).to.equal(false);
            expect(await evaluate("bool {a=1,b=2,c=3}", ctx)).to.equal(true);
        });
        
        it("should return true if X is a function", async () => {
            var ctx = createContext({jsFn:x=>2*x});
            expect(await evaluate("bool (x->x)", ctx)).to.equal(true);
            expect(await evaluate("bool jsFn", ctx)).to.equal(true);
        });

        it("should return true if X is a tuple with at least one true item", async () => {
            var ctx = createContext();
            expect(await evaluate("bool (0,0,0)", ctx)).to.equal(false);
            expect(await evaluate("bool (0,1,-1)", ctx)).to.equal(true);
        });
        
        it("should return false if X is an empty tuple", async () => {
            var ctx = createContext();
            expect(await evaluate("bool ()", ctx)).to.equal(false);
        });
    });
    
    describe("not X", () => {
        
        it("should return true if X is false and false if X is true", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("not F", ctx)).to.equal(true);
            expect(await evaluate("not T", ctx)).to.equal(false);                
        });
        
        it("should return false if X is a non-zero number", async () => {
            var ctx = createContext();            
            expect(await evaluate("not 0", ctx)).to.equal(true);
            expect(await evaluate("not 10", ctx)).to.equal(false);
            expect(await evaluate("not (-1)", ctx)).to.equal(false);
        });

        it("should return false if X is a non-empty string", async () => {
            var ctx = createContext();            
            expect(await evaluate("not ''", ctx)).to.equal(true);
            expect(await evaluate("not 'abc'", ctx)).to.equal(false);
        });

        it("should return false if X is a non-empty list", async () => {
            var ctx = createContext();            
            expect(await evaluate("not []", ctx)).to.equal(true);
            expect(await evaluate("not [1,2,3]", ctx)).to.equal(false);
        });

        it("should return false if X is a non-empty namespace", async () => {
            var ctx = createContext();            
            expect(await evaluate("not {}", ctx)).to.equal(true);
            expect(await evaluate("not {a=1,b=2,c=3}", ctx)).to.equal(false);
        });
        
        it("should return false if X is a function", async () => {
            var ctx = createContext({jsFn:x=>2*x});
            expect(await evaluate("not (x->x)", ctx)).to.equal(false);
            expect(await evaluate("not jsFn", ctx)).to.equal(false);
        });

        it("should return false if X is a tuple with at least one true item", async () => {
            var ctx = createContext();
            expect(await evaluate("not (0,0,0)", ctx)).to.equal(true);
            expect(await evaluate("not (0,1,-1)", ctx)).to.equal(false);
        });
        
        it("should return true if X is an empty tuple", async () => {
            var ctx = createContext();
            expect(await evaluate("not ()", ctx)).to.equal(true);
        });
    });
    
    describe("str X", () => {
        
        it("should return an empty string if X is nothing", async () => {
            var ctx = createContext();
            expect(await evaluate("str ()", ctx)).to.equal("");
        });
        
        it("should return 'TRUE' if X is true", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("str T", ctx)).to.equal("TRUE");
        });
        
        it("should return 'FALSE' if X is false", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("str F", ctx)).to.equal("FALSE");
        });
        
        it("should return String(X) if X is a number", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("str 123.4", ctx)).to.equal("123.4");
        });
        
        it("should return X itself if it is a string", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("str 'abc'", ctx)).to.equal("abc");
        });
        
        it("should return the UTF `f` character if X is a function", async () => {
            var ctx = createContext({jsFn: x => 2*x});
            expect(await evaluate("str(x -> 2)", ctx)).to.equal(String.fromCharCode(0x2A0D));
            expect(await evaluate("str jsFn", ctx)).to.equal(String.fromCharCode(0x2A0D));
        });
        
        it("should return '[n]' when X is a list with n items", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("str[1,2,'abc']", ctx)).to.equal("[3]")
        });

        it("should return '{n}' when n is the number of items", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("str{a=1,b=2,c=3}", ctx)).to.equal("{3}")
        });
        
        it("should return X.__str__ if it exists and it is a string", async () => {
            var ctx = createContext({ns:{__str__: "ns string"}});
            expect(await evaluate("str ns", ctx)).to.equal("ns string");
        });
        
        it("should concatenate the serialized item if X is a tuple", async () => {
            var ctx = createContext({T:true, F:false, sum: (x,y) => x+y});
            expect(await evaluate("str('it is ',T,' that 1+2 is ',sum(1,2))", ctx)).to.equal("it is TRUE that 1+2 is 3");
        });
    });            

    describe("map fn", () => {
        
        it("should return a function that maps its arguments one by one via fn", async () => {
            var ctx = createContext({T:true, F:false, fn:x=>2*x});
            const mappingFn = await evaluate("map fn", ctx);
            expect(mappingFn).to.be.a("function");
            const mappedValues = await evaluate("map fn (1,2,3,4)", ctx);
            expect(mappedValues).to.be.instanceof(Tuple);
            expect(Array.from(mappedValues)).to.deep.equal([2,4,6,8]);
        });

        it("should work with any type", async () => {
            var ctx = createContext({T:true, F:false, fn:x=>2*x});
            var retvals = await evaluate("map fn (1,2,3)", ctx);
            expect(retvals).to.be.instanceof(Tuple);
            expect(Array.from(retvals)).to.deep.equal([2,4,6]);
            
            expect(await evaluate("map fn ()", ctx)).to.equal(null);
        });
    });
    
    describe("enum X", () => {
        
        it("should return the tuple of the X characters if X is a string", async () => {
            var ctx = createContext();
            var items = await evaluate("enum 'abc'", ctx);
            expect(items).to.be.instanceof(Tuple);
            expect(Array.from(items)).to.deep.equal(['a', 'b', 'c']);
        });

        it("should return the tuple of the X items if X is a list", async () => {
            var ctx = createContext();
            var items = await evaluate("enum [10,11,12]", ctx);
            expect(items).to.be.instanceof(Tuple);
            expect(Array.from(items)).to.deep.equal([10, 11, 12]);
        });

        it("should return the tuple of the X names if X is a namespace", async () => {
            var ctx = createContext();
            await evaluate("ns = {z=3, x=1, y=2}", ctx);
            var items = await evaluate("enum ns", ctx);
            expect(items).to.be.instanceof(Tuple);
            expect(Array.from(items).sort()).to.deep.equal(['x','y','z']);
        });
        
        it("should return X itself if it is of any other type", async () => {
            var ctx = createContext({T:true, F:false, fn:x=>2*x});
            expect(await evaluate("enum ()", ctx)).to.equal(null);
            expect(await evaluate("enum T", ctx)).to.equal(true);
            expect(await evaluate("enum F", ctx)).to.equal(false);
            expect(await evaluate("enum fn", ctx)).to.equal(ctx.fn);
            
            var items = await evaluate("enum (1, 'abc', {x=10})", ctx);
            expect(items).to.be.instanceof(Tuple);
            expect(Array.from(items)).to.deep.equal([1,'abc',{x:10}]);
        });
    });
    
    
    // LOGIC OPERATORS
    
    describe("X | Y", () => {
    
        it("should return X if `bool X` is true", async () => {
            var ctx = createContext({T:true, F:false});
    
            // true or true
            expect(await evaluate("T | T", ctx)).to.equal(true);
            expect(await evaluate("T | 10", ctx)).to.equal(true);
            expect(await evaluate("10 | T", ctx)).to.equal(10);
            expect(await evaluate("10 | 10", ctx)).to.equal(10);
    
            // true or false
            expect(await evaluate("T | F", ctx)).to.equal(true);
            expect(await evaluate("T | 0", ctx)).to.equal(true);
            expect(await evaluate("10 | F", ctx)).to.equal(10);
            expect(await evaluate("10 | 0", ctx)).to.equal(10);    
        })

        it("should return Y if `bool X` is false", async () => {
            var ctx = createContext({T:true, F:false});
    
            // false or true
            expect(await evaluate("F | T", ctx)).to.equal(true);
            expect(await evaluate("F | 10", ctx)).to.equal(10);
            expect(await evaluate("0 | T", ctx)).to.equal(true);
            expect(await evaluate("0 | 10", ctx)).to.equal(10);
    
            // false or false
            expect(await evaluate("F | F", ctx)).to.equal(false);
            expect(await evaluate("F | 0", ctx)).to.equal(0);
            expect(await evaluate("0 | F", ctx)).to.equal(false);
            expect(await evaluate("0 | 0", ctx)).to.equal(0);
        })
    });
    
    describe("X & Y", () => {
    
        it("should return Y if `bool X` is true", async () => {
            var ctx = createContext({T:true, F:false});
    
            // true or true
            expect(await evaluate("T & T", ctx)).to.equal(true);
            expect(await evaluate("T & 10", ctx)).to.equal(10);
            expect(await evaluate("10 & T", ctx)).to.equal(true);
            expect(await evaluate("10 & 10", ctx)).to.equal(10);
    
            // true or false
            expect(await evaluate("T & F", ctx)).to.equal(false);
            expect(await evaluate("T & 0", ctx)).to.equal(0);
            expect(await evaluate("10 & F", ctx)).to.equal(false);
            expect(await evaluate("10 & 0", ctx)).to.equal(0);    
        })

        it("should return X if `bool X` is false", async () => {
            var ctx = createContext({T:true, F:false});
    
            // false or true
            expect(await evaluate("F & T", ctx)).to.equal(false);
            expect(await evaluate("F & 10", ctx)).to.equal(false);
            expect(await evaluate("0 & T", ctx)).to.equal(0);
            expect(await evaluate("0 & 10", ctx)).to.equal(0);
    
            // false or false
            expect(await evaluate("F & F", ctx)).to.equal(false);
            expect(await evaluate("F & 0", ctx)).to.equal(false);
            expect(await evaluate("0 & F", ctx)).to.equal(0);
            expect(await evaluate("0 & 0", ctx)).to.equal(0);
        })
    });
    
    describe("X ? Y", () => {
    
        it("should return Y is `bool X` is true", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("T ? [1,2,3]", ctx)).to.deep.equal([1,2,3]);
            expect(await evaluate("10 ? [1,2,3]", ctx)).to.deep.equal([1,2,3]);
        });
        
        it("should return null if `bool X` is false", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("F ? [1,2,3]", ctx)).to.be.null;
            expect(await evaluate("0 ? [1,2,3]", ctx)).to.be.null;
        });
    });    
    
    describe("X ; Y", () => {
    
        it("should return X if it is not `null`", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("[1,2,3] ; [3,4,5]", ctx)).to.deep.equal([1,2,3]);
        });

        it("should return Y if X is `null`", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("() ; [3,4,5]", ctx)).to.deep.equal([3,4,5]);
        });
    });    
    
    
    // ARITHMETIC OPERATORS
    
    describe("X + Y", () => {
    
        it("should return Y if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() + ()", ctx)).to.equal(null);
            expect(await evaluate("() + T", ctx)).to.equal(true);
            expect(await evaluate("() + F", ctx)).to.equal(false);
            expect(await evaluate("() + 10", ctx)).to.equal(10);
            expect(await evaluate("() + 'abc'", ctx)).to.equal("abc");
            expect(await evaluate("() + fn", ctx)).to.equal(ctx.fn);
            expect(await evaluate("() + ls", ctx)).to.deep.equal([1,2,3]);
            expect(await evaluate("() + ns", ctx)).to.deep.equal({a:1,b:2,c:3});
    
            var tuple = await evaluate("() + (1,2,3)", ctx);
            expect(tuple).to.be.instanceof(Tuple);
            expect(Array.from(tuple)).to.deep.equal([1,2,3]);
        });
    
        it("should return X if Y is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() + ()", ctx)).to.equal(null);
            expect(await evaluate("T + ()", ctx)).to.equal(true);
            expect(await evaluate("F + ()", ctx)).to.equal(false);
            expect(await evaluate("10 + ()", ctx)).to.equal(10);
            expect(await evaluate("'abc' + ()", ctx)).to.equal("abc");
            expect(await evaluate("fn + ()", ctx)).to.equal(ctx.fn);
            expect(await evaluate("ls + ()", ctx)).to.deep.equal([1,2,3]);
            expect(await evaluate("ns + ()", ctx)).to.deep.equal({a:1,b:2,c:3});
    
            var tuple = await evaluate("(1,2,3) + ()", ctx);
            expect(tuple).to.be.instanceof(Tuple);
            expect(Array.from(tuple)).to.deep.equal([1,2,3]);
        });
    
        it("should return `X||Y` if both X and Y are booleans", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("T + T", ctx)).to.be.true;
            expect(await evaluate("T + F", ctx)).to.be.true;
            expect(await evaluate("F + T", ctx)).to.be.true;
            expect(await evaluate("F + F", ctx)).to.be.false;
        });
    
        it("should return `X+Y` if both X and Y are numbers", async () => {
            var ctx = createContext();
            expect(await evaluate("10 + 1", ctx)).to.equal(11);
            expect(await evaluate("10 + 0", ctx)).to.equal(10);
            expect(await evaluate("10 + (-2)", ctx)).to.equal(8);
        });
    
        it("should concatenate X and Y if they are both strings", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("'abc' + 'def'", ctx)).to.equal("abcdef");
            expect(await evaluate("'abc' + ''", ctx)).to.equal("abc");
            expect(await evaluate("'' + 'def'", ctx)).to.equal("def");
        });
    
        it("should concatenate X and Y if they are both lists", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("[1,2,3] + [4,5,6]", ctx)).to.deep.equal([1,2,3,4,5,6]);
            expect(await evaluate("[1,2,3] + []", ctx)).to.deep.equal([1,2,3]);
            expect(await evaluate("[] + [4,5,6]", ctx)).to.deep.equal([4,5,6]);
        });
    
        it("should merge X and Y if they are both namespaces", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("{a=1,b=2} + {b=20,c=30}", ctx)).to.deep.equal({a:1,b:20,c:30});
            expect(await evaluate("{a=1,b=2} + {}", ctx)).to.deep.equal({a:1,b:2});
            expect(await evaluate("{} + {b=20,c=30}", ctx)).to.deep.equal({b:20,c:30});
        });
    
        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectSumError = (expression, XType, YType) => expectException(() => evaluate(expression,ctx), `Sum operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "BOOLEAN"; ctx.L = true; 
            await expectSumError("L + 1"       , LTYPE, "NUMBER");
            await expectSumError("L + 'abc'"   , LTYPE, "STRING");
            await expectSumError("L + [1,2,3]" , LTYPE, "LIST");
            await expectSumError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectSumError("L + (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "BOOLEAN"; ctx.L = false;
            await expectSumError("L + 1"       , LTYPE, "NUMBER");
            await expectSumError("L + 'abc'"   , LTYPE, "STRING");
            await expectSumError("L + [1,2,3]" , LTYPE, "LIST");
            await expectSumError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectSumError("L + (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NUMBER"; ctx.L = 10;
            await expectSumError("L + T"       , LTYPE, "BOOLEAN");
            await expectSumError("L + F"       , LTYPE, "BOOLEAN");
            await expectSumError("L + 'abc'"   , LTYPE, "STRING");
            await expectSumError("L + [1,2,3]" , LTYPE, "LIST");
            await expectSumError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectSumError("L + (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "STRING"; ctx.L = "abc";
            await expectSumError("L + T"       , LTYPE, "BOOLEAN");
            await expectSumError("L + F"       , LTYPE, "BOOLEAN");
            await expectSumError("L + 1"       , LTYPE, "NUMBER");
            await expectSumError("L + [1,2,3]" , LTYPE, "LIST");
            await expectSumError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectSumError("L + (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "LIST"; ctx.L = [1,2,3];
            await expectSumError("L + T"       , LTYPE, "BOOLEAN");
            await expectSumError("L + F"       , LTYPE, "BOOLEAN");
            await expectSumError("L + 1"       , LTYPE, "NUMBER");
            await expectSumError("L + 'abc'"   , LTYPE, "STRING");
            await expectSumError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectSumError("L + (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NAMESPACE"; ctx.L = {a:1,b:2};
            await expectSumError("L + T"       , LTYPE, "BOOLEAN");
            await expectSumError("L + F"       , LTYPE, "BOOLEAN");
            await expectSumError("L + 1"       , LTYPE, "NUMBER");
            await expectSumError("L + 'abc'"   , LTYPE, "STRING");
            await expectSumError("L + [1,2,3]" , LTYPE, "LIST");
            await expectSumError("L + (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "FUNCTION"; ctx.L = x=>x;
            await expectSumError("L + T"       , LTYPE, "BOOLEAN");
            await expectSumError("L + F"       , LTYPE, "BOOLEAN");
            await expectSumError("L + 1"       , LTYPE, "NUMBER");
            await expectSumError("L + 'abc'"   , LTYPE, "STRING");
            await expectSumError("L + [1,2,3]" , LTYPE, "LIST");
            await expectSumError("L + {a=1}"   , LTYPE, "NAMESPACE");
            await expectSumError("L + (x->x)"  , LTYPE, "FUNCTION");
        });
    
        it("should return (x1+y1, x2+y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            expect(Array.from(await evaluate("(T, 1, 'a', [1], {a=1}) + (F, 2, 'b', [2], {b=2})", ctx))).to.deep.equal([true, 3, "ab", [1,2], {a:1,b:2}])
            expect(Array.from(await evaluate("(T, 1, 'a', [1], {a=1}) + (F, 2, 'b')", ctx))).to.deep.equal([true, 3, "ab", [1], {a:1}])
            expect(Array.from(await evaluate("(T, 1, 'a') + (F, 2, 'b', [2], {b=2})", ctx))).to.deep.equal([true, 3, "ab", [2], {b:2}])
            expect(Array.from(await evaluate("10 + (1, 2, 3)", ctx))).to.deep.equal([11, 2, 3])
            expect(Array.from(await evaluate("(1, 2, 3) + 10", ctx))).to.deep.equal([11, 2, 3])
        });
    });  

    describe("X - Y", () => {
    
        it("should return NOTHING if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() - ()", ctx)).to.equal(null);
            expect(await evaluate("() - T", ctx)).to.equal(null);
            expect(await evaluate("() - F", ctx)).to.equal(null);
            expect(await evaluate("() - 10", ctx)).to.equal(null);
            expect(await evaluate("() - 'abc'", ctx)).to.equal(null);
            expect(await evaluate("() - fn", ctx)).to.equal(null);
            expect(await evaluate("() - ls", ctx)).to.equal(null);
            expect(await evaluate("() - ns", ctx)).to.equal(null);
            expect(await evaluate("() - (1,2,3)", ctx)).to.equal(null);
        });
    
        it("should return Y if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() - ()", ctx)).to.equal(null);
            expect(await evaluate("T - ()", ctx)).to.equal(true);
            expect(await evaluate("F - ()", ctx)).to.equal(false);
            expect(await evaluate("10 - ()", ctx)).to.equal(10);
            expect(await evaluate("'abc' - ()", ctx)).to.equal("abc");
            expect(await evaluate("fn - ()", ctx)).to.equal(ctx.fn);
            expect(await evaluate("ls - ()", ctx)).to.deep.equal(ctx.ls);
            expect(await evaluate("ns - ()", ctx)).to.deep.equal(ctx.ns);
            expect(Array.from(await evaluate("(1,2,3) - ()", ctx))).to.deep.equal([1,2,3]);
        });
    
        it("should return `X-Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("10 - 1", ctx)).to.equal(9);
            expect(await evaluate("20 - 0", ctx)).to.equal(20);
            expect(await evaluate("10 - (-7)", ctx)).to.equal(17);
        });
    
        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectSubError = (expression, XType, YType) => expectException(() => evaluate(expression,ctx), `Subtraction operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "BOOLEAN"; ctx.L = true;
            await expectSubError("L - 10"      , LTYPE, "NUMBER");
            await expectSubError("L - 'abc'"   , LTYPE, "STRING");
            await expectSubError("L - [1,2,3]" , LTYPE, "LIST");
            await expectSubError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectSubError("L - (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "BOOLEAN"; ctx.L = false;
            await expectSubError("L - 10"      , LTYPE, "NUMBER");
            await expectSubError("L - 'abc'"   , LTYPE, "STRING");
            await expectSubError("L - [1,2,3]" , LTYPE, "LIST");
            await expectSubError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectSubError("L - (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NUMBER"; ctx.L = 10;
            await expectSubError("L - T"       , LTYPE, "BOOLEAN");
            await expectSubError("L - F"       , LTYPE, "BOOLEAN");
            await expectSubError("L - 'abc'"   , LTYPE, "STRING");
            await expectSubError("L - [1,2,3]" , LTYPE, "LIST");
            await expectSubError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectSubError("L - (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "STRING"; ctx.L = "abc";
            await expectSubError("L - T"       , LTYPE, "BOOLEAN");
            await expectSubError("L - F"       , LTYPE, "BOOLEAN");
            await expectSubError("L - 1"       , LTYPE, "NUMBER");
            await expectSubError("L - 'abc'"   , LTYPE, "STRING");
            await expectSubError("L - [1,2,3]" , LTYPE, "LIST");
            await expectSubError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectSubError("L - (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "LIST"; ctx.L = [1,2,3];
            await expectSubError("L - T"       , LTYPE, "BOOLEAN");
            await expectSubError("L - F"       , LTYPE, "BOOLEAN");
            await expectSubError("L - 1"       , LTYPE, "NUMBER");
            await expectSubError("L - 'abc'"   , LTYPE, "STRING");
            await expectSubError("L - [1,2,3]" , LTYPE, "LIST");
            await expectSubError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectSubError("L - (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NAMESPACE"; ctx.L = {a:1,b:2};
            await expectSubError("L - T"       , LTYPE, "BOOLEAN");
            await expectSubError("L - F"       , LTYPE, "BOOLEAN");
            await expectSubError("L - 1"       , LTYPE, "NUMBER");
            await expectSubError("L - 'abc'"   , LTYPE, "STRING");
            await expectSubError("L - [1,2,3]" , LTYPE, "LIST");
            await expectSubError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectSubError("L - (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "FUNCTION"; ctx.L = x=>x;
            await expectSubError("L - T"       , LTYPE, "BOOLEAN");
            await expectSubError("L - F"       , LTYPE, "BOOLEAN");
            await expectSubError("L - 1"       , LTYPE, "NUMBER");
            await expectSubError("L - 'abc'"   , LTYPE, "STRING");
            await expectSubError("L - [1,2,3]" , LTYPE, "LIST");
            await expectSubError("L - {a=1}"   , LTYPE, "NAMESPACE");
            await expectSubError("L - (x->x)"  , LTYPE, "FUNCTION");
        });
    
        it("should return (x1-y1, x2-y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            expect(Array.from(await evaluate("(10,20,30) - (1,2,3)", ctx))).to.deep.equal([9,18,27]);
            expect(Array.from(await evaluate("(10,20,30) - (1,2)", ctx))).to.deep.equal([9,18,30]);
            expect(Array.from(await evaluate("(10,20) - (1,2,3)", ctx))).to.deep.equal([9,18]);
            expect(Array.from(await evaluate("(10,20,30) - 1", ctx))).to.deep.equal([9,20,30]);
            expect(await evaluate("10 - (1,2,3)", ctx)).to.equal(9);
        });
    });      
    
    describe("X * Y", () => {
    
        it("should return () if either X or Y is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
    
            expect(await evaluate("() * ()", ctx)).to.equal(null);
            expect(await evaluate("() * T", ctx)).to.equal(null);
            expect(await evaluate("() * F", ctx)).to.equal(null);
            expect(await evaluate("() * 10", ctx)).to.equal(null);
            expect(await evaluate("() * 'abc'", ctx)).to.equal(null);
            expect(await evaluate("() * fn", ctx)).to.equal(null);
            expect(await evaluate("() * ls", ctx)).to.equal(null);
            expect(await evaluate("() * ns", ctx)).to.equal(null);
            expect(await evaluate("() * (1,2,3)", ctx)).to.equal(null);
    
            expect(await evaluate("() * ()", ctx)).to.equal(null);
            expect(await evaluate("T * ()", ctx)).to.equal(null);
            expect(await evaluate("F * ()", ctx)).to.equal(null);
            expect(await evaluate("10 * ()", ctx)).to.equal(null);
            expect(await evaluate("'abc' * ()", ctx)).to.equal(null);
            expect(await evaluate("fn * ()", ctx)).to.equal(null);
            expect(await evaluate("ls * ()", ctx)).to.equal(null);
            expect(await evaluate("ns * ()", ctx)).to.equal(null);
            expect(await evaluate("(1,2,3) * ()", ctx)).to.equal(null);
        });
    
        it("should return `X&&Y` if both X and Y are booleans", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("T * T", ctx)).to.equal(true);
            expect(await evaluate("T * F", ctx)).to.equal(false);
            expect(await evaluate("F * T", ctx)).to.equal(false);
            expect(await evaluate("F * F", ctx)).to.equal(false);
        });
    
        it("should return `X*Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("10 * 2", ctx)).to.equal(20);
            expect(await evaluate("10 * 0", ctx)).to.equal(0);
            expect(await evaluate("10 * (-2)", ctx)).to.equal(-20);
        });
    
        it("should concatenate X times Y if X is a number and Y is a string", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("3 * 'Abc'", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("3.1 * 'Abc'", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("3.9 * 'Abc'", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("0 * 'Abc'", ctx)).to.equal("");
            expect(await evaluate("-2 * 'Abc'", ctx)).to.equal("");
        });
    
        it("should concatenate Y times X if Y is a number and X is a string", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("'Abc' * 3", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("'Abc' * 3.1", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("'Abc' * 3.9", ctx)).to.equal("AbcAbcAbc");
            expect(await evaluate("'Abc' * 0", ctx)).to.equal("");
            expect(await evaluate("'Abc' * (-2)", ctx)).to.equal("");
        });
    
        it("should concatenate X times Y if X is a number and Y is a list", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("3 * [1,2,3]", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("3.1 * [1,2,3]", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("3.9 * [1,2,3]", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("0 * [1,2,3]", ctx)).to.deep.equal([]);
            expect(await evaluate("-2 * [1,2,3]", ctx)).to.deep.equal([]);
        });
    
        it("should concatenate Y times X if Y is a number and X is a list", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("[1,2,3] * 3", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("[1,2,3] * 3.1", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("[1,2,3] * 3.9", ctx)).to.deep.equal([1,2,3,1,2,3,1,2,3]);
            expect(await evaluate("[1,2,3] * 0", ctx)).to.deep.equal([]);
            expect(await evaluate("[1,2,3] * (-2)", ctx)).to.deep.equal([]);
        });
    
        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectMulError = (expression, XType, YType) => expectException(() => evaluate(expression,ctx), `Product operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "BOOLEAN"; ctx.L = true; 
            await expectMulError("L * 10"      , LTYPE, "NUMBER");
            await expectMulError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectMulError("L * (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "BOOLEAN"; ctx.L = false; 
            await expectMulError("L * 10"      , LTYPE, "NUMBER");
            await expectMulError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectMulError("L * (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NUMBER"; ctx.L = 10;
            await expectMulError("L * T"       , LTYPE, "BOOLEAN");
            await expectMulError("L * F"       , LTYPE, "BOOLEAN");
            await expectMulError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectMulError("L * (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "STRING"; ctx.L = "abc";
            await expectMulError("L * T"       , LTYPE, "BOOLEAN");
            await expectMulError("L * F"       , LTYPE, "BOOLEAN");
            await expectMulError("L * 'def'"   , LTYPE, "STRING");
            await expectMulError("L * [1,2,3]" , LTYPE, "LIST");
            await expectMulError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectMulError("L * (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "LIST"; ctx.L = [1,2,3];
            await expectMulError("L * T"       , LTYPE, "BOOLEAN");
            await expectMulError("L * F"       , LTYPE, "BOOLEAN");
            await expectMulError("L * 'abc'"   , LTYPE, "STRING");
            await expectMulError("L * [4,5]"   , LTYPE, "LIST");
            await expectMulError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectMulError("L * (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NAMESPACE"; ctx.L = {a:1,b:2};
            await expectMulError("L * T"       , LTYPE, "BOOLEAN");
            await expectMulError("L * F"       , LTYPE, "BOOLEAN");
            await expectMulError("L * 1"       , LTYPE, "NUMBER");
            await expectMulError("L * 'abc'"   , LTYPE, "STRING");
            await expectMulError("L * [1,2,3]" , LTYPE, "LIST");
            await expectMulError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectMulError("L * (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "FUNCTION"; ctx.L = x=>x;
            await expectMulError("L * T"       , LTYPE, "BOOLEAN");
            await expectMulError("L * F"       , LTYPE, "BOOLEAN");
            await expectMulError("L * 1"       , LTYPE, "NUMBER");
            await expectMulError("L * 'abc'"   , LTYPE, "STRING");
            await expectMulError("L * [1,2,3]" , LTYPE, "LIST");
            await expectMulError("L * {a=1}"   , LTYPE, "NAMESPACE");
            await expectMulError("L * (x->x)"  , LTYPE, "FUNCTION");
        });
    
        it("should return (x1*y1, x2*y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            expect(Array.from(await evaluate("(T, 3, 'a', [1]) * (F, 2, 2, 2)",ctx))).to.deep.equal([false, 6, "aa", [1,1]]);
            expect(Array.from(await evaluate("(10,20,30) * (2,3,4)",ctx))).to.deep.equal([20,60,120]);
            expect(Array.from(await evaluate("(10,20,30) * (2,3)",ctx))).to.deep.equal([20,60]);
            expect(Array.from(await evaluate("(10,20) * (2,3,4)",ctx))).to.deep.equal([20,60]);
            expect(await evaluate("10 * (2,3,4)",ctx)).to.equal(20);
            expect(await evaluate("(10,20,30) * 2",ctx)).to.equal(20);
        });
    });
    
    describe("X / Y", () => {
    
        it("should return nothing if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() / ()", ctx)).to.equal(null);
            expect(await evaluate("() / T", ctx)).to.equal(null);
            expect(await evaluate("() / F", ctx)).to.equal(null);
            expect(await evaluate("() / 10", ctx)).to.equal(null);
            expect(await evaluate("() / 'abc'", ctx)).to.equal(null);
            expect(await evaluate("() / fn", ctx)).to.equal(null);
            expect(await evaluate("() / ls", ctx)).to.equal(null);
            expect(await evaluate("() / ns", ctx)).to.equal(null);
        });
    
        it("should return `X/Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("10 / 2", ctx)).to.equal(5);
            expect(await evaluate("20 / 0", ctx)).to.equal(Infinity);
            expect(await evaluate("10 / (-2)", ctx)).to.equal(-5);
        });
    
        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectDivError = (expression, XType, YType) => expectException(() => evaluate(expression,ctx), `Division operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "BOOLEAN"; ctx.L = true;
            await expectDivError("L / ()"      , LTYPE, "NOTHING");
            await expectDivError("L / 10"      , LTYPE, "NUMBER");
            await expectDivError("L / 'abc'"   , LTYPE, "STRING");
            await expectDivError("L / [1,2,3]" , LTYPE, "LIST");
            await expectDivError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectDivError("L / (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "BOOLEAN"; ctx.L = false;
            await expectDivError("L / ()"      , LTYPE, "NOTHING");
            await expectDivError("L / 10"      , LTYPE, "NUMBER");
            await expectDivError("L / 'abc'"   , LTYPE, "STRING");
            await expectDivError("L / [1,2,3]" , LTYPE, "LIST");
            await expectDivError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectDivError("L / (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NUMBER"; ctx.L = 10;
            await expectDivError("L / ()"      , LTYPE, "NOTHING");
            await expectDivError("L / T"       , LTYPE, "BOOLEAN");
            await expectDivError("L / F"       , LTYPE, "BOOLEAN");
            await expectDivError("L / 'abc'"   , LTYPE, "STRING");
            await expectDivError("L / [1,2,3]" , LTYPE, "LIST");
            await expectDivError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectDivError("L / (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "STRING"; ctx.L = "abc";
            await expectDivError("L / ()"      , LTYPE, "NOTHING");
            await expectDivError("L / T"       , LTYPE, "BOOLEAN");
            await expectDivError("L / F"       , LTYPE, "BOOLEAN");
            await expectDivError("L / 1"       , LTYPE, "NUMBER");
            await expectDivError("L / 'abc'"   , LTYPE, "STRING");
            await expectDivError("L / [1,2,3]" , LTYPE, "LIST");
            await expectDivError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectDivError("L / (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "LIST"; ctx.L = [1,2,3];
            await expectDivError("L / ()"      , LTYPE, "NOTHING");
            await expectDivError("L / T"       , LTYPE, "BOOLEAN");
            await expectDivError("L / F"       , LTYPE, "BOOLEAN");
            await expectDivError("L / 1"       , LTYPE, "NUMBER");
            await expectDivError("L / 'abc'"   , LTYPE, "STRING");
            await expectDivError("L / [1,2,3]" , LTYPE, "LIST");
            await expectDivError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectDivError("L / (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NAMESPACE"; ctx.L = {a:1,b:2};
            await expectDivError("L / ()"      , LTYPE, "NOTHING");
            await expectDivError("L / T"       , LTYPE, "BOOLEAN");
            await expectDivError("L / F"       , LTYPE, "BOOLEAN");
            await expectDivError("L / 1"       , LTYPE, "NUMBER");
            await expectDivError("L / 'abc'"   , LTYPE, "STRING");
            await expectDivError("L / [1,2,3]" , LTYPE, "LIST");
            await expectDivError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectDivError("L / (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "FUNCTION"; ctx.L = x=>x;
            await expectDivError("L / ()"      , LTYPE, "NOTHING");
            await expectDivError("L / T"       , LTYPE, "BOOLEAN");
            await expectDivError("L / F"       , LTYPE, "BOOLEAN");
            await expectDivError("L / 1"       , LTYPE, "NUMBER");
            await expectDivError("L / 'abc'"   , LTYPE, "STRING");
            await expectDivError("L / [1,2,3]" , LTYPE, "LIST");
            await expectDivError("L / {a=1}"   , LTYPE, "NAMESPACE");
            await expectDivError("L / (x->x)"  , LTYPE, "FUNCTION");
        });
    
        it("should return (x1/y1, x2/y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            var expectDivError = (expression, XType, YType) => expectException(() => evaluate(expression,ctx), `Division operation not defined between ${XType} and ${YType}`);
            expect(Array.from(await evaluate("(10,20,30) / (2,5,3)",ctx))).to.deep.equal([5,4,10]);
            expect(Array.from(await evaluate("(10,20) / (2,5,3)",ctx))).to.deep.equal([5,4]);
            expect(await evaluate("10 / (2,5,3)",ctx)).to.equal(5);
            expect(await evaluate("() / (2,4,3)",ctx)).to.equal(null);
            await expectDivError("(10,20,30) / (2,4)", "NUMBER","NOTHING");
            await expectDivError("(10,20,30) / 2", "NUMBER","NOTHING");
        });
    });
    
    describe("X % Y", () => {
    
        it("should return Y if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() % ()", ctx)).to.equal(null);
            expect(await evaluate("() % T", ctx)).to.equal(true);
            expect(await evaluate("() % F", ctx)).to.equal(false);
            expect(await evaluate("() % 10", ctx)).to.equal(10);
            expect(await evaluate("() % 'abc'", ctx)).to.equal('abc');
            expect(await evaluate("() % fn", ctx)).to.equal(ctx.fn);
            expect(await evaluate("() % ls", ctx)).to.equal(ctx.ls);
            expect(await evaluate("() % ns", ctx)).to.equal(ctx.ns);
        });
    
        it("should return `X/Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("10 % 4", ctx)).to.equal(2);
            expect(await evaluate("10 % (-4)", ctx)).to.equal(2);
        });
    
        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectModError = (expression, XType, YType) => expectException(() => evaluate(expression,ctx), `Modulo operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "BOOLEAN"; ctx.L = true;
            await expectModError("L % ()"      , LTYPE, "NOTHING");
            await expectModError("L % 10"      , LTYPE, "NUMBER");
            await expectModError("L % 'abc'"   , LTYPE, "STRING");
            await expectModError("L % [1,2,3]" , LTYPE, "LIST");
            await expectModError("L % {a=1}"   , LTYPE, "NAMESPACE");
            await expectModError("L % (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "BOOLEAN"; ctx.L = false;
            await expectModError("L % ()"      , LTYPE, "NOTHING");
            await expectModError("L % 10"      , LTYPE, "NUMBER");
            await expectModError("L % 'abc'"   , LTYPE, "STRING");
            await expectModError("L % [1,2,3]" , LTYPE, "LIST");
            await expectModError("L % {a=1}"   , LTYPE, "NAMESPACE");
            await expectModError("L % (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NUMBER"; ctx.L = 10;
            await expectModError("L % ()"      , LTYPE, "NOTHING");
            await expectModError("L % T"       , LTYPE, "BOOLEAN");
            await expectModError("L % F"       , LTYPE, "BOOLEAN");
            await expectModError("L % 'abc'"   , LTYPE, "STRING");
            await expectModError("L % [1,2,3]" , LTYPE, "LIST");
            await expectModError("L % {a=1}"   , LTYPE, "NAMESPACE");
            await expectModError("L % (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "STRING"; ctx.L = "abc";
            await expectModError("L % ()"      , LTYPE, "NOTHING");
            await expectModError("L % T"       , LTYPE, "BOOLEAN");
            await expectModError("L % F"       , LTYPE, "BOOLEAN");
            await expectModError("L % 1"       , LTYPE, "NUMBER");
            await expectModError("L % 'abc'"   , LTYPE, "STRING");
            await expectModError("L % [1,2,3]" , LTYPE, "LIST");
            await expectModError("L % {a=1}"   , LTYPE, "NAMESPACE");
            await expectModError("L % (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "LIST"; ctx.L = [1,2,3];
            await expectModError("L % ()"      , LTYPE, "NOTHING");
            await expectModError("L % T"       , LTYPE, "BOOLEAN");
            await expectModError("L % F"       , LTYPE, "BOOLEAN");
            await expectModError("L % 1"       , LTYPE, "NUMBER");
            await expectModError("L % 'abc'"   , LTYPE, "STRING");
            await expectModError("L % [1,2,3]" , LTYPE, "LIST");
            await expectModError("L % {a=1}"   , LTYPE, "NAMESPACE");
            await expectModError("L % (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NAMESPACE"; ctx.L = {a:1,b:2};
            await expectModError("L % ()"      , LTYPE, "NOTHING");
            await expectModError("L % T"       , LTYPE, "BOOLEAN");
            await expectModError("L % F"       , LTYPE, "BOOLEAN");
            await expectModError("L % 1"       , LTYPE, "NUMBER");
            await expectModError("L % 'abc'"   , LTYPE, "STRING");
            await expectModError("L % [1,2,3]" , LTYPE, "LIST");
            await expectModError("L % {a=1}"   , LTYPE, "NAMESPACE");
            await expectModError("L % (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "FUNCTION"; ctx.L = x=>x;
            await expectModError("L % ()"      , LTYPE, "NOTHING");
            await expectModError("L % T"       , LTYPE, "BOOLEAN");
            await expectModError("L % F"       , LTYPE, "BOOLEAN");
            await expectModError("L % 1"       , LTYPE, "NUMBER");
            await expectModError("L % 'abc'"   , LTYPE, "STRING");
            await expectModError("L % [1,2,3]" , LTYPE, "LIST");
            await expectModError("L % {a=1}"   , LTYPE, "NAMESPACE");
            await expectModError("L % (x->x)"  , LTYPE, "FUNCTION");
        });
    
        it("should return (x1/y1, x2/y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            var expectModError = (expression, XType, YType) => expectException(() => evaluate(expression,ctx), `Modulo operation not defined between ${XType} and ${YType}`);
            expect(Array.from(await evaluate("(10,20,30) % (4,7,8)",ctx))).to.deep.equal([2,6,6]);
            expect(Array.from(await evaluate("(10,20) % (4,7,8)",ctx))).to.deep.equal([2,6,8]);
            expect(Array.from(await evaluate("10 % (4,7,8)",ctx))).to.deep.equal([2,7,8]);
            expect(Array.from(await evaluate("() % (4,7,8)",ctx))).to.deep.equal([4,7,8]);
            await expectModError("(10,20,30) % (2,4)", "NUMBER","NOTHING");
            await expectModError("(10,20,30) % 2", "NUMBER","NOTHING");
        });
    });
    
    describe("X ^ Y", () => {
    
        it("should return nothing if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() ^ ()", ctx)).to.equal(null);
            expect(await evaluate("() ^ T", ctx)).to.equal(null);
            expect(await evaluate("() ^ F", ctx)).to.equal(null);
            expect(await evaluate("() ^ 10", ctx)).to.equal(null);
            expect(await evaluate("() ^ 'abc'", ctx)).to.equal(null);
            expect(await evaluate("() ^ fn", ctx)).to.equal(null);
            expect(await evaluate("() ^ ls", ctx)).to.equal(null);
            expect(await evaluate("() ^ ns", ctx)).to.equal(null);
        });
    
        it("should return `X**Y` if both X and Y are numbers", async () => {
            var ctx = createContext({T:true, F:false});
            expect(await evaluate("10 ^ 2", ctx)).to.equal(100);
            expect(await evaluate("20 ^ 0", ctx)).to.equal(1);
            expect(await evaluate("10 ^ (-2)", ctx)).to.equal(0.01);
        });
    
        it("should throw a runtime error for all the other singleton types", async () => {
            var ctx = createContext({T:true, F:false});
            var expectPowError = (expression, XType, YType) => expectException(() => evaluate(expression,ctx), `Exponentiation operation not defined between ${XType} and ${YType}`);
    
            var LTYPE = "BOOLEAN"; ctx.L = true;
            await expectPowError("L ^ ()"      , LTYPE, "NOTHING");
            await expectPowError("L ^ 10"      , LTYPE, "NUMBER");
            await expectPowError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectPowError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectPowError("L ^ (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "BOOLEAN"; ctx.L = false;
            await expectPowError("L ^ ()"      , LTYPE, "NOTHING");
            await expectPowError("L ^ 10"      , LTYPE, "NUMBER");
            await expectPowError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectPowError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectPowError("L ^ (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NUMBER"; ctx.L = 10;
            await expectPowError("L ^ ()"      , LTYPE, "NOTHING");
            await expectPowError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectPowError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectPowError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectPowError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectPowError("L ^ (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "STRING"; ctx.L = "abc";
            await expectPowError("L ^ ()"      , LTYPE, "NOTHING");
            await expectPowError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectPowError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectPowError("L ^ 1"       , LTYPE, "NUMBER");
            await expectPowError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectPowError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectPowError("L ^ (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "LIST"; ctx.L = [1,2,3];
            await expectPowError("L ^ ()"      , LTYPE, "NOTHING");
            await expectPowError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectPowError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectPowError("L ^ 1"       , LTYPE, "NUMBER");
            await expectPowError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectPowError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectPowError("L ^ (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "NAMESPACE"; ctx.L = {a:1,b:2};
            await expectPowError("L ^ ()"      , LTYPE, "NOTHING");
            await expectPowError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectPowError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectPowError("L ^ 1"       , LTYPE, "NUMBER");
            await expectPowError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectPowError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectPowError("L ^ (x->x)"  , LTYPE, "FUNCTION");
    
            var LTYPE = "FUNCTION"; ctx.L = x=>x;
            await expectPowError("L ^ ()"      , LTYPE, "NOTHING");
            await expectPowError("L ^ T"       , LTYPE, "BOOLEAN");
            await expectPowError("L ^ F"       , LTYPE, "BOOLEAN");
            await expectPowError("L ^ 1"       , LTYPE, "NUMBER");
            await expectPowError("L ^ 'abc'"   , LTYPE, "STRING");
            await expectPowError("L ^ [1,2,3]" , LTYPE, "LIST");
            await expectPowError("L ^ {a=1}"   , LTYPE, "NAMESPACE");
            await expectPowError("L ^ (x->x)"  , LTYPE, "FUNCTION");
        });
    
        it("should return (x1^y1, x2^y2, ...) if X and/or Y is a tuple", async () => {
            var ctx = createContext({T:true, F:false});
            var expectPowError = (expression, XType, YType) => expectException(() => evaluate(expression,ctx), `Exponentiation operation not defined between ${XType} and ${YType}`);
            expect(Array.from(await evaluate("(10,20,30) ^ (2,3,4)",ctx))).to.deep.equal([10**2,20**3,30**4]);
            expect(Array.from(await evaluate("(10,20) ^ (2,3,4)",ctx))).to.deep.equal([10**2,20**3]);
            expect(await evaluate("10 ^ (2,3,4)",ctx)).to.equal(10**2);
            expect(await evaluate("() ^ (2,3,4)",ctx)).to.equal(null);
            await expectPowError("(10,20,30) ^ (2,4)", "NUMBER","NOTHING");
            await expectPowError("(10,20,30) ^ 2", "NUMBER","NOTHING");
        });
    });        
    
    
    // COMPARISON OPERATORS
    
    describe("X == Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() == ()", ctx)).to.equal(true);            
        });
    
        it("should return true if X and Y are both true or both false", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T == T", ctx)).to.equal(true);            
            expect(await evaluate("F == F", ctx)).to.equal(true);            
            expect(await evaluate("T == F", ctx)).to.equal(false);            
            expect(await evaluate("F == T", ctx)).to.equal(false);            
        });
    
        it("should return true if X and Y are the same number", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("3 == 3", ctx)).to.equal(true);            
            expect(await evaluate("0 == 0", ctx)).to.equal(true);            
            expect(await evaluate("-3 == -3", ctx)).to.equal(true);            
            expect(await evaluate("3 == 2", ctx)).to.equal(false);            
            expect(await evaluate("0 == -4", ctx)).to.equal(false);            
        });
    
        it("should return true if X and Y are the same string", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' == 'abc'", ctx)).to.equal(true);            
            expect(await evaluate("'' == ''", ctx)).to.equal(true);            
            expect(await evaluate("'abc' == 'def'", ctx)).to.equal(false);                        
            expect(await evaluate("'abc' == ''", ctx)).to.equal(false);                        
        });
    
        it("should return true if X and Y are both lists with equal items", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] == [1,2,3]", ctx)).to.equal(true);                        
            expect(await evaluate("[] == []", ctx)).to.equal(true);            
            expect(await evaluate("[1,2,3] == [4,5,6]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,3] == []", ctx)).to.equal(false);                        
        });
    
        it("should return true if X and Y are both namespace with sname name:value pairs", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("{a=1,b=2} == {a=1,b=2}", ctx)).to.equal(true);                        
            expect(await evaluate("{} == {}", ctx)).to.equal(true);            
            expect(await evaluate("{a=1,b=2} == {a=1,c=2}", ctx)).to.equal(false);                        
            expect(await evaluate("{a=1,b=2} == {a=1,b=3}", ctx)).to.equal(false);                        
            expect(await evaluate("{a=1,b=2} == {a=1}", ctx)).to.equal(false);                        
            expect(await evaluate("{a=1,b=2} == {}", ctx)).to.equal(false);                        
            expect(await evaluate("{a=1} == {a=1,b=2}", ctx)).to.equal(false);                        
            expect(await evaluate("{} == {a=1,b=2}", ctx)).to.equal(false);                        
        });
    
        it("should return true if X and Y are the same function", async () => {
            var ctx = createContext({fn1:x=>2*x, fn2:x=>2*x});
            expect(await evaluate("fn1 == fn1", ctx)).to.equal(true);                                    
            expect(await evaluate("fn1 == fn2", ctx)).to.equal(false);                                    
            expect(await evaluate("(x->2*x) == (x->2*x)", ctx)).to.equal(false);                                    
            expect(await evaluate("(x->2*x) == fn1", ctx)).to.equal(false);                                    
            expect(await evaluate("fn1 == (x->2*x)", ctx)).to.equal(false);                                    
        });
    
        it("should return false if X and Y are of different types", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
    
            expect(await evaluate("() == T", ctx)).to.equal(false);                                    
            expect(await evaluate("() == F", ctx)).to.equal(false);                                    
            expect(await evaluate("() == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("() == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("() == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("() == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("() == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("T == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("T == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("T == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("T == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("T == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("T == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("F == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("F == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("F == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("F == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("F == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("F == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("1 == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == T", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == F", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("'abc' == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == T", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == F", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("ls == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == T", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == F", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == ns", ctx)).to.equal(false);                                    
            expect(await evaluate("ls == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("ns == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == T", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == F", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("ns == fn", ctx)).to.equal(false);                                    
    
            expect(await evaluate("fn == ()", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == T", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == F", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == 1", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == ls", ctx)).to.equal(false);                                    
            expect(await evaluate("fn == ns", ctx)).to.equal(false);                                    
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) == (1,2,3)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,3) == (1,2)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2) == (1,2,3)", ctx)).to.equal(false);                                    
            expect(await evaluate("1 == (1,2,3)", ctx)).to.equal(false);                                    
            expect(await evaluate("(1,2,3) == 1", ctx)).to.equal(false);                                    
        });
    });
    
    describe("X != Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() != ()", ctx)).to.equal(false);            
        });
    
        it("should return false if X and Y are both false or both true", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T != T", ctx)).to.equal(false);            
            expect(await evaluate("F != F", ctx)).to.equal(false);            
            expect(await evaluate("T != F", ctx)).to.equal(true);            
            expect(await evaluate("F != T", ctx)).to.equal(true);            
        });
    
        it("should return false if X and Y are the same number", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("3 != 3", ctx)).to.equal(false);            
            expect(await evaluate("0 != 0", ctx)).to.equal(false);            
            expect(await evaluate("-3 != -3", ctx)).to.equal(false);            
            expect(await evaluate("3 != 2", ctx)).to.equal(true);            
            expect(await evaluate("0 != -4", ctx)).to.equal(true);            
        });
    
        it("should return false if X and Y are the same string", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' != 'abc'", ctx)).to.equal(false);            
            expect(await evaluate("'' != ''", ctx)).to.equal(false);            
            expect(await evaluate("'abc' != 'def'", ctx)).to.equal(true);                        
            expect(await evaluate("'abc' != ''", ctx)).to.equal(true);                        
        });
    
        it("should return false if X and Y are both lists with equal items", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] != [1,2,3]", ctx)).to.equal(false);                        
            expect(await evaluate("[] != []", ctx)).to.equal(false);            
            expect(await evaluate("[1,2,3] != [4,5,6]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,3] != []", ctx)).to.equal(true);                        
        });
    
        it("should return false if X and Y are both namespace with sname name:value pairs", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("{a=1,b=2} != {a=1,b=2}", ctx)).to.equal(false);                        
            expect(await evaluate("{} != {}", ctx)).to.equal(false);            
            expect(await evaluate("{a=1,b=2} != {a=1,c=2}", ctx)).to.equal(true);                        
            expect(await evaluate("{a=1,b=2} != {a=1,b=3}", ctx)).to.equal(true);                        
            expect(await evaluate("{a=1,b=2} != {a=1}", ctx)).to.equal(true);                        
            expect(await evaluate("{a=1,b=2} != {}", ctx)).to.equal(true);                        
            expect(await evaluate("{a=1} != {a=1,b=2}", ctx)).to.equal(true);                        
            expect(await evaluate("{} != {a=1,b=2}", ctx)).to.equal(true);                        
        });
    
        it("should return false if X and Y are the same function", async () => {
            var ctx = createContext({fn1:x=>2*x, fn2:x=>2*x});
            expect(await evaluate("fn1 != fn1", ctx)).to.equal(false);                                    
            expect(await evaluate("fn1 != fn2", ctx)).to.equal(true);                                    
            expect(await evaluate("(x->2*x) != (x->2*x)", ctx)).to.equal(true);                                    
            expect(await evaluate("(x->2*x) != fn1", ctx)).to.equal(true);                                    
            expect(await evaluate("fn1 != (x->2*x)", ctx)).to.equal(true);                                    
        });
    
        it("should return true if X and Y are of different types", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
    
            expect(await evaluate("() != T", ctx)).to.equal(true);                                    
            expect(await evaluate("() != F", ctx)).to.equal(true);                                    
            expect(await evaluate("() != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("() != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("() != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("() != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("() != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("T != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("T != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("T != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("T != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("T != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("T != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("F != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("F != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("F != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("F != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("F != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("F != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("1 != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != T", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != F", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("'abc' != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != T", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != F", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("ls != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != T", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != F", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != ns", ctx)).to.equal(true);                                    
            expect(await evaluate("ls != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("ns != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != T", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != F", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("ns != fn", ctx)).to.equal(true);                                    
    
            expect(await evaluate("fn != ()", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != T", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != F", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != 1", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != ls", ctx)).to.equal(true);                                    
            expect(await evaluate("fn != ns", ctx)).to.equal(true);                                    
        });
    
        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) != (1,2,3)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,3) != (1,2)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2) != (1,2,3)", ctx)).to.equal(true);                                    
            expect(await evaluate("1 != (1,2,3)", ctx)).to.equal(true);                                    
            expect(await evaluate("(1,2,3) != 1", ctx)).to.equal(true);                                    
        });
    });    
    
    describe("X < Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() < ()", ctx)).to.equal(false);            
        });
    
        it("should return true if X is false and Y is true", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T < T", ctx)).to.equal(false);            
            expect(await evaluate("F < F", ctx)).to.equal(false);            
            expect(await evaluate("T < F", ctx)).to.equal(false);            
            expect(await evaluate("F < T", ctx)).to.equal(true);            
        });
    
        it("should return true if X is a lower number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("1 < 2", ctx)).to.equal(true);            
            expect(await evaluate("0 < 2", ctx)).to.equal(true);            
            expect(await evaluate("-1 < 2", ctx)).to.equal(true);            
            expect(await evaluate("2 < 1", ctx)).to.equal(false);            
            expect(await evaluate("2 < 0", ctx)).to.equal(false);            
            expect(await evaluate("2 < (-2)", ctx)).to.equal(false);            
            expect(await evaluate("2 < 2", ctx)).to.equal(false);            
        });
    
        it("should return true if X and Y are both strings and X precedes Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' < 'def'", ctx)).to.equal(true);            
            expect(await evaluate("'abc' < 'abd'", ctx)).to.equal(true);            
            expect(await evaluate("'ab' < 'abc'", ctx)).to.equal(true);            
            expect(await evaluate("'' < 'abc'", ctx)).to.equal(true);            
            expect(await evaluate("'abc' < 'abc'", ctx)).to.equal(false);                        
            expect(await evaluate("'abd' < 'abc'", ctx)).to.equal(false);                        
            expect(await evaluate("'abc' < 'ab'", ctx)).to.equal(false);                        
            expect(await evaluate("'abc' < ''", ctx)).to.equal(false);                        
        });
    
        it("should return true if X and Y are both lists and X precedes Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] < [4,5,6]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2,3] < [1,2,4]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2] < [1,2,4]", ctx)).to.equal(true);
            expect(await evaluate("[] < [1,2,3]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2,3] < [1,2,3]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,4] < [1,2,3]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,4] < [1,2]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,3] < []", ctx)).to.equal(false);                        
        });
        
        it("should return true if X is nothing and Y is not", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("() < T", ctx)).to.equal(true);                                    
            expect(await evaluate("() < F", ctx)).to.equal(true);                                    
            expect(await evaluate("() < 1", ctx)).to.equal(true);                                    
            expect(await evaluate("() < 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("() < ls", ctx)).to.equal(true);                                    
            expect(await evaluate("() < ns", ctx)).to.equal(true);                                    
            expect(await evaluate("() < fn", ctx)).to.equal(true);                                                
        });

        it("should return false if Y is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("T < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("F < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("1 < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ls < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ns < ()", ctx)).to.equal(false);                                    
            expect(await evaluate("fn < ()", ctx)).to.equal(false);                                                            
        });
    
        it("should throw an exception for any other type combination", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            var expectCmpError = (expression, xType, yType) => expectException(() => evaluate(expression, ctx), `Comparison operation not defined between ${xType} and ${yType}`);

            var xType='BOOLEAN'; ctx.x = false;
            await expectCmpError("x < 1",     xType, 'NUMBER');                                    
            await expectCmpError("x < 'abc'", xType, 'STRING');                                    
            await expectCmpError("x < ls",    xType, 'LIST');                                    
            await expectCmpError("x < ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x < fn",    xType, 'FUNCTION');                                                
            
            var xType='BOOLEAN'; ctx.x = true;
            await expectCmpError("x < 1",     xType, 'NUMBER');                                    
            await expectCmpError("x < 'abc'", xType, 'STRING');                                    
            await expectCmpError("x < ls",    xType, 'LIST');                                    
            await expectCmpError("x < ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x < fn",    xType, 'FUNCTION');                                                
            
            var xType='NUMBER'; ctx.x = 10;
            await expectCmpError("x < T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x < F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x < 'abc'", xType, 'STRING');                                    
            await expectCmpError("x < ls",    xType, 'LIST');                                    
            await expectCmpError("x < ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x < fn",    xType, 'FUNCTION');                                                
            
            var xType='STRING'; ctx.x = 'abc';
            await expectCmpError("x < T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x < F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x < 10",    xType, 'NUMBER');                                    
            await expectCmpError("x < ls",    xType, 'LIST');                                    
            await expectCmpError("x < ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x < fn",    xType, 'FUNCTION');                                                
            
            var xType='LIST'; ctx.x = [1,2,3];
            await expectCmpError("x < T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x < F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x < 10",    xType, 'NUMBER');                                    
            await expectCmpError("x < 'abc'", xType, 'STRING');                                    
            await expectCmpError("x < ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x < fn",    xType, 'FUNCTION');                                                
            
            var xType='NAMESPACE'; ctx.x = {a:1,b:2};
            await expectCmpError("x < T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x < F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x < 10",    xType, 'NUMBER');                                    
            await expectCmpError("x < 'abc'", xType, 'STRING');                                    
            await expectCmpError("x < ls",    xType, 'LIST');                                    
            await expectCmpError("x < ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x < fn",    xType, 'FUNCTION');                                                

            var xType='FUNCTION'; ctx.x = x=>2*x;
            await expectCmpError("x < T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x < F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x < 10",    xType, 'NUMBER');                                    
            await expectCmpError("x < 'abc'", xType, 'STRING');                                    
            await expectCmpError("x < ls",    xType, 'LIST');                                    
            await expectCmpError("x < ns",    xType, 'NAMESPACE');                                                
            await expectCmpError("x < fn",    xType, 'FUNCTION');                                                
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) < (4,5,6)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2,3) < (1,2,4)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2) < (1,2,4)", ctx)).to.equal(true);            
            expect(await evaluate("() < (1,2,3)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2,3) < (1,2,3)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,4) < (1,2,3)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,4) < (1,2)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,3) < ()", ctx)).to.equal(false);                        
        });
    });
    
    describe("X >= Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() >= ()", ctx)).to.equal(true);            
        });
    
        it("should return false if X is false and Y is true", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T >= T", ctx)).to.equal(true);            
            expect(await evaluate("F >= F", ctx)).to.equal(true);     
            expect(await evaluate("T >= F", ctx)).to.equal(true);            
            expect(await evaluate("F >= T", ctx)).to.equal(false);            
        });
    
        it("should return false if X is a lower number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("1 >= 2", ctx)).to.equal(false);            
            expect(await evaluate("0 >= 2", ctx)).to.equal(false);            
            expect(await evaluate("-1 >= 2", ctx)).to.equal(false);            
            expect(await evaluate("2 >= 1", ctx)).to.equal(true);            
            expect(await evaluate("2 >= 0", ctx)).to.equal(true);            
            expect(await evaluate("2 >= (-2)", ctx)).to.equal(true);            
            expect(await evaluate("2 >= 2", ctx)).to.equal(true);            
        });
    
        it("should return false if X and Y are both strings and X precedes Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' >= 'def'", ctx)).to.equal(false);            
            expect(await evaluate("'abc' >= 'abd'", ctx)).to.equal(false);            
            expect(await evaluate("'ab' >= 'abc'", ctx)).to.equal(false);            
            expect(await evaluate("'' >= 'abc'", ctx)).to.equal(false);            
            expect(await evaluate("'abc' >= 'abc'", ctx)).to.equal(true);                        
            expect(await evaluate("'abd' >= 'abc'", ctx)).to.equal(true);                        
            expect(await evaluate("'abc' >= 'ab'", ctx)).to.equal(true);                        
            expect(await evaluate("'abc' >= ''", ctx)).to.equal(true);                        
        });
    
        it("should return false if X and Y are both lists and X precedes Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] >= [4,5,6]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2,3] >= [1,2,4]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2] >= [1,2,4]", ctx)).to.equal(false);            
            expect(await evaluate("[] >= [1,2,3]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2,3] >= [1,2,3]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,4] >= [1,2,3]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,4] >= [1,2]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,3] >= []", ctx)).to.equal(true);                        
        });
    
        it("should return false if X is nothing and Y is not", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("() >= T", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= F", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= 1", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= ls", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= ns", ctx)).to.equal(false);                                    
            expect(await evaluate("() >= fn", ctx)).to.equal(false);                                                
        });

        it("should return true if Y is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("T >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("F >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("1 >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ls >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ns >= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("fn >= ()", ctx)).to.equal(true);                                                            
        });

        it("should throw an exception for any other type combination", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            var expectCmpError = (expression, xType, yType) => expectException(() => evaluate(expression, ctx), `Comparison operation not defined between ${xType} and ${yType}`);

            var xType='BOOLEAN'; ctx.x = false;
            await expectCmpError("x >= 1",     xType, 'NUMBER');                                    
            await expectCmpError("x >= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x >= ls",    xType, 'LIST');                                    
            await expectCmpError("x >= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x >= fn",    xType, 'FUNCTION');                                                
            
            var xType='BOOLEAN'; ctx.x = true;
            await expectCmpError("x >= 1",     xType, 'NUMBER');                                    
            await expectCmpError("x >= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x >= ls",    xType, 'LIST');                                    
            await expectCmpError("x >= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x >= fn",    xType, 'FUNCTION');                                                
            
            var xType='NUMBER'; ctx.x = 10;
            await expectCmpError("x >= T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x >= F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x >= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x >= ls",    xType, 'LIST');                                    
            await expectCmpError("x >= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x >= fn",    xType, 'FUNCTION');                                                
            
            var xType='STRING'; ctx.x = 'abc';
            await expectCmpError("x >= T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x >= F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x >= 10",    xType, 'NUMBER');                                    
            await expectCmpError("x >= ls",    xType, 'LIST');                                    
            await expectCmpError("x >= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x >= fn",    xType, 'FUNCTION');                                                
            
            var xType='LIST'; ctx.x = [1,2,3];
            await expectCmpError("x >= T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x >= F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x >= 10",    xType, 'NUMBER');                                    
            await expectCmpError("x >= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x >= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x >= fn",    xType, 'FUNCTION');                                                
            
            var xType='NAMESPACE'; ctx.x = {a:1,b:2};
            await expectCmpError("x >= T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x >= F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x >= 10",    xType, 'NUMBER');                                    
            await expectCmpError("x >= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x >= ls",    xType, 'LIST');                                    
            await expectCmpError("x >= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x >= fn",    xType, 'FUNCTION');                                                

            var xType='FUNCTION'; ctx.x = x=>2*x;
            await expectCmpError("x >= T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x >= F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x >= 10",    xType, 'NUMBER');                                    
            await expectCmpError("x >= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x >= ls",    xType, 'LIST');                                    
            await expectCmpError("x >= ns",    xType, 'NAMESPACE');                                                
            await expectCmpError("x >= fn",    xType, 'FUNCTION');                                                
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) >= (4,5,6)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2,3) >= (1,2,4)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2) >= (1,2,4)", ctx)).to.equal(false);            
            expect(await evaluate("() >= (1,2,3)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2,3) >= (1,2,3)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,4) >= (1,2,3)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,4) >= (1,2)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,3) >= ()", ctx)).to.equal(true);                        
        });
    });    
    
    describe("X > Y", () => {
    
        it("should return false if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() > ()", ctx)).to.equal(false);            
        });
    
        it("should return true if X is true and Y is false", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T > T", ctx)).to.equal(false);            
            expect(await evaluate("F > F", ctx)).to.equal(false);            
            expect(await evaluate("T > F", ctx)).to.equal(true);            
            expect(await evaluate("F > T", ctx)).to.equal(false);            
        });
    
        it("should return true if X is a higher number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("1 > 2", ctx)).to.equal(false);            
            expect(await evaluate("0 > 2", ctx)).to.equal(false);            
            expect(await evaluate("-1 > 2", ctx)).to.equal(false);            
            expect(await evaluate("2 > 1", ctx)).to.equal(true);            
            expect(await evaluate("2 > 0", ctx)).to.equal(true);            
            expect(await evaluate("2 > (-2)", ctx)).to.equal(true);            
            expect(await evaluate("2 > 2", ctx)).to.equal(false);            
        });
    
        it("should return true if X and Y are both strings and X follows Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' > 'def'", ctx)).to.equal(false);            
            expect(await evaluate("'abc' > 'abd'", ctx)).to.equal(false);            
            expect(await evaluate("'ab' > 'abc'", ctx)).to.equal(false);            
            expect(await evaluate("'' > 'abc'", ctx)).to.equal(false);            
            expect(await evaluate("'abc' > 'abc'", ctx)).to.equal(false);                        
            expect(await evaluate("'abd' > 'abc'", ctx)).to.equal(true);                        
            expect(await evaluate("'abc' > 'ab'", ctx)).to.equal(true);                        
            expect(await evaluate("'abc' > ''", ctx)).to.equal(true);                        
        });
    
        it("should return true if X and Y are both lists and X follows Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] > [4,5,6]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2,3] > [1,2,4]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2] > [1,2,4]", ctx)).to.equal(false);            
            expect(await evaluate("[] > [1,2,3]", ctx)).to.equal(false);            
            expect(await evaluate("[1,2,3] > [1,2,3]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,4] > [1,2,3]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,4] > [1,2]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,3] > []", ctx)).to.equal(true);                        
        });
    
        it("should return false if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() > ()", ctx)).to.equal(false);                                    
            expect(await evaluate("() > T", ctx)).to.equal(false);                                    
            expect(await evaluate("() > F", ctx)).to.equal(false);                                    
            expect(await evaluate("() > 1", ctx)).to.equal(false);                                    
            expect(await evaluate("() > 'abc'", ctx)).to.equal(false);                                    
            expect(await evaluate("() > ls", ctx)).to.equal(false);                                    
            expect(await evaluate("() > ns", ctx)).to.equal(false);                                    
            expect(await evaluate("() > fn", ctx)).to.equal(false);                                                
        });

        it("should return true if Y is nothing and X is not", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() > ()", ctx)).to.equal(false);                                    
            expect(await evaluate("T > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("F > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("1 > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("'abc' > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ls > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("ns > ()", ctx)).to.equal(true);                                    
            expect(await evaluate("fn > ()", ctx)).to.equal(true);                                                            
        });
        
        it("should throw an exception for any other type combination", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            var expectCmpError = (expression, xType, yType) => expectException(() => evaluate(expression, ctx), `Comparison operation not defined between ${xType} and ${yType}`);

            var xType='BOOLEAN'; ctx.x = false;
            await expectCmpError("x > 1",     xType, 'NUMBER');                                    
            await expectCmpError("x > 'abc'", xType, 'STRING');                                    
            await expectCmpError("x > ls",    xType, 'LIST');                                    
            await expectCmpError("x > ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x > fn",    xType, 'FUNCTION');                                                
            
            var xType='BOOLEAN'; ctx.x = true;
            await expectCmpError("x > 1",     xType, 'NUMBER');                                    
            await expectCmpError("x > 'abc'", xType, 'STRING');                                    
            await expectCmpError("x > ls",    xType, 'LIST');                                    
            await expectCmpError("x > ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x > fn",    xType, 'FUNCTION');                                                
            
            var xType='NUMBER'; ctx.x = 10;
            await expectCmpError("x > T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x > F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x > 'abc'", xType, 'STRING');                                    
            await expectCmpError("x > ls",    xType, 'LIST');                                    
            await expectCmpError("x > ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x > fn",    xType, 'FUNCTION');                                                
            
            var xType='STRING'; ctx.x = 'abc';
            await expectCmpError("x > T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x > F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x > 10",    xType, 'NUMBER');                                    
            await expectCmpError("x > ls",    xType, 'LIST');                                    
            await expectCmpError("x > ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x > fn",    xType, 'FUNCTION');                                                
            
            var xType='LIST'; ctx.x = [1,2,3];
            await expectCmpError("x > T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x > F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x > 10",    xType, 'NUMBER');                                    
            await expectCmpError("x > 'abc'", xType, 'STRING');                                    
            await expectCmpError("x > ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x > fn",    xType, 'FUNCTION');                                                
            
            var xType='NAMESPACE'; ctx.x = {a:1,b:2};
            await expectCmpError("x > T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x > F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x > 10",    xType, 'NUMBER');                                    
            await expectCmpError("x > 'abc'", xType, 'STRING');                                    
            await expectCmpError("x > ls",    xType, 'LIST');                                    
            await expectCmpError("x > ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x > fn",    xType, 'FUNCTION');                                                

            var xType='FUNCTION'; ctx.x = x=>2*x;
            await expectCmpError("x > T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x > F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x > 10",    xType, 'NUMBER');                                    
            await expectCmpError("x > 'abc'", xType, 'STRING');                                    
            await expectCmpError("x > ls",    xType, 'LIST');                                    
            await expectCmpError("x > ns",    xType, 'NAMESPACE');                                                
            await expectCmpError("x > fn",    xType, 'FUNCTION');                                                
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) > (4,5,6)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2,3) > (1,2,4)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2) > (1,2,4)", ctx)).to.equal(false);            
            expect(await evaluate("() > (1,2,3)", ctx)).to.equal(false);            
            expect(await evaluate("(1,2,3) > (1,2,3)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,4) > (1,2,3)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,4) > (1,2)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,3) > ()", ctx)).to.equal(true);                        
        });
    });
    
    describe("X <= Y", () => {
    
        it("should return true if both X and Y are nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() <= ()", ctx)).to.equal(true);            
        });
    
        it("should return false if X is true and Y is false", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("T <= T", ctx)).to.equal(true);            
            expect(await evaluate("F <= F", ctx)).to.equal(true);            
            expect(await evaluate("T <= F", ctx)).to.equal(false);            
            expect(await evaluate("F <= T", ctx)).to.equal(true);            
        });
    
        it("should return false if X is a higher number than Y", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("1 <= 2", ctx)).to.equal(true);            
            expect(await evaluate("0 <= 2", ctx)).to.equal(true);            
            expect(await evaluate("-1 <= 2", ctx)).to.equal(true);            
            expect(await evaluate("2 <= 1", ctx)).to.equal(false);            
            expect(await evaluate("2 <= 0", ctx)).to.equal(false);            
            expect(await evaluate("2 <= (-2)", ctx)).to.equal(false);            
            expect(await evaluate("2 <= 2", ctx)).to.equal(true);            
        });
    
        it("should return false if X and Y are both strings and X follows Y alphabetically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("'abc' <= 'def'", ctx)).to.equal(true);            
            expect(await evaluate("'abc' <= 'abd'", ctx)).to.equal(true);            
            expect(await evaluate("'ab' <= 'abc'", ctx)).to.equal(true);            
            expect(await evaluate("'' <= 'abc'", ctx)).to.equal(true);            
            expect(await evaluate("'abc' <= 'abc'", ctx)).to.equal(true);                        
            expect(await evaluate("'abd' <= 'abc'", ctx)).to.equal(false);                        
            expect(await evaluate("'abc' <= 'ab'", ctx)).to.equal(false);                        
            expect(await evaluate("'abc' <= ''", ctx)).to.equal(false);                        
        });
    
        it("should return false if X and Y are both lists and X follows Y lexicographically", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("[1,2,3] <= [4,5,6]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2,3] <= [1,2,4]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2] <= [1,2,4]", ctx)).to.equal(true);            
            expect(await evaluate("[] <= [1,2,3]", ctx)).to.equal(true);            
            expect(await evaluate("[1,2,3] <= [1,2,3]", ctx)).to.equal(true);                        
            expect(await evaluate("[1,2,4] <= [1,2,3]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,4] <= [1,2]", ctx)).to.equal(false);                        
            expect(await evaluate("[1,2,3] <= []", ctx)).to.equal(false);                        
        });
    
        it("should return true if X is nothing", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() <= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= T", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= F", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= 1", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= 'abc'", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= ls", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= ns", ctx)).to.equal(true);                                    
            expect(await evaluate("() <= fn", ctx)).to.equal(true);                                                
        });

        it("should return false if Y is nothing and X is not", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("() <= ()", ctx)).to.equal(true);                                    
            expect(await evaluate("T <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("F <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("1 <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("'abc' <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ls <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("ns <= ()", ctx)).to.equal(false);                                    
            expect(await evaluate("fn <= ()", ctx)).to.equal(false);                                                            
        });
    
        it("should throw an exception for any other type combination", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            var expectCmpError = (expression, xType, yType) => expectException(() => evaluate(expression, ctx), `Comparison operation not defined between ${xType} and ${yType}`);

            var xType='BOOLEAN'; ctx.x = false;
            await expectCmpError("x <= 1",     xType, 'NUMBER');                                    
            await expectCmpError("x <= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x <= ls",    xType, 'LIST');                                    
            await expectCmpError("x <= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x <= fn",    xType, 'FUNCTION');                                                
            
            var xType='BOOLEAN'; ctx.x = true;
            await expectCmpError("x <= 1",     xType, 'NUMBER');                                    
            await expectCmpError("x <= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x <= ls",    xType, 'LIST');                                    
            await expectCmpError("x <= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x <= fn",    xType, 'FUNCTION');                                                
            
            var xType='NUMBER'; ctx.x = 10;
            await expectCmpError("x <= T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x <= F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x <= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x <= ls",    xType, 'LIST');                                    
            await expectCmpError("x <= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x <= fn",    xType, 'FUNCTION');                                                
            
            var xType='STRING'; ctx.x = 'abc';
            await expectCmpError("x <= T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x <= F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x <= 10",    xType, 'NUMBER');                                    
            await expectCmpError("x <= ls",    xType, 'LIST');                                    
            await expectCmpError("x <= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x <= fn",    xType, 'FUNCTION');                                                
            
            var xType='LIST'; ctx.x = [1,2,3];
            await expectCmpError("x <= T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x <= F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x <= 10",    xType, 'NUMBER');                                    
            await expectCmpError("x <= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x <= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x <= fn",    xType, 'FUNCTION');                                                
            
            var xType='NAMESPACE'; ctx.x = {a:1,b:2};
            await expectCmpError("x <= T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x <= F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x <= 10",    xType, 'NUMBER');                                    
            await expectCmpError("x <= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x <= ls",    xType, 'LIST');                                    
            await expectCmpError("x <= ns",    xType, 'NAMESPACE');                                    
            await expectCmpError("x <= fn",    xType, 'FUNCTION');                                                

            var xType='FUNCTION'; ctx.x = x=>2*x;
            await expectCmpError("x <= T",     xType, 'BOOLEAN');                                    
            await expectCmpError("x <= F",     xType, 'BOOLEAN');                                    
            await expectCmpError("x <= 10",    xType, 'NUMBER');                                    
            await expectCmpError("x <= 'abc'", xType, 'STRING');                                    
            await expectCmpError("x <= ls",    xType, 'LIST');                                    
            await expectCmpError("x <= ns",    xType, 'NAMESPACE');                                                
            await expectCmpError("x <= fn",    xType, 'FUNCTION');                                                
        });

        it("should compare tuples with lexicographical criteria", async () => {
            var ctx = createContext({fn:()=>{}, ls:[1,2,3], ns:{a:1,b:2,c:3}, T:true, F:false});
            expect(await evaluate("(1,2,3) <= (4,5,6)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2,3) <= (1,2,4)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2) <= (1,2,4)", ctx)).to.equal(true);            
            expect(await evaluate("() <= (1,2,3)", ctx)).to.equal(true);            
            expect(await evaluate("(1,2,3) <= (1,2,3)", ctx)).to.equal(true);                        
            expect(await evaluate("(1,2,4) <= (1,2,3)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,4) <= (1,2)", ctx)).to.equal(false);                        
            expect(await evaluate("(1,2,3) <= ()", ctx)).to.equal(false);                        
        });
    });
    
    
    // MISCELLANEOUS
    
    describe("string templates", () => {
        
        it("should evaluate the expressions between ${...} when the string is enclosed between accent quotes", async () => {
            var ctx = createContext({y:2});
            expect(await evaluate("`x = ${1+y}`", ctx)).to.equal("x = 3");
        });

        it("should evaluate the expressions in a child context", async () => {
            var ctx = createContext({x:10, y:20});
            expect(await evaluate("`${x=2}x+y = ${x+y}`", ctx)).to.equal("x+y = 22");
            expect(ctx.x).to.equal(10);
        });
    });
    
    describe("operators precedence and grouping", () => {
        
        it("should execute assignment operations (`=`) before pairing operations (`,`)", async () => {
            var ctx = createContext();
            
            await evaluate("x = 1,2,3", ctx);
            expect(ctx.x).to.equal(1);
            
            await evaluate("x = (1,2,3)", ctx);
            expect(ctx.x).to.be.instanceof(Tuple);
            expect(Array.from(ctx.x)).to.deep.equal([1,2,3]);
        });
        
        it("should execute function definitions (`->`) before assignment operations (`=`)", async () => {
            var ctx = createContext();
            
            await evaluate("f = x -> [x]", ctx);
            expect(ctx.f).to.be.a("function");
            expect(await ctx.f(1)).to.deep.equal([1]);
            
            var retval = await evaluate("1, f = x -> [x], 2", ctx);
            expect(ctx.f).to.be.a("function");
            expect(retval).to.be.instanceof(Tuple);
            expect(Array.from(retval)).to.deep.equal([1,2]);
        });
        
        it("should execure `;` operations before function definitions (`->`)", async () => {
            var ctx = createContext({T:true, F:false});                        
            expect(await evaluate("f = (x) -> x ; 1", ctx)).to.equal(null);
            expect(await ctx.f(3)).to.equal(3);
            expect(await ctx.f()).to.equal(1);
        });
        
        it("should execure `?` operations before `;` operations", async () => {
            var ctx = createContext({T:true, F:false});                        
            expect(await evaluate("f = (x,y) -> x ? 1 ; y ? 2 ; 3", ctx)).to.equal(null);
            expect(await ctx.f(true, false)).to.equal(1);
            expect(await ctx.f(true, true)).to.equal(1);
            expect(await ctx.f(false, true)).to.equal(2);
            expect(await ctx.f(false, false)).to.equal(3);            
        });

        it("should execute logic operations (`&` and `|`) before `?` and `;` operations", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("f = (x,y) -> x & y ? 1 ; x | y ? 2 ; 3", ctx)).to.equal(null);
            expect(await ctx.f(true, true)).to.equal(1);
            expect(await ctx.f(true, false)).to.equal(2);
            expect(await ctx.f(false, true)).to.equal(2);
            expect(await ctx.f(false, false)).to.equal(3);            
        });

        it("should execute comparison operations (`==`,`!=`,`<`,`<=`,`>=`,`>`) before logic operations (`&` and `|`)", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("f = x -> x==0 ? 'null' ; 0.01<=x & x<0.1 ? 'small' ; 1000>x & x>=100 ? 'big' ; 'huge' ", ctx)).to.equal(null);
            expect(await ctx.f(0)).to.equal('null');
            expect(await ctx.f(0.01)).to.equal('small');
            expect(await ctx.f(0.09)).to.equal('small');
            expect(await ctx.f(999)).to.equal('big');
            expect(await ctx.f(100)).to.equal('big');
            expect(await ctx.f(1000)).to.equal('huge');
        });
        
        it("should execute sum (`+`) and subtraction (`-`) operations before comparison operations (`==`,`!=`,`<`,`<=`,`>=`,`>`)", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("1+1<4 & 8-3==5",ctx)).to.equal(true);
        });

        it("should execute product (`*`) division (`/`) and modulo (`%`) operations before sum and subtraction operations (`+` and `-`)", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("1+2*3-10/5+8%5",ctx)).to.equal(8);
        });

        it("should execute exponentiation (`^`) operations before product (`*`) division (`/`) and modulo (`%`) operations", async () => {
            var ctx = createContext({T:true, F:false});            
            expect(await evaluate("1+2*3^2-10/5+8%5",ctx)).to.equal(20);
        });
        
        it("should execute subcontexting (`.`) and function calls before arithmetic operations", async () => {
            var ctx = createContext({double:x=>2*x, b:10});                        
            expect(await evaluate("double 2+3", ctx)).to.equal(7);
            expect(await evaluate("double(2+3)", ctx)).to.equal(10);
            
            expect(await evaluate("{a=1,b=2}.a+b", ctx)).to.equal(11);
            expect(await evaluate("{a=1,b=2}.(a+b)", ctx)).to.equal(3);            

            expect(await evaluate("{f=x->2*x}.f 2", ctx)).to.equal(4);
            expect(await evaluate("(x->{a=2*x}) 4 . a", ctx)).to.equal(8);
        });
    });
});
