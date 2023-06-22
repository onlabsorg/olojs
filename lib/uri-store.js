const Store = require('./store');

/**
 *  URIStore
 *  ============================================================================
 *  This store is a store container which maps URI schemes to stores. The `read`
 *  method maps URIs to document source by delegating to the proper store `read`
 *  method.
 *
 *  ```js
 *  uriStore = new URIStore({
 *      aaa: store1,
 *      bbb: store2
 *  })
 *  ```
 *
 *  The example store above will behave as follows:
 *
 *  * `uriStore.read("aaa://path/to/doc")` will return `store1.read("/path/to/doc")`
 *  * `uriStore.read("bbb://path/to/doc")` will return `store2.read("/path/to/doc")`
 *
 *  URI's without a scheme (simple paths) will take by default the `home` scheme;
 *  for example, the URI '/path/to/doc' normalizes to `home://path/to/doc`. Therefore
 *  it is convenient to pass a `home` store to the URIStore constructor.
 *
 *  > URIStore inherits from the [Store](./store.md) class and overrides the
 *  > methods described below.
 */
class URIStore extends Store {

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
     *  async uriStore.read: String uri -> String source
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
     *  uriStore.normalizePath: String -> String
     *  ------------------------------------------------------------------------
     *  This method takes an uri string as argument and returns its normalized
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
     *  uriStore.resolvePath: (String baseURI, String subPath) -> String absURI
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

module.exports = URIStore;



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

