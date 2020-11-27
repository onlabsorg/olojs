const olojs = require('../browser');

const olonv = window.olonv = new olojs.Environment ({
    
    store: new olojs.stores.HTTP(`${location.origin}/env`),
    
    globals: {
        $renderError (error) {
            return `<pre class="runtime-error">` +
                        `<div class="message">${escape(error.message)}</div>` +
                        `<br>` +
                        `<div class="source">${escape(error.swanStack)}</div>` +
                   `</pre>`;
        }                    
    }
});

const Vue = require("vue/dist/vue.js");
const DOMPurify = require("dompurify");
require("./main.css");

olonv.init = rootElement => new Vue({
        
    el: rootElement,
    
    data: {            
        hash: normalizeHash(location.hash),
        html: "Loading ..."
    },
    
    watch: {
        hash: function () {
            this.refresh();
        }
    },
    
    methods: {
        
        async refresh () {
            const doc = olonv.doc = await olonv.readDocument(this.hash);
            const context = olonv.context = doc.createContext();
            const docns = olonv.docns = await doc.evaluate(context);            
            const rawHTML = await olonv.render(docns);
            this.html = DOMPurify.sanitize(rawHTML);
        }
    },
    
    async mounted () {
        window.addEventListener("hashchange", event => {
            this.hash = normalizeHash(location.hash);
        });
        await this.refresh();
    }
});



// -----------------------------------------------------------------------------
//  SERVICE FUNCTIONS
// -----------------------------------------------------------------------------

const escape = html => html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");


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
