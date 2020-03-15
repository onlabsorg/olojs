#!/usr/bin/env node

const OloJS = require("../index");
const olojs = new OloJS( process.cwd() );

const commander = require("commander");
const cli = new commander.Command();

cli.version(OloJS.getVersion());

cli.command("init")
    .description("Initialize the olojs environment")
    .action(async () => {
        try {
            await olojs.init();
            console.log("Local olojs environment successfully initialized");
        } catch (error) {
            console.log(error.message);
        }
    });

cli.command("render <path> [args...]")
     .description("Fetch and render an olodocument")
     .action(async (path, args) => {
         const parseParams = require("../lib/tools/parameters-parser");
         const argns = parseParams(...args);
         const renderedDoc = await olojs.render(path, argns);
         console.log(renderedDoc);
     });

cli.command("serve [port]")
     .description("Serve the olojs environment via HTTP")
     .action(async (port=8010) => {
         const server = await olojs.serve(port);
         console.log(`olojs HTTP server listening on port ${port}`);
     });

cli.parse(process.argv);
