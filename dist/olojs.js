System.register("src/stores/MemoryStore.js", ["npm:babel-runtime@5.8.38/helpers/get.js", "npm:babel-runtime@5.8.38/helpers/inherits.js", "npm:babel-runtime@5.8.38/helpers/create-class.js", "npm:babel-runtime@5.8.38/helpers/class-call-check.js", "npm:babel-runtime@5.8.38/regenerator.js", "npm:babel-runtime@5.8.38/core-js/object/keys.js", "src/utils.js", "src/Path.js", "src/stores/AbstractStore.js"], function (_export) {
    var _get, _inherits, _createClass, _classCallCheck, _regeneratorRuntime, _Object$keys, utils, Path, AbstractStore, MemoryStore, Document;

    return {
        setters: [function (_npmBabelRuntime5838HelpersGetJs) {
            _get = _npmBabelRuntime5838HelpersGetJs["default"];
        }, function (_npmBabelRuntime5838HelpersInheritsJs) {
            _inherits = _npmBabelRuntime5838HelpersInheritsJs["default"];
        }, function (_npmBabelRuntime5838HelpersCreateClassJs) {
            _createClass = _npmBabelRuntime5838HelpersCreateClassJs["default"];
        }, function (_npmBabelRuntime5838HelpersClassCallCheckJs) {
            _classCallCheck = _npmBabelRuntime5838HelpersClassCallCheckJs["default"];
        }, function (_npmBabelRuntime5838RegeneratorJs) {
            _regeneratorRuntime = _npmBabelRuntime5838RegeneratorJs["default"];
        }, function (_npmBabelRuntime5838CoreJsObjectKeysJs) {
            _Object$keys = _npmBabelRuntime5838CoreJsObjectKeysJs["default"];
        }, function (_srcUtilsJs) {
            utils = _srcUtilsJs["default"];
        }, function (_srcPathJs) {
            Path = _srcPathJs["default"];
        }, function (_srcStoresAbstractStoreJs) {
            AbstractStore = _srcStoresAbstractStoreJs["default"];
        }],
        execute: function () {
            "use strict";

            MemoryStore = (function (_AbstractStore) {
                _inherits(MemoryStore, _AbstractStore);

                function MemoryStore() {
                    _classCallCheck(this, MemoryStore);

                    _get(Object.getPrototypeOf(MemoryStore.prototype), "constructor", this).apply(this, arguments);
                }

                _createClass(MemoryStore, [{
                    key: "connect",
                    value: function connect() {
                        return _regeneratorRuntime.async(function connect$(context$2$0) {
                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    context$2$0.next = 2;
                                    return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(MemoryStore.prototype), "connect", this).call(this));

                                case 2:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }, {
                    key: "disconnect",
                    value: function disconnect() {
                        return _regeneratorRuntime.async(function disconnect$(context$2$0) {
                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    context$2$0.next = 2;
                                    return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(MemoryStore.prototype), "disconnect", this).call(this));

                                case 2:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }], [{
                    key: "protocol",
                    get: function get() {
                        return "memory:";
                    }
                }, {
                    key: "Document",
                    get: function get() {
                        return Document;
                    }
                }]);

                return MemoryStore;
            })(AbstractStore);

            Document = (function (_AbstractStore$Document) {
                _inherits(Document, _AbstractStore$Document);

                function Document() {
                    _classCallCheck(this, Document);

                    _get(Object.getPrototypeOf(Document.prototype), "constructor", this).apply(this, arguments);
                }

                _createClass(Document, [{
                    key: "open",
                    value: function open() {
                        return _regeneratorRuntime.async(function open$(context$2$0) {
                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    this.data = {};
                                    context$2$0.next = 3;
                                    return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(Document.prototype), "open", this).call(this));

                                case 3:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }, {
                    key: "get",
                    value: function get(path) {
                        path = Path.from(path);
                        return path.lookup(this.data);
                    }
                }, {
                    key: "type",
                    value: function type(path) {
                        var value = this.get(path);
                        if (utils.isPlainObject(value)) return "dict";
                        if (utils.isArray(value)) return "list";
                        if (utils.isString(value)) return "text";
                        if (utils.isNumber(value)) return "numb";
                        if (utils.isBoolean(value)) return "bool";
                        return "none";
                    }
                }, {
                    key: "getDictKeys",
                    value: function getDictKeys(path) {
                        var dict = this.get(path);
                        return _Object$keys(dict);
                    }
                }, {
                    key: "setDictItem",
                    value: function setDictItem(path, key, newValue) {
                        var dict = this.get(path);
                        var oldValue = dict[key] !== undefined ? dict[key] : null;
                        dict[key] = newValue;
                        this.dispatch(path, key, oldValue, newValue);
                    }
                }, {
                    key: "removeDictItem",
                    value: function removeDictItem(path, key) {
                        var dict = this.get(path);
                        var oldValue = dict[key] !== undefined ? dict[key] : null;
                        if (oldValue !== null) {
                            delete dict[key];
                            this.dispatch(path, key, oldValue, null);
                        }
                    }
                }, {
                    key: "getListSize",
                    value: function getListSize(path) {
                        var list = this.get(path);
                        return list.length;
                    }
                }, {
                    key: "setListItem",
                    value: function setListItem(path, index, newItem) {
                        var list = this.get(path);
                        var oldItem = list[index] !== undefined ? list[index] : null;
                        list[index] = newItem;
                        this.dispatch(path, index, [oldItem], [newItem]);
                    }
                }, {
                    key: "insertListItems",
                    value: function insertListItems(path, index) {
                        var list = this.get(path);

                        for (var _len = arguments.length, newItems = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                            newItems[_key - 2] = arguments[_key];
                        }

                        list.splice.apply(list, [index, 0].concat(newItems));
                        this.dispatch(path, index, [], newItems);
                    }
                }, {
                    key: "removeListItems",
                    value: function removeListItems(path, index, count) {
                        var list = this.get(path);
                        var oldItems = list.slice(index, index + count);
                        list.splice(index, count);
                        this.dispatch(path, index, oldItems, []);
                    }
                }, {
                    key: "getTextSize",
                    value: function getTextSize(path) {
                        var text = this.get(path);
                        return text.length;
                    }
                }, {
                    key: "insertText",
                    value: function insertText(path, index, subString) {
                        var path = path instanceof Path ? path : new Path(path);
                        var parent = this.get(path.parent);
                        var key = path.leaf;

                        var text = this.get(path);

                        parent[key] = text.slice(0, index) + subString + text.slice(index);

                        this.dispatch(path, index, "", subString);
                    }
                }, {
                    key: "removeText",
                    value: function removeText(path, index, count) {
                        var path = path instanceof Path ? path : new Path(path);
                        var parent = this.get(path.parent);
                        var key = path.leaf;

                        var text = this.get(path);
                        var oldText = text.slice(index, index + count);

                        parent[key] = text.slice(0, index) + text.slice(index + count);

                        this.dispatch(path, index, oldText, "");
                    }
                }]);

                return Document;
            })(AbstractStore.Document);

            _export("default", MemoryStore);
        }
    };
});
System.registerDynamic("npm:core-js@1.2.7/library/modules/es6.object.keys.js", ["npm:core-js@1.2.7/library/modules/$.to-object.js", "npm:core-js@1.2.7/library/modules/$.object-sap.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toObject = $__require('npm:core-js@1.2.7/library/modules/$.to-object.js');
  $__require('npm:core-js@1.2.7/library/modules/$.object-sap.js')('keys', function($keys) {
    return function keys(it) {
      return $keys(toObject(it));
    };
  });
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/fn/object/keys.js", ["npm:core-js@1.2.7/library/modules/es6.object.keys.js", "npm:core-js@1.2.7/library/modules/$.core.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('npm:core-js@1.2.7/library/modules/es6.object.keys.js');
  module.exports = $__require('npm:core-js@1.2.7/library/modules/$.core.js').Object.keys;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/core-js/object/keys.js", ["npm:core-js@1.2.7/library/fn/object/keys.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('npm:core-js@1.2.7/library/fn/object/keys.js'),
    __esModule: true
  };
  return module.exports;
});

System.registerDynamic("npm:sharedb@1.0.0-beta.7/lib/util.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  exports.doNothing = doNothing;
  function doNothing() {}
  exports.hasKeys = function(object) {
    for (var key in object)
      return true;
    return false;
  };
  return module.exports;
});

System.registerDynamic("npm:sharedb@1.0.0-beta.7/lib/client/connection.js", ["npm:sharedb@1.0.0-beta.7/lib/client/doc.js", "npm:sharedb@1.0.0-beta.7/lib/client/query.js", "npm:sharedb@1.0.0-beta.7/lib/emitter.js", "npm:sharedb@1.0.0-beta.7/lib/error.js", "npm:sharedb@1.0.0-beta.7/lib/types.js", "npm:sharedb@1.0.0-beta.7/lib/util.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var Doc = $__require('npm:sharedb@1.0.0-beta.7/lib/client/doc.js');
    var Query = $__require('npm:sharedb@1.0.0-beta.7/lib/client/query.js');
    var emitter = $__require('npm:sharedb@1.0.0-beta.7/lib/emitter.js');
    var ShareDBError = $__require('npm:sharedb@1.0.0-beta.7/lib/error.js');
    var types = $__require('npm:sharedb@1.0.0-beta.7/lib/types.js');
    var util = $__require('npm:sharedb@1.0.0-beta.7/lib/util.js');
    module.exports = Connection;
    function Connection(socket) {
      emitter.EventEmitter.call(this);
      this.collections = {};
      this.nextQueryId = 1;
      this.queries = {};
      this.seq = 1;
      this.id = null;
      this.agent = null;
      this.debug = false;
      this.bindToSocket(socket);
    }
    emitter.mixin(Connection);
    Connection.prototype.bindToSocket = function(socket) {
      if (this.socket) {
        this.socket.close();
        this.socket.onmessage = null;
        this.socket.onopen = null;
        this.socket.onerror = null;
        this.socket.onclose = null;
      }
      this.socket = socket;
      this.state = (socket.readyState === 0 || socket.readyState === 1) ? 'connecting' : 'disconnected';
      this.canSend = false;
      var connection = this;
      socket.onmessage = function(event) {
        try {
          var data = (typeof event.data === 'string') ? JSON.parse(event.data) : event.data;
        } catch (err) {
          console.warn('Failed to parse message', event);
          return;
        }
        if (connection.debug)
          console.log('RECV', JSON.stringify(data));
        var request = {data: data};
        connection.emit('receive', request);
        if (!request.data)
          return;
        try {
          connection.handleMessage(request.data);
        } catch (err) {
          process.nextTick(function() {
            connection.emit('error', err);
          });
        }
      };
      socket.onopen = function() {
        connection._setState('connecting');
      };
      socket.onerror = function(err) {
        connection.emit('connection error', err);
      };
      socket.onclose = function(reason) {
        if (reason === 'closed' || reason === 'Closed') {
          connection._setState('closed', reason);
        } else if (reason === 'stopped' || reason === 'Stopped by server') {
          connection._setState('stopped', reason);
        } else {
          connection._setState('disconnected', reason);
        }
      };
    };
    Connection.prototype.handleMessage = function(message) {
      var err = null;
      if (message.error) {
        err = new Error(message.error.message);
        err.code = message.error.code;
        err.data = message;
        delete message.error;
      }
      switch (message.a) {
        case 'init':
          if (message.protocol !== 1) {
            err = new ShareDBError(4019, 'Invalid protocol version');
            return this.emit('error', err);
          }
          if (types.map[message.type] !== types.defaultType) {
            err = new ShareDBError(4020, 'Invalid default type');
            return this.emit('error', err);
          }
          if (typeof message.id !== 'string') {
            err = new ShareDBError(4021, 'Invalid client id');
            return this.emit('error', err);
          }
          this.id = message.id;
          this._setState('connected');
          return;
        case 'qf':
          var query = this.queries[message.id];
          if (query)
            query._handleFetch(err, message.data, message.extra);
          return;
        case 'qs':
          var query = this.queries[message.id];
          if (query)
            query._handleSubscribe(err, message.data, message.extra);
          return;
        case 'qu':
          return;
        case 'q':
          var query = this.queries[message.id];
          if (!query)
            return;
          if (err)
            return query._handleError(err);
          if (message.diff)
            query._handleDiff(message.diff);
          if (message.hasOwnProperty('extra'))
            query._handleExtra(message.extra);
          return;
        case 'bf':
          return this._handleBulkMessage(message, '_handleFetch');
        case 'bs':
          return this._handleBulkMessage(message, '_handleSubscribe');
        case 'bu':
          return this._handleBulkMessage(message, '_handleUnsubscribe');
        case 'f':
          var doc = this.getExisting(message.c, message.d);
          if (doc)
            doc._handleFetch(err, message.data);
          return;
        case 's':
          var doc = this.getExisting(message.c, message.d);
          if (doc)
            doc._handleSubscribe(err, message.data);
          return;
        case 'u':
          var doc = this.getExisting(message.c, message.d);
          if (doc)
            doc._handleUnsubscribe(err);
          return;
        case 'op':
          var doc = this.getExisting(message.c, message.d);
          if (doc)
            doc._handleOp(err, message);
          return;
        default:
          console.warn('Ignorning unrecognized message', message);
      }
    };
    Connection.prototype._handleBulkMessage = function(message, method) {
      if (message.data) {
        for (var id in message.data) {
          var doc = this.getExisting(message.c, id);
          if (doc)
            doc[method](message.error, message.data[id]);
        }
      } else if (Array.isArray(message.b)) {
        for (var i = 0; i < message.b.length; i++) {
          var id = message.b[i];
          var doc = this.getExisting(message.c, id);
          if (doc)
            doc[method](message.error);
        }
      } else if (message.b) {
        for (var id in message.b) {
          var doc = this.getExisting(message.c, id);
          if (doc)
            doc[method](message.error);
        }
      } else {
        console.error('Invalid bulk message', message);
      }
    };
    Connection.prototype._reset = function() {
      this.seq = 1;
      this.id = null;
      this.agent = null;
    };
    Connection.prototype._setState = function(newState, reason) {
      if (this.state === newState)
        return;
      if ((newState === 'connecting' && this.state !== 'disconnected' && this.state !== 'stopped' && this.state !== 'closed') || (newState === 'connected' && this.state !== 'connecting')) {
        var err = new ShareDBError(5007, 'Cannot transition directly from ' + this.state + ' to ' + newState);
        return this.emit('error', err);
      }
      this.state = newState;
      this.canSend = (newState === 'connected');
      if (newState === 'disconnected' || newState === 'stopped' || newState === 'closed')
        this._reset();
      this.startBulk();
      for (var id in this.queries) {
        var query = this.queries[id];
        query._onConnectionStateChanged();
      }
      for (var collection in this.collections) {
        var docs = this.collections[collection];
        for (var id in docs) {
          docs[id]._onConnectionStateChanged();
        }
      }
      this.endBulk();
      this.emit(newState, reason);
      this.emit('state', newState, reason);
    };
    Connection.prototype.startBulk = function() {
      if (!this.bulk)
        this.bulk = {};
    };
    Connection.prototype.endBulk = function() {
      if (this.bulk) {
        for (var collection in this.bulk) {
          var actions = this.bulk[collection];
          this._sendBulk('f', collection, actions.f);
          this._sendBulk('s', collection, actions.s);
          this._sendBulk('u', collection, actions.u);
        }
      }
      this.bulk = null;
    };
    Connection.prototype._sendBulk = function(action, collection, values) {
      if (!values)
        return;
      var ids = [];
      var versions = {};
      var versionsCount = 0;
      var versionId;
      for (var id in values) {
        var value = values[id];
        if (value == null) {
          ids.push(id);
        } else {
          versions[id] = value;
          versionId = id;
          versionsCount++;
        }
      }
      if (ids.length === 1) {
        var id = ids[0];
        this.send({
          a: action,
          c: collection,
          d: id
        });
      } else if (ids.length) {
        this.send({
          a: 'b' + action,
          c: collection,
          b: ids
        });
      }
      if (versionsCount === 1) {
        var version = versions[versionId];
        this.send({
          a: action,
          c: collection,
          d: versionId,
          v: version
        });
      } else if (versionsCount) {
        this.send({
          a: 'b' + action,
          c: collection,
          b: versions
        });
      }
    };
    Connection.prototype._sendAction = function(action, doc, version) {
      this._addDoc(doc);
      if (this.bulk) {
        var actions = this.bulk[doc.collection] || (this.bulk[doc.collection] = {});
        var versions = actions[action] || (actions[action] = {});
        var isDuplicate = versions.hasOwnProperty(doc.id);
        versions[doc.id] = version;
        return isDuplicate;
      } else {
        var message = {
          a: action,
          c: doc.collection,
          d: doc.id,
          v: version
        };
        this.send(message);
      }
    };
    Connection.prototype.sendFetch = function(doc) {
      return this._sendAction('f', doc, doc.version);
    };
    Connection.prototype.sendSubscribe = function(doc) {
      return this._sendAction('s', doc, doc.version);
    };
    Connection.prototype.sendUnsubscribe = function(doc) {
      return this._sendAction('u', doc);
    };
    Connection.prototype.sendOp = function(doc, op) {
      this._addDoc(doc);
      var message = {
        a: 'op',
        c: doc.collection,
        d: doc.id,
        v: doc.version,
        src: op.src,
        seq: op.seq
      };
      if (op.op)
        message.op = op.op;
      if (op.create)
        message.create = op.create;
      if (op.del)
        message.del = op.del;
      this.send(message);
    };
    Connection.prototype.send = function(message) {
      if (this.debug)
        console.log('SEND', JSON.stringify(message));
      this.emit('send', message);
      this.socket.send(JSON.stringify(message));
    };
    Connection.prototype.close = function() {
      this.socket.close();
    };
    Connection.prototype.getExisting = function(collection, id) {
      if (this.collections[collection])
        return this.collections[collection][id];
    };
    Connection.prototype.get = function(collection, id) {
      var docs = this.collections[collection] || (this.collections[collection] = {});
      var doc = docs[id];
      if (!doc) {
        doc = docs[id] = new Doc(this, collection, id);
        this.emit('doc', doc);
      }
      return doc;
    };
    Connection.prototype._destroyDoc = function(doc) {
      var docs = this.collections[doc.collection];
      if (!docs)
        return;
      delete docs[doc.id];
      if (!util.hasKeys(docs)) {
        delete this.collections[doc.collection];
      }
    };
    Connection.prototype._addDoc = function(doc) {
      var docs = this.collections[doc.collection];
      if (!docs) {
        docs = this.collections[doc.collection] = {};
      }
      if (docs[doc.id] !== doc) {
        docs[doc.id] = doc;
      }
    };
    Connection.prototype._createQuery = function(action, collection, q, options, callback) {
      var id = this.nextQueryId++;
      var query = new Query(action, this, id, collection, q, options, callback);
      this.queries[id] = query;
      query.send();
      return query;
    };
    Connection.prototype._destroyQuery = function(query) {
      delete this.queries[query.id];
    };
    Connection.prototype.createFetchQuery = function(collection, q, options, callback) {
      return this._createQuery('qf', collection, q, options, callback);
    };
    Connection.prototype.createSubscribeQuery = function(collection, q, options, callback) {
      return this._createQuery('qs', collection, q, options, callback);
    };
    Connection.prototype.hasPending = function() {
      return !!(this._firstDoc(hasPending) || this._firstQuery(hasPending));
    };
    function hasPending(object) {
      return object.hasPending();
    }
    Connection.prototype.hasWritePending = function() {
      return !!this._firstDoc(hasWritePending);
    };
    function hasWritePending(object) {
      return object.hasWritePending();
    }
    Connection.prototype.whenNothingPending = function(callback) {
      var doc = this._firstDoc(hasPending);
      if (doc) {
        doc.once('nothing pending', this._nothingPendingRetry(callback));
        return;
      }
      var query = this._firstQuery(hasPending);
      if (query) {
        query.once('ready', this._nothingPendingRetry(callback));
        return;
      }
      process.nextTick(callback);
    };
    Connection.prototype._nothingPendingRetry = function(callback) {
      var connection = this;
      return function() {
        process.nextTick(function() {
          connection.whenNothingPending(callback);
        });
      };
    };
    Connection.prototype._firstDoc = function(fn) {
      for (var collection in this.collections) {
        var docs = this.collections[collection];
        for (var id in docs) {
          var doc = docs[id];
          if (fn(doc)) {
            return doc;
          }
        }
      }
    };
    Connection.prototype._firstQuery = function(fn) {
      for (var id in this.queries) {
        var query = this.queries[id];
        if (fn(query)) {
          return query;
        }
      }
    };
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:sharedb@1.0.0-beta.7/lib/client/doc.js", ["npm:sharedb@1.0.0-beta.7/lib/emitter.js", "npm:sharedb@1.0.0-beta.7/lib/error.js", "npm:sharedb@1.0.0-beta.7/lib/types.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var emitter = $__require('npm:sharedb@1.0.0-beta.7/lib/emitter.js');
    var ShareDBError = $__require('npm:sharedb@1.0.0-beta.7/lib/error.js');
    var types = $__require('npm:sharedb@1.0.0-beta.7/lib/types.js');
    module.exports = Doc;
    function Doc(connection, collection, id) {
      emitter.EventEmitter.call(this);
      this.connection = connection;
      this.collection = collection;
      this.id = id;
      this.version = null;
      this.type = null;
      this.data = undefined;
      this.inflightFetch = [];
      this.inflightSubscribe = [];
      this.inflightUnsubscribe = [];
      this.pendingFetch = [];
      this.subscribed = false;
      this.wantSubscribe = false;
      this.inflightOp = null;
      this.pendingOps = [];
      this.type = null;
      this.applyStack = null;
      this.preventCompose = false;
    }
    emitter.mixin(Doc);
    Doc.prototype.destroy = function(callback) {
      var doc = this;
      doc.whenNothingPending(function() {
        doc.connection._destroyDoc(doc);
        if (doc.wantSubscribe) {
          return doc.unsubscribe(callback);
        }
        if (callback)
          callback();
      });
    };
    Doc.prototype._setType = function(newType) {
      if (typeof newType === 'string') {
        newType = types.map[newType];
      }
      if (newType) {
        this.type = newType;
      } else if (newType === null) {
        this.type = newType;
        this.data = undefined;
      } else {
        var err = new ShareDBError(4008, 'Missing type ' + newType);
        return this.emit('error', err);
      }
    };
    Doc.prototype.ingestSnapshot = function(snapshot, callback) {
      if (!snapshot)
        return callback && callback();
      if (typeof snapshot.v !== 'number') {
        var err = new ShareDBError(5008, 'Missing version in ingested snapshot. ' + this.collection + '.' + this.id);
        if (callback)
          return callback(err);
        return this.emit('error', err);
      }
      if (this.type || this.hasWritePending()) {
        if (this.version == null) {
          if (this.hasWritePending()) {
            return callback && this.once('no write pending', callback);
          }
          var err = new ShareDBError(5009, 'Cannot ingest snapshot in doc with null version. ' + this.collection + '.' + this.id);
          if (callback)
            return callback(err);
          return this.emit('error', err);
        }
        if (snapshot.v > this.version)
          return this.fetch(callback);
        return callback && callback();
      }
      if (this.version > snapshot.v)
        return callback && callback();
      this.version = snapshot.v;
      var type = (snapshot.type === undefined) ? types.defaultType : snapshot.type;
      this._setType(type);
      this.data = (this.type && this.type.deserialize) ? this.type.deserialize(snapshot.data) : snapshot.data;
      this.emit('load');
      callback && callback();
    };
    Doc.prototype.whenNothingPending = function(callback) {
      if (this.hasPending()) {
        this.once('nothing pending', callback);
        return;
      }
      callback();
    };
    Doc.prototype.hasPending = function() {
      return !!(this.inflightOp || this.pendingOps.length || this.inflightFetch.length || this.inflightSubscribe.length || this.inflightUnsubscribe.length || this.pendingFetch.length);
    };
    Doc.prototype.hasWritePending = function() {
      return !!(this.inflightOp || this.pendingOps.length);
    };
    Doc.prototype._emitNothingPending = function() {
      if (this.hasWritePending())
        return;
      this.emit('no write pending');
      if (this.hasPending())
        return;
      this.emit('nothing pending');
    };
    Doc.prototype._emitResponseError = function(err, callback) {
      if (callback) {
        callback(err);
        this._emitNothingPending();
        return;
      }
      this._emitNothingPending();
      this.emit('error', err);
    };
    Doc.prototype._handleFetch = function(err, snapshot) {
      var callback = this.inflightFetch.shift();
      if (err)
        return this._emitResponseError(err, callback);
      this.ingestSnapshot(snapshot, callback);
      this._emitNothingPending();
    };
    Doc.prototype._handleSubscribe = function(err, snapshot) {
      var callback = this.inflightSubscribe.shift();
      if (err)
        return this._emitResponseError(err, callback);
      if (this.wantSubscribe)
        this.subscribed = true;
      this.ingestSnapshot(snapshot, callback);
      this._emitNothingPending();
    };
    Doc.prototype._handleUnsubscribe = function(err) {
      var callback = this.inflightUnsubscribe.shift();
      if (err)
        return this._emitResponseError(err, callback);
      if (callback)
        callback();
      this._emitNothingPending();
    };
    Doc.prototype._handleOp = function(err, message) {
      if (err) {
        if (this.inflightOp) {
          if (err.code === 4002)
            err = null;
          return this._rollback(err);
        }
        return this.emit('error', err);
      }
      if (this.inflightOp && message.src === this.inflightOp.src && message.seq === this.inflightOp.seq) {
        this._opAcknowledged(message);
        return;
      }
      if (this.version == null || message.v > this.version) {
        this.fetch();
        return;
      }
      if (message.v < this.version) {
        return;
      }
      if (this.inflightOp) {
        var transformErr = transformX(this.inflightOp, message);
        if (transformErr)
          return this._hardRollback(transformErr);
      }
      for (var i = 0; i < this.pendingOps.length; i++) {
        var transformErr = transformX(this.pendingOps[i], message);
        if (transformErr)
          return this._hardRollback(transformErr);
      }
      this.version++;
      this._otApply(message, false);
      return;
    };
    Doc.prototype._onConnectionStateChanged = function() {
      if (this.connection.canSend) {
        this.flush();
        this._resubscribe();
      } else {
        if (this.inflightOp) {
          this.pendingOps.unshift(this.inflightOp);
          this.inflightOp = null;
        }
        this.subscribed = false;
        if (this.inflightFetch.length || this.inflightSubscribe.length) {
          this.pendingFetch = this.pendingFetch.concat(this.inflightFetch, this.inflightSubscribe);
          this.inflightFetch.length = 0;
          this.inflightSubscribe.length = 0;
        }
        if (this.inflightUnsubscribe.length) {
          var callbacks = this.inflightUnsubscribe;
          this.inflightUnsubscribe = [];
          callEach(callbacks);
        }
      }
    };
    Doc.prototype._resubscribe = function() {
      var callbacks = this.pendingFetch;
      this.pendingFetch = [];
      if (this.wantSubscribe) {
        if (callbacks.length) {
          this.subscribe(function(err) {
            callEach(callbacks, err);
          });
          return;
        }
        this.subscribe();
        return;
      }
      if (callbacks.length) {
        this.fetch(function(err) {
          callEach(callbacks, err);
        });
      }
    };
    Doc.prototype.fetch = function(callback) {
      if (this.connection.canSend) {
        var isDuplicate = this.connection.sendFetch(this);
        pushActionCallback(this.inflightFetch, isDuplicate, callback);
        return;
      }
      this.pendingFetch.push(callback);
    };
    Doc.prototype.subscribe = function(callback) {
      this.wantSubscribe = true;
      if (this.connection.canSend) {
        var isDuplicate = this.connection.sendSubscribe(this);
        pushActionCallback(this.inflightSubscribe, isDuplicate, callback);
        return;
      }
      this.pendingFetch.push(callback);
    };
    Doc.prototype.unsubscribe = function(callback) {
      this.wantSubscribe = false;
      this.subscribed = false;
      if (this.connection.canSend) {
        var isDuplicate = this.connection.sendUnsubscribe(this);
        pushActionCallback(this.inflightUnsubscribe, isDuplicate, callback);
        return;
      }
      if (callback)
        process.nextTick(callback);
    };
    function pushActionCallback(inflight, isDuplicate, callback) {
      if (isDuplicate) {
        var lastCallback = inflight.pop();
        inflight.push(function(err) {
          lastCallback && lastCallback(err);
          callback && callback(err);
        });
      } else {
        inflight.push(callback);
      }
    }
    Doc.prototype.flush = function() {
      if (!this.connection.canSend || this.inflightOp)
        return;
      if (!this.paused && this.pendingOps.length) {
        this._sendOp();
      }
    };
    function setNoOp(op) {
      delete op.op;
      delete op.create;
      delete op.del;
    }
    function transformX(client, server) {
      if (client.del)
        return setNoOp(server);
      if (server.del) {
        return new ShareDBError(4017, 'Document was deleted');
      }
      if (server.create) {
        return new ShareDBError(4018, 'Document alredy created');
      }
      if (!server.op)
        return;
      if (client.create) {
        return new ShareDBError(4018, 'Document already created');
      }
      if (client.type.transformX) {
        var result = client.type.transformX(client.op, server.op);
        client.op = result[0];
        server.op = result[1];
      } else {
        var clientOp = client.type.transform(client.op, server.op, 'left');
        var serverOp = client.type.transform(server.op, client.op, 'right');
        client.op = clientOp;
        server.op = serverOp;
      }
    }
    ;
    Doc.prototype._otApply = function(op, source) {
      if (op.op) {
        if (!this.type) {
          var err = new ShareDBError(4015, 'Cannot apply op to uncreated document. ' + this.collection + '.' + this.id);
          return this.emit('error', err);
        }
        if (!source && this.type === types.defaultType && op.op.length > 1) {
          if (!this.applyStack)
            this.applyStack = [];
          var stackLength = this.applyStack.length;
          for (var i = 0; i < op.op.length; i++) {
            var component = op.op[i];
            var componentOp = {op: [component]};
            for (var j = stackLength; j < this.applyStack.length; j++) {
              var transformErr = transformX(this.applyStack[j], componentOp);
              if (transformErr)
                return this._hardRollback(transformErr);
            }
            this.emit('before op', componentOp.op, source);
            this.data = this.type.apply(this.data, componentOp.op);
            this.emit('op', componentOp.op, source);
          }
          this._popApplyStack(stackLength);
          return;
        }
        this.emit('before op', op.op, source);
        this.data = this.type.apply(this.data, op.op);
        this.emit('op', op.op, source);
        return;
      }
      if (op.create) {
        this._setType(op.create.type);
        this.data = (this.type.deserialize) ? (this.type.createDeserialized) ? this.type.createDeserialized(op.create.data) : this.type.deserialize(this.type.create(op.create.data)) : this.type.create(op.create.data);
        this.emit('create', source);
        return;
      }
      if (op.del) {
        var oldData = this.data;
        this._setType(null);
        this.emit('del', oldData, source);
        return;
      }
    };
    Doc.prototype._sendOp = function() {
      var src = this.connection.id;
      if (!src)
        return;
      if (!this.inflightOp) {
        this.inflightOp = this.pendingOps.shift();
      }
      var op = this.inflightOp;
      if (!op) {
        var err = new ShareDBError(5010, 'No op to send on call to _sendOp');
        return this.emit('error', err);
      }
      op.sentAt = Date.now();
      op.retries = (op.retries == null) ? 0 : op.retries + 1;
      if (op.seq == null)
        op.seq = this.connection.seq++;
      this.connection.sendOp(this, op);
      if (op.src == null)
        op.src = src;
    };
    Doc.prototype._submit = function(op, source, callback) {
      if (!source)
        source = true;
      if (op.op) {
        if (!this.type) {
          var err = new ShareDBError(4015, 'Cannot submit op. Document has not been created. ' + this.collection + '.' + this.id);
          if (callback)
            return callback(err);
          return this.emit('error', err);
        }
        if (this.type.normalize)
          op.op = this.type.normalize(op.op);
      }
      this._pushOp(op, callback);
      this._otApply(op, source);
      var doc = this;
      process.nextTick(function() {
        doc.flush();
      });
    };
    Doc.prototype._pushOp = function(op, callback) {
      if (this.applyStack) {
        this.applyStack.push(op);
      } else {
        var composed = this._tryCompose(op);
        if (composed) {
          composed.callbacks.push(callback);
          return;
        }
      }
      op.type = this.type;
      op.callbacks = [callback];
      this.pendingOps.push(op);
    };
    Doc.prototype._popApplyStack = function(to) {
      if (to > 0) {
        this.applyStack.length = to;
        return;
      }
      var op = this.applyStack[0];
      this.applyStack = null;
      if (!op)
        return;
      var i = this.pendingOps.indexOf(op);
      if (i === -1)
        return;
      var ops = this.pendingOps.splice(i);
      for (var i = 0; i < ops.length; i++) {
        var op = ops[i];
        var composed = this._tryCompose(op);
        if (composed) {
          composed.callbacks = composed.callbacks.concat(op.callbacks);
        } else {
          this.pendingOps.push(op);
        }
      }
    };
    Doc.prototype._tryCompose = function(op) {
      if (this.preventCompose)
        return;
      var last = this.pendingOps[this.pendingOps.length - 1];
      if (!last)
        return;
      if (last.create && op.op) {
        last.create.data = this.type.apply(last.create.data, op.op);
        return last;
      }
      if (last.op && op.op && this.type.compose) {
        last.op = this.type.compose(last.op, op.op);
        return last;
      }
    };
    Doc.prototype.submitOp = function(component, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }
      var op = {op: component};
      var source = options && options.source;
      this._submit(op, source, callback);
    };
    Doc.prototype.create = function(data, type, options, callback) {
      if (typeof type === 'function') {
        callback = type;
        options = null;
        type = null;
      } else if (typeof options === 'function') {
        callback = options;
        options = null;
      }
      if (!type) {
        type = types.defaultType.uri;
      }
      if (this.type) {
        var err = new ShareDBError(4016, 'Document already exists');
        if (callback)
          return callback(err);
        return this.emit('error', err);
      }
      var op = {create: {
          type: type,
          data: data
        }};
      var source = options && options.source;
      this._submit(op, source, callback);
    };
    Doc.prototype.del = function(options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = null;
      }
      if (!this.type) {
        var err = new ShareDBError(4015, 'Document does not exist');
        if (callback)
          return callback(err);
        return this.emit('error', err);
      }
      var op = {del: true};
      var source = options && options.source;
      this._submit(op, source, callback);
    };
    Doc.prototype.pause = function() {
      this.paused = true;
    };
    Doc.prototype.resume = function() {
      this.paused = false;
      this.flush();
    };
    Doc.prototype._opAcknowledged = function(message) {
      if (this.inflightOp.create) {
        this.version = message.v;
      } else if (message.v !== this.version) {
        console.warn('Invalid version from server. Expected: ' + this.version + ' Received: ' + message.v, message);
        return this.fetch();
      }
      this.version++;
      this._clearInflightOp();
    };
    Doc.prototype._rollback = function(err) {
      var op = this.inflightOp;
      if (op.op && op.type.invert) {
        op.op = op.type.invert(op.op);
        for (var i = 0; i < this.pendingOps.length; i++) {
          var transformErr = transformX(this.pendingOps[i], op);
          if (transformErr)
            return this._hardRollback(transformErr);
        }
        this._otApply(op, false);
        this._clearInflightOp(err);
        return;
      }
      this._hardRollback(err);
    };
    Doc.prototype._hardRollback = function(err) {
      var op = this.inflightOp;
      var pending = this.pendingOps;
      this._setType(null);
      this.version = null;
      this.inflightOp = null;
      this.pendingOps = [];
      var doc = this;
      this.fetch(function() {
        var called = op && callEach(op.callbacks, err);
        for (var i = 0; i < pending.length; i++) {
          callEach(pending[i].callbacks, err);
        }
        if (err && !called)
          return doc.emit('error', err);
      });
    };
    Doc.prototype._clearInflightOp = function(err) {
      var called = callEach(this.inflightOp.callbacks, err);
      this.inflightOp = null;
      this.flush();
      this._emitNothingPending();
      if (err && !called)
        return this.emit('error', err);
    };
    function callEach(callbacks, err) {
      var called = false;
      for (var i = 0; i < callbacks.length; i++) {
        var callback = callbacks[i];
        if (callback) {
          callback(err);
          called = true;
        }
      }
      return called;
    }
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:make-error@1.2.1/index.js", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var defineProperty = Object.defineProperty;
  var captureStackTrace = Error.captureStackTrace;
  if (!captureStackTrace) {
    captureStackTrace = function captureStackTrace(error) {
      var container = new Error();
      defineProperty(error, 'stack', {
        configurable: true,
        get: function getStack() {
          var stack = container.stack;
          defineProperty(this, 'stack', {value: stack});
          return stack;
        },
        set: function setStack(stack) {
          defineProperty(error, 'stack', {
            configurable: true,
            value: stack,
            writable: true
          });
        }
      });
    };
  }
  function BaseError(message) {
    if (message) {
      defineProperty(this, 'message', {
        configurable: true,
        value: message,
        writable: true
      });
    }
    var cname = this.constructor.name;
    if (cname && cname !== this.name) {
      defineProperty(this, 'name', {
        configurable: true,
        value: cname,
        writable: true
      });
    }
    captureStackTrace(this, this.constructor);
  }
  BaseError.prototype = Object.create(Error.prototype, {constructor: {
      configurable: true,
      value: BaseError,
      writable: true
    }});
  var setFunctionName = (function() {
    function setFunctionName(fn, name) {
      return defineProperty(fn, 'name', {
        configurable: true,
        value: name
      });
    }
    try {
      var f = function() {};
      setFunctionName(f, 'foo');
      if (f.name === 'foo') {
        return setFunctionName;
      }
    } catch (_) {}
  })();
  function makeError(constructor, super_) {
    if (super_ == null || super_ === Error) {
      super_ = BaseError;
    } else if (typeof super_ !== 'function') {
      throw new TypeError('super_ should be a function');
    }
    var name;
    if (typeof constructor === 'string') {
      name = constructor;
      constructor = function() {
        super_.apply(this, arguments);
      };
      if (setFunctionName) {
        setFunctionName(constructor, name);
        name = null;
      }
    } else if (typeof constructor !== 'function') {
      throw new TypeError('constructor should be either a string or a function');
    }
    constructor.super_ = constructor['super'] = super_;
    var properties = {constructor: {
        configurable: true,
        value: constructor,
        writable: true
      }};
    if (name != null) {
      properties.name = {
        configurable: true,
        value: name,
        writable: true
      };
    }
    constructor.prototype = Object.create(super_.prototype, properties);
    return constructor;
  }
  exports = module.exports = makeError;
  exports.BaseError = BaseError;
  return module.exports;
});

System.registerDynamic("npm:make-error@1.2.1.js", ["npm:make-error@1.2.1/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:make-error@1.2.1/index.js');
  return module.exports;
});

System.registerDynamic("npm:sharedb@1.0.0-beta.7/lib/error.js", ["npm:make-error@1.2.1.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var makeError = $__require('npm:make-error@1.2.1.js');
  function ShareDBError(code, message) {
    ShareDBError.super.call(this, message);
    this.code = code;
  }
  makeError(ShareDBError);
  module.exports = ShareDBError;
  return module.exports;
});

System.registerDynamic("npm:events@1.0.2/events.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function EventEmitter() {
    this._events = this._events || {};
    this._maxListeners = this._maxListeners || undefined;
  }
  module.exports = EventEmitter;
  EventEmitter.EventEmitter = EventEmitter;
  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._maxListeners = undefined;
  EventEmitter.defaultMaxListeners = 10;
  EventEmitter.prototype.setMaxListeners = function(n) {
    if (!isNumber(n) || n < 0 || isNaN(n))
      throw TypeError('n must be a positive number');
    this._maxListeners = n;
    return this;
  };
  EventEmitter.prototype.emit = function(type) {
    var er,
        handler,
        len,
        args,
        i,
        listeners;
    if (!this._events)
      this._events = {};
    if (type === 'error') {
      if (!this._events.error || (isObject(this._events.error) && !this._events.error.length)) {
        er = arguments[1];
        if (er instanceof Error) {
          throw er;
        }
        throw TypeError('Uncaught, unspecified "error" event.');
      }
    }
    handler = this._events[type];
    if (isUndefined(handler))
      return false;
    if (isFunction(handler)) {
      switch (arguments.length) {
        case 1:
          handler.call(this);
          break;
        case 2:
          handler.call(this, arguments[1]);
          break;
        case 3:
          handler.call(this, arguments[1], arguments[2]);
          break;
        default:
          len = arguments.length;
          args = new Array(len - 1);
          for (i = 1; i < len; i++)
            args[i - 1] = arguments[i];
          handler.apply(this, args);
      }
    } else if (isObject(handler)) {
      len = arguments.length;
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      listeners = handler.slice();
      len = listeners.length;
      for (i = 0; i < len; i++)
        listeners[i].apply(this, args);
    }
    return true;
  };
  EventEmitter.prototype.addListener = function(type, listener) {
    var m;
    if (!isFunction(listener))
      throw TypeError('listener must be a function');
    if (!this._events)
      this._events = {};
    if (this._events.newListener)
      this.emit('newListener', type, isFunction(listener.listener) ? listener.listener : listener);
    if (!this._events[type])
      this._events[type] = listener;
    else if (isObject(this._events[type]))
      this._events[type].push(listener);
    else
      this._events[type] = [this._events[type], listener];
    if (isObject(this._events[type]) && !this._events[type].warned) {
      var m;
      if (!isUndefined(this._maxListeners)) {
        m = this._maxListeners;
      } else {
        m = EventEmitter.defaultMaxListeners;
      }
      if (m && m > 0 && this._events[type].length > m) {
        this._events[type].warned = true;
        console.error('(node) warning: possible EventEmitter memory ' + 'leak detected. %d listeners added. ' + 'Use emitter.setMaxListeners() to increase limit.', this._events[type].length);
        if (typeof console.trace === 'function') {
          console.trace();
        }
      }
    }
    return this;
  };
  EventEmitter.prototype.on = EventEmitter.prototype.addListener;
  EventEmitter.prototype.once = function(type, listener) {
    if (!isFunction(listener))
      throw TypeError('listener must be a function');
    var fired = false;
    function g() {
      this.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(this, arguments);
      }
    }
    g.listener = listener;
    this.on(type, g);
    return this;
  };
  EventEmitter.prototype.removeListener = function(type, listener) {
    var list,
        position,
        length,
        i;
    if (!isFunction(listener))
      throw TypeError('listener must be a function');
    if (!this._events || !this._events[type])
      return this;
    list = this._events[type];
    length = list.length;
    position = -1;
    if (list === listener || (isFunction(list.listener) && list.listener === listener)) {
      delete this._events[type];
      if (this._events.removeListener)
        this.emit('removeListener', type, listener);
    } else if (isObject(list)) {
      for (i = length; i-- > 0; ) {
        if (list[i] === listener || (list[i].listener && list[i].listener === listener)) {
          position = i;
          break;
        }
      }
      if (position < 0)
        return this;
      if (list.length === 1) {
        list.length = 0;
        delete this._events[type];
      } else {
        list.splice(position, 1);
      }
      if (this._events.removeListener)
        this.emit('removeListener', type, listener);
    }
    return this;
  };
  EventEmitter.prototype.removeAllListeners = function(type) {
    var key,
        listeners;
    if (!this._events)
      return this;
    if (!this._events.removeListener) {
      if (arguments.length === 0)
        this._events = {};
      else if (this._events[type])
        delete this._events[type];
      return this;
    }
    if (arguments.length === 0) {
      for (key in this._events) {
        if (key === 'removeListener')
          continue;
        this.removeAllListeners(key);
      }
      this.removeAllListeners('removeListener');
      this._events = {};
      return this;
    }
    listeners = this._events[type];
    if (isFunction(listeners)) {
      this.removeListener(type, listeners);
    } else {
      while (listeners.length)
        this.removeListener(type, listeners[listeners.length - 1]);
    }
    delete this._events[type];
    return this;
  };
  EventEmitter.prototype.listeners = function(type) {
    var ret;
    if (!this._events || !this._events[type])
      ret = [];
    else if (isFunction(this._events[type]))
      ret = [this._events[type]];
    else
      ret = this._events[type].slice();
    return ret;
  };
  EventEmitter.listenerCount = function(emitter, type) {
    var ret;
    if (!emitter._events || !emitter._events[type])
      ret = 0;
    else if (isFunction(emitter._events[type]))
      ret = 1;
    else
      ret = emitter._events[type].length;
    return ret;
  };
  function isFunction(arg) {
    return typeof arg === 'function';
  }
  function isNumber(arg) {
    return typeof arg === 'number';
  }
  function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
  }
  function isUndefined(arg) {
    return arg === void 0;
  }
  return module.exports;
});

System.registerDynamic("npm:events@1.0.2.js", ["npm:events@1.0.2/events.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:events@1.0.2/events.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-events@0.1.1/index.js", ["npm:events@1.0.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = System._nodeRequire ? System._nodeRequire('events') : $__require('npm:events@1.0.2.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-events@0.1.1.js", ["github:jspm/nodelibs-events@0.1.1/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('github:jspm/nodelibs-events@0.1.1/index.js');
  return module.exports;
});

System.registerDynamic("npm:sharedb@1.0.0-beta.7/lib/emitter.js", ["github:jspm/nodelibs-events@0.1.1.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var EventEmitter = $__require('github:jspm/nodelibs-events@0.1.1.js').EventEmitter;
  exports.EventEmitter = EventEmitter;
  exports.mixin = mixin;
  function mixin(Constructor) {
    for (var key in EventEmitter.prototype) {
      Constructor.prototype[key] = EventEmitter.prototype[key];
    }
  }
  return module.exports;
});

System.registerDynamic("npm:sharedb@1.0.0-beta.7/lib/client/query.js", ["npm:sharedb@1.0.0-beta.7/lib/emitter.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var emitter = $__require('npm:sharedb@1.0.0-beta.7/lib/emitter.js');
    module.exports = Query;
    function Query(action, connection, id, collection, query, options, callback) {
      emitter.EventEmitter.call(this);
      this.action = action;
      this.connection = connection;
      this.id = id;
      this.collection = collection;
      this.query = query;
      this.results = null;
      if (options && options.results) {
        this.results = options.results;
        delete options.results;
      }
      this.extra = undefined;
      this.options = options;
      this.callback = callback;
      this.ready = false;
      this.sent = false;
    }
    emitter.mixin(Query);
    Query.prototype.hasPending = function() {
      return !this.ready;
    };
    Query.prototype.send = function() {
      if (!this.connection.canSend)
        return;
      var message = {
        a: this.action,
        id: this.id,
        c: this.collection,
        q: this.query
      };
      if (this.options) {
        message.o = this.options;
      }
      if (this.results) {
        var results = [];
        for (var i = 0; i < this.results.length; i++) {
          var doc = this.results[i];
          results.push([doc.id, doc.version]);
        }
        message.r = results;
      }
      this.connection.send(message);
      this.sent = true;
    };
    Query.prototype.destroy = function(callback) {
      if (this.connection.canSend && this.action === 'qs') {
        this.connection.send({
          a: 'qu',
          id: this.id
        });
      }
      this.connection._destroyQuery(this);
      if (callback)
        process.nextTick(callback);
    };
    Query.prototype._onConnectionStateChanged = function() {
      if (this.connection.canSend && !this.sent) {
        this.send();
      } else {
        this.sent = false;
      }
    };
    Query.prototype._handleFetch = function(err, data, extra) {
      this.connection._destroyQuery(this);
      this._handleResponse(err, data, extra);
    };
    Query.prototype._handleSubscribe = function(err, data, extra) {
      this._handleResponse(err, data, extra);
    };
    Query.prototype._handleResponse = function(err, data, extra) {
      var callback = this.callback;
      this.callback = null;
      if (err)
        return this._finishResponse(err, callback);
      if (!data)
        return this._finishResponse(null, callback);
      var query = this;
      var wait = 1;
      var finish = function(err) {
        if (err)
          return query._finishResponse(err, callback);
        if (--wait)
          return;
        query._finishResponse(null, callback);
      };
      if (Array.isArray(data)) {
        wait += data.length;
        this.results = this._ingestSnapshots(data, finish);
        this.extra = extra;
      } else {
        for (var id in data) {
          wait++;
          var snapshot = data[id];
          var doc = this.connection.get(snapshot.c || this.collection, id);
          doc.ingestSnapshot(snapshot, finish);
        }
      }
      finish();
    };
    Query.prototype._ingestSnapshots = function(snapshots, finish) {
      var results = [];
      for (var i = 0; i < snapshots.length; i++) {
        var snapshot = snapshots[i];
        var doc = this.connection.get(snapshot.c || this.collection, snapshot.d);
        doc.ingestSnapshot(snapshot, finish);
        results.push(doc);
      }
      return results;
    };
    Query.prototype._finishResponse = function(err, callback) {
      this.emit('ready');
      this.ready = true;
      if (err) {
        this.connection._destroyQuery(this);
        if (callback)
          return callback(err);
        return this.emit('error', err);
      }
      if (callback)
        callback(null, this.results, this.extra);
    };
    Query.prototype._handleError = function(err) {
      this.emit('error', err);
    };
    Query.prototype._handleDiff = function(diff) {
      for (var i = 0; i < diff.length; i++) {
        var d = diff[i];
        if (d.type === 'insert')
          d.values = this._ingestSnapshots(d.values);
      }
      for (var i = 0; i < diff.length; i++) {
        var d = diff[i];
        switch (d.type) {
          case 'insert':
            var newDocs = d.values;
            Array.prototype.splice.apply(this.results, [d.index, 0].concat(newDocs));
            this.emit('insert', newDocs, d.index);
            break;
          case 'remove':
            var howMany = d.howMany || 1;
            var removed = this.results.splice(d.index, howMany);
            this.emit('remove', removed, d.index);
            break;
          case 'move':
            var howMany = d.howMany || 1;
            var docs = this.results.splice(d.from, howMany);
            Array.prototype.splice.apply(this.results, [d.to, 0].concat(docs));
            this.emit('move', docs, d.from, d.to);
            break;
        }
      }
      this.emit('changed', this.results);
    };
    Query.prototype._handleExtra = function(extra) {
      this.extra = extra;
      this.emit('extra', extra);
    };
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:ot-json0@1.0.1/lib/bootstrapTransform.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = bootstrapTransform;
  function bootstrapTransform(type, transformComponent, checkValidOp, append) {
    var transformComponentX = function(left, right, destLeft, destRight) {
      transformComponent(destLeft, left, right, 'left');
      transformComponent(destRight, right, left, 'right');
    };
    var transformX = type.transformX = function(leftOp, rightOp) {
      checkValidOp(leftOp);
      checkValidOp(rightOp);
      var newRightOp = [];
      for (var i = 0; i < rightOp.length; i++) {
        var rightComponent = rightOp[i];
        var newLeftOp = [];
        var k = 0;
        while (k < leftOp.length) {
          var nextC = [];
          transformComponentX(leftOp[k], rightComponent, newLeftOp, nextC);
          k++;
          if (nextC.length === 1) {
            rightComponent = nextC[0];
          } else if (nextC.length === 0) {
            for (var j = k; j < leftOp.length; j++) {
              append(newLeftOp, leftOp[j]);
            }
            rightComponent = null;
            break;
          } else {
            var pair = transformX(leftOp.slice(k), nextC);
            for (var l = 0; l < pair[0].length; l++) {
              append(newLeftOp, pair[0][l]);
            }
            for (var r = 0; r < pair[1].length; r++) {
              append(newRightOp, pair[1][r]);
            }
            rightComponent = null;
            break;
          }
        }
        if (rightComponent != null) {
          append(newRightOp, rightComponent);
        }
        leftOp = newLeftOp;
      }
      return [leftOp, newRightOp];
    };
    type.transform = function(op, otherOp, type) {
      if (!(type === 'left' || type === 'right'))
        throw new Error("type must be 'left' or 'right'");
      if (otherOp.length === 0)
        return op;
      if (op.length === 1 && otherOp.length === 1)
        return transformComponent([], op[0], otherOp[0], type);
      if (type === 'left')
        return transformX(op, otherOp)[0];
      else
        return transformX(otherOp, op)[1];
    };
  }
  ;
  return module.exports;
});

System.registerDynamic("npm:ot-json0@1.0.1/lib/text0.js", ["npm:ot-json0@1.0.1/lib/bootstrapTransform.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var text = module.exports = {
    name: 'text0',
    uri: 'http://sharejs.org/types/textv0',
    create: function(initial) {
      if ((initial != null) && typeof initial !== 'string') {
        throw new Error('Initial data must be a string');
      }
      return initial || '';
    }
  };
  var strInject = function(s1, pos, s2) {
    return s1.slice(0, pos) + s2 + s1.slice(pos);
  };
  var checkValidComponent = function(c) {
    if (typeof c.p !== 'number')
      throw new Error('component missing position field');
    if ((typeof c.i === 'string') === (typeof c.d === 'string'))
      throw new Error('component needs an i or d field');
    if (c.p < 0)
      throw new Error('position cannot be negative');
  };
  var checkValidOp = function(op) {
    for (var i = 0; i < op.length; i++) {
      checkValidComponent(op[i]);
    }
  };
  text.apply = function(snapshot, op) {
    var deleted;
    checkValidOp(op);
    for (var i = 0; i < op.length; i++) {
      var component = op[i];
      if (component.i != null) {
        snapshot = strInject(snapshot, component.p, component.i);
      } else {
        deleted = snapshot.slice(component.p, component.p + component.d.length);
        if (component.d !== deleted)
          throw new Error("Delete component '" + component.d + "' does not match deleted text '" + deleted + "'");
        snapshot = snapshot.slice(0, component.p) + snapshot.slice(component.p + component.d.length);
      }
    }
    return snapshot;
  };
  var append = text._append = function(newOp, c) {
    if (c.i === '' || c.d === '')
      return;
    if (newOp.length === 0) {
      newOp.push(c);
    } else {
      var last = newOp[newOp.length - 1];
      if (last.i != null && c.i != null && last.p <= c.p && c.p <= last.p + last.i.length) {
        newOp[newOp.length - 1] = {
          i: strInject(last.i, c.p - last.p, c.i),
          p: last.p
        };
      } else if (last.d != null && c.d != null && c.p <= last.p && last.p <= c.p + c.d.length) {
        newOp[newOp.length - 1] = {
          d: strInject(c.d, last.p - c.p, last.d),
          p: c.p
        };
      } else {
        newOp.push(c);
      }
    }
  };
  text.compose = function(op1, op2) {
    checkValidOp(op1);
    checkValidOp(op2);
    var newOp = op1.slice();
    for (var i = 0; i < op2.length; i++) {
      append(newOp, op2[i]);
    }
    return newOp;
  };
  text.normalize = function(op) {
    var newOp = [];
    if (op.i != null || op.p != null)
      op = [op];
    for (var i = 0; i < op.length; i++) {
      var c = op[i];
      if (c.p == null)
        c.p = 0;
      append(newOp, c);
    }
    return newOp;
  };
  var transformPosition = function(pos, c, insertAfter) {
    if (c.i != null) {
      if (c.p < pos || (c.p === pos && insertAfter)) {
        return pos + c.i.length;
      } else {
        return pos;
      }
    } else {
      if (pos <= c.p) {
        return pos;
      } else if (pos <= c.p + c.d.length) {
        return c.p;
      } else {
        return pos - c.d.length;
      }
    }
  };
  text.transformCursor = function(position, op, side) {
    var insertAfter = side === 'right';
    for (var i = 0; i < op.length; i++) {
      position = transformPosition(position, op[i], insertAfter);
    }
    return position;
  };
  var transformComponent = text._tc = function(dest, c, otherC, side) {
    checkValidComponent(c);
    checkValidComponent(otherC);
    if (c.i != null) {
      append(dest, {
        i: c.i,
        p: transformPosition(c.p, otherC, side === 'right')
      });
    } else {
      if (otherC.i != null) {
        var s = c.d;
        if (c.p < otherC.p) {
          append(dest, {
            d: s.slice(0, otherC.p - c.p),
            p: c.p
          });
          s = s.slice(otherC.p - c.p);
        }
        if (s !== '')
          append(dest, {
            d: s,
            p: c.p + otherC.i.length
          });
      } else {
        if (c.p >= otherC.p + otherC.d.length)
          append(dest, {
            d: c.d,
            p: c.p - otherC.d.length
          });
        else if (c.p + c.d.length <= otherC.p)
          append(dest, c);
        else {
          var newC = {
            d: '',
            p: c.p
          };
          if (c.p < otherC.p)
            newC.d = c.d.slice(0, otherC.p - c.p);
          if (c.p + c.d.length > otherC.p + otherC.d.length)
            newC.d += c.d.slice(otherC.p + otherC.d.length - c.p);
          var intersectStart = Math.max(c.p, otherC.p);
          var intersectEnd = Math.min(c.p + c.d.length, otherC.p + otherC.d.length);
          var cIntersect = c.d.slice(intersectStart - c.p, intersectEnd - c.p);
          var otherIntersect = otherC.d.slice(intersectStart - otherC.p, intersectEnd - otherC.p);
          if (cIntersect !== otherIntersect)
            throw new Error('Delete ops delete different text in the same region of the document');
          if (newC.d !== '') {
            newC.p = transformPosition(newC.p, otherC);
            append(dest, newC);
          }
        }
      }
    }
    return dest;
  };
  var invertComponent = function(c) {
    return (c.i != null) ? {
      d: c.i,
      p: c.p
    } : {
      i: c.d,
      p: c.p
    };
  };
  text.invert = function(op) {
    op = op.slice().reverse();
    for (var i = 0; i < op.length; i++) {
      op[i] = invertComponent(op[i]);
    }
    return op;
  };
  $__require('npm:ot-json0@1.0.1/lib/bootstrapTransform.js')(text, transformComponent, checkValidOp, append);
  return module.exports;
});

System.registerDynamic("npm:ot-json0@1.0.1/lib/json0.js", ["npm:ot-json0@1.0.1/lib/bootstrapTransform.js", "npm:ot-json0@1.0.1/lib/text0.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var isArray = function(obj) {
    return Object.prototype.toString.call(obj) == '[object Array]';
  };
  var isObject = function(obj) {
    return (!!obj) && (obj.constructor === Object);
  };
  var clone = function(o) {
    return JSON.parse(JSON.stringify(o));
  };
  var json = {
    name: 'json0',
    uri: 'http://sharejs.org/types/JSONv0'
  };
  var subtypes = {};
  json.registerSubtype = function(subtype) {
    subtypes[subtype.name] = subtype;
  };
  json.create = function(data) {
    return data === undefined ? null : clone(data);
  };
  json.invertComponent = function(c) {
    var c_ = {p: c.p};
    if (c.t && subtypes[c.t]) {
      c_.t = c.t;
      c_.o = subtypes[c.t].invert(c.o);
    }
    if (c.si !== void 0)
      c_.sd = c.si;
    if (c.sd !== void 0)
      c_.si = c.sd;
    if (c.oi !== void 0)
      c_.od = c.oi;
    if (c.od !== void 0)
      c_.oi = c.od;
    if (c.li !== void 0)
      c_.ld = c.li;
    if (c.ld !== void 0)
      c_.li = c.ld;
    if (c.na !== void 0)
      c_.na = -c.na;
    if (c.lm !== void 0) {
      c_.lm = c.p[c.p.length - 1];
      c_.p = c.p.slice(0, c.p.length - 1).concat([c.lm]);
    }
    return c_;
  };
  json.invert = function(op) {
    var op_ = op.slice().reverse();
    var iop = [];
    for (var i = 0; i < op_.length; i++) {
      iop.push(json.invertComponent(op_[i]));
    }
    return iop;
  };
  json.checkValidOp = function(op) {
    for (var i = 0; i < op.length; i++) {
      if (!isArray(op[i].p))
        throw new Error('Missing path');
    }
  };
  json.checkList = function(elem) {
    if (!isArray(elem))
      throw new Error('Referenced element not a list');
  };
  json.checkObj = function(elem) {
    if (!isObject(elem)) {
      throw new Error("Referenced element not an object (it was " + JSON.stringify(elem) + ")");
    }
  };
  function convertFromText(c) {
    c.t = 'text0';
    var o = {p: c.p.pop()};
    if (c.si != null)
      o.i = c.si;
    if (c.sd != null)
      o.d = c.sd;
    c.o = [o];
  }
  function convertToText(c) {
    c.p.push(c.o[0].p);
    if (c.o[0].i != null)
      c.si = c.o[0].i;
    if (c.o[0].d != null)
      c.sd = c.o[0].d;
    delete c.t;
    delete c.o;
  }
  json.apply = function(snapshot, op) {
    json.checkValidOp(op);
    op = clone(op);
    var container = {data: snapshot};
    for (var i = 0; i < op.length; i++) {
      var c = op[i];
      if (c.si != null || c.sd != null)
        convertFromText(c);
      var parent = null;
      var parentKey = null;
      var elem = container;
      var key = 'data';
      for (var j = 0; j < c.p.length; j++) {
        var p = c.p[j];
        parent = elem;
        parentKey = key;
        elem = elem[key];
        key = p;
        if (parent == null)
          throw new Error('Path invalid');
      }
      if (c.t && c.o !== void 0 && subtypes[c.t]) {
        elem[key] = subtypes[c.t].apply(elem[key], c.o);
      } else if (c.na !== void 0) {
        if (typeof elem[key] != 'number')
          throw new Error('Referenced element not a number');
        elem[key] += c.na;
      } else if (c.li !== void 0 && c.ld !== void 0) {
        json.checkList(elem);
        elem[key] = c.li;
      } else if (c.li !== void 0) {
        json.checkList(elem);
        elem.splice(key, 0, c.li);
      } else if (c.ld !== void 0) {
        json.checkList(elem);
        elem.splice(key, 1);
      } else if (c.lm !== void 0) {
        json.checkList(elem);
        if (c.lm != key) {
          var e = elem[key];
          elem.splice(key, 1);
          elem.splice(c.lm, 0, e);
        }
      } else if (c.oi !== void 0) {
        json.checkObj(elem);
        elem[key] = c.oi;
      } else if (c.od !== void 0) {
        json.checkObj(elem);
        delete elem[key];
      } else {
        throw new Error('invalid / missing instruction in op');
      }
    }
    return container.data;
  };
  json.shatter = function(op) {
    var results = [];
    for (var i = 0; i < op.length; i++) {
      results.push([op[i]]);
    }
    return results;
  };
  json.incrementalApply = function(snapshot, op, _yield) {
    for (var i = 0; i < op.length; i++) {
      var smallOp = [op[i]];
      snapshot = json.apply(snapshot, smallOp);
      _yield(smallOp, snapshot);
    }
    return snapshot;
  };
  var pathMatches = json.pathMatches = function(p1, p2, ignoreLast) {
    if (p1.length != p2.length)
      return false;
    for (var i = 0; i < p1.length; i++) {
      if (p1[i] !== p2[i] && (!ignoreLast || i !== p1.length - 1))
        return false;
    }
    return true;
  };
  json.append = function(dest, c) {
    c = clone(c);
    if (dest.length === 0) {
      dest.push(c);
      return;
    }
    var last = dest[dest.length - 1];
    if ((c.si != null || c.sd != null) && (last.si != null || last.sd != null)) {
      convertFromText(c);
      convertFromText(last);
    }
    if (pathMatches(c.p, last.p)) {
      if (c.t && last.t && c.t === last.t && subtypes[c.t]) {
        last.o = subtypes[c.t].compose(last.o, c.o);
        if (c.si != null || c.sd != null) {
          var p = c.p;
          for (var i = 0; i < last.o.length - 1; i++) {
            c.o = [last.o.pop()];
            c.p = p.slice();
            convertToText(c);
            dest.push(c);
          }
          convertToText(last);
        }
      } else if (last.na != null && c.na != null) {
        dest[dest.length - 1] = {
          p: last.p,
          na: last.na + c.na
        };
      } else if (last.li !== undefined && c.li === undefined && c.ld === last.li) {
        if (last.ld !== undefined) {
          delete last.li;
        } else {
          dest.pop();
        }
      } else if (last.od !== undefined && last.oi === undefined && c.oi !== undefined && c.od === undefined) {
        last.oi = c.oi;
      } else if (last.oi !== undefined && c.od !== undefined) {
        if (c.oi !== undefined) {
          last.oi = c.oi;
        } else if (last.od !== undefined) {
          delete last.oi;
        } else {
          dest.pop();
        }
      } else if (c.lm !== undefined && c.p[c.p.length - 1] === c.lm) {} else {
        dest.push(c);
      }
    } else {
      if ((c.si != null || c.sd != null) && (last.si != null || last.sd != null)) {
        convertToText(c);
        convertToText(last);
      }
      dest.push(c);
    }
  };
  json.compose = function(op1, op2) {
    json.checkValidOp(op1);
    json.checkValidOp(op2);
    var newOp = clone(op1);
    for (var i = 0; i < op2.length; i++) {
      json.append(newOp, op2[i]);
    }
    return newOp;
  };
  json.normalize = function(op) {
    var newOp = [];
    op = isArray(op) ? op : [op];
    for (var i = 0; i < op.length; i++) {
      var c = op[i];
      if (c.p == null)
        c.p = [];
      json.append(newOp, c);
    }
    return newOp;
  };
  json.commonLengthForOps = function(a, b) {
    var alen = a.p.length;
    var blen = b.p.length;
    if (a.na != null || a.t)
      alen++;
    if (b.na != null || b.t)
      blen++;
    if (alen === 0)
      return -1;
    if (blen === 0)
      return null;
    alen--;
    blen--;
    for (var i = 0; i < alen; i++) {
      var p = a.p[i];
      if (i >= blen || p !== b.p[i])
        return null;
    }
    return alen;
  };
  json.canOpAffectPath = function(op, path) {
    return json.commonLengthForOps({p: path}, op) != null;
  };
  json.transformComponent = function(dest, c, otherC, type) {
    c = clone(c);
    var common = json.commonLengthForOps(otherC, c);
    var common2 = json.commonLengthForOps(c, otherC);
    var cplength = c.p.length;
    var otherCplength = otherC.p.length;
    if (c.na != null || c.t)
      cplength++;
    if (otherC.na != null || otherC.t)
      otherCplength++;
    if (common2 != null && otherCplength > cplength && c.p[common2] == otherC.p[common2]) {
      if (c.ld !== void 0) {
        var oc = clone(otherC);
        oc.p = oc.p.slice(cplength);
        c.ld = json.apply(clone(c.ld), [oc]);
      } else if (c.od !== void 0) {
        var oc = clone(otherC);
        oc.p = oc.p.slice(cplength);
        c.od = json.apply(clone(c.od), [oc]);
      }
    }
    if (common != null) {
      var commonOperand = cplength == otherCplength;
      var oc = otherC;
      if ((c.si != null || c.sd != null) && (otherC.si != null || otherC.sd != null)) {
        convertFromText(c);
        oc = clone(otherC);
        convertFromText(oc);
      }
      if (oc.t && subtypes[oc.t]) {
        if (c.t && c.t === oc.t) {
          var res = subtypes[c.t].transform(c.o, oc.o, type);
          if (res.length > 0) {
            if (c.si != null || c.sd != null) {
              var p = c.p;
              for (var i = 0; i < res.length; i++) {
                c.o = [res[i]];
                c.p = p.slice();
                convertToText(c);
                json.append(dest, c);
              }
            } else {
              c.o = res;
              json.append(dest, c);
            }
          }
          return dest;
        }
      } else if (otherC.na !== void 0) {} else if (otherC.li !== void 0 && otherC.ld !== void 0) {
        if (otherC.p[common] === c.p[common]) {
          if (!commonOperand) {
            return dest;
          } else if (c.ld !== void 0) {
            if (c.li !== void 0 && type === 'left') {
              c.ld = clone(otherC.li);
            } else {
              return dest;
            }
          }
        }
      } else if (otherC.li !== void 0) {
        if (c.li !== void 0 && c.ld === undefined && commonOperand && c.p[common] === otherC.p[common]) {
          if (type === 'right')
            c.p[common]++;
        } else if (otherC.p[common] <= c.p[common]) {
          c.p[common]++;
        }
        if (c.lm !== void 0) {
          if (commonOperand) {
            if (otherC.p[common] <= c.lm)
              c.lm++;
          }
        }
      } else if (otherC.ld !== void 0) {
        if (c.lm !== void 0) {
          if (commonOperand) {
            if (otherC.p[common] === c.p[common]) {
              return dest;
            }
            var p = otherC.p[common];
            var from = c.p[common];
            var to = c.lm;
            if (p < to || (p === to && from < to))
              c.lm--;
          }
        }
        if (otherC.p[common] < c.p[common]) {
          c.p[common]--;
        } else if (otherC.p[common] === c.p[common]) {
          if (otherCplength < cplength) {
            return dest;
          } else if (c.ld !== void 0) {
            if (c.li !== void 0) {
              delete c.ld;
            } else {
              return dest;
            }
          }
        }
      } else if (otherC.lm !== void 0) {
        if (c.lm !== void 0 && cplength === otherCplength) {
          var from = c.p[common];
          var to = c.lm;
          var otherFrom = otherC.p[common];
          var otherTo = otherC.lm;
          if (otherFrom !== otherTo) {
            if (from === otherFrom) {
              if (type === 'left') {
                c.p[common] = otherTo;
                if (from === to)
                  c.lm = otherTo;
              } else {
                return dest;
              }
            } else {
              if (from > otherFrom)
                c.p[common]--;
              if (from > otherTo)
                c.p[common]++;
              else if (from === otherTo) {
                if (otherFrom > otherTo) {
                  c.p[common]++;
                  if (from === to)
                    c.lm++;
                }
              }
              if (to > otherFrom) {
                c.lm--;
              } else if (to === otherFrom) {
                if (to > from)
                  c.lm--;
              }
              if (to > otherTo) {
                c.lm++;
              } else if (to === otherTo) {
                if ((otherTo > otherFrom && to > from) || (otherTo < otherFrom && to < from)) {
                  if (type === 'right')
                    c.lm++;
                } else {
                  if (to > from)
                    c.lm++;
                  else if (to === otherFrom)
                    c.lm--;
                }
              }
            }
          }
        } else if (c.li !== void 0 && c.ld === undefined && commonOperand) {
          var from = otherC.p[common];
          var to = otherC.lm;
          p = c.p[common];
          if (p > from)
            c.p[common]--;
          if (p > to)
            c.p[common]++;
        } else {
          var from = otherC.p[common];
          var to = otherC.lm;
          p = c.p[common];
          if (p === from) {
            c.p[common] = to;
          } else {
            if (p > from)
              c.p[common]--;
            if (p > to)
              c.p[common]++;
            else if (p === to && from > to)
              c.p[common]++;
          }
        }
      } else if (otherC.oi !== void 0 && otherC.od !== void 0) {
        if (c.p[common] === otherC.p[common]) {
          if (c.oi !== void 0 && commonOperand) {
            if (type === 'right') {
              return dest;
            } else {
              c.od = otherC.oi;
            }
          } else {
            return dest;
          }
        }
      } else if (otherC.oi !== void 0) {
        if (c.oi !== void 0 && c.p[common] === otherC.p[common]) {
          if (type === 'left') {
            json.append(dest, {
              p: c.p,
              od: otherC.oi
            });
          } else {
            return dest;
          }
        }
      } else if (otherC.od !== void 0) {
        if (c.p[common] == otherC.p[common]) {
          if (!commonOperand)
            return dest;
          if (c.oi !== void 0) {
            delete c.od;
          } else {
            return dest;
          }
        }
      }
    }
    json.append(dest, c);
    return dest;
  };
  $__require('npm:ot-json0@1.0.1/lib/bootstrapTransform.js')(json, json.transformComponent, json.checkValidOp, json.append);
  var text = $__require('npm:ot-json0@1.0.1/lib/text0.js');
  json.registerSubtype(text);
  module.exports = json;
  return module.exports;
});

System.registerDynamic("npm:ot-json0@1.0.1/lib/index.js", ["npm:ot-json0@1.0.1/lib/json0.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {type: $__require('npm:ot-json0@1.0.1/lib/json0.js')};
  return module.exports;
});

System.registerDynamic("npm:ot-json0@1.0.1.js", ["npm:ot-json0@1.0.1/lib/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:ot-json0@1.0.1/lib/index.js');
  return module.exports;
});

System.registerDynamic("npm:sharedb@1.0.0-beta.7/lib/types.js", ["npm:ot-json0@1.0.1.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  exports.defaultType = $__require('npm:ot-json0@1.0.1.js').type;
  exports.map = {};
  exports.register = function(type) {
    if (type.name)
      exports.map[type.name] = type;
    if (type.uri)
      exports.map[type.uri] = type;
  };
  exports.register(exports.defaultType);
  return module.exports;
});

System.registerDynamic("npm:sharedb@1.0.0-beta.7/lib/client/index.js", ["npm:sharedb@1.0.0-beta.7/lib/client/connection.js", "npm:sharedb@1.0.0-beta.7/lib/client/doc.js", "npm:sharedb@1.0.0-beta.7/lib/error.js", "npm:sharedb@1.0.0-beta.7/lib/client/query.js", "npm:sharedb@1.0.0-beta.7/lib/types.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  exports.Connection = $__require('npm:sharedb@1.0.0-beta.7/lib/client/connection.js');
  exports.Doc = $__require('npm:sharedb@1.0.0-beta.7/lib/client/doc.js');
  exports.Error = $__require('npm:sharedb@1.0.0-beta.7/lib/error.js');
  exports.Query = $__require('npm:sharedb@1.0.0-beta.7/lib/client/query.js');
  exports.types = $__require('npm:sharedb@1.0.0-beta.7/lib/types.js');
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.keyof.js", ["npm:core-js@1.2.7/library/modules/$.js", "npm:core-js@1.2.7/library/modules/$.to-iobject.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('npm:core-js@1.2.7/library/modules/$.js'),
      toIObject = $__require('npm:core-js@1.2.7/library/modules/$.to-iobject.js');
  module.exports = function(object, el) {
    var O = toIObject(object),
        keys = $.getKeys(O),
        length = keys.length,
        index = 0,
        key;
    while (length > index)
      if (O[key = keys[index++]] === el)
        return key;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.get-names.js", ["npm:core-js@1.2.7/library/modules/$.to-iobject.js", "npm:core-js@1.2.7/library/modules/$.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toIObject = $__require('npm:core-js@1.2.7/library/modules/$.to-iobject.js'),
      getNames = $__require('npm:core-js@1.2.7/library/modules/$.js').getNames,
      toString = {}.toString;
  var windowNames = typeof window == 'object' && Object.getOwnPropertyNames ? Object.getOwnPropertyNames(window) : [];
  var getWindowNames = function(it) {
    try {
      return getNames(it);
    } catch (e) {
      return windowNames.slice();
    }
  };
  module.exports.get = function getOwnPropertyNames(it) {
    if (windowNames && toString.call(it) == '[object Window]')
      return getWindowNames(it);
    return getNames(toIObject(it));
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.enum-keys.js", ["npm:core-js@1.2.7/library/modules/$.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('npm:core-js@1.2.7/library/modules/$.js');
  module.exports = function(it) {
    var keys = $.getKeys(it),
        getSymbols = $.getSymbols;
    if (getSymbols) {
      var symbols = getSymbols(it),
          isEnum = $.isEnum,
          i = 0,
          key;
      while (symbols.length > i)
        if (isEnum.call(it, key = symbols[i++]))
          keys.push(key);
    }
    return keys;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.is-array.js", ["npm:core-js@1.2.7/library/modules/$.cof.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var cof = $__require('npm:core-js@1.2.7/library/modules/$.cof.js');
  module.exports = Array.isArray || function(arg) {
    return cof(arg) == 'Array';
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/es6.symbol.js", ["npm:core-js@1.2.7/library/modules/$.js", "npm:core-js@1.2.7/library/modules/$.global.js", "npm:core-js@1.2.7/library/modules/$.has.js", "npm:core-js@1.2.7/library/modules/$.descriptors.js", "npm:core-js@1.2.7/library/modules/$.export.js", "npm:core-js@1.2.7/library/modules/$.redefine.js", "npm:core-js@1.2.7/library/modules/$.fails.js", "npm:core-js@1.2.7/library/modules/$.shared.js", "npm:core-js@1.2.7/library/modules/$.set-to-string-tag.js", "npm:core-js@1.2.7/library/modules/$.uid.js", "npm:core-js@1.2.7/library/modules/$.wks.js", "npm:core-js@1.2.7/library/modules/$.keyof.js", "npm:core-js@1.2.7/library/modules/$.get-names.js", "npm:core-js@1.2.7/library/modules/$.enum-keys.js", "npm:core-js@1.2.7/library/modules/$.is-array.js", "npm:core-js@1.2.7/library/modules/$.an-object.js", "npm:core-js@1.2.7/library/modules/$.to-iobject.js", "npm:core-js@1.2.7/library/modules/$.property-desc.js", "npm:core-js@1.2.7/library/modules/$.library.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('npm:core-js@1.2.7/library/modules/$.js'),
      global = $__require('npm:core-js@1.2.7/library/modules/$.global.js'),
      has = $__require('npm:core-js@1.2.7/library/modules/$.has.js'),
      DESCRIPTORS = $__require('npm:core-js@1.2.7/library/modules/$.descriptors.js'),
      $export = $__require('npm:core-js@1.2.7/library/modules/$.export.js'),
      redefine = $__require('npm:core-js@1.2.7/library/modules/$.redefine.js'),
      $fails = $__require('npm:core-js@1.2.7/library/modules/$.fails.js'),
      shared = $__require('npm:core-js@1.2.7/library/modules/$.shared.js'),
      setToStringTag = $__require('npm:core-js@1.2.7/library/modules/$.set-to-string-tag.js'),
      uid = $__require('npm:core-js@1.2.7/library/modules/$.uid.js'),
      wks = $__require('npm:core-js@1.2.7/library/modules/$.wks.js'),
      keyOf = $__require('npm:core-js@1.2.7/library/modules/$.keyof.js'),
      $names = $__require('npm:core-js@1.2.7/library/modules/$.get-names.js'),
      enumKeys = $__require('npm:core-js@1.2.7/library/modules/$.enum-keys.js'),
      isArray = $__require('npm:core-js@1.2.7/library/modules/$.is-array.js'),
      anObject = $__require('npm:core-js@1.2.7/library/modules/$.an-object.js'),
      toIObject = $__require('npm:core-js@1.2.7/library/modules/$.to-iobject.js'),
      createDesc = $__require('npm:core-js@1.2.7/library/modules/$.property-desc.js'),
      getDesc = $.getDesc,
      setDesc = $.setDesc,
      _create = $.create,
      getNames = $names.get,
      $Symbol = global.Symbol,
      $JSON = global.JSON,
      _stringify = $JSON && $JSON.stringify,
      setter = false,
      HIDDEN = wks('_hidden'),
      isEnum = $.isEnum,
      SymbolRegistry = shared('symbol-registry'),
      AllSymbols = shared('symbols'),
      useNative = typeof $Symbol == 'function',
      ObjectProto = Object.prototype;
  var setSymbolDesc = DESCRIPTORS && $fails(function() {
    return _create(setDesc({}, 'a', {get: function() {
        return setDesc(this, 'a', {value: 7}).a;
      }})).a != 7;
  }) ? function(it, key, D) {
    var protoDesc = getDesc(ObjectProto, key);
    if (protoDesc)
      delete ObjectProto[key];
    setDesc(it, key, D);
    if (protoDesc && it !== ObjectProto)
      setDesc(ObjectProto, key, protoDesc);
  } : setDesc;
  var wrap = function(tag) {
    var sym = AllSymbols[tag] = _create($Symbol.prototype);
    sym._k = tag;
    DESCRIPTORS && setter && setSymbolDesc(ObjectProto, tag, {
      configurable: true,
      set: function(value) {
        if (has(this, HIDDEN) && has(this[HIDDEN], tag))
          this[HIDDEN][tag] = false;
        setSymbolDesc(this, tag, createDesc(1, value));
      }
    });
    return sym;
  };
  var isSymbol = function(it) {
    return typeof it == 'symbol';
  };
  var $defineProperty = function defineProperty(it, key, D) {
    if (D && has(AllSymbols, key)) {
      if (!D.enumerable) {
        if (!has(it, HIDDEN))
          setDesc(it, HIDDEN, createDesc(1, {}));
        it[HIDDEN][key] = true;
      } else {
        if (has(it, HIDDEN) && it[HIDDEN][key])
          it[HIDDEN][key] = false;
        D = _create(D, {enumerable: createDesc(0, false)});
      }
      return setSymbolDesc(it, key, D);
    }
    return setDesc(it, key, D);
  };
  var $defineProperties = function defineProperties(it, P) {
    anObject(it);
    var keys = enumKeys(P = toIObject(P)),
        i = 0,
        l = keys.length,
        key;
    while (l > i)
      $defineProperty(it, key = keys[i++], P[key]);
    return it;
  };
  var $create = function create(it, P) {
    return P === undefined ? _create(it) : $defineProperties(_create(it), P);
  };
  var $propertyIsEnumerable = function propertyIsEnumerable(key) {
    var E = isEnum.call(this, key);
    return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
  };
  var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
    var D = getDesc(it = toIObject(it), key);
    if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key]))
      D.enumerable = true;
    return D;
  };
  var $getOwnPropertyNames = function getOwnPropertyNames(it) {
    var names = getNames(toIObject(it)),
        result = [],
        i = 0,
        key;
    while (names.length > i)
      if (!has(AllSymbols, key = names[i++]) && key != HIDDEN)
        result.push(key);
    return result;
  };
  var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
    var names = getNames(toIObject(it)),
        result = [],
        i = 0,
        key;
    while (names.length > i)
      if (has(AllSymbols, key = names[i++]))
        result.push(AllSymbols[key]);
    return result;
  };
  var $stringify = function stringify(it) {
    if (it === undefined || isSymbol(it))
      return;
    var args = [it],
        i = 1,
        $$ = arguments,
        replacer,
        $replacer;
    while ($$.length > i)
      args.push($$[i++]);
    replacer = args[1];
    if (typeof replacer == 'function')
      $replacer = replacer;
    if ($replacer || !isArray(replacer))
      replacer = function(key, value) {
        if ($replacer)
          value = $replacer.call(this, key, value);
        if (!isSymbol(value))
          return value;
      };
    args[1] = replacer;
    return _stringify.apply($JSON, args);
  };
  var buggyJSON = $fails(function() {
    var S = $Symbol();
    return _stringify([S]) != '[null]' || _stringify({a: S}) != '{}' || _stringify(Object(S)) != '{}';
  });
  if (!useNative) {
    $Symbol = function Symbol() {
      if (isSymbol(this))
        throw TypeError('Symbol is not a constructor');
      return wrap(uid(arguments.length > 0 ? arguments[0] : undefined));
    };
    redefine($Symbol.prototype, 'toString', function toString() {
      return this._k;
    });
    isSymbol = function(it) {
      return it instanceof $Symbol;
    };
    $.create = $create;
    $.isEnum = $propertyIsEnumerable;
    $.getDesc = $getOwnPropertyDescriptor;
    $.setDesc = $defineProperty;
    $.setDescs = $defineProperties;
    $.getNames = $names.get = $getOwnPropertyNames;
    $.getSymbols = $getOwnPropertySymbols;
    if (DESCRIPTORS && !$__require('npm:core-js@1.2.7/library/modules/$.library.js')) {
      redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
    }
  }
  var symbolStatics = {
    'for': function(key) {
      return has(SymbolRegistry, key += '') ? SymbolRegistry[key] : SymbolRegistry[key] = $Symbol(key);
    },
    keyFor: function keyFor(key) {
      return keyOf(SymbolRegistry, key);
    },
    useSetter: function() {
      setter = true;
    },
    useSimple: function() {
      setter = false;
    }
  };
  $.each.call(('hasInstance,isConcatSpreadable,iterator,match,replace,search,' + 'species,split,toPrimitive,toStringTag,unscopables').split(','), function(it) {
    var sym = wks(it);
    symbolStatics[it] = useNative ? sym : wrap(sym);
  });
  setter = true;
  $export($export.G + $export.W, {Symbol: $Symbol});
  $export($export.S, 'Symbol', symbolStatics);
  $export($export.S + $export.F * !useNative, 'Object', {
    create: $create,
    defineProperty: $defineProperty,
    defineProperties: $defineProperties,
    getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
    getOwnPropertyNames: $getOwnPropertyNames,
    getOwnPropertySymbols: $getOwnPropertySymbols
  });
  $JSON && $export($export.S + $export.F * (!useNative || buggyJSON), 'JSON', {stringify: $stringify});
  setToStringTag($Symbol, 'Symbol');
  setToStringTag(Math, 'Math', true);
  setToStringTag(global.JSON, 'JSON', true);
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/fn/symbol/index.js", ["npm:core-js@1.2.7/library/modules/es6.symbol.js", "npm:core-js@1.2.7/library/modules/es6.object.to-string.js", "npm:core-js@1.2.7/library/modules/$.core.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('npm:core-js@1.2.7/library/modules/es6.symbol.js');
  $__require('npm:core-js@1.2.7/library/modules/es6.object.to-string.js');
  module.exports = $__require('npm:core-js@1.2.7/library/modules/$.core.js').Symbol;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/fn/symbol.js", ["npm:core-js@1.2.7/library/fn/symbol/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:core-js@1.2.7/library/fn/symbol/index.js');
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/core-js/symbol.js", ["npm:core-js@1.2.7/library/fn/symbol.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('npm:core-js@1.2.7/library/fn/symbol.js'),
    __esModule: true
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/es6.object.to-string.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  "format cjs";
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.strict-new.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(it, Constructor, name) {
    if (!(it instanceof Constructor))
      throw TypeError(name + ": use the 'new' operator!");
    return it;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.for-of.js", ["npm:core-js@1.2.7/library/modules/$.ctx.js", "npm:core-js@1.2.7/library/modules/$.iter-call.js", "npm:core-js@1.2.7/library/modules/$.is-array-iter.js", "npm:core-js@1.2.7/library/modules/$.an-object.js", "npm:core-js@1.2.7/library/modules/$.to-length.js", "npm:core-js@1.2.7/library/modules/core.get-iterator-method.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var ctx = $__require('npm:core-js@1.2.7/library/modules/$.ctx.js'),
      call = $__require('npm:core-js@1.2.7/library/modules/$.iter-call.js'),
      isArrayIter = $__require('npm:core-js@1.2.7/library/modules/$.is-array-iter.js'),
      anObject = $__require('npm:core-js@1.2.7/library/modules/$.an-object.js'),
      toLength = $__require('npm:core-js@1.2.7/library/modules/$.to-length.js'),
      getIterFn = $__require('npm:core-js@1.2.7/library/modules/core.get-iterator-method.js');
  module.exports = function(iterable, entries, fn, that) {
    var iterFn = getIterFn(iterable),
        f = ctx(fn, that, entries ? 2 : 1),
        index = 0,
        length,
        step,
        iterator;
    if (typeof iterFn != 'function')
      throw TypeError(iterable + ' is not iterable!');
    if (isArrayIter(iterFn))
      for (length = toLength(iterable.length); length > index; index++) {
        entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
      }
    else
      for (iterator = iterFn.call(iterable); !(step = iterator.next()).done; ) {
        call(iterator, f, step.value, entries);
      }
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.same-value.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = Object.is || function is(x, y) {
    return x === y ? x !== 0 || 1 / x === 1 / y : x != x && y != y;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.species-constructor.js", ["npm:core-js@1.2.7/library/modules/$.an-object.js", "npm:core-js@1.2.7/library/modules/$.a-function.js", "npm:core-js@1.2.7/library/modules/$.wks.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var anObject = $__require('npm:core-js@1.2.7/library/modules/$.an-object.js'),
      aFunction = $__require('npm:core-js@1.2.7/library/modules/$.a-function.js'),
      SPECIES = $__require('npm:core-js@1.2.7/library/modules/$.wks.js')('species');
  module.exports = function(O, D) {
    var C = anObject(O).constructor,
        S;
    return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.invoke.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(fn, args, that) {
    var un = that === undefined;
    switch (args.length) {
      case 0:
        return un ? fn() : fn.call(that);
      case 1:
        return un ? fn(args[0]) : fn.call(that, args[0]);
      case 2:
        return un ? fn(args[0], args[1]) : fn.call(that, args[0], args[1]);
      case 3:
        return un ? fn(args[0], args[1], args[2]) : fn.call(that, args[0], args[1], args[2]);
      case 4:
        return un ? fn(args[0], args[1], args[2], args[3]) : fn.call(that, args[0], args[1], args[2], args[3]);
    }
    return fn.apply(that, args);
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.html.js", ["npm:core-js@1.2.7/library/modules/$.global.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:core-js@1.2.7/library/modules/$.global.js').document && document.documentElement;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.dom-create.js", ["npm:core-js@1.2.7/library/modules/$.is-object.js", "npm:core-js@1.2.7/library/modules/$.global.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var isObject = $__require('npm:core-js@1.2.7/library/modules/$.is-object.js'),
      document = $__require('npm:core-js@1.2.7/library/modules/$.global.js').document,
      is = isObject(document) && isObject(document.createElement);
  module.exports = function(it) {
    return is ? document.createElement(it) : {};
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.task.js", ["npm:core-js@1.2.7/library/modules/$.ctx.js", "npm:core-js@1.2.7/library/modules/$.invoke.js", "npm:core-js@1.2.7/library/modules/$.html.js", "npm:core-js@1.2.7/library/modules/$.dom-create.js", "npm:core-js@1.2.7/library/modules/$.global.js", "npm:core-js@1.2.7/library/modules/$.cof.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var ctx = $__require('npm:core-js@1.2.7/library/modules/$.ctx.js'),
        invoke = $__require('npm:core-js@1.2.7/library/modules/$.invoke.js'),
        html = $__require('npm:core-js@1.2.7/library/modules/$.html.js'),
        cel = $__require('npm:core-js@1.2.7/library/modules/$.dom-create.js'),
        global = $__require('npm:core-js@1.2.7/library/modules/$.global.js'),
        process = global.process,
        setTask = global.setImmediate,
        clearTask = global.clearImmediate,
        MessageChannel = global.MessageChannel,
        counter = 0,
        queue = {},
        ONREADYSTATECHANGE = 'onreadystatechange',
        defer,
        channel,
        port;
    var run = function() {
      var id = +this;
      if (queue.hasOwnProperty(id)) {
        var fn = queue[id];
        delete queue[id];
        fn();
      }
    };
    var listner = function(event) {
      run.call(event.data);
    };
    if (!setTask || !clearTask) {
      setTask = function setImmediate(fn) {
        var args = [],
            i = 1;
        while (arguments.length > i)
          args.push(arguments[i++]);
        queue[++counter] = function() {
          invoke(typeof fn == 'function' ? fn : Function(fn), args);
        };
        defer(counter);
        return counter;
      };
      clearTask = function clearImmediate(id) {
        delete queue[id];
      };
      if ($__require('npm:core-js@1.2.7/library/modules/$.cof.js')(process) == 'process') {
        defer = function(id) {
          process.nextTick(ctx(run, id, 1));
        };
      } else if (MessageChannel) {
        channel = new MessageChannel;
        port = channel.port2;
        channel.port1.onmessage = listner;
        defer = ctx(port.postMessage, port, 1);
      } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
        defer = function(id) {
          global.postMessage(id + '', '*');
        };
        global.addEventListener('message', listner, false);
      } else if (ONREADYSTATECHANGE in cel('script')) {
        defer = function(id) {
          html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function() {
            html.removeChild(this);
            run.call(id);
          };
        };
      } else {
        defer = function(id) {
          setTimeout(ctx(run, id, 1), 0);
        };
      }
    }
    module.exports = {
      set: setTask,
      clear: clearTask
    };
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.microtask.js", ["npm:core-js@1.2.7/library/modules/$.global.js", "npm:core-js@1.2.7/library/modules/$.task.js", "npm:core-js@1.2.7/library/modules/$.cof.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var global = $__require('npm:core-js@1.2.7/library/modules/$.global.js'),
        macrotask = $__require('npm:core-js@1.2.7/library/modules/$.task.js').set,
        Observer = global.MutationObserver || global.WebKitMutationObserver,
        process = global.process,
        Promise = global.Promise,
        isNode = $__require('npm:core-js@1.2.7/library/modules/$.cof.js')(process) == 'process',
        head,
        last,
        notify;
    var flush = function() {
      var parent,
          domain,
          fn;
      if (isNode && (parent = process.domain)) {
        process.domain = null;
        parent.exit();
      }
      while (head) {
        domain = head.domain;
        fn = head.fn;
        if (domain)
          domain.enter();
        fn();
        if (domain)
          domain.exit();
        head = head.next;
      }
      last = undefined;
      if (parent)
        parent.enter();
    };
    if (isNode) {
      notify = function() {
        process.nextTick(flush);
      };
    } else if (Observer) {
      var toggle = 1,
          node = document.createTextNode('');
      new Observer(flush).observe(node, {characterData: true});
      notify = function() {
        node.data = toggle = -toggle;
      };
    } else if (Promise && Promise.resolve) {
      notify = function() {
        Promise.resolve().then(flush);
      };
    } else {
      notify = function() {
        macrotask.call(global, flush);
      };
    }
    module.exports = function asap(fn) {
      var task = {
        fn: fn,
        next: undefined,
        domain: isNode && process.domain
      };
      if (last)
        last.next = task;
      if (!head) {
        head = task;
        notify();
      }
      last = task;
    };
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.redefine-all.js", ["npm:core-js@1.2.7/library/modules/$.redefine.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var redefine = $__require('npm:core-js@1.2.7/library/modules/$.redefine.js');
  module.exports = function(target, src) {
    for (var key in src)
      redefine(target, key, src[key]);
    return target;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.set-species.js", ["npm:core-js@1.2.7/library/modules/$.core.js", "npm:core-js@1.2.7/library/modules/$.js", "npm:core-js@1.2.7/library/modules/$.descriptors.js", "npm:core-js@1.2.7/library/modules/$.wks.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var core = $__require('npm:core-js@1.2.7/library/modules/$.core.js'),
      $ = $__require('npm:core-js@1.2.7/library/modules/$.js'),
      DESCRIPTORS = $__require('npm:core-js@1.2.7/library/modules/$.descriptors.js'),
      SPECIES = $__require('npm:core-js@1.2.7/library/modules/$.wks.js')('species');
  module.exports = function(KEY) {
    var C = core[KEY];
    if (DESCRIPTORS && C && !C[SPECIES])
      $.setDesc(C, SPECIES, {
        configurable: true,
        get: function() {
          return this;
        }
      });
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/es6.promise.js", ["npm:core-js@1.2.7/library/modules/$.js", "npm:core-js@1.2.7/library/modules/$.library.js", "npm:core-js@1.2.7/library/modules/$.global.js", "npm:core-js@1.2.7/library/modules/$.ctx.js", "npm:core-js@1.2.7/library/modules/$.classof.js", "npm:core-js@1.2.7/library/modules/$.export.js", "npm:core-js@1.2.7/library/modules/$.is-object.js", "npm:core-js@1.2.7/library/modules/$.an-object.js", "npm:core-js@1.2.7/library/modules/$.a-function.js", "npm:core-js@1.2.7/library/modules/$.strict-new.js", "npm:core-js@1.2.7/library/modules/$.for-of.js", "npm:core-js@1.2.7/library/modules/$.set-proto.js", "npm:core-js@1.2.7/library/modules/$.same-value.js", "npm:core-js@1.2.7/library/modules/$.wks.js", "npm:core-js@1.2.7/library/modules/$.species-constructor.js", "npm:core-js@1.2.7/library/modules/$.microtask.js", "npm:core-js@1.2.7/library/modules/$.descriptors.js", "npm:core-js@1.2.7/library/modules/$.redefine-all.js", "npm:core-js@1.2.7/library/modules/$.set-to-string-tag.js", "npm:core-js@1.2.7/library/modules/$.set-species.js", "npm:core-js@1.2.7/library/modules/$.core.js", "npm:core-js@1.2.7/library/modules/$.iter-detect.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    'use strict';
    var $ = $__require('npm:core-js@1.2.7/library/modules/$.js'),
        LIBRARY = $__require('npm:core-js@1.2.7/library/modules/$.library.js'),
        global = $__require('npm:core-js@1.2.7/library/modules/$.global.js'),
        ctx = $__require('npm:core-js@1.2.7/library/modules/$.ctx.js'),
        classof = $__require('npm:core-js@1.2.7/library/modules/$.classof.js'),
        $export = $__require('npm:core-js@1.2.7/library/modules/$.export.js'),
        isObject = $__require('npm:core-js@1.2.7/library/modules/$.is-object.js'),
        anObject = $__require('npm:core-js@1.2.7/library/modules/$.an-object.js'),
        aFunction = $__require('npm:core-js@1.2.7/library/modules/$.a-function.js'),
        strictNew = $__require('npm:core-js@1.2.7/library/modules/$.strict-new.js'),
        forOf = $__require('npm:core-js@1.2.7/library/modules/$.for-of.js'),
        setProto = $__require('npm:core-js@1.2.7/library/modules/$.set-proto.js').set,
        same = $__require('npm:core-js@1.2.7/library/modules/$.same-value.js'),
        SPECIES = $__require('npm:core-js@1.2.7/library/modules/$.wks.js')('species'),
        speciesConstructor = $__require('npm:core-js@1.2.7/library/modules/$.species-constructor.js'),
        asap = $__require('npm:core-js@1.2.7/library/modules/$.microtask.js'),
        PROMISE = 'Promise',
        process = global.process,
        isNode = classof(process) == 'process',
        P = global[PROMISE],
        empty = function() {},
        Wrapper;
    var testResolve = function(sub) {
      var test = new P(empty),
          promise;
      if (sub)
        test.constructor = function(exec) {
          exec(empty, empty);
        };
      (promise = P.resolve(test))['catch'](empty);
      return promise === test;
    };
    var USE_NATIVE = function() {
      var works = false;
      function P2(x) {
        var self = new P(x);
        setProto(self, P2.prototype);
        return self;
      }
      try {
        works = P && P.resolve && testResolve();
        setProto(P2, P);
        P2.prototype = $.create(P.prototype, {constructor: {value: P2}});
        if (!(P2.resolve(5).then(function() {}) instanceof P2)) {
          works = false;
        }
        if (works && $__require('npm:core-js@1.2.7/library/modules/$.descriptors.js')) {
          var thenableThenGotten = false;
          P.resolve($.setDesc({}, 'then', {get: function() {
              thenableThenGotten = true;
            }}));
          works = thenableThenGotten;
        }
      } catch (e) {
        works = false;
      }
      return works;
    }();
    var sameConstructor = function(a, b) {
      if (LIBRARY && a === P && b === Wrapper)
        return true;
      return same(a, b);
    };
    var getConstructor = function(C) {
      var S = anObject(C)[SPECIES];
      return S != undefined ? S : C;
    };
    var isThenable = function(it) {
      var then;
      return isObject(it) && typeof(then = it.then) == 'function' ? then : false;
    };
    var PromiseCapability = function(C) {
      var resolve,
          reject;
      this.promise = new C(function($$resolve, $$reject) {
        if (resolve !== undefined || reject !== undefined)
          throw TypeError('Bad Promise constructor');
        resolve = $$resolve;
        reject = $$reject;
      });
      this.resolve = aFunction(resolve), this.reject = aFunction(reject);
    };
    var perform = function(exec) {
      try {
        exec();
      } catch (e) {
        return {error: e};
      }
    };
    var notify = function(record, isReject) {
      if (record.n)
        return;
      record.n = true;
      var chain = record.c;
      asap(function() {
        var value = record.v,
            ok = record.s == 1,
            i = 0;
        var run = function(reaction) {
          var handler = ok ? reaction.ok : reaction.fail,
              resolve = reaction.resolve,
              reject = reaction.reject,
              result,
              then;
          try {
            if (handler) {
              if (!ok)
                record.h = true;
              result = handler === true ? value : handler(value);
              if (result === reaction.promise) {
                reject(TypeError('Promise-chain cycle'));
              } else if (then = isThenable(result)) {
                then.call(result, resolve, reject);
              } else
                resolve(result);
            } else
              reject(value);
          } catch (e) {
            reject(e);
          }
        };
        while (chain.length > i)
          run(chain[i++]);
        chain.length = 0;
        record.n = false;
        if (isReject)
          setTimeout(function() {
            var promise = record.p,
                handler,
                console;
            if (isUnhandled(promise)) {
              if (isNode) {
                process.emit('unhandledRejection', value, promise);
              } else if (handler = global.onunhandledrejection) {
                handler({
                  promise: promise,
                  reason: value
                });
              } else if ((console = global.console) && console.error) {
                console.error('Unhandled promise rejection', value);
              }
            }
            record.a = undefined;
          }, 1);
      });
    };
    var isUnhandled = function(promise) {
      var record = promise._d,
          chain = record.a || record.c,
          i = 0,
          reaction;
      if (record.h)
        return false;
      while (chain.length > i) {
        reaction = chain[i++];
        if (reaction.fail || !isUnhandled(reaction.promise))
          return false;
      }
      return true;
    };
    var $reject = function(value) {
      var record = this;
      if (record.d)
        return;
      record.d = true;
      record = record.r || record;
      record.v = value;
      record.s = 2;
      record.a = record.c.slice();
      notify(record, true);
    };
    var $resolve = function(value) {
      var record = this,
          then;
      if (record.d)
        return;
      record.d = true;
      record = record.r || record;
      try {
        if (record.p === value)
          throw TypeError("Promise can't be resolved itself");
        if (then = isThenable(value)) {
          asap(function() {
            var wrapper = {
              r: record,
              d: false
            };
            try {
              then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
            } catch (e) {
              $reject.call(wrapper, e);
            }
          });
        } else {
          record.v = value;
          record.s = 1;
          notify(record, false);
        }
      } catch (e) {
        $reject.call({
          r: record,
          d: false
        }, e);
      }
    };
    if (!USE_NATIVE) {
      P = function Promise(executor) {
        aFunction(executor);
        var record = this._d = {
          p: strictNew(this, P, PROMISE),
          c: [],
          a: undefined,
          s: 0,
          d: false,
          v: undefined,
          h: false,
          n: false
        };
        try {
          executor(ctx($resolve, record, 1), ctx($reject, record, 1));
        } catch (err) {
          $reject.call(record, err);
        }
      };
      $__require('npm:core-js@1.2.7/library/modules/$.redefine-all.js')(P.prototype, {
        then: function then(onFulfilled, onRejected) {
          var reaction = new PromiseCapability(speciesConstructor(this, P)),
              promise = reaction.promise,
              record = this._d;
          reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
          reaction.fail = typeof onRejected == 'function' && onRejected;
          record.c.push(reaction);
          if (record.a)
            record.a.push(reaction);
          if (record.s)
            notify(record, false);
          return promise;
        },
        'catch': function(onRejected) {
          return this.then(undefined, onRejected);
        }
      });
    }
    $export($export.G + $export.W + $export.F * !USE_NATIVE, {Promise: P});
    $__require('npm:core-js@1.2.7/library/modules/$.set-to-string-tag.js')(P, PROMISE);
    $__require('npm:core-js@1.2.7/library/modules/$.set-species.js')(PROMISE);
    Wrapper = $__require('npm:core-js@1.2.7/library/modules/$.core.js')[PROMISE];
    $export($export.S + $export.F * !USE_NATIVE, PROMISE, {reject: function reject(r) {
        var capability = new PromiseCapability(this),
            $$reject = capability.reject;
        $$reject(r);
        return capability.promise;
      }});
    $export($export.S + $export.F * (!USE_NATIVE || testResolve(true)), PROMISE, {resolve: function resolve(x) {
        if (x instanceof P && sameConstructor(x.constructor, this))
          return x;
        var capability = new PromiseCapability(this),
            $$resolve = capability.resolve;
        $$resolve(x);
        return capability.promise;
      }});
    $export($export.S + $export.F * !(USE_NATIVE && $__require('npm:core-js@1.2.7/library/modules/$.iter-detect.js')(function(iter) {
      P.all(iter)['catch'](function() {});
    })), PROMISE, {
      all: function all(iterable) {
        var C = getConstructor(this),
            capability = new PromiseCapability(C),
            resolve = capability.resolve,
            reject = capability.reject,
            values = [];
        var abrupt = perform(function() {
          forOf(iterable, false, values.push, values);
          var remaining = values.length,
              results = Array(remaining);
          if (remaining)
            $.each.call(values, function(promise, index) {
              var alreadyCalled = false;
              C.resolve(promise).then(function(value) {
                if (alreadyCalled)
                  return;
                alreadyCalled = true;
                results[index] = value;
                --remaining || resolve(results);
              }, reject);
            });
          else
            resolve(results);
        });
        if (abrupt)
          reject(abrupt.error);
        return capability.promise;
      },
      race: function race(iterable) {
        var C = getConstructor(this),
            capability = new PromiseCapability(C),
            reject = capability.reject;
        var abrupt = perform(function() {
          forOf(iterable, false, function(promise) {
            C.resolve(promise).then(capability.resolve, reject);
          });
        });
        if (abrupt)
          reject(abrupt.error);
        return capability.promise;
      }
    });
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/fn/promise.js", ["npm:core-js@1.2.7/library/modules/es6.object.to-string.js", "npm:core-js@1.2.7/library/modules/es6.string.iterator.js", "npm:core-js@1.2.7/library/modules/web.dom.iterable.js", "npm:core-js@1.2.7/library/modules/es6.promise.js", "npm:core-js@1.2.7/library/modules/$.core.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('npm:core-js@1.2.7/library/modules/es6.object.to-string.js');
  $__require('npm:core-js@1.2.7/library/modules/es6.string.iterator.js');
  $__require('npm:core-js@1.2.7/library/modules/web.dom.iterable.js');
  $__require('npm:core-js@1.2.7/library/modules/es6.promise.js');
  module.exports = $__require('npm:core-js@1.2.7/library/modules/$.core.js').Promise;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/core-js/promise.js", ["npm:core-js@1.2.7/library/fn/promise.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('npm:core-js@1.2.7/library/fn/promise.js'),
    __esModule: true
  };
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/regenerator/runtime.js", ["npm:babel-runtime@5.8.38/core-js/symbol.js", "npm:babel-runtime@5.8.38/core-js/object/create.js", "npm:babel-runtime@5.8.38/core-js/object/set-prototype-of.js", "npm:babel-runtime@5.8.38/core-js/promise.js", "github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    "use strict";
    var _Symbol = $__require('npm:babel-runtime@5.8.38/core-js/symbol.js')["default"];
    var _Object$create = $__require('npm:babel-runtime@5.8.38/core-js/object/create.js')["default"];
    var _Object$setPrototypeOf = $__require('npm:babel-runtime@5.8.38/core-js/object/set-prototype-of.js')["default"];
    var _Promise = $__require('npm:babel-runtime@5.8.38/core-js/promise.js')["default"];
    !(function(global) {
      "use strict";
      var hasOwn = Object.prototype.hasOwnProperty;
      var undefined;
      var $Symbol = typeof _Symbol === "function" ? _Symbol : {};
      var iteratorSymbol = $Symbol.iterator || "@@iterator";
      var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
      var inModule = typeof module === "object";
      var runtime = global.regeneratorRuntime;
      if (runtime) {
        if (inModule) {
          module.exports = runtime;
        }
        return;
      }
      runtime = global.regeneratorRuntime = inModule ? module.exports : {};
      function wrap(innerFn, outerFn, self, tryLocsList) {
        var generator = _Object$create((outerFn || Generator).prototype);
        var context = new Context(tryLocsList || []);
        generator._invoke = makeInvokeMethod(innerFn, self, context);
        return generator;
      }
      runtime.wrap = wrap;
      function tryCatch(fn, obj, arg) {
        try {
          return {
            type: "normal",
            arg: fn.call(obj, arg)
          };
        } catch (err) {
          return {
            type: "throw",
            arg: err
          };
        }
      }
      var GenStateSuspendedStart = "suspendedStart";
      var GenStateSuspendedYield = "suspendedYield";
      var GenStateExecuting = "executing";
      var GenStateCompleted = "completed";
      var ContinueSentinel = {};
      function Generator() {}
      function GeneratorFunction() {}
      function GeneratorFunctionPrototype() {}
      var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype;
      GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
      GeneratorFunctionPrototype.constructor = GeneratorFunction;
      GeneratorFunctionPrototype[toStringTagSymbol] = GeneratorFunction.displayName = "GeneratorFunction";
      function defineIteratorMethods(prototype) {
        ["next", "throw", "return"].forEach(function(method) {
          prototype[method] = function(arg) {
            return this._invoke(method, arg);
          };
        });
      }
      runtime.isGeneratorFunction = function(genFun) {
        var ctor = typeof genFun === "function" && genFun.constructor;
        return ctor ? ctor === GeneratorFunction || (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
      };
      runtime.mark = function(genFun) {
        if (_Object$setPrototypeOf) {
          _Object$setPrototypeOf(genFun, GeneratorFunctionPrototype);
        } else {
          genFun.__proto__ = GeneratorFunctionPrototype;
          if (!(toStringTagSymbol in genFun)) {
            genFun[toStringTagSymbol] = "GeneratorFunction";
          }
        }
        genFun.prototype = _Object$create(Gp);
        return genFun;
      };
      runtime.awrap = function(arg) {
        return new AwaitArgument(arg);
      };
      function AwaitArgument(arg) {
        this.arg = arg;
      }
      function AsyncIterator(generator) {
        function invoke(method, arg, resolve, reject) {
          var record = tryCatch(generator[method], generator, arg);
          if (record.type === "throw") {
            reject(record.arg);
          } else {
            var result = record.arg;
            var value = result.value;
            if (value instanceof AwaitArgument) {
              return _Promise.resolve(value.arg).then(function(value) {
                invoke("next", value, resolve, reject);
              }, function(err) {
                invoke("throw", err, resolve, reject);
              });
            }
            return _Promise.resolve(value).then(function(unwrapped) {
              result.value = unwrapped;
              resolve(result);
            }, reject);
          }
        }
        if (typeof process === "object" && process.domain) {
          invoke = process.domain.bind(invoke);
        }
        var previousPromise;
        function enqueue(method, arg) {
          function callInvokeWithMethodAndArg() {
            return new _Promise(function(resolve, reject) {
              invoke(method, arg, resolve, reject);
            });
          }
          return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
        }
        this._invoke = enqueue;
      }
      defineIteratorMethods(AsyncIterator.prototype);
      runtime.async = function(innerFn, outerFn, self, tryLocsList) {
        var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList));
        return runtime.isGeneratorFunction(outerFn) ? iter : iter.next().then(function(result) {
          return result.done ? result.value : iter.next();
        });
      };
      function makeInvokeMethod(innerFn, self, context) {
        var state = GenStateSuspendedStart;
        return function invoke(method, arg) {
          if (state === GenStateExecuting) {
            throw new Error("Generator is already running");
          }
          if (state === GenStateCompleted) {
            if (method === "throw") {
              throw arg;
            }
            return doneResult();
          }
          while (true) {
            var delegate = context.delegate;
            if (delegate) {
              if (method === "return" || method === "throw" && delegate.iterator[method] === undefined) {
                context.delegate = null;
                var returnMethod = delegate.iterator["return"];
                if (returnMethod) {
                  var record = tryCatch(returnMethod, delegate.iterator, arg);
                  if (record.type === "throw") {
                    method = "throw";
                    arg = record.arg;
                    continue;
                  }
                }
                if (method === "return") {
                  continue;
                }
              }
              var record = tryCatch(delegate.iterator[method], delegate.iterator, arg);
              if (record.type === "throw") {
                context.delegate = null;
                method = "throw";
                arg = record.arg;
                continue;
              }
              method = "next";
              arg = undefined;
              var info = record.arg;
              if (info.done) {
                context[delegate.resultName] = info.value;
                context.next = delegate.nextLoc;
              } else {
                state = GenStateSuspendedYield;
                return info;
              }
              context.delegate = null;
            }
            if (method === "next") {
              if (state === GenStateSuspendedYield) {
                context.sent = arg;
              } else {
                context.sent = undefined;
              }
            } else if (method === "throw") {
              if (state === GenStateSuspendedStart) {
                state = GenStateCompleted;
                throw arg;
              }
              if (context.dispatchException(arg)) {
                method = "next";
                arg = undefined;
              }
            } else if (method === "return") {
              context.abrupt("return", arg);
            }
            state = GenStateExecuting;
            var record = tryCatch(innerFn, self, context);
            if (record.type === "normal") {
              state = context.done ? GenStateCompleted : GenStateSuspendedYield;
              var info = {
                value: record.arg,
                done: context.done
              };
              if (record.arg === ContinueSentinel) {
                if (context.delegate && method === "next") {
                  arg = undefined;
                }
              } else {
                return info;
              }
            } else if (record.type === "throw") {
              state = GenStateCompleted;
              method = "throw";
              arg = record.arg;
            }
          }
        };
      }
      defineIteratorMethods(Gp);
      Gp[iteratorSymbol] = function() {
        return this;
      };
      Gp[toStringTagSymbol] = "Generator";
      Gp.toString = function() {
        return "[object Generator]";
      };
      function pushTryEntry(locs) {
        var entry = {tryLoc: locs[0]};
        if (1 in locs) {
          entry.catchLoc = locs[1];
        }
        if (2 in locs) {
          entry.finallyLoc = locs[2];
          entry.afterLoc = locs[3];
        }
        this.tryEntries.push(entry);
      }
      function resetTryEntry(entry) {
        var record = entry.completion || {};
        record.type = "normal";
        delete record.arg;
        entry.completion = record;
      }
      function Context(tryLocsList) {
        this.tryEntries = [{tryLoc: "root"}];
        tryLocsList.forEach(pushTryEntry, this);
        this.reset(true);
      }
      runtime.keys = function(object) {
        var keys = [];
        for (var key in object) {
          keys.push(key);
        }
        keys.reverse();
        return function next() {
          while (keys.length) {
            var key = keys.pop();
            if (key in object) {
              next.value = key;
              next.done = false;
              return next;
            }
          }
          next.done = true;
          return next;
        };
      };
      function values(iterable) {
        if (iterable) {
          var iteratorMethod = iterable[iteratorSymbol];
          if (iteratorMethod) {
            return iteratorMethod.call(iterable);
          }
          if (typeof iterable.next === "function") {
            return iterable;
          }
          if (!isNaN(iterable.length)) {
            var i = -1,
                next = function next() {
                  while (++i < iterable.length) {
                    if (hasOwn.call(iterable, i)) {
                      next.value = iterable[i];
                      next.done = false;
                      return next;
                    }
                  }
                  next.value = undefined;
                  next.done = true;
                  return next;
                };
            return next.next = next;
          }
        }
        return {next: doneResult};
      }
      runtime.values = values;
      function doneResult() {
        return {
          value: undefined,
          done: true
        };
      }
      Context.prototype = {
        constructor: Context,
        reset: function reset(skipTempReset) {
          this.prev = 0;
          this.next = 0;
          this.sent = undefined;
          this.done = false;
          this.delegate = null;
          this.tryEntries.forEach(resetTryEntry);
          if (!skipTempReset) {
            for (var name in this) {
              if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
                this[name] = undefined;
              }
            }
          }
        },
        stop: function stop() {
          this.done = true;
          var rootEntry = this.tryEntries[0];
          var rootRecord = rootEntry.completion;
          if (rootRecord.type === "throw") {
            throw rootRecord.arg;
          }
          return this.rval;
        },
        dispatchException: function dispatchException(exception) {
          if (this.done) {
            throw exception;
          }
          var context = this;
          function handle(loc, caught) {
            record.type = "throw";
            record.arg = exception;
            context.next = loc;
            return !!caught;
          }
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            var record = entry.completion;
            if (entry.tryLoc === "root") {
              return handle("end");
            }
            if (entry.tryLoc <= this.prev) {
              var hasCatch = hasOwn.call(entry, "catchLoc");
              var hasFinally = hasOwn.call(entry, "finallyLoc");
              if (hasCatch && hasFinally) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                } else if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else if (hasCatch) {
                if (this.prev < entry.catchLoc) {
                  return handle(entry.catchLoc, true);
                }
              } else if (hasFinally) {
                if (this.prev < entry.finallyLoc) {
                  return handle(entry.finallyLoc);
                }
              } else {
                throw new Error("try statement without catch or finally");
              }
            }
          }
        },
        abrupt: function abrupt(type, arg) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
              var finallyEntry = entry;
              break;
            }
          }
          if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
            finallyEntry = null;
          }
          var record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;
          if (finallyEntry) {
            this.next = finallyEntry.finallyLoc;
          } else {
            this.complete(record);
          }
          return ContinueSentinel;
        },
        complete: function complete(record, afterLoc) {
          if (record.type === "throw") {
            throw record.arg;
          }
          if (record.type === "break" || record.type === "continue") {
            this.next = record.arg;
          } else if (record.type === "return") {
            this.rval = record.arg;
            this.next = "end";
          } else if (record.type === "normal" && afterLoc) {
            this.next = afterLoc;
          }
        },
        finish: function finish(finallyLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.finallyLoc === finallyLoc) {
              this.complete(entry.completion, entry.afterLoc);
              resetTryEntry(entry);
              return ContinueSentinel;
            }
          }
        },
        "catch": function _catch(tryLoc) {
          for (var i = this.tryEntries.length - 1; i >= 0; --i) {
            var entry = this.tryEntries[i];
            if (entry.tryLoc === tryLoc) {
              var record = entry.completion;
              if (record.type === "throw") {
                var thrown = record.arg;
                resetTryEntry(entry);
              }
              return thrown;
            }
          }
          throw new Error("illegal catch attempt");
        },
        delegateYield: function delegateYield(iterable, resultName, nextLoc) {
          this.delegate = {
            iterator: values(iterable),
            resultName: resultName,
            nextLoc: nextLoc
          };
          return ContinueSentinel;
        }
      };
    })(typeof global === "object" ? global : typeof window === "object" ? window : typeof self === "object" ? self : undefined);
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/regenerator/index.js", ["npm:babel-runtime@5.8.38/regenerator/runtime.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var g = typeof global === "object" ? global : typeof window === "object" ? window : typeof self === "object" ? self : this;
  var hadRuntime = g.regeneratorRuntime && Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;
  var oldRuntime = hadRuntime && g.regeneratorRuntime;
  g.regeneratorRuntime = undefined;
  module.exports = $__require('npm:babel-runtime@5.8.38/regenerator/runtime.js');
  if (hadRuntime) {
    g.regeneratorRuntime = oldRuntime;
  } else {
    try {
      delete g.regeneratorRuntime;
    } catch (e) {
      g.regeneratorRuntime = undefined;
    }
  }
  module.exports = {
    "default": module.exports,
    __esModule: true
  };
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/regenerator.js", ["npm:babel-runtime@5.8.38/regenerator/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:babel-runtime@5.8.38/regenerator/index.js');
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.object-sap.js", ["npm:core-js@1.2.7/library/modules/$.export.js", "npm:core-js@1.2.7/library/modules/$.core.js", "npm:core-js@1.2.7/library/modules/$.fails.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $export = $__require('npm:core-js@1.2.7/library/modules/$.export.js'),
      core = $__require('npm:core-js@1.2.7/library/modules/$.core.js'),
      fails = $__require('npm:core-js@1.2.7/library/modules/$.fails.js');
  module.exports = function(KEY, exec) {
    var fn = (core.Object || {})[KEY] || Object[KEY],
        exp = {};
    exp[KEY] = exec(fn);
    $export($export.S + $export.F * fails(function() {
      fn(1);
    }), 'Object', exp);
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/es6.object.get-own-property-descriptor.js", ["npm:core-js@1.2.7/library/modules/$.to-iobject.js", "npm:core-js@1.2.7/library/modules/$.object-sap.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toIObject = $__require('npm:core-js@1.2.7/library/modules/$.to-iobject.js');
  $__require('npm:core-js@1.2.7/library/modules/$.object-sap.js')('getOwnPropertyDescriptor', function($getOwnPropertyDescriptor) {
    return function getOwnPropertyDescriptor(it, key) {
      return $getOwnPropertyDescriptor(toIObject(it), key);
    };
  });
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/fn/object/get-own-property-descriptor.js", ["npm:core-js@1.2.7/library/modules/$.js", "npm:core-js@1.2.7/library/modules/es6.object.get-own-property-descriptor.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('npm:core-js@1.2.7/library/modules/$.js');
  $__require('npm:core-js@1.2.7/library/modules/es6.object.get-own-property-descriptor.js');
  module.exports = function getOwnPropertyDescriptor(it, key) {
    return $.getDesc(it, key);
  };
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/core-js/object/get-own-property-descriptor.js", ["npm:core-js@1.2.7/library/fn/object/get-own-property-descriptor.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('npm:core-js@1.2.7/library/fn/object/get-own-property-descriptor.js'),
    __esModule: true
  };
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/helpers/get.js", ["npm:babel-runtime@5.8.38/core-js/object/get-own-property-descriptor.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var _Object$getOwnPropertyDescriptor = $__require('npm:babel-runtime@5.8.38/core-js/object/get-own-property-descriptor.js')["default"];
  exports["default"] = function get(_x, _x2, _x3) {
    var _again = true;
    _function: while (_again) {
      var object = _x,
          property = _x2,
          receiver = _x3;
      _again = false;
      if (object === null)
        object = Function.prototype;
      var desc = _Object$getOwnPropertyDescriptor(object, property);
      if (desc === undefined) {
        var parent = Object.getPrototypeOf(object);
        if (parent === null) {
          return undefined;
        } else {
          _x = parent;
          _x2 = property;
          _x3 = receiver;
          _again = true;
          desc = parent = undefined;
          continue _function;
        }
      } else if ("value" in desc) {
        return desc.value;
      } else {
        var getter = desc.get;
        if (getter === undefined) {
          return undefined;
        }
        return getter.call(receiver);
      }
    }
  };
  exports.__esModule = true;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/fn/object/create.js", ["npm:core-js@1.2.7/library/modules/$.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('npm:core-js@1.2.7/library/modules/$.js');
  module.exports = function create(P, D) {
    return $.create(P, D);
  };
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/core-js/object/create.js", ["npm:core-js@1.2.7/library/fn/object/create.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('npm:core-js@1.2.7/library/fn/object/create.js'),
    __esModule: true
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.set-proto.js", ["npm:core-js@1.2.7/library/modules/$.js", "npm:core-js@1.2.7/library/modules/$.is-object.js", "npm:core-js@1.2.7/library/modules/$.an-object.js", "npm:core-js@1.2.7/library/modules/$.ctx.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getDesc = $__require('npm:core-js@1.2.7/library/modules/$.js').getDesc,
      isObject = $__require('npm:core-js@1.2.7/library/modules/$.is-object.js'),
      anObject = $__require('npm:core-js@1.2.7/library/modules/$.an-object.js');
  var check = function(O, proto) {
    anObject(O);
    if (!isObject(proto) && proto !== null)
      throw TypeError(proto + ": can't set as prototype!");
  };
  module.exports = {
    set: Object.setPrototypeOf || ('__proto__' in {} ? function(test, buggy, set) {
      try {
        set = $__require('npm:core-js@1.2.7/library/modules/$.ctx.js')(Function.call, getDesc(Object.prototype, '__proto__').set, 2);
        set(test, []);
        buggy = !(test instanceof Array);
      } catch (e) {
        buggy = true;
      }
      return function setPrototypeOf(O, proto) {
        check(O, proto);
        if (buggy)
          O.__proto__ = proto;
        else
          set(O, proto);
        return O;
      };
    }({}, false) : undefined),
    check: check
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/es6.object.set-prototype-of.js", ["npm:core-js@1.2.7/library/modules/$.export.js", "npm:core-js@1.2.7/library/modules/$.set-proto.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $export = $__require('npm:core-js@1.2.7/library/modules/$.export.js');
  $export($export.S, 'Object', {setPrototypeOf: $__require('npm:core-js@1.2.7/library/modules/$.set-proto.js').set});
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/fn/object/set-prototype-of.js", ["npm:core-js@1.2.7/library/modules/es6.object.set-prototype-of.js", "npm:core-js@1.2.7/library/modules/$.core.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('npm:core-js@1.2.7/library/modules/es6.object.set-prototype-of.js');
  module.exports = $__require('npm:core-js@1.2.7/library/modules/$.core.js').Object.setPrototypeOf;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/core-js/object/set-prototype-of.js", ["npm:core-js@1.2.7/library/fn/object/set-prototype-of.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('npm:core-js@1.2.7/library/fn/object/set-prototype-of.js'),
    __esModule: true
  };
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/helpers/inherits.js", ["npm:babel-runtime@5.8.38/core-js/object/create.js", "npm:babel-runtime@5.8.38/core-js/object/set-prototype-of.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var _Object$create = $__require('npm:babel-runtime@5.8.38/core-js/object/create.js')["default"];
  var _Object$setPrototypeOf = $__require('npm:babel-runtime@5.8.38/core-js/object/set-prototype-of.js')["default"];
  exports["default"] = function(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }
    subClass.prototype = _Object$create(superClass && superClass.prototype, {constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }});
    if (superClass)
      _Object$setPrototypeOf ? _Object$setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };
  exports.__esModule = true;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/fn/object/define-property.js", ["npm:core-js@1.2.7/library/modules/$.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('npm:core-js@1.2.7/library/modules/$.js');
  module.exports = function defineProperty(it, key, desc) {
    return $.setDesc(it, key, desc);
  };
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/core-js/object/define-property.js", ["npm:core-js@1.2.7/library/fn/object/define-property.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('npm:core-js@1.2.7/library/fn/object/define-property.js'),
    __esModule: true
  };
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/helpers/create-class.js", ["npm:babel-runtime@5.8.38/core-js/object/define-property.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var _Object$defineProperty = $__require('npm:babel-runtime@5.8.38/core-js/object/define-property.js')["default"];
  exports["default"] = (function() {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor)
          descriptor.writable = true;
        _Object$defineProperty(target, descriptor.key, descriptor);
      }
    }
    return function(Constructor, protoProps, staticProps) {
      if (protoProps)
        defineProperties(Constructor.prototype, protoProps);
      if (staticProps)
        defineProperties(Constructor, staticProps);
      return Constructor;
    };
  })();
  exports.__esModule = true;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/helpers/class-call-check.js", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  exports["default"] = function(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };
  exports.__esModule = true;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/helpers/to-consumable-array.js", ["npm:babel-runtime@5.8.38/core-js/array/from.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var _Array$from = $__require('npm:babel-runtime@5.8.38/core-js/array/from.js')["default"];
  exports["default"] = function(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0,
          arr2 = Array(arr.length); i < arr.length; i++)
        arr2[i] = arr[i];
      return arr2;
    } else {
      return _Array$from(arr);
    }
  };
  exports.__esModule = true;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/helpers/bind.js", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  exports["default"] = Function.prototype.bind;
  exports.__esModule = true;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.add-to-unscopables.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function() {};
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.iter-step.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(done, value) {
    return {
      value: value,
      done: !!done
    };
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.iobject.js", ["npm:core-js@1.2.7/library/modules/$.cof.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var cof = $__require('npm:core-js@1.2.7/library/modules/$.cof.js');
  module.exports = Object('z').propertyIsEnumerable(0) ? Object : function(it) {
    return cof(it) == 'String' ? it.split('') : Object(it);
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.to-iobject.js", ["npm:core-js@1.2.7/library/modules/$.iobject.js", "npm:core-js@1.2.7/library/modules/$.defined.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var IObject = $__require('npm:core-js@1.2.7/library/modules/$.iobject.js'),
      defined = $__require('npm:core-js@1.2.7/library/modules/$.defined.js');
  module.exports = function(it) {
    return IObject(defined(it));
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/es6.array.iterator.js", ["npm:core-js@1.2.7/library/modules/$.add-to-unscopables.js", "npm:core-js@1.2.7/library/modules/$.iter-step.js", "npm:core-js@1.2.7/library/modules/$.iterators.js", "npm:core-js@1.2.7/library/modules/$.to-iobject.js", "npm:core-js@1.2.7/library/modules/$.iter-define.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var addToUnscopables = $__require('npm:core-js@1.2.7/library/modules/$.add-to-unscopables.js'),
      step = $__require('npm:core-js@1.2.7/library/modules/$.iter-step.js'),
      Iterators = $__require('npm:core-js@1.2.7/library/modules/$.iterators.js'),
      toIObject = $__require('npm:core-js@1.2.7/library/modules/$.to-iobject.js');
  module.exports = $__require('npm:core-js@1.2.7/library/modules/$.iter-define.js')(Array, 'Array', function(iterated, kind) {
    this._t = toIObject(iterated);
    this._i = 0;
    this._k = kind;
  }, function() {
    var O = this._t,
        kind = this._k,
        index = this._i++;
    if (!O || index >= O.length) {
      this._t = undefined;
      return step(1);
    }
    if (kind == 'keys')
      return step(0, index);
    if (kind == 'values')
      return step(0, O[index]);
    return step(0, [index, O[index]]);
  }, 'values');
  Iterators.Arguments = Iterators.Array;
  addToUnscopables('keys');
  addToUnscopables('values');
  addToUnscopables('entries');
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/web.dom.iterable.js", ["npm:core-js@1.2.7/library/modules/es6.array.iterator.js", "npm:core-js@1.2.7/library/modules/$.iterators.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('npm:core-js@1.2.7/library/modules/es6.array.iterator.js');
  var Iterators = $__require('npm:core-js@1.2.7/library/modules/$.iterators.js');
  Iterators.NodeList = Iterators.HTMLCollection = Iterators.Array;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/core.get-iterator.js", ["npm:core-js@1.2.7/library/modules/$.an-object.js", "npm:core-js@1.2.7/library/modules/core.get-iterator-method.js", "npm:core-js@1.2.7/library/modules/$.core.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var anObject = $__require('npm:core-js@1.2.7/library/modules/$.an-object.js'),
      get = $__require('npm:core-js@1.2.7/library/modules/core.get-iterator-method.js');
  module.exports = $__require('npm:core-js@1.2.7/library/modules/$.core.js').getIterator = function(it) {
    var iterFn = get(it);
    if (typeof iterFn != 'function')
      throw TypeError(it + ' is not iterable!');
    return anObject(iterFn.call(it));
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/fn/get-iterator.js", ["npm:core-js@1.2.7/library/modules/web.dom.iterable.js", "npm:core-js@1.2.7/library/modules/es6.string.iterator.js", "npm:core-js@1.2.7/library/modules/core.get-iterator.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('npm:core-js@1.2.7/library/modules/web.dom.iterable.js');
  $__require('npm:core-js@1.2.7/library/modules/es6.string.iterator.js');
  module.exports = $__require('npm:core-js@1.2.7/library/modules/core.get-iterator.js');
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/core-js/get-iterator.js", ["npm:core-js@1.2.7/library/fn/get-iterator.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('npm:core-js@1.2.7/library/fn/get-iterator.js'),
    __esModule: true
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.string-at.js", ["npm:core-js@1.2.7/library/modules/$.to-integer.js", "npm:core-js@1.2.7/library/modules/$.defined.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toInteger = $__require('npm:core-js@1.2.7/library/modules/$.to-integer.js'),
      defined = $__require('npm:core-js@1.2.7/library/modules/$.defined.js');
  module.exports = function(TO_STRING) {
    return function(that, pos) {
      var s = String(defined(that)),
          i = toInteger(pos),
          l = s.length,
          a,
          b;
      if (i < 0 || i >= l)
        return TO_STRING ? '' : undefined;
      a = s.charCodeAt(i);
      return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff ? TO_STRING ? s.charAt(i) : a : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
    };
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.library.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = true;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.redefine.js", ["npm:core-js@1.2.7/library/modules/$.hide.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:core-js@1.2.7/library/modules/$.hide.js');
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.property-desc.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(bitmap, value) {
    return {
      enumerable: !(bitmap & 1),
      configurable: !(bitmap & 2),
      writable: !(bitmap & 4),
      value: value
    };
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.fails.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(exec) {
    try {
      return !!exec();
    } catch (e) {
      return true;
    }
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.descriptors.js", ["npm:core-js@1.2.7/library/modules/$.fails.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = !$__require('npm:core-js@1.2.7/library/modules/$.fails.js')(function() {
    return Object.defineProperty({}, 'a', {get: function() {
        return 7;
      }}).a != 7;
  });
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.hide.js", ["npm:core-js@1.2.7/library/modules/$.js", "npm:core-js@1.2.7/library/modules/$.property-desc.js", "npm:core-js@1.2.7/library/modules/$.descriptors.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('npm:core-js@1.2.7/library/modules/$.js'),
      createDesc = $__require('npm:core-js@1.2.7/library/modules/$.property-desc.js');
  module.exports = $__require('npm:core-js@1.2.7/library/modules/$.descriptors.js') ? function(object, key, value) {
    return $.setDesc(object, key, createDesc(1, value));
  } : function(object, key, value) {
    object[key] = value;
    return object;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.iter-create.js", ["npm:core-js@1.2.7/library/modules/$.js", "npm:core-js@1.2.7/library/modules/$.property-desc.js", "npm:core-js@1.2.7/library/modules/$.set-to-string-tag.js", "npm:core-js@1.2.7/library/modules/$.hide.js", "npm:core-js@1.2.7/library/modules/$.wks.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $ = $__require('npm:core-js@1.2.7/library/modules/$.js'),
      descriptor = $__require('npm:core-js@1.2.7/library/modules/$.property-desc.js'),
      setToStringTag = $__require('npm:core-js@1.2.7/library/modules/$.set-to-string-tag.js'),
      IteratorPrototype = {};
  $__require('npm:core-js@1.2.7/library/modules/$.hide.js')(IteratorPrototype, $__require('npm:core-js@1.2.7/library/modules/$.wks.js')('iterator'), function() {
    return this;
  });
  module.exports = function(Constructor, NAME, next) {
    Constructor.prototype = $.create(IteratorPrototype, {next: descriptor(1, next)});
    setToStringTag(Constructor, NAME + ' Iterator');
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.has.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var hasOwnProperty = {}.hasOwnProperty;
  module.exports = function(it, key) {
    return hasOwnProperty.call(it, key);
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.set-to-string-tag.js", ["npm:core-js@1.2.7/library/modules/$.js", "npm:core-js@1.2.7/library/modules/$.has.js", "npm:core-js@1.2.7/library/modules/$.wks.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var def = $__require('npm:core-js@1.2.7/library/modules/$.js').setDesc,
      has = $__require('npm:core-js@1.2.7/library/modules/$.has.js'),
      TAG = $__require('npm:core-js@1.2.7/library/modules/$.wks.js')('toStringTag');
  module.exports = function(it, tag, stat) {
    if (it && !has(it = stat ? it : it.prototype, TAG))
      def(it, TAG, {
        configurable: true,
        value: tag
      });
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $Object = Object;
  module.exports = {
    create: $Object.create,
    getProto: $Object.getPrototypeOf,
    isEnum: {}.propertyIsEnumerable,
    getDesc: $Object.getOwnPropertyDescriptor,
    setDesc: $Object.defineProperty,
    setDescs: $Object.defineProperties,
    getKeys: $Object.keys,
    getNames: $Object.getOwnPropertyNames,
    getSymbols: $Object.getOwnPropertySymbols,
    each: [].forEach
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.iter-define.js", ["npm:core-js@1.2.7/library/modules/$.library.js", "npm:core-js@1.2.7/library/modules/$.export.js", "npm:core-js@1.2.7/library/modules/$.redefine.js", "npm:core-js@1.2.7/library/modules/$.hide.js", "npm:core-js@1.2.7/library/modules/$.has.js", "npm:core-js@1.2.7/library/modules/$.iterators.js", "npm:core-js@1.2.7/library/modules/$.iter-create.js", "npm:core-js@1.2.7/library/modules/$.set-to-string-tag.js", "npm:core-js@1.2.7/library/modules/$.js", "npm:core-js@1.2.7/library/modules/$.wks.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var LIBRARY = $__require('npm:core-js@1.2.7/library/modules/$.library.js'),
      $export = $__require('npm:core-js@1.2.7/library/modules/$.export.js'),
      redefine = $__require('npm:core-js@1.2.7/library/modules/$.redefine.js'),
      hide = $__require('npm:core-js@1.2.7/library/modules/$.hide.js'),
      has = $__require('npm:core-js@1.2.7/library/modules/$.has.js'),
      Iterators = $__require('npm:core-js@1.2.7/library/modules/$.iterators.js'),
      $iterCreate = $__require('npm:core-js@1.2.7/library/modules/$.iter-create.js'),
      setToStringTag = $__require('npm:core-js@1.2.7/library/modules/$.set-to-string-tag.js'),
      getProto = $__require('npm:core-js@1.2.7/library/modules/$.js').getProto,
      ITERATOR = $__require('npm:core-js@1.2.7/library/modules/$.wks.js')('iterator'),
      BUGGY = !([].keys && 'next' in [].keys()),
      FF_ITERATOR = '@@iterator',
      KEYS = 'keys',
      VALUES = 'values';
  var returnThis = function() {
    return this;
  };
  module.exports = function(Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
    $iterCreate(Constructor, NAME, next);
    var getMethod = function(kind) {
      if (!BUGGY && kind in proto)
        return proto[kind];
      switch (kind) {
        case KEYS:
          return function keys() {
            return new Constructor(this, kind);
          };
        case VALUES:
          return function values() {
            return new Constructor(this, kind);
          };
      }
      return function entries() {
        return new Constructor(this, kind);
      };
    };
    var TAG = NAME + ' Iterator',
        DEF_VALUES = DEFAULT == VALUES,
        VALUES_BUG = false,
        proto = Base.prototype,
        $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT],
        $default = $native || getMethod(DEFAULT),
        methods,
        key;
    if ($native) {
      var IteratorPrototype = getProto($default.call(new Base));
      setToStringTag(IteratorPrototype, TAG, true);
      if (!LIBRARY && has(proto, FF_ITERATOR))
        hide(IteratorPrototype, ITERATOR, returnThis);
      if (DEF_VALUES && $native.name !== VALUES) {
        VALUES_BUG = true;
        $default = function values() {
          return $native.call(this);
        };
      }
    }
    if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
      hide(proto, ITERATOR, $default);
    }
    Iterators[NAME] = $default;
    Iterators[TAG] = returnThis;
    if (DEFAULT) {
      methods = {
        values: DEF_VALUES ? $default : getMethod(VALUES),
        keys: IS_SET ? $default : getMethod(KEYS),
        entries: !DEF_VALUES ? $default : getMethod('entries')
      };
      if (FORCED)
        for (key in methods) {
          if (!(key in proto))
            redefine(proto, key, methods[key]);
        }
      else
        $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
    }
    return methods;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/es6.string.iterator.js", ["npm:core-js@1.2.7/library/modules/$.string-at.js", "npm:core-js@1.2.7/library/modules/$.iter-define.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var $at = $__require('npm:core-js@1.2.7/library/modules/$.string-at.js')(true);
  $__require('npm:core-js@1.2.7/library/modules/$.iter-define.js')(String, 'String', function(iterated) {
    this._t = String(iterated);
    this._i = 0;
  }, function() {
    var O = this._t,
        index = this._i,
        point;
    if (index >= O.length)
      return {
        value: undefined,
        done: true
      };
    point = $at(O, index);
    this._i += point.length;
    return {
      value: point,
      done: false
    };
  });
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.a-function.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(it) {
    if (typeof it != 'function')
      throw TypeError(it + ' is not a function!');
    return it;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.ctx.js", ["npm:core-js@1.2.7/library/modules/$.a-function.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var aFunction = $__require('npm:core-js@1.2.7/library/modules/$.a-function.js');
  module.exports = function(fn, that, length) {
    aFunction(fn);
    if (that === undefined)
      return fn;
    switch (length) {
      case 1:
        return function(a) {
          return fn.call(that, a);
        };
      case 2:
        return function(a, b) {
          return fn.call(that, a, b);
        };
      case 3:
        return function(a, b, c) {
          return fn.call(that, a, b, c);
        };
    }
    return function() {
      return fn.apply(that, arguments);
    };
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.export.js", ["npm:core-js@1.2.7/library/modules/$.global.js", "npm:core-js@1.2.7/library/modules/$.core.js", "npm:core-js@1.2.7/library/modules/$.ctx.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var global = $__require('npm:core-js@1.2.7/library/modules/$.global.js'),
      core = $__require('npm:core-js@1.2.7/library/modules/$.core.js'),
      ctx = $__require('npm:core-js@1.2.7/library/modules/$.ctx.js'),
      PROTOTYPE = 'prototype';
  var $export = function(type, name, source) {
    var IS_FORCED = type & $export.F,
        IS_GLOBAL = type & $export.G,
        IS_STATIC = type & $export.S,
        IS_PROTO = type & $export.P,
        IS_BIND = type & $export.B,
        IS_WRAP = type & $export.W,
        exports = IS_GLOBAL ? core : core[name] || (core[name] = {}),
        target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE],
        key,
        own,
        out;
    if (IS_GLOBAL)
      source = name;
    for (key in source) {
      own = !IS_FORCED && target && key in target;
      if (own && key in exports)
        continue;
      out = own ? target[key] : source[key];
      exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key] : IS_BIND && own ? ctx(out, global) : IS_WRAP && target[key] == out ? (function(C) {
        var F = function(param) {
          return this instanceof C ? new C(param) : C(param);
        };
        F[PROTOTYPE] = C[PROTOTYPE];
        return F;
      })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
      if (IS_PROTO)
        (exports[PROTOTYPE] || (exports[PROTOTYPE] = {}))[key] = out;
    }
  };
  $export.F = 1;
  $export.G = 2;
  $export.S = 4;
  $export.P = 8;
  $export.B = 16;
  $export.W = 32;
  module.exports = $export;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.defined.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(it) {
    if (it == undefined)
      throw TypeError("Can't call method on  " + it);
    return it;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.to-object.js", ["npm:core-js@1.2.7/library/modules/$.defined.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var defined = $__require('npm:core-js@1.2.7/library/modules/$.defined.js');
  module.exports = function(it) {
    return Object(defined(it));
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.is-object.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = function(it) {
    return typeof it === 'object' ? it !== null : typeof it === 'function';
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.an-object.js", ["npm:core-js@1.2.7/library/modules/$.is-object.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var isObject = $__require('npm:core-js@1.2.7/library/modules/$.is-object.js');
  module.exports = function(it) {
    if (!isObject(it))
      throw TypeError(it + ' is not an object!');
    return it;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.iter-call.js", ["npm:core-js@1.2.7/library/modules/$.an-object.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var anObject = $__require('npm:core-js@1.2.7/library/modules/$.an-object.js');
  module.exports = function(iterator, fn, value, entries) {
    try {
      return entries ? fn(anObject(value)[0], value[1]) : fn(value);
    } catch (e) {
      var ret = iterator['return'];
      if (ret !== undefined)
        anObject(ret.call(iterator));
      throw e;
    }
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.is-array-iter.js", ["npm:core-js@1.2.7/library/modules/$.iterators.js", "npm:core-js@1.2.7/library/modules/$.wks.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var Iterators = $__require('npm:core-js@1.2.7/library/modules/$.iterators.js'),
      ITERATOR = $__require('npm:core-js@1.2.7/library/modules/$.wks.js')('iterator'),
      ArrayProto = Array.prototype;
  module.exports = function(it) {
    return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.to-integer.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var ceil = Math.ceil,
      floor = Math.floor;
  module.exports = function(it) {
    return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.to-length.js", ["npm:core-js@1.2.7/library/modules/$.to-integer.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toInteger = $__require('npm:core-js@1.2.7/library/modules/$.to-integer.js'),
      min = Math.min;
  module.exports = function(it) {
    return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.cof.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toString = {}.toString;
  module.exports = function(it) {
    return toString.call(it).slice(8, -1);
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.classof.js", ["npm:core-js@1.2.7/library/modules/$.cof.js", "npm:core-js@1.2.7/library/modules/$.wks.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var cof = $__require('npm:core-js@1.2.7/library/modules/$.cof.js'),
      TAG = $__require('npm:core-js@1.2.7/library/modules/$.wks.js')('toStringTag'),
      ARG = cof(function() {
        return arguments;
      }()) == 'Arguments';
  module.exports = function(it) {
    var O,
        T,
        B;
    return it === undefined ? 'Undefined' : it === null ? 'Null' : typeof(T = (O = Object(it))[TAG]) == 'string' ? T : ARG ? cof(O) : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.iterators.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {};
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/core.get-iterator-method.js", ["npm:core-js@1.2.7/library/modules/$.classof.js", "npm:core-js@1.2.7/library/modules/$.wks.js", "npm:core-js@1.2.7/library/modules/$.iterators.js", "npm:core-js@1.2.7/library/modules/$.core.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var classof = $__require('npm:core-js@1.2.7/library/modules/$.classof.js'),
      ITERATOR = $__require('npm:core-js@1.2.7/library/modules/$.wks.js')('iterator'),
      Iterators = $__require('npm:core-js@1.2.7/library/modules/$.iterators.js');
  module.exports = $__require('npm:core-js@1.2.7/library/modules/$.core.js').getIteratorMethod = function(it) {
    if (it != undefined)
      return it[ITERATOR] || it['@@iterator'] || Iterators[classof(it)];
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.shared.js", ["npm:core-js@1.2.7/library/modules/$.global.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var global = $__require('npm:core-js@1.2.7/library/modules/$.global.js'),
      SHARED = '__core-js_shared__',
      store = global[SHARED] || (global[SHARED] = {});
  module.exports = function(key) {
    return store[key] || (store[key] = {});
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.uid.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var id = 0,
      px = Math.random();
  module.exports = function(key) {
    return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.global.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var global = module.exports = typeof window != 'undefined' && window.Math == Math ? window : typeof self != 'undefined' && self.Math == Math ? self : Function('return this')();
  if (typeof __g == 'number')
    __g = global;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.wks.js", ["npm:core-js@1.2.7/library/modules/$.shared.js", "npm:core-js@1.2.7/library/modules/$.uid.js", "npm:core-js@1.2.7/library/modules/$.global.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var store = $__require('npm:core-js@1.2.7/library/modules/$.shared.js')('wks'),
      uid = $__require('npm:core-js@1.2.7/library/modules/$.uid.js'),
      Symbol = $__require('npm:core-js@1.2.7/library/modules/$.global.js').Symbol;
  module.exports = function(name) {
    return store[name] || (store[name] = Symbol && Symbol[name] || (Symbol || uid)('Symbol.' + name));
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.iter-detect.js", ["npm:core-js@1.2.7/library/modules/$.wks.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var ITERATOR = $__require('npm:core-js@1.2.7/library/modules/$.wks.js')('iterator'),
      SAFE_CLOSING = false;
  try {
    var riter = [7][ITERATOR]();
    riter['return'] = function() {
      SAFE_CLOSING = true;
    };
    Array.from(riter, function() {
      throw 2;
    });
  } catch (e) {}
  module.exports = function(exec, skipClosing) {
    if (!skipClosing && !SAFE_CLOSING)
      return false;
    var safe = false;
    try {
      var arr = [7],
          iter = arr[ITERATOR]();
      iter.next = function() {
        return {done: safe = true};
      };
      arr[ITERATOR] = function() {
        return iter;
      };
      exec(arr);
    } catch (e) {}
    return safe;
  };
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/es6.array.from.js", ["npm:core-js@1.2.7/library/modules/$.ctx.js", "npm:core-js@1.2.7/library/modules/$.export.js", "npm:core-js@1.2.7/library/modules/$.to-object.js", "npm:core-js@1.2.7/library/modules/$.iter-call.js", "npm:core-js@1.2.7/library/modules/$.is-array-iter.js", "npm:core-js@1.2.7/library/modules/$.to-length.js", "npm:core-js@1.2.7/library/modules/core.get-iterator-method.js", "npm:core-js@1.2.7/library/modules/$.iter-detect.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var ctx = $__require('npm:core-js@1.2.7/library/modules/$.ctx.js'),
      $export = $__require('npm:core-js@1.2.7/library/modules/$.export.js'),
      toObject = $__require('npm:core-js@1.2.7/library/modules/$.to-object.js'),
      call = $__require('npm:core-js@1.2.7/library/modules/$.iter-call.js'),
      isArrayIter = $__require('npm:core-js@1.2.7/library/modules/$.is-array-iter.js'),
      toLength = $__require('npm:core-js@1.2.7/library/modules/$.to-length.js'),
      getIterFn = $__require('npm:core-js@1.2.7/library/modules/core.get-iterator-method.js');
  $export($export.S + $export.F * !$__require('npm:core-js@1.2.7/library/modules/$.iter-detect.js')(function(iter) {
    Array.from(iter);
  }), 'Array', {from: function from(arrayLike) {
      var O = toObject(arrayLike),
          C = typeof this == 'function' ? this : Array,
          $$ = arguments,
          $$len = $$.length,
          mapfn = $$len > 1 ? $$[1] : undefined,
          mapping = mapfn !== undefined,
          index = 0,
          iterFn = getIterFn(O),
          length,
          result,
          step,
          iterator;
      if (mapping)
        mapfn = ctx(mapfn, $$len > 2 ? $$[2] : undefined, 2);
      if (iterFn != undefined && !(C == Array && isArrayIter(iterFn))) {
        for (iterator = iterFn.call(O), result = new C; !(step = iterator.next()).done; index++) {
          result[index] = mapping ? call(iterator, mapfn, [step.value, index], true) : step.value;
        }
      } else {
        length = toLength(O.length);
        for (result = new C(length); length > index; index++) {
          result[index] = mapping ? mapfn(O[index], index) : O[index];
        }
      }
      result.length = index;
      return result;
    }});
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/modules/$.core.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var core = module.exports = {version: '1.2.6'};
  if (typeof __e == 'number')
    __e = core;
  return module.exports;
});

System.registerDynamic("npm:core-js@1.2.7/library/fn/array/from.js", ["npm:core-js@1.2.7/library/modules/es6.string.iterator.js", "npm:core-js@1.2.7/library/modules/es6.array.from.js", "npm:core-js@1.2.7/library/modules/$.core.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  $__require('npm:core-js@1.2.7/library/modules/es6.string.iterator.js');
  $__require('npm:core-js@1.2.7/library/modules/es6.array.from.js');
  module.exports = $__require('npm:core-js@1.2.7/library/modules/$.core.js').Array.from;
  return module.exports;
});

System.registerDynamic("npm:babel-runtime@5.8.38/core-js/array/from.js", ["npm:core-js@1.2.7/library/fn/array/from.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = {
    "default": $__require('npm:core-js@1.2.7/library/fn/array/from.js'),
    __esModule: true
  };
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isPlainObject.js", ["npm:lodash@4.17.4/_baseGetTag.js", "npm:lodash@4.17.4/_getPrototype.js", "npm:lodash@4.17.4/isObjectLike.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      getPrototype = $__require('npm:lodash@4.17.4/_getPrototype.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var objectTag = '[object Object]';
  var funcProto = Function.prototype,
      objectProto = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var objectCtorString = funcToString.call(Object);
  function isPlainObject(value) {
    if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
      return false;
    }
    var proto = getPrototype(value);
    if (proto === null) {
      return true;
    }
    var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
    return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
  }
  module.exports = isPlainObject;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isString.js", ["npm:lodash@4.17.4/_baseGetTag.js", "npm:lodash@4.17.4/isArray.js", "npm:lodash@4.17.4/isObjectLike.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      isArray = $__require('npm:lodash@4.17.4/isArray.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var stringTag = '[object String]';
  function isString(value) {
    return typeof value == 'string' || (!isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag);
  }
  module.exports = isString;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isBoolean.js", ["npm:lodash@4.17.4/_baseGetTag.js", "npm:lodash@4.17.4/isObjectLike.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var boolTag = '[object Boolean]';
  function isBoolean(value) {
    return value === true || value === false || (isObjectLike(value) && baseGetTag(value) == boolTag);
  }
  module.exports = isBoolean;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isNumber.js", ["npm:lodash@4.17.4/_baseGetTag.js", "npm:lodash@4.17.4/isObjectLike.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var numberTag = '[object Number]';
  function isNumber(value) {
    return typeof value == 'number' || (isObjectLike(value) && baseGetTag(value) == numberTag);
  }
  module.exports = isNumber;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isInteger.js", ["npm:lodash@4.17.4/toInteger.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toInteger = $__require('npm:lodash@4.17.4/toInteger.js');
  function isInteger(value) {
    return typeof value == 'number' && value == toInteger(value);
  }
  module.exports = isInteger;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isSymbol.js", ["npm:lodash@4.17.4/_baseGetTag.js", "npm:lodash@4.17.4/isObjectLike.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var symbolTag = '[object Symbol]';
  function isSymbol(value) {
    return typeof value == 'symbol' || (isObjectLike(value) && baseGetTag(value) == symbolTag);
  }
  module.exports = isSymbol;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/toNumber.js", ["npm:lodash@4.17.4/isObject.js", "npm:lodash@4.17.4/isSymbol.js", "@empty"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var isObject = $__require('npm:lodash@4.17.4/isObject.js'),
        isSymbol = $__require('npm:lodash@4.17.4/isSymbol.js');
    var NAN = 0 / 0;
    var reTrim = /^\s+|\s+$/g;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value)) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : (reIsBadHex.test(value) ? NAN : +value);
    }
    module.exports = toNumber;
  })($__require('@empty'));
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/toFinite.js", ["npm:lodash@4.17.4/toNumber.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toNumber = $__require('npm:lodash@4.17.4/toNumber.js');
  var INFINITY = 1 / 0,
      MAX_INTEGER = 1.7976931348623157e+308;
  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
      var sign = (value < 0 ? -1 : 1);
      return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }
  module.exports = toFinite;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/toInteger.js", ["npm:lodash@4.17.4/toFinite.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var toFinite = $__require('npm:lodash@4.17.4/toFinite.js');
  function toInteger(value) {
    var result = toFinite(value),
        remainder = result % 1;
    return result === result ? (remainder ? result - remainder : result) : 0;
  }
  module.exports = toInteger;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_setCacheAdd.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var HASH_UNDEFINED = '__lodash_hash_undefined__';
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED);
    return this;
  }
  module.exports = setCacheAdd;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_setCacheHas.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function setCacheHas(value) {
    return this.__data__.has(value);
  }
  module.exports = setCacheHas;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_SetCache.js", ["npm:lodash@4.17.4/_MapCache.js", "npm:lodash@4.17.4/_setCacheAdd.js", "npm:lodash@4.17.4/_setCacheHas.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var MapCache = $__require('npm:lodash@4.17.4/_MapCache.js'),
      setCacheAdd = $__require('npm:lodash@4.17.4/_setCacheAdd.js'),
      setCacheHas = $__require('npm:lodash@4.17.4/_setCacheHas.js');
  function SetCache(values) {
    var index = -1,
        length = values == null ? 0 : values.length;
    this.__data__ = new MapCache;
    while (++index < length) {
      this.add(values[index]);
    }
  }
  SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
  SetCache.prototype.has = setCacheHas;
  module.exports = SetCache;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_arraySome.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function arraySome(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length;
    while (++index < length) {
      if (predicate(array[index], index, array)) {
        return true;
      }
    }
    return false;
  }
  module.exports = arraySome;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_cacheHas.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function cacheHas(cache, key) {
    return cache.has(key);
  }
  module.exports = cacheHas;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_equalArrays.js", ["npm:lodash@4.17.4/_SetCache.js", "npm:lodash@4.17.4/_arraySome.js", "npm:lodash@4.17.4/_cacheHas.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var SetCache = $__require('npm:lodash@4.17.4/_SetCache.js'),
      arraySome = $__require('npm:lodash@4.17.4/_arraySome.js'),
      cacheHas = $__require('npm:lodash@4.17.4/_cacheHas.js');
  var COMPARE_PARTIAL_FLAG = 1,
      COMPARE_UNORDERED_FLAG = 2;
  function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
        arrLength = array.length,
        othLength = other.length;
    if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
      return false;
    }
    var stacked = stack.get(array);
    if (stacked && stack.get(other)) {
      return stacked == other;
    }
    var index = -1,
        result = true,
        seen = (bitmask & COMPARE_UNORDERED_FLAG) ? new SetCache : undefined;
    stack.set(array, other);
    stack.set(other, array);
    while (++index < arrLength) {
      var arrValue = array[index],
          othValue = other[index];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
      }
      if (compared !== undefined) {
        if (compared) {
          continue;
        }
        result = false;
        break;
      }
      if (seen) {
        if (!arraySome(other, function(othValue, othIndex) {
          if (!cacheHas(seen, othIndex) && (arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
            return seen.push(othIndex);
          }
        })) {
          result = false;
          break;
        }
      } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
        result = false;
        break;
      }
    }
    stack['delete'](array);
    stack['delete'](other);
    return result;
  }
  module.exports = equalArrays;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_equalByTag.js", ["npm:lodash@4.17.4/_Symbol.js", "npm:lodash@4.17.4/_Uint8Array.js", "npm:lodash@4.17.4/eq.js", "npm:lodash@4.17.4/_equalArrays.js", "npm:lodash@4.17.4/_mapToArray.js", "npm:lodash@4.17.4/_setToArray.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var Symbol = $__require('npm:lodash@4.17.4/_Symbol.js'),
      Uint8Array = $__require('npm:lodash@4.17.4/_Uint8Array.js'),
      eq = $__require('npm:lodash@4.17.4/eq.js'),
      equalArrays = $__require('npm:lodash@4.17.4/_equalArrays.js'),
      mapToArray = $__require('npm:lodash@4.17.4/_mapToArray.js'),
      setToArray = $__require('npm:lodash@4.17.4/_setToArray.js');
  var COMPARE_PARTIAL_FLAG = 1,
      COMPARE_UNORDERED_FLAG = 2;
  var boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]';
  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]';
  var symbolProto = Symbol ? Symbol.prototype : undefined,
      symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
  function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
    switch (tag) {
      case dataViewTag:
        if ((object.byteLength != other.byteLength) || (object.byteOffset != other.byteOffset)) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;
      case arrayBufferTag:
        if ((object.byteLength != other.byteLength) || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
          return false;
        }
        return true;
      case boolTag:
      case dateTag:
      case numberTag:
        return eq(+object, +other);
      case errorTag:
        return object.name == other.name && object.message == other.message;
      case regexpTag:
      case stringTag:
        return object == (other + '');
      case mapTag:
        var convert = mapToArray;
      case setTag:
        var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
        convert || (convert = setToArray);
        if (object.size != other.size && !isPartial) {
          return false;
        }
        var stacked = stack.get(object);
        if (stacked) {
          return stacked == other;
        }
        bitmask |= COMPARE_UNORDERED_FLAG;
        stack.set(object, other);
        var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
        stack['delete'](object);
        return result;
      case symbolTag:
        if (symbolValueOf) {
          return symbolValueOf.call(object) == symbolValueOf.call(other);
        }
    }
    return false;
  }
  module.exports = equalByTag;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_equalObjects.js", ["npm:lodash@4.17.4/_getAllKeys.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getAllKeys = $__require('npm:lodash@4.17.4/_getAllKeys.js');
  var COMPARE_PARTIAL_FLAG = 1;
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
    var isPartial = bitmask & COMPARE_PARTIAL_FLAG,
        objProps = getAllKeys(object),
        objLength = objProps.length,
        othProps = getAllKeys(other),
        othLength = othProps.length;
    if (objLength != othLength && !isPartial) {
      return false;
    }
    var index = objLength;
    while (index--) {
      var key = objProps[index];
      if (!(isPartial ? key in other : hasOwnProperty.call(other, key))) {
        return false;
      }
    }
    var stacked = stack.get(object);
    if (stacked && stack.get(other)) {
      return stacked == other;
    }
    var result = true;
    stack.set(object, other);
    stack.set(other, object);
    var skipCtor = isPartial;
    while (++index < objLength) {
      key = objProps[index];
      var objValue = object[key],
          othValue = other[key];
      if (customizer) {
        var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
      }
      if (!(compared === undefined ? (objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack)) : compared)) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == 'constructor');
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor,
          othCtor = other.constructor;
      if (objCtor != othCtor && ('constructor' in object && 'constructor' in other) && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack['delete'](object);
    stack['delete'](other);
    return result;
  }
  module.exports = equalObjects;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseIsEqualDeep.js", ["npm:lodash@4.17.4/_Stack.js", "npm:lodash@4.17.4/_equalArrays.js", "npm:lodash@4.17.4/_equalByTag.js", "npm:lodash@4.17.4/_equalObjects.js", "npm:lodash@4.17.4/_getTag.js", "npm:lodash@4.17.4/isArray.js", "npm:lodash@4.17.4/isBuffer.js", "npm:lodash@4.17.4/isTypedArray.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var Stack = $__require('npm:lodash@4.17.4/_Stack.js'),
      equalArrays = $__require('npm:lodash@4.17.4/_equalArrays.js'),
      equalByTag = $__require('npm:lodash@4.17.4/_equalByTag.js'),
      equalObjects = $__require('npm:lodash@4.17.4/_equalObjects.js'),
      getTag = $__require('npm:lodash@4.17.4/_getTag.js'),
      isArray = $__require('npm:lodash@4.17.4/isArray.js'),
      isBuffer = $__require('npm:lodash@4.17.4/isBuffer.js'),
      isTypedArray = $__require('npm:lodash@4.17.4/isTypedArray.js');
  var COMPARE_PARTIAL_FLAG = 1;
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      objectTag = '[object Object]';
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
    var objIsArr = isArray(object),
        othIsArr = isArray(other),
        objTag = objIsArr ? arrayTag : getTag(object),
        othTag = othIsArr ? arrayTag : getTag(other);
    objTag = objTag == argsTag ? objectTag : objTag;
    othTag = othTag == argsTag ? objectTag : othTag;
    var objIsObj = objTag == objectTag,
        othIsObj = othTag == objectTag,
        isSameTag = objTag == othTag;
    if (isSameTag && isBuffer(object)) {
      if (!isBuffer(other)) {
        return false;
      }
      objIsArr = true;
      objIsObj = false;
    }
    if (isSameTag && !objIsObj) {
      stack || (stack = new Stack);
      return (objIsArr || isTypedArray(object)) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
          othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
            othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack);
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack);
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }
  module.exports = baseIsEqualDeep;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseIsEqual.js", ["npm:lodash@4.17.4/_baseIsEqualDeep.js", "npm:lodash@4.17.4/isObjectLike.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseIsEqualDeep = $__require('npm:lodash@4.17.4/_baseIsEqualDeep.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || (!isObjectLike(value) && !isObjectLike(other))) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }
  module.exports = baseIsEqual;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isEqual.js", ["npm:lodash@4.17.4/_baseIsEqual.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseIsEqual = $__require('npm:lodash@4.17.4/_baseIsEqual.js');
  function isEqual(value, other) {
    return baseIsEqual(value, other);
  }
  module.exports = isEqual;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_stackClear.js", ["npm:lodash@4.17.4/_ListCache.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var ListCache = $__require('npm:lodash@4.17.4/_ListCache.js');
  function stackClear() {
    this.__data__ = new ListCache;
    this.size = 0;
  }
  module.exports = stackClear;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_stackDelete.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function stackDelete(key) {
    var data = this.__data__,
        result = data['delete'](key);
    this.size = data.size;
    return result;
  }
  module.exports = stackDelete;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_stackGet.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function stackGet(key) {
    return this.__data__.get(key);
  }
  module.exports = stackGet;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_stackHas.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function stackHas(key) {
    return this.__data__.has(key);
  }
  module.exports = stackHas;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_hashClear.js", ["npm:lodash@4.17.4/_nativeCreate.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var nativeCreate = $__require('npm:lodash@4.17.4/_nativeCreate.js');
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }
  module.exports = hashClear;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_hashDelete.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }
  module.exports = hashDelete;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_hashGet.js", ["npm:lodash@4.17.4/_nativeCreate.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var nativeCreate = $__require('npm:lodash@4.17.4/_nativeCreate.js');
  var HASH_UNDEFINED = '__lodash_hash_undefined__';
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashGet(key) {
    var data = this.__data__;
    if (nativeCreate) {
      var result = data[key];
      return result === HASH_UNDEFINED ? undefined : result;
    }
    return hasOwnProperty.call(data, key) ? data[key] : undefined;
  }
  module.exports = hashGet;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_hashHas.js", ["npm:lodash@4.17.4/_nativeCreate.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var nativeCreate = $__require('npm:lodash@4.17.4/_nativeCreate.js');
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? (data[key] !== undefined) : hasOwnProperty.call(data, key);
  }
  module.exports = hashHas;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_nativeCreate.js", ["npm:lodash@4.17.4/_getNative.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getNative = $__require('npm:lodash@4.17.4/_getNative.js');
  var nativeCreate = getNative(Object, 'create');
  module.exports = nativeCreate;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_hashSet.js", ["npm:lodash@4.17.4/_nativeCreate.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var nativeCreate = $__require('npm:lodash@4.17.4/_nativeCreate.js');
  var HASH_UNDEFINED = '__lodash_hash_undefined__';
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = (nativeCreate && value === undefined) ? HASH_UNDEFINED : value;
    return this;
  }
  module.exports = hashSet;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_Hash.js", ["npm:lodash@4.17.4/_hashClear.js", "npm:lodash@4.17.4/_hashDelete.js", "npm:lodash@4.17.4/_hashGet.js", "npm:lodash@4.17.4/_hashHas.js", "npm:lodash@4.17.4/_hashSet.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var hashClear = $__require('npm:lodash@4.17.4/_hashClear.js'),
      hashDelete = $__require('npm:lodash@4.17.4/_hashDelete.js'),
      hashGet = $__require('npm:lodash@4.17.4/_hashGet.js'),
      hashHas = $__require('npm:lodash@4.17.4/_hashHas.js'),
      hashSet = $__require('npm:lodash@4.17.4/_hashSet.js');
  function Hash(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  Hash.prototype.clear = hashClear;
  Hash.prototype['delete'] = hashDelete;
  Hash.prototype.get = hashGet;
  Hash.prototype.has = hashHas;
  Hash.prototype.set = hashSet;
  module.exports = Hash;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_listCacheClear.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }
  module.exports = listCacheClear;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_listCacheDelete.js", ["npm:lodash@4.17.4/_assocIndexOf.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var assocIndexOf = $__require('npm:lodash@4.17.4/_assocIndexOf.js');
  var arrayProto = Array.prototype;
  var splice = arrayProto.splice;
  function listCacheDelete(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);
    if (index < 0) {
      return false;
    }
    var lastIndex = data.length - 1;
    if (index == lastIndex) {
      data.pop();
    } else {
      splice.call(data, index, 1);
    }
    --this.size;
    return true;
  }
  module.exports = listCacheDelete;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_listCacheGet.js", ["npm:lodash@4.17.4/_assocIndexOf.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var assocIndexOf = $__require('npm:lodash@4.17.4/_assocIndexOf.js');
  function listCacheGet(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);
    return index < 0 ? undefined : data[index][1];
  }
  module.exports = listCacheGet;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_listCacheHas.js", ["npm:lodash@4.17.4/_assocIndexOf.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var assocIndexOf = $__require('npm:lodash@4.17.4/_assocIndexOf.js');
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  module.exports = listCacheHas;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_assocIndexOf.js", ["npm:lodash@4.17.4/eq.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var eq = $__require('npm:lodash@4.17.4/eq.js');
  function assocIndexOf(array, key) {
    var length = array.length;
    while (length--) {
      if (eq(array[length][0], key)) {
        return length;
      }
    }
    return -1;
  }
  module.exports = assocIndexOf;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_listCacheSet.js", ["npm:lodash@4.17.4/_assocIndexOf.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var assocIndexOf = $__require('npm:lodash@4.17.4/_assocIndexOf.js');
  function listCacheSet(key, value) {
    var data = this.__data__,
        index = assocIndexOf(data, key);
    if (index < 0) {
      ++this.size;
      data.push([key, value]);
    } else {
      data[index][1] = value;
    }
    return this;
  }
  module.exports = listCacheSet;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_ListCache.js", ["npm:lodash@4.17.4/_listCacheClear.js", "npm:lodash@4.17.4/_listCacheDelete.js", "npm:lodash@4.17.4/_listCacheGet.js", "npm:lodash@4.17.4/_listCacheHas.js", "npm:lodash@4.17.4/_listCacheSet.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var listCacheClear = $__require('npm:lodash@4.17.4/_listCacheClear.js'),
      listCacheDelete = $__require('npm:lodash@4.17.4/_listCacheDelete.js'),
      listCacheGet = $__require('npm:lodash@4.17.4/_listCacheGet.js'),
      listCacheHas = $__require('npm:lodash@4.17.4/_listCacheHas.js'),
      listCacheSet = $__require('npm:lodash@4.17.4/_listCacheSet.js');
  function ListCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  ListCache.prototype.clear = listCacheClear;
  ListCache.prototype['delete'] = listCacheDelete;
  ListCache.prototype.get = listCacheGet;
  ListCache.prototype.has = listCacheHas;
  ListCache.prototype.set = listCacheSet;
  module.exports = ListCache;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_mapCacheClear.js", ["npm:lodash@4.17.4/_Hash.js", "npm:lodash@4.17.4/_ListCache.js", "npm:lodash@4.17.4/_Map.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var Hash = $__require('npm:lodash@4.17.4/_Hash.js'),
      ListCache = $__require('npm:lodash@4.17.4/_ListCache.js'),
      Map = $__require('npm:lodash@4.17.4/_Map.js');
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new Hash,
      'map': new (Map || ListCache),
      'string': new Hash
    };
  }
  module.exports = mapCacheClear;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_mapCacheDelete.js", ["npm:lodash@4.17.4/_getMapData.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getMapData = $__require('npm:lodash@4.17.4/_getMapData.js');
  function mapCacheDelete(key) {
    var result = getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  module.exports = mapCacheDelete;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_mapCacheGet.js", ["npm:lodash@4.17.4/_getMapData.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getMapData = $__require('npm:lodash@4.17.4/_getMapData.js');
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  module.exports = mapCacheGet;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_mapCacheHas.js", ["npm:lodash@4.17.4/_getMapData.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getMapData = $__require('npm:lodash@4.17.4/_getMapData.js');
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  module.exports = mapCacheHas;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_isKeyable.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function isKeyable(value) {
    var type = typeof value;
    return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean') ? (value !== '__proto__') : (value === null);
  }
  module.exports = isKeyable;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_getMapData.js", ["npm:lodash@4.17.4/_isKeyable.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var isKeyable = $__require('npm:lodash@4.17.4/_isKeyable.js');
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
  }
  module.exports = getMapData;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_mapCacheSet.js", ["npm:lodash@4.17.4/_getMapData.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getMapData = $__require('npm:lodash@4.17.4/_getMapData.js');
  function mapCacheSet(key, value) {
    var data = getMapData(this, key),
        size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  module.exports = mapCacheSet;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_MapCache.js", ["npm:lodash@4.17.4/_mapCacheClear.js", "npm:lodash@4.17.4/_mapCacheDelete.js", "npm:lodash@4.17.4/_mapCacheGet.js", "npm:lodash@4.17.4/_mapCacheHas.js", "npm:lodash@4.17.4/_mapCacheSet.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var mapCacheClear = $__require('npm:lodash@4.17.4/_mapCacheClear.js'),
      mapCacheDelete = $__require('npm:lodash@4.17.4/_mapCacheDelete.js'),
      mapCacheGet = $__require('npm:lodash@4.17.4/_mapCacheGet.js'),
      mapCacheHas = $__require('npm:lodash@4.17.4/_mapCacheHas.js'),
      mapCacheSet = $__require('npm:lodash@4.17.4/_mapCacheSet.js');
  function MapCache(entries) {
    var index = -1,
        length = entries == null ? 0 : entries.length;
    this.clear();
    while (++index < length) {
      var entry = entries[index];
      this.set(entry[0], entry[1]);
    }
  }
  MapCache.prototype.clear = mapCacheClear;
  MapCache.prototype['delete'] = mapCacheDelete;
  MapCache.prototype.get = mapCacheGet;
  MapCache.prototype.has = mapCacheHas;
  MapCache.prototype.set = mapCacheSet;
  module.exports = MapCache;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_stackSet.js", ["npm:lodash@4.17.4/_ListCache.js", "npm:lodash@4.17.4/_Map.js", "npm:lodash@4.17.4/_MapCache.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var ListCache = $__require('npm:lodash@4.17.4/_ListCache.js'),
      Map = $__require('npm:lodash@4.17.4/_Map.js'),
      MapCache = $__require('npm:lodash@4.17.4/_MapCache.js');
  var LARGE_ARRAY_SIZE = 200;
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
        pairs.push([key, value]);
        this.size = ++data.size;
        return this;
      }
      data = this.__data__ = new MapCache(pairs);
    }
    data.set(key, value);
    this.size = data.size;
    return this;
  }
  module.exports = stackSet;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_Stack.js", ["npm:lodash@4.17.4/_ListCache.js", "npm:lodash@4.17.4/_stackClear.js", "npm:lodash@4.17.4/_stackDelete.js", "npm:lodash@4.17.4/_stackGet.js", "npm:lodash@4.17.4/_stackHas.js", "npm:lodash@4.17.4/_stackSet.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var ListCache = $__require('npm:lodash@4.17.4/_ListCache.js'),
      stackClear = $__require('npm:lodash@4.17.4/_stackClear.js'),
      stackDelete = $__require('npm:lodash@4.17.4/_stackDelete.js'),
      stackGet = $__require('npm:lodash@4.17.4/_stackGet.js'),
      stackHas = $__require('npm:lodash@4.17.4/_stackHas.js'),
      stackSet = $__require('npm:lodash@4.17.4/_stackSet.js');
  function Stack(entries) {
    var data = this.__data__ = new ListCache(entries);
    this.size = data.size;
  }
  Stack.prototype.clear = stackClear;
  Stack.prototype['delete'] = stackDelete;
  Stack.prototype.get = stackGet;
  Stack.prototype.has = stackHas;
  Stack.prototype.set = stackSet;
  module.exports = Stack;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_arrayEach.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function arrayEach(array, iteratee) {
    var index = -1,
        length = array == null ? 0 : array.length;
    while (++index < length) {
      if (iteratee(array[index], index, array) === false) {
        break;
      }
    }
    return array;
  }
  module.exports = arrayEach;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseAssign.js", ["npm:lodash@4.17.4/_copyObject.js", "npm:lodash@4.17.4/keys.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var copyObject = $__require('npm:lodash@4.17.4/_copyObject.js'),
      keys = $__require('npm:lodash@4.17.4/keys.js');
  function baseAssign(object, source) {
    return object && copyObject(source, keys(source), object);
  }
  module.exports = baseAssign;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseAssignIn.js", ["npm:lodash@4.17.4/_copyObject.js", "npm:lodash@4.17.4/keysIn.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var copyObject = $__require('npm:lodash@4.17.4/_copyObject.js'),
      keysIn = $__require('npm:lodash@4.17.4/keysIn.js');
  function baseAssignIn(object, source) {
    return object && copyObject(source, keysIn(source), object);
  }
  module.exports = baseAssignIn;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_cloneBuffer.js", ["npm:lodash@4.17.4/_root.js", "@empty"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(Buffer) {
    var root = $__require('npm:lodash@4.17.4/_root.js');
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer = moduleExports ? root.Buffer : undefined,
        allocUnsafe = Buffer ? Buffer.allocUnsafe : undefined;
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length,
          result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    module.exports = cloneBuffer;
  })($__require('@empty').Buffer);
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_copyArray.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function copyArray(source, array) {
    var index = -1,
        length = source.length;
    array || (array = Array(length));
    while (++index < length) {
      array[index] = source[index];
    }
    return array;
  }
  module.exports = copyArray;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_copySymbols.js", ["npm:lodash@4.17.4/_copyObject.js", "npm:lodash@4.17.4/_getSymbols.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var copyObject = $__require('npm:lodash@4.17.4/_copyObject.js'),
      getSymbols = $__require('npm:lodash@4.17.4/_getSymbols.js');
  function copySymbols(source, object) {
    return copyObject(source, getSymbols(source), object);
  }
  module.exports = copySymbols;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/eq.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }
  module.exports = eq;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_assignValue.js", ["npm:lodash@4.17.4/_baseAssignValue.js", "npm:lodash@4.17.4/eq.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseAssignValue = $__require('npm:lodash@4.17.4/_baseAssignValue.js'),
      eq = $__require('npm:lodash@4.17.4/eq.js');
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function assignValue(object, key, value) {
    var objValue = object[key];
    if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || (value === undefined && !(key in object))) {
      baseAssignValue(object, key, value);
    }
  }
  module.exports = assignValue;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_defineProperty.js", ["npm:lodash@4.17.4/_getNative.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getNative = $__require('npm:lodash@4.17.4/_getNative.js');
  var defineProperty = (function() {
    try {
      var func = getNative(Object, 'defineProperty');
      func({}, '', {});
      return func;
    } catch (e) {}
  }());
  module.exports = defineProperty;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseAssignValue.js", ["npm:lodash@4.17.4/_defineProperty.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var defineProperty = $__require('npm:lodash@4.17.4/_defineProperty.js');
  function baseAssignValue(object, key, value) {
    if (key == '__proto__' && defineProperty) {
      defineProperty(object, key, {
        'configurable': true,
        'enumerable': true,
        'value': value,
        'writable': true
      });
    } else {
      object[key] = value;
    }
  }
  module.exports = baseAssignValue;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_copyObject.js", ["npm:lodash@4.17.4/_assignValue.js", "npm:lodash@4.17.4/_baseAssignValue.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var assignValue = $__require('npm:lodash@4.17.4/_assignValue.js'),
      baseAssignValue = $__require('npm:lodash@4.17.4/_baseAssignValue.js');
  function copyObject(source, props, object, customizer) {
    var isNew = !object;
    object || (object = {});
    var index = -1,
        length = props.length;
    while (++index < length) {
      var key = props[index];
      var newValue = customizer ? customizer(object[key], source[key], key, object, source) : undefined;
      if (newValue === undefined) {
        newValue = source[key];
      }
      if (isNew) {
        baseAssignValue(object, key, newValue);
      } else {
        assignValue(object, key, newValue);
      }
    }
    return object;
  }
  module.exports = copyObject;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_copySymbolsIn.js", ["npm:lodash@4.17.4/_copyObject.js", "npm:lodash@4.17.4/_getSymbolsIn.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var copyObject = $__require('npm:lodash@4.17.4/_copyObject.js'),
      getSymbolsIn = $__require('npm:lodash@4.17.4/_getSymbolsIn.js');
  function copySymbolsIn(source, object) {
    return copyObject(source, getSymbolsIn(source), object);
  }
  module.exports = copySymbolsIn;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_getAllKeys.js", ["npm:lodash@4.17.4/_baseGetAllKeys.js", "npm:lodash@4.17.4/_getSymbols.js", "npm:lodash@4.17.4/keys.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseGetAllKeys = $__require('npm:lodash@4.17.4/_baseGetAllKeys.js'),
      getSymbols = $__require('npm:lodash@4.17.4/_getSymbols.js'),
      keys = $__require('npm:lodash@4.17.4/keys.js');
  function getAllKeys(object) {
    return baseGetAllKeys(object, keys, getSymbols);
  }
  module.exports = getAllKeys;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseGetAllKeys.js", ["npm:lodash@4.17.4/_arrayPush.js", "npm:lodash@4.17.4/isArray.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var arrayPush = $__require('npm:lodash@4.17.4/_arrayPush.js'),
      isArray = $__require('npm:lodash@4.17.4/isArray.js');
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
  }
  module.exports = baseGetAllKeys;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_arrayPush.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function arrayPush(array, values) {
    var index = -1,
        length = values.length,
        offset = array.length;
    while (++index < length) {
      array[offset + index] = values[index];
    }
    return array;
  }
  module.exports = arrayPush;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_arrayFilter.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function arrayFilter(array, predicate) {
    var index = -1,
        length = array == null ? 0 : array.length,
        resIndex = 0,
        result = [];
    while (++index < length) {
      var value = array[index];
      if (predicate(value, index, array)) {
        result[resIndex++] = value;
      }
    }
    return result;
  }
  module.exports = arrayFilter;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_getSymbols.js", ["npm:lodash@4.17.4/_arrayFilter.js", "npm:lodash@4.17.4/stubArray.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var arrayFilter = $__require('npm:lodash@4.17.4/_arrayFilter.js'),
      stubArray = $__require('npm:lodash@4.17.4/stubArray.js');
  var objectProto = Object.prototype;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols(object), function(symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };
  module.exports = getSymbols;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/stubArray.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function stubArray() {
    return [];
  }
  module.exports = stubArray;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_getSymbolsIn.js", ["npm:lodash@4.17.4/_arrayPush.js", "npm:lodash@4.17.4/_getPrototype.js", "npm:lodash@4.17.4/_getSymbols.js", "npm:lodash@4.17.4/stubArray.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var arrayPush = $__require('npm:lodash@4.17.4/_arrayPush.js'),
      getPrototype = $__require('npm:lodash@4.17.4/_getPrototype.js'),
      getSymbols = $__require('npm:lodash@4.17.4/_getSymbols.js'),
      stubArray = $__require('npm:lodash@4.17.4/stubArray.js');
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
    var result = [];
    while (object) {
      arrayPush(result, getSymbols(object));
      object = getPrototype(object);
    }
    return result;
  };
  module.exports = getSymbolsIn;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_nativeKeysIn.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function nativeKeysIn(object) {
    var result = [];
    if (object != null) {
      for (var key in Object(object)) {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = nativeKeysIn;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseKeysIn.js", ["npm:lodash@4.17.4/isObject.js", "npm:lodash@4.17.4/_isPrototype.js", "npm:lodash@4.17.4/_nativeKeysIn.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var isObject = $__require('npm:lodash@4.17.4/isObject.js'),
      isPrototype = $__require('npm:lodash@4.17.4/_isPrototype.js'),
      nativeKeysIn = $__require('npm:lodash@4.17.4/_nativeKeysIn.js');
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseKeysIn(object) {
    if (!isObject(object)) {
      return nativeKeysIn(object);
    }
    var isProto = isPrototype(object),
        result = [];
    for (var key in object) {
      if (!(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = baseKeysIn;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/keysIn.js", ["npm:lodash@4.17.4/_arrayLikeKeys.js", "npm:lodash@4.17.4/_baseKeysIn.js", "npm:lodash@4.17.4/isArrayLike.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var arrayLikeKeys = $__require('npm:lodash@4.17.4/_arrayLikeKeys.js'),
      baseKeysIn = $__require('npm:lodash@4.17.4/_baseKeysIn.js'),
      isArrayLike = $__require('npm:lodash@4.17.4/isArrayLike.js');
  function keysIn(object) {
    return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
  }
  module.exports = keysIn;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_getAllKeysIn.js", ["npm:lodash@4.17.4/_baseGetAllKeys.js", "npm:lodash@4.17.4/_getSymbolsIn.js", "npm:lodash@4.17.4/keysIn.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseGetAllKeys = $__require('npm:lodash@4.17.4/_baseGetAllKeys.js'),
      getSymbolsIn = $__require('npm:lodash@4.17.4/_getSymbolsIn.js'),
      keysIn = $__require('npm:lodash@4.17.4/keysIn.js');
  function getAllKeysIn(object) {
    return baseGetAllKeys(object, keysIn, getSymbolsIn);
  }
  module.exports = getAllKeysIn;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_DataView.js", ["npm:lodash@4.17.4/_getNative.js", "npm:lodash@4.17.4/_root.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getNative = $__require('npm:lodash@4.17.4/_getNative.js'),
      root = $__require('npm:lodash@4.17.4/_root.js');
  var DataView = getNative(root, 'DataView');
  module.exports = DataView;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_Map.js", ["npm:lodash@4.17.4/_getNative.js", "npm:lodash@4.17.4/_root.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getNative = $__require('npm:lodash@4.17.4/_getNative.js'),
      root = $__require('npm:lodash@4.17.4/_root.js');
  var Map = getNative(root, 'Map');
  module.exports = Map;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_Promise.js", ["npm:lodash@4.17.4/_getNative.js", "npm:lodash@4.17.4/_root.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getNative = $__require('npm:lodash@4.17.4/_getNative.js'),
      root = $__require('npm:lodash@4.17.4/_root.js');
  var Promise = getNative(root, 'Promise');
  module.exports = Promise;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_Set.js", ["npm:lodash@4.17.4/_getNative.js", "npm:lodash@4.17.4/_root.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getNative = $__require('npm:lodash@4.17.4/_getNative.js'),
      root = $__require('npm:lodash@4.17.4/_root.js');
  var Set = getNative(root, 'Set');
  module.exports = Set;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_coreJsData.js", ["npm:lodash@4.17.4/_root.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var root = $__require('npm:lodash@4.17.4/_root.js');
  var coreJsData = root['__core-js_shared__'];
  module.exports = coreJsData;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_isMasked.js", ["npm:lodash@4.17.4/_coreJsData.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var coreJsData = $__require('npm:lodash@4.17.4/_coreJsData.js');
  var maskSrcKey = (function() {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? ('Symbol(src)_1.' + uid) : '';
  }());
  function isMasked(func) {
    return !!maskSrcKey && (maskSrcKey in func);
  }
  module.exports = isMasked;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseIsNative.js", ["npm:lodash@4.17.4/isFunction.js", "npm:lodash@4.17.4/_isMasked.js", "npm:lodash@4.17.4/isObject.js", "npm:lodash@4.17.4/_toSource.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var isFunction = $__require('npm:lodash@4.17.4/isFunction.js'),
      isMasked = $__require('npm:lodash@4.17.4/_isMasked.js'),
      isObject = $__require('npm:lodash@4.17.4/isObject.js'),
      toSource = $__require('npm:lodash@4.17.4/_toSource.js');
  var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
  var reIsHostCtor = /^\[object .+?Constructor\]$/;
  var funcProto = Function.prototype,
      objectProto = Object.prototype;
  var funcToString = funcProto.toString;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var reIsNative = RegExp('^' + funcToString.call(hasOwnProperty).replace(reRegExpChar, '\\$&').replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$');
  function baseIsNative(value) {
    if (!isObject(value) || isMasked(value)) {
      return false;
    }
    var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
    return pattern.test(toSource(value));
  }
  module.exports = baseIsNative;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_getValue.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }
  module.exports = getValue;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_getNative.js", ["npm:lodash@4.17.4/_baseIsNative.js", "npm:lodash@4.17.4/_getValue.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseIsNative = $__require('npm:lodash@4.17.4/_baseIsNative.js'),
      getValue = $__require('npm:lodash@4.17.4/_getValue.js');
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }
  module.exports = getNative;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_WeakMap.js", ["npm:lodash@4.17.4/_getNative.js", "npm:lodash@4.17.4/_root.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var getNative = $__require('npm:lodash@4.17.4/_getNative.js'),
      root = $__require('npm:lodash@4.17.4/_root.js');
  var WeakMap = getNative(root, 'WeakMap');
  module.exports = WeakMap;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_toSource.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var funcProto = Function.prototype;
  var funcToString = funcProto.toString;
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return (func + '');
      } catch (e) {}
    }
    return '';
  }
  module.exports = toSource;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_getTag.js", ["npm:lodash@4.17.4/_DataView.js", "npm:lodash@4.17.4/_Map.js", "npm:lodash@4.17.4/_Promise.js", "npm:lodash@4.17.4/_Set.js", "npm:lodash@4.17.4/_WeakMap.js", "npm:lodash@4.17.4/_baseGetTag.js", "npm:lodash@4.17.4/_toSource.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var DataView = $__require('npm:lodash@4.17.4/_DataView.js'),
      Map = $__require('npm:lodash@4.17.4/_Map.js'),
      Promise = $__require('npm:lodash@4.17.4/_Promise.js'),
      Set = $__require('npm:lodash@4.17.4/_Set.js'),
      WeakMap = $__require('npm:lodash@4.17.4/_WeakMap.js'),
      baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      toSource = $__require('npm:lodash@4.17.4/_toSource.js');
  var mapTag = '[object Map]',
      objectTag = '[object Object]',
      promiseTag = '[object Promise]',
      setTag = '[object Set]',
      weakMapTag = '[object WeakMap]';
  var dataViewTag = '[object DataView]';
  var dataViewCtorString = toSource(DataView),
      mapCtorString = toSource(Map),
      promiseCtorString = toSource(Promise),
      setCtorString = toSource(Set),
      weakMapCtorString = toSource(WeakMap);
  var getTag = baseGetTag;
  if ((DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag) || (Map && getTag(new Map) != mapTag) || (Promise && getTag(Promise.resolve()) != promiseTag) || (Set && getTag(new Set) != setTag) || (WeakMap && getTag(new WeakMap) != weakMapTag)) {
    getTag = function(value) {
      var result = baseGetTag(value),
          Ctor = result == objectTag ? value.constructor : undefined,
          ctorString = Ctor ? toSource(Ctor) : '';
      if (ctorString) {
        switch (ctorString) {
          case dataViewCtorString:
            return dataViewTag;
          case mapCtorString:
            return mapTag;
          case promiseCtorString:
            return promiseTag;
          case setCtorString:
            return setTag;
          case weakMapCtorString:
            return weakMapTag;
        }
      }
      return result;
    };
  }
  module.exports = getTag;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_initCloneArray.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function initCloneArray(array) {
    var length = array.length,
        result = array.constructor(length);
    if (length && typeof array[0] == 'string' && hasOwnProperty.call(array, 'index')) {
      result.index = array.index;
      result.input = array.input;
    }
    return result;
  }
  module.exports = initCloneArray;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_cloneDataView.js", ["npm:lodash@4.17.4/_cloneArrayBuffer.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var cloneArrayBuffer = $__require('npm:lodash@4.17.4/_cloneArrayBuffer.js');
  function cloneDataView(dataView, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
    return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
  }
  module.exports = cloneDataView;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_addMapEntry.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function addMapEntry(map, pair) {
    map.set(pair[0], pair[1]);
    return map;
  }
  module.exports = addMapEntry;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_mapToArray.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);
    map.forEach(function(value, key) {
      result[++index] = [key, value];
    });
    return result;
  }
  module.exports = mapToArray;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_cloneMap.js", ["npm:lodash@4.17.4/_addMapEntry.js", "npm:lodash@4.17.4/_arrayReduce.js", "npm:lodash@4.17.4/_mapToArray.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var addMapEntry = $__require('npm:lodash@4.17.4/_addMapEntry.js'),
      arrayReduce = $__require('npm:lodash@4.17.4/_arrayReduce.js'),
      mapToArray = $__require('npm:lodash@4.17.4/_mapToArray.js');
  var CLONE_DEEP_FLAG = 1;
  function cloneMap(map, isDeep, cloneFunc) {
    var array = isDeep ? cloneFunc(mapToArray(map), CLONE_DEEP_FLAG) : mapToArray(map);
    return arrayReduce(array, addMapEntry, new map.constructor);
  }
  module.exports = cloneMap;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_cloneRegExp.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var reFlags = /\w*$/;
  function cloneRegExp(regexp) {
    var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
    result.lastIndex = regexp.lastIndex;
    return result;
  }
  module.exports = cloneRegExp;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_addSetEntry.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function addSetEntry(set, value) {
    set.add(value);
    return set;
  }
  module.exports = addSetEntry;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_arrayReduce.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function arrayReduce(array, iteratee, accumulator, initAccum) {
    var index = -1,
        length = array == null ? 0 : array.length;
    if (initAccum && length) {
      accumulator = array[++index];
    }
    while (++index < length) {
      accumulator = iteratee(accumulator, array[index], index, array);
    }
    return accumulator;
  }
  module.exports = arrayReduce;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_setToArray.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function setToArray(set) {
    var index = -1,
        result = Array(set.size);
    set.forEach(function(value) {
      result[++index] = value;
    });
    return result;
  }
  module.exports = setToArray;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_cloneSet.js", ["npm:lodash@4.17.4/_addSetEntry.js", "npm:lodash@4.17.4/_arrayReduce.js", "npm:lodash@4.17.4/_setToArray.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var addSetEntry = $__require('npm:lodash@4.17.4/_addSetEntry.js'),
      arrayReduce = $__require('npm:lodash@4.17.4/_arrayReduce.js'),
      setToArray = $__require('npm:lodash@4.17.4/_setToArray.js');
  var CLONE_DEEP_FLAG = 1;
  function cloneSet(set, isDeep, cloneFunc) {
    var array = isDeep ? cloneFunc(setToArray(set), CLONE_DEEP_FLAG) : setToArray(set);
    return arrayReduce(array, addSetEntry, new set.constructor);
  }
  module.exports = cloneSet;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_cloneSymbol.js", ["npm:lodash@4.17.4/_Symbol.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var Symbol = $__require('npm:lodash@4.17.4/_Symbol.js');
  var symbolProto = Symbol ? Symbol.prototype : undefined,
      symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;
  function cloneSymbol(symbol) {
    return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
  }
  module.exports = cloneSymbol;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_Uint8Array.js", ["npm:lodash@4.17.4/_root.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var root = $__require('npm:lodash@4.17.4/_root.js');
  var Uint8Array = root.Uint8Array;
  module.exports = Uint8Array;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_cloneArrayBuffer.js", ["npm:lodash@4.17.4/_Uint8Array.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var Uint8Array = $__require('npm:lodash@4.17.4/_Uint8Array.js');
  function cloneArrayBuffer(arrayBuffer) {
    var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
    new Uint8Array(result).set(new Uint8Array(arrayBuffer));
    return result;
  }
  module.exports = cloneArrayBuffer;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_cloneTypedArray.js", ["npm:lodash@4.17.4/_cloneArrayBuffer.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var cloneArrayBuffer = $__require('npm:lodash@4.17.4/_cloneArrayBuffer.js');
  function cloneTypedArray(typedArray, isDeep) {
    var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
    return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
  }
  module.exports = cloneTypedArray;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_initCloneByTag.js", ["npm:lodash@4.17.4/_cloneArrayBuffer.js", "npm:lodash@4.17.4/_cloneDataView.js", "npm:lodash@4.17.4/_cloneMap.js", "npm:lodash@4.17.4/_cloneRegExp.js", "npm:lodash@4.17.4/_cloneSet.js", "npm:lodash@4.17.4/_cloneSymbol.js", "npm:lodash@4.17.4/_cloneTypedArray.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var cloneArrayBuffer = $__require('npm:lodash@4.17.4/_cloneArrayBuffer.js'),
      cloneDataView = $__require('npm:lodash@4.17.4/_cloneDataView.js'),
      cloneMap = $__require('npm:lodash@4.17.4/_cloneMap.js'),
      cloneRegExp = $__require('npm:lodash@4.17.4/_cloneRegExp.js'),
      cloneSet = $__require('npm:lodash@4.17.4/_cloneSet.js'),
      cloneSymbol = $__require('npm:lodash@4.17.4/_cloneSymbol.js'),
      cloneTypedArray = $__require('npm:lodash@4.17.4/_cloneTypedArray.js');
  var boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]';
  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';
  function initCloneByTag(object, tag, cloneFunc, isDeep) {
    var Ctor = object.constructor;
    switch (tag) {
      case arrayBufferTag:
        return cloneArrayBuffer(object);
      case boolTag:
      case dateTag:
        return new Ctor(+object);
      case dataViewTag:
        return cloneDataView(object, isDeep);
      case float32Tag:
      case float64Tag:
      case int8Tag:
      case int16Tag:
      case int32Tag:
      case uint8Tag:
      case uint8ClampedTag:
      case uint16Tag:
      case uint32Tag:
        return cloneTypedArray(object, isDeep);
      case mapTag:
        return cloneMap(object, isDeep, cloneFunc);
      case numberTag:
      case stringTag:
        return new Ctor(object);
      case regexpTag:
        return cloneRegExp(object);
      case setTag:
        return cloneSet(object, isDeep, cloneFunc);
      case symbolTag:
        return cloneSymbol(object);
    }
  }
  module.exports = initCloneByTag;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseCreate.js", ["npm:lodash@4.17.4/isObject.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var isObject = $__require('npm:lodash@4.17.4/isObject.js');
  var objectCreate = Object.create;
  var baseCreate = (function() {
    function object() {}
    return function(proto) {
      if (!isObject(proto)) {
        return {};
      }
      if (objectCreate) {
        return objectCreate(proto);
      }
      object.prototype = proto;
      var result = new object;
      object.prototype = undefined;
      return result;
    };
  }());
  module.exports = baseCreate;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_getPrototype.js", ["npm:lodash@4.17.4/_overArg.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var overArg = $__require('npm:lodash@4.17.4/_overArg.js');
  var getPrototype = overArg(Object.getPrototypeOf, Object);
  module.exports = getPrototype;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_initCloneObject.js", ["npm:lodash@4.17.4/_baseCreate.js", "npm:lodash@4.17.4/_getPrototype.js", "npm:lodash@4.17.4/_isPrototype.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseCreate = $__require('npm:lodash@4.17.4/_baseCreate.js'),
      getPrototype = $__require('npm:lodash@4.17.4/_getPrototype.js'),
      isPrototype = $__require('npm:lodash@4.17.4/_isPrototype.js');
  function initCloneObject(object) {
    return (typeof object.constructor == 'function' && !isPrototype(object)) ? baseCreate(getPrototype(object)) : {};
  }
  module.exports = initCloneObject;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseTimes.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);
    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }
  module.exports = baseTimes;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseIsArguments.js", ["npm:lodash@4.17.4/_baseGetTag.js", "npm:lodash@4.17.4/isObjectLike.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var argsTag = '[object Arguments]';
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }
  module.exports = baseIsArguments;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isArguments.js", ["npm:lodash@4.17.4/_baseIsArguments.js", "npm:lodash@4.17.4/isObjectLike.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseIsArguments = $__require('npm:lodash@4.17.4/_baseIsArguments.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var isArguments = baseIsArguments(function() {
    return arguments;
  }()) ? baseIsArguments : function(value) {
    return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
  };
  module.exports = isArguments;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isArray.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var isArray = Array.isArray;
  module.exports = isArray;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/stubFalse.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function stubFalse() {
    return false;
  }
  module.exports = stubFalse;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isBuffer.js", ["npm:lodash@4.17.4/_root.js", "npm:lodash@4.17.4/stubFalse.js", "@empty"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(Buffer) {
    var root = $__require('npm:lodash@4.17.4/_root.js'),
        stubFalse = $__require('npm:lodash@4.17.4/stubFalse.js');
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer = moduleExports ? root.Buffer : undefined;
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : undefined;
    var isBuffer = nativeIsBuffer || stubFalse;
    module.exports = isBuffer;
  })($__require('@empty').Buffer);
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_isIndex.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var MAX_SAFE_INTEGER = 9007199254740991;
  var reIsUint = /^(?:0|[1-9]\d*)$/;
  function isIndex(value, length) {
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (typeof value == 'number' || reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
  }
  module.exports = isIndex;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isObjectLike.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }
  module.exports = isObjectLike;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseIsTypedArray.js", ["npm:lodash@4.17.4/_baseGetTag.js", "npm:lodash@4.17.4/isLength.js", "npm:lodash@4.17.4/isObjectLike.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      isLength = $__require('npm:lodash@4.17.4/isLength.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      weakMapTag = '[object WeakMap]';
  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';
  var typedArrayTags = {};
  typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
  typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
  function baseIsTypedArray(value) {
    return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
  }
  module.exports = baseIsTypedArray;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseUnary.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function baseUnary(func) {
    return function(value) {
      return func(value);
    };
  }
  module.exports = baseUnary;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_nodeUtil.js", ["npm:lodash@4.17.4/_freeGlobal.js", "@empty"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  (function(process) {
    var freeGlobal = $__require('npm:lodash@4.17.4/_freeGlobal.js');
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = (function() {
      try {
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }());
    module.exports = nodeUtil;
  })($__require('@empty'));
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isTypedArray.js", ["npm:lodash@4.17.4/_baseIsTypedArray.js", "npm:lodash@4.17.4/_baseUnary.js", "npm:lodash@4.17.4/_nodeUtil.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseIsTypedArray = $__require('npm:lodash@4.17.4/_baseIsTypedArray.js'),
      baseUnary = $__require('npm:lodash@4.17.4/_baseUnary.js'),
      nodeUtil = $__require('npm:lodash@4.17.4/_nodeUtil.js');
  var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
  var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
  module.exports = isTypedArray;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_arrayLikeKeys.js", ["npm:lodash@4.17.4/_baseTimes.js", "npm:lodash@4.17.4/isArguments.js", "npm:lodash@4.17.4/isArray.js", "npm:lodash@4.17.4/isBuffer.js", "npm:lodash@4.17.4/_isIndex.js", "npm:lodash@4.17.4/isTypedArray.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseTimes = $__require('npm:lodash@4.17.4/_baseTimes.js'),
      isArguments = $__require('npm:lodash@4.17.4/isArguments.js'),
      isArray = $__require('npm:lodash@4.17.4/isArray.js'),
      isBuffer = $__require('npm:lodash@4.17.4/isBuffer.js'),
      isIndex = $__require('npm:lodash@4.17.4/_isIndex.js'),
      isTypedArray = $__require('npm:lodash@4.17.4/isTypedArray.js');
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function arrayLikeKeys(value, inherited) {
    var isArr = isArray(value),
        isArg = !isArr && isArguments(value),
        isBuff = !isArr && !isArg && isBuffer(value),
        isType = !isArr && !isArg && !isBuff && isTypedArray(value),
        skipIndexes = isArr || isArg || isBuff || isType,
        result = skipIndexes ? baseTimes(value.length, String) : [],
        length = result.length;
    for (var key in value) {
      if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == 'length' || (isBuff && (key == 'offset' || key == 'parent')) || (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) || isIndex(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = arrayLikeKeys;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_isPrototype.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var objectProto = Object.prototype;
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;
    return value === proto;
  }
  module.exports = isPrototype;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_overArg.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function overArg(func, transform) {
    return function(arg) {
      return func(transform(arg));
    };
  }
  module.exports = overArg;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_nativeKeys.js", ["npm:lodash@4.17.4/_overArg.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var overArg = $__require('npm:lodash@4.17.4/_overArg.js');
  var nativeKeys = overArg(Object.keys, Object);
  module.exports = nativeKeys;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseKeys.js", ["npm:lodash@4.17.4/_isPrototype.js", "npm:lodash@4.17.4/_nativeKeys.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var isPrototype = $__require('npm:lodash@4.17.4/_isPrototype.js'),
      nativeKeys = $__require('npm:lodash@4.17.4/_nativeKeys.js');
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function baseKeys(object) {
    if (!isPrototype(object)) {
      return nativeKeys(object);
    }
    var result = [];
    for (var key in Object(object)) {
      if (hasOwnProperty.call(object, key) && key != 'constructor') {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = baseKeys;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_freeGlobal.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;
  module.exports = freeGlobal;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_root.js", ["npm:lodash@4.17.4/_freeGlobal.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var freeGlobal = $__require('npm:lodash@4.17.4/_freeGlobal.js');
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function('return this')();
  module.exports = root;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_Symbol.js", ["npm:lodash@4.17.4/_root.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var root = $__require('npm:lodash@4.17.4/_root.js');
  var Symbol = root.Symbol;
  module.exports = Symbol;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_getRawTag.js", ["npm:lodash@4.17.4/_Symbol.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var Symbol = $__require('npm:lodash@4.17.4/_Symbol.js');
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var nativeObjectToString = objectProto.toString;
  var symToStringTag = Symbol ? Symbol.toStringTag : undefined;
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag),
        tag = value[symToStringTag];
    try {
      value[symToStringTag] = undefined;
      var unmasked = true;
    } catch (e) {}
    var result = nativeObjectToString.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag] = tag;
      } else {
        delete value[symToStringTag];
      }
    }
    return result;
  }
  module.exports = getRawTag;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_objectToString.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var objectProto = Object.prototype;
  var nativeObjectToString = objectProto.toString;
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }
  module.exports = objectToString;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseGetTag.js", ["npm:lodash@4.17.4/_Symbol.js", "npm:lodash@4.17.4/_getRawTag.js", "npm:lodash@4.17.4/_objectToString.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var Symbol = $__require('npm:lodash@4.17.4/_Symbol.js'),
      getRawTag = $__require('npm:lodash@4.17.4/_getRawTag.js'),
      objectToString = $__require('npm:lodash@4.17.4/_objectToString.js');
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';
  var symToStringTag = Symbol ? Symbol.toStringTag : undefined;
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value)) ? getRawTag(value) : objectToString(value);
  }
  module.exports = baseGetTag;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isObject.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }
  module.exports = isObject;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isFunction.js", ["npm:lodash@4.17.4/_baseGetTag.js", "npm:lodash@4.17.4/isObject.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      isObject = $__require('npm:lodash@4.17.4/isObject.js');
  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }
  module.exports = isFunction;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isLength.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var MAX_SAFE_INTEGER = 9007199254740991;
  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }
  module.exports = isLength;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/isArrayLike.js", ["npm:lodash@4.17.4/isFunction.js", "npm:lodash@4.17.4/isLength.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var isFunction = $__require('npm:lodash@4.17.4/isFunction.js'),
      isLength = $__require('npm:lodash@4.17.4/isLength.js');
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  module.exports = isArrayLike;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/keys.js", ["npm:lodash@4.17.4/_arrayLikeKeys.js", "npm:lodash@4.17.4/_baseKeys.js", "npm:lodash@4.17.4/isArrayLike.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var arrayLikeKeys = $__require('npm:lodash@4.17.4/_arrayLikeKeys.js'),
      baseKeys = $__require('npm:lodash@4.17.4/_baseKeys.js'),
      isArrayLike = $__require('npm:lodash@4.17.4/isArrayLike.js');
  function keys(object) {
    return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
  }
  module.exports = keys;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/_baseClone.js", ["npm:lodash@4.17.4/_Stack.js", "npm:lodash@4.17.4/_arrayEach.js", "npm:lodash@4.17.4/_assignValue.js", "npm:lodash@4.17.4/_baseAssign.js", "npm:lodash@4.17.4/_baseAssignIn.js", "npm:lodash@4.17.4/_cloneBuffer.js", "npm:lodash@4.17.4/_copyArray.js", "npm:lodash@4.17.4/_copySymbols.js", "npm:lodash@4.17.4/_copySymbolsIn.js", "npm:lodash@4.17.4/_getAllKeys.js", "npm:lodash@4.17.4/_getAllKeysIn.js", "npm:lodash@4.17.4/_getTag.js", "npm:lodash@4.17.4/_initCloneArray.js", "npm:lodash@4.17.4/_initCloneByTag.js", "npm:lodash@4.17.4/_initCloneObject.js", "npm:lodash@4.17.4/isArray.js", "npm:lodash@4.17.4/isBuffer.js", "npm:lodash@4.17.4/isObject.js", "npm:lodash@4.17.4/keys.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var Stack = $__require('npm:lodash@4.17.4/_Stack.js'),
      arrayEach = $__require('npm:lodash@4.17.4/_arrayEach.js'),
      assignValue = $__require('npm:lodash@4.17.4/_assignValue.js'),
      baseAssign = $__require('npm:lodash@4.17.4/_baseAssign.js'),
      baseAssignIn = $__require('npm:lodash@4.17.4/_baseAssignIn.js'),
      cloneBuffer = $__require('npm:lodash@4.17.4/_cloneBuffer.js'),
      copyArray = $__require('npm:lodash@4.17.4/_copyArray.js'),
      copySymbols = $__require('npm:lodash@4.17.4/_copySymbols.js'),
      copySymbolsIn = $__require('npm:lodash@4.17.4/_copySymbolsIn.js'),
      getAllKeys = $__require('npm:lodash@4.17.4/_getAllKeys.js'),
      getAllKeysIn = $__require('npm:lodash@4.17.4/_getAllKeysIn.js'),
      getTag = $__require('npm:lodash@4.17.4/_getTag.js'),
      initCloneArray = $__require('npm:lodash@4.17.4/_initCloneArray.js'),
      initCloneByTag = $__require('npm:lodash@4.17.4/_initCloneByTag.js'),
      initCloneObject = $__require('npm:lodash@4.17.4/_initCloneObject.js'),
      isArray = $__require('npm:lodash@4.17.4/isArray.js'),
      isBuffer = $__require('npm:lodash@4.17.4/isBuffer.js'),
      isObject = $__require('npm:lodash@4.17.4/isObject.js'),
      keys = $__require('npm:lodash@4.17.4/keys.js');
  var CLONE_DEEP_FLAG = 1,
      CLONE_FLAT_FLAG = 2,
      CLONE_SYMBOLS_FLAG = 4;
  var argsTag = '[object Arguments]',
      arrayTag = '[object Array]',
      boolTag = '[object Boolean]',
      dateTag = '[object Date]',
      errorTag = '[object Error]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      mapTag = '[object Map]',
      numberTag = '[object Number]',
      objectTag = '[object Object]',
      regexpTag = '[object RegExp]',
      setTag = '[object Set]',
      stringTag = '[object String]',
      symbolTag = '[object Symbol]',
      weakMapTag = '[object WeakMap]';
  var arrayBufferTag = '[object ArrayBuffer]',
      dataViewTag = '[object DataView]',
      float32Tag = '[object Float32Array]',
      float64Tag = '[object Float64Array]',
      int8Tag = '[object Int8Array]',
      int16Tag = '[object Int16Array]',
      int32Tag = '[object Int32Array]',
      uint8Tag = '[object Uint8Array]',
      uint8ClampedTag = '[object Uint8ClampedArray]',
      uint16Tag = '[object Uint16Array]',
      uint32Tag = '[object Uint32Array]';
  var cloneableTags = {};
  cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
  cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
  function baseClone(value, bitmask, customizer, key, object, stack) {
    var result,
        isDeep = bitmask & CLONE_DEEP_FLAG,
        isFlat = bitmask & CLONE_FLAT_FLAG,
        isFull = bitmask & CLONE_SYMBOLS_FLAG;
    if (customizer) {
      result = object ? customizer(value, key, object, stack) : customizer(value);
    }
    if (result !== undefined) {
      return result;
    }
    if (!isObject(value)) {
      return value;
    }
    var isArr = isArray(value);
    if (isArr) {
      result = initCloneArray(value);
      if (!isDeep) {
        return copyArray(value, result);
      }
    } else {
      var tag = getTag(value),
          isFunc = tag == funcTag || tag == genTag;
      if (isBuffer(value)) {
        return cloneBuffer(value, isDeep);
      }
      if (tag == objectTag || tag == argsTag || (isFunc && !object)) {
        result = (isFlat || isFunc) ? {} : initCloneObject(value);
        if (!isDeep) {
          return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
        }
      } else {
        if (!cloneableTags[tag]) {
          return object ? value : {};
        }
        result = initCloneByTag(value, tag, baseClone, isDeep);
      }
    }
    stack || (stack = new Stack);
    var stacked = stack.get(value);
    if (stacked) {
      return stacked;
    }
    stack.set(value, result);
    var keysFunc = isFull ? (isFlat ? getAllKeysIn : getAllKeys) : (isFlat ? keysIn : keys);
    var props = isArr ? undefined : keysFunc(value);
    arrayEach(props || value, function(subValue, key) {
      if (props) {
        key = subValue;
        subValue = value[key];
      }
      assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
    return result;
  }
  module.exports = baseClone;
  return module.exports;
});

System.registerDynamic("npm:lodash@4.17.4/cloneDeep.js", ["npm:lodash@4.17.4/_baseClone.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var baseClone = $__require('npm:lodash@4.17.4/_baseClone.js');
  var CLONE_DEEP_FLAG = 1,
      CLONE_SYMBOLS_FLAG = 4;
  function cloneDeep(value) {
    return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG);
  }
  module.exports = cloneDeep;
  return module.exports;
});

System.registerDynamic("npm:process@0.11.9/browser.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var process = module.exports = {};
  var cachedSetTimeout;
  var cachedClearTimeout;
  function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
  }
  function defaultClearTimeout() {
    throw new Error('clearTimeout has not been defined');
  }
  (function() {
    try {
      if (typeof setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
      } else {
        cachedSetTimeout = defaultSetTimout;
      }
    } catch (e) {
      cachedSetTimeout = defaultSetTimout;
    }
    try {
      if (typeof clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
      } else {
        cachedClearTimeout = defaultClearTimeout;
      }
    } catch (e) {
      cachedClearTimeout = defaultClearTimeout;
    }
  }());
  function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
      return setTimeout(fun, 0);
    }
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
      cachedSetTimeout = setTimeout;
      return setTimeout(fun, 0);
    }
    try {
      return cachedSetTimeout(fun, 0);
    } catch (e) {
      try {
        return cachedSetTimeout.call(null, fun, 0);
      } catch (e) {
        return cachedSetTimeout.call(this, fun, 0);
      }
    }
  }
  function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
      return clearTimeout(marker);
    }
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
      cachedClearTimeout = clearTimeout;
      return clearTimeout(marker);
    }
    try {
      return cachedClearTimeout(marker);
    } catch (e) {
      try {
        return cachedClearTimeout.call(null, marker);
      } catch (e) {
        return cachedClearTimeout.call(this, marker);
      }
    }
  }
  var queue = [];
  var draining = false;
  var currentQueue;
  var queueIndex = -1;
  function cleanUpNextTick() {
    if (!draining || !currentQueue) {
      return;
    }
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  }
  function drainQueue() {
    if (draining) {
      return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;
    var len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
  }
  process.nextTick = function(fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
      for (var i = 1; i < arguments.length; i++) {
        args[i - 1] = arguments[i];
      }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
      runTimeout(drainQueue);
    }
  };
  function Item(fun, array) {
    this.fun = fun;
    this.array = array;
  }
  Item.prototype.run = function() {
    this.fun.apply(null, this.array);
  };
  process.title = 'browser';
  process.browser = true;
  process.env = {};
  process.argv = [];
  process.version = '';
  process.versions = {};
  function noop() {}
  process.on = noop;
  process.addListener = noop;
  process.once = noop;
  process.off = noop;
  process.removeListener = noop;
  process.removeAllListeners = noop;
  process.emit = noop;
  process.binding = function(name) {
    throw new Error('process.binding is not supported');
  };
  process.cwd = function() {
    return '/';
  };
  process.chdir = function(dir) {
    throw new Error('process.chdir is not supported');
  };
  process.umask = function() {
    return 0;
  };
  return module.exports;
});

System.registerDynamic("npm:process@0.11.9.js", ["npm:process@0.11.9/browser.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:process@0.11.9/browser.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.2/index.js", ["npm:process@0.11.9.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = System._nodeRequire ? process : $__require('npm:process@0.11.9.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-process@0.1.2.js", ["github:jspm/nodelibs-process@0.1.2/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('github:jspm/nodelibs-process@0.1.2/index.js');
  return module.exports;
});

System.registerDynamic("npm:punycode@1.3.2/punycode.js", ["github:jspm/nodelibs-process@0.1.2.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  "format cjs";
  (function(process) {
    ;
    (function(root) {
      var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
      var freeModule = typeof module == 'object' && module && !module.nodeType && module;
      var freeGlobal = typeof global == 'object' && global;
      if (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal) {
        root = freeGlobal;
      }
      var punycode,
          maxInt = 2147483647,
          base = 36,
          tMin = 1,
          tMax = 26,
          skew = 38,
          damp = 700,
          initialBias = 72,
          initialN = 128,
          delimiter = '-',
          regexPunycode = /^xn--/,
          regexNonASCII = /[^\x20-\x7E]/,
          regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g,
          errors = {
            'overflow': 'Overflow: input needs wider integers to process',
            'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
            'invalid-input': 'Invalid input'
          },
          baseMinusTMin = base - tMin,
          floor = Math.floor,
          stringFromCharCode = String.fromCharCode,
          key;
      function error(type) {
        throw RangeError(errors[type]);
      }
      function map(array, fn) {
        var length = array.length;
        var result = [];
        while (length--) {
          result[length] = fn(array[length]);
        }
        return result;
      }
      function mapDomain(string, fn) {
        var parts = string.split('@');
        var result = '';
        if (parts.length > 1) {
          result = parts[0] + '@';
          string = parts[1];
        }
        string = string.replace(regexSeparators, '\x2E');
        var labels = string.split('.');
        var encoded = map(labels, fn).join('.');
        return result + encoded;
      }
      function ucs2decode(string) {
        var output = [],
            counter = 0,
            length = string.length,
            value,
            extra;
        while (counter < length) {
          value = string.charCodeAt(counter++);
          if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
            extra = string.charCodeAt(counter++);
            if ((extra & 0xFC00) == 0xDC00) {
              output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
            } else {
              output.push(value);
              counter--;
            }
          } else {
            output.push(value);
          }
        }
        return output;
      }
      function ucs2encode(array) {
        return map(array, function(value) {
          var output = '';
          if (value > 0xFFFF) {
            value -= 0x10000;
            output += stringFromCharCode(value >>> 10 & 0x3FF | 0xD800);
            value = 0xDC00 | value & 0x3FF;
          }
          output += stringFromCharCode(value);
          return output;
        }).join('');
      }
      function basicToDigit(codePoint) {
        if (codePoint - 48 < 10) {
          return codePoint - 22;
        }
        if (codePoint - 65 < 26) {
          return codePoint - 65;
        }
        if (codePoint - 97 < 26) {
          return codePoint - 97;
        }
        return base;
      }
      function digitToBasic(digit, flag) {
        return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
      }
      function adapt(delta, numPoints, firstTime) {
        var k = 0;
        delta = firstTime ? floor(delta / damp) : delta >> 1;
        delta += floor(delta / numPoints);
        for (; delta > baseMinusTMin * tMax >> 1; k += base) {
          delta = floor(delta / baseMinusTMin);
        }
        return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
      }
      function decode(input) {
        var output = [],
            inputLength = input.length,
            out,
            i = 0,
            n = initialN,
            bias = initialBias,
            basic,
            j,
            index,
            oldi,
            w,
            k,
            digit,
            t,
            baseMinusT;
        basic = input.lastIndexOf(delimiter);
        if (basic < 0) {
          basic = 0;
        }
        for (j = 0; j < basic; ++j) {
          if (input.charCodeAt(j) >= 0x80) {
            error('not-basic');
          }
          output.push(input.charCodeAt(j));
        }
        for (index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
          for (oldi = i, w = 1, k = base; ; k += base) {
            if (index >= inputLength) {
              error('invalid-input');
            }
            digit = basicToDigit(input.charCodeAt(index++));
            if (digit >= base || digit > floor((maxInt - i) / w)) {
              error('overflow');
            }
            i += digit * w;
            t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
            if (digit < t) {
              break;
            }
            baseMinusT = base - t;
            if (w > floor(maxInt / baseMinusT)) {
              error('overflow');
            }
            w *= baseMinusT;
          }
          out = output.length + 1;
          bias = adapt(i - oldi, out, oldi == 0);
          if (floor(i / out) > maxInt - n) {
            error('overflow');
          }
          n += floor(i / out);
          i %= out;
          output.splice(i++, 0, n);
        }
        return ucs2encode(output);
      }
      function encode(input) {
        var n,
            delta,
            handledCPCount,
            basicLength,
            bias,
            j,
            m,
            q,
            k,
            t,
            currentValue,
            output = [],
            inputLength,
            handledCPCountPlusOne,
            baseMinusT,
            qMinusT;
        input = ucs2decode(input);
        inputLength = input.length;
        n = initialN;
        delta = 0;
        bias = initialBias;
        for (j = 0; j < inputLength; ++j) {
          currentValue = input[j];
          if (currentValue < 0x80) {
            output.push(stringFromCharCode(currentValue));
          }
        }
        handledCPCount = basicLength = output.length;
        if (basicLength) {
          output.push(delimiter);
        }
        while (handledCPCount < inputLength) {
          for (m = maxInt, j = 0; j < inputLength; ++j) {
            currentValue = input[j];
            if (currentValue >= n && currentValue < m) {
              m = currentValue;
            }
          }
          handledCPCountPlusOne = handledCPCount + 1;
          if (m - n > floor((maxInt - delta) / handledCPCountPlusOne)) {
            error('overflow');
          }
          delta += (m - n) * handledCPCountPlusOne;
          n = m;
          for (j = 0; j < inputLength; ++j) {
            currentValue = input[j];
            if (currentValue < n && ++delta > maxInt) {
              error('overflow');
            }
            if (currentValue == n) {
              for (q = delta, k = base; ; k += base) {
                t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
                if (q < t) {
                  break;
                }
                qMinusT = q - t;
                baseMinusT = base - t;
                output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0)));
                q = floor(qMinusT / baseMinusT);
              }
              output.push(stringFromCharCode(digitToBasic(q, 0)));
              bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
              delta = 0;
              ++handledCPCount;
            }
          }
          ++delta;
          ++n;
        }
        return output.join('');
      }
      function toUnicode(input) {
        return mapDomain(input, function(string) {
          return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
        });
      }
      function toASCII(input) {
        return mapDomain(input, function(string) {
          return regexNonASCII.test(string) ? 'xn--' + encode(string) : string;
        });
      }
      punycode = {
        'version': '1.3.2',
        'ucs2': {
          'decode': ucs2decode,
          'encode': ucs2encode
        },
        'decode': decode,
        'encode': encode,
        'toASCII': toASCII,
        'toUnicode': toUnicode
      };
      if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        define('punycode', function() {
          return punycode;
        });
      } else if (freeExports && freeModule) {
        if (module.exports == freeExports) {
          freeModule.exports = punycode;
        } else {
          for (key in punycode) {
            punycode.hasOwnProperty(key) && (freeExports[key] = punycode[key]);
          }
        }
      } else {
        root.punycode = punycode;
      }
    }(this));
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
  return module.exports;
});

System.registerDynamic("npm:punycode@1.3.2.js", ["npm:punycode@1.3.2/punycode.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:punycode@1.3.2/punycode.js');
  return module.exports;
});

System.registerDynamic("npm:querystring@0.2.0/decode.js", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }
  module.exports = function(qs, sep, eq, options) {
    sep = sep || '&';
    eq = eq || '=';
    var obj = {};
    if (typeof qs !== 'string' || qs.length === 0) {
      return obj;
    }
    var regexp = /\+/g;
    qs = qs.split(sep);
    var maxKeys = 1000;
    if (options && typeof options.maxKeys === 'number') {
      maxKeys = options.maxKeys;
    }
    var len = qs.length;
    if (maxKeys > 0 && len > maxKeys) {
      len = maxKeys;
    }
    for (var i = 0; i < len; ++i) {
      var x = qs[i].replace(regexp, '%20'),
          idx = x.indexOf(eq),
          kstr,
          vstr,
          k,
          v;
      if (idx >= 0) {
        kstr = x.substr(0, idx);
        vstr = x.substr(idx + 1);
      } else {
        kstr = x;
        vstr = '';
      }
      k = decodeURIComponent(kstr);
      v = decodeURIComponent(vstr);
      if (!hasOwnProperty(obj, k)) {
        obj[k] = v;
      } else if (Array.isArray(obj[k])) {
        obj[k].push(v);
      } else {
        obj[k] = [obj[k], v];
      }
    }
    return obj;
  };
  return module.exports;
});

System.registerDynamic("npm:querystring@0.2.0/encode.js", [], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  var stringifyPrimitive = function(v) {
    switch (typeof v) {
      case 'string':
        return v;
      case 'boolean':
        return v ? 'true' : 'false';
      case 'number':
        return isFinite(v) ? v : '';
      default:
        return '';
    }
  };
  module.exports = function(obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    if (obj === null) {
      obj = undefined;
    }
    if (typeof obj === 'object') {
      return Object.keys(obj).map(function(k) {
        var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
        if (Array.isArray(obj[k])) {
          return obj[k].map(function(v) {
            return ks + encodeURIComponent(stringifyPrimitive(v));
          }).join(sep);
        } else {
          return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
        }
      }).join(sep);
    }
    if (!name)
      return '';
    return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
  };
  return module.exports;
});

System.registerDynamic("npm:querystring@0.2.0/index.js", ["npm:querystring@0.2.0/decode.js", "npm:querystring@0.2.0/encode.js"], true, function($__require, exports, module) {
  "use strict";
  ;
  var define,
      global = this,
      GLOBAL = this;
  exports.decode = exports.parse = $__require('npm:querystring@0.2.0/decode.js');
  exports.encode = exports.stringify = $__require('npm:querystring@0.2.0/encode.js');
  return module.exports;
});

System.registerDynamic("npm:querystring@0.2.0.js", ["npm:querystring@0.2.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:querystring@0.2.0/index.js');
  return module.exports;
});

System.registerDynamic("npm:url@0.10.3/url.js", ["npm:punycode@1.3.2.js", "npm:querystring@0.2.0.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var punycode = $__require('npm:punycode@1.3.2.js');
  exports.parse = urlParse;
  exports.resolve = urlResolve;
  exports.resolveObject = urlResolveObject;
  exports.format = urlFormat;
  exports.Url = Url;
  function Url() {
    this.protocol = null;
    this.slashes = null;
    this.auth = null;
    this.host = null;
    this.port = null;
    this.hostname = null;
    this.hash = null;
    this.search = null;
    this.query = null;
    this.pathname = null;
    this.path = null;
    this.href = null;
  }
  var protocolPattern = /^([a-z0-9.+-]+:)/i,
      portPattern = /:[0-9]*$/,
      delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],
      unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),
      autoEscape = ['\''].concat(unwise),
      nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
      hostEndingChars = ['/', '?', '#'],
      hostnameMaxLen = 255,
      hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
      hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,
      unsafeProtocol = {
        'javascript': true,
        'javascript:': true
      },
      hostlessProtocol = {
        'javascript': true,
        'javascript:': true
      },
      slashedProtocol = {
        'http': true,
        'https': true,
        'ftp': true,
        'gopher': true,
        'file': true,
        'http:': true,
        'https:': true,
        'ftp:': true,
        'gopher:': true,
        'file:': true
      },
      querystring = $__require('npm:querystring@0.2.0.js');
  function urlParse(url, parseQueryString, slashesDenoteHost) {
    if (url && isObject(url) && url instanceof Url)
      return url;
    var u = new Url;
    u.parse(url, parseQueryString, slashesDenoteHost);
    return u;
  }
  Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
    if (!isString(url)) {
      throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
    }
    var rest = url;
    rest = rest.trim();
    var proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      var lowerProto = proto.toLowerCase();
      this.protocol = lowerProto;
      rest = rest.substr(proto.length);
    }
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      var slashes = rest.substr(0, 2) === '//';
      if (slashes && !(proto && hostlessProtocol[proto])) {
        rest = rest.substr(2);
        this.slashes = true;
      }
    }
    if (!hostlessProtocol[proto] && (slashes || (proto && !slashedProtocol[proto]))) {
      var hostEnd = -1;
      for (var i = 0; i < hostEndingChars.length; i++) {
        var hec = rest.indexOf(hostEndingChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
          hostEnd = hec;
      }
      var auth,
          atSign;
      if (hostEnd === -1) {
        atSign = rest.lastIndexOf('@');
      } else {
        atSign = rest.lastIndexOf('@', hostEnd);
      }
      if (atSign !== -1) {
        auth = rest.slice(0, atSign);
        rest = rest.slice(atSign + 1);
        this.auth = decodeURIComponent(auth);
      }
      hostEnd = -1;
      for (var i = 0; i < nonHostChars.length; i++) {
        var hec = rest.indexOf(nonHostChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
          hostEnd = hec;
      }
      if (hostEnd === -1)
        hostEnd = rest.length;
      this.host = rest.slice(0, hostEnd);
      rest = rest.slice(hostEnd);
      this.parseHost();
      this.hostname = this.hostname || '';
      var ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';
      if (!ipv6Hostname) {
        var hostparts = this.hostname.split(/\./);
        for (var i = 0,
            l = hostparts.length; i < l; i++) {
          var part = hostparts[i];
          if (!part)
            continue;
          if (!part.match(hostnamePartPattern)) {
            var newpart = '';
            for (var j = 0,
                k = part.length; j < k; j++) {
              if (part.charCodeAt(j) > 127) {
                newpart += 'x';
              } else {
                newpart += part[j];
              }
            }
            if (!newpart.match(hostnamePartPattern)) {
              var validParts = hostparts.slice(0, i);
              var notHost = hostparts.slice(i + 1);
              var bit = part.match(hostnamePartStart);
              if (bit) {
                validParts.push(bit[1]);
                notHost.unshift(bit[2]);
              }
              if (notHost.length) {
                rest = '/' + notHost.join('.') + rest;
              }
              this.hostname = validParts.join('.');
              break;
            }
          }
        }
      }
      if (this.hostname.length > hostnameMaxLen) {
        this.hostname = '';
      } else {
        this.hostname = this.hostname.toLowerCase();
      }
      if (!ipv6Hostname) {
        var domainArray = this.hostname.split('.');
        var newOut = [];
        for (var i = 0; i < domainArray.length; ++i) {
          var s = domainArray[i];
          newOut.push(s.match(/[^A-Za-z0-9_-]/) ? 'xn--' + punycode.encode(s) : s);
        }
        this.hostname = newOut.join('.');
      }
      var p = this.port ? ':' + this.port : '';
      var h = this.hostname || '';
      this.host = h + p;
      this.href += this.host;
      if (ipv6Hostname) {
        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
        if (rest[0] !== '/') {
          rest = '/' + rest;
        }
      }
    }
    if (!unsafeProtocol[lowerProto]) {
      for (var i = 0,
          l = autoEscape.length; i < l; i++) {
        var ae = autoEscape[i];
        var esc = encodeURIComponent(ae);
        if (esc === ae) {
          esc = escape(ae);
        }
        rest = rest.split(ae).join(esc);
      }
    }
    var hash = rest.indexOf('#');
    if (hash !== -1) {
      this.hash = rest.substr(hash);
      rest = rest.slice(0, hash);
    }
    var qm = rest.indexOf('?');
    if (qm !== -1) {
      this.search = rest.substr(qm);
      this.query = rest.substr(qm + 1);
      if (parseQueryString) {
        this.query = querystring.parse(this.query);
      }
      rest = rest.slice(0, qm);
    } else if (parseQueryString) {
      this.search = '';
      this.query = {};
    }
    if (rest)
      this.pathname = rest;
    if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
      this.pathname = '/';
    }
    if (this.pathname || this.search) {
      var p = this.pathname || '';
      var s = this.search || '';
      this.path = p + s;
    }
    this.href = this.format();
    return this;
  };
  function urlFormat(obj) {
    if (isString(obj))
      obj = urlParse(obj);
    if (!(obj instanceof Url))
      return Url.prototype.format.call(obj);
    return obj.format();
  }
  Url.prototype.format = function() {
    var auth = this.auth || '';
    if (auth) {
      auth = encodeURIComponent(auth);
      auth = auth.replace(/%3A/i, ':');
      auth += '@';
    }
    var protocol = this.protocol || '',
        pathname = this.pathname || '',
        hash = this.hash || '',
        host = false,
        query = '';
    if (this.host) {
      host = auth + this.host;
    } else if (this.hostname) {
      host = auth + (this.hostname.indexOf(':') === -1 ? this.hostname : '[' + this.hostname + ']');
      if (this.port) {
        host += ':' + this.port;
      }
    }
    if (this.query && isObject(this.query) && Object.keys(this.query).length) {
      query = querystring.stringify(this.query);
    }
    var search = this.search || (query && ('?' + query)) || '';
    if (protocol && protocol.substr(-1) !== ':')
      protocol += ':';
    if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
      host = '//' + (host || '');
      if (pathname && pathname.charAt(0) !== '/')
        pathname = '/' + pathname;
    } else if (!host) {
      host = '';
    }
    if (hash && hash.charAt(0) !== '#')
      hash = '#' + hash;
    if (search && search.charAt(0) !== '?')
      search = '?' + search;
    pathname = pathname.replace(/[?#]/g, function(match) {
      return encodeURIComponent(match);
    });
    search = search.replace('#', '%23');
    return protocol + host + pathname + search + hash;
  };
  function urlResolve(source, relative) {
    return urlParse(source, false, true).resolve(relative);
  }
  Url.prototype.resolve = function(relative) {
    return this.resolveObject(urlParse(relative, false, true)).format();
  };
  function urlResolveObject(source, relative) {
    if (!source)
      return relative;
    return urlParse(source, false, true).resolveObject(relative);
  }
  Url.prototype.resolveObject = function(relative) {
    if (isString(relative)) {
      var rel = new Url();
      rel.parse(relative, false, true);
      relative = rel;
    }
    var result = new Url();
    Object.keys(this).forEach(function(k) {
      result[k] = this[k];
    }, this);
    result.hash = relative.hash;
    if (relative.href === '') {
      result.href = result.format();
      return result;
    }
    if (relative.slashes && !relative.protocol) {
      Object.keys(relative).forEach(function(k) {
        if (k !== 'protocol')
          result[k] = relative[k];
      });
      if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
        result.path = result.pathname = '/';
      }
      result.href = result.format();
      return result;
    }
    if (relative.protocol && relative.protocol !== result.protocol) {
      if (!slashedProtocol[relative.protocol]) {
        Object.keys(relative).forEach(function(k) {
          result[k] = relative[k];
        });
        result.href = result.format();
        return result;
      }
      result.protocol = relative.protocol;
      if (!relative.host && !hostlessProtocol[relative.protocol]) {
        var relPath = (relative.pathname || '').split('/');
        while (relPath.length && !(relative.host = relPath.shift()))
          ;
        if (!relative.host)
          relative.host = '';
        if (!relative.hostname)
          relative.hostname = '';
        if (relPath[0] !== '')
          relPath.unshift('');
        if (relPath.length < 2)
          relPath.unshift('');
        result.pathname = relPath.join('/');
      } else {
        result.pathname = relative.pathname;
      }
      result.search = relative.search;
      result.query = relative.query;
      result.host = relative.host || '';
      result.auth = relative.auth;
      result.hostname = relative.hostname || relative.host;
      result.port = relative.port;
      if (result.pathname || result.search) {
        var p = result.pathname || '';
        var s = result.search || '';
        result.path = p + s;
      }
      result.slashes = result.slashes || relative.slashes;
      result.href = result.format();
      return result;
    }
    var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
        isRelAbs = (relative.host || relative.pathname && relative.pathname.charAt(0) === '/'),
        mustEndAbs = (isRelAbs || isSourceAbs || (result.host && relative.pathname)),
        removeAllDots = mustEndAbs,
        srcPath = result.pathname && result.pathname.split('/') || [],
        relPath = relative.pathname && relative.pathname.split('/') || [],
        psychotic = result.protocol && !slashedProtocol[result.protocol];
    if (psychotic) {
      result.hostname = '';
      result.port = null;
      if (result.host) {
        if (srcPath[0] === '')
          srcPath[0] = result.host;
        else
          srcPath.unshift(result.host);
      }
      result.host = '';
      if (relative.protocol) {
        relative.hostname = null;
        relative.port = null;
        if (relative.host) {
          if (relPath[0] === '')
            relPath[0] = relative.host;
          else
            relPath.unshift(relative.host);
        }
        relative.host = null;
      }
      mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
    }
    if (isRelAbs) {
      result.host = (relative.host || relative.host === '') ? relative.host : result.host;
      result.hostname = (relative.hostname || relative.hostname === '') ? relative.hostname : result.hostname;
      result.search = relative.search;
      result.query = relative.query;
      srcPath = relPath;
    } else if (relPath.length) {
      if (!srcPath)
        srcPath = [];
      srcPath.pop();
      srcPath = srcPath.concat(relPath);
      result.search = relative.search;
      result.query = relative.query;
    } else if (!isNullOrUndefined(relative.search)) {
      if (psychotic) {
        result.hostname = result.host = srcPath.shift();
        var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
        if (authInHost) {
          result.auth = authInHost.shift();
          result.host = result.hostname = authInHost.shift();
        }
      }
      result.search = relative.search;
      result.query = relative.query;
      if (!isNull(result.pathname) || !isNull(result.search)) {
        result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
      }
      result.href = result.format();
      return result;
    }
    if (!srcPath.length) {
      result.pathname = null;
      if (result.search) {
        result.path = '/' + result.search;
      } else {
        result.path = null;
      }
      result.href = result.format();
      return result;
    }
    var last = srcPath.slice(-1)[0];
    var hasTrailingSlash = ((result.host || relative.host) && (last === '.' || last === '..') || last === '');
    var up = 0;
    for (var i = srcPath.length; i >= 0; i--) {
      last = srcPath[i];
      if (last == '.') {
        srcPath.splice(i, 1);
      } else if (last === '..') {
        srcPath.splice(i, 1);
        up++;
      } else if (up) {
        srcPath.splice(i, 1);
        up--;
      }
    }
    if (!mustEndAbs && !removeAllDots) {
      for (; up--; up) {
        srcPath.unshift('..');
      }
    }
    if (mustEndAbs && srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
      srcPath.unshift('');
    }
    if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
      srcPath.push('');
    }
    var isAbsolute = srcPath[0] === '' || (srcPath[0] && srcPath[0].charAt(0) === '/');
    if (psychotic) {
      result.hostname = result.host = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
      var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }
    mustEndAbs = mustEndAbs || (result.host && srcPath.length);
    if (mustEndAbs && !isAbsolute) {
      srcPath.unshift('');
    }
    if (!srcPath.length) {
      result.pathname = null;
      result.path = null;
    } else {
      result.pathname = srcPath.join('/');
    }
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
    }
    result.auth = relative.auth || result.auth;
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  };
  Url.prototype.parseHost = function() {
    var host = this.host;
    var port = portPattern.exec(host);
    if (port) {
      port = port[0];
      if (port !== ':') {
        this.port = port.substr(1);
      }
      host = host.substr(0, host.length - port.length);
    }
    if (host)
      this.hostname = host;
  };
  function isString(arg) {
    return typeof arg === "string";
  }
  function isObject(arg) {
    return typeof arg === 'object' && arg !== null;
  }
  function isNull(arg) {
    return arg === null;
  }
  function isNullOrUndefined(arg) {
    return arg == null;
  }
  return module.exports;
});

System.registerDynamic("npm:url@0.10.3.js", ["npm:url@0.10.3/url.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:url@0.10.3/url.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-url@0.1.0/index.js", ["npm:url@0.10.3.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = System._nodeRequire ? System._nodeRequire('url') : $__require('npm:url@0.10.3.js');
  return module.exports;
});

System.registerDynamic("github:jspm/nodelibs-url@0.1.0.js", ["github:jspm/nodelibs-url@0.1.0/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('github:jspm/nodelibs-url@0.1.0/index.js');
  return module.exports;
});

System.registerDynamic("npm:uuid@3.0.1/v1.js", ["npm:uuid@3.0.1/lib/rng-browser.js", "npm:uuid@3.0.1/lib/bytesToUuid.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var rng = $__require('npm:uuid@3.0.1/lib/rng-browser.js');
  var bytesToUuid = $__require('npm:uuid@3.0.1/lib/bytesToUuid.js');
  var _seedBytes = rng();
  var _nodeId = [_seedBytes[0] | 0x01, _seedBytes[1], _seedBytes[2], _seedBytes[3], _seedBytes[4], _seedBytes[5]];
  var _clockseq = (_seedBytes[6] << 8 | _seedBytes[7]) & 0x3fff;
  var _lastMSecs = 0,
      _lastNSecs = 0;
  function v1(options, buf, offset) {
    var i = buf && offset || 0;
    var b = buf || [];
    options = options || {};
    var clockseq = options.clockseq !== undefined ? options.clockseq : _clockseq;
    var msecs = options.msecs !== undefined ? options.msecs : new Date().getTime();
    var nsecs = options.nsecs !== undefined ? options.nsecs : _lastNSecs + 1;
    var dt = (msecs - _lastMSecs) + (nsecs - _lastNSecs) / 10000;
    if (dt < 0 && options.clockseq === undefined) {
      clockseq = clockseq + 1 & 0x3fff;
    }
    if ((dt < 0 || msecs > _lastMSecs) && options.nsecs === undefined) {
      nsecs = 0;
    }
    if (nsecs >= 10000) {
      throw new Error('uuid.v1(): Can\'t create more than 10M uuids/sec');
    }
    _lastMSecs = msecs;
    _lastNSecs = nsecs;
    _clockseq = clockseq;
    msecs += 12219292800000;
    var tl = ((msecs & 0xfffffff) * 10000 + nsecs) % 0x100000000;
    b[i++] = tl >>> 24 & 0xff;
    b[i++] = tl >>> 16 & 0xff;
    b[i++] = tl >>> 8 & 0xff;
    b[i++] = tl & 0xff;
    var tmh = (msecs / 0x100000000 * 10000) & 0xfffffff;
    b[i++] = tmh >>> 8 & 0xff;
    b[i++] = tmh & 0xff;
    b[i++] = tmh >>> 24 & 0xf | 0x10;
    b[i++] = tmh >>> 16 & 0xff;
    b[i++] = clockseq >>> 8 | 0x80;
    b[i++] = clockseq & 0xff;
    var node = options.node || _nodeId;
    for (var n = 0; n < 6; ++n) {
      b[i + n] = node[n];
    }
    return buf ? buf : bytesToUuid(b);
  }
  module.exports = v1;
  return module.exports;
});

System.registerDynamic("npm:uuid@3.0.1/lib/rng-browser.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var rng;
  var crypto = global.crypto || global.msCrypto;
  if (crypto && crypto.getRandomValues) {
    var rnds8 = new Uint8Array(16);
    rng = function whatwgRNG() {
      crypto.getRandomValues(rnds8);
      return rnds8;
    };
  }
  if (!rng) {
    var rnds = new Array(16);
    rng = function() {
      for (var i = 0,
          r; i < 16; i++) {
        if ((i & 0x03) === 0)
          r = Math.random() * 0x100000000;
        rnds[i] = r >>> ((i & 0x03) << 3) & 0xff;
      }
      return rnds;
    };
  }
  module.exports = rng;
  return module.exports;
});

System.registerDynamic("npm:uuid@3.0.1/lib/bytesToUuid.js", [], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var byteToHex = [];
  for (var i = 0; i < 256; ++i) {
    byteToHex[i] = (i + 0x100).toString(16).substr(1);
  }
  function bytesToUuid(buf, offset) {
    var i = offset || 0;
    var bth = byteToHex;
    return bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + '-' + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]] + bth[buf[i++]];
  }
  module.exports = bytesToUuid;
  return module.exports;
});

System.registerDynamic("npm:uuid@3.0.1/v4.js", ["npm:uuid@3.0.1/lib/rng-browser.js", "npm:uuid@3.0.1/lib/bytesToUuid.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var rng = $__require('npm:uuid@3.0.1/lib/rng-browser.js');
  var bytesToUuid = $__require('npm:uuid@3.0.1/lib/bytesToUuid.js');
  function v4(options, buf, offset) {
    var i = buf && offset || 0;
    if (typeof(options) == 'string') {
      buf = options == 'binary' ? new Array(16) : null;
      options = null;
    }
    options = options || {};
    var rnds = options.random || (options.rng || rng)();
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    if (buf) {
      for (var ii = 0; ii < 16; ++ii) {
        buf[i + ii] = rnds[ii];
      }
    }
    return buf || bytesToUuid(rnds);
  }
  module.exports = v4;
  return module.exports;
});

System.registerDynamic("npm:uuid@3.0.1/index.js", ["npm:uuid@3.0.1/v1.js", "npm:uuid@3.0.1/v4.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var v1 = $__require('npm:uuid@3.0.1/v1.js');
  var v4 = $__require('npm:uuid@3.0.1/v4.js');
  var uuid = v4;
  uuid.v1 = v1;
  uuid.v4 = v4;
  module.exports = uuid;
  return module.exports;
});

System.registerDynamic("npm:uuid@3.0.1.js", ["npm:uuid@3.0.1/index.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  module.exports = $__require('npm:uuid@3.0.1/index.js');
  return module.exports;
});

System.registerDynamic("src/utils.js", ["npm:lodash@4.17.4/isObjectLike.js", "npm:lodash@4.17.4/isPlainObject.js", "npm:lodash@4.17.4/isArray.js", "npm:lodash@4.17.4/isString.js", "npm:lodash@4.17.4/isBoolean.js", "npm:lodash@4.17.4/isNumber.js", "npm:lodash@4.17.4/isInteger.js", "npm:lodash@4.17.4/toInteger.js", "npm:lodash@4.17.4/isEqual.js", "npm:lodash@4.17.4/cloneDeep.js", "github:jspm/nodelibs-url@0.1.0.js", "npm:uuid@3.0.1.js"], true, function($__require, exports, module) {
  ;
  var define,
      global = this,
      GLOBAL = this;
  var utils = {};
  utils.isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  utils.isPlainObject = $__require('npm:lodash@4.17.4/isPlainObject.js');
  utils.isArray = $__require('npm:lodash@4.17.4/isArray.js');
  utils.isString = $__require('npm:lodash@4.17.4/isString.js');
  utils.isBoolean = $__require('npm:lodash@4.17.4/isBoolean.js');
  utils.isNumber = $__require('npm:lodash@4.17.4/isNumber.js');
  utils.isInteger = $__require('npm:lodash@4.17.4/isInteger.js');
  utils.toInteger = $__require('npm:lodash@4.17.4/toInteger.js');
  utils.isEqual = $__require('npm:lodash@4.17.4/isEqual.js');
  utils.clone = $__require('npm:lodash@4.17.4/cloneDeep.js');
  var URL = $__require('github:jspm/nodelibs-url@0.1.0.js');
  var uuid = $__require('npm:uuid@3.0.1.js');
  utils.uuid1 = uuid.v1;
  utils.uuid4 = uuid.v4;
  utils.parseURL = function(urlString) {
    url = URL.parse(urlString);
    url.pathArray = url.pathname ? url.pathname.split("/").slice(1) : [];
    return url;
  };
  utils.diff = function(oldVal, newVal) {
    if (isString(newVal) && isString(oldVal))
      return stringDiff(oldVal, newVal);
    if (isArray(newVal) && isArray(oldVal))
      return arrayDiff(oldVal, newVal);
    if (isObjectLike(newVal) && isObjectLike(oldVal))
      return objectDiff(oldVal, newVal);
    if (newVal !== undefined && oldVal === undefined)
      return [{
        type: "insert",
        path: [],
        value: newVal
      }];
    if (newVal === undefined && oldVal !== undefined)
      return [{
        type: "remove",
        path: [],
        value: oldVal
      }];
    if (newVal !== oldVal)
      return [{
        type: "set",
        path: [],
        value: newVal
      }];
    return [];
  };
  function stringDiff(oldStr, newStr) {
    var changes = [];
    if (oldStr !== newStr) {
      var commonStart = 0;
      while (oldStr.charAt(commonStart) === newStr.charAt(commonStart)) {
        commonStart++;
      }
      var commonEnd = 0;
      while (oldStr.charAt(oldStr.length - 1 - commonEnd) === newStr.charAt(newStr.length - 1 - commonEnd) && commonEnd + commonStart < oldStr.length && commonEnd + commonStart < newStr.length) {
        commonEnd++;
      }
      if (oldStr.length !== commonStart + commonEnd) {
        changes.push({
          type: "remove",
          path: [commonStart],
          value: oldStr.slice(commonStart, oldStr.length - commonEnd)
        });
      }
      if (newStr.length !== commonStart + commonEnd) {
        changes.push({
          type: "insert",
          path: [commonStart],
          value: newStr.slice(commonStart, newStr.length - commonEnd)
        });
      }
    }
    return changes;
  }
  function arrayDiff(oldArr, newArr) {
    return objectDiff(oldArr, newArr);
  }
  function objectDiff(oldObj, newObj) {
    var changes = [];
    for (let key in newObj) {
      let subChanges = utils.diff(oldObj[key], newObj[key]);
      for (let subChange of subChanges) {
        subChange.path = [key].concat(subChange.path);
      }
      changes = changes.concat(subChanges);
    }
    for (let key in oldObj) {
      if (newObj[key] === undefined) {
        changes.push({
          type: "remove",
          path: [key],
          value: oldObj[key]
        });
      }
    }
    return changes;
  }
  module.exports = utils;
  return module.exports;
});

System.register("src/Path.js", ["npm:babel-runtime@5.8.38/helpers/get.js", "npm:babel-runtime@5.8.38/helpers/inherits.js", "npm:babel-runtime@5.8.38/helpers/create-class.js", "npm:babel-runtime@5.8.38/helpers/class-call-check.js", "npm:babel-runtime@5.8.38/helpers/to-consumable-array.js", "npm:babel-runtime@5.8.38/helpers/bind.js", "npm:babel-runtime@5.8.38/core-js/get-iterator.js", "npm:babel-runtime@5.8.38/core-js/array/from.js", "src/utils.js"], function (_export) {
    var _get, _inherits, _createClass, _classCallCheck, _toConsumableArray, _bind, _getIterator, _Array$from, utils, Path;

    return {
        setters: [function (_npmBabelRuntime5838HelpersGetJs) {
            _get = _npmBabelRuntime5838HelpersGetJs["default"];
        }, function (_npmBabelRuntime5838HelpersInheritsJs) {
            _inherits = _npmBabelRuntime5838HelpersInheritsJs["default"];
        }, function (_npmBabelRuntime5838HelpersCreateClassJs) {
            _createClass = _npmBabelRuntime5838HelpersCreateClassJs["default"];
        }, function (_npmBabelRuntime5838HelpersClassCallCheckJs) {
            _classCallCheck = _npmBabelRuntime5838HelpersClassCallCheckJs["default"];
        }, function (_npmBabelRuntime5838HelpersToConsumableArrayJs) {
            _toConsumableArray = _npmBabelRuntime5838HelpersToConsumableArrayJs["default"];
        }, function (_npmBabelRuntime5838HelpersBindJs) {
            _bind = _npmBabelRuntime5838HelpersBindJs["default"];
        }, function (_npmBabelRuntime5838CoreJsGetIteratorJs) {
            _getIterator = _npmBabelRuntime5838CoreJsGetIteratorJs["default"];
        }, function (_npmBabelRuntime5838CoreJsArrayFromJs) {
            _Array$from = _npmBabelRuntime5838CoreJsArrayFromJs["default"];
        }, function (_srcUtilsJs) {
            utils = _srcUtilsJs["default"];
        }],
        execute: function () {
            "use strict";

            Path = (function (_Array) {
                _inherits(Path, _Array);

                _createClass(Path, [{
                    key: "STRING_SEPARATOR",
                    get: function get() {
                        return "/";
                    }
                }]);

                function Path() {
                    _classCallCheck(this, Path);

                    _get(Object.getPrototypeOf(Path.prototype), "constructor", this).call(this);

                    var _iteratorNormalCompletion = true;
                    var _didIteratorError = false;
                    var _iteratorError = undefined;

                    try {
                        for (var _len = arguments.length, paths = Array(_len), _key = 0; _key < _len; _key++) {
                            paths[_key] = arguments[_key];
                        }

                        for (var _iterator = _getIterator(paths), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                            var path = _step.value;

                            // Transform each subPath in an array of keys

                            if (Array.isArray(path) || path instanceof Path) {
                                path = new (_bind.apply(Path, [null].concat(_toConsumableArray(path))))();
                            } else if (path !== "" && path !== undefined && path !== null) {
                                path = String(path).split(this.STRING_SEPARATOR);
                            } else {
                                path = [];
                            }

                            // Append each key of the subPath to this path

                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = _getIterator(path), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var item = _step2.value;

                                    if (item !== "") {
                                        this.push(item);
                                    }
                                }
                            } catch (err) {
                                _didIteratorError2 = true;
                                _iteratorError2 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                                        _iterator2["return"]();
                                    }
                                } finally {
                                    if (_didIteratorError2) {
                                        throw _iteratorError2;
                                    }
                                }
                            }
                        }
                    } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                    } finally {
                        try {
                            if (!_iteratorNormalCompletion && _iterator["return"]) {
                                _iterator["return"]();
                            }
                        } finally {
                            if (_didIteratorError) {
                                throw _iteratorError;
                            }
                        }
                    }
                }

                _createClass(Path, [{
                    key: "slice",
                    value: function slice(begin, end) {

                        return new Path(_Array$from(this).slice(begin, end));
                    }
                }, {
                    key: "equals",
                    value: function equals(other) {
                        other = new Path(other);
                        return String(this) == String(other);
                    }
                }, {
                    key: "isSubPathOf",
                    value: function isSubPathOf(path) {
                        path = new Path(path);
                        return this.slice(0, path.length).equals(path);
                    }
                }, {
                    key: "subPath",
                    value: function subPath() {
                        for (var _len2 = arguments.length, subPathItems = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                            subPathItems[_key2] = arguments[_key2];
                        }

                        subPathItems = new Path(subPathItems);
                        var subPath = _Array$from(this);
                        var _iteratorNormalCompletion3 = true;
                        var _didIteratorError3 = false;
                        var _iteratorError3 = undefined;

                        try {
                            for (var _iterator3 = _getIterator(subPathItems), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                                var subPathItem = _step3.value;

                                if (subPathItem === ".") {
                                    // subPath stays the same
                                } else if (subPathItem == "..") {
                                        var lastItem = subPath.pop();
                                        if (lastItem === undefined) return null;
                                    } else {
                                        subPath.push(subPathItem);
                                    }
                            }
                        } catch (err) {
                            _didIteratorError3 = true;
                            _iteratorError3 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                                    _iterator3["return"]();
                                }
                            } finally {
                                if (_didIteratorError3) {
                                    throw _iteratorError3;
                                }
                            }
                        }

                        return new Path(subPath);
                    }
                }, {
                    key: "lookup",
                    value: function lookup(obj) {

                        var value = obj;
                        var _iteratorNormalCompletion4 = true;
                        var _didIteratorError4 = false;
                        var _iteratorError4 = undefined;

                        try {
                            for (var _iterator4 = _getIterator(this), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                                var key = _step4.value;

                                if (utils.isArray(value) || utils.isString(value)) {
                                    if (!utils.isInteger(Number(key))) return null;
                                    var index = utils.toInteger(key);
                                    value = value[index];
                                } else if (utils.isObjectLike(value) && value.hasOwnProperty(key)) {
                                    value = value[key];
                                } else {
                                    return null;
                                }
                            }
                        } catch (err) {
                            _didIteratorError4 = true;
                            _iteratorError4 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                                    _iterator4["return"]();
                                }
                            } finally {
                                if (_didIteratorError4) {
                                    throw _iteratorError4;
                                }
                            }
                        }

                        return value === undefined ? null : value;
                    }

                    /**
                     *  ### Path.prototype.toString()
                     *  
                     *  Retruns the string represtnatation of the path.
                     *  
                     *  ```js
                     *  String(Path('a','b','c'))       // -> "a.b.c"
                     *  String(Path('a','b',1,'c'))     // -> "a.b[1].c"
                     *  ```
                     */

                }, {
                    key: "toString",
                    value: function toString() {

                        return this.join(this.STRING_SEPARATOR);
                    }
                }, {
                    key: "leaf",
                    get: function get() {
                        return this[this.length - 1];
                    }
                }, {
                    key: "parent",
                    get: function get() {
                        return this.slice(0, -1);
                    }
                }], [{
                    key: "from",
                    value: function from(path) {
                        return path instanceof Path ? path : new Path(path);
                    }
                }]);

                return Path;
            })(Array);

            _export("default", Path);
        }
    };
});
System.register("src/stores/AbstractStore.js", ["npm:babel-runtime@5.8.38/helpers/create-class.js", "npm:babel-runtime@5.8.38/helpers/class-call-check.js", "npm:babel-runtime@5.8.38/core-js/symbol.js", "npm:babel-runtime@5.8.38/regenerator.js", "npm:babel-runtime@5.8.38/core-js/get-iterator.js", "src/utils.js", "src/Path.js"], function (_export) {
    var _createClass, _classCallCheck, _Symbol, _regeneratorRuntime, _getIterator, utils, Path, $doc, AbstractStore, Document, Change, Subscription;

    return {
        setters: [function (_npmBabelRuntime5838HelpersCreateClassJs) {
            _createClass = _npmBabelRuntime5838HelpersCreateClassJs["default"];
        }, function (_npmBabelRuntime5838HelpersClassCallCheckJs) {
            _classCallCheck = _npmBabelRuntime5838HelpersClassCallCheckJs["default"];
        }, function (_npmBabelRuntime5838CoreJsSymbolJs) {
            _Symbol = _npmBabelRuntime5838CoreJsSymbolJs["default"];
        }, function (_npmBabelRuntime5838RegeneratorJs) {
            _regeneratorRuntime = _npmBabelRuntime5838RegeneratorJs["default"];
        }, function (_npmBabelRuntime5838CoreJsGetIteratorJs) {
            _getIterator = _npmBabelRuntime5838CoreJsGetIteratorJs["default"];
        }, function (_srcUtilsJs) {
            utils = _srcUtilsJs["default"];
        }, function (_srcPathJs) {
            Path = _srcPathJs["default"];
        }],
        execute: function () {
            "use strict";

            $doc = _Symbol("olojs.stores.$doc");

            AbstractStore = (function () {
                function AbstractStore(host) {
                    _classCallCheck(this, AbstractStore);

                    this.host = host;
                    this.connected = false;
                    this.cache = {};
                }

                _createClass(AbstractStore, [{
                    key: "connect",

                    // Abstract methods
                    value: function connect() {
                        return _regeneratorRuntime.async(function connect$(context$2$0) {
                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    this.connected = true;

                                case 1:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }, {
                    key: "getDocument",
                    value: function getDocument(id) {
                        var doc;
                        return _regeneratorRuntime.async(function getDocument$(context$2$0) {
                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    doc = this.cache[id];

                                    if (doc) {
                                        context$2$0.next = 5;
                                        break;
                                    }

                                    doc = new this.Store.Document(this, id);
                                    context$2$0.next = 5;
                                    return _regeneratorRuntime.awrap(doc.open());

                                case 5:
                                    return context$2$0.abrupt("return", doc);

                                case 6:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }, {
                    key: "disconnect",
                    value: function disconnect() {
                        var docId;
                        return _regeneratorRuntime.async(function disconnect$(context$2$0) {
                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    this.connected = false;
                                    context$2$0.t0 = _regeneratorRuntime.keys(this.cache);

                                case 2:
                                    if ((context$2$0.t1 = context$2$0.t0()).done) {
                                        context$2$0.next = 8;
                                        break;
                                    }

                                    docId = context$2$0.t1.value;
                                    context$2$0.next = 6;
                                    return _regeneratorRuntime.awrap(this.cache[docId].close());

                                case 6:
                                    context$2$0.next = 2;
                                    break;

                                case 8:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }, {
                    key: "Store",
                    get: function get() {
                        return this.constructor;
                    }
                }, {
                    key: "url",
                    get: function get() {
                        return this.Store.protocol + "//" + this.host;
                    }
                }], [{
                    key: "protocol",
                    get: function get() {
                        return "abstract:";
                    }
                }, {
                    key: "Document",
                    get: function get() {
                        return Document;
                    }
                }]);

                return AbstractStore;
            })();

            Document = (function () {
                function Document(store, id) {
                    _classCallCheck(this, Document);

                    this.store = store;
                    this.id = id;
                    this.subscriptions = [];
                }

                _createClass(Document, [{
                    key: "subscribe",
                    value: function subscribe(path, callback) {
                        var subscription = new Subscription(this, path, callback);
                        this.subscriptions.push(subscription);
                        return subscription;
                    }
                }, {
                    key: "dispatch",
                    value: function dispatch(path, key, removed, inserted) {
                        var change = new Change(this.type(path), [path, key], removed, inserted);
                        var _iteratorNormalCompletion = true;
                        var _didIteratorError = false;
                        var _iteratorError = undefined;

                        try {
                            for (var _iterator = _getIterator(this.subscriptions), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                var subscription = _step.value;

                                var subChange = change.SubChange(subscription.path);
                                if (subChange) subscription.callback(subChange);
                            }
                        } catch (err) {
                            _didIteratorError = true;
                            _iteratorError = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion && _iterator["return"]) {
                                    _iterator["return"]();
                                }
                            } finally {
                                if (_didIteratorError) {
                                    throw _iteratorError;
                                }
                            }
                        }
                    }
                }, {
                    key: "unsubscribe",
                    value: function unsubscribe(subscription) {
                        var index = this.subscriptions.indexOf(subscription);
                        if (index !== -1) {
                            this.subscriptions.splice(index, 1);
                        }
                    }
                }, {
                    key: "clone",
                    value: function clone(path) {
                        return utils.clone(this.get(path));
                    }

                    // abstract methods

                }, {
                    key: "open",
                    value: function open() {
                        return _regeneratorRuntime.async(function open$(context$2$0) {
                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    this.store.cache[this.id] = this;

                                case 1:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }, {
                    key: "type",
                    value: function type(path) {
                        /*  
                         *  Returns the type of the data at the given path as a string.
                         *  The returned value must be one of the following strings:
                         *  
                         *  - "dict"  for a plain object
                         *  - "list"  for an array
                         *  - "text"  for a string
                         *  - "numb"  for a number
                         *  - "bool"  for a boolean
                         *  - "none"  if the item doesn't exist
                         *
                         */
                    }
                }, {
                    key: "get",
                    value: function get(path) {
                        /*
                         *  Returns the data at the given path as follows:
                         *
                         *  - "dict" data  ->  plain javascript object
                         *  - "list" data  ->  javascript array
                         *  - "text" data  ->  javascript string
                         *  - "numb" data  ->  javascript number
                         *  - "bool" data  ->  javascript true or false value
                         *  - "none" data  ->  null
                         */
                    }
                }, {
                    key: "getDictKeys",
                    value: function getDictKeys(path) {}
                }, {
                    key: "getListSize",
                    value: function getListSize(path) {}
                }, {
                    key: "getTextSize",
                    value: function getTextSize(path) {}
                }, {
                    key: "setDictItem",
                    value: function setDictItem(path, key, newValue) {}
                }, {
                    key: "setListItem",
                    value: function setListItem(path, index, newItem) {}
                }, {
                    key: "insertListItems",
                    value: function insertListItems(path, index) {}
                }, {
                    key: "insertText",
                    value: function insertText(path, index, subString) {}
                }, {
                    key: "removeDictItem",
                    value: function removeDictItem(path, key) {}
                }, {
                    key: "removeListItems",
                    value: function removeListItems(path, index, count) {}
                }, {
                    key: "removeText",
                    value: function removeText(path, index, count) {}
                }, {
                    key: "close",
                    value: function close() {
                        return _regeneratorRuntime.async(function close$(context$2$0) {
                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    delete this.store.cache[this.id];

                                case 1:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }, {
                    key: "Store",
                    get: function get() {
                        return this.store.Store;
                    }
                }, {
                    key: "url",
                    get: function get() {
                        return this.store.url + "/" + this.id;
                    }
                }]);

                return Document;
            })();

            Change = (function () {
                function Change(type, path, removed, inserted) {
                    _classCallCheck(this, Change);

                    this.type = type;
                    this.path = path instanceof Path ? path : new Path(path);
                    this.removed = removed;
                    this.inserted = inserted;
                }

                _createClass(Change, [{
                    key: "SubChange",
                    value: function SubChange(path) {
                        path = Path.from(path);

                        if (this.path.isSubPathOf(path)) {
                            var subPath = this.path.slice(path.length);
                            return new Change(this.type, subPath, this.removed, this.inserted);
                        } else if (path.isSubPathOf(this.path)) {
                            var subPath = path.slice(this.path.length);
                            var removed = subPath.lookup(this.removed);
                            var inserted = subPath.lookup(this.inserted);
                            return new Change(this.type, [], removed, inserted);
                        } else {
                            return null;
                        }
                    }
                }]);

                return Change;
            })();

            Subscription = (function () {
                function Subscription(doc, path, callback) {
                    _classCallCheck(this, Subscription);

                    this[$doc] = doc;
                    this.path = Path.from(path);
                    this.callback = callback;
                }

                _createClass(Subscription, [{
                    key: "cancel",
                    value: function cancel() {
                        this[$doc].unsubscribe(this);
                    }
                }]);

                return Subscription;
            })();

            _export("default", AbstractStore);
        }
    };
});
System.register("src/stores/SharedbStore.js", ["npm:babel-runtime@5.8.38/helpers/create-class.js", "npm:babel-runtime@5.8.38/helpers/class-call-check.js", "npm:babel-runtime@5.8.38/helpers/get.js", "npm:babel-runtime@5.8.38/helpers/inherits.js", "npm:babel-runtime@5.8.38/core-js/promise.js", "npm:babel-runtime@5.8.38/regenerator.js", "npm:babel-runtime@5.8.38/core-js/get-iterator.js", "npm:babel-runtime@5.8.38/core-js/object/keys.js", "npm:babel-runtime@5.8.38/core-js/array/from.js", "npm:sharedb@1.0.0-beta.7/lib/client/index.js", "src/Path.js", "src/utils.js", "src/stores/AbstractStore.js"], function (_export) {
    var _createClass, _classCallCheck, _get, _inherits, _Promise, _regeneratorRuntime, _getIterator, _Object$keys, _Array$from, ShareDB, Path, utils, AbstractStore, Connection, SharedbStore, Document;

    return {
        setters: [function (_npmBabelRuntime5838HelpersCreateClassJs) {
            _createClass = _npmBabelRuntime5838HelpersCreateClassJs["default"];
        }, function (_npmBabelRuntime5838HelpersClassCallCheckJs) {
            _classCallCheck = _npmBabelRuntime5838HelpersClassCallCheckJs["default"];
        }, function (_npmBabelRuntime5838HelpersGetJs) {
            _get = _npmBabelRuntime5838HelpersGetJs["default"];
        }, function (_npmBabelRuntime5838HelpersInheritsJs) {
            _inherits = _npmBabelRuntime5838HelpersInheritsJs["default"];
        }, function (_npmBabelRuntime5838CoreJsPromiseJs) {
            _Promise = _npmBabelRuntime5838CoreJsPromiseJs["default"];
        }, function (_npmBabelRuntime5838RegeneratorJs) {
            _regeneratorRuntime = _npmBabelRuntime5838RegeneratorJs["default"];
        }, function (_npmBabelRuntime5838CoreJsGetIteratorJs) {
            _getIterator = _npmBabelRuntime5838CoreJsGetIteratorJs["default"];
        }, function (_npmBabelRuntime5838CoreJsObjectKeysJs) {
            _Object$keys = _npmBabelRuntime5838CoreJsObjectKeysJs["default"];
        }, function (_npmBabelRuntime5838CoreJsArrayFromJs) {
            _Array$from = _npmBabelRuntime5838CoreJsArrayFromJs["default"];
        }, function (_npmSharedb100Beta7LibClientIndexJs) {
            ShareDB = _npmSharedb100Beta7LibClientIndexJs["default"];
        }, function (_srcPathJs) {
            Path = _srcPathJs["default"];
        }, function (_srcUtilsJs) {
            utils = _srcUtilsJs["default"];
        }, function (_srcStoresAbstractStoreJs) {
            AbstractStore = _srcStoresAbstractStoreJs["default"];
        }],
        execute: function () {
            "use strict";

            Connection = (function () {
                function Connection(url) {
                    _classCallCheck(this, Connection);

                    this.url = url;
                }

                _createClass(Connection, [{
                    key: "open",
                    value: function open() {
                        var _this = this;

                        return new _Promise(function (resolve, reject) {
                            _this.socket = new WebSocket(_this.url);
                            _this.socket.onopen = function () {
                                _this.sharedb = new ShareDB.Connection(_this.socket);
                                resolve();
                            };
                            _this.socket.onerror = reject;
                        });
                    }
                }, {
                    key: "getDocument",
                    value: function getDocument(id) {
                        var _this2 = this;

                        return new _Promise(function (resolve, reject) {
                            var doc = _this2.sharedb.get("documents", id);
                            doc.subscribe(function (err) {
                                if (err) {
                                    reject(err);
                                } else if (doc.type === null) {
                                    doc.create({}, function (err) {
                                        if (err) {
                                            reject(err);
                                        } else {
                                            resolve(doc);
                                        }
                                    });
                                } else {
                                    resolve(doc);
                                }
                            });
                        });
                    }
                }, {
                    key: "close",
                    value: function close() {
                        var _this3 = this;

                        return new _Promise(function (resolve, reject) {
                            _this3.socket.onclose = resolve;
                            _this3.socket.onerror = reject;
                            _this3.socket.close();
                        });
                    }
                }]);

                return Connection;
            })();

            SharedbStore = (function (_AbstractStore) {
                _inherits(SharedbStore, _AbstractStore);

                function SharedbStore() {
                    _classCallCheck(this, SharedbStore);

                    _get(Object.getPrototypeOf(SharedbStore.prototype), "constructor", this).apply(this, arguments);
                }

                _createClass(SharedbStore, [{
                    key: "connect",
                    value: function connect() {
                        return _regeneratorRuntime.async(function connect$(context$2$0) {
                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    this.connection = new Connection("ws://" + this.host);
                                    context$2$0.next = 3;
                                    return _regeneratorRuntime.awrap(this.connection.open());

                                case 3:
                                    context$2$0.next = 5;
                                    return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(SharedbStore.prototype), "connect", this).call(this));

                                case 5:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }, {
                    key: "disconnect",
                    value: function disconnect() {
                        return _regeneratorRuntime.async(function disconnect$(context$2$0) {
                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    context$2$0.next = 2;
                                    return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(SharedbStore.prototype), "disconnect", this).call(this));

                                case 2:
                                    context$2$0.next = 4;
                                    return _regeneratorRuntime.awrap(this.connection.close());

                                case 4:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }], [{
                    key: "protocol",
                    get: function get() {
                        return "sharedb:";
                    }
                }, {
                    key: "Document",
                    get: function get() {
                        return Document;
                    }
                }]);

                return SharedbStore;
            })(AbstractStore);

            Document = (function (_AbstractStore$Document) {
                _inherits(Document, _AbstractStore$Document);

                function Document() {
                    _classCallCheck(this, Document);

                    _get(Object.getPrototypeOf(Document.prototype), "constructor", this).apply(this, arguments);
                }

                _createClass(Document, [{
                    key: "open",
                    value: function open() {
                        return _regeneratorRuntime.async(function open$(context$2$0) {
                            var _this4 = this;

                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    context$2$0.next = 2;
                                    return _regeneratorRuntime.awrap(this.store.connection.getDocument(this.id));

                                case 2:
                                    this.shareDoc = context$2$0.sent;

                                    this.shareDoc.on('op', function (ops, source) {
                                        var _iteratorNormalCompletion = true;
                                        var _didIteratorError = false;
                                        var _iteratorError = undefined;

                                        try {
                                            for (var _iterator = _getIterator(ops), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                                                var op = _step.value;

                                                _this4.dispatchOperation(op);
                                            }
                                        } catch (err) {
                                            _didIteratorError = true;
                                            _iteratorError = err;
                                        } finally {
                                            try {
                                                if (!_iteratorNormalCompletion && _iterator["return"]) {
                                                    _iterator["return"]();
                                                }
                                            } finally {
                                                if (_didIteratorError) {
                                                    throw _iteratorError;
                                                }
                                            }
                                        }
                                    });
                                    context$2$0.next = 6;
                                    return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(Document.prototype), "open", this).call(this));

                                case 6:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }, {
                    key: "dispatchOperation",
                    value: function dispatchOperation(op) {
                        var path = op.p.slice(0, op.p.length - 1);
                        var key = op.p[op.p.length - 1];

                        // setDictItem change
                        if ('od' in op && 'oi' in op) {
                            var removed = op.od;
                            var inserted = op.oi;
                        }

                        // setDictItem change
                        else if (!('od' in op) && 'oi' in op) {
                                var removed = null;
                                var inserted = op.oi;
                            }

                            // removeDictItem change
                            else if ('od' in op && !('oi' in op)) {
                                    var removed = op.od;
                                    var inserted = null;
                                }

                        // setListItem change
                        if ('ld' in op && 'li' in op) {
                            var removed = [op.ld];
                            var inserted = [op.li];
                        }

                        // insertListItem change
                        if (!('ld' in op) && 'li' in op) {
                            var removed = [];
                            var inserted = [op.li];
                        }

                        // removeListItem change
                        if ('ld' in op && !('li' in op)) {
                            var removed = [op.ld];
                            var inserted = [];
                        }

                        // insertText change
                        if ('si' in op) {
                            var removed = "";
                            var inserted = op.si;
                        }

                        // removeText change
                        if ('sd' in op) {
                            var removed = op.sd;
                            var inserted = "";
                        }

                        _get(Object.getPrototypeOf(Document.prototype), "dispatch", this).call(this, path, key, removed, inserted);
                    }
                }, {
                    key: "get",
                    value: function get(path) {
                        path = Path.from(path);
                        return path.lookup(this.data);
                    }
                }, {
                    key: "type",
                    value: function type(path) {
                        var value = this.get(path);
                        if (utils.isPlainObject(value)) return "dict";
                        if (utils.isArray(value)) return "list";
                        if (utils.isString(value)) return "text";
                        if (utils.isNumber(value)) return "numb";
                        if (utils.isBoolean(value)) return "bool";
                        return "none";
                    }
                }, {
                    key: "getDictKeys",
                    value: function getDictKeys(path) {
                        var dict = this.get(path);
                        return _Object$keys(dict);
                    }
                }, {
                    key: "setDictItem",
                    value: function setDictItem(path, key, newValue) {
                        var op = {};
                        op.p = _Array$from(new Path(path, key));
                        var oldValue = this.get(op.p);
                        if (oldValue !== null) op.od = oldValue;
                        op.oi = newValue;
                        this.shareDoc.submitOp(op);
                    }
                }, {
                    key: "removeDictItem",
                    value: function removeDictItem(path, key) {
                        var op = {};
                        op.p = _Array$from(new Path(path, key));
                        op.od = this.get(op.p);
                        if (op.od !== null) {
                            this.shareDoc.submitOp(op);
                        }
                    }
                }, {
                    key: "getListSize",
                    value: function getListSize(path) {
                        var list = this.get(path);
                        return list.length;
                    }
                }, {
                    key: "setListItem",
                    value: function setListItem(path, index, newItem) {
                        var op = {};
                        op.p = _Array$from(new Path(path, index));
                        op.ld = this.get(op.p);
                        op.li = newItem;
                        this.shareDoc.submitOp(op);
                    }
                }, {
                    key: "insertListItems",
                    value: function insertListItems(path, index) {
                        for (var _len = arguments.length, newItems = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
                            newItems[_key - 2] = arguments[_key];
                        }

                        newItems.reverse();
                        var _iteratorNormalCompletion2 = true;
                        var _didIteratorError2 = false;
                        var _iteratorError2 = undefined;

                        try {
                            for (var _iterator2 = _getIterator(newItems), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                var newItem = _step2.value;

                                var op = {};
                                op.p = _Array$from(new Path(path, index));
                                op.li = newItem;
                                this.shareDoc.submitOp(op);
                            }
                        } catch (err) {
                            _didIteratorError2 = true;
                            _iteratorError2 = err;
                        } finally {
                            try {
                                if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                                    _iterator2["return"]();
                                }
                            } finally {
                                if (_didIteratorError2) {
                                    throw _iteratorError2;
                                }
                            }
                        }
                    }
                }, {
                    key: "removeListItems",
                    value: function removeListItems(path, index, count) {
                        var op_path = _Array$from(new Path(path, index));
                        for (var i = 0; i < count; i++) {
                            var op = {};
                            op.p = op_path;
                            op.ld = this.get(op_path);
                            this.shareDoc.submitOp(op);
                        }
                    }
                }, {
                    key: "getTextSize",
                    value: function getTextSize(path) {
                        var text = this.get(path);
                        return text.length;
                    }
                }, {
                    key: "insertText",
                    value: function insertText(path, index, subString) {
                        var op = {};
                        op.p = _Array$from(new Path(path)).concat(index);
                        op.si = subString;
                        this.shareDoc.submitOp(op);
                    }
                }, {
                    key: "removeText",
                    value: function removeText(path, index, count) {
                        if (!(path instanceof Path)) path = new Path(path);
                        var parent = this.get(path.parent);
                        var key = path.leaf;

                        var text = this.get(path);
                        var subString = text.slice(index, index + count);

                        var op = {};
                        op.p = _Array$from(new Path(path)).concat(index);
                        op.sd = subString;
                        this.shareDoc.submitOp(op);
                    }
                }, {
                    key: "close",
                    value: function close() {
                        return _regeneratorRuntime.async(function close$(context$2$0) {
                            while (1) switch (context$2$0.prev = context$2$0.next) {
                                case 0:
                                    this.shareDoc.destroy();
                                    context$2$0.next = 3;
                                    return _regeneratorRuntime.awrap(_get(Object.getPrototypeOf(Document.prototype), "close", this).call(this));

                                case 3:
                                case "end":
                                    return context$2$0.stop();
                            }
                        }, null, this);
                    }
                }, {
                    key: "data",
                    get: function get() {
                        return this.shareDoc.data;
                    }
                }]);

                return Document;
            })(AbstractStore.Document);

            _export("default", SharedbStore);
        }
    };
});
System.register("src/Model.js", ["npm:babel-runtime@5.8.38/helpers/create-class.js", "npm:babel-runtime@5.8.38/helpers/class-call-check.js", "npm:babel-runtime@5.8.38/helpers/to-consumable-array.js", "npm:babel-runtime@5.8.38/core-js/symbol.js", "npm:babel-runtime@5.8.38/regenerator.js", "npm:babel-runtime@5.8.38/core-js/get-iterator.js", "src/utils.js", "src/Path.js", "src/stores/AbstractStore.js", "src/stores/MemoryStore.js", "src/stores/SharedbStore.js"], function (_export) {
    var _createClass, _classCallCheck, _toConsumableArray, _Symbol, _regeneratorRuntime, _getIterator, utils, Path, AbstractStore, MemoryStore, SharedbStore, storeTypes, cache, $doc, $path, SubModel;

    function Model(urlStr) {
        var model, url, Store, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, S, host, docId, path, storeURL, store, doc;

        return _regeneratorRuntime.async(function Model$(context$1$0) {
            while (1) switch (context$1$0.prev = context$1$0.next) {
                case 0:
                    model = cache.models[urlStr];

                    if (model) {
                        context$1$0.next = 46;
                        break;
                    }

                    url = utils.parseURL(urlStr);
                    _iteratorNormalCompletion = true;
                    _didIteratorError = false;
                    _iteratorError = undefined;
                    context$1$0.prev = 6;
                    _iterator = _getIterator(storeTypes);

                case 8:
                    if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        context$1$0.next = 16;
                        break;
                    }

                    S = _step.value;

                    if (!(S.protocol === url.protocol)) {
                        context$1$0.next = 13;
                        break;
                    }

                    Store = S;
                    return context$1$0.abrupt("break", 16);

                case 13:
                    _iteratorNormalCompletion = true;
                    context$1$0.next = 8;
                    break;

                case 16:
                    context$1$0.next = 22;
                    break;

                case 18:
                    context$1$0.prev = 18;
                    context$1$0.t0 = context$1$0["catch"](6);
                    _didIteratorError = true;
                    _iteratorError = context$1$0.t0;

                case 22:
                    context$1$0.prev = 22;
                    context$1$0.prev = 23;

                    if (!_iteratorNormalCompletion && _iterator["return"]) {
                        _iterator["return"]();
                    }

                case 25:
                    context$1$0.prev = 25;

                    if (!_didIteratorError) {
                        context$1$0.next = 28;
                        break;
                    }

                    throw _iteratorError;

                case 28:
                    return context$1$0.finish(25);

                case 29:
                    return context$1$0.finish(22);

                case 30:
                    if (Store) {
                        context$1$0.next = 32;
                        break;
                    }

                    throw new Error("Unknown store protocol: \"" + this.url.protocol + "\"");

                case 32:
                    host = url.host;
                    docId = url.pathArray[0];
                    path = new Path(url.pathArray.slice(1));
                    storeURL = Store.protocol + "//" + host;
                    store = cache.stores[storeURL];

                    if (store) {
                        context$1$0.next = 42;
                        break;
                    }

                    store = new Store(host);
                    context$1$0.next = 41;
                    return _regeneratorRuntime.awrap(store.connect());

                case 41:
                    cache.stores[storeURL] = store;

                case 42:
                    context$1$0.next = 44;
                    return _regeneratorRuntime.awrap(store.getDocument(docId));

                case 44:
                    doc = context$1$0.sent;

                    model = cache.models[urlStr] = new SubModel(doc, path);

                case 46:
                    return context$1$0.abrupt("return", model);

                case 47:
                case "end":
                    return context$1$0.stop();
            }
        }, null, this, [[6, 18, 22, 30], [23,, 25, 29]]);
    }

    function validValue(value) {

        if (utils.isPlainObject(value) || utils.isArray(value)) {
            return utils.clone(value);
        }

        if (utils.isString(value) || utils.isNumber(value) || utils.isBoolean(value)) {
            return value;
        }

        throw new Error("Invalid value type.");
    }

    function validIndex(index, size) {
        var overflow = arguments.length <= 2 || arguments[2] === undefined ? 0 : arguments[2];

        index = Number(index);
        if (utils.isInteger(index)) {
            if (index < 0) index = size + index;
            if (0 <= index && index < size + overflow) {
                return index;
            }
        }
        throw new Error("Invalid index.");
    }

    function validCount(count, index, size) {
        count = Number(count);
        if (utils.isInteger(count)) {
            return Math.min(count, size - index);
        }
        throw new Error("Count should be an integert.");
    }

    function throwInvalidMethod(type, method) {
        throw new Error("Method '" + method + "' cannod be called on model type " + type + ".");
    }

    return {
        setters: [function (_npmBabelRuntime5838HelpersCreateClassJs) {
            _createClass = _npmBabelRuntime5838HelpersCreateClassJs["default"];
        }, function (_npmBabelRuntime5838HelpersClassCallCheckJs) {
            _classCallCheck = _npmBabelRuntime5838HelpersClassCallCheckJs["default"];
        }, function (_npmBabelRuntime5838HelpersToConsumableArrayJs) {
            _toConsumableArray = _npmBabelRuntime5838HelpersToConsumableArrayJs["default"];
        }, function (_npmBabelRuntime5838CoreJsSymbolJs) {
            _Symbol = _npmBabelRuntime5838CoreJsSymbolJs["default"];
        }, function (_npmBabelRuntime5838RegeneratorJs) {
            _regeneratorRuntime = _npmBabelRuntime5838RegeneratorJs["default"];
        }, function (_npmBabelRuntime5838CoreJsGetIteratorJs) {
            _getIterator = _npmBabelRuntime5838CoreJsGetIteratorJs["default"];
        }, function (_srcUtilsJs) {
            utils = _srcUtilsJs["default"];
        }, function (_srcPathJs) {
            Path = _srcPathJs["default"];
        }, function (_srcStoresAbstractStoreJs) {
            AbstractStore = _srcStoresAbstractStoreJs["default"];
        }, function (_srcStoresMemoryStoreJs) {
            MemoryStore = _srcStoresMemoryStoreJs["default"];
        }, function (_srcStoresSharedbStoreJs) {
            SharedbStore = _srcStoresSharedbStoreJs["default"];
        }],
        execute: function () {
            "use strict";

            storeTypes = [MemoryStore, SharedbStore];
            cache = {
                stores: {},
                models: {}
            };
            $doc = _Symbol("olojs.Model.$doc");
            $path = _Symbol("olojs.Model.$path");

            SubModel = (function () {
                function SubModel(doc, path) {
                    _classCallCheck(this, SubModel);

                    this[$doc] = doc;
                    this[$path] = Path.from(path);
                }

                _createClass(SubModel, [{
                    key: "getSubModel",
                    value: function getSubModel(path) {
                        if (typeof path === "string" && path[0] === "/") {
                            var subModelPath = new Path(path);
                        } else {
                            var subModelPath = this.path.subPath(path);
                            if (subModelPath === null) return null;
                        }
                        var modelURL = this[$doc].url + "/" + subModelPath.join("/");
                        var model = cache.models[modelURL] || (cache.models[modelURL] = new SubModel(this[$doc], subModelPath));
                        return model;
                    }
                }, {
                    key: "get",
                    value: function get(key) {
                        switch (this.type) {

                            case 'dict':
                                key = String(key);
                                return this.getSubModel(key);
                                break;

                            case 'list':
                                var index = validIndex(key, this.size);
                                return this.getSubModel(index);
                                break;

                            default:
                                throwInvalidMethod(this.type, 'get');
                        }
                    }
                }, {
                    key: "set",
                    value: function set(key, value) {
                        switch (this.type) {

                            case 'dict':
                                key = String(key);
                                value = validValue(value);
                                this[$doc].setDictItem(this.path, key, value);
                                break;

                            case 'list':
                                var index = validIndex(key, this.size);
                                var item = validValue(value);
                                this[$doc].setListItem(this.path, index, item);
                                break;

                            default:
                                throwInvalidMethod(this.type, 'set');
                        }
                    }
                }, {
                    key: "insert",
                    value: function insert(index) {
                        var _$doc;

                        for (var _len = arguments.length, items = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                            items[_key - 1] = arguments[_key];
                        }

                        switch (this.type) {

                            case 'list':
                                index = validIndex(index, this.size, 1);
                                items = items.map(function (item) {
                                    return validValue(item);
                                });
                                (_$doc = this[$doc]).insertListItems.apply(_$doc, [this.path, index].concat(_toConsumableArray(items)));
                                break;

                            case 'text':
                                index = validIndex(index, this.size, 1);
                                var subString = items.join("");
                                this[$doc].insertText(this.path, index, subString);
                                break;

                            default:
                                throwInvalidMethod(this.type, 'insert');
                        }
                    }
                }, {
                    key: "append",
                    value: function append() {
                        for (var _len2 = arguments.length, items = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
                            items[_key2] = arguments[_key2];
                        }

                        this.insert.apply(this, [this.size].concat(items));
                    }
                }, {
                    key: "remove",
                    value: function remove(key) {
                        var count = arguments.length <= 1 || arguments[1] === undefined ? 1 : arguments[1];

                        switch (this.type) {

                            case 'dict':
                                key = String(key);
                                this[$doc].removeDictItem(this.path, key);
                                break;

                            case 'list':
                                var size = this.size;
                                var index = validIndex(key, size);
                                count = validCount(count, index, size);
                                this[$doc].removeListItems(this.path, index, count);
                                break;

                            case 'text':
                                var size = this.size;
                                var index = validIndex(key, size);
                                count = validCount(count, index, size);
                                this[$doc].removeText(this.path, index, count);
                                break;

                            default:
                                throwInvalidMethod(this.type, 'remove');
                        }
                    }
                }, {
                    key: "subscribe",
                    value: function subscribe(callback) {
                        return this[$doc].subscribe(this.path, callback);
                    }
                }, {
                    key: "path",
                    get: function get() {
                        return this[$path];
                    }
                }, {
                    key: "url",
                    get: function get() {
                        return this[$doc].url + "/" + this.path.join("/");
                    }
                }, {
                    key: "type",
                    get: function get() {
                        return this[$doc].type(this.path);
                    }
                }, {
                    key: "parent",
                    get: function get() {
                        return this.getSubModel("..");
                    }
                }, {
                    key: "value",
                    get: function get() {
                        return this[$doc].clone(this.path);
                    },
                    set: function set(newValue) {
                        var parent = this.parent;
                        if (parent) {
                            this.parent.set(this.path.leaf, newValue);
                        } else {
                            newValue = Object(newValue);
                            for (var key in newValue) {
                                this.set(key, newValue[key]);
                            }
                            var _iteratorNormalCompletion2 = true;
                            var _didIteratorError2 = false;
                            var _iteratorError2 = undefined;

                            try {
                                for (var _iterator2 = _getIterator(this.keys), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                                    var key = _step2.value;

                                    if (newValue[key] === undefined) {
                                        this.remove(key);
                                    }
                                }
                            } catch (err) {
                                _didIteratorError2 = true;
                                _iteratorError2 = err;
                            } finally {
                                try {
                                    if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                                        _iterator2["return"]();
                                    }
                                } finally {
                                    if (_didIteratorError2) {
                                        throw _iteratorError2;
                                    }
                                }
                            }
                        }
                    }
                }, {
                    key: "keys",
                    get: function get() {
                        if (this.type === "dict") {
                            return this[$doc].getDictKeys(this.path);
                        } else {
                            throwInvalidMethod(this.type, 'keys');
                        }
                    }
                }, {
                    key: "size",
                    get: function get() {
                        switch (this.type) {

                            case 'list':
                                return this[$doc].getListSize(this.path);
                                break;

                            case 'text':
                                return this[$doc].getTextSize(this.path);
                                break;

                            default:
                                throwInvalidMethod(this.type, 'size');
                        }
                    }
                }]);

                return SubModel;
            })();

            Model.prototype = SubModel.prototype;

            _export("default", Model);
        }
    };
});

// detect the store type
System.register("src/index.js", ["src/Path.js", "src/stores/AbstractStore.js", "src/stores/MemoryStore.js", "src/stores/SharedbStore.js", "src/Model.js"], function (_export) {
  "use strict";

  var Path, AbstractStore, MemoryStore, SharedbStore, Model;
  return {
    setters: [function (_srcPathJs) {
      Path = _srcPathJs["default"];
    }, function (_srcStoresAbstractStoreJs) {
      AbstractStore = _srcStoresAbstractStoreJs["default"];
    }, function (_srcStoresMemoryStoreJs) {
      MemoryStore = _srcStoresMemoryStoreJs["default"];
    }, function (_srcStoresSharedbStoreJs) {
      SharedbStore = _srcStoresSharedbStoreJs["default"];
    }, function (_srcModelJs) {
      Model = _srcModelJs["default"];
    }],
    execute: function () {
      _export("Path", Path);

      _export("AbstractStore", AbstractStore);

      _export("MemoryStore", MemoryStore);

      _export("SharedbStore", SharedbStore);

      _export("Model", Model);
    }
  };
});
//# sourceMappingURL=olojs.js.map