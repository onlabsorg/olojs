
var olojs = require('..');

var env = new olojs.Environment({
    store: new olojs.stores.FS(`${__dirname}/backend`)
})

const server = olojs.servers.http(env);

server.listen(8888, () => {
    console.log("olojs http server listening on port 8888");
    console.log("visit http://localhost:8888/#/home/index in your browser");
});
