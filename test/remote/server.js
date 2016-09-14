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
    logger.log("starting server ...");
    var hub = yield (new Hub('ws://127.0.0.1:8080/ws', "test")).connect();
    
    var o = Observable({counter:1});
    subscription = new Subscription(o, function (change) { 
        logger.logChange(change);
    });

    logger.log("publishing test.o ...");
    hub.publish('test.o', o);
    logger.log("published test.o");

})
.then(function () {
    logger.log("listening ...");
    setInterval(function () {}, 60000);
})
.catch(function (err) {
    throw err;
});