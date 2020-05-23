#!/usr/bin/env node

const OloJS = require("../index");
const olojs = new OloJS( process.cwd() );

const commander = require("commander");
const cli = new commander.Command();

const log = console.log;

cli.version(OloJS.getVersion());

cli.command("init")
    .description("Initialize the olojs environment")
    .action(async () => {
        try {
            await olojs.init();
            log();
            log("A local olojs environment has been created. Now you can:");
            log("- customize the local environment by editing the `olonv.js` file");
            log("- render a olo-document by typing `npx olojs render <path>`");
            log("- serve this environment over http by typing `npx olojs serve`");
            log();
        } catch (error) {
            log(`ERROR: ${error.message}`);
        }
    });

cli.command("render <path> [args...]")
     .description("Fetch and render an olodocument")
     .action(async (path, args) => {
         const parseParams = require("../lib/tools/parameters-parser");
         const argns = parseParams(...args);
         const renderedDoc = await olojs.render(path, argns);
         log(renderedDoc);
     });

cli.command("serve [port]")
     .description("Serve the olojs environment via HTTP.")
     .action(async (port=8010) => {
         const server = await olojs.serve(port);
         log(`olojs HTTP server listening on port ${port}`);
     });

cli.parse(process.argv);
