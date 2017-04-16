# olojs.Path module.
- **Version:** 0.1.0
- **Author:** Marcello Del Buono <m.delbuono@gmail.com>
- **License:** MIT
- **Content:**
    - [Path](#path-class)
  
## Path class
Class representing a filesystem-like path.  
It exteds the javascript Array object.
  
- Create a path from a string literal: `var path = new Path("a/b/c");`
- Create a path from an array: `var path = new Path(['a', 'b', 'c']);`
- Create a path from a combination of the two: `var path = new Path(['a', 'b/c/d', 'e/f']);`
- Create a path from a serie of subpaths: `var path = new Path('a/b/c', ['d','e/f'], 'g');`
  
### Path.prototype.slice(begin, end)
Behaves like Array.prototype.slice, with the only difference that it returns a Path object
  
### Path.prototype.leaf getter
Returns the last item of the path.  
Example: `(new Path('a/b/c')).leaf` will return `"c"`
  
### Path.prototype.parent getter
Returns the parent path of this path.  
Example: `(new Path('a/b/c')).parent` returns `new Path('a/b')`
  
### Path.prototype.equals(other)
Compares this path with the other path and returns true if they are equal.  
`other` can be a Path object, a path string, a path array or any combination of them.
  
Example:
```javascript
var path = new Path("a/b/c/d/e/f");
path.equals("a/b/c/d/e/f")                          // true
path.equals([`a/b`, ['c','d'], new Path('e/f'))     // true
path.equals("x/y/z")                                // false
```
  
### Path.prototype.isSubPathOf(path)
Returns true if this path is a sub-path of another path (e.g. /a/b/c is a subpath of /a/b).  
`path` can be a Path object, a path string, a path array or any combination of them.
  
### Path.prototype.subPath(...subPathItems)
Generates a sub-path of this path, allowing special `.` and `..` items.  
  
Example:
```javascript
var path = new Path(`a/b/c`);
path.subPath(`d/e`)             // -> new Path('a/b/c/d/e')
path.subPaht('./d/./e')         // -> new Path('a/b/c/d/e')
path.subPaht('../x')            // -> new Path('a/b/x')
path.subPaht('../..')           // -> new Path('a')
path.subPaht('../../../..')     // -> null
```
  
### Path.prototype.lookup(obj)
Searches the given object for the deep item matching this path.  
  
Example:
```javascript
var path = new Path("a/b/c");
path.lookup({a:{b:{c:10}}})     // -> 10
path.lookup({a:{b:{c:{d:20}}}}) // -> {d:20}
path.lookup({x:1})              // -> null
```
  
### Path.prototype.toString()
Retruns the string represtnatation of the path as a slash-separate sequence of items.  
Example `String(Path('a','b','c'))` will return `"a/b/c"`
  
### Path.from(path)
Converts a path or path literal to an object.  
The difference with the Path constructor is that this function will not
create a new object if path is already a Path object.
  
