window.pathlib = require("path")
require("./olo.css");
const olonv = window.olonv = require("./browser-environment");

const Vue = require("vue/dist/vue.js");
const OloViewer = require("./olo-viewer");

document.addEventListener("DOMContentLoaded", () => new Vue({
        
    el: "#olo-document",
    
    props: ['src'],
    
    components: {
        'olo-viewer': OloViewer(olonv),          
    },        
    
    data: {            
        hash: normalizeHash(location.hash),
    },
    
    methods: {
    },
    
    async mounted () {
        window.addEventListener("hashchange", event => {
            this.hash = normalizeHash(location.hash);
        });
    }
}));



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
