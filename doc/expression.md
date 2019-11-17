# olojs expression engine
- License: MIT
- Author: Marcello Del Buono <m.delbuono@onlabs.org>
  
## Expression class
  
### Expression.constructor(source)
Parses the sources and stores the AST internally.
  
### Expression.prototype.evaluate(scope)
Returns the value of the expression, evaluated in the given context. 
  
### Expression.prototype.toString()
Returns the original source expression. 
  
