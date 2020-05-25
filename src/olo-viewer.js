const olonv = window.olonv;

const DOMPurify = require("dompurify");

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
            
            const context = olonv.createContext(this.docPath, {argns:this.argns});
            const evaluate = olonv.parseDocument(olonv.docSource);
            olonv.docns = await evaluate(context);

            const html = await olonv.stringifyDocumentExpression(olonv.docns);
            this.html = DOMPurify.sanitize(html);
        }
    },
    
    mounted () {
        this.refresh();
    }
};
