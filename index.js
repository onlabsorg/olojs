
const Hub = require("./lib/hub");
const olojs = new Hub();

olojs.expression = require("./lib/expression"),
olojs.document = require("./lib/document");

module.exports = olojs;
