const olonv = require("./browser-environment");
const DOMPurify = require("dompurify");
const parseParams = require("../lib/tools/parameters-parser");

module.exports = {
    
    template: `<div class="olo-viewer" v-html="html"></div>`,
    
    props: ['src'],
    
    data: () =>({
        html: ""
    }),
    
    computed: {
        
        docPath: function () {
            return this.src.split("?")[0] || "";
        },
        
        argns: function () {
            let args = this.src.split("?")[1];
            return args ? parseParams(...args.split("&")) : {};                                
        }
    },
    
    watch: {
        "src": function () {
            this.refresh();
        }
    },
    
    methods: {
        async refresh () {
            olonv.docSource = await olonv.readDocument(this.docPath);
            olonv.context = olonv.createContext(this.docPath, this.argns);
            olonv.evaluate = olonv.parseDocument(olonv.docSource);            
            olonv.docns = await olonv.evaluate(olonv.context);
            const rawHTML = await olonv.render(olonv.docns);
            this.html = DOMPurify.sanitize(rawHTML);
        }
    },
    
    mounted () {
        this.refresh();
    }
};
