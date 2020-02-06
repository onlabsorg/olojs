const fs = require("fs");
const express = require("express");

module.exports = function (env) {
    var styleSheet, htmlDocument;
    const router = express.Router();
    const noCache = !env.cache;
    
    const config = ifObject(env.config.http) || {};
    config.rootPath = ifString(config.rootPath) || `${__dirname}/http-client`;
    
    router.get("/main.js", (req, res, next) => {
        const script = fs.readFileSync(`${config.rootPath}/main.js`, "utf8");
        res.status(200).send(script);
    });

    router.get("/*/bin/:modulename", (req, res, next) => {
        const script = fs.readFileSync(`${config.rootPath}/bin/${req.params.modulename}`, "utf8");
        res.status(200).send(script);
    });

    router.get("/typography.css", (req, res, next) => {
        if (!styleSheet || noCache) {
            styleSheet = fs.readFileSync(`${config.rootPath}/typography.css`, "utf8");
        }
        res.header("Content-Type", "text/css");
        res.status(200).send(styleSheet);
    });

    router.get("/*.html", (req, res, next) => {
        if (!htmlDocument || noCache) {
            htmlDocument = fs.readFileSync(`${config.rootPath}/index.html`, "utf8");
        }
        res.status(200).send(htmlDocument);
    });
    
    router.get("*", async (req, res, next) => {
        if (req.get("Content-Type") === "text/olo") {
            let source = await env.fetch(req.path);
            res.status(200).send(source);
        } else if (req.path.slice(-1) === "/") {
            res.redirect(req.path + "index.html");
        } else {
            next();
        }
    });
    
    return router;
}

function ifObject (val) {
    return typeof val === "object" && val !== null && !Array.isArray(val) ? val : null;
}

function ifString (val) {
    return typeof val === "string" ? val : null;
}
