
const urijs = require("uri-js");
const queryParser = require("query-parse");
const Store = require("./store");



class Hub extends Store {
    
    constructor () {
        super();
        this._stores = new Map();
    }
    
    async read (docURI) {
        const [store, docPath] = this._matchStore(docURI);
        if (!store) throw new Error(`Unknown store uri: ${docURI}`);
        return await store.read(docPath);        
    }
    
    async write (docURI, source) {
        const [store, docPath] = this._matchStore(docURI);
        if (!store) throw new Error(`Unknown store uri: ${docURI}`);
        return await store.write(docPath, source);
    }
    
    _createContext (doc) {
        const [store, docPath] = this._matchStore(doc.id);
        if (!store) throw new Error(`Unknown store uri: ${docURI}`);
        return store._createContext(doc);
    }
    
    mount (storeURI, store) {
        if (store instanceof Store) {
            this._stores.set(URI.parse(storeURI), store);
        } else {
            throw new Error("Not a valid store");
        }        
    }
    
    _matchStore (docURI) {
        for (let [storeURI, store] of this._stores.entries()) {
            if (storeURI.isParentOf(docURI)) {
                let docPath = storeURI.getSubPath(docURI);
                return [store, docPath];
            }
        }        
        return [null, ""];
    }
    
    static get DocId () {
        return URI;
    }
}





/** uri = parse("scheme://userinfo@host:port/path/to/doc?query#fragment")
 *  Returns an uri object
 *  -   uri.scheme: string
 *  -   uri.userinfo: string
 *  -   uri.host: string
 *  -   uri.port: number
 *  -   uri.path: string
 *  -   uri.query: string
 *  -   uri.fragment: string
 */
 
class URI extends Store.DocId {
    
    constructor (uri) {
        super();
        Object.assign(this, urijs.parse(uri));
        this.query = parseQuery(this.query);
    }
    
    get authority () {
        const userinfo = this.userinfo ? `${this.userinfo}@` : "";
        const host = this.host || "";
        const port = host && this.port ? `:${this.port}` : "";
        const slashes = (userinfo || host || port) ? "//" : "";
        return slashes + userinfo + host + port;
    }
    
    get root () {
        return this.scheme ? `${this.scheme}:${this.authority}` : this.authority;
    }
    
    get uri () {
        return urijs.serialize({
            scheme: this.scheme,
            userinfo: this.userinfo,
            host: this.host,
            port: this.port,
            path: this.path,
            query: Object.keys(this.query).length > 0 ? queryParser.toString(this.query) : undefined,
            fragment: this.fragment
        });
    }
    
    isParentOf (otherURI) {
        otherURI = String(this.constructor.parse(otherURI));
        let thisURI = this.serializeWithTrailingSlash();
        return otherURI.indexOf(thisURI) === 0;
    }
    
    getSubPath (otherURI) {
        otherURI = String(this.constructor.parse(otherURI));
        let thisURI = this.serializeWithTrailingSlash();
        return otherURI.indexOf(thisURI) === 0 ? otherURI.substring(thisURI.length-1) : "";        
    }
    
    resolve (uri) {
        return urijs.resolve(String(this), uri);
    }
    
    toString () {
        return this.root + this.path;
    }
    
    serializeWithTrailingSlash () {
        let idStr = String(this);
        return idStr.slice(-1) === "/" ? idStr : idStr + "/";
    }
    
    toNamespace (uri) {
        return {
            scheme:     this.scheme,
            userinfo:   this.userinfo,
            host:       this.host,
            port:       this.port,
            path:       this.path,
            query:      this.query,
            fragment:   this.fragment,
            authority:  this.authority,
            root:       this.root,
            base:       this.base,
            str:        this.toString(),
            resolve:    this.resolve.bind(this)
        }
    }
    
    static parse (uri) {
        return uri instanceof this ? uri : new this(uri);
    }
}

function parseQuery (queryString) {
    const query = queryParser.toObject(queryString);
    for (let key in query) {
        let value = Number(query[key]);
        if (!Number.isNaN(value)) query[key] = value;
    }
    return query;
}





module.exports = Hub;
