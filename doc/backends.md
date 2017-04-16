# olojs backends

A `Backend` object implements the [AbstractBackend][] interface and represents
a backend JSON store.  

`olojs` has three different backend implementations (described below):
* `OlodbBackend`
* `MemoryBackend`
* `LocalBackend`

Other backends can be created by extending the [AbstractBackend][] class.


## OlodbBackend
`OlodbBackend` connects to an [olodb][] server.  
  
olodb is built on top of [ShareDB][] which implements [Operational Transformation](https://en.wikipedia.org/wiki/Operational_transformation).  
  

## MemoryBackend
`MemoryBackend` is an in-memory store. It doesn't allow concurrency but it is
observable and can notify changes.  

It can be used for testing or just as an observable store.  

Access control can be implemented by defining the method `memoryBackend.getUserRights(collection, docId)`,
which, based on the `collection` name and on the `docId` returns one of the following
values:  
* `0` for no rights
* `1` for read-only rights
* `3` for read-write rights

## LocalBackend
`LocalBackend` is a persistent `MemoryBackend`. The persistency is obtainded
by synchronizing the backend data with the [localStorage](https://developer.mozilla.org/it/docs/Web/API/Window/localStorage).
 




[AbstractBackend]: ./AbstractBackend.md
[ShareDB]: https://github.com/share/sharedb
[olodb]: https://github.com/onlabsorg/olodb
