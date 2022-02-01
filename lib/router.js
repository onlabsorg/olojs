const pathlib = require('path');
const Store = require('./store');

const URI_SCHEME_RE = /^[a-zA-Z][a-zA-Z0-9+.-]*$/
const URI_RE        = /^([a-zA-Z][a-zA-Z0-9+.-]*):\/(.*)$/;




/**
 *  <!--<% __render__ = require 'markdown' %>-->
 *  
 *  Router
 *  ============================================================================
 *  This store is a container for other stores and routes the `read`, `list`,
 *  `write`, `delete` and `deleteAll` requests to the store best matching the 
 *  path.
 *  
 *  ```js
 *  routes = {
 *      "/path/to/store_1/": store_1,
 *      "/path/to/store_2/": store_2,
 *      ...
 *  };
 *  
 *  router = new Router(routes);
 *  ```
 *  
 *  Every time a `read`, `list`, `write`, `delete` or `deleteAll` method is
 *  called on a `path`, the router delegates to the corresponding method of
 *  the store matching the path. For example, with reference to the router 
 *  declaration above:
 *  
 *  - `router.read('/path/to/store_1/path/to/doc')` will result in a call to
 *    `store_1.read('/path/to/doc')`
 *  - `router.read('/path/to/store_2/path/to/doc')` will result in a call to
 *    `store_2.read('/path/to/doc')`
 *  
 *  If no match is found, it will behave as empty store, which is: `read` will
 *  return an empty string, `list` will return an empty array, `write`,
 *  `delete` and `deleteAll` will throw a `WriteOperationNotAllowed` error.
 *  
 *  The constructor will ignore the properties of the `routes` object which are 
 *  not valid stores, that is objects that do not have any of the methods 
 *  `read`, `list`, `write`, `delete`, `deleteAll`, `createContext`.
 *  The easiest way to create a valid store is by extending the 
 *  [Store](./store.md) class.
 *  
 *  URI-like paths `scheme:/path/to/doc` are treated as shortcuts to the
 *  path `/.protocolos/scheme/path/to/doc`.
 *  
 *  > Router inherits from the [Store](./store.md) class and overrides the 
 *  > methods described below.
 */
class Router extends Store {

    constructor (routes) {
        super();
        this._routes = {};
        for (let path in routes) {
            this.mount(path, routes[path]);
        }
    }


    /**
     *  router.read - async method
     *  ------------------------------------------------------------------------
     *  Retrieves an olo-document from the matching sub-store.
     *  
     *  ```js
     *  router = new Router({
     *      "/path/to/store_1/": store_1,
     *      "/path/to/store_2/": store_2,
     *      ...
     *  })
     *  
     *  source = await router.read("/path/to/store_i/sub/path/to/doc");
     *  ```
     *  
     *  - When requesting `/path/to/store_i/sub/path/to/doc`, it returns
     *    `await store_i.read('/sub/path/to/doc')`.
     *  - When no store is mounted on `/path/to/store_i/`, it returns an empty
     *    string
     */
    async read (path) {
        const [store, subPath] = this._match(path);
        return store ? await store.read(subPath) : await super.read(path);
    }


    /**
     *  router.list - async method
     *  ------------------------------------------------------------------------
     *  Returns the list of entry names under the passed path, considering all
     *  the mount points.
     *  
     *  ```js
     *  router = new Router({
     *      "/path/to/": store0,
     *      "/path/to/a/s1": store1,
     *      "/path/to/b/s2": store2,
     *      "/path/to/s3": store3
     *  });
     *  
     *  entries = await router.list("/path/to");
     *  ```
     *  In the given example, the array `entries` will contain `["a/", "b/",
     *  "s2"]`, plus all the items returned by `await store0.list("/")`.
     *  
     *  If no mounted store matches the given path, then an empty array is
     *  returned.
     */
    async list (path) {
        const dirPath = this.normalizePath(`${path}/`);
        const entries = [];
        for (let [store, subPath] of this._iterMatches(dirPath)) {
            mergeLists(entries, await store.list(subPath));
        }
        for (let [routePath, store] of this._iterRoutes()) {
            if (routePath !== dirPath && routePath.indexOf(dirPath) === 0) {
                const subPath = routePath.slice(dirPath.length);
                const entry = subPath.slice(0, subPath.indexOf('/')+1);
                pushIfMissing(entries, entry);
            }
        }
        return entries;
    }


    /**
     *  router.write - async method
     *  ------------------------------------------------------------------------
     *  Modifies an olo-document contained in the matching sub-store.
     *  
     *  ```js
     *  router = new Router({
     *      "/path/to/store_1/": store_1,
     *      "/path/to/store_2/": store_2,
     *      ...
     *  })
     *  
     *  await router.write("/path/to/store_i/sub/path/to/doc", source);
     *  ```
     *  
     *  - When `/path/to/store_i/sub/path/to/doc` is passed, it calls
     *    `await store_i.write('/sub/path/to/doc', source)`.
     *  - When no store is mounted on `/path/to/store_i`, it throws a
     *    `Router.WriteOperationNotAllowedError`.
     */
    async write (path, source) {
        const [store, subPath] = this._match(path);
        return store ? await store.write(subPath, source) : await super.write(path, source);
    }


    /**
     *  router.delete - async method
     *  ------------------------------------------------------------------------
     *  Deletes an olo-document contained in the matching sub-store.
     *  
     *  ```js
     *  router = new Router({
     *      "/path/to/store_1/": store_1,
     *      "/path/to/store_2/": store_2,
     *      ...
     *  })
     *  
     *  await router.delete("/path/to/store_i/sub/path/to/doc");
     *  ```
     *  
     *  - When `/path/to/store_i/sub/path/to/doc` is passed, it calls
     *    `await store_i.delete('/sub/path/to/doc')`.
     *  - When no store is mounted on `/path/to/store_i/`, it throws a
     *    `Router.WriteOperationNotAllowedError`.
     */
    async delete (path) {
        const [store, subPath] = this._match(path);
        return store ? await store.delete(subPath) : await super.delete(path);
    }


    /**
     *  router.deleteAll - async method
     *  ------------------------------------------------------------------------
     *  Deletes all the documents matching the given path.
     *  
     *  ```js
     *  router = new Router({
     *      "/path/to/store_1/": store_1,
     *      "/path/to/store_2/": store_2,
     *      ...
     *  })
     *  
     *  await router.deleteAll("/path/to/store_i/sub/path/to/doc");
     *  ```
     *  
     *  - When `/path/to/store_i/sub/path/to/doc` is passed, it calls
     *    `await store_i.deleteAll('/sub/path/to/doc')`.
     *  - When no store is mounted on `/path/to/store_i/`, it throws a
     *    `Router.WriteOperationNotAllowedError`.
     */
    async deleteAll (path) {
        const [store, subPath] = this._match(path);
        return store ? await store.deleteAll(subPath) : await super.deleteAll(path);
    }
    
    
    /**
     *  router.createContext - method
     *  ------------------------------------------------------------------------
     *  Return the matching sub-store context bound to the current router.
     *  
     *  ```js
     *  router = new Router({
     *      "/path/to/store_1/": store_1,
     *      "/path/to/store_2/": store_2,
     *      ...
     *  })
     *  
     *  await router.createContext("/path/to/store_i/sub/path/to/doc");
     *  ```
     *  
     *  - When `/path/to/store_i/sub/path/to/doc` is passed, it calls
     *    `await store_i.createContext('/path/to/store_i/sub/path/to/doc')`.
     *  - When no store is mounted on `/path/to/store_i/`, it falls back to the 
     *    `Store` context.
     */
    createContext (path, presets={}) {
        const normPath = this.normalizePath(path);
        const store = this._match(normPath)[0];
        if (store) {
            const context = store.createContext(normPath, presets);
            context.$store = this;
            return context;
        } else {
            return super.createContext(normPath, presets);
        }
    }
    
    
    // INTERNALS
    
    normalizePath (path) {
        const uri = path.match(URI_RE);
        if (uri) {
            const uriScheme = uri[1];
            const uriPath = uri[2];
            return super.normalizePath(`/.schemes/${uriScheme}/${uriPath}`);
        } else {
            return super.normalizePath(path);            
        }
    }

    // Finds the route that best matches the given document path and returns
    // the corresponding store and the path relative to the matching route
    _match (path) {
        const normPath = this.normalizePath(path);
        const matches = this._iterMatches(normPath);
        return matches.next().value || [null, normPath];
    }

    *_iterMatches (normPath) {
        for (let [routeId, store] of this._iterRoutes()) {
            if (normPath.indexOf(routeId) === 0) {
                const subPath = normPath.slice(routeId.length-1);
                yield [store, subPath];
            }
        }
    }
    
    *_iterRoutes () {
        const routeIds = Object.keys(this._routes).sort().reverse();
        for (let routeId of routeIds) {
            yield [routeId, this._routes[routeId]];
        }
    }
    
    mount (path, store) {
        path = this.normalizePath(path);
        if (isStore(store)) {
            this._routes[ this.normalizePath(`${path}/`) ] = store;
        }
    }

    unmount (path) {
        path = this.normalizePath(path);
        delete this._routes[ this.normalizePath(`${path}/`) ];
    }
}

module.exports = Router;



// -----------------------------------------------------------------------------
//  SERVICE FUNCTIONS
// -----------------------------------------------------------------------------

const isStore = obj => {
    if (typeof obj.read !== "function") return false;
    if (typeof obj.list !== "function") return false;
    if (typeof obj.write !== "function") return false;
    if (typeof obj.delete !== "function") return false;
    if (typeof obj.deleteAll !== "function") return false;
    return true;
};

const renameKeys = (ren, obj) => {
    const newObj = {};
    for (let key in obj) newObj[ren(key)] = obj[key];
    return newObj;
}

const sortObject = obj => {
    const keys = Object.keys(obj).sort().reverse();
    const map = new Map();
    for (let key of keys) map.set(key, obj[key]);
    return map;
}

const filterObject = (test, obj) => {
    const newObj = {};
    for (let key in obj) if (test(obj[key])) newObj[key] = obj[key];
    return newObj;
}

const pushIfMissing = (list, item) => {
    if (list.indexOf(item) === -1) list.push(item);
}

const mergeLists = (list1, list2) => {
    for (let item of list2) pushIfMissing(list1, item);
}
