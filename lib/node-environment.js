const Environment = require('./environment');
const Router = require('./stores/router');
const FSStore = require('./stores/fs');
const MemoryStore = require('./stores/memory');
const HTTPStore = require('./stores/http');

class NodeEnvironment extends Environment {
    
    constructor (homePath, options={}) {
        const customStores = isObject(options) && isObject(options.stores) ?
                options.stores : {};
        super({
            store: new Router(extend({
                home: new FSStore(homePath),
                temp: new MemoryStore(),
                http: new HTTPStore('http://'),
                https: new HTTPStore('https://')
            }, customStores)),
            globals: require('./globals')
        });
        
        this.Server = isObject(options) && typeof options.server === 'function' ?
                options.server : require('./servers/http');
    }
    
    serve (options={}) {
        const server = this.Server(this, options);
        return new Promise((resolve, reject) => {
            const port = isObject(options) ? options.port || 8010 : 8010;
            server.listen(port, err => {
                if (err) reject(err); else resolve(server);
            })
        });
    }
}

module.exports = NodeEnvironment;



// -----------------------------------------------------------------------------
//  SUPPORT FUNCTIONS
// -----------------------------------------------------------------------------

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
const extend = (parent, child) => Object.assign(Object.create(parent), child);
