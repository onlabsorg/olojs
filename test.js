
const port = 8010;
const basePath = __dirname;

const Async = require("asyncawait/async");
const Await = require("asyncawait/await");


const express = require('express');
const router = express();
router.use(express.static(basePath, {etag:false}));

const http = require("http");
const server = http.createServer(router);

const OlodbServer = require("olodb").Server;
const olodb = new OlodbServer("memory");

const NONE  = require("olodb").rights.NONE;
const READ  = require("olodb").rights.READ;
const WRITE = require("olodb").rights.WRITE;



olodb.auth = function (userId) {
    return userId;
}


olodb.getUserRights = Async(function (userName, collection, docId) {

    switch (userName) {

        case "TestUser":
            if (collection === "writable") return WRITE;
            if (collection === "readonly") return READ;
            if (collection === "private") return NONE;

        default:
            return NONE;
    }
});



olodb.listen(server).then(() => {
    console.log(`Test olodb server listening on port ${port}!`);
    olodb.createDocument("writable", "testDoc", {});
    olodb.createDocument("readonly", "testDoc", {
        dict: {a:10, b:11, c:12},
        list: [10, 11, 12],
        text: "abc",
        item: 10
    });
    olodb.createDocument("private", "testDoc", {});
    
    console.log();
    console.log("To run a complete test in the browser: http://localhost:8010/test/index.html");
    console.log();
    console.log("To test a specific component in the browser:");
    console.log("- Store with memory backend: http://localhost:8010/test/index.html#MemoryStore");
    console.log("- Store with local backend:  http://localhost:8010/test/index.html#LocalStore");
    console.log("- Store with olodb backend:  http://localhost:8010/test/index.html#OlodbStore");    
    console.log();
});


server.listen(port, function () {
    console.log(`Test HTTP server listening on port ${port}!`);
});
