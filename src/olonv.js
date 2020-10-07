const BrowserEnvironment = require('./browser-environment');

const olonv = window.olonv = BrowserEnvironment({
    origin: location.origin,
    globals: {}
});

const Vue = require("vue/dist/vue.js");
const OloViewer = require("./olo-viewer");

olonv.init = rootElement => new Vue({
        
    el: rootElement,
    
    components: {
        'olo-viewer': OloViewer(olonv),
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
