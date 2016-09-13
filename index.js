
var olojs = {}

olojs.deep   = require("./lib/deep");
olojs.Path   = olojs.deep.Path;
olojs.Change = olojs.deep.Change;

olojs.observable   = require("./lib/observable");
olojs.Observable   = olojs.observable.Observable;
olojs.Subscription = olojs.observable.Subscription;

olojs.remote = require("./lib/remote");
olojs.Hub    = olojs.remote.Hub;

olojs.co = require("co");

try {
    window.olojs = olojs;
}

catch (e) {}

finally {
    module.exports = olojs;    
}

