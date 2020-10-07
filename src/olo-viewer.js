const DOMPurify = require("dompurify");
const document = require("../lib/document");

require("./olo-viewer.css");

module.exports = olonv => ({
    
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
            return args ? olonv.parseParameters(...args.split("&")) : {};                                
        }
    },
    
    watch: {
        "src": function () {
            this.refresh();
        }
    },
    
    methods: {
        async refresh () {
            olonv.doc = await olonv.loadDocument(this.docPath);
            olonv.doc.context = olonv.doc.createContext({argns: this.argns})
            olonv.doc.namespace = await olonv.doc.evaluate(olonv.doc.context);
            const rawHTML = await olonv.render(olonv.doc.namespace);
            this.html = DOMPurify.sanitize(rawHTML);
        }
    },
    
    mounted () {
        this.refresh();
    }
});
