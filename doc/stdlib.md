# olojs standard library

The standard library contains javascript modules that can be imported in the
olodocument scope using the `import` function.


## /bin/markdown

It returns a function that takes a markdown markup and renders it to HTML. It
is typically used as post-render function as follows:

```
<% __render__ = import "/bin/markdown" %>
```


## /bin/html

It returns a callable namespace that helps defining HTML markup. Example:

```
<% html = import "/bin/html" %>
<% html("a", {href="http://www.google.com"}, "Google") %>
```

The html call in the previous example will return:

```
<a href="http://www.google.com">Goodle</a>
```
