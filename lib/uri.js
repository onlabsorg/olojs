const urijs = require("uri-js");
const queryParser = require("query-parse");


class URI {
    
    constructor (href) {
        const uri = urijs.parse(href);
        this.scheme = uri.scheme;
        this.userinfo = uri.userinfo;
        this.host = uri.host;
        this.port = uri.port;
        this.path = uri.path;
        this.query = parseQuery(uri.query);
        this.fragment = uri.fragment;
    }
        
    get authority () {
        const userinfo = this.userinfo ? `${this.userinfo}@` : "";
        const host = this.host || "";
        const port = host && this.port ? `:${this.port}` : ""
        return `//${userinfo}${host}${port}`;
    }
    
    get root () {
        return this.scheme ? `${this.scheme}:${this.authority}` : this.authority;
    }
    
    resolve (subPath) {
        const href = urijs.resolve( String(this), subPath );
        return new URI(href);
    }
    
    toString () {
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
    
    toNamespace () {
        return {
            scheme: this.scheme,
            userinfo: this.userinfo,
            host: this.host,
            port: this.port,
            path: this.path,
            query: this.query,
            fragment: this.fragment,
            authority: this.authority,
            root: this.root,
            resolve: (relativeURI) => String(this.resolve(relativeURI)),
            __text__: () => this.toString()
        }
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


module.exports = URI;
