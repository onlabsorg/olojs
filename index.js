
const Router = require("./lib/router");
const olojs = new Router();

olojs.expression = require("./lib/expression");
olojs.DocId = require("./lib/doc-id");
olojs.document = require("./lib/document");

module.exports = olojs;
