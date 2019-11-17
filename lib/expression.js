
const errors = require("./errors");

const Parser = require("./expression/parser");
const parse = Parser({
     
     binaryOperations: {
         ","    :   {precedence:10, handler:"$append" },
         "="    :   {precedence:11, handler:"$set" },
         "->"   :   {precedence:12, handler:"$def" },
         ""     :   {precedence:13, handler:"$apply" },

         "or"   :   {precedence:21, handler:"$or"  },
         "else" :   {precedence:21, handler:"$else"},
         "and"  :   {precedence:22, handler:"$and" },
         "if"   :   {precedence:23, handler:"$if"  },
         "is"   :   {precedence:24, handler:"$is"  },
         "=="   :   {precedence:24, handler:"$eq"  },
         "!="   :   {precedence:24, handler:"$ne"  },
         "<"    :   {precedence:25, handler:"$lt"  },
         "<="   :   {precedence:25, handler:"$le"  },
         ">"    :   {precedence:25, handler:"$gt"  },
         ">="   :   {precedence:25, handler:"$ge"  },
         "+"    :   {precedence:26, handler:"$add" },
         "-"    :   {precedence:26, handler:"$sub" },
         "*"    :   {precedence:27, handler:"$mul" },    
         "/"    :   {precedence:27, handler:"$div" },
         "^"    :   {precedence:28, handler:"$pow" },
         
         "."    :   {precedence:30, handler:"$dot" },
     },
     
     voidHandler        : "$nothing",
     nameHandler        : "$get",
     stringHandler0     : "$str0",
     stringHandler1     : "$str1",
     stringHandler2     : "$str2",
     numberHandler      : "$num",
     squareGroupHandler : "$list",
     curlyGroupHandler  : "$namespace",
 });
 

const SIZE = Symbol("size");


// Types

const NOTHING   = "NOTHING";
const BOOLEAN   = "BOOLEAN";
const NUMBER    = "NUMBER";
const STRING    = "STRING";
const LIST      = "LIST";
const NAMESPACE = "NAMESPACE";
const FUNCTION  = "FUNCTION";
const TUPLE     = "TUPLE";

function type (x) {
    if (x === null || x === undefined || Number.isNaN(x)) return NOTHING;
    if (x === true || x === false) return BOOLEAN;
    if (typeof(x) === "number" && !Number.isNaN(x)) return NUMBER;
    if (typeof(x) === "string") return STRING;
    if (typeof(x) === "function") return FUNCTION;
    if (Array.isArray(x)) return LIST;
    if (typeof(x) === "object") {
        if (typeof x[Symbol.iterator] === "function") return TUPLE;
        let tag = Object.prototype.toString.call(x);
        if (tag === '[object Boolean]') return BOOLEAN;
        if (tag === '[object Number]') return NUMBER;
        if (tag === '[object String]') return STRING;
        return NAMESPACE;
    }
    throw new Error("Unknown data type.");
}

const isNothing   = x => type(x) === NOTHING;
const isBoolean   = x => type(x) === BOOLEAN;
const isNumber    = x => type(x) === NUMBER;
const isString    = x => type(x) === STRING;
const isList      = x => type(x) === LIST;
const isNamespace = x => type(x) === NAMESPACE;
const isFunction  = x => type(x) === FUNCTION;
const isTuple     = x => type(x) === TUPLE;



const CONTEXT = {
        
    $nothing () {
        return null;
    },
    
    $get (name) {
        return getValue(this, name);
    },
    
    $str0 (value) {
        return value;
    },
    
    $str1 (value) {
        return value;
    },
    
    $str2 (value) {
        return value;
    },
    
    $num (value) {
        return value;
    },
    
    async $list (X) {
        const x = await X(this);
        return list(x);
    },
    
    async $namespace (Expression) {
        const scope = Object.create(this);
        await Expression(scope);
        const names = Object.getOwnPropertyNames(scope).filter(name => isName(name));
        const namespace = {};
        for (let name of names) namespace[name] = scope[name];
        return namespace;
    },
    
    async $append (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return createTuple(x,y);
    },
    
    async $set (X, Y) {
        const names = await X(nameDefinitionContext);
        const values = await Y(this);
        assign(this, list(names), list(values));
        return this.$nothing();
    },
    
    async $def (params, expression) {
        const names = list( await params(nameDefinitionContext) );
        const fn = async (...args) => {
            let fnScope = Object.create(this);
            assign(fnScope, names, args);
            return await expression(fnScope);
        }
        fn.toString = () => serializationContext.$def(params, expression);
        fn[SIZE]  = () => expression(measuringContext);
        return fn;
    },
    
    async $apply (Callable, Argument) {
        const callable = await Callable(this);
        const argument = await Argument(this);
        return await Call(this, callable, argument);
    },
    
    async $dot (X, Y) {
        const namespace = await X(this);
        if (!isNamespace(namespace)) {
            throw new errors.RuntimeError("NAMESPACE expected on the left side of the '.' operator");
        }
        const context = merge(CONTEXT, namespace);
        return await Y(context);
    },

    async $or (X, Y) {
        const x = await X(this);
        if (await this.bool(x)) return true;
        const y = await Y(this);
        return await this.bool(y);
    },
    
    async $and (X, Y) {
        const x = await X(this);
        if (await this.not(x)) return false;
        const y = await Y(this);
        return await this.bool(y);        
    },
    
    async $if (X, Y) {
        const y = await Y(this);
        if (await this.not(y)) return null;
        return await X(this);
    },
    
    async $else (X, Y) {
        const x = await X(this);
        if (x !== null) return x;
        return await Y(this);
    },
    
    async $eq (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return (await Cmp(x,y)) === Cmp.EQ;
    },
    
    async $ne (X, Y) {
        return !(await this.$eq(X,Y));
    },
    
    async $lt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return (await Cmp(x,y)) === Cmp.LT;
    },
    
    async $le (X, Y) {
        return !(await this.$gt(X,Y));
    },
    
    async $gt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return (await Cmp(x,y)) === Cmp.GT;
    },
    
    async $ge (X, Y) {
        return !(await this.$lt(X,Y));
    },
    
    async $add (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await Add(x,y);
    },
    
    async $sub (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await Sub(x,y);        
    },
    
    async $mul (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await Mul(x,y);        
    },
    
    async $div (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await Div(x,y);        
    },
    
    async $mod (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await Mod(x,y);        
    },
    
    async $pow (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await Pow(x,y);        
    },
    
    async type (...items) {
        switch (items.length) {
            case 0 : return NOTHING;
            case 1 : return type(items[0]);
            default: return TUPLE;
        }
    },
    
    async size (...items) {
        let size = 0;
        for (let item of items) size += await Measure(item);
        return size;
    },
    
    async bool (...items) {
        return (await this.size(...items)) !== 0;
    },
    
    async not (...items) {
        return (await this.size(...items)) === 0;
    },    
    
    async str (...items) {
        var s = "";
        for (let item of items) s += await Stringify(item);
        return s;
    },
    
    async int (...items) {
        if (items.length === 1 && isNumber(items[0])) {
            return items[0] < 0 ? Math.ceil(items[0]) : Math.floor(items[0]);
        } else {
            return await this.size(...items);
        }
    },
    
    async map (fn, ...args) {
        if (!isFunction(fn)) throw new errors.RuntimeError("Function required as first argument of map");
        const mappingFn = async (...args) => {
            var tuple = createTuple();
            for (let arg of args) {
                tuple = createTuple(tuple, await Call(this, fn, arg));
            } 
            return tuple;
        }
        return args.length > 0 ? await mappingFn(...args) : mappingFn;
    },

    async fil (testFn, ...args) {
        if (!isFunction(testFn)) throw new errors.RuntimeError("Function required as first argument of fil");
        const filter = async (...args) => {
            var tuple = createTuple();
            for (let arg of args) {
                let match = await Call(this, testFn, arg);
                let pass = isTuple(match) ? await this.bool(...match) : await this.bool(match);
                if (pass) tuple = createTuple(tuple, arg);
            } 
            return tuple;
        }        
        return args.length > 0 ? await filter(...args) : filter;
    },

    async red (reducerFn, ...items) {
        if (!isFunction(reducerFn)) throw new errors.RuntimeError("Function required as first argument of red");
        const reduce = async (item0, ...items) => {
            var value = item0;
            for (let item of items) {
                value = await Call(this, reducerFn, createTuple(value, item));
            } 
            return value;
        }
        return items.length > 0 ? await reduce(...items) : reduce;
    },    
};


const nameDefinitionContext = {
    $nothing: () => null,
    $get: name => name,
    $append: CONTEXT.$append,
}



const serializationContext = {
    $nothing:   ()     => "()",
    $get:       name   => name,
    $str0:      string => "`" + string + "`",
    $str1:      string => `'${string}'`,
    $str2:      string => `"${string}"`,
    $num:       number => number,
    $list       (X)     {return `[${X(this)}]`},
    $namespace  (X)     {return `{${X(this)}}`},
    $append       (X, Y)  {return `${X(this)},${Y(this)}`},
    $set        (X, Y)  {return `(${X(this)}) = (${Y(this)})`},
    $def        (X, Y)  {return `(${X(this)}) -> (${Y(this)})`},
    $apply      (X, Y)  {return `(${X(this)})(${Y(this)})`},
    $dot        (X, Y)  {return `(${X(this)}).(${Y(this)})` },
    $or         (X, Y)  {return `(${X(this)}) or (${Y(this)})` },
    $and        (X, Y)  {return `(${X(this)}) and (${Y(this)})` },
    $if         (X, Y)  {return `(${X(this)}) if (${Y(this)})` },
    $else       (X, Y)  {return `(${X(this)}) else (${Y(this)})` },
    $eq         (X, Y)  {return `(${X(this)}) == (${Y(this)})` },
    $ne         (X, Y)  {return `(${X(this)}) != (${Y(this)})` },
    $lt         (X, Y)  {return `(${X(this)}) < (${Y(this)})` },
    $le         (X, Y)  {return `(${X(this)}) <= (${Y(this)})` },
    $gt         (X, Y)  {return `(${X(this)}) > (${Y(this)})` },
    $ge         (X, Y)  {return `(${X(this)}) >= (${Y(this)})` },
    $add        (X, Y)  {return `(${X(this)}) + (${Y(this)})` },
    $sub        (X, Y)  {return `(${X(this)}) - (${Y(this)})` },
    $mul        (X, Y)  {return `(${X(this)}) * (${Y(this)})` },
    $div        (X, Y)  {return `(${X(this)}) / (${Y(this)})` },
    $mod        (X, Y)  {return `(${X(this)}) mod (${Y(this)})` },
    $pow        (X, Y)  {return `(${X(this)}) ^ (${Y(this)})` },
};


const measuringContext = {
    $nothing:   ()     => 0,
    $get:       name   => 1,
    $str0:      string => 1,
    $str1:      string => 1,
    $str2:      string => 1,
    $num:       number => 1,
    $list       (X)     {return 1 + X(this)},
    $namespace  (X)     {return 1 + X(this)},
    $append       (X, Y)  {return 1 + X(this) + Y(this)},
    $set        (X, Y)  {return 1 + X(this) + Y(this)},
    $def        (X, Y)  {return 1 + X(this) + Y(this)},
    $apply      (X, Y)  {return 1 + X(this) + Y(this)},
    $dot        (X, Y)  {return 1 + X(this) + Y(this)},
    $or         (X, Y)  {return 1 + X(this) + Y(this)},
    $and        (X, Y)  {return 1 + X(this) + Y(this)},
    $if         (X, Y)  {return 1 + X(this) + Y(this)},
    $else       (X, Y)  {return 1 + X(this) + Y(this)},
    $eq         (X, Y)  {return 1 + X(this) + Y(this)},
    $ne         (X, Y)  {return 1 + X(this) + Y(this)},
    $lt         (X, Y)  {return 1 + X(this) + Y(this)},
    $le         (X, Y)  {return 1 + X(this) + Y(this)},
    $gt         (X, Y)  {return 1 + X(this) + Y(this)},
    $ge         (X, Y)  {return 1 + X(this) + Y(this)},
    $add        (X, Y)  {return 1 + X(this) + Y(this)},
    $sub        (X, Y)  {return 1 + X(this) + Y(this)},
    $mul        (X, Y)  {return 1 + X(this) + Y(this)},
    $div        (X, Y)  {return 1 + X(this) + Y(this)},
    $mod        (X, Y)  {return 1 + X(this) + Y(this)},
    $pow        (X, Y)  {return 1 + X(this) + Y(this)},
};


const Call = Object.assign( (scope, x, arg) => Call[type(x)](scope, x, arg), {
    [NOTHING]   : () => Call.exception(NOTHING),
    [BOOLEAN]   : () => Call.exception(BOOLEAN),
    [NUMBER]    : () => Call.exception(NUMBER),
    [STRING]    : (scope, str, arg)  => isTuple(arg) ? mapTuple(arg, index => getStringCharacter(str, index)) : getStringCharacter(str, arg),
    [LIST]      : (scope, list, arg) => isTuple(arg) ? mapTuple(arg, index => getListItem(list, index)) : getListItem(list, arg),
    [NAMESPACE] : (scope, namespace, arg) => isTuple(arg) ? mapTuple(arg, name => getValue(namespace, name)) : getValue(namespace, arg),
    [FUNCTION]  : (scope, func, arg) => isTuple(arg) ? func.call(scope, ...arg) : func.call(scope, arg),
    [TUPLE]     : (scope, tuple, arg) => mapTuple(tuple, item => Call(scope, item, arg)),
    exception   : (TYPE) => {throw new errors.RuntimeError(`Apply operation not defined on '${TYPE}' type`)},
})

const Measure = Object.assign(x => Measure[type(x)](x), {
    [NOTHING]   : x => 0,
    [BOOLEAN]   : x => x ? 1 : 0,
    [NUMBER]    : x => Math.abs(x),
    [STRING]    : x => x.length,
    [LIST]      : x => x.length,
    [NAMESPACE] : x => listNames(x).length,
    [FUNCTION]  : x => x[SIZE] ? x[SIZE]() : x.toString().length,
});

const Stringify = Object.assign(x => Stringify[type(x)](x), {
    [NOTHING]   : x => "",
    [BOOLEAN]   : x => x ? "TRUE" : "FALSE",
    [NUMBER]    : x => String(x),
    [STRING]    : x => x,
    [LIST]      : x => `[${x.length}]`,
    [NAMESPACE] : x => `{${listNames(x).length}}`,
    [FUNCTION]  : x => x.toString(),
});

const Add = Object.assign((x,y) => Add[type(x)](x,y), {
    [NOTHING]   : (x,y) => y,
    [BOOLEAN]   : Object.assign( (x,y) => Add[BOOLEAN][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => x || y,
        [NUMBER]    : (x,y) => Add.exception(BOOLEAN,NUMBER),
        [STRING]    : (x,y) => Add.exception(BOOLEAN,STRING),
        [LIST]      : (x,y) => Add.exception(BOOLEAN,LIST),
        [NAMESPACE] : (x,y) => Add.exception(BOOLEAN,NAMESPACE),
        [FUNCTION]  : (x,y) => Add.exception(BOOLEAN,FUNCTION),
        [TUPLE]     : (x,y) => Add[TUPLE](createTuple(x), y),
    }),
    [NUMBER]    : Object.assign( (x,y) => Add[NUMBER][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => Add.exception(NUMBER,BOOLEAN),
        [NUMBER]    : (x,y) => x + y,
        [STRING]    : (x,y) => Add.exception(NUMBER,STRING),
        [LIST]      : (x,y) => Add.exception(NUMBER,LIST),
        [NAMESPACE] : (x,y) => Add.exception(NUMBER,NAMESPACE),
        [FUNCTION]  : (x,y) => Add.exception(NUMBER,FUNCTION),
        [TUPLE]     : (x,y) => Add[TUPLE](createTuple(x), y),
    }),
    [STRING]    : Object.assign( (x,y) => Add[STRING][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => Add.exception(STRING,BOOLEAN),
        [NUMBER]    : (x,y) => Add.exception(STRING,NUMBER),
        [STRING]    : (x,y) => x + y,
        [LIST]      : (x,y) => Add.exception(STRING,LIST),
        [NAMESPACE] : (x,y) => Add.exception(STRING,NAMESPACE),
        [FUNCTION]  : (x,y) => Add.exception(STRING,FUNCTION),
        [TUPLE]     : (x,y) => Add[TUPLE](createTuple(x), y),
    }),
    [LIST]      : Object.assign( (x,y) => Add[LIST][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => Add.exception(LIST,BOOLEAN),
        [NUMBER]    : (x,y) => Add.exception(LIST,NUMBER),
        [STRING]    : (x,y) => Add.exception(LIST,STRING), 
        [LIST]      : (x,y) => x.concat(y),
        [NAMESPACE] : (x,y) => Add.exception(LIST,NAMESPACE),
        [FUNCTION]  : (x,y) => Add.exception(LIST,FUNCTION),
        [TUPLE]     : (x,y) => Add[TUPLE](createTuple(x), y),
    }),
    [NAMESPACE] : Object.assign( (x,y) => Add[NAMESPACE][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => Add.exception(NAMESPACE,BOOLEAN),
        [NUMBER]    : (x,y) => Add.exception(NAMESPACE,NUMBER),
        [STRING]    : (x,y) => Add.exception(NAMESPACE,STRING), 
        [LIST]      : (x,y) => Add.exception(NAMESPACE,LIST),
        [NAMESPACE] : (x,y) => merge(x,y),
        [FUNCTION]  : (x,y) => Add.exception(NAMESPACE,FUNCTION),
        [TUPLE]     : (x,y) => Add[TUPLE](createTuple(x), y),
    }),
    [FUNCTION]  : Object.assign( (x,y) => Add[FUNCTION][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => Add.exception(FUNCTION,BOOLEAN),
        [NUMBER]    : (x,y) => Add.exception(FUNCTION,NUMBER),
        [STRING]    : (x,y) => Add.exception(FUNCTION,STRING), 
        [LIST]      : (x,y) => Add.exception(FUNCTION,LIST),
        [NAMESPACE] : (x,y) => Add.exception(FUNCTION,NAMESPACE),
        [FUNCTION]  : (x,y) => Add.exception(FUNCTION,FUNCTION),
        [TUPLE]     : (x,y) => Add[TUPLE](createTuple(x), y),
    }),
    [TUPLE]     : (tuple,y) => mapTuple(pair(tuple, y), item => Add(item.first, item.second)),
    exception   : (xType, yType) => {
        throw new errors.RuntimeError(`Sum operation not defined between ${xType} and ${yType}`);
    }
});

const Sub = Object.assign((x,y) => Sub[type(x)](x,y), {
    [NOTHING]   : Object.assign( (x,y) => Sub[NOTHING][type(y)](x,y), {
        [NOTHING]   : (x,y) => null,
        [BOOLEAN]   : (x,y) => Sub.exception(NOTHING,BOOLEAN),
        [NUMBER]    : (x,y) => Sub.exception(NOTHING,NUMBER),
        [STRING]    : (x,y) => Sub.exception(NOTHING,STRING),
        [LIST]      : (x,y) => Sub.exception(NOTHING,LIST),
        [NAMESPACE] : (x,y) => Sub.exception(NOTHING,NAMESPACE),
        [FUNCTION]  : (x,y) => Sub.exception(NOTHING,FUNCTION),
        [TUPLE]     : (x,y) => Sub[TUPLE](createTuple(x), y),
    }),
    [BOOLEAN]   : Object.assign( (x,y) => Sub[BOOLEAN][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => Sub.exception(BOOLEAN,BOOLEAN),
        [NUMBER]    : (x,y) => Sub.exception(BOOLEAN,NUMBER),
        [STRING]    : (x,y) => Sub.exception(BOOLEAN,STRING),
        [LIST]      : (x,y) => Sub.exception(BOOLEAN,LIST),
        [NAMESPACE] : (x,y) => Sub.exception(BOOLEAN,NAMESPACE),
        [FUNCTION]  : (x,y) => Sub.exception(BOOLEAN,FUNCTION),
        [TUPLE]     : (x,y) => Sub[TUPLE](createTuple(x), y),
    }),
    [NUMBER]    : Object.assign( (x,y) => Sub[NUMBER][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => Sub.exception(NUMBER,BOOLEAN),
        [NUMBER]    : (x,y) => x - y,
        [STRING]    : (x,y) => Sub.exception(NUMBER,STRING),
        [LIST]      : (x,y) => Sub.exception(NUMBER,LIST),
        [NAMESPACE] : (x,y) => Sub.exception(NUMBER,NAMESPACE),
        [FUNCTION]  : (x,y) => Sub.exception(NUMBER,FUNCTION),
        [TUPLE]     : (x,y) => Sub[TUPLE](createTuple(x), y),
    }),
    [STRING]    : Object.assign( (x,y) => Sub[STRING][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => Sub.exception(STRING,BOOLEAN),
        [NUMBER]    : (x,y) => Sub.exception(STRING,NUMBER),
        [STRING]    : (x,y) => Sub.exception(STRING,STRING),
        [LIST]      : (x,y) => Sub.exception(STRING,LIST),
        [NAMESPACE] : (x,y) => Sub.exception(STRING,NAMESPACE),
        [FUNCTION]  : (x,y) => Sub.exception(STRING,FUNCTION),
        [TUPLE]     : (x,y) => Sub[TUPLE](createTuple(x), y),
    }),
    [LIST]      : Object.assign( (x,y) => Sub[LIST][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => Sub.exception(LIST,BOOLEAN),
        [NUMBER]    : (x,y) => Sub.exception(LIST,NUMBER),
        [STRING]    : (x,y) => Sub.exception(LIST,STRING), 
        [LIST]      : (x,y) => Sub.exception(LIST,LIST),
        [NAMESPACE] : (x,y) => Sub.exception(LIST,NAMESPACE),
        [FUNCTION]  : (x,y) => Sub.exception(LIST,FUNCTION),
        [TUPLE]     : (x,y) => Sub[TUPLE](createTuple(x), y),
    }),
    [NAMESPACE] : Object.assign( (x,y) => Sub[NAMESPACE][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => Sub.exception(NAMESPACE,BOOLEAN),
        [NUMBER]    : (x,y) => Sub.exception(NAMESPACE,NUMBER),
        [STRING]    : (x,y) => Sub.exception(NAMESPACE,STRING), 
        [LIST]      : (x,y) => Sub.exception(NAMESPACE,LIST),
        [NAMESPACE] : (x,y) => Sub.exception(NAMESPACE,NAMESPACE),
        [FUNCTION]  : (x,y) => Sub.exception(NAMESPACE,FUNCTION),
        [TUPLE]     : (x,y) => Sub[TUPLE](createTuple(x), y),
    }),
    [FUNCTION]  : Object.assign( (x,y) => Sub[FUNCTION][type(y)](x,y), {
        [NOTHING]   : (x,y) => x,
        [BOOLEAN]   : (x,y) => Sub.exception(FUNCTION,BOOLEAN),
        [NUMBER]    : (x,y) => Sub.exception(FUNCTION,NUMBER),
        [STRING]    : (x,y) => Sub.exception(FUNCTION,STRING), 
        [LIST]      : (x,y) => Sub.exception(FUNCTION,LIST),
        [NAMESPACE] : (x,y) => Sub.exception(FUNCTION,NAMESPACE),
        [FUNCTION]  : (x,y) => Sub.exception(FUNCTION,FUNCTION),
        [TUPLE]     : (x,y) => Sub[TUPLE](createTuple(x), y),
    }),
    [TUPLE]     : (tuple,y) => mapTuple(pair(tuple, y), item => Sub(item.first, item.second)),
    exception   : (xType, yType) => {
        throw new errors.RuntimeError(`Subtraction operation not defined between ${xType} and ${yType}`);
    }
});

const Mul = Object.assign((x,y) => Mul[type(x)](x,y), {
    [NOTHING]   : Object.assign( (x,y) => (Mul[NOTHING][type(y)] || Mul[NOTHING].default)(x,y), {
        default     : (x,y) => null,
        [TUPLE]     : (x,y) => Mul[TUPLE](createTuple(x), y),
    }),
    [BOOLEAN]   : Object.assign( (x,y) => Mul[BOOLEAN][type(y)](x,y), {
        [NOTHING]   : (x,y) => null,
        [BOOLEAN]   : (x,y) => x && y,
        [NUMBER]    : (x,y) => Mul.exception(BOOLEAN,NUMBER),
        [STRING]    : (x,y) => Mul.exception(BOOLEAN,STRING),
        [LIST]      : (x,y) => Mul.exception(BOOLEAN,LIST),
        [NAMESPACE] : (x,y) => Mul.exception(BOOLEAN,NAMESPACE),
        [FUNCTION]  : (x,y) => Mul.exception(BOOLEAN,FUNCTION),
        [TUPLE]     : (x,y) => Mul[TUPLE](createTuple(x), y),
    }),
    [NUMBER]    : Object.assign( (x,y) => Mul[NUMBER][type(y)](x,y), {
        [NOTHING]   : (x,y) => null,
        [BOOLEAN]   : (x,y) => Mul.exception(NUMBER,BOOLEAN),
        [NUMBER]    : (x,y) => x * y,
        [STRING]    : (x,y) => x < 1 ? "" : y.repeat(x),
        [LIST]      : (x,y) => {
            let list = [];
            for (let i=1; i<=x; i++) list = list.concat(y);
            return list;
        },
        [NAMESPACE] : (x,y) => Mul.exception(NUMBER,NAMESPACE),
        [FUNCTION]  : (x,y) => Mul.exception(NUMBER,FUNCTION),
        [TUPLE]     : (x,y) => Mul[TUPLE](createTuple(x), y),
    }),
    [STRING]    : Object.assign( (x,y) => Mul[STRING][type(y)](x,y), {
        [NOTHING]   : (x,y) => null,
        [BOOLEAN]   : (x,y) => Mul.exception(STRING,BOOLEAN),
        [NUMBER]    : (x,y) => Mul[NUMBER][STRING](y,x),
        [STRING]    : (x,y) => Mul.exception(STRING,STRING),
        [LIST]      : (x,y) => Mul.exception(STRING,LIST),
        [NAMESPACE] : (x,y) => Mul.exception(STRING,NAMESPACE),
        [FUNCTION]  : (x,y) => Mul.exception(STRING,FUNCTION),
        [TUPLE]     : (x,y) => Mul[TUPLE](createTuple(x), y),
    }),
    [LIST]      : Object.assign( (x,y) => Mul[LIST][type(y)](x,y), {
        [NOTHING]   : (x,y) => null,
        [BOOLEAN]   : (x,y) => Mul.exception(LIST,BOOLEAN),
        [NUMBER]    : (x,y) => Mul[NUMBER][LIST](y,x),
        [STRING]    : (x,y) => Mul.exception(LIST,STRING), 
        [LIST]      : (x,y) => Mul.exception(LIST,LIST),
        [NAMESPACE] : (x,y) => Mul.exception(LIST,NAMESPACE),
        [FUNCTION]  : (x,y) => Mul.exception(LIST,FUNCTION),
        [TUPLE]     : (x,y) => Mul[TUPLE](createTuple(x), y),
    }),
    [NAMESPACE] : Object.assign( (x,y) => Mul[NAMESPACE][type(y)](x,y), {
        [NOTHING]   : (x,y) => null,
        [BOOLEAN]   : (x,y) => Mul.exception(NAMESPACE,BOOLEAN),
        [NUMBER]    : (x,y) => Mul.exception(NAMESPACE,NUMBER),
        [STRING]    : (x,y) => Mul.exception(NAMESPACE,STRING), 
        [LIST]      : (x,y) => Mul.exception(NAMESPACE,LIST),
        [NAMESPACE] : (x,y) => Mul.exception(NAMESPACE,NAMESPACE),
        [FUNCTION]  : (x,y) => Mul.exception(NAMESPACE,FUNCTION),
        [TUPLE]     : (x,y) => Mul[TUPLE](createTuple(x), y),
    }),
    [FUNCTION]  : Object.assign( (x,y) => Mul[FUNCTION][type(y)](x,y), {
        [NOTHING]   : (x,y) => null,
        [BOOLEAN]   : (x,y) => Mul.exception(FUNCTION,BOOLEAN),
        [NUMBER]    : (x,y) => Mul.exception(FUNCTION,NUMBER),
        [STRING]    : (x,y) => Mul.exception(FUNCTION,STRING), 
        [LIST]      : (x,y) => Mul.exception(FUNCTION,LIST),
        [NAMESPACE] : (x,y) => Mul.exception(FUNCTION,NAMESPACE),
        [FUNCTION]  : (x,y) => Mul.exception(FUNCTION,FUNCTION),
        [TUPLE]     : (x,y) => Mul[TUPLE](createTuple(x), y),
    }),
    [TUPLE]     : (tuple,y) => mapTuple(pair(tuple, y), item => Mul(item.first, item.second)),
    exception   : (xType, yType) => {
        throw new errors.RuntimeError(`Product operation not defined between ${xType} and ${yType}`);
    }
});

const Div = Object.assign((x,y) => Div[type(x)](x,y), {
    [NOTHING]   : Object.assign( (x,y) => (Div[NOTHING][type(y)] || Div[NOTHING].default)(x,y), {
        [TUPLE]     : (x,y) => Div[TUPLE](createTuple(x), y),
        default     : (x,y) => null,
    }),
    [BOOLEAN]   : Object.assign( (x,y) => Div[BOOLEAN][type(y)](x,y), {
        [NOTHING]   : (x,y) => Div.exception(BOOLEAN,NOTHING),
        [BOOLEAN]   : (x,y) => Div.exception(BOOLEAN,BOOLEAN),
        [NUMBER]    : (x,y) => Div.exception(BOOLEAN,NUMBER),
        [STRING]    : (x,y) => Div.exception(BOOLEAN,STRING),
        [LIST]      : (x,y) => Div.exception(BOOLEAN,LIST),
        [NAMESPACE] : (x,y) => Div.exception(BOOLEAN,NAMESPACE),
        [FUNCTION]  : (x,y) => Div.exception(BOOLEAN,FUNCTION),
        [TUPLE]     : (x,y) => Div[TUPLE](createTuple(x), y),
    }),
    [NUMBER]    : Object.assign( (x,y) => Div[NUMBER][type(y)](x,y), {
        [NOTHING]   : (x,y) => Div.exception(NUMBER,NOTHING),
        [BOOLEAN]   : (x,y) => Div.exception(NUMBER,BOOLEAN),
        [NUMBER]    : (x,y) => x / y,
        [STRING]    : (x,y) => Div.exception(NUMBER,STRING),
        [LIST]      : (x,y) => Div.exception(NUMBER,LIST),
        [NAMESPACE] : (x,y) => Div.exception(NUMBER,NAMESPACE),
        [FUNCTION]  : (x,y) => Div.exception(NUMBER,FUNCTION),
        [TUPLE]     : (x,y) => Div[TUPLE](createTuple(x), y),
    }),
    [STRING]    : Object.assign( (x,y) => Div[STRING][type(y)](x,y), {
        [NOTHING]   : (x,y) => Div.exception(STRING,NOTHING),
        [BOOLEAN]   : (x,y) => Div.exception(STRING,BOOLEAN),
        [NUMBER]    : (x,y) => Div.exception(STRING,NUMBER),
        [STRING]    : (x,y) => Div.exception(STRING,STRING),
        [LIST]      : (x,y) => Div.exception(STRING,LIST),
        [NAMESPACE] : (x,y) => Div.exception(STRING,NAMESPACE),
        [FUNCTION]  : (x,y) => Div.exception(STRING,FUNCTION),
        [TUPLE]     : (x,y) => Div[TUPLE](createTuple(x), y),
    }),
    [LIST]      : Object.assign( (x,y) => Div[LIST][type(y)](x,y), {
        [NOTHING]   : (x,y) => Div.exception(LIST,NOTHING),
        [BOOLEAN]   : (x,y) => Div.exception(LIST,BOOLEAN),
        [NUMBER]    : (x,y) => Div.exception(LIST,NUMBER),
        [STRING]    : (x,y) => Div.exception(LIST,STRING), 
        [LIST]      : (x,y) => Div.exception(LIST,LIST),
        [NAMESPACE] : (x,y) => Div.exception(LIST,NAMESPACE),
        [FUNCTION]  : (x,y) => Div.exception(LIST,FUNCTION),
        [TUPLE]     : (x,y) => Div[TUPLE](createTuple(x), y),
    }),
    [NAMESPACE] : Object.assign( (x,y) => Div[NAMESPACE][type(y)](x,y), {
        [NOTHING]   : (x,y) => Div.exception(NAMESPACE,NOTHING),
        [BOOLEAN]   : (x,y) => Div.exception(NAMESPACE,BOOLEAN),
        [NUMBER]    : (x,y) => Div.exception(NAMESPACE,NUMBER),
        [STRING]    : (x,y) => Div.exception(NAMESPACE,STRING), 
        [LIST]      : (x,y) => Div.exception(NAMESPACE,LIST),
        [NAMESPACE] : (x,y) => Div.exception(NAMESPACE,NAMESPACE),
        [FUNCTION]  : (x,y) => Div.exception(NAMESPACE,FUNCTION),
        [TUPLE]     : (x,y) => Div[TUPLE](createTuple(x), y),
    }),
    [FUNCTION]  : Object.assign( (x,y) => Div[FUNCTION][type(y)](x,y), {
        [NOTHING]   : (x,y) => Div.exception(FUNCTION,NOTHING),
        [BOOLEAN]   : (x,y) => Div.exception(FUNCTION,BOOLEAN),
        [NUMBER]    : (x,y) => Div.exception(FUNCTION,NUMBER),
        [STRING]    : (x,y) => Div.exception(FUNCTION,STRING), 
        [LIST]      : (x,y) => Div.exception(FUNCTION,LIST),
        [NAMESPACE] : (x,y) => Div.exception(FUNCTION,NAMESPACE),
        [FUNCTION]  : (x,y) => Div.exception(FUNCTION,FUNCTION),
        [TUPLE]     : (x,y) => Div[TUPLE](createTuple(x), y),
    }),
    [TUPLE]     : (tuple,y) => mapTuple(pair(tuple, y), item => Div(item.first, item.second)),
    exception   : (xType, yType) => {
        throw new errors.RuntimeError(`Division operation not defined between ${xType} and ${yType}`);
    }
});

const Pow = Object.assign((x,y) => Pow[type(x)](x,y), {
    [NOTHING]   : Object.assign( (x,y) => (Pow[NOTHING][type(y)] || Pow[NOTHING].default)(x,y), {
        [TUPLE]     : (x,y) => Pow[TUPLE](createTuple(x), y),
        default     : (x,y) => null,
    }),
    [BOOLEAN]   : Object.assign( (x,y) => Pow[BOOLEAN][type(y)](x,y), {
        [NOTHING]   : (x,y) => Pow.exception(BOOLEAN,NOTHING),
        [BOOLEAN]   : (x,y) => Pow.exception(BOOLEAN,BOOLEAN),
        [NUMBER]    : (x,y) => Pow.exception(BOOLEAN,NUMBER),
        [STRING]    : (x,y) => Pow.exception(BOOLEAN,STRING),
        [LIST]      : (x,y) => Pow.exception(BOOLEAN,LIST),
        [NAMESPACE] : (x,y) => Pow.exception(BOOLEAN,NAMESPACE),
        [FUNCTION]  : (x,y) => Pow.exception(BOOLEAN,FUNCTION),
        [TUPLE]     : (x,y) => Pow[TUPLE](createTuple(x), y),
    }),
    [NUMBER]    : Object.assign( (x,y) => Pow[NUMBER][type(y)](x,y), {
        [NOTHING]   : (x,y) => Pow.exception(NUMBER,NOTHING),
        [BOOLEAN]   : (x,y) => Pow.exception(NUMBER,BOOLEAN),
        [NUMBER]    : (x,y) => x ** y,
        [STRING]    : (x,y) => Pow.exception(NUMBER,STRING),
        [LIST]      : (x,y) => Pow.exception(NUMBER,LIST),
        [NAMESPACE] : (x,y) => Pow.exception(NUMBER,NAMESPACE),
        [FUNCTION]  : (x,y) => Pow.exception(NUMBER,FUNCTION),
        [TUPLE]     : (x,y) => Pow[TUPLE](createTuple(x), y),
    }),
    [STRING]    : Object.assign( (x,y) => Pow[STRING][type(y)](x,y), {
        [NOTHING]   : (x,y) => Pow.exception(STRING,NOTHING),
        [BOOLEAN]   : (x,y) => Pow.exception(STRING,BOOLEAN),
        [NUMBER]    : (x,y) => Pow.exception(STRING,NUMBER),
        [STRING]    : (x,y) => Pow.exception(STRING,STRING),
        [LIST]      : (x,y) => Pow.exception(STRING,LIST),
        [NAMESPACE] : (x,y) => Pow.exception(STRING,NAMESPACE),
        [FUNCTION]  : (x,y) => Pow.exception(STRING,FUNCTION),
        [TUPLE]     : (x,y) => Pow[TUPLE](createTuple(x), y),
    }),
    [LIST]      : Object.assign( (x,y) => Pow[LIST][type(y)](x,y), {
        [NOTHING]   : (x,y) => Pow.exception(LIST,NOTHING),
        [BOOLEAN]   : (x,y) => Pow.exception(LIST,BOOLEAN),
        [NUMBER]    : (x,y) => Pow.exception(LIST,NUMBER),
        [STRING]    : (x,y) => Pow.exception(LIST,STRING), 
        [LIST]      : (x,y) => Pow.exception(LIST,LIST),
        [NAMESPACE] : (x,y) => Pow.exception(LIST,NAMESPACE),
        [FUNCTION]  : (x,y) => Pow.exception(LIST,FUNCTION),
        [TUPLE]     : (x,y) => Pow[TUPLE](createTuple(x), y),
    }),
    [NAMESPACE] : Object.assign( (x,y) => Pow[NAMESPACE][type(y)](x,y), {
        [NOTHING]   : (x,y) => Pow.exception(NAMESPACE,NOTHING),
        [BOOLEAN]   : (x,y) => Pow.exception(NAMESPACE,BOOLEAN),
        [NUMBER]    : (x,y) => Pow.exception(NAMESPACE,NUMBER),
        [STRING]    : (x,y) => Pow.exception(NAMESPACE,STRING), 
        [LIST]      : (x,y) => Pow.exception(NAMESPACE,LIST),
        [NAMESPACE] : (x,y) => Pow.exception(NAMESPACE,NAMESPACE),
        [FUNCTION]  : (x,y) => Pow.exception(NAMESPACE,FUNCTION),
        [TUPLE]     : (x,y) => Pow[TUPLE](createTuple(x), y),
    }),
    [FUNCTION]  : Object.assign( (x,y) => Pow[FUNCTION][type(y)](x,y), {
        [NOTHING]   : (x,y) => Pow.exception(FUNCTION,NOTHING),
        [BOOLEAN]   : (x,y) => Pow.exception(FUNCTION,BOOLEAN),
        [NUMBER]    : (x,y) => Pow.exception(FUNCTION,NUMBER),
        [STRING]    : (x,y) => Pow.exception(FUNCTION,STRING), 
        [LIST]      : (x,y) => Pow.exception(FUNCTION,LIST),
        [NAMESPACE] : (x,y) => Pow.exception(FUNCTION,NAMESPACE),
        [FUNCTION]  : (x,y) => Pow.exception(FUNCTION,FUNCTION),
        [TUPLE]     : (x,y) => Pow[TUPLE](createTuple(x), y),
    }),
    [TUPLE]     : (tuple,y) => mapTuple(pair(tuple, y), item => Pow(item.first, item.second)),
    exception   : (xType, yType) => {
        throw new errors.RuntimeError(`Exponentiation operation not defined between ${xType} and ${yType}`);
    }
});

const Cmp = Object.assign( (x,y) => Cmp[type(x)](x,y), {
    [NOTHING]   : Object.assign((x,y) => Cmp[NOTHING][type(y)](x,y), {
        [NOTHING]   : (x,y) => Cmp.EQ,
        [BOOLEAN]   : (x,y) => Cmp.LT,
        [NUMBER]    : (x,y) => Cmp.LT,
        [STRING]    : (x,y) => Cmp.LT,
        [FUNCTION]  : (x,y) => Cmp.LT,
        [LIST]      : (x,y) => Cmp.LT,
        [NAMESPACE] : (x,y) => Cmp.LT,
        [TUPLE]     : (x,y) => Cmp[TUPLE](createTuple(x), y),
    }),
    [BOOLEAN]   : Object.assign( (x,y) => Cmp[BOOLEAN][type(y)](x,y), {
        [NOTHING]   : (x,y) => Cmp.GT,
        [BOOLEAN]   : (x,y) => x === y ? Cmp.EQ : (x ? Cmp.GT : Cmp.LT),
        [NUMBER]    : (x,y) => Cmp.LT,
        [STRING]    : (x,y) => Cmp.LT,
        [LIST]      : (x,y) => Cmp.LT,
        [NAMESPACE] : (x,y) => Cmp.LT,
        [FUNCTION]  : (x,y) => Cmp.LT,
        [TUPLE]     : (x,y) => Cmp[TUPLE](createTuple(x), y),
    }),
    [NUMBER]    : Object.assign( (x,y) => Cmp[NUMBER][type(y)](x,y), {
        [NOTHING]   : (x,y) => Cmp.GT,
        [BOOLEAN]   : (x,y) => Cmp.GT,
        [NUMBER]    : (x,y) => x === y ? Cmp.EQ : (x < y ? Cmp.LT : Cmp.GT),
        [STRING]    : (x,y) => Cmp.LT,
        [LIST]      : (x,y) => Cmp.LT,
        [NAMESPACE] : (x,y) => Cmp.LT,
        [FUNCTION]  : (x,y) => Cmp.LT,
        [TUPLE]     : (x,y) => Cmp[TUPLE](createTuple(x), y),
    }),
    [STRING]    : Object.assign( (x,y) => Cmp[STRING][type(y)](x,y), {
        [NOTHING]   : (x,y) => Cmp.GT,
        [BOOLEAN]   : (x,y) => Cmp.GT,
        [NUMBER]    : (x,y) => Cmp.GT,
        [STRING]    : (x,y) => x === y ? Cmp.EQ : ([x,y].sort()[0] === x ? Cmp.LT : Cmp.GT),
        [LIST]      : (x,y) => Cmp.LT,
        [NAMESPACE] : (x,y) => Cmp.LT,
        [FUNCTION]  : (x,y) => Cmp.LT,
        [TUPLE]     : (x,y) => Cmp[TUPLE](createTuple(x), y),
    }),
    [LIST]      : Object.assign( (x,y) => Cmp[LIST][type(y)](x,y), {
        [NOTHING]   : (x,y) => Cmp.GT,
        [BOOLEAN]   : (x,y) => Cmp.GT,
        [NUMBER]    : (x,y) => Cmp.GT,
        [STRING]    : (x,y) => Cmp.GT, 
        [LIST]      : (x,y) => Cmp[TUPLE](createTuple(...x), createTuple(...y)),
        [NAMESPACE] : (x,y) => Cmp.LT,
        [FUNCTION]  : (x,y) => Cmp.LT, 
        [TUPLE]     : (x,y) => Cmp[TUPLE](createTuple(x), y),
    }),
    [NAMESPACE] : Object.assign( (x,y) => Cmp[NAMESPACE][type(y)](x,y), {
        [NOTHING]   : (x,y) => Cmp.GT,
        [BOOLEAN]   : (x,y) => Cmp.GT,
        [NUMBER]    : (x,y) => Cmp.GT,
        [STRING]    : (x,y) => Cmp.GT, 
        [LIST]      : (x,y) => Cmp.GT,
        [NAMESPACE] : (x,y) => Cmp[TUPLE](createTuple(...iterNamespace(x)), createTuple(...iterNamespace(y))),
        [FUNCTION]  : (x,y) => Cmp.LT, 
        [TUPLE]     : (x,y) => Cmp[TUPLE](createTuple(x), y),
    }),
    [FUNCTION]  : Object.assign( (x,y) => Cmp[FUNCTION][type(y)](x,y), {
        [NOTHING]   : (x,y) => Cmp.GT,
        [BOOLEAN]   : (x,y) => Cmp.GT,
        [NUMBER]    : (x,y) => Cmp.GT,
        [STRING]    : (x,y) => Cmp.GT, 
        [LIST]      : (x,y) => Cmp.GT,
        [NAMESPACE] : (x,y) => Cmp.GT,
        [FUNCTION]  : (x,y) => Cmp[STRING][STRING](x.toString(), y.toString()), 
        [TUPLE]     : (x,y) => Cmp[TUPLE](createTuple(x), y),
    }),
    [TUPLE]     : async (tuple,y) => {
        for (let pair of iterPairs(tuple, y)) {
            let cmp = await Cmp(pair.first, pair.second);
            if (cmp !== Cmp.EQ) return cmp;
        }
        return Cmp.EQ;
    },
    LT: -1,
    EQ: 0,
    GT: +1,
});





// HELPER FUNCTIONS




// Service functions

function assign (namespace, names, values) {
    for (let i=0; i<names.length; i++) {
        let name = names[i];
        namespace[name] = isNothing(values[i]) ? null : values[i];
    }    
}

const VALID_NAME = /^[a-z_A-Z]+[a-z_A-Z0-9]*$/;

function isName (name) {
    return typeof name === "string" && VALID_NAME.test(name);
};

function listNames (namespace) {
    return Object.keys(namespace).filter(name => isName(name));    
}

function getValue (namespace, name) {
    const value = isName(name) ? namespace[name] : null;
    return isNothing(value) ? null : value;
}

function getListItem (list, index) {
    index = normalizeIndex(index, list.length);
    return index === -1 ? null : list[index];
}

function getStringCharacter (string, index) {
    index = normalizeIndex(index, string.length);
    return index === -1 ? "" : string[index];
}

function normalizeIndex (index, length) {
    if (!isNumber(index)) return -1
    index = index < 0 ? length + index : index - 1;
    return (0 <= index && index < length) ? index : -1;
}




function* iter (x) {
    if (isTuple(x)) {
        for (let item of x) yield item;
    } else if (!isNothing(x)) {
        yield x;
    }
}

function* iterPairs (X, Y) {
    const iX = iter(X);
    const iY = iter(Y);
    while (true) {
        let x = iX.next();
        let y = iY.next();
        if (x.done && y.done) break;
        yield {first:x.value, second:y.value};
    }    
}

function pair (X, Y) {
    return createTuple(...iterPairs(X, Y));
}

function list (X) {
    return Array.from( iter(X) )
}

function* iterNamespace (X) {
    let names = listNames(X).sort()
    for (let name of names) yield [name, X[name]];
}

async function mapAsync (X, func) {
    let map = [];
    for (let item of iter(X)) {
        map.push(await func(item));
    }
    return map;
}

async function mapTuple (tuple, func) {
    const items = await mapAsync(tuple, func);
    return createTuple(...items);
}

function createTuple (...items) {
    return {
        *[Symbol.iterator] () {
            for (let item of items) {
                if (isTuple(item)) {
                    for (let subItem of item) yield subItem;
                } else {
                    yield item;
                }
            }
        }
    }
}

function merge (namespace1, namespace2) {
    const names2 = listNames(namespace2);
    const values2 = names2.map(name2 => namespace2[name2]);
    const namespace3 = Object.create(namespace1);
    assign(namespace3, names2, values2);
    return namespace3;
}

async function anyPass (items, testFn) {
    for (let item of items) {
        if (await testFn(item)) return true;
    }
    return false;
}

async function allPass (items, testFn) {
    for (let item of items) {
        if (!(await testFn(item))) return false;
    }
    return true;
}

function extend (prototype, properties) {
    return Object.assign(Object.create(prototype), properties);
}

function normalizeArgs (...args) {
    switch (args.length) {
        case 0 : return null;
        case 1 : return args[0];
        default: return createTuple(...args);
    }
}



// Public API

exports.parse = (expression) => {
    const evaluate = parse(expression);
    return (expressionContext) => {
        if (!CONTEXT.isPrototypeOf(expressionContext)) {
            throw new Error("Invalid context.")
        };
        return evaluate(expressionContext);
    }
}

exports.createContext = (globals={}) => {
    const expressionContext = Object.create(CONTEXT);
    Object.assign(expressionContext, globals);
    return Object.create(expressionContext);
}

exports.evaluate = (expression, context) => {
    return this.parse(expression)(context);
}
