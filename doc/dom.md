# olojs.dom module
The `olojs.dom` module implements a Document Object Model for `olo` documents.
- License: MIT
- Author: Marcello Del Buono <m.delbuono@onlabs.org>
  
## dom.Node - class
A node is a tree item with a name, a value and a list of subordinate nodes.
If the node N1 contains the node N2 as subordinate, then N1 is called the
parent node of N2 and N2 is called a child node of N1.
A child can be identified by a node identifier `n` in the form of a number, 
a node name or a Node instance:
- If `n` is a positive number, it refers to the child with index `n` (1 is
  the first child)
- If `n` is a negative number, it refers to the `n-th` child counting from
  the end of the list (-1 is the last child).
- If `n` is a string, it refers to the first child having that name
- If `n` is a Node isntance, it refers to the child `n`
  
### dom.Node.constructor(name, value, childNodes)
Parameters:
- `name`: the name of the node
- `value`: the value of the node
- `childNodes`: an array of `dom.Node` instances or a `dom.NodeList` instance
  which define the children of `node`
Errors:
- `dom.ValueError` if `name` is not a valid name (see dom.Node.prototype.name)
- `dom.TypeError` if any of the passed child nodes is not a `dom.Node` instance
- `dom.ValueError` if any of the passed child nodes is already attached 
  to another `dom.NodeList` instance
  
### dom.Node.prototype.children - getter and setter
When referenced, it returns the `dom.NodeList` containing the node's
children.
When assigned a `dom.NodeList` instance, it replaces the current child
list with the assigned one.
It raises `dom.TypeError` if trying to assign other than a `dom.NodeList`
instance.
It raises `dom.ValueError` if trying to assign a `dom.NodeList` instance
which already belongs to another node.
  
### dom.Node.prototype.index - getter
It returns the position of the node in its parent `dom.NodeList` list or
0 if the child is not contained in any `dom.NodeList` instance.
  
### dom.Node.prototype.name - getter and setter
When referenced, it returns the name of the node.
When assigned a string, it changes the name of the node.
It raises a `dom.ValueError` if trying to assign a non-valid name.
A valid name is any sequence of letters (A..Z, a..z), numbers (0..9) or
underscores (_), starting with a letter or an underscore.
  
### dom.Node.prototype.value - getter and setter
When referenced, it returns the value of the node.
When assigned a string, it changes the value of the node after
escaping eventual new-line characters.
  
### dom.Node.prototype.parent - getter
When referenced, it returns the parent node of this node, or `null` if
this node has no parent.
This property is read-only.
  
### dom.Node.prototype.toString(includeChildren) - method
It returns the node and its descendants as a hirarchical outline of
`name: value` pairs.
If the parameter `includeChildren` is false, it returns only this
node `name: value` string. Default to `true`.
  
## dom.NodeList - class
This class represents a list of `dom.Node` instances and contains methods
for query and modify the list.
A list node can be identified by a node identifier `n` in the form of a number, 
a node name or a Node instance:
- If `n` is a positive number, it refers to the node with index `n` (1 is
  the first child)
- If `n` is a negative number, it refers to the `n-th` node counting from
  the end of the list (-1 is the last node).
- If `n` is a string, it refers to the first node having that name
- If `n` is a Node isntance, it refers to the node `n` 
  
### dom.NodeList.constructor(nodes)
Creates a new `dom.NodeList` instance having the items in the `nodes`
iterable as child nodes.
Errors:
- `dom.TypeError` if any of the passed nodes is not a `dom.Node` instance
- `dom.ValueError` if any of the passed nodes is already attached 
  to another `dom.NodeList` instance     
  
### dom.NodeList.prototype.size - getter
It returns the number of nodes contained in this list.
  
### dom.NodeList.prototype.get(n) - method
It returns the child node matching the node identifier `n` or null in
case of no match.
  
### dom.NodeList.prototype.append(node) - method
Adds the passed `node` to the end of the list.
Errors:
- `dom.TypeError` if `node` is not a `dom.Node` instance
- `dom.ValueError` if `node` is already member of another `dom.NodeList`
  instance
  
### dom.NodeList.prototype.insert(node, n) - method
Adds the passed `node` before the child node matching the node 
identifier `n`.
If no child node matches `n`, the method fails silently.
Errors:
- `dom.TypeError` if `node` is not a `dom.Node` instance
- `dom.ValueError` if `node` is already member of another `dom.NodeList`
  instance
  
### dom.NodeList.prototype.remove(n) - method
Removes the child node matching the node identifier `n` from this list.
It returns the removed node or `null` if `n` doesn't match any child
node.
  
### dom.NodeList.prototype.toString(includeSpaces, includeIndent) - method

It returns the node list serialize as a hierarchy of `name: value` lines.
If `includeSpaces` is `true`, it adds the original leading empty lines (in
case the list was generate by `dom.NodeList.parse`). Default to `false`.
If `includeIndent` is `true` it adds indentation to the list. Default to
`false`.
  
### dom.NodeList.parse(source) function
Given a source text containing an outline of `name: value` items, 
it returns a `dom.NodeList` instance having the descendants hierarchy 
outlined in the source.
  
## dom.Document - class
This is a parent-less `dom.Node` whose children are obtained by parsing
a hierarchy of `name: expression` lines.
  
### dom.Document.constructor(source, scope)
Initializes a parent-less `dom.Node` as follows:
- `name` is set to "root"
- `value` ise set to ""
- the children are initialized by parsing the given source
The scope parameter is attached as `this.scope` and will be used as
scope of the expressions evaluated by the `.evaluate` method.
The passed scope is extended with `scope.root` object with is the
`dom.NodeProy` wrapping this document.
  
### dom.Document.prototype.evaluate(expression) - async method
Return the value of passed expression evaluated in `this.scope` using 
`olojs.expression` as expression engine.
  
## dom.NodeProxy class
The `NodeProxy` class wraps the `dom.Node` to provide a read-only API
for expressions evaluated with the `dom.expression` engine.
It is not supposed to be instantiated directly: its instance will be found 
as `root` and `self` in the document expression scopes.
  
### dom.NodeProxy.prototype.name - getter
Returns the target `dom.Node` name.
  
### dom.NodeProxy.prototype.index - getter
Returns the target `dom.Node` index.
  
### dom.NodeProxy.prototype.__get__(n) - async method
Retrieves the child node identified by `n` and returns the value of the
node evaluated as an expression with the `dom.expression` engine.
The child node expression is evaluated in the parent node scope, extended
with a `self` object, being the `dom.NodeProxy` of the child node itself.
Before evaluating the child node, the expression sc
The `self` object can be referenced in a node expression to access
informations such as

- `self.name`: the node name
- `self.index`: the node index
- `self[n]`: the value of the child identified by `n` (this is actually
   when the method `__get__` gets called by the `dom.expression` engine).
- `size(self)`: the number of children of the target node
- `Text(self)`: the child source of the node
- `Template(self)`: the child source evaluated as template
- `Markdown(self)`: the child source evaluated as markdown
- `Markdown(Template(self))`: first evaluated as template, then as markdown
If the target node `.value` property is empty, the node expression
defaults to "self".
  
### dom.NodeProxy.property.__dot__(n) - async method
This method is an alias for `dom.NodeProxy.property.__get__`.
The `__dot__` method gets called by the `dom.expression` engine to
resolve an attribute reference (e.g. "self.x", "self.pi", etc.).
The behaviour of the `dom.expression` engine is such that `__dot__` will
be called only if there are no actual attributes named `n`. 
You can think at `self.child` as a shortcut for `self["child"]`,
exposing child nodes as (virtual) attributes. The actual attributes
(namely `index` and `name`) will eventually override virtual attributes
name "index" and "name".
  
### dom.NodeProxy.property.__size__(n) - async method
Allows the expression "size(self)" to return the number of children of
the target node.
  
### dom.NodeProxy.property.__text__(n) - async method
Allows the expression "Text(self)" to return the source of the child
list (whathever text you indent under the node in the source document).
  
