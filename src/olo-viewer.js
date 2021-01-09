
const Vue = require("vue/dist/vue");
const DOMPurify = require("dompurify");
const pathlib = require('path');
const olojs = require('../browser');

require('./olo-viewer.css');


module.exports = store => ({
    
    template: '<div class="olo-viewer" v-html="html"></div>',
    
    props: ['src'],
    
    data: () => ({
        html: "",        
    }),
    
    watch: {
        
        'src': function () {
            this.refresh();
        }
    },
    
    methods: {
        
        'refresh': async function () {
            const doc = await store.load(this.src);
            const context = doc.createContext();
            const docns = await doc.evaluate(context);
            const rawHTML = await context.str(docns);
            this.html = DOMPurify.sanitize(rawHTML);
        }
    },
    
    mounted () {
        this.refresh();
    }
});
