
const pathlib = require('path');
const EmptyStore = require('./empty');

/**
 *  RouterStore
 *  ============================================================================
 *  This store is a container for other stores and routes the `get`, `set` and
 *  delete requests to the store matching the path.
 *
 *  ```js
 *  router = new RouterStore({name1:store1, name2:store2, ...})
 *  ```
 *  
 *  - Each `name_i:store_i` parameter is a mount point. All the `get`, `set` and
 *    delete calls to paths like `/name_i/path/to/doc` will be rerouted to
 *    `store_i` after reducing the path to `/path/to/doc`.
 *  - `router` is an object that exposes the standard olojs store API: `get`,
 *    `set` and `delete`.
 */

class RouterStore extends EmptyStore {
    
    constructor (routes) {
        super();
        this._routes = new Map();
        if (isObject(routes)) {
            for (let name in routes) {
                this.mount(name, routes[name]);
            }
        }
    }
    
    mount (name, store) {
        if (!isValidName(name)) throw new Error(`Invalid route name: ${name}`);
        if (!isStore(store)) throw new Error(`Invalid store`);
        this._routes.set(name, store);
    }
    
    unmount (name) {
        this._routes.delete(name);
    }
    

    /**
     *  router.get - async method
     *  ----------------------------------------------------------------------------
     *  Retrieves an olo-document from the matching sub-store.
     *
     *  ```js
     *  const source = await router.get("/name_i/path/to/doc");
     *  ```
     *  
     *  - When requesting `/store_i/path/to/doc`, the request will be forwarded
     *    to the store mounted on `/store_i`, with path `/path/to/doc`
     *  - When no store is mounted on `/store_i`, it returns an empty string
     *  - When requesting `/`, it returns a document whose namespace contains a 
     *    `children` list of the mounted store names, followed by a `/`.
     */
    async get (path) {
        if (isRootPath(path)) {
            let children = Array.from(this._routes.keys()).map(name => `${name}/`);
            return this.constructor.createIndexDocument(children);
        }
        const store = this._routes.get(routeName(path));
        if (store) {
            return await store.get(routeSubPath(path));
        } else {
            return super.get(routeSubPath(path));
        }
    }
    

    /**
     *  router.set - async method
     *  ----------------------------------------------------------------------------
     *  Modifies an olo-document contained in the matching sub-store.
     *
     *  ```js
     *  await router.set("/name_i/path/to/doc", source);
     *  ```
     *  
     *  - When passing `/store_i/path/to/doc`, the request will be forwarded
     *    to the store mounted on `/store_i`, with path `/path/to/doc`
     *  - When no store is mounted on `/store_i`, it throws an `OperationNotAllowed`
     *    error.
     *  - When path is the root path `/`, it throws an `OperationNotAllowed`
     *    error.
     */
    async set (path, source) {
        const store = this._routes.get(routeName(path));
        if (store) {
            return await store.set(routeSubPath(path), source);
        } else {
            return super.set(path, source);
        }
    }


    /**
     *  router.delete - async method
     *  ----------------------------------------------------------------------------
     *  Deletes an olo-document contained in the matching sub-store.
     *
     *  ```js
     *  await router.delete("/name_i/path/to/doc");
     *  ```
     *  
     *  - When passing `/store_i/path/to/doc`, the request will be forwarded
     *    to the store mounted on `/store_i`, with path `/path/to/doc`
     *  - When no store is mounted on `/store_i`, it throws an `OperationNotAllowed`
     *    error.
     *  - When path is the root path `/`, it throws an `OperationNotAllowed`
     *    error.
     */
    async delete (path, source) {
        const store = this._routes.get(routeName(path));
        if (store) {
            return await store.delete(routeSubPath(path));
        } else {
            return super.delete(path);
        }
    }    
}


module.exports = RouterStore;



// -----------------------------------------------------------------------------
//  SERVICE FUNCTIONS
// -----------------------------------------------------------------------------

const isStore = obj => obj instanceof EmptyStore;
const isValidName = name => name.indexOf('/') === -1;
const isObject = o => o && typeof o === 'object' && !Array.isArray(o); 
const normPath = path => pathlib.normalize(`/${path}`).slice(1);
const routeName = path => normPath(path).split('/')[0];
const routeSubPath = path => normPath(path).slice(routeName(path).length+1);
const isRootPath = path => normPath(path) === '';
