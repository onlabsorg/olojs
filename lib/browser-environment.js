const Environment = require('./environment');
const Router = require('./stores/router');
const MemoryStore = require('./stores/memory');
const HTTPStore = require('./stores/http');



class BrowserEnvironment extends Environment {
    
    constructor (homeURL, options={}) {
        const customStores = isObject(options) && isObject(options.stores) ?
                options.stores : {};
        super({
            store: new Router(extend({
                home: new HTTPStore(`${homeURL}/home`, options),
                temp: new MemoryStore(),
                http: new HTTPStore('http://'),
                https: new HTTPStore('https://')
            }, customStores)),
            globals: extend(require('./globals'), browserGlobals)
        });
    }
}


const browserGlobals = {
    
    $renderError (error) {
        return `<pre class="runtime-error">` +
                    `<div class="message">${escape(error.message)}</div>` +
                    `<br>` +
                    `<div class="source">${escape(error.source)}</div>` +
               `</pre>`;
    }            
};


module.exports = BrowserEnvironment;



// -----------------------------------------------------------------------------
//  UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

const isObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj);
const extend = (parent, child) => Object.assign(Object.create(parent), child);
const escape = html => html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
