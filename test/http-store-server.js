// Start server:
// $ node test/http-store-server

const express = require("express");
const app = express();

const ROOT_PATH = `${__dirname}/fs-store`;
const FSStore = require("../lib/stores/fs-store");
const backend = new FSStore(ROOT_PATH);

const HTTPStoreServer = require("../lib/stores/http-store-server");
app.use('/store', HTTPStoreServer(backend, req => {
    if (req.get('Authorization') === "Bearer Writer") return true;
    if (req.get('Authorization') === "Bearer Reader" && req.method === 'GET') return true;
    return false;
}));

app.listen(8888, () => {
    console.log(`http-store-server listening on port 8888 ...`);
});    
