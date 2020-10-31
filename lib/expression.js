/**
 *  olojs.expression
 *  ============================================================================
 *  This module contains functions for parsing and evaluation swan expressions.
 *  
 *  Example:
 *  ```js
 *  evaluate = olojs.expression.parse( "3 * x" );
 *  context = olojs.expression.createContext({x:10});
 *  value = await evaluate(context);                        // 30
 *  ```
 */

const swan = require('@onlabsorg/swan-js');


/**
 *  olojs.expression.parse - function
 *  ----------------------------------------------------------------------------
 *  Parses a swan expression and returns a function that maps a context to an
 *  expression value.
 *
 *  ```js
 *  evaluate = olojs.expression.parse(expression);
 *  value = await evaluate(context);
 *  ```
 *  
 *  - `espression` is a string containing any valid swan expression
 *  - `context` is a valid swan expression context
 *  - `value` is the value that expression result has in the given context
 */
exports.parse = swan.parse;


/**
 *  olojs.expression.createContext - function
 *  ----------------------------------------------------------------------------
 *  Creates a valid expression context.
 *  
 *  ```js
 *  context = olojs.expression.createContext(...namespaces)
 *  ```
 *  
 *  - `namespaces` is a list of objects `ns1, ns2, ns3, ...` that will be merged
 *    to the core swan context 
 *  - `context` is an object containing all the core context properties, plus 
 *    all the properties of the passed namespace, added in order.
 */
const expression_globals = {
    "require": require("./expression/stdlib-loader")
};
exports.createContext = (...namespaces) => swan.createContext(expression_globals, ...namespaces);

// Swan internals exposed to javascript
exports.stringify = swan.F.str;
exports.apply = (f, ...args) => swan.O.apply(f, swan.T.createTuple(...args));
exports.isValidName = swan.T.isName;
exports.createTuple = swan.T.createTuple;
