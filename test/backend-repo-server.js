const FSStore = require("../lib/stores/fs-store");
const store = new FSStore(`${__dirname}/backend-repo`)

const Environment = require("../lib/environment");
const environment = new Environment({store, nocache:true});

const HTTPServer = require("../lib/http-server");
const server = new HTTPServer(environment);

server.listen(8010, () => {
    console.log("Test server listening on port 8010.");
    console.log("Visit `http://localhost:8010/` in your browser to start testing the client.");
});
