var olojs = require("../../index");
var deep = olojs.deep;

function log (message) {
    console.log(new Date(), message);
}


function logChange (change) {
    var message = "change " 
                + String(change.path) + " : "
                + JSON.stringify(deep.copy(change.old)) + " -> "
                + JSON.stringify(deep.copy(change.new));
    log(message);
}


exports.log = log;
exports.logChange = logChange;
