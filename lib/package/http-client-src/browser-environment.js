const BaseEnvironment = require("../../base-environment");
const HTTPLoader = require("../../loaders/http-loader");
const parseParams = require("../../tools/parameters-parser");
const stdlib = require("./stdlib");
const DOMPurify = require("dompurify");    


class BrowserEnvironment extends BaseEnvironment {
    
    constructor (origin, headers={}) {
        super({
            loaders: {
                "/": HTTPLoader(origin, headers)
            }
        })
    }
    
    static get Document () {
        return BrowserDocument;
    }

    static async _importBin (path) {
        return await stdlib[path]();
    }    
}


class BrowserDocument extends BaseEnvironment.Document {
    
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
