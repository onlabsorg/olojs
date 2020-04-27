

// -----------------------------------------------------------------------------
//  TUPLES
// -----------------------------------------------------------------------------

class Tuple {
    
    constructor (...items) {
        this._items = items.filter(item => !isNothing(item));
    }
    
    isNothing () {
        return this.normalize() === null;
    }
    
    *[Symbol.iterator] () {
        for (let item of this._items) {
            if (item instanceof Tuple) {
                for (let subItem of item) yield subItem;
            } else if (!isNothing(item)) {
                yield item;
            }
        }
    }

    normalize () {
        const iterator = this[Symbol.iterator]();
        const first = iterator.next();
        if (first.done) return null;
        return iterator.next().done ? first.value : this;
    }    
    
    async map (fn) {
        var retVals = NOTHING;
        for (let item of this) {
            retVals = Tuple.from(retVals, await fn(item));
        }
        return retVals;
    }
    
    static from (...items) {
        return new this(...items);
    }
    
    static fromPairs (tuple1, tuple2) {
        return new this(...pair(tuple1, tuple2));
    }
}

const NOTHING = new Tuple();

function normalize (value) {
    return value instanceof Tuple ? value.normalize() : value;
}





// -----------------------------------------------------------------------------
//  ARITHMETIC OPERATIONS
// -----------------------------------------------------------------------------

function add (x, y) {
    
    const xType = detectType(x); 
    if (xType === 'NOTHING') return y;
    
    const yType = detectType(y); 
    if (yType === 'NOTHING') return x;
    
    switch (`${xType}-${yType}`) {
        
        case 'BOOLEAN-BOOLEAN': 
            return x || y;
            
        case 'NUMBER-NUMBER': 
            return x + y;
            
        case 'STRING-STRING': 
            return x + y;
            
        case 'LIST-LIST': 
            return x.concat(y);
            
        case 'NAMESPACE-NAMESPACE': 
            return Object.assign({}, x, y);
            
        default: 
            return raise(`Sum operation not defined between ${xType} and ${yType}`);
    }
}

function sub (x, y) {
    const xType = detectType(x); if (xType === 'NOTHING') return NOTHING;
    const yType = detectType(y); if (yType === 'NOTHING') return x;
    switch (`${xType}-${yType}`) {
        case 'NUMBER-NUMBER': return x - y;
        default: return raise(`Subtraction operation not defined between ${xType} and ${yType}`);
    }
}

function mul (x, y) {
    const xType = detectType(x); if (xType === 'NOTHING') return NOTHING;
    const yType = detectType(y); if (yType === 'NOTHING') return NOTHING;
    switch (`${xType}-${yType}`) {
        case 'BOOLEAN-BOOLEAN': return x && y;
        case 'NUMBER-NUMBER': return x * y;
        case 'NUMBER-STRING': return x < 0 ? "" : y.repeat(x); 
        case 'STRING-NUMBER': return y < 0 ? "" : x.repeat(y);
        case 'LIST-NUMBER': return multiplyList(x,y);
        case 'NUMBER-LIST': return multiplyList(y,x);
        default: return raise(`Product operation not defined between ${xType} and ${yType}`);
    }    
}

function multiplyList (list, n) {
    var product = [];
    for (let i=1; i<=n; i++) product = product.concat(list);
    return product;    
}

function div (x, y) {
    const xType = detectType(x); if (xType === 'NOTHING') return NOTHING;
    const yType = detectType(y);
    switch (`${xType}-${yType}`) {
        case 'NUMBER-NUMBER': return x / y;
        default: return raise(`Division operation not defined between ${xType} and ${yType}`);
    }    
}

function mod (x, y) {
    const xType = detectType(x); if (xType === 'NOTHING') return y;
    const yType = detectType(y);
    switch (`${xType}-${yType}`) {
        case 'NUMBER-NUMBER': return x % y;
        default: return raise(`Modulo operation not defined between ${xType} and ${yType}`);
    }    
}

function pow (x, y) {
    const xType = detectType(x); if (xType === 'NOTHING') return NOTHING;
    const yType = detectType(y);
    switch (`${xType}-${yType}`) {
        case 'NUMBER-NUMBER': return x ** y;
        default: return raise(`Exponentiation operation not defined between ${xType} and ${yType}`);
    }    
}





// -----------------------------------------------------------------------------
//  COMPARISON OPERATIONS
// -----------------------------------------------------------------------------

function compare (x, y) {
    const xType = detectType(x);
    const yType = detectType(y);
    if (xType === 'NOTHING') return yType === 'NOTHING' ? 0 : -1;
    if (yType === 'NOTHING') return +1;
    if (xType === 'TUPLE') return lexCompare(x, Tuple.from(y));
    if (yType === 'TUPLE') return lexCompare(Tuple.from(x), y);
    switch (`${xType}-${yType}`) {
        case 'BOOLEAN-BOOLEAN': return x === y ? 0 : (x ? +1 : -1);
        case 'NUMBER-NUMBER':   return x === y ? 0 : (x<y ? -1 : +1);
        case 'STRING-STRING':   return x === y ? 0 : [x,y].sort()[0] === x ? -1 : +1;
        case 'LIST-LIST':       return lexCompare(Tuple.from(...x), Tuple.from(...y));
        default: return raise(`Comparison operation not defined between ${xType} and ${yType}`);
    }    
}

function lexCompare (tuple1, tuple2) {
    const pairs = Tuple.from(...pair(tuple1, tuple2));
    for (let pair of pairs) {
        let cmp = compare(pair.first, pair.second);
        if (cmp !== 0) return cmp;
    }
    return 0;
}

function isEqual (x, y) {
    const xType = detectType(x);
    const yType = detectType(y);
    if (xType === 'NOTHING') return yType === 'NOTHING';
    if (xType === 'TUPLE') return isLexEqual(x, Tuple.from(y));
    if (yType === 'TUPLE') return isLexEqual(Tuple.from(x), y);
    switch (`${xType}-${yType}`) {
        case 'BOOLEAN-BOOLEAN':     return x === y;
        case 'NUMBER-NUMBER':       return x === y;
        case 'STRING-STRING':       return x === y;
        case 'FUNCTION-FUNCTION':   return x === y;
        case 'LIST-LIST':           return isLexEqual(Tuple.from(...x), Tuple.from(...y));
        case 'NAMESPACE-NAMESPACE': {
            let xNames = Object.getOwnPropertyNames(x).filter(isValidName);
            let yNames = Object.getOwnPropertyNames(y).filter(isValidName);
            if (xNames.length !== yNames.length) return false;
            for (let xName of xNames) {
                let xValue = x[xName];
                let yValue = y.hasOwnProperty(xName) ? y[xName] : null;
                if (!isEqual(xValue, yValue)) return false;
            }
            return true;
        }
        default: return false;
    }    
}

function isLexEqual (tuple1, tuple2) {
    const pairs = Tuple.from(...pair(tuple1, tuple2));
    for (let pair of pairs) {
        if (!isEqual(pair.first, pair.second)) return false;
    }
    return true;    
}





// -----------------------------------------------------------------------------
//  APPLICATION OPERATION
// -----------------------------------------------------------------------------

function apply (x, y) {
    const xType = detectType(x);
    switch (xType) {
        case 'FUNCTION':  return x.call(this, ...Tuple.from(y));
        case 'STRING':    return getListItem(x, y);
        case 'LIST':      return getListItem(x, y);
        case 'NAMESPACE': {
            if (typeof x.__apply__ === 'function') {
                return apply.call(this, x.__apply__, y);
            }
            y = normalize(y);
            if (detectType(y) !== 'STRING') return NOTHING;
            return isValidName(y) && x.hasOwnProperty(y) ? x[y] : NOTHING;
        };
        case 'TUPLE':     return x.map(xi => apply.call(this, xi, y));
        default:          return raise(`Apply operation not defined on ${xType} type`);
    }
}





// -----------------------------------------------------------------------------
//  TYPE DETECTION
// -----------------------------------------------------------------------------

function detectType (value) {
    
    // if Nothing
    if (value === null || value === undefined || Number.isNaN(value)) return "NOTHING";

    // if primitive
    switch (typeof value) {
        case "boolean"  : return "BOOLEAN";
        case "number"   : return "NUMBER";
        case "string"   : return "STRING";
    }    
    
    // It must be an object!
    
    // if Function
    if (typeof value === "function") return "FUNCTION";
    
    // if List
    if (Array.isArray(value)) return "LIST";
    
    // if iterable
    if (value instanceof Tuple) return "TUPLE";

    // if a primitive object
    const tag = Object.prototype.toString.call(value);
    if (tag === '[object Boolean]') return "BOOLEAN";
    if (tag === '[object Number]') return "NUMBER";
    if (tag === '[object String]') return "STRING";
    
    // It is a Namespace!
    return "NAMESPACE";
}

function isNothing (value) {
    const valueType = detectType(value);
    if (valueType === 'NOTHING') return true;
    if (valueType === 'TUPLE' && value.isNothing()) return true;
    return false; 
}

function isValidName (name) {    
    return /^[a-z_A-Z]+[a-z_A-Z0-9]*$/.test(name);
}





// -----------------------------------------------------------------------------
//  TYPE CONVERSION
// -----------------------------------------------------------------------------

function convertToBoolean (x) {
    const xType = detectType(x);
    switch (xType) {
        case 'BOOLEAN':   return x;
        case 'NUMBER':    return x !== 0;
        case 'FUNCTION':  return true;
        case 'STRING':    return x.length !== 0;
        case 'LIST':      return x.length !== 0;
        case 'NAMESPACE': return countNames(x) !== 0;
        case 'TUPLE':     {
            for (let item of x) {
                if (convertToBoolean(item)) return true;
            }
            return false;            
        };
        default: return raise(`${xType} cannot be converted to BOOLEAN`);
    }    
}

function convertToString (x) {
    const xType = detectType(x);
    switch (xType) {
        case 'BOOLEAN':   return x ? "TRUE" : "FALSE";
        case 'NUMBER':    return String(x);
        case 'FUNCTION':  return String.fromCharCode(0x2A0D);
        case 'STRING':    return x;
        case 'LIST':      return `[${x.length}]`;
        case 'NAMESPACE': return detectType(x.__str__) === "STRING" ? x.__str__ : `{${countNames(x)}}`;
        default:          return raise(`${xType} cannot be converted to STRING`);
    }        
}

function convertToTuple (x) {
    switch (detectType(x)) {
        case 'STRING':      return Tuple.from(...Array.from(x))
        case 'LIST':        return Tuple.from(...x);
        case 'NAMESPACE':   return Tuple.from(...Object.getOwnPropertyNames(x));
        default:            return x;
    }    
}





// -----------------------------------------------------------------------------
//  EXCEPTIONS
// -----------------------------------------------------------------------------

class Exception extends Error {};

function raise (message) {
    throw new Exception(message);
}





// -----------------------------------------------------------------------------
//  EXPORTS
// -----------------------------------------------------------------------------

module.exports = {
    Tuple, NOTHING, normalize,
    add, sub, mul, div, mod, pow,
    compare, isEqual,
    apply,
    detectType, isValidName, isNothing,
    convertToBoolean, convertToString, convertToTuple,
    Exception, raise
};





// -----------------------------------------------------------------------------
//  HELPER FUNCTIONS
// -----------------------------------------------------------------------------

function getListItem (list, index) {
    if (detectType(index) === 'TUPLE') {
        let items = Array.from(index);
        if (items.length !== 1) return NOTHING;
        index = items[0];
    }
    if (detectType(index) !== 'NUMBER') return NOTHING;
    index = index < 0 ? list.length + index : index;
    return (0 <= index && index < list.length) ? list[Math.trunc(index)] : NOTHING;
}

function countNames (namespace) {
    return Object.getOwnPropertyNames(namespace).length;
}

function *pair (x, y) {
    const iX = Tuple.from(x)[Symbol.iterator]();
    const iY = Tuple.from(y)[Symbol.iterator]();
    while (true) {
        let x = iX.next();
        let y = iY.next();
        if (x.done && y.done) break;
        yield {first:x.value, second:y.value};
    }    
}
