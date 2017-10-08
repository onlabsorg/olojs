
const portParamIndex = process.argv.indexOf("--port") + 1;
const port = portParamIndex ? process.argv[portParamIndex] : 8010;

const express = require('express');
const app = express();

const http = require('http');
const server = http.createServer(app);

const {Store, Router} = require('../lib/server');
const store  = new Store(`${__dirname}/store`);

const basePath = `${__dirname}/..`;

const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.use(function (req, res, next) {
    if (req.headers && req.headers.authorization && req.headers.authorization.substr(0, 7) === "Bearer ") {
        req.token = req.headers.authorization.substr(7);
    }
    next();
});

app.use("/olostore", Router(store));

app.use(express.static(basePath, {etag:false}));

server.listen(port, function () {
    console.log(`olo web server listening on port ${port}!`);
});
