const Environment = require("./environment");
const HTTPStore = require("./stores/http-store");
const stdlibStore = require("./stores/stdlib-browser-store");
const parseParams = require("./tools/parameters-parser");
const DOMPurify = require("dompurify");    


class BrowserEnvironment extends Environment {
    
    constructor (origin, headers={}) {
        super({
            stores: {
                "/":        new HTTPStore(origin, headers),
                "http://":  new HTTPStore("http:/", headers),
                "https://": new HTTPStore("https:/", headers),
                "/bin":     stdlibStore
            }
        })
    }
    
    static get Document () {
        return BrowserDocument;
    }
}


class BrowserDocument extends Environment.Document {
    
    async render (queryString="?") {
        const argv = parseParams(...queryString.slice(1).split("&"));
        const rawHTML = await super.render({argv});
        return DOMPurify.sanitize(rawHTML);
    }
    
    static renderError (error) {
        return `<span style="color:red; font-weight:bold">${super.renderError(error)}</span>`
    }
}



module.exports = BrowserEnvironment;
