# olojs.globals module
This module defines the global scope of an olojs document.
- License: MIT
- Author: Marcello Del Buono <m.delbuono@onlabs.org>
  
## globals.size(obj) - async function
It returns a number representing the argument size as follows:
- if `obj` is a plain object, it returns the number of its items
- if `obj` is a plain object with a `__size__` method, it returns `await obj.__size__()`
- if `obj` is an array, it returns its length
- if `obj` is a string, it returns its length
- if `obj` is a node wrapper (created with `context.Node`) it returns its size
- in any other case, it returns 0
  
## gloabls.Text(obj) - async function

It returns a string representation of the passed object.
- if `obj` has a `__text__` method, it returns `await obj.__text__()`
- if `obj` is a node wrapper (created with `context.Node`), it returns its content source
- in any other case, it returns `String(obj)`
  
## globals.Template(source) - async function
It returns a new text, obtained by replacing all the expressions in
the source text with their value.
An expression is a text enclosed between double curly brackets `{{...}}`.
Each expression will be evaluated using `context.eval`.
  
## globals.Markdown(source) - async function
It returns a new text, obtained by converting to HTML the source
interpreted as markdown.
  
