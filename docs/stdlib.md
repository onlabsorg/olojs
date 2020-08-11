# olojs standard library

The standard library contains javascript modules that can be imported in the
olodocument scope using the `require` function.


### markdown

It returns a function that takes a markdown markup and renders it to HTML. It
is typically used as post-render function as follows:

```
<% __render__ = require "markdown" %>
```


### math

The math library exposes the following [JavaScript Math](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math)
functions and constants: 
[E](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/E), 
[PI](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/PI), 
[abs](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max). 
[acos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/acos),
[acosh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/acosh),
[asin](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/asin),
[asinh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/asinh),
[atan](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atan), 
[atanh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/atanh), 
[ceil](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/ceil), 
[cos](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cos),
[cosh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/cosh),
[exp](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/exp),
[floor](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/floor),
[log](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log),
[log10](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/log10),
[max](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/max), 
[min](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/min), 
[random](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random), 
[round](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round),
[sin](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sin),
[sinh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sinh),
[sqrt](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/sqrt),
[tan](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tan), 
[tanh](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/tanh), 
[trunc](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/trunc). 


### path

The path library exposes the following methods of the [NodeJS path](https://nodejs.org/api/path.html) module:

* `getBaseName`: is just NodeJS' `path.basename`
* `getDirName`: is NodeJS' `path.dirname` but always with trailing slash
* `getExtName`: is just NodeJS' `path.extname`
* `format`: is just NodeJS' `path.format`
* `parse`: is just NodeJS' `path.parse`
* `join`: is just NodeJS' `path.join`
* `normalize`: is just NodeJS' `path.normalize`
* `resolve`: is NodeJS' `path.resolve` assuming always `/` as root


### json

The json library exposes the following methods to parse and stringify json data:

* `json.parse(text)`: converts the JSON text to an object,
* `json.stringify(object, [spaces])`: converts the provided object to a JSON
  string, optionally with the given number of indentation spaces


### text

The text library exposes methods to manipulate strings.

##### text.char(...charCodes)
Returns the string made of the given UTF char codes.

##### text.code(str)
Returns the list of the UTF codes the given string is made of.

##### text.find(str, subStr)
Returns the index of the first occurrence of `subStr` in `str`.
Returns -1 if `subStr` is not contained in `str` at all.

##### text.lower(str)
Returns the passed string converted to lower case characters.

##### text.rfind(str, subStr)
Returns the index of the last occurrence of `subStr` in `str`.
Returns -1 if `subStr` is not contained in `str` at all.

##### text.slice(str, firstIndex, lastIndex)
It returns the slice of the given string between the `firstIndex` and the
`lastIndex` (not included).

Negative indexes are relative to the end of the string.

A missing `lastIndex` meand "up to the end of the string".

##### text.split(str, divider)
The split method divides a string into an ordered list of substrings, puts these 
substrings into a list, and returns the list.  
The division is done by searching for the `divider` pattern.

##### text.upper(str)
Returns the passed string converted to upper case characters.
