const fs = require("fs");
const path = require("path");
const express = require("express");

module.exports = function (env) {
    const router = express.Router();
    
    router.get("/browser-environment.js", (req, res, next) => {
        const script = fs.readFileSync(path.resolve(__dirname, "../../dist/browser-environment.js"));
        res.status(200).send(script);
    });

    router.get("/typography.css", (req, res, next) => {
        const styleSheet = fs.readFileSync(path.resolve(__dirname, "./typography.css"));
        res.header("Content-Type", "text/css");
        res.status(200).send(styleSheet);
    });

    router.get("/*.html", (req, res, next) => {
        const htmlDocument = fs.readFileSync(path.resolve(__dirname, "./client.html"), "utf8");
        res.status(200).send(htmlDocument);
    });
    
    router.get("/*.olo", async (req, res, next) => {
        const source = await env.fetch(req.path);
        res.status(200).send(source);
    });
    
    return router;
}
