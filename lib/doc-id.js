const urijs = require("uri-js");
const queryParser = require("query-parse");



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
 
class DocId {
    
    constructor (uri) {
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
    
    isParentOf (otherId) {
        otherId = String(this.constructor.parse(otherId));
        let thisId = this.serializeWithTrailingSlash();
        return otherId.indexOf(thisId) === 0;
    }
    
    getSubPath (otherId) {
        otherId = String(this.constructor.parse(otherId));
        let thisId = this.serializeWithTrailingSlash();
        return otherId.indexOf(thisId) === 0 ? otherId.substring(thisId.length-1) : "";        
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

module.exports = DocId;


function parseQuery (queryString) {
    const query = queryParser.toObject(queryString);
    for (let key in query) {
        let value = Number(query[key]);
        if (!Number.isNaN(value)) query[key] = value;
    }
    return query;
}
