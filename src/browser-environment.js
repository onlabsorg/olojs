const Environment = require("../lib/environment");
const HTTPLoader = require("../lib/loaders/http-loader");
const DOMPurify = require("dompurify");    
const parseParams = require("../lib/tools/parameters-parser");
const stdlib = require("./stdlib");



class BrowserEnvironment extends Environment {
    
    constructor (origin) {
        super({
            loaders: {
                "/": HTTPLoader(origin)
            }
        })
    }
    
    async importBin (path) {
        
        console.log(stdlib);
        console.log(path);
        console.log(stdlib[path]);
        return await stdlib[path]();
    }
    
    static get Document () {
        return BrowserDocument;
    }
}

class BrowserDocument extends Environment.Document {
    
    async render (queryString) {
        const argv = parseParams(...queryString.slice(1).split("&"));
        const rawHTML = await super.render({argv});
        return DOMPurify.sanitize(rawHTML);
    }
}



const olonv = module.exports = window.olonv = new BrowserEnvironment(location.origin);
