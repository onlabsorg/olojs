/**
 *  # expression module
 *  This module provides functions to parse and evaluate [swan](./swan.md)
 *  expressions.
 */


const Parser = require("./expression/parser");

const parse = Parser({
     
     binaryOperations: {
         ","  : {precedence:10, handler:"$pair"  },
         "="  : {precedence:11, handler:"$set"   },
         ":"  : {precedence:11, handler:"$label" },
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
 
const {
    Tuple, NOTHING, normalize,
    add, sub, mul, div, mod, pow,
    compare, isEqual,
    apply,
    detectType, isValidName, isNothing,
    convertToBoolean, convertToString, convertToTuple,
    Exception, raise
} = require("./expression/types");



const $context = Symbol("Namespace context");

const context = {
    
    $nothing () {
        return NOTHING;
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
            text = text.replace("${"+i+"}", await this.str(...Tuple.from(value)));
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
        return Tuple.from(await X(this), await Y(this));
    },
    
    async $list (X) {
        return Array.from(Tuple.from(await X(this)));
    },
    
    async $name (name) {
        if (isValidName(name)) {
            let value = this[name];
            if (value !== undefined && value !== Object.prototype[name]) return value;
        }
        return NOTHING;
    },
    
    async $label (X, Y) {
        const x = await X({
            $nothing: this.$nothing,
            $name: name => name,
            $pair: this.$pair
        });
        const names = Array.from(Tuple.from(x));
        const y = await Y(this);
        const values = Array.from(Tuple.from(y));
        if (values.length > names.length) {
            values[names.length-1] = Tuple.from(...values.slice(names.length-1))
        }
        for (var i=0; i<names.length; i++) {
            this[names[i]] = i < values.length ? values[i] : null;
        }            
        return y;
    },
    
    async $set (X, Y) {
        await this.$label(X, Y);
        return NOTHING;
    },

    async $namespace (X) {
        const context = Object.create(this);
        await X(context);
        return Object.assign({[$context]:this}, context);
    },
    
    $def (params, expression) {
        return async (...args) => {
            const functionContext = Object.create(this);
            await functionContext.$set(params, () => Tuple.from(...args));
            return await expression(functionContext);
        }
    },
    
    async $apply (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return await apply.call(this, x, y);
    },
    
    async $dot (X, Y) {
        const namespaces = Tuple.from(await X(this));
        return namespaces.map(async namespace => {
            if (detectType(namespace) !== 'NAMESPACE') raise("Namespace expected on the left size of the '.' operator");
            const context = namespace[$context] || this;
            const childNamespace = Object.assign(Object.create(context), namespace);
            return await Y(childNamespace);
        });
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
        return (await this.bool(x)) ? await Y(this) : NOTHING;
    },

    async $else (X, Y) {
        const x = await X(this);
        return isNothing(x) ? await Y(this) : x;
    },
    
    async $add (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.fromPairs(x,y).map(pair => add(pair.first, pair.second));
    },

    async $sub (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.fromPairs(x,y).map(pair => sub(pair.first, pair.second));
    },

    async $mul (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.fromPairs(x,y).map(pair => mul(pair.first, pair.second));
    },

    async $div (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.fromPairs(x,y).map(pair => div(pair.first, pair.second));
    },

    async $mod (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.fromPairs(x,y).map(pair => mod(pair.first, pair.second));
    },

    async $pow (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.fromPairs(x,y).map(pair => pow(pair.first, pair.second));
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
    
    bool (...items) {
        return convertToBoolean(Tuple.from(...items));
    },
    
    not (...items) {
        return !convertToBoolean(Tuple.from(...items));
    },
    
    str (...items) {
        return items.map(convertToString).join("");
    },
    
    map (fn) {
        return (...items) => Tuple.from(...items).map(fn);
    },
    
    enum (...items) {
        const value = Tuple.from(...items).normalize();
        return convertToTuple(value);
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


/**
 *  ### expression.parse(expressionSource)
 *  The parse function takes an expression string as input and returns 
 *  an `evaluate` function as output.
 *
 *  The `evaluate` function takes an expression context as input and
 *  returns the expression value.
 */
exports.parse = (expression) => {
    const evaluate = parse(expression);
    return async (expressionContext) => {
        if (!context.isPrototypeOf(expressionContext)) {
            throw new Error("Invalid context.")
        };
        const value = await evaluate(expressionContext);
        return normalize(value);
    }
}


/**
 *  ### expression.createContext(namespace)
 *  Create and expression context containing all the names defined in the
 *  passed namespace.
 *  
 *  The returned namespace can then easily extended with context.$assign (deep version
 *  of Object.assign) and context.$extends (Object.create followed by context.$assign).
 */
exports.createContext = (namespace) => {
    return context.$extend(namespace);
}


/**
 *  ### expression.evaluate(expressionSource, context)
 *  Shortcut for `expression.parse(expressionSource)(context)`
 */
exports.evaluate = (expression, context) => {
    return this.parse(expression)(context);
}


/**
 *  ### expression.stringify(x)
 *  Stringifies swan objects returned by an expression evaluator.
 *  This is basically the `context.str` function adapted for javascript use.
 */
exports.stringify = x => context.str(...Tuple.from(x));


/**
 *  ### expression.apply(f, ...args)
 *  Applies the `args` arguments to the callable `f`
 */
exports.apply = (f, ...args) => apply(f, Tuple.from(...args));

exports.Exception = Exception;

exports.Tuple = Tuple;

exports.isValidName = isValidName;
