#!/usr/bin/env node

const Path = require("path");
const fs = require("fs");``
const FSStore = require("../lib/stores/fs-store");
const cmd = require("commander");

const olojs = new cmd.Command();

const npmPackage = JSON.parse( fs.readFileSync(`${__dirname}/../package.json`, 'utf8') );
olojs.version(npmPackage.version);

olojs.command("render <path>")
     .description("Start the olowiki server.")
     .action(async path => {
         const fullPath = Path.resolve(process.cwd(), path);
         const store = new FSStore(Path.dirname(fullPath));
         const doc = await store.load("/"+Path.basename(fullPath));
         const context = doc.createContext({olojs:{version: npmPackage.version}});
         const content = await doc.render(context);
         console.log(String(content));       
     });

olojs.parse(process.argv);
