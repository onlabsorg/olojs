/**
 *  This module provides a class allowing to publish or subscribe objects.
 */

/*!
 *  MIT License
 * 
 *  Copyright (c) 2016 Marcello Del Buono (m.delbuono@gmail.com)
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the "Software"), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in all
 *  copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 *  SOFTWARE.
 */





/*!
 *  Dependencies
 */
var co = require('co');

var deep = require("./deep");
var Path = deep.Path;
var Change = deep.Change;

var observable = require("./observable");
var Observable = observable.Observable;
var Subscription = observable.Subscription;

var autobahn = require('autobahn');





/**
 *  # class Hub
 *
 *  This class represents a WAMP Router where clients can publish [ObservableObject][] instances
 *  or subscribe to other's [ObservableObject][] instances.
 *
 *  The published instance and all the subscribed instances will be synchronized in real time.
 *  Being each instance an [ObservableObject][], you can just use it a a normal object: 
 *  *   all the changes you made will be automatically shared with the other instances;
 *  *   if you [subscribe][Subscription] to [change][Change] notifications, all the changes (made either by you or remotely) will be notified to your callback
 */
class Hub {

    /**
     *  The Hub constructor accepts a websocket url and a WAMP realm as parameters.
     *
     *  Example:
     *
     *  ```js
     *  var hub = new Hub("ws:\\localhost:8010\ws", "test_realm");
     *  ```
     */
    constructor (url, realm) {
        this.url = url;
        this.realm = realm;
        this.connection = new autobahn.Connection({url:this.url, realm:this.realm});
    }


    /**
     *  ### Hub.prototype.connect()
     *  In order to establish a connection with the WAMP router, you must call the `connect()` method.
     *  It returns a promise that resolves the hub itself once the connection is open.
     *  
     *  Example using promises:
     *
     *  ```js
     *  var hub = new Hub("ws:\\localhost:8010\ws", "test_realm");
     *  hub.connect()
     *  .then(function (hub) {...})
     *  .catch(function (err) {...});
     *  ```
     *
     *  Example using coroutines:
     *
     *  ```js
     *  co(function * () {
     *      var hub = yield (new Hub("ws:\\localhost:8010\ws", "test_realm")).connect();
     *      // ...
     *  });
     *  ```
     */
    connect () {
        var self = this;
        return new Promise(function (resolve, reject) {

            self.connection.onopen = function (session, details) {
                self.session = session;
                resolve(self);
            };

            self.connection.onclose = function (reason, details) {
                reject({reason:reason, details:details});
            };

            self.connection.open();
        });
    }


    /**
     *  ### Hub.prototype.publish(path, observableObject)
     *  This method publishes your [ObservableObject][] on the hub, meaning that remote users
     *  can `subscribe` to it and get a realtime synchronized copy.
     *
     *  The method accepts two parameters:
     *
     *  * path: a [Path][] object that represents the vrtual path where the observable object is mounted
     *  * observableObject: the [ObservableObject][] to be shared  
     *    
     *  It returns a promise that resolves when the publication is complete.
     *    
     *  Example (using coroutines):
     *
     *  ```js
     *  co(function * () {
     *      var hub = yield (Hub("ws:\\localhost:8010\ws", "test_realm")).connect();
     *      var vector = new Observable({x:10, y:20, z:30});
     *      yield hub.publish('path.to.vector', vector);
     *      // ...
     *      // just use the vector object here
     *      // all the changes will be applied to the subscriber copies
     *      // ...
     *  });
     *  ```
     */
    publish (path, proxy) {
        var self = this;
        var path = new Path(path);
        var pathstr = String(path);

        var fetch = pathstr + '.fetch'
        var post = pathstr + '.post'

        return co (function * () {

            // register the procedure that will handel the data fetch requests
            yield self.session.register(fetch, function () {
                return deep.copy(proxy);
            });

            // register the procedure that will handle the change post requests
            yield self.session.register(post, function (argv) {
                var remoteChange = new Change(argv[0].path, argv[0].old, argv[0].new);
                var localChange = remoteChange.apply(proxy);
                return deep.copy(localChange);
            });

            // subscribe to local object changes and publishes them
            var subscription = new Subscription(proxy, function (change) {
                self.session.publish(pathstr, [deep.copy(change)]);
            });

        });
    }


    /**
     *  ### Hub.prototype.subscribe(path)
     *  This method subscribes to an [ObservableObject][] published on the hub by a remote user.
     *    
     *  The method requires the path of the object as parameter and returns a promise that
     *  resolves a real-time syncronized copy of the original observable object.
     *    
     *  Example (using coroutines):
     *
     *  ```js
     *  co(function * () {
     *      var hub = yield (Hub("ws:\\localhost:8010\ws", "test_realm")).connect();
     *      var vector = yield hub.subscribe('path.to.vector');
     *      // ...
     *      // just use the vector observable object here
     *      // all the changes will be synchronized with the master copy
     *      // which in turn will propagate the changes to all the other subscribers
     *      // ...
     *  });
     *  ```
     */
    subscribe (path) {
        var self = this;
        var path = new Path(path);
        var pathstr = String(path);

        var fetch = pathstr + '.fetch'
        var post = pathstr + '.post'

        return co(function * () {

            // fetch the remote object
            var remoteData = yield self.session.call(fetch);
            var proxy = Observable(remoteData);

            // handle local object changes
            var subscription = new Subscription(proxy, co.wrap(function * (change) {
                var remoteChange = yield self.session.call(post, [deep.copy(change)]);
                if (remoteChange === null) {
                    var remoteData = yield self.session.call(fetch);
                    deep.assign(proxy, remoteData);
                }
            }));

            // handle remote object changes
            var autobahnSubscription = yield self.session.subscribe(pathstr, co.wrap(function * (argv) {
                var remoteChange = new Change(argv[0].path, argv[0].old, argv[0].new);
                var localChange = remoteChange.apply(proxy);
                if (localChange === null && !deep.equal(remoteChange.new, remoteChange.path.lookup(proxy))) {
                    var remoteData = yield self.session.call(fetch);
                    deep.assign(proxy, remoteData);
                }
            }));

            return proxy;
        })
        .catch(function (err) {
            throw err;
        });
    }


    /**
     *  ### Hub.prototype.diconnect()
     *  Closes the connection.
     */
    disconnect () {
        this.connection.close();
    }
}



/*!
 *  Exports
 */
exports.Hub = Hub;




// DOCUMENTATION LINKS

/**
 *  [olojs.deep]: ./olojs.deep  
 *  [Path]: ./olojs.deep#class-path  
 *  [Change]: ./olojs.deep#class-change  
 *  [equal]: ./olojs.deep#function-equalobj1-obj2  
 *  [copy]: ./olojs.deep#function-copyobj  
 *  [diff]: ./olojs.deep#function-diffoldobj-newobj  
 *  [assign]: ./olojs.deep#function-assigndest-orig  
 *    
 *  [olojs.observable]: ./olojs.observable
 *  [ObservableObject]: ./olojs.observable#class-observableobject  
 *  [ObservableArray]: ./olojs.observable#class-observablearray  
 *  [Observable]: ./olojs.observable#function-observableobj  
 *  [Subscription]: ./olojs.observable#class-subscription  
 *
 *  [Hub]: #class-hub
 */
