
const Parser = require("./expression/parser");
const parse = Parser({
     
     binaryOperations: {
         ","    :   {precedence:10, handler:"$pair" },
         "="    :   {precedence:11, handler:"$set" },
         "->"   :   {precedence:12, handler:"$def" },

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
         ""     :   {precedence:31, handler:"$apply" },
     },
     
     voidHandler        : "$nothing",
     nameHandler        : "$get",
     stringHandler0     : "$str0",
     stringHandler1     : "$str1",
     stringHandler2     : "$str2",
     numberHandler      : "$numb",
     squareGroupHandler : "$list",
     curlyGroupHandler  : "$namespace",
 });
 
  
const WRAPPER = Symbol("wrapper");


function wrap (value) {
    
    // if already a Wrapper
    if (value instanceof Wrapper) return value;

    // if Nothing
    if (value === null || value === undefined || Number.isNaN(value)) return NOTHING;

    // if primitive
    switch (typeof value) {
        case "boolean"  : return Bool.wrap(value);
        case "number"   : return Numb.wrap(value);
        case "string"   : return Text.wrap(value);
    }    
    
    // It must be an object!
    
    // if it has been unwrapped before
    if (value[WRAPPER]) return value[WRAPPER];
    
    // if Function
    if (typeof value === "function") return JSFunc.wrap(value);
    
    // if List
    if (Array.isArray(value)) return List.wrap(value);
    
    // if iterable
    if (typeof value[Symbol.iterator] === "function") return Tuple.wrap(...value);

    // if a primitive object
    const tag = Object.prototype.toString.call(value);
    if (tag === '[object Boolean]') return Bool.wrap(value);
    if (tag === '[object Number]') return Numb.wrap(value);
    if (tag === '[object String]') return Text.wrap(value);
    
    // It is a Namespace!
    return Namespace.wrap(value);
}

function unwrap (value) {
    return value instanceof Wrapper ? value.unwrap() : value;
}


class Wrapper {
    
    constructor (value) {
        this.$value = value;
    }
    
    get typeName () {return "WRAPPER"};
    
    get typeRank () {return -1};
    
    *[Symbol.iterator] () {
        yield this;
    }    
    
    async apply (args) {
        return this;
    }
    
    async map (fn) {
        return wrap(await fn(this.$value));
    }
    
    size () {
        return 1;
    }
    
    add (other) {
        if (this._isNothing()) return other;
        if (other._isNothing()) return this;
        throw new Error(`Sum operation not defined between ${this.typeName} and ${other.typeName}`);
    }
    
    sub (other) {
        if (this._isNothing()) return NOTHING;
        if (other._isNothing()) return this;
        throw new Error(`Subtraction operation not defined between ${this.typeName} and ${other.typeName}`);
    }
    
    mul (other) {
        if (this._isNothing()) return NOTHING;
        if (other._isNothing()) return NOTHING;
        throw new Error(`Product operation not defined between ${this.typeName} and ${other.typeName}`);
    }
    
    div (other) {
        if (this._isNothing()) return NOTHING;
        throw new Error(`Division operation not defined between ${this.typeName} and ${other.typeName}`);
    }
    
    pow (other) {
        if (this._isNothing()) return NOTHING;
        throw new Error(`Exponentiation operation not defined between ${this.typeName} and ${other.typeName}`);
    }
    
    cmp (other) {
        if (this.typeRank < other.typeRank) return LT;
        if (this.typeRank > other.typeRank) return GT;
        if (this._isNothing() && other._isNothing()) return EQ;
        throw new Error(`Comparison operation not defined between ${this.typeName} types`);
    }

    *pair (other) {
        const iX = this[Symbol.iterator]();
        const iY = other[Symbol.iterator]();
        while (true) {
            let x = iX.next();
            let y = iY.next();
            if (x.done && y.done) break;
            yield new Pair(x.value, y.value);
        }    
    }
    
    unwrap () {
        return this.$value;
    }
    
    _isNothing () {
        return false;
    }
    
    toString () {
        return String(this.$value);
    }
    
    toInteger () {
        return this.size().unwrap();
    }
    
    _unwrapAsIndex (length) {
        return -1;
    }
    
    _unwrapAsName () {
        return "";
    }
    
    _unwrapAsFunction () {
        return async (...args) => (await this.apply(Tuple.wrap(...args))).unwrap();
    }
    
    static wrap (value) {
        return new this(value);
    }
}


class Pair extends Wrapper {
    
    constructor (x, y) {
        super([wrap(x), wrap(y)]);
    }
    
    get x () {return this.$value[0]}
    
    get y () {return this.$value[1]}
}


class Tuple extends Wrapper {
    
    constructor (...items) {
        super(items.map(wrap));
    }
    
    get typeName () {
        const items = Array.from(this);
        if (items.length === 0) return "NOTHING";
        if (items.length === 1) return items[0].typeName;
        return "TUPLE";
    }
    
    get typeRank () {
        const items = Array.from(this);
        if (items.length === 0) return 0;
        if (items.length === 1) return items[0].typeRank;
        return Infinity;
    }
    
    _isNothing () {
        return Array.from(this).length === 0;
    }
    
    *[Symbol.iterator] () {
        for (let item of this.$value) {
            if (item instanceof Tuple) {
                for (let subItem of item) yield subItem;
            } else {
                yield item;
            }
        }
    }

    async apply (args) {
        const retValues = [];
        for (let item of this) retValues.push(await item.apply(args));
        return Tuple.wrap(...retValues);
    }
    
    async map (fn) {
        return await this.wmap(item => item.map(fn));
    }
    
    async wmap (fn) {
        const mappedValues = [];
        for (let item of this) mappedValues.push(await fn(item));
        return Tuple.wrap(...mappedValues);        
    }
    
    size () {
        let size = 0;
        for (let item of this) size += item.size().unwrap();
        return Numb.wrap(size);
    }
    
    cmp (other) {
        if (this._isNothing()) return super.cmp(other);
        for (let pair of this.pair(other)) {
            let cmp = pair.x.cmp(pair.y);
            if (cmp != EQ) return cmp;
        }
        return EQ;        
    }
    
    toString () {
        return Array.from(this).map(item => item.toString()).join("");
    }
    
    unwrap () {
        const items = Array.from(this);
        if (items.length === 0) return null;
        if (items.length === 1) return items[0].unwrap();
        return {
            *[Symbol.iterator] () {
                for (let item of items) yield item.unwrap();
            }
        }
    }    
    
    _unwrapAsIndex (length) {
        const items = Array.from(this);
        return items.length === 1 ? items[0]._unwrapAsIndex(length) : super._unwrapAsIndex(length);
    }
    
    _unwrapAsName () {
        const items = Array.from(this);
        return items.length === 1 ? items[0]._unwrapAsName() : super._unwrapAsName();
    }
    
    _unwrapAsFunction () {
        const items = Array.from(this);
        if (items.length === 0) return () => null;
        if (items.length === 1) return items[0]._unwrapAsFunction();
        const functions = items.map(item => item._unwrapAsFunction());
        return async (...args) => {
            const values = [];
            for (let f of functions) values.push(await f(...args));
            return {
                *[Symbol.iterator] () {
                    for (let value of values) yield value; 
                }
            }
        }
    }
    
    static wrap (...items) {
        return new this(...items);
    }
}


class Bool extends Wrapper {
    
    get typeName () {return "BOOLEAN"}
    
    get typeRank () {return 1};    
    
    size () {
        return this.$value ? Numb.wrap(1) : Numb.wrap(0);
    }
    
    add (other) {
        if (other instanceof Bool) return Bool.wrap(this.$value || other.$value);
        return super.add(other);
    }
    
    mul (other) {
        if (other instanceof Bool) return Bool.wrap(this.$value && other.$value);
        return super.mul(other);
    }
    
    cmp (other) {
        if (other instanceof Bool) {
            if (this.$value === other.$value) return EQ;
            return this.$value ? GT : LT;
        }
        return super.cmp(other);
    }
    
    toString () {
        return this.$value ? "TRUE" : "FALSE";
    }
}


class Numb extends Wrapper {
    
    get typeName () {return "NUMBER"}
    
    get typeRank () {return 2};    
    
    size () {
        return Numb.wrap(Math.abs(this.$value));
    }
    
    add (other) {
        if (other instanceof Numb) return Numb.wrap(this.$value + other.$value);
        return super.add(other);
    }
    
    sub (other) {
        if (other instanceof Numb) return Numb.wrap(this.$value - other.$value);
        return super.sub(other);
    }
    
    mul (other) {
        if (other instanceof Numb) return Numb.wrap(this.$value * other.$value);
        if (other instanceof Sequence) return other.mul(this);
        return super.mul(other);
    }    
    
    div (other) {
        if (other instanceof Numb) return Numb.wrap(this.$value / other.$value);
        return super.div(other);
    }
    
    pow (other) {
        if (other instanceof Numb) return Numb.wrap(this.$value ** other.$value);
        return super.pow(other);
    }
    
    cmp (other) {
        if (other instanceof Numb) {
            if (this.$value === other.$value) return EQ;
            return this.$value < other.$value ? LT : GT;
        }
        return super.cmp(other);
    }
    
    toInteger () {
        return Math.trunc(this.$value);
    }
    
    _unwrapAsIndex (length) {
        const index = this.$value < 0 ? length + this.$value : this.$value - 1;
        return (0 <= index && index < length) ? index : super._unwrapAsIndex(length);        
    }
}


class Sequence extends Wrapper {
    
    get typeName () {return "SEQUENCE"}
    
    size () {
        return Numb.wrap(this.$value.length);
    }
    
    _normalizeIndex (index) {
        if (wrap(index) instanceof Numb) {
            let length = this.$value.length;
            index = index < 0 ? length + index : index - 1;
            return (0 <= index && index < length) ? index : -1;        
        } else {
            return -1;
        }
    }
}


class Text extends Sequence {
    
    get typeName () {return "STRING"}
    
    get typeRank () {return 3};    
    
    async apply (arg) {
        const index = arg._unwrapAsIndex(this.$value.length);
        return wrap(this.$value[index] || '');
    }  
    
    add (other) {
        if (other instanceof Text) return this.constructor.wrap(this.$value + other.$value);
        return super.add(other);
    }
    
    mul (other) {
        if (other instanceof Numb) {
            let count = other.unwrap();
            return count < 0 ? Text.wrap("") : Text.wrap(this.$value.repeat(count));
        }
        return super.mul(other);
    }
    
    cmp (other) {
        if (other instanceof Text) {
            if (this.$value === other.$value) return EQ;
            return [this.$value, other.$value].sort()[0] === this.$value ? LT : GT;
        }
        return super.cmp(other);
    }
    
    _unwrapAsName () {
        return /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(this.$value) ? this.$value : super._unwrapAsName();
    } 
}


class Name extends Text {}


class List extends Sequence {
    
    constructor (items) {
        super(items.map(wrap));
    }
    
    get typeName () {return "LIST"}
    
    get typeRank () {return 4};    
    
    async apply (arg) {
        const index = arg._unwrapAsIndex(this.$value.length);
        return wrap(this.$value[index]);
    }
    
    add (other) {
        if (other instanceof List) return this.constructor.wrap(this.$value.concat(other.$value));
        return super.add(other);
    }
    
    mul (other) {
        if (other instanceof Numb) {
            let count = other.unwrap(), product = [];
            for (let i=1; i<=count; i++) product = product.concat(this.$value);
            return List.wrap(product);
        }
        return super.mul(other);
    }
    
    cmp (other) {
        if (other instanceof List) {
            let thisTuple = Tuple.wrap(...this.$value);
            let otherTuple = Tuple.wrap(...other.$value);
            return thisTuple.cmp(otherTuple);
        }
        return super.cmp(other);
    }
    
    toString () {
        return `[${this.$value.length}]`;
    }
    
    unwrap () {
        return this.$value.map(item => item.unwrap());
    }
}


class JSFunc extends Wrapper {

    get typeName () {return "FUNCTION"}
    
    get typeRank () {return 6};    
    
    async apply (args) {
        return wrap(args instanceof Tuple ? await this.$value(...args.unwrap()) : await this.$value(args.unwrap()));
    }
    
    size () {
        return Numb.wrap(1);
    }
    
    cmp (other) {
        if (other instanceof JSFunc) {
            let thisSource = Text.wrap(this.toString());
            let otherSource = Text.wrap(other.toString());
            return thisSource.cmp(otherSource);
        }
        return super.cmp(other);
    }
 
    _unwrapAsFunction () {
        return this.unwrap();
    }
}


class Func extends JSFunc {
    
    async apply (args) {
        return await this.$value(args);
    }
    
    unwrap () {
        const unwrappedFunc = async (...args) => (await this.apply(Tuple.wrap(...args))).unwrap();
        unwrappedFunc[WRAPPER] = this;
        return unwrappedFunc;
    }
}


class Namespace extends Wrapper {
    
    constructor (object) {
        const value = {};
        for (let key in object) value[key] = wrap(object[key]); 
        super(value);
    }
    
    get typeName () {return "NAMESPACE"}
    
    get typeRank () {return 5};    
    
    async apply (arg) {
        const name = arg._unwrapAsName();
        return wrap(this.$value[name]);
    }
    
    size () {
        return Numb.wrap(this._getOwnNames().length);
    }
    
    add (other) {
        if (other instanceof Namespace) {
            let mergedNamespace = {};
            for (let name in this.$value) mergedNamespace[name] = this.$value[name];
            for (let name in other.$value) mergedNamespace[name] = other.$value[name];
            return Namespace.wrap(mergedNamespace);
        }
        return super.add(other);
    }
    
    cmp (other) {
        if (other instanceof Namespace) return this.toTuple().cmp(other.toTuple());
        return super.cmp(other);
    }
    
    toString () {
        return `{${this._getOwnNames().length}}`
    }
    
    toTuple () {
        let items = this._getOwnNames().sort().map(name => [name, this.$value[name]]);
        return Tuple.wrap(...items);
    }
    
    _getOwnNames () {
        return Object.getOwnPropertyNames(this.$value);
    }
    
    _assign (otherNamespace) {
        for (let name of otherNamespace._getOwnNames()) {
            this.$value[name] = otherNamespace.$value[name];
        }
        return this;
    }
    
    unwrap () {
        const object = {};
        for (let name of this._getOwnNames()) {
            object[name] = this.$value[name].unwrap();
        }
        return object;
    }
}


class Context extends Namespace {
    
    constructor () {
        super({});
        Object.assign(this.$value, builtins);
    }
    
    get typeName () {return "Context"}
    
    $nothing () {
        return NOTHING;
    }
    
    async $get (name) {
        return await this.apply(new Name(name));
    }
    
    $str0 (value) {
        return Text.wrap(value);
    }
    
    $str1 (value) {
        return Text.wrap(value);
    }
    
    $str2 (value) {
        return Text.wrap(value);
    }
    
    $numb (value) {
        return Numb.wrap(value);
    }
    
    async $pair (X, Y) {
        return Tuple.wrap(await X(this), await Y(this));
    }
    
    async $list (X) {
        return List.wrap([...(await X(this))]);
    }
    
    async $set (X, Y) {
        const x = await X({
            $nothing: null,
            $get: name => new Name(name),
            $pair: this.$pair
        });
        const names = await Array.from(x).map(item => item.unwrap());
        const values = Array.from(await Y(this));
        if (values.length > names.length) {
            values[names.length-1] = Tuple.wrap(...values.slice(names.length-1))
        }
        for (var i=0; i<names.length; i++) {
            this.$value[names[i]] = i < values.length ? values[i] : NOTHING;
        }            
        return NOTHING;
    }
    
    async $namespace (X) {
        const namespace = Namespace.wrap();
        const childContext = this.createChildContext();
        await X(childContext);
        return (Namespace.wrap())._assign(childContext);
    }
    
    $def (params, expression) {
        const func = async (args) => {
            const functionContext = this.createChildContext();
            await functionContext.$set(params, () => args);
            return await expression(functionContext);
        }
        func.toString = () => serializationContext.$def(params, expression);
        return new Func(func);
    }
    
    async $apply (X, Y) {
        return (await X(this)).apply(await Y(this));
    }
    
    async $dot (X, Y) {
        const namespace = await X(this);
        if (namespace instanceof Namespace) {
            let childContext = this.createChildContext();
            childContext._assign(namespace);
            return await Y(childContext);
        } else {
            throw new Error("Namespace expected on the left size of the '.' operator");
        }
    }
    
    async $or (X, Y) {
        const x = await X(this);
        if ((await this.$value.bool.apply(x)).unwrap()) return TRUE;
        const y = await Y(this);
        return await this.$value.bool.apply(y);
    }
    
    async $and (X, Y) {
        const x = await X(this);
        if ((await this.$value.not.apply(x)).unwrap()) return FALSE;
        const y = await Y(this);
        return await this.$value.bool.apply(y);
    }
    
    async $if (X, Y) {
        const y = await Y(this);
        return ((await this.$value.bool.apply(y)).unwrap()) ? await X(this) : NOTHING;
    }

    async $else (X, Y) {
        const x = await X(this);
        return x._isNothing() ? await Y(this) : x;
    }
    
    async $add (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.wrap(...x.pair(y)).wmap(pair => pair.x.add(pair.y));
    }

    async $sub (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.wrap(...x.pair(y)).wmap(pair => pair.x.sub(pair.y));
    }

    async $mul (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.wrap(...x.pair(y)).wmap(pair => pair.x.mul(pair.y));
    }

    async $div (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.wrap(...x.pair(y)).wmap(pair => pair.x.div(pair.y));
    }

    async $pow (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.wrap(...x.pair(y)).wmap(pair => pair.x.pow(pair.y));
    }

    async $eq (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.wrap(...x).cmp(Tuple.wrap(...y)) === EQ ? TRUE : FALSE;
    }
     
    async $ne (X, Y) {
        return await this.$eq(X, Y) === TRUE ? FALSE : TRUE;
    }

    async $lt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.wrap(...x).cmp(Tuple.wrap(...y)) === LT ? TRUE : FALSE;
    }

    async $ge (X, Y) {
        return await this.$lt(X, Y) === TRUE ? FALSE : TRUE;
    }

    async $gt (X, Y) {
        const x = await X(this);
        const y = await Y(this);
        return Tuple.wrap(...x).cmp(Tuple.wrap(...y)) === GT ? TRUE : FALSE;
    }

    async $le (X, Y) {
        return await this.$gt(X, Y) === TRUE ? FALSE : TRUE;
    }

    createChildContext (object={}) {
        const childContext = Object.create(this);
        childContext.$value = Object.create(this.$value);
        for (let key in object) childContext.$value[key] = wrap(object[key]);         
        return childContext;
    }
}


const NOTHING = Tuple.wrap();

const TRUE  = Bool.wrap(true);

const FALSE = Bool.wrap(false);

const LT = Numb.wrap(-1);
const EQ = Numb.wrap(0);
const GT = Numb.wrap(+1);

const builtins = {
    
    size: new Func(x => x.size()),
    
    bool: new Func(x => x.size().map(size => size !== 0)),
    
    not : new Func(x => x.size().map(size => size === 0)),

    map : new Func(f => new Func(items => items.map(f._unwrapAsFunction()))),
    
    red : new Func(f => new Func(async items => {
        items = Array.from(items);
        let value = items[0];
        for (let i=1; i<items.length; i++) {
            let args = Tuple.wrap(value, items[i]);
            value = await f.apply(args);
        }
        return value;
    })),
    
    str : new Func(x => new Text(x.toString())),
    
    int : new Func(x => new Numb(x.toInteger()))
}

const serializationContext = {
    $nothing:   ()     => "()",
    $get:       name   => name,
    $str0:      string => "`" + string + "`",
    $str1:      string => `'${string}'`,
    $str2:      string => `"${string}"`,
    $numb:      number => number,
    $pair       (X, Y)  {return `${X(this)},${Y(this)}`},
    $list       (X)     {return `[${X(this)}]`},
    $set        (X, Y)  {return `(${X(this)}) = (${Y(this)})`},
    $namespace  (X)     {return `{${X(this)}}`},
    $def        (X, Y)  {return `(${X(this)}) -> (${Y(this)})`},
    $apply      (X, Y)  {return `(${X(this)})(${Y(this)})`},
    $dot        (X, Y)  {return `(${X(this)}).(${Y(this)})` },
    $or         (X, Y)  {return `(${X(this)}) or (${Y(this)})` },
    $and        (X, Y)  {return `(${X(this)}) and (${Y(this)})` },
    $if         (X, Y)  {return `(${X(this)}) if (${Y(this)})` },
    $else       (X, Y)  {return `(${X(this)}) else (${Y(this)})` },
    $add        (X, Y)  {return `(${X(this)}) + (${Y(this)})` },
    $sub        (X, Y)  {return `(${X(this)}) - (${Y(this)})` },
    $mul        (X, Y)  {return `(${X(this)}) * (${Y(this)})` },
    $div        (X, Y)  {return `(${X(this)}) / (${Y(this)})` },
    $mod        (X, Y)  {return `(${X(this)}) mod (${Y(this)})` },
    $pow        (X, Y)  {return `(${X(this)}) ^ (${Y(this)})` },
    $eq         (X, Y)  {return `(${X(this)}) == (${Y(this)})` },
    $ne         (X, Y)  {return `(${X(this)}) != (${Y(this)})` },
    $lt         (X, Y)  {return `(${X(this)}) < (${Y(this)})` },
    $le         (X, Y)  {return `(${X(this)}) <= (${Y(this)})` },
    $gt         (X, Y)  {return `(${X(this)}) > (${Y(this)})` },
    $ge         (X, Y)  {return `(${X(this)}) >= (${Y(this)})` },
};


exports.parse = (expression) => {
    const evaluate = parse(expression);
    return async (expressionContext) => {
        if (!(expressionContext instanceof Context)) {
            throw new Error("Invalid context.")
        };
        return (await evaluate(expressionContext)).unwrap();
    }
}

exports.createContext = (globals={}) => {
    const context = new Context();
    return context.createChildContext(globals);
}

exports.evaluate = (expression, context) => {
    return this.parse(expression)(context);
}

exports.stringify = value => wrap(value).toString();
