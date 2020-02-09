# Environment configuration object

The configuration object is the input parameter of the `Environment` class
constructor.

```js
const env = new Environment(config);
```

When you render a document via the CLI (`olojs render /path/to/doc`), the CLI
executes the `olojs-config.js` script in the current working directory and 
passes its `exports` object (which must be a config object) to the `Environment`
class constructor.

The config object should contain the following properties:

```js
{
    stores: {
        "/root/path1": store1,
        "/root_path2": store2,
        "/rp3": store3,
        ...
    }
}
```

The `store` can be any object with a `read` method (synchronous or asynchronous) 
that maps a path to an olo-document source text. If `store` is a function instead,
that function will be used as `read` method. The read `method` can alternatively
return also a `Document` object directly instead of a document source.

Say you created an evironment `env` based on the above config object, then

* `env.load("/root/path1/path/to/docA")` will result in calling `store1.read("/path/to/docA")`
  and using the returned string as document source (or the returned Document instance
  as document)
* `env.load("/root_path2/path/to/docB")` will result in calling `store2.read("/path/to/docB")`
  and using the returned string as document source (or the returned Document instance
  as document) 
* `env.load("/rp3/path/to/docC")` will result in calling `store3.read("/path/to/docC")`
  and using the returned string as document source (or the returned Document instance
  as document)
* ...

This way, an environment can be configured to retrieve documents form virtually 
any source.

When you initialize a local environment with `olojs init`, the following default
config file is created:

```js
exports.stores = {};

const FSStore = require(__olojspath + "/lib/stores/fs-store");
exports.stores["/"] = new FSStore(__dirname);

const HTTPStore = require(__olojspath + "/lib/stores/http-store");
exports.stores["http://"] = new HTTPStore("http:/");
exports.stores["https://"] = new HTTPStore("https:/");

const stdlibStore = require(__olojspath + "/lib/stores/stdlib-store");
exports.stores["/bin"] = stdlibStore;
```

The FSStore reads files from the local disk. 
The HTTPStore fetches files via a HTTP GET request from the web.
The stdlibStore.read method loads a javascript module from the standard library
and returns it wrapped in a Document instance.  
