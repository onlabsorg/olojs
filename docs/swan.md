# Swan language

`Swan` is the expression language of the olo-documents. 

An expression is a sequence of binary operations (operand_a operator1 operand_b operator2 operand_c ...),ceventually grouped with parenthesis (...), square braces [...] or curly braces {...}.

For example, the following expression will resolve to `14`.

```
12 + 2 * 3 - 4
```

## Boolean data type
The `TRUE` and `FALSE` names are predefined in the global namespace and
map to the two boolean values.


## Numeric data type
Examples of valid numeric literals are:
* `10`
* `3.14`
* `-2.5e3`


## String data type
A string is any sequence of characters, enclosed between one of the following
three types of quotes:

* `"double quotes string"`
* `'single quotes string'`
* `` `accent quotes string` ``

The accent quotes are although special: they define a string template, meaning
that they evaluate the `${expression}` fields and replace them with the expression
return value. For example the string `` `twice 3 is ${2*3}` `` will resolve
to `twice 3 is 6`.


## Tuple data type and pairing operator
Tuples are an ordered sequence of values. They are created using the comma 
operator `,`. The following example shows a tuple made of three items: `1`, `2` and `"abc"`

```
1, 2, "abc"
```

Tuples can contain any other data type as items, except tuples itself. If you
try to create a tuple of tuples, you get a flattened tuple as result: 
`(1,2),(3,4),5` is equivalent to `1,2,3,4,5`.

Any value in swan (e.g. `10` or `"abc"` or a list, etc.) is also seen as a
tuple made of only one item.

A special type of tuple is the empty tuple `()` which is used in swan to 
represent the concept of nothingness.


## Range operator
The range operation `a:b` creates a numeric tuple containing all the integers
between `a` and `b`, including also `a` and `b`. For example:

* `3:7` is equivalent to `3,4,5,6,7`
* `7:3` is equivalent to `7,6,5,4,3`
* `2:2` is equivalent to `2`

If a range boundary is a decimal, it will be truncated. For example `3.2:5.8` is equivalent to `3:5` and resolves to `3,4,5`.


## List data type
A list is an ordered sequence of values, just like a tuple, but it behaves
like a single value (uni-dimensional tuple). For this reason, it allows 
nesting and behaves differently from tuples.

A list is created as `[tuple]`. Examples of valid list literals are:
* `[1,2,"abc"]` list with three elements
* `[1]` list with only one element
* `[]` empty list
* `[[1,2],[3,4,5]]` list of lists


## Assignment operators
The assignment operator binds a name to an expression value:

`x = 10 + 1`

After this expression, the context will contain a name `x` with associated 
value `11`. After defining `x` we can reuse it as follows:

`x * 2`

which will resolve to `22`.

Valid names can contain letters (`a..z` and `A..Z`), numbers (`0..9`) and the
underscore character (`_`), but they cannot start with a number character.

Every expression has a return value; in particular an assignment expression
`x = 10` returns nothing (the empty tuple in swan, equivalent to `null` in
javascript). 

Multiple values (a tuple of values) can be assigned to multiple names (a tuple 
of names) as follows:

```
(a, b, c) = (1, 2, 3)
```

After this expression, `a` will hold the value `1`, `b` will hold the value `2`
and `c` will hold the value `3`.

If the tuple of values contains less items than the tuple of names, the exceeding
names will be assigned nothing (empty tuple): `(a,b,c,d) = (1,2)` will result in
`a=1`, `b=2`, `c=()` and `d=()`.

If the tuple of values contains more items than the tuple of names, the last name
will be assigned the tuple of the remaining values: `(a,b,c) = (1,2,3,4,5)` will
result in `a=1`, `b=2` and `c=(3,4,5)`.


## Namespace data type
A namespace is a set of name-value pairs defined as `{tuple}`.

```
{
    x = 10,
    y = 20,
    z = 30
}
```

We basically assigned three values to three names, but those names are not 
available in the global context, but wrapped in the namespace object instead.

In order to access the names inside a namespace, you can use either the 
application operator ` ` or the subcontexting operator `.`. We will explain 
these operators later, but some examples are anticipated below:

* `ns = {a=1, b=2, c=3}` defines a namespace and maps it to the name `ns`
* `ns.a` resolves to `1`
* `ns('b')` resolves to `2`


## Function data type
A function is a parametric expression, defined as `names -> expression`.
For example:

```
(x,y) -> x+y
```

defines a function that takes two parameters `x` and `y` as input and produces
their sum as output.

In order to execute a function, we use the application operator (void operator), 
which will be introduced later, but some examples are anticipated below:

* `f = x -> 2*x` defines a function that takes one parameter and doubles it
* `f 4` resolves to `8`
* `f(5)` resolves to `10`


## Application operation
A missing operator (two operands next to each other: `F X`), defines an 
application operation: `F` applied to `X`.

**When F is a function**, the application operation corresponds to a function 
call. Given a function `f: x -> 2*x`, the expression `f 5` is an application
operation (`f` applied to `5`) that resolves to `10`.

Since the expression `(5)` is equivalent to the expression `5`, you could also 
write the application operation in the more familiar form `f(5)`.

When the function parameter `x` is a tuple (e.g. `f: (x,y) -> x+y`), the 
application will look like `f(x,y)`. In this case the parenthesis are necessary, because `f x,y` would resolve to the tuple `(f x), y` instead.

Notice that assigning parameter values to tuple arguments works the same as 
tuple-values to tuple-names assignment:

* in `((x,y,z)->x+y+z)(1,2)` the parameter `x` will be `1`, the parameter `y` 
  will be `2` and the parameter `z` will be `()`
* in `((x,y)->x+y)(1,2,3)` the parameter `x` will be `1` and the parameter `y` 
  will be the `2,3` tuple

**When F is a list and X is a number**, the application `F X` returns the list 
item at position X. To understand this behavior, think at a list as a function 
that maps natural numbers to values.

Examples:
* `['a','b','c'] 0` will return `'a'`
* `['a','b','c'] (1)` will return `'b'`
* `['a','b','c'](2)` will return `'c'`

If X is a negative number, it will be interpreted as relative to the end of the
list:

* `['a','b','c'](-1)` will return `'c'`
* `['a','b','c'](-2)` will return `'b'`
* `['a','b','c'](-3)` will return `'a'`

If X is an out-of-range number or not a number, `F X` will return the empty 
tuple `()`.

**When F is a string and X is a number**, the application `F X` returns the 
character at position X. This works exactly the same as if a string was a
list of characters, except that it returns an empty string in all the cases 
where a list would return an empty tuple.

**When F is a namespace and X is a string**, the application `F X` returns the 
value of `F` mapped to the name `X`. A namespace can therefore be interpreted
as a mapping between names and values.

Examples:
* `{a=1, b=2} "a"` will return `1`
* `{a=1, b=2}("b")` will return `2`

If X is a non-mapped name or not a name at all, `F X` will return the empty 
tuple `()`.


## Arithmetic operations
The arithmetic operators are sum (`+`), subtraction (`-`), multiplication (`*`),
division (`/`), modulo (`%`) and exponentiation (`^`).

#### Arithmetic operations between booleans
* `B1 + B2` returns the logic `or` between `B1` and `B2`
* `B1 * B2` returns the logic `and` between `B1` and `B2`

#### Arithmetic operations between numbers
The arithmetic operations between numbers work as learnt it in primary school:

* `5 + 2` returns `7`
* `5 - 2` returns `3`
* `5 * 2` returns `10`
* `5 / 2` returns `2.5`
* `5 % 2` returns `1`
* `5 ^ 2` returns `25`

#### Arithmetic operations on strings
The string type implements the sum operation between two strings and the product 
between a number and a string.

The sum `s1 + s2` between two strings returns the concatenation of the two 
strings. For example `"abc" + "def"` returns `"abcdef"`.

The product `n * s` between a number `n` and a string `s` is equivalent to 
`s * n` and returns the string `s` repeated `n` times. For example `3 * "Abc"`, 
as well as `"Abc" * 3` returns `"AbcAbcAbc"`.

#### Arithmetic operations on lists
The list type implements the sum operation between two lists and the product 
between a number and a list.

The sum `l1 + l2` between two lists returns the concatenation of the two lists.
For example `[1,2,3] + [4,5,6]` returns `[1,2,3,4,5,6]`.

The product `n * l` between a number `n` and a list `l` is equivalent to `l * n`
and returns the list `l` repeated `n` times. For example `3 * [1,2,3]`, as well 
as `[1,2,3] * 3` returns `[1,2,3,1,2,3,1,2,3]`.

#### Arithmetic operations between namespaces
The namespace type implements only the sum operation.

The sum `ns1 + ns2` between two namespaces returns a new namespace obtained by
merging `ns1` and `ns2`. For example `{a=1,b=2} + {c=3,d=4}` returns 
`{a=1, b=2, c=3, d=4}`.

If `ns1` and `ns2` contain the same name, the value of `ns2` prevails. For
example `{a=1,b=2} + {b=3, c=4}` returns `{a=1, b=3, c=4}`.

#### Arithmetic operations between tuples
The sum of a tuple `t1=(x1,x2,x3)` and a tuple `t2=(y1,y2,y3)` is the tuple
`(x1+y1, x2+y2, x3+y3)`. The same goes for difference, product, division,
modulo and exponentiation.

If the two tuples have different number of items, the missing items are assumed
to be `()`. The empty tuple follows the rules listed below:

* `() + any` equals `any + ()` equals `any`
* `() - any` equals `()`
* `any - ()` equals `any`
* `() * any` equals `any * ()` equals `()`


## Comparison operations
The comparison operations are:
* Equal: `==`
* Not equal: `!=` 
* Less than: `<`
* Less than or equal to: `<=`
* Greater than: `>`
* Greater than or equal to: `>=`

#### Comparison operations between booleans
Two booleans are equal if they are both true or both false. Furthermore false
is less than true.

#### Comparison operations between numbers
The comparison between numbers works as expected. For example, the following
expressions resolve to true:

* `10 == 10`
* `10 != 11`
* `10 < 11`
* `10 <= 11`
* `10 <= 10`

#### Comparison operations between strings
Two strings are equal if they contain the same sequence of characters. For
example `"abc" == "abc"` is true.

A string `s1` is less than a string `s2` if `s1` precedes `s2` alphabetically.
For example, the following expressions return true:

* `"abc" < "xyz"`
* `"zzz" > "aaa"`

#### Comparison operations between lists
Two lists are equal if they contain the same sequence of items. For
example `[1,2,3] == [1,2,3]` is true, but `[1,2,3] == [1,2]` is false.

A list `l1` is less than a list `l2` if `l1` precedes `l2` lexicographically.
For example, the following expressions return true:

* `[1,2,3] < [4,5,6]`
* `[1,2,3] < [1,2,4]`
* `[1,3,4] > [1,2,4]`

#### Comparison operations between namespaces
Two namespaces are equal if they contain the same set of name-value pairs.
For example `{a=1,b=2} == {a=1,b=2}` is true, but `{a=1,b=2} == {a=1,b=4,c=5}`
is false.

No order is defined for the namespace type, therefore only the `==` and `!=`
operators will work between namespaces.

#### Comparison operations between functions
Two functions are equal if they are the same function. For example, given two
functions `f1:x->2*x` and `f2:x->2*x`, the expression `f1 == f1` is true, but
the expression `f1 == f2` is false.

No order is defined for the function type, therefore only the `==` and `!=`
operators will work between functions.

#### Comparison operations between tuples
Two tuples are equal if they contain the same sequence of items. For
example `(1,2,3) == (1,2,3)` is true, but `(1,2,3) == (1,2)` is false.

A tuple `t1` is less than a tuple `t2` if `t1` precedes `t2` lexicographically.
For example, the following expressions return true:

* `(1,2,3) < (4,5,6)`
* `(1,2,3) < (1,2,4)`
* `(1,3,4) > (1,2,4)`

If the two tuples have different number of items, the missing items are assumed
to be `()`. The empty tuple is less than any other type of value and equal only 
to itself.


## Conditional and alternative expression
A conditional expression `C ? V` resolves to the empty tuple `()` if `C` is a 
*false-like* value; otherwise it resolves `V`.

A false-like value is one of `()`, `FALSE`, `0`, `""`, `[]`, `{}` or a tuple 
made only of false-like items.

For example:

* `2 > 1 ? "ok"` resoves to `"ok"`
* `2 < 1 ? "ok"` resoves to `()`
* `"abc" ? "ok"` resoves to `"ok"`
* `"" ? "ok"` resoves to `()`

An alternative expression `A ; B` resolves `A` if it is not an empty tuple;
otherwise it resolves `B`.

For example:

* `() ; 3` resolves `3`
* `10 ; 2` resolves `10`

When combined together, the conditional and the alternative expression work as
an if-else condition:

* `1==1 ? "eq" ; "ne"` resolves to `"eq"`
* `1==2 ? "eq" ; "ne"` resolves to `"ne"`


## Logic operators
The logic operators AND (`&`) and OR (`|`) generalize the logic AND/OR to any
value type. 

The AND operation `A & B` returns `A` if it is a false-like value, otherwise it
returns `B`.

The OR operation `A | B` returns `A` if it is a true-like value, otherwise it
returns `B`.


## Subcontexting operation
When you assign a value to a name with `name = value`, you are defining that 
name in the global namespace and you can access the associated value as `name` 
in another expression.

When you assign a value to a name between curly braces `{name1=10, name2=20}`,
you are defining names in a sub-namespace and you can access the associated 
values with an apply operation `{a=1}("a")`.

A subcontexting operation `ns . expression` executes the right-hand expression
in a sub-context obtained by extending the parent context with the names 
contained in the namespace `ns`.

For example, `{a=2,b=3}.(a+b)` will resolve to `5`.

The global names are still visible in the righ-hand expression, unless they are
overridden by local namespace names. For example:

```
x = 10,
y = 20,
ns = {x=100, z=300},
sum = ns.(x+y+z)
```

The `sum` name will map to the value `420`. In fact, in the right-hand expression
`x+y+z`, the names `x` and `z` will be found in `ns`, while the name `y` will
not be found in `ns` and will be taken from the global namespace.

The subcontexting can be also used as an alternative way to access names defined
inside a namespace. In the example above, the expression `ns.z` will indeed
resolve to the value of `z` inside the namespace `ns`.

When evaluating an expression in a namespace context, the context in which the
namespace was create gets temporary restored. For example:

```
x = 10,
ns = {y=20}.{z=30},
ns.x,   # 10
ns.y,   # 20
ns.z    # 30    
```


## Operators precedence

1. application , `.`
2. `^`
3. `*` , `/`, `%`
4. `+` , `-`
5. `==` , `!=` , `<` , `<=` , `>=` , `>`
6. `&` , `|`
7. `?`
8. `;`
9. `->`
10. `=`
11. `,`


## Builtin functions
The following functions are available out-of-the-box.

#### bool X
The `bool` function converts `X` to boolean with the followin criteria:
* `bool X` resolves to `TRUE` if `X` is a true-like value
* `bool X` resolves to `FALSE` if `X` is a false-like value

#### not X
The `not` function converts `X` to boolean with the followin criteria:
* `not X` resolves to `FALSE` if `X` is a true-like value
* `not X` resolves to `TRUE` if `X` is a false-like value

#### str X
The `str` function convers `X` to a string as follows:
* if `X` is an empty tuple, it resolves to an empty string `""`
* if `X` is `TRUE`, it resolves to `"TRUE"`
* if `X` is `FALSE`, it resolves to `"FALSE"`
* if `X` is a number, it stringifies the number (e.g. `str 1.23` resolves to `"1.23"`)
* if `X` is a string, it resolves to `X` itself
* if `X` is a list, it resolves to `"[n]"`, where `n` is the number of items in 
  the list
* if `X` is a namespace, it resolves to `"{n}"`, where `n` is the number of 
  names contained in the namespace
* if `X` is a namespace and `X.__str__` is a string, it returns the latter
* if `X` is a function, it resolves to `"&#2A0D;"`
* if `X` is a tuple `(x1,x2,x3,...)`, it resolves to `(str x1) + (str x2) + 
  (str x3) + ...`

#### map f
The `map` function takes a function `f` and returns a function `mf` defined as 
follows:

```
mf: (x1, x2, x3, ...) -> (f x1, f x2, f x3, ...)
```

This pseudo-syntax gives the idea of what `mf` does, but actually the correct 
definition of `mf` would be:

```
mf: (x,xs) -> xs ; (f(x), mf(xs))
```

and the definition of `map` would be:

```
map: f -> {mf = (x,xs) -> xs ; (f x, mf xs)}.mf
```

#### enum X
The `enum` function takes a value `X` and return its content as a tuple:

* If X is a string, it returns the tuple of its characters
* If X is a list, it return the tuple of its items
* If X is a namespace, it return the tuple of its names
* If X is of any other type, it returns X itself

#### size X
The `size` function taken a value `X` and returns:

* The number of characters if X is a string
* The number of items if X is a list
* The number of own names if X is a namespace


## Comments
Everything following a `#` symbol, up to the end of the line, is a comment and 
therefore ignored.

For example, the foloowing expression will just render to `2`.

```
# this is a coment
1+1 # this is another comment
# yet another comment
```