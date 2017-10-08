/**
 *  # olojs.Path module.
 *  - **Version:** 0.1.0
 *  - **Author:** Marcello Del Buono <m.delbuono@gmail.com>
 *  - **License:** MIT
 *  - **Content:**
 *      - [Path](#path-class)
 */


const isObjectLike = require("lodash/isObjectLike");
const isArray = require("lodash/isArray");
const isString = require("lodash/isString");
const isInteger = require("lodash/isInteger");
const toInteger = require("lodash/toInteger");

const STRING_SEPARATOR = ".";



/**
 *  ## Path class
 *  Class representing a filesystem-like path.
 *  It exteds the javascript Array object.
 */
class Path extends Array {

    /**
     *  ### Constructor
     *  - Create a path from a string literal: `var path = new Path("a.b.c");`
     *  - Create a path from an array: `var path = new Path(['a', 'b', 'c']);`
     *  - Create a path from a combination of the two: `var path = new Path(['a', 'b.c.d', 'e.f']);`
     *  - Create a path from a serie of subpaths: `var path = new Path('a.b.c', ['d','e.f'], 'g');`
     */
    constructor (...paths) {
        super();

        for (let path of paths) {

            // Transform each subPath in an array of keys ...
            // ... case array
            if (Array.isArray(path) || path instanceof Path) {
                path = new Path(...path);
            }
            // ... case string
            else if (path !== "" && path !== undefined && path !== null) {
                path = String(path).split(STRING_SEPARATOR);
            }
            // ... not a string nor an array
            else {
                path = []
            }

            // Append each key of the subPath to this path
            for (let item of path) {
                if (item !== "") {
                    this.push(item);
                }
            }
        }
    }


    /**
     *  ### Path.prototype.slice(begin, end)
     *  Behaves like `Array.prototype.slice`, with the only difference that it returns a `Path` object
     */
    slice (begin, end) {
        return new Path(Array.from(this).slice(begin, end));
    }


    concat (subPath) {
        return new Path(Array.from(this).concat(subPath));
    }


    /**
     *  ### Path.prototype.leaf - getter
     *  Returns the last item of the path.
     *  Example: `(new Path('a/b/c')).leaf` returns `"c"`
     */
    get leaf () {
        return this[this.length-1];
    }


    /**
     *  ### Path.prototype.parent - getter
     *  Returns the parent path of this path.
     *  Example: `(new Path('a.b.c')).parent` returns `new Path('a.b')`
     */
    get parent () {
        return this.slice(0,-1);
    }


    /**
     *  ### Path.prototype.equals(other)
     *  Compares this path with the other path and returns true if they are equal.
     *  `other` can be a Path object, a path string, a path array or any combination of them.
     *
     *  Example:
     *  ```javascript
     *  var path = new Path("a.b.c.d.e.f");
     *  path.equals("a.b.c.d.e.f")                          // true
     *  path.equals([`a.b`, ['c','d'], new Path('e.f'))     // true
     *  path.equals("x.y.z")                                // false
     *  ```
     */
    equals (other) {
        other = new Path(other);
        return String(this) === String(other);
    }


    /**
     *  ### Path.prototype.isSubPathOf(path)
     *  Returns true if this path is a sub-path of another path (e.g. a.b.c is a subpath of a.b).
     *  `path` can be a Path object, a path string, a path array or any combination of them.
     */
    isSubPathOf (path) {
        path = Path.from(path);
        return this.slice(0, path.length).equals(path);
    }


    /**
     *  ### Path.prototype.subPath(...subPathItems)
     *  Generates a sub-path of this path, allowing the following special items:
     *  - `^` represents the parent item
     *  - `^^` represents the root item
     *
     *  Example:
     *  ```javascript
     *  var path = new Path(`a.b.c`);
     *  path.subPath(`d.e`)             // -> new Path('a.b.c.d.e')
     *  path.subPaht('^.x')             // -> new Path('a.b.x')
     *  path.subPaht('^.^')             // -> new Path('a')
     *  path.subPaht('^.^.^.^')         // -> null
     *  ```

    subPath (...subPathItems) {
        subPathItems = new Path(subPathItems);
        var subPath = Array.from(this);
        for (let subPathItem of subPathItems) {
            if (subPathItem === ".") {
                // subPath stays the same
            } else if (subPathItem == "..") {
                let lastItem = subPath.pop();
                if (lastItem === undefined) return null;
            } else {
                subPath.push(subPathItem);
            }
        }
        return new Path(subPath);
    }
    */

    /**
     *  ### Path.prototype.lookup(obj)
     *  Searches the given object for the deep item matching this path.
     *
     *  Example:
     *  ```javascript
     *  var path = new Path("a.b.c");
     *  path.lookup({a:{b:{c:10}}})     // -> 10
     *  path.lookup({a:{b:{c:{d:20}}}}) // -> {d:20}
     *  path.lookup({x:1})              // -> null
     *  ```
     */
    lookup (obj) {
        var value = obj;
        for (let key of this) {

            if (isArray(value) || isString(value)) {
                if (!isInteger(Number(key))) return null;
                let index = toInteger(key);
                value = value[index];
            }

            else if (isObjectLike(value) && value.hasOwnProperty(key)) {
                value = value[key];
            }

            else {
                return null;
            }
        }

        return value === undefined ? null : value;
    }


    /**
     *  ### Path.prototype.toString()
     *  Retruns the string represtnatation of the path as a slash-separated sequence of items.
     *  Example: `String(Path('a','b','c'))` returns `"a.b.c"`
     */
    toString () {
        return this.join(STRING_SEPARATOR)
    }


    /**
     *  ### Path.from(path)
     *  Converts a path or path literal to an object.
     *  The difference with the Path constructor is that this function will not
     *  create a new object if path is already a Path object.
     */
    static from (path) {
        return path instanceof Path ? path : new Path(path);
    }
}



module.exports = Path;
