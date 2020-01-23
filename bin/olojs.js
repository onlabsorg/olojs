#!/usr/bin/env node

const Path = require("path");
const fs = require("fs");

const Package = require("../lib/package");
const package = new Package(process.cwd());

function getVersion () {
    const npmPackage = JSON.parse( fs.readFileSync(`${__dirname}/../package.json`, 'utf8') );
    return npmPackage.version;    
}

const commander = require("commander");
const cli = new commander.Command();

cli.version(getVersion());

cli.command("init")
    .description("Initialize the olojs environment")
    .action(async () => {
        try {
            await package.init();
            console.log("Package successfully initialized");
        } catch (e) {
            console.log("Initialization failed");
        }
    });

cli.command("render <path> [args...]")
     .description("Fetch and render an olodocument")
     .action(async (path, args) => {
         const parseParams = require("../lib/tools/parameters-parser");
         const argv = parseParams(...args);
         const renderedDoc = await package.render(path, argv);
         console.log(renderedDoc);
     });

cli.command("serve [port]")
     .description("Serve the olojs environment via HTTP")
     .action(async (port=8010) => {
         const server = await package.serve(port);
         console.log(`olojs HTTP serve listening on port ${port}` + (package.getEnvironment().development ? " in development mode" : ""));
     });

cli.parse(process.argv);
