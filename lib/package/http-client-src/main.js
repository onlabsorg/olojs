const BrowserEnvironment = require("./browser-environment");

module.exports = window.olonv = new BrowserEnvironment(location.origin);
