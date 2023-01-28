const Store = require('./store');


/**
 *  Router
 *  ============================================================================
 *  This store is a container for other stores and routes the `read`, `list`, 
 *  `write` and `delete` requests to the store best matching the path.
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
 *  Every time a `read`, `list`, `write` or `delete` method is called on a 
 *  `path`, the router delegates to the corresponding method of the store 
 *  matching the path. For example, with reference to the router declaration 
 *  above:
 *
 *  - `router.read('/path/to/store_1/path/to/doc')` will result in a call to
 *    `store_1.read('/path/to/doc')`
 *  - `router.read('/path/to/store_2/path/to/doc')` will result in a call to
 *    `store_2.read('/path/to/doc')`
 *  
 *  If no match is found, it will behave as empty store, which is: `read` will
 *  return an empty string, `list` will return an empty array, `write` and 
 *  `delete` will throw a `WriteOperationNotAllowed` error.
 *  
 *  The constructor will ignore the properties of the `routes` object which are
 *  not valid stores (i.e. objects that do not have one or more of the methods
 *  `read`, `list`, `write` and `delete`).
 *  The easiest way to create a valid store is by extending the
 *  [Store](./store.md) class.
 *  
 *  > Router inherits from the [Store](./store.md) class and overrides the
 *  > methods described below.
 */
class Router extends Store {

    constructor (routes) {
        super();
        this._routes = {};
        for (let path in routes) {
            const store = routes[path]
            if (isStore(store)) {
                const normPath = this.normalizePath(`${path}/`);
                this._routes[ normPath ] = store;
            }
        }
    }


    /**
     *  async router.read: String path -> String source
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
     *
     *  If the parameter is an URI `ppp:/path/to/doc` it will resolve to the
     *  path `/.uri/ppp/path/to/doc`.
     */
    async read (path) {
        const [store, subPath] = this._match(path);
        return store ? await store.read(subPath) : await super.read(path);
    }


    /**
     *  async router.list: String path -> Array items
     *  ------------------------------------------------------------------------
     *  Retrieves a directory items list from the matching sub-store.
     *  
     *  ```js
     *  router = new Router({
     *      "/path/to/store_1/": store_1,
     *      "/path/to/store_2/": store_2,
     *      "/path/": store_3,
     *      ...
     *  })
     *
     *  items = await router.list("/path/to/");     
     *          // [ 'store_1/', 'store_2', ...store_3.list('/to/') ]
     *  ```
     *
     *  If the parameter is an URI `ppp:/path/to/doc` it will resolve to the
     *  path `/.uri/ppp/path/to/doc`.
     */
    async list (path) {
        const items = new Set();
        
        const normPath = this.normalizePath(`${path}/`);
        for (let [route, store] of this._iterRoutes()) {
            
            if (normPath.indexOf(route) === 0) {
                const subPath = normPath.slice(route.length-1);
                let storeItems = await store.list(subPath);
                for (let item of storeItems) items.add(item);
            }
            
            if (route.indexOf(normPath) === 0 && route.length > normPath.length) {
                let subPath = route.slice(normPath.length);
                let slashIndex = subPath.indexOf('/');
                let item = slashIndex === -1 ? subPath : subPath.slice(0, slashIndex+1);
                items.add(item);
            }
        }
        
        return [...items];
    }


    /**
     *  async router.write: (String path, String source) -> undefined
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
     *
     *  If the first parameter is an URI `ppp:/path/to/doc` it will resolve to the
     *  path `/.uri/ppp/path/to/doc`.
     */
    async write (path, source) {
        const [store, subPath] = this._match(path);
        return store ? await store.write(subPath, source) : await super.write(path, source);
    }


    /**
     *  async router.delete: String path -> undefined
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
     *
     *  If the parameter is an URI `ppp:/path/to/doc` it will resolve to the
     *  path `/.uri/ppp/path/to/doc`.
     */
    async delete (path) {
        const [store, subPath] = this._match(path);
        return store ? await store.delete(subPath) : await super.delete(path);
    }


    // A path starting with a uri scheme (e.g. 'http:/path/to/doc') gets
    // normalize to '/.uri/<scheme>/path/to/doc' (e.g. /.uri/http/path/to/doc)
    normalizePath (path) {
        const uriMatch = path.match(/^([a-zA-Z][a-zA-Z0-9+-.]*):\/(.*)$/);
        if (uriMatch) {
            path = `/.uri/${uriMatch[1].toLowerCase()}/${uriMatch[2]}`;
        }
        return super.normalizePath(path);
    }


    // INTERNALS

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
}

module.exports = Router;



// -----------------------------------------------------------------------------
//  SERVICE FUNCTIONS
// -----------------------------------------------------------------------------

const isStore = obj => {
    if (typeof obj !== "object") return false;
    if (typeof obj.read !== "function") return false;
    if (typeof obj.list !== "function") return false;
    if (typeof obj.write !== "function") return false;
    if (typeof obj.delete !== "function") return false;
    return true;
};
