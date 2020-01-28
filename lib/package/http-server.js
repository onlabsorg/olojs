const fs = require("fs");
const path = require("path");
const express = require("express");

module.exports = function (env) {
    var styleSheet, htmlDocument;
    const router = express.Router();
    
    router.get("/browser-environment.js", (req, res, next) => {
        const script = fs.readFileSync(path.resolve(__dirname, "../../dist/browser-environment.js"), "utf8");
        res.status(200).send(script);
    });

    router.get("/typography.css", (req, res, next) => {
        if (!styleSheet || env.development) {
            styleSheet = fs.readFileSync(path.resolve(__dirname, "./http-client-typography.css"), "utf8");
        }
        res.header("Content-Type", "text/css");
        res.status(200).send(styleSheet);
    });

    router.get("/*.html", (req, res, next) => {
        if (!htmlDocument || env.development) {
            htmlDocument = fs.readFileSync(path.resolve(__dirname, "./http-client.html"), "utf8");
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
