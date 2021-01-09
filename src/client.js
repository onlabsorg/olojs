
const Document  = require('../lib/document');
const HTTPStore = require('../lib/http-store');
const DOMPurify = require('dompurify');

const store = new HTTPStore(`${location.origin}/docs/`);

async function render () {
    const docId = location.hash ? location.hash.slice(1) : "/";
    const rootElement = document.querySelector('body');

    try {
        const doc = await store.load(docId);
        const context = doc.createContext();
        const docns = window.docns = await doc.evaluate(context);
        const rawHTML = await Document.render(docns);
        rootElement.innerHTML = DOMPurify.sanitize(rawHTML);
    } 
    catch (error) {
        rootElement.innerHTML = `ERROR: ${error.message}`;
    }    
}

window.addEventListener('hashchange', render);

document.addEventListener("DOMContentLoaded", render);
