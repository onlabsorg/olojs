#!/usr/bin/env node

const Path = require("path");
const olojs = require("../index");
const FSStore = require("../lib/stores/fs-store");
const cmd = require("commander");

const render = new cmd.Command();

render.version("0.1.0");

render.arguments('<path>');

render.action(async function (path) {
    const fullPath = Path.resolve(process.cwd(), path);
    olojs.mount("/", new FSStore(Path.dirname(fullPath)));
    const doc = await olojs.load("/"+Path.basename(fullPath));
    const context = doc.createContext();
    const content = await doc.render(context);
    console.log(String(content));
});

render.parse(process.argv);
