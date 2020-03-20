# expression module
This module provides functions to parse and evaluate [swan](./swan.md)
expressions.
  
### expression.parse(expressionSource)
The parse function takes an expression string as input and returns 
an `evaluate` function as output.
The `evaluate` function takes an expression context as input and
returns the expression value.
  
### expression.createContext(namespace)
Create and expression context containing all the names defined in the
passed namespace.

The returned namespace can then easily extended with context.$assign (deep version
of Object.assign) and context.$extends (Object.create followed by context.$assign).
  
### expression.evaluate(expressionSource, context)
Shortcut for `expression.parse(expressionSource)(context)`
  
### expression.stringify(x)
Stringifies swan objects returned by an expression evaluator.
This is basically the `context.str` function adapted for javascript use.
  
### expression.apply(f, ...args)
Applies the `args` arguments to the callable `f`
  

