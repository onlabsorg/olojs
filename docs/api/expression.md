# expression module
This module provides functions to parse and evaluate [swan](../swan.md)
expressions.
  
### evaluate_exp = expression.parse(exp_source)
Given an `exp_source` string containing a [swan](../swan.md) expression,
returns an `evaluate_exp` asynchronous function that takes an expression context 
as argument and resolves the value of the original expression.
  
### context = expression.createContext(...namespaces)
Create an expression context by extending the base context with all the 
passed namespaces as follows:
```js
context = Object.assign(Object.create(context), namespace[0]);
context = Object.assign(Object.create(context), namespace[1]);
context = Object.assign(Object.create(context), namespace[2]);
// ...
```
  
### str = await expression.stringify(x)
Converts any javascript value to a string, following the [swan](../swan.md) 
string conversion rules.
  
### expression.apply(f, ...args)
Exposes the [swan](../swan.md) apply operator to javascript.
  
