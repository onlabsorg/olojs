// Start server:
// $ node test/http-store-server

const express = require("express");
const app = express();

const ROOT_PATH = `${__dirname}/fs-store`;
const FSBackend = require("../lib/backends/fs-backend");
const backend = new FSBackend(ROOT_PATH);

const HTTPBackendServer = require("../lib/backends/http-backend-server");
app.use('/store', HTTPBackendServer(backend, req => {
    if (req.get('Authorization') === "Bearer Writer") return true;
    if (req.get('Authorization') === "Bearer Reader" && req.method === 'GET') return true;
    return false;
}));

app.listen(8888, () => {
    console.log(`http-store-server listening on port 8888 ...`);
});    
