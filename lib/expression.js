// =============================================================================
//  This module provides functions to parse and evaluate swan expressions.
// =============================================================================



// -----------------------------------------------------------------------------
//  TYPES
// -----------------------------------------------------------------------------

const $type = Symbol("Type tag");

const types = {};

types.Anything = {
    
    name: "Anything",
    
    toString () {
        return this.name;
    },
    
    extend (child) {
        return Object.assign(Object.create(this), child);
    }    
};

types.Tuple = types.Anything.extend({name:"Tuple"});

types.Nothing = types.Anything.extend({name:"Nothing"});

types.Boolean = types.Anything.extend({name:"Boolean"});

types.Number = types.Anything.extend({name:"Number"});

types.Sequence = types.Anything.extend({name:"Sequence"});

types.String = types.Sequence.extend({name:"String"});

types.List = types.Sequence.extend({name:"List"});

types.Namespace = types.Anything.extend({name:"Namespace"});

types.Function = types.Anything.extend({name:"Function"});

// Define a binary operation on several types
function defineBinaryOperation (name, handlers) {
    for (let [xTypeName, yTypeName, handler] of handlers) {
        let xType = types[xTypeName];
        let yType = types[yTypeName];
        xType[`${name}_${yTypeName}`] = handler;
    }
    
    return function (x, y) {
        const xType = detectType(x); 
        const yType = detectType(y);
        const handler = xType[`${name}_${yType}`] || xType[`${name}_Anything`];
        if (handler) return handler.call(this, x, y);
        return raise(`${name} operation not defined between ${xType} and ${yType}`);
    }
}

// Define a function on several types
function defineFunction (name, handlers) {
    for (let [typeName, handler] of handlers) {
        let type = types[typeName];
        type[name] = handler;
    }
    
    return function (x) {
        const xType = detectType(x); 
        const handler = xType[name];
        if (handler) return handler.call(this, x);
        return raise(`${name} not defined for ${xType} type`);
    }
}





// -----------------------------------------------------------------------------
//  TYPE DETECTION
// -----------------------------------------------------------------------------

function detectType (value) {
    
    // if Nothing
    if (isNothing(value)) return types.Nothing;

    // if primitive
    switch (typeof value) {
        case "boolean"  : return types.Boolean;
        case "number"   : return types.Number;
        case "string"   : return types.String;
    }    
    
    // It must be an object!
    
    // If it has a type tag
    if (value[$type]) return value[$type];
    
    // if Function
    if (typeof value === "function") return value[$type] = types.Function;
    
    // if List
    if (Array.isArray(value)) return value[$type] = types.List;
    
    // if a primitive object
    switch (Object.prototype.toString.call(value)) {
        case '[object Boolean]': return value[$type] = types.Boolean;
        case '[object Number]' : return value[$type] = types.Number;
        case '[object String]' : return value[$type] = types.String;
    }
    
    // It is a Namespace!
    return value[$type] = types.Namespace;
}

function isNothing (value) {
    return value === null || value === undefined || Number.isNaN(value);
}

function isTuple (value) {
    try {
        return value[$type] === types.Tuple;
    } catch (e) {
        return false;
    }
}

function isNamespace (value) {
    return detectType(value) === types.Namespace;
}

function isValidName (name) {    
    return /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(name);
}





// -----------------------------------------------------------------------------
//  TYPE CONVERSION
// -----------------------------------------------------------------------------

const convertToBoolean = defineFunction("convertToBoolean", [
    ["Nothing"  , x => false],
    ["Boolean"  , x => x],
    ["Number"   , x => x != 0],
    ["Function" , x => true],
    ["String"   , x => x.length !== 0],
    ["List"     , x => x.length !== 0],
    ["Namespace", x => countNames(x) !== 0],
    ["Tuple"    , x => any(convertToBoolean, x)]
]);

const convertToString = defineFunction("convertToString", [
    ["Nothing"  , x => ""],
    ["Boolean"  , x => x ? "TRUE" : "FALSE"],
    ["Number"   , x => String(x)],
    ["Function" , x => String.fromCharCode(0x2A0D)],
    ["String"   , x => x],
    ["List"     , x => `[${x.length}]`],
    ["Namespace", x => detectType(x.__str__) === types.String ? x.__str__ : `{${countNames(x)}}`],
    ["Tuple"    , x => Array.from(x).map(convertToString).join("")],
]);

const convertToTuple = defineFunction("convertToTuple", [
    ["String"   , x => createTuple(...Array.from(x))],
    ["List"     , x => createTuple(...x)],
    ["Namespace", x => createTuple(...Object.getOwnPropertyNames(x))],
    ["Anything" , x => x]
]);





// -----------------------------------------------------------------------------
//  TUPLE OPERATIONS
// -----------------------------------------------------------------------------

function *iter (tuple) {
    if (isNothing(tuple)) return;
    if (!isTuple(tuple)) yield tuple;
    else for (let item of tuple) yield(item);
}

function createTuple (...items) {
    const tuple = {
        
        [$type]: types.Tuple,
        
        *[Symbol.iterator] () {
            for (let item of items) {
                for (let subItem of iter(item)) yield subItem;
            }            
        }        
    };

    let iterator = tuple[Symbol.iterator]();
    let first = iterator.next();
    if (first.done) return null;
    return iterator.next().done ? first.value : tuple;
}

const NOTHING = createTuple();

const createRange = defineBinaryOperation("Range", [
    ["Number", "Number", (self, other) => {
        const a = Math.trunc(self), b = Math.trunc(other);
        if (a === b) return createTuple(a);

        var range = NOTHING;
        if (a <= b) for (let i=a; i<=b; i++) range = createTuple(range, i);
        else for (let i=a; i>=b; i--) range = createTuple(range, i);
        return range;
    }]
        
]);

async function map (fn, tuple) {
    if (isNothing(tuple)) return NOTHING;
    if (!isTuple(tuple)) return await fn(tuple);
    
    var image = NOTHING;
    for (let item of tuple) {
        image = createTuple(image, await fn(item));
    }
    return image;
}

function *pair (x, y) {
    const iX = iter(x)[Symbol.iterator]();
    const iY = iter(y)[Symbol.iterator]();
    while (true) {
        let x = iX.next();
        let y = iY.next();
        if (x.done && y.done) break;
        yield {first:x.value, second:y.value};
    }    
}

function mapPairs (fn, x, y) {
    const ptuple = createTuple(...pair(x, y));
    return map(pair => fn(pair.first, pair.second), ptuple);
}

async function any (fn, tuple) {
    for (let item of iter(tuple)) {
        if (await fn(item)) return true;
    }
    return false;
}





// -----------------------------------------------------------------------------
//  ARITHMETIC OPERATIONS
// -----------------------------------------------------------------------------

const add = defineBinaryOperation("Sum", [
    ["Anything" , "Nothing"  , (self, other) => self],    
    ["Anything" , "Tuple"    , (self, other) => mapPairs(add, self, other)],
    ["Nothing"  , "Anything" , (self, other) => other],
    ["Boolean"  , "Boolean"  , (self, other) => self || other],
    ["Number"   , "Number"   , (self, other) => self + other],
    ["String"   , "String"   , (self, other) => self + other],
    ["List"     , "List"     , (self, other) => self.concat(other)],
    ["Namespace", "Namespace", (self, other) => Object.assign({}, self, other)],
    ["Tuple"    , "Anything" , (self, other) => mapPairs(add, self, other)],
]);

const sub = defineBinaryOperation("Subtraction", [
    ["Anything", "Tuple"   , (self, other) => mapPairs(sub, self, other)],
    ["Nothing" , "Anything", (self, other) => NOTHING],
    ["Anything", "Nothing" , (self, other) => self],
    ["Number"  , "Number"  , (self, other) => self - other],
    ["Tuple"   , "Anything", (self, other) => mapPairs(sub, self, other)],
]);

const mul = defineBinaryOperation("Product", [
    ["Nothing" , "Anything", (self, other) => NOTHING],
    ["Anything", "Nothing" , (self, other) => NOTHING],
    ["Anything", "Tuple"   , (self, other) => mapPairs(mul, self, other)],
    ["Boolean" , "Boolean" , (self, other) => self && other],
    ["Number"  , "Number"  , (self, other) => self * other],
    ["Number"  , "String"  , (self, other) => self < 0 ? "" : other.repeat(self)],
    ["Number"  , "List"    , (self, other) => multiplyList(other, self)],
    ["String"  , "Number"  , (self, other) => other < 0 ? "" : self.repeat(other)],
    ["List"    , "Number"  , (self, other) => multiplyList(self, other)],
    ["Tuple"   , "Anything", (self, other) => mapPairs(mul, self, other)],
]);

function multiplyList (list, n) {
    var product = [];
    for (let i=1; i<=n; i++) product = product.concat(list);
    return product;    
}

const div = defineBinaryOperation("Division", [
    ["Anything", "Tuple"   , (self, other) => mapPairs(div, self, other)],
    ["Nothing" , "Anything", (self, other) => NOTHING],
    ["Number"  , "Number"  , (self, other) => self / other],
    ["Tuple"   , "Anything", (self, other) => mapPairs(div, self, other)],
]);

const mod = defineBinaryOperation("Modulo", [
    ["Anything", "Tuple"   , (self, other) => mapPairs(mod, self, other)],
    ["Nothing" , "Anything", (self, other) => other],
    ["Number"  , "Number"  , (self, other) => self % other],
    ["Tuple"   , "Anything", (self, other) => mapPairs(mod, self, other)],
]);

const pow = defineBinaryOperation("Exponentiation", [
    ["Anything", "Tuple"   , (self, other) => mapPairs(pow, self, other)],
    ["Nothing" , "Anything", (self, other) => NOTHING],
    ["Number"  , "Number"  , (self, other) => self ** other],
    ["Tuple"   , "Anything", (self, other) => mapPairs(pow, self, other)],
]);





// -----------------------------------------------------------------------------
//  COMPARISON OPERATIONS
// -----------------------------------------------------------------------------

const compare = defineBinaryOperation("Comparison", [
    ["Nothing"  , "Nothing"  , (self, other) => 0],
    ["Nothing"  , "Anything" , (self, other) => -1],
    ["Anything" , "Nothing"  , (self, other) => +1],
    
    ["Boolean"  , "Boolean"  , (self, other) => self === other ? 0 : (self ? +1 : -1)],
    ["Number"   , "Number"   , (self, other) => self === other ? 0 : (self<other ? -1 : +1)],
    ["String"   , "String"   , (self, other) => self.localeCompare(other)],
    ["List"     , "List"     , (self, other) => lexCompare(createTuple(...self), createTuple(...other))],
    
    ["Anything" , "Tuple"    , (self, other) => lexCompare(self, other)],
    ["Tuple"    , "Anything" , (self, other) => lexCompare(self, other)],
    ["Tuple"    , "Tuple"    , (self, other) => lexCompare(self, other)]    
]);

function lexCompare (tuple1, tuple2) {
    for (let p of pair(tuple1, tuple2)) {
        let cmp = compare(p.first, p.second);
        if (cmp !== 0) return cmp;
    }
    return 0;
}

const isEqual = defineBinaryOperation("Equality", [
    ["Anything" , "Anything" , (self, other) => false],    
    ["Nothing"  , "Nothing"  , (self, other) => true],
    ["Boolean"  , "Boolean"  , (self, other) => self === other],
    ["Number"   , "Number"   , (self, other) => self === other],
    ["String"   , "String"   , (self, other) => self === other],
    ["Function" , "Function" , (self, other) => self === other],
    ["List"     , "List"     , (self, other) => isLexEqual(createTuple(...self), createTuple(...other))],
    ["Namespace", "Namespace", (self, other) => {
        let xNames = Object.getOwnPropertyNames(self).filter(isValidName);
        let yNames = Object.getOwnPropertyNames(other).filter(isValidName);
        if (xNames.length !== yNames.length) return false;
        for (let xName of xNames) {
            let xValue = self[xName];
            let yValue = other.hasOwnProperty(xName) ? other[xName] : NOTHING;
            if (!isEqual(xValue, yValue)) return false;
        }
        return true;        
    }],
    ["Anything" , "Tuple"    , (self, other) => isLexEqual(self, other)],
    ["Tuple"    , "Anything" , (self, other) => isLexEqual(self, other)],
    ["Tuple"    , "Tuple"    , (self, other) => isLexEqual(self, other)]
]);

function isLexEqual (tuple1, tuple2) {
    for (let p of pair(tuple1, tuple2)) {
        if (!isEqual(p.first, p.second)) return false;
    }
    return true;    
}





// -----------------------------------------------------------------------------
//  MISCELLANEOUS OPERATION
// -----------------------------------------------------------------------------

const apply = defineBinaryOperation("Apply", [
    ["Nothing"  , "Anything", (self, other) => NOTHING],
    ["String"   , "Number"  , (self, index) => getListItem(self, index) || ""],
    ["String"   , "Anything", (self, other) => ""],
    ["List"     , "Number"  , (self, index) => getListItem(self, index) || NOTHING],
    ["List"     , "Anything", (self, other) => NOTHING],
    ["Namespace", "String"  , function (self, name) {
        if (typeof self.__apply__ === 'function') {
            return self.__apply__.call(this, name);
        }
        return isValidName(name) && self.hasOwnProperty(name) ? self[name] : NOTHING;
    }],
    ["Namespace", "Anything", function (self, other) {
        if (typeof self.__apply__ === 'function') {
            return self.__apply__.call(this, other);
        }
        return NOTHING;
    }],
    ["Function" , "Anything", function (self, other) {
        return self.call(this, ...iter(other));        
    }],
    ["Tuple"    , "Anything", function (self, other) {
        return map(item => apply.call(this, item, other), self);
    }],
]);

function getListItem (list, index) {
    index = index < 0 ? list.length + index : index;
    return (0 <= index && index < list.length) ? list[Math.trunc(index)] : null;
}

const size = defineFunction("Size", [
    ["String", x => x.length],
    ["List", x => x.length],
    ["Namespace", x => countNames(x)]
]);

function countNames (namespace) {
    return Object.getOwnPropertyNames(namespace).length;
}





// -----------------------------------------------------------------------------
//  EXCEPTIONS
// -----------------------------------------------------------------------------

class Exception extends Error {};

function raise (message) {
    throw new Exception(message);
}





// -----------------------------------------------------------------------------
//  PARSER
// -----------------------------------------------------------------------------

const Parser = require("./expression/parser");

const parse = Parser({
     
     binaryOperations: {
         ","  : {precedence:10, handler:"$pair"  },
         ":"  : {precedence:11, handler:"$range" },
         "="  : {precedence:11, handler:"$set"   },
         "->" : {precedence:12, handler:"$def",  right:true},

         ";"  : {precedence:21, handler:"$else"},
         "?"  : {precedence:22, handler:"$if"  },
         "|"  : {precedence:23, handler:"$or"  },
         "&"  : {precedence:23, handler:"$and" },
         "==" : {precedence:24, handler:"$eq"  },
         "!=" : {precedence:24, handler:"$ne"  },
         "<"  : {precedence:24, handler:"$lt"  },
         "<=" : {precedence:24, handler:"$le"  },
         ">"  : {precedence:24, handler:"$gt"  },
         ">=" : {precedence:24, handler:"$ge"  },
         "+"  : {precedence:25, handler:"$add" },
         "-"  : {precedence:25, handler:"$sub" },
         "*"  : {precedence:26, handler:"$mul" },    
         "/"  : {precedence:26, handler:"$div" },
         "%"  : {precedence:26, handler:"$mod" },
         "^"  : {precedence:27, handler:"$pow" },
         
         "."  : {precedence:30, handler:"$dot" },
         ""   : {precedence:30, handler:"$apply" },
     },
     
     voidHandler        : "$nothing",
     nameHandler        : "$name",
     stringHandler0     : "$str0",
     stringHandler1     : "$str1",
     stringHandler2     : "$str2",
     numberHandler      : "$numb",
     squareGroupHandler : "$list",
     curlyGroupHandler  : "$namespace",
});





// -----------------------------------------------------------------------------
//  CONTEXT
// -----------------------------------------------------------------------------

const $context = Symbol("Namespace context");

const context = {
    
    $nothing () {
        return null;
    },
    
    async $str0 (text) {
        const parsedExpressions = [];
        text = text.replace(/\$\{([\s\S]+?)\}/g, (match, expressionSource) => {  
            let i = parsedExpressions.length;
            parsedExpressions.push( parse(expressionSource) );
            return "${"+i+"}";
        }); 
        
        const templateContext = Object.create(this);
        for (let i=0; i<parsedExpressions.length; i++) {
            let evaluateExpression = parsedExpressions[i];
            let value = await evaluateExpression(templateContext);                
            text = text.replace("${"+i+"}", await this.str(...iter(value)));
        }

        return text;
    },
    
    $str1 (value) {
        return value;
    },
    
    $str2 (value) {
        return value;
    },
    
    $numb (value) {
        return value;
    },
    
    async $pair (X, Y) {
        return createTuple(await X(this), await Y(this));
    },
    
    async $range (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return createRange(x, y);
    },
    
    async $list (X) {
        const x = await X(this);
        return Array.from(iter(x));
    },
    
    async $name (name) {
        if (isValidName(name)) {
            let value = this[name];
            if (value !== undefined && value !== Object.prototype[name]) return value;
        }
        return null;
    },
    
    async $set (X, Y) {
        const x = await X({
            $nothing: this.$nothing,
            $name: name => name,
            $pair: this.$pair
        });
        const names = Array.from(iter(x));
        const y = await Y(this);
        const values = Array.from(iter(y));
        if (values.length > names.length) {
            values[names.length-1] = createTuple(...values.slice(names.length-1))
        }
        for (var i=0; i<names.length; i++) {
            this[names[i]] = i < values.length ? values[i] : null;
        }            
        return null;
    },

    async $namespace (X) {
        const context = Object.create(this);
        await X(context);
        return Object.assign({[$context]:this}, context);
    },
    
    $def (params, expression) {
        return async (...args) => {
            const functionContext = Object.create(this);
            await functionContext.$set(params, () => createTuple(...args));
            return await expression(functionContext);
        }
    },
    
    async $apply (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await apply.call(this, x, y);
    },
    
    async $dot (X, Y) {
        const x = await X(this);
        const subcontext = async namespace => {
            if (!isNamespace(namespace)) {
                raise("Namespace expected on the left side of the '.' operator");
            }
            const context = namespace[$context] || this;
            const childNamespace = Object.assign(Object.create(context), namespace);
            return await Y(childNamespace);
        };
        return await map(subcontext, x);
    },
    
    async $or (X, Y) {
        const x = await X(this);
        if (await this.bool(x)) return x;
        return await Y(this);
    },
    
    async $and (X, Y) {
        const x = await X(this);
        if (await this.not(x)) return x;
        return await Y(this);
    },
    
    async $if (X, Y) {
        const x = await X(this);
        return (await this.bool(x)) ? await Y(this) : null;
    },

    async $else (X, Y) {
        const x = await X(this);
        return isNothing(x) ? await Y(this) : x;
    },
    
    async $add (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await add(x, y);
    },

    async $sub (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await sub(x, y);
    },

    async $mul (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await mul(x, y);
    },

    async $div (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await div(x, y);
    },

    async $mod (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await mod(x, y);
    },

    async $pow (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await pow(x, y);
    },

    async $eq (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return isEqual(x, y);
    },
     
    async $ne (X, Y) {
        return !(await this.$eq(X, Y));
    },

    async $lt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return compare(x, y) === -1;
    },

    async $ge (X, Y) {
        return !(await this.$lt(X, Y));
    },

    async $gt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return compare(x, y) === +1;
    },

    async $le (X, Y) {
        return !(await this.$gt(X, Y));
    },   
    
    async bool (...items) {
        return convertToBoolean(createTuple(...items));
    },
    
    async not (...items) {
        return !(await this.bool(...items));
    },
    
    str (...items) {
        return convertToString(createTuple(...items));
    },
    
    map (fn) {
        return (...items) => map(fn, createTuple(...items));
    },
    
    enum (...items) {
        const value = createTuple(...items);
        return convertToTuple(value);
    },
    
    size (...items) {
        const x = createTuple(...items);
        return size(x);
    },
    
    TRUE: true,
    FALSE: false,
    
    $assign (namespace) {
        for (let name in namespace) {
            this[name] = namespace[name];
        }
        return this;
    },
    
    $extend (namespace) {
        return Object.create(this).$assign(namespace);
    }
};





// -----------------------------------------------------------------------------
//  EXPORTS
// -----------------------------------------------------------------------------

//  Parses a swan expression and returns an asynchronous function that accepts a 
//  context as argument and resolves the value of the original expression.
exports.parse = (expression) => {
    const evaluate = parse(expression);
    return async (expressionContext) => {
        if (!context.isPrototypeOf(expressionContext)) {
            throw new Error("Invalid context.")
        };
        const value = await evaluate(expressionContext);
        return isNothing(value) ? null : value;
    }
}


// Returns the base context extended with the provided namespaces in order. 
const expression_globals = {
    "require": require("./expression/stdlib-loader")
};
exports.createContext = (...namespaces) => {
    var ctx = context.$extend(expression_globals);
    for (namespace of namespaces) {
        ctx = ctx.$extend(namespace);
    }
    return ctx;
}


// Exposes to javascript the swan str function
exports.stringify = x => context.str(...iter(x));


// Exposes to javascript the swan apply operator
exports.apply = (f, ...args) => apply(f, createTuple(...args));


// Expose some other internals
exports.Exception = Exception;
exports.isValidName = isValidName;
exports.createTuple = createTuple;
