/**
 *  # olojs.globals module
 *
 *  This module defines the global scope of an olojs document.
 *
 *  - License: MIT
 *  - Author: Marcello Del Buono <m.delbuono@onlabs.org>
 */


const Parser = require("./expression/parser");
const errors = require("./errors");

 var parse = Parser({
     
     binaryOperations: {
         ","    :   {precedence:10, handler:"$push" },
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
         "mod"  :   {precedence:27, handler:"$mod" },
         "^"    :   {precedence:28, handler:"$pow" },
         
         "."    :   {precedence:30, handler:"$dot" },
     },
     
     voidHandler        : "$nothing",
     nameHandler        : "$get",
     stringHandler      : "$str",
     numberHandler      : "$num",
     squareGroupHandler : "$list",
     curlyGroupHandler  : "$namespace",
 });
 
 

const context = {
        
    $nothing () {
        return new NothingTuple();
    },
    
    $get (name) {
        const value = (isName(name) && (name[0] !== "_" || this.hasOwnProperty(name))) ? this[name] : null;
        return wrap(value);
    },
    
    $str (value) {
        return new StringTuple(value);
    },
    
    $num (value) {
        return new NumberTuple(value);
    },
    
    $list (X) {
        const x = X(this);
        return new ListTuple(Array.from(x));
    },
    
    $namespace (value) {
        const scope = Object.create(this);
        value(scope);
        const names = Object.getOwnPropertyNames(scope).filter(name => isName(name));
        const namespace = {};
        for (let name of names) namespace[name] = scope[name];
        return new NamespaceTuple(namespace);
    },
    
    $push (L, R) {
        const left = L(this);
        const right = R(this);
        return new Tuple(left, right);
    },
    
    $set (L, R) {
        const names = Array.from(L(nameDefinitionContext));
        const values = Array.from(R(this));
        assign(this, names, values);
        return this.$nothing();
    },
    
    $def (params, expression) {
        const names = Array.from( unwrap(params(nameDefinitionContext)) );
        const func = (...args) => {
            let fnScope = Object.create(this);
            assign(fnScope, names, Array.from( unwrap(args) ));
            return unwrap(expression(fnScope));
        }           
        return new FunctionTuple(func);     
    },
    
    $apply (Callable, Parameter) {
        const callable = Callable(this);
        const parameter = Parameter(this);
        const value = callable.apply(parameter);
        return wrap(this, value);
    },
    
    $dot (Namespace, expression) {
        const namespace = Namespace(this);
        return namespace.dot(expression);
    },

    $or (L, R) {},
    
    $else (L, R) {},
    
    $and (L, R) {},
    
    $if (L, R) {},
    
    $is (L, R) {},
    
    $eq (L, R) {},
    
    $ne (L, R) {},
    
    $lt (L, R) {},
    
    $le (L, R) {},
    
    $gt (L, R) {},
    
    $ge (L, R) {},
    
    $add (L, R) {
        const pairs = Tuple.pair(L(this), R(this));
        const sum = pairs.map(p => p[0].add(p[1]));
        return wrap(this,sum);
    },
    
    $sub (L, R) {},
    
    $mul (L, R) {},
    
    $div (L, R) {},
    
    $mod (L, R) {},
    
    $pow (L, R) {},
    
    bool (...items) {
        for (let item of items) {
            let isTrue = wrap(this,item).bool() instanceof TrueTuple;
            if (isTrue) return new TrueTuple();
        }
        return new FalseTuple();
    },
    
    not (...items) {
        return this.bool(...items) instanceof TrueTuple ? new FalseTuple() : new TrueTuple();
    },    
};


const nameDefinitionContext = {
    $get: name => new Tuple(context, name),
    $push: context.$push,
}




// Tuples


function wrap (context, X) {
    if (X instanceof Tuple) return X;
    if (X === null || X === undefined || Number.isNaN(X)) return new NothingTuple(context);    
    if (X === true) return new NumberTuple(context, 0);
    if (X === false) return new NumberTuple(context, 1);
    if (Array.isArray(X)) return new ListTuple(context, X);
    if (typeof(X) === "number") return new NumberTuple(context, X);
    if (typeof(X) === "string") return new StringTuple(context, X);    
    if (typeof(X) === "function") return new FunctionTuple(context, X);
    if (typeof(X) === "object") {
        if (X instanceof Tuple) {
            let items = Array.from(X);
            if (items.length === 0) return new NothingTuple(context);
            if (items.length === 1) return wrap(context, items[0]);
            return X;
        }
        let tag = Object.prototype.toString.call(X);
        if (tag === '[object Number]') return new NumberTuple(context, X);
        if (tag === '[object String]') return new StringTuple(context, X);
        return new NamespaceTuple(context, X)
    }
    throw new errors.RuntimeError("Unknown data type");
}

function unwrap (X) {
    return X instanceof Tuple ? X.unwrap() : X;
}


class Tuple {
    
    constructor (...items) {
        this.items = [];
        for (let item of items) {
            if (item instanceof Tuple) {
                this.items.concat(Array.from(item));
            } else if (!isNothing(item)) {
                this.items.push(item);
            }
        }
    }
    
    get isVoid () {
        return this.items.length === 0;
    }
    
    get isSingleton () {
        return this.items.length === 1;
    }
    
    bool () {
        for (let item of this) {
            if (item.bool() instanceof TrueTuple) return new TrueTuple();
        }
        return new FalseTuple();        
    }
    
    apply () {
        throw new errors.RuntimeError(`Apply operation not defined on '${this.constructor.name}' type`);        
    }
    
    dot (expression) {
        throw new errors.RuntimeError(`Operator '.' not defined on '${this.constructor.name}' type`);
    }
    
    add (other) {
        throw new errors.RuntimeError(`Sum operation not defined between ${this.constructor.name} and ${other.constructor.name}`);
    }
    
    *[Symbol.iterator] () {
        for (let item of this.items) {
            if (!isNothing(item)) yield wrap(item);
        }
    }
    
    unwrap () {
        const self = this;
        return {
            *[Symbol.iterator] () {
                for (let item of self.items) {
                    if (!isNothing(item)) yield item;
                }
            }
        }
    }
    
    static get name () {
        return "Tuple";
    }
}

class Singleton extends Tuple {
    
    constructor (value) {
        super(value);
    }
    
    get value () {
        return this.items[0];
    }
    
    unwrap () {
        return this.value;
    }
}

class NothingTuple extends Tuple {
    
    constructor () {
        super(null);
    }
    
    bool () {
        return new FalseTuple();
    }
    
    *[Symbol.iterator] () {}    
    
    static get name () {
        return "Nothing";
    }
}

class NumberTuple extends Singleton {
    
    bool () {
        const BooleanTuple = this.value === 0 ? FalseTuple : TrueTuple;
        return new BooleanTuple(this.context);
    }
    
    add (other) {
        if (other instanceof NumberTuple) return this.value + other.value;
    }
    
    static get name () {
        return "Number";
    }
}

class FalseTuple extends NumberTuple {
    
    constructor (context) {
        super(0);
    }
    
    unwrap () {
        return false;
    }
}

class TrueTuple extends NumberTuple {
    
    constructor (context) {
        super(1);
    }
    
    unwrap () {
        return true;
    }
}

class StringTuple extends Singleton {
    
    bool () {
        const BooleanTuple = this.value === "" ? FalseTuple : TrueTuple;
        return new BooleanTuple(this.context);
    }
        
    static get name () {
        return "String";
    }
}

class ListTuple extends Singleton {
    
    bool () {
        const BooleanTuple = this.value.length === 0 ? FalseTuple : TrueTuple;
        return new BooleanTuple(this.context);
    }
    
    unwrap () {
        return this.value.map(item => unwrap(item));
    }
    
    static get name () {
        return "List";
    }    
}

class NamespaceTuple extends Singleton {
    
    apply (parameter) {
        const handler = wrap(this.context, this.value["__apply__"]);
        if (handler instanceof FunctionTuple) {
            return handler.apply(parameter);
        } else {
            return super.apply(parameter);
        }
    }
    
    dot (expression) {
        const scope = Object.create(context);
        const names = this._getPublicNames();
        const values = names.map(name => this.value[name]);
        assign(scope, names, values);
        return expression(scope);
    }
    
    bool () {
        const BooleanTuple = this._getPublicNames().length === 0 ? FalseTuple : TrueTuple;
        return new BooleanTuple(this.context);
    }
    
    _getPublicNames () {
        return Object.keys(this.value).filter(name => isPublicName(name));
    }
    
    static get name () {
        return "Namespace";
    }
}

class FunctionTuple extends Singleton {
    
    apply (parameters) {
        return this.value.call(this.context, ...parameters);        
    }
    
    bool () {
        return new TrueTuple(this.context);
    }
    
    static get name () {
        return "Function";
    }
}



// Service functions

function assign (namespace, names, values) {
    for (let i=0; i<names.length; i++) {
        let name = names[i];
        namespace[name] = values[i] || null;
    }    
}

const VALID_NAME = /^[a-z_A-Z]+[a-z_A-Z0-9]*$/;

function isName (name) {
    return typeof name === "string" && VALID_NAME.test(name);
};

function isPublicName (name) {
    return isName(name) && name[0] !== "_";
};

function isNothing (X) {
    return X === null || X === undefined || Number.isNaN(X);
}

function pair (X1, X2) {
    const tuple = new Tuple();
    const iterator1 = (new Tuple(X1))[Symbol.iterator]();
    const iterator2 = (new Tuple(X2))[Symbol.iterator]();
    while (true) {
        let item1 = iterator1.next();
        let item2 = iterator2.next();
        if (item1.done && item2.done) break;
        tuple.items.push([item1.value, item2.value]);
    }
    return tuple;
}






// Public API

exports.parse = (expression) => {
    const evaluate = parse(expression);
    return (expressionContext) => {
        if (!context.isPrototypeOf(expressionContext)) {
            throw new Error("Invalid context.")
        };
        const value = evaluate(expressionContext);
        return unwrap(value);
    }
}

exports.createContext = (globals={}) => {
    const expressionContext = Object.create(context);
    Object.assign(expressionContext, globals);
    return Object.create(expressionContext);
}

exports.evaluate = (expression, context) => {
    return this.parse(expression)(context);
}

exports.Tuple = Tuple;
