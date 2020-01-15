const Environment = require("../lib/environment");
const HTTPLoader = require("../lib/loaders/http-loader");
const DOMPurify = require("dompurify");    
const stdlib = require("./stdlib");



class BrowserEnvironment extends Environment {
    
    constructor (origin) {
        super({
            loaders: {
                "/": HTTPLoader(origin)
            }
        })
    }
    
    async require (path) {
        return await stdlib[path]();
    }
    
    static get Document () {
        return BrowserDocument;
    }
}

class BrowserDocument extends Environment.Document {
    
    async render (params) {
        const rawHTML = await super.render(params);
        return DOMPurify.sanitize(rawHTML);
    }
}



const olonv = module.exports = window.olonv = new BrowserEnvironment(location.origin);
