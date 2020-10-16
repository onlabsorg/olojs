
const pathlib = require('path');
const document = require("./document");

const NullStore = require('./stores/null');
const MemoryStore = require('./stores/memory');



/**
 *  olojs.Environment
 *  ============================================================================
 *  Creates a new olojs environment, which represents a colection of
 *  interdependent documents.
 *  
 *  
 *  ```js
 *  const environment = olojs.Environment({globals, store})
 *  ```
 *  
 *  - `globals` is on object containing a set of names that will be included in
 *    every document contexts; it defaults to {}
 *  - `store` is an olojs store object that will provide read/write access to
 *    the documents repository; it defaults to olojs.stores.Memory.
 */
 
class Environment {
    
    constructor (options) {
        
        this.store = getProp(options, 'store') instanceof NullStore ? 
                options.store : new MemoryStore();
                
        this.globals = isObject(getProp(options, 'globals')) ? 
                Object.create(options.globals) : {};

                
        // Create the import function to be used by document expressions to load
        // and evaluate other documents of this environment
        const environment = this;
        this.globals.import = async function (subPath) {
            const context = this;   // called by swan with the document context as first parameter of call
            const targetPath = pathlib.resolve(context.__path__, isDir(context.__path__) ? '.' : '..', subPath);
            if (context.$cache.imports.has(targetPath)) {
                var targetDoc = context.$cache.imports.get(targetPath);
            } else {
                var targetDoc = await environment.readDocument(targetPath);
                context.$cache.imports.set(targetPath, targetDoc);
            }
            const targetDocContext = targetDoc.createContext();
            return await targetDoc.evaluate(targetDocContext);  
        }
    }
    
    /**
     *  environment.createDocument - function
     *  --------------------------------------------------------------------
     *  Creates a document object containing the document source and
     *  methods to evaluate that source to a namespace.
     *  
     *  ```js
     *  const doc = environment.createDocument(id, source)
     *  ```
     *  
     *  - `id` is a path uri identifying the document in this environment; it
     *    can contain a path, an optional query and an optional frarment.
     *  - `source` is the un-parsed content of the document
     *  - `presets` is an object containing predefined name to be added to
     *    the documen context
     *  - `doc.id` contains the document id with the path segment in normalized form
     *  - `doc.source` contain the un-parsed content of the document
     *  - `doc.createContext` is a function that takes a list of namespaces
     *    as input and returns a context that contains a) the environment
     *    global namespace, b) the passed namespaces and c) the presets
     *  - `evaluate` is an asynchronous function that takes a context as
     *    input and returns the document namespace computed in that context
     */
    createDocument (id, source, presets) {
        const environment = this;
        const path = pathlib.join('/', sliceBefore(id, '?'));
        const query = sliceAfter(id, '?');
        const argns = query ? parseParameters(...query.split('&')) : {};
        
        const cache = {
            evaluate: null,
            imports: new Map()
        };
        
        return {
            
            get id () {
                return path + (query ? `?${query}` : "");
            },
            
            get source () {
                return String(source);
            },
            
            createContext (...namespaces) {
                const context = document.createContext(environment.globals, ...namespaces);
                if (isObject(presets)) Object.assign(context, presets);
                context.$cache = cache;
                context.__path__ = path;
                context.argns = argns;
                return context;
            },
            
            get evaluate () {
                return cache.evaluate || (cache.evaluate = document.parse(this.source));
            }        
        }            
    }
    
    /**
     *  environment.readDocument - async function
     *  --------------------------------------------------------------------
     *  Returns the document mapped to a given id in this environment.
     *  
     *  ```js
     *  const doc = await environment.readDocument(id)
     *  ```
     *  
     *  - `id` is an URI that identifies the required document inside this
     *    environment; it can contain a path, an optional query and an optional 
     *    frarment.
     *  - `doc` is the document object returned by the `createDocument`
     *    method.
     */
    async readDocument (id) {
        const path = sliceBefore(id, '?');
        const source = await this.store.get(path);
        return this.createDocument(id, source);
    }    


    /**
     *  environment.writeDocument - async function
     *  --------------------------------------------------------------------
     *  Changes the content of the document mapped to the given id in this
     *  environment.
     *
     *  ```js
     *  await environment.writeDocument(id, source)
     *  ```
     *  
     *  - `id` is an URI that identifies the required document inside this
     *    environment; it can contain a path, an optional query and an optional 
     *    frarment.
     *  - `source` is the new value to be assigned to the document source
     */
    async writeDocument (id, source) {
        const path = sliceBefore(id, '?');
        return await this.store.set(path, source);
    }
    
    
    /**
     *  environment.deleteDocument - async function
     *  --------------------------------------------------------------------
     *  Erases the document mapped to the given uri in this environment.
     *
     *  ```js
     *  await environment.deleteDocument(id)
     *  ```
     *  
     *  - `id` is an URI that identifies the required document inside this
     *    environment; it can contain a path, an optional query and an optional 
     *    frarment.
     */
    async deleteDocument (id) {
        const path = sliceBefore(id, '?');
        return await this.store.delete(path);
    }    
    
    
    /**
     *  environment.render - async function
     *  --------------------------------------------------------------------
     *  This is just a stortcut to the `document.render` function.
     */
    render (value) {
        return document.render(value);
    }    
}


module.exports = Environment;


// -----------------------------------------------------------------------------
//  SUPPORT FUNCTIONS
// -----------------------------------------------------------------------------

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
const extend = (parent, child) => Object.assign(Object.create(parent), child);
const getProp = (obj, key) => isObject(obj) ? obj[key] || null : null;
const getItem = (array, i) => i < 0 ? array[array.length+i] : array[i];
const sliceBefore = (str, separator) => str.split(separator)[0];
const sliceAfter = (str, separator) => str.split(separator)[1] || "";
const isDir = path => path.slice(-1) === '/';

// Given a list of argument ['par1=val1', 'par2=val2', 'par3=val3', ...], 
// converts it to an object ontaining the ke-value pair contained in the list
function parseParameters (...keyValuePairs) {
    const argns = {};
    for (let keyValuePair of keyValuePairs) {
        const separatorIndex = keyValuePair.indexOf("=");
        if (separatorIndex === -1) {
            let name = keyValuePair.trim();
            if (document.expression.isValidName(name)) argns[name] = null;
        } else {
            let name = keyValuePair.slice(0, separatorIndex).trim();
            if (document.expression.isValidName(name)) {
                let string = keyValuePair.slice(separatorIndex+1).trim();
                let number = Number(string);
                argns[name] = isNaN(number) ? string : number;
            }
        }
    }
    return argns;
}
