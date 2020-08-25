require("./main.css");
const Vue = require("vue/dist/vue.js");
const OloViewer = require("./olo-viewer");
const Environment = require("../lib/environment");


class BrowserEnvironment extends Environment {
    
    init (rootElement) {
        return new Vue({
                
            el: rootElement,
            
            components: {
                'olo-viewer': OloViewer(this),
            },        
            
            data: {            
                hash: normalizeHash(location.hash),
            },
            
            async mounted () {
                window.addEventListener("hashchange", event => {
                    this.hash = normalizeHash(location.hash);
                });
            }
        });
    }
    
    static get globals () {
        return browser_environment_globals;
    }
}

const browser_environment_globals = Object.assign({}, Environment.globals, {
    $renderError (error) {
        return `<pre class="runtime-error">` +
                    `<div class="message">${escape(error.message)}</div>` +
                    `<br>` +
                    `<div class="source">${escape(error.source)}</div>` +
               `</pre>`;
    }    
});

module.exports = BrowserEnvironment;



function normalizeHash () {

    if (!location.hash || location.hash === "#") {
        location.hash = "/index"
    }
    
    let [docPath, docArgs] = location.hash.slice(1).split("?"); 
    if (docPath.slice(-1) === "/") {
        location.hash = docPath + "index" + (docArgs ? `?${docArgs}` : "");
    }
    
    return location.hash.slice(1);
}

function escape (html) {
    return html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
