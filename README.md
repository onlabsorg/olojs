# olojs

`olojs` is a distributed content management framework. 

The unit of content is an `olojs document` written as an outline of `name: expression`
lines that the library parses as a hierarchy of nodes.

Documents are kept in stores, which are objects exposing a simple
asynchronous API: `read`, `write`, `delete`. Except for an in-memory store
(for testing purposes), olojs doesn't define any store, but it is relatively
simple to create one.

Stores can be mounted to a `hub`, which maps url hosts (e.g. http://my-store1,
ftp://my-store2) to stores and allows read-write access to all the stores with a
simple `read`, `write`, `delete`, url-based, asynchronous interface.

Any document bound to a hub can `import` another document from the same hub
and reuse its content.
