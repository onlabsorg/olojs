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
    loaders: {
        "/root/path1": loader1,
        "/root_path2": loader2,
        "/rp3": loader2,
        ...
    }
}
```

Say you created an evironment `env` based on the above config object, then

* `env.load("/root/path1/path/to/docA")` will result in calling `loader1("/path/to/docA")`
  and using the returned string as document source
* `env.load("/root_path2/path/to/docB")` will result in calling `loader2("/path/to/docB")`
  and using the returned string as document source  
* `env.load("/rp3/path/to/docC")` will result in calling `loader3("/path/to/docC")`
  and using the returned string as document source  
* ...

The `loaders` can be any function (synchronous or asynchronous) that maps a path
to an olo-document source text. This means that an environment can be configured
to retrieve documents form virtually any source.

When you initialize a local environment with `olojs init`, the following default
config file is created:

```js
exports.loaders = {};

const FileLoader = require(__olojspath + "/lib/loaders/file-loader");
exports.loaders["/"] = FileLoader(__dirname);
```

The FileLoader loader reads files from the local disk. This means that the 
default environment just loads files from within the root environment folder.
