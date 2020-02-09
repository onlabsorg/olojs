exports.stores = {};

const stdlibStore = require(__olojspath + "/lib/stores/stdlib-store");
exports.stores["/bin"] = stdlibStore;

const FSStore = require(__olojspath + "/lib/stores/fs-store");
exports.stores["/"] = new FSStore(__dirname);

const HTTPStore = require(__olojspath + "/lib/stores/http-store");
exports.stores["http://"] = new HTTPStore("http:/");
exports.stores["https://"] = new HTTPStore("https:/");
