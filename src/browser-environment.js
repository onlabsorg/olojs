const olojs = require("../browser");


module.exports = (options={}) => olojs.Environment({
    protocols: olojs.protocols,
    routes: {
        '/': `${options.origin}/env`
    },
    globals: Object.assign({}, defaultGlobals, Object(options.globals))
});


const defaultGlobals = {
    
    $renderError (error) {
        return `<pre class="runtime-error">` +
                    `<div class="message">${escape(error.message)}</div>` +
                    `<br>` +
                    `<div class="source">${escape(error.source)}</div>` +
               `</pre>`;
    }            
};



// -----------------------------------------------------------------------------
//  UTILITY FUNCTIONS
// -----------------------------------------------------------------------------

function escape (html) {
    return html
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
