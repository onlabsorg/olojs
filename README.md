# olojs

olojs is a javascript library that allows concurrent editing of objects via [WAMP][]. It works in NodeJS and in the Browser.

olojs is still under active development, therefore it may be buggy. Feel free to help.

olojs uses ES6 and it has been tested on Node 6.3.1 and Chrome 52

## How it works
A user shares an [Observable][olojs.observable] object:
```js
//create the object to be shared
var obj = new olojs.Observable({x:1, y:2, z:3});

//connect to the WAMP router
var hub = new olojs.Hub('ws:\\localhost:8010', 'realm');
hub.connect()
.then(function () {

    // publish the object
    hub.publish('path.to.obj', obj)
    .then(function () {

        // any change to obj will be synchronized with all the subscribers
        obj.x = 11   // -> change published in background

    });

});
```

Any other user can subscribe to the shared object:

```js
// connect to the WAMP router
var hub = new olojs.Hub('ws:\\localhost:8010', 'realm');
hub.connect()
.then(function () {

    // publish the object
    hub.subscribe('path.to.obj')
    .then(function (obj) {

        // obj is a copy of the shared Observable objec
        // any change to obj will be synchronized with all the subscribers
        obj.y = 22   // -> change published in background

    });

});
```

The Observable object changes, both made locally or remotely, can be watched as follows:

```js
new olojs.Subscription(obj, function (change) {
    // this function gets called every time obj changes
});
```


## Installation
On NodeJs:
```
npm install olojs
```

In the browser:
```
<script src="olojs/dist/browser.js"></script>
<!-- the global object olojs is now available in the browser -->
```

In order to publish and subscribe objects, you need a WAMP Router to connect to. The tested and suggested option is [crossbar](http://crossbar.io).


## Documentation
The documentation is available in the [wiki][].


## License
MIT - Copyright (c) 2016 Marcello Del Buono (m.delbuono@gmail.com)



[WAMP]: https://en.wikipedia.org/wiki/Web_Application_Messaging_Protocol

[wiki]: https://github.com/onlabsorg/olojs/wiki
[olojs.deep]: https://github.com/onlabsorg/olojs/wiki/olojs.deep
[olojs.deep.Path]: https://github.com/onlabsorg/olojs/wiki/olojs.deep#class-path
[olojs.deep.Change]: https://github.com/onlabsorg/olojs/wiki/olojs.deep#class-change
[olojs.deep.equal]: https://github.com/onlabsorg/olojs/wiki/olojs.deep#function-equalobj1-obj2
[olojs.deep.copy]: https://github.com/onlabsorg/olojs/wiki/olojs.deep#function-copyobj
[olojs.deep.diff]: https://github.com/onlabsorg/olojs/wiki/olojs.deep#function-diffoldobj-newobj
[olojs.deep.assign]: https://github.com/onlabsorg/olojs/wiki/olojs.deep#function-assigndest-orig

[olojs.observable]: https://github.com/onlabsorg/olojs/wiki/olojs.observable
[olojs.observable.ObservableObject]: https://github.com/onlabsorg/olojs/wiki/olojs.observable#class-observableobject
[olojs.observable.ObservableArray]: https://github.com/onlabsorg/olojs/wiki/olojs.observable#class-observablearray
[olojs.observable.Observable]: https://github.com/onlabsorg/olojs/wiki/olojs.observable#function-observableobj
[olojs.observable.Subscription]: https://github.com/onlabsorg/olojs/wiki/olojs.observable#class-subscription

[olojs.remote]: https://github.com/onlabsorg/olojs/wiki/olojs.remote
[olojs.remote.hub]: https://github.com/onlabsorg/olojs/wiki/olojs.remote#class-hub




