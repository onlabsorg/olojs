define([
    "olojs/utils",
], function (utils) {


    class Path extends Array {

        get STRING_SEPARATOR () { return "/" }


        constructor (...paths) {

            super();

            for (let path of paths) {

                // Transform each subPath in an array of keys

                if (Array.isArray(path) || path instanceof Path) {
                    path = new Path(...path);
                } 

                else if (path !== "" && path !== undefined && path !== null) {
                    path = String(path).split(this.STRING_SEPARATOR);
                }

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


        slice (begin, end) {

            return new Path(Array.from(this).slice(begin, end));
        }


        get leaf () {
            return this[this.length-1];
        }


        get parent () {
            return this.slice(0,-1);
        }


        equals (other) {
            other = new Path(other);
            return String(this) == String(other)
        }


        isSubPathOf (path) {
            path = new Path(path);
            return this.slice(0, path.length).equals(path);
        }


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


        lookup (obj) {

            var value = obj;
            for (let key of this) {
                if (utils.isArray(value) || utils.isString(value)) {
                    if (!utils.isInteger(Number(key))) return null;
                    let index = utils.toInteger(key);
                    value = value[index];
                }

                else if (utils.isObjectLike(value) && value.hasOwnProperty(key)) {
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
         *  
         *  Retruns the string represtnatation of the path.
         *  
         *  ```js
         *  String(Path('a','b','c'))       // -> "a.b.c"
         *  String(Path('a','b',1,'c'))     // -> "a.b[1].c"
         *  ```
         */

        toString () {

            return this.join(this.STRING_SEPARATOR)
        }


        static from (path) {
            return path instanceof Path ? path : new Path(path);
        }
    }


    return Path;
});

