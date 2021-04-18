const DOMPurify = require("dompurify");



/**
 *  Viewer - function
 *  ============================================================================
 *  The Viewer function takes a DOM element and an olojs Store as input and
 *  binds the `innerHTML` content of the element to the rendering of the document 
 *  identified by the `src` attribute in the given store. For example:
 *  
 *  ```html
 *  
 *  <!-- This is the element that will contain the document rendering -->
 *  <div id="viewer-id" src="/path/to/doc"></div>
 *  
 *  <script>
 *      
 *      <!-- retrieve the host element and create a store -->
 *      domElement = document.querySelector("#viewer-id");
 *      store = new olojs.HTTPStore("http://store-hostname");
 *      
 *      <!-- bind the host element to the store -->
 *      viewer = olojs.Viewer(domElement, store);
 *      
 *  </store>
 *  ```
 *  
 *  Once the binding is created by calling the `Viewer` constructor, the
 *  document identified by the `src` attribute (`/path/to/doc` in the example)
 *  will be loaded from the given store, then rendered, sanitized and injected
 *  as `innerHTML` in the host element.
 *  
 *  Every time the `src` attribute changes, the host element content will be
 *  automatically updated. 
 *  
 *  The Viewer constructor returns the [MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
 *  used to react to `src` attribute changes.
 */
module.exports = function (element, store) {
    
    const observer = new MutationObserver(async mutations => {
        for (let mutation of mutations) {
            if (mutation.type === "attributes" && mutation.attributeName === "src") {
                const docId = mutation.target.getAttribute('src');
                const {text} = await store.load(docId);
                mutation.target.innerHTML = DOMPurify.sanitize(text);
            }
        }
    });
    
    observer.observe(element, {
        attributes: true, 
        attributeFilter: ['src']
    });
    
    return observer;
}
