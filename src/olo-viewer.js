
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
            const context = store.createContext(this.src);
            const source = await store.read(context.__path__);
            const evaluate = olojs.document.parse(source);
            const docns = await evaluate(context);
            const rawHTML = await context.str(docns);
            this.html = DOMPurify.sanitize(rawHTML);
        }
    },
    
    mounted () {
        this.refresh();
    }
});
