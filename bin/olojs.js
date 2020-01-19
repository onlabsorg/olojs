#!/usr/bin/env node

const Path = require("path");
const fs = require("fs");``
const cmd = require("commander");

function getEnvironment (rootPath) {
    const Environment = require("../lib/environment");
    const configPath = Path.resolve(rootPath, "./olojs-config.js");
    const config = require(configPath);
    return new Environment(config);    
}

function getVersion () {
    const npmPackage = JSON.parse( fs.readFileSync(`${__dirname}/../package.json`, 'utf8') );
    return npmPackage.version;    
}

async function render (rootPath, path, ...args) {
    const parseParams = require("../lib/tools/parameters-parser");    
    const env = getEnvironment(rootPath);
    const doc = await env.load(path);
    const argv = parseParams(...args);
    const text = await doc.render({argv});
    console.log(text);    
}

async function init (rootPath) {
    const configPath = Path.resolve(rootPath, "./olojs-config.js");
    if (!fs.existsSync(configPath)) {
        let configFile = fs.readFileSync(Path.resolve(__dirname, "../lib/environments/config-template.js"), "utf8");
        fs.writeFileSync(configPath, configFile, "utf8");
    }
    console.log("Olojs environment initialized correctly.")
}

async function serve (rootPath, port=8010) {
    const HTTPServer = require("../lib/http-server/server");
    const express = require("express");
    const app = express();
    const env = getEnvironment(process.cwd());
    app.use("/", HTTPServer(env));
    app.use( express.static(process.cwd()) );
    app.listen(port, () => {
        console.log(`olo-viewer test server listening on port ${port}`);
    });        
}


const olojs = new cmd.Command();

olojs.version(getVersion());

olojs.command("init")
    .description("Initialize the olojs environment")
    .action(() => init(process.cwd()));

olojs.command("render <path> [args...]")
     .description("Fetch and render an olodocument")
     .action((path, args) => render(process.cwd(), path, ...args));

olojs.command("serve [port]")
     .description("Serve the olojs environment via HTTP")
     .action(port => serve(process.cwd(), port));

olojs.parse(process.argv);
