const Store = require('./store');

/**
 *  HyperStore
 *  ============================================================================
 *  This is a store container which maps URI schemes to stores. The `read`,
 *  `write` and `delete` method delegate to the `read`, `write` and `delete`
 *  methods of the store mapped to the URI scheme.
 *
 *  ```js
 *  hyperStore = new HyperStore({
 *      aaa: store1,
 *      bbb: store2
 *  })
 *  ```
 *
 *  The example store above will behave as follows:
 *
 *  * `hyperStore.read("aaa://path/to/doc")` will return `store1.read("/path/to/doc")`
 *  * `hyperStore.read("bbb://path/to/doc")` will return `store2.read("/path/to/doc")`
 *  * `hyperStore.write("aaa://path/to/doc", source)` will call `store1.write("/path/to/doc", source)`
 *  * `hyperStore.write("bbb://path/to/doc", source)` will call `store2.write("/path/to/doc", source)`
 *  * `hyperStore.delete("aaa://path/to/doc")` will call `store1.delete("/path/to/doc")`
 *  * `hyperStore.delete("bbb://path/to/doc")` will call `store2.delete("/path/to/doc")`
 *
 *  URI's without a scheme (simple paths) will take by default the `home` scheme;
 *  for example, the URI '/path/to/doc' normalizes to `home://path/to/doc`. Therefore
 *  it is convenient to pass a `home` store to the HyperStore constructor.
 *
 *  > HyperStore inherits from the [Store](./store.md) class and overrides the
 *  > methods described below.
 */
class HyperStore extends Store {

    constructor (schemes) {
        super();
        this._stores = {};
        for (let scheme in schemes) {
            const store = schemes[scheme]
            if (isValidScheme(scheme) && isStore(store)) {
                this._stores[scheme.toLowerCase()] = store;
            }
        }
    }


    /**
     *  async hyperStore.read: String uri -> String source
     *  ------------------------------------------------------------------------
     *  Retrieves an olo-document from the sub-store mapped to the scheme of
     *  the passed URI.
     *
     *  If the passed URI doesn't match any registered scheme, the `read` method
     *  returns an empy string.
     */
    async read (uri) {
        const {scheme, path} = parseURI(uri, 'home');
        const store = this._stores[scheme];
        return store ? await store.read(path) : "";
    }


    /**
     *  async hyperStore.write: (String uri, String source) -> undefined
     *  ------------------------------------------------------------------------
     *  Writes an olo-document to the sub-store mapped to the scheme of
     *  the passed URI.
     *
     *  If the passed URI doesn't match any registered scheme, the `write` method
     *  throws a `Store.WriteOperationNotAllowedError`.
     */
    async write (uri, source) {
        const {scheme, path} = parseURI(uri, 'home');
        const store = this._stores[scheme];
        if (store) {
            await store.write(path, source);
        } else {
            throw new Store.WriteOperationNotAllowedError(this.normalizePath(uri));
        }
    }


    /**
     *  async hyperStore.delete: String uri -> undefined
     *  ------------------------------------------------------------------------
     *  Removes an olo-document from the sub-store mapped to the scheme of
     *  the passed URI.
     *
     *  If the passed URI doesn't match any registered scheme, the `delete` method
     *  throws a `Store.WriteOperationNotAllowedError`.
     */
    async delete (uri) {
        const {scheme, path} = parseURI(uri, 'home');
        const store = this._stores[scheme];
        if (store) {
            await store.delete(path);
        } else {
            throw new Store.WriteOperationNotAllowedError(this.normalizePath(uri));
        }
    }


    /**
     *  hyperStore.normalizePath: String -> String
     *  ------------------------------------------------------------------------
     *  This method takes an URI string as argument and returns its normalized
     *  version, by:
     *
     *  - resolving '.', '..' and '//' and by adding a leading '/' to the path
     *  - lower-casing the scheme
     *  - adding the 'home:' scheme if no scheme is provided
     */
    normalizePath (uri) {
        const {scheme, path} = parseURI(uri, 'home');
        return `${scheme}:/${super.normalizePath(path)}`;
    }


    /**
     *  hyperStore.resolvePath: (String baseURI, String subPath) -> String absURI
     *  ------------------------------------------------------------------------
     *  This method takes a base-uri string and a sub-path string as arguments
     *  and returns a normalized absolute uri string, obtained considering
     *  the sub-path as relative to the base-uri-path.
     *
     *  If sub-path is an absolute path (starting by '/'), it replaces the
     *  base URI path.
     *
     *  If sub-path is an URI, it will return its normalized version.
     */
    resolvePath (baseURI, subPath) {
        if (isValidURI(subPath)) {
            return this.normalizePath(subPath);
        } else {
            const base = parseURI(baseURI, 'home');
            return `${base.scheme}:/${(new Store()).resolvePath(base.path, subPath)}`;
        }
    }
}

module.exports = HyperStore;



// -----------------------------------------------------------------------------
//  SERVICE FUNCTIONS
// -----------------------------------------------------------------------------

const isStore = obj => {
    if (typeof obj !== "object") return false;
    if (typeof obj.read !== "function") return false;
    return true;
};

const isValidScheme = scheme => /^[a-zA-Z][a-zA-Z0-9+-.]*$/.test(scheme);

const isValidURI = uri => /^[a-zA-Z][a-zA-Z0-9+-.]*:\/.*$/.test(uri);

const parseURI = (uri, defaultScheme) => {
    const uriMatch = uri.match(/^([a-zA-Z][a-zA-Z0-9+-.]*):\/(.*)$/);
    return {
        scheme: uriMatch ? uriMatch[1].toLowerCase() : defaultScheme,
        path  : uriMatch ? uriMatch[2] : uri
    }
}

