const Vue = require("vue/dist/vue");
const OloViewer = require("./olo-viewer");


/**
 *  createViewer - function
 *  ============================================================================
 *  In a browser environment, this function creates a widget that renders the
 *  document mapped to the `src` attribute in a given store.
 *  
 *  **HTML**
 *  ```html
 *  <olo-viewer id="container" src="/path/to/doc?x=1;y=2"></olo-viewer>
 *  ```
 *  
 *  **JavaScript**
 *  ```js
 *  elt = document.querySelector("#container");
 *  olojs.createViewer(elt, store);
 *  ```
 *  
 *  Optionally, the src attribute value can be bound to the page URL hash as
 *  follows:
 *  
 *  ```html
 *  <olo-viewer id="container" :src="hash"></olo-viewer>
 *  ```
 */
module.exports = (domElement, store) => {

    store.globals.$renderError = error => 
            `<pre class="runtime-error">` +
                `<div class="message">${escape(error.message)}</div>` +
                (error.swanStack ? `<br><div class="source">${escape(error.swanStack)}</div>` : "") +
            `</pre>`;

    return new Vue({

        el: domElement,

        components: { 
            'olo-viewer': OloViewer(store),
        },

        data: {    
            'hash': location.hash.slice(1),
        },

        async mounted () {
            window.addEventListener("hashchange", (event) => {
                this.hash = location.hash.slice(1);
            });
        }
    });
}

const escape = html => html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
