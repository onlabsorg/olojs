var co = require('co');

var olojs = require("../../index");

var deep = olojs.deep;
var Path = olojs.deep.Path;
var Change = olojs.deep.Change;

var Observable = olojs.observable.Observable;
var Subscription = olojs.observable.Subscription;

var Hub = olojs.remote.Hub;

var logger = require('./logger');


co(function * () {
    var hub = yield (new Hub('ws://127.0.0.1:8080/ws', "test")).connect();
    logger.log("subscribing to test.o ...");
    var o = yield hub.subscribe('test.o');
    var subs = new Subscription(o, function (change) { 
        logger.logChange(change) 
    });
    return o;
})
.then(function (o) {
    logger.log("test.o loaded.");
    repl = require("repl")
    r = repl.start("client> ");
    r.context.o = o;
    r.context.olojs = olojs;
})
.catch(function (err) {
    throw err;
});