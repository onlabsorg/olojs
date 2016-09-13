var expect = require('chai').expect;
var co = require("co");

var deep = require("../lib/deep");
var Path = deep.Path;
var Change = deep.Change;

var observable = require('../lib/observable');
var ObservableObject = observable.ObservableObject;
var ObservableArray = observable.ObservableArray;
var Observable = observable.Observable;
var Subscription = observable.Subscription;

var remote = require('../lib/remote');
var Hub = remote.Hub;


describe("ObservableObject", function () {
    var clientObj, servedObj;

    before(function (done) {
        co(function * () {
            var hub = yield (new Hub('ws://127.0.0.1:8080/ws', "test")).connect();            
            servedObj = Observable({x:10, y:20, z:30});
            yield hub.publish('test.o', servedObj);
            clientObj = yield hub.subscribe('test.o');
            done();
        })
        .catch(done);
    });

    describe("client object", function () {

        it("should equal the server object upon subscription", function () {
            expect(deep.equal(clientObj, servedObj)).to.be.true;
        });

        it.skip("should change when the server changes", function (done) {
            var subscription = new Subscription(clientObj, function (change) {
                expect(change.path).to.deep.equal(['x']);
                expect(change.old).to.equal(10);
                expect(change.new).to.equal(11);
                expect(deep.equal(clientObj, servedObj)).to.be.true;
                subscription.cancel();
                done();
            });
            servedObj.x = 11;
        });
    });

    describe("served object", function () {

        it("should change when the client changes", function (done) {
            var subscription = new Subscription(servedObj, function (change) {
                expect(change.path).to.deep.equal(['y']);
                expect(change.old).to.equal(20);
                expect(change.new).to.equal(22);
                expect(deep.equal(clientObj, servedObj)).to.be.true;
                subscription.cancel();
                done();
            });
            clientObj.y = 22;
        });        
    });
});
