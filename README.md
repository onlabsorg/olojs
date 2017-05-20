# olojs

olojs is a javascript library that allows concurrent editing of JSON objects.

* It is designed to be extensible and work with different types of backends
  (although only three backends are currently implemented)
* It implements access control
* It works only in the browser, but NodeJS support first and Python support later are on the roadmap
* It is in alpha stage, therefore it may be buggy and the API may change


## Getting started in 6 steps


### 1. Install the library
```
jspm install olojs=github:onlabsorg/olojs
```
Requirements:
* [jspm][] for package management
* A browser supporting ES6 and [Proxy objects][Proxy]

### 2. Connect to a backend
```javascript
const Store = require("olojs/OlodbStore");
const store = new Store("wss://localhost:8010");

await store.connect(credentials);
```

[olodb][] is not the only possible backend: other two types of backend are
currently implemented and custom backends can be also created by implementing
the [Store][] interface.

The `store` object represents a connection to an [olodb][] backend and allows you to
concurrently modify the remote data as explained below.

The `credentials` object identifies the user for access control: its content is
defined by the backend implementation.


### 3. Fetch a document
```javascript
var doc = store.getDocument(docId);
await doc.open();
```

> For an olodb store, the docId must be a string in the from `collection.name`.

The user can have one of the following roles:

| Role         | meta data  |    body    |
|--------------|:----------:|:----------:|
| roles.OWNER  |     rw     |     rw     |
| roles.WRITER |     ro     |     rw     |
| roles.READER |     ro     |     ro     |
| roles.NONE   |     -      |     -      |

> All the top-level keys of a document are meta-data, with the exception of
> the `root` key that contains the document body.


### 4. Read/Edit the document content
```javascript

// retrieve and change the document root dictionary
var root = doc.get();
root.value = {a:1, b:2, c:['x','y','z'], d={u:10, v:20, w:30}, s:"abcdef"};

// retrieve and edit a primitive item
var item = root.get('a');
item.value              // -> 1
item.type === "numb"    // true

// retrieve and edit a Dict item
var dict = root.get('d');
dict.value              // -> {u:10, v:20, w:30}
dict.type === "dict";   // true
dict.set('v', 21);      // change value of item d/v
dict.remove('v');       // remove the key 'v' from the dictionary

// retrieve and edit a List item
var list = root.get('c');
list.value              // -> ['x','y','z']
list.type === "list";   // true
list.size === 3;        // true
list.set(1, 'yy');      // change the value of item c/1
list.insert(1, 'xy')    // c is now equal to ['x', 'xy', 'yy', z]
list.remove(2);         // c is now equal to ['x', 'xy', z]

// retrieve and edit a Text item
var text = root.get('s');
text.value              // -> "abcdef"
text.size === 6         // true
text.insert(1, "xxx");  // s is now equal to "axxxbcdef";
text.remove(1, 3);      // s is now equal to "abcdef"

// retrieve deep items
var u = doc.get().get('d').get('u');
var u = doc.get().get('d/u');
var u = doc.get('d/u');
```

The `.get` method returns a pointer to the document path (a [Proxy][] object).
Depending on the value of the target value, the pointer can appear as one of the following
data types: [Item][], [Text][], [Dict][] or [List][].

Every change made to the local copy of the document gets synchronized with
the remote database and with all the other users in real time.


### 5. Subscribe to changes
```javascript
var subscription = doc.get('d').subscribe( (change) => {...} );
// ...
subscription.cancel();
```

Every time the document item `d` changes, the callback gets called with
a [Change][] object as parameter.  

Both changes made locally by you and remotely by other users are notified.


### 6. Close
```javascript
await doc.close();
await store.disconnect();
```

## Store implementations

* [OlodbStore](./doc/OlodbStore) : ShareDB store
* [MemoryStore](./doc/MemoryStore) : In-memory store
* [LocalStore](./doc/MemoryStore) : LocalStorage Store

## API

* [Store][] object: represents a data store
* [Document][] object: represents one of the documents in the data store
* [Item][] object: represents an item of a document
* [Dict][] object: a particular `Item` object representing a key-value mapping
* [List][] object: a particular `Item` object representing an array of items
* [Text][] object: a particular `Item` object representing a string
* [Change][] object: represents a change occurred in a document


## Related projects

You may also be interested in the following projects:

* [ShareDB][]: A database frontend for concurrent editing systems on which the OlodbBackend is based
* [olodb][]: A NodeJS server to be coupled with olojs' OlodbStore (it is based on [ShareDB][]).
* [olowc][]: Collection of web-components acting as web interface to the remote data structures provided by olojs.
* [olopy][]: A Python implementation of olojs.
* [olowa][]: A web application leveraging olojs, [olowc][] and [olodb][] to create a
  concurrent data browser and editor for the web.


## License
MIT - Copyright (c) 2017 Marcello Del Buono (m.delbuono@onlabs.org)


[olowa]: https://github.com/onlabsorg/olowa
[olodb]: https://github.com/onlabsorg/olodb
[jspm]: http://jspm.io/
[Proxy]: https://developer.mozilla.org/it/docs/Web/JavaScript/Reference/Global_Objects/Proxy
[Store]: ./doc/Store.md#store-class
[Document]: ./doc/Store.md#document-class
[Item]: ./doc/Store.md#item-class
[Text]: ./doc/Store.md#text-class
[Dict]: ./doc/Store.md#dict-class
[List]: ./doc/Store.md#list-class
[Change]: ./doc/Store.md#change-class
[Subscription]: ./doc/Store.md#subscription-class
[Path]: ./doc/Path.md
[ShareDB]: https://github.com/share/sharedb
[olowc]: https://github.com/onlabsorg/olowc
[olopy]: https://github.com/onlabsorg/olopy
