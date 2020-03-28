const BrowserEnvironment = require("../lib/environment/browser-environment");
module.exports = window.olonv = new BrowserEnvironment(location.origin);
