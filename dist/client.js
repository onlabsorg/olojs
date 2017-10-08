System.registerDynamic('npm:lodash@4.17.4/_getPrototype.js', ['npm:lodash@4.17.4/_overArg.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var overArg = $__require('npm:lodash@4.17.4/_overArg.js');
  var getPrototype = overArg(Object.getPrototypeOf, Object);
  module.exports = getPrototype;
});
System.registerDynamic('npm:lodash@4.17.4/isPlainObject.js', ['npm:lodash@4.17.4/_baseGetTag.js', 'npm:lodash@4.17.4/_getPrototype.js', 'npm:lodash@4.17.4/isObjectLike.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
});
System.registerDynamic('npm:lodash@4.17.4/isBoolean.js', ['npm:lodash@4.17.4/_baseGetTag.js', 'npm:lodash@4.17.4/isObjectLike.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var boolTag = '[object Boolean]';
  function isBoolean(value) {
    return value === true || value === false || isObjectLike(value) && baseGetTag(value) == boolTag;
  }
  module.exports = isBoolean;
});
System.registerDynamic('npm:lodash@4.17.4/isNumber.js', ['npm:lodash@4.17.4/_baseGetTag.js', 'npm:lodash@4.17.4/isObjectLike.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var numberTag = '[object Number]';
  function isNumber(value) {
    return typeof value == 'number' || isObjectLike(value) && baseGetTag(value) == numberTag;
  }
  module.exports = isNumber;
});
System.registerDynamic('npm:lodash@4.17.4/_stackClear.js', ['npm:lodash@4.17.4/_ListCache.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var ListCache = $__require('npm:lodash@4.17.4/_ListCache.js');
  function stackClear() {
    this.__data__ = new ListCache();
    this.size = 0;
  }
  module.exports = stackClear;
});
System.registerDynamic('npm:lodash@4.17.4/_stackDelete.js', [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Removes `key` and its value from the stack.
   *
   * @private
   * @name delete
   * @memberOf Stack
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function stackDelete(key) {
    var data = this.__data__,
        result = data['delete'](key);

    this.size = data.size;
    return result;
  }

  module.exports = stackDelete;
});
System.registerDynamic("npm:lodash@4.17.4/_stackGet.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Gets the stack value for `key`.
   *
   * @private
   * @name get
   * @memberOf Stack
   * @param {string} key The key of the value to get.
   * @returns {*} Returns the entry value.
   */
  function stackGet(key) {
    return this.__data__.get(key);
  }

  module.exports = stackGet;
});
System.registerDynamic("npm:lodash@4.17.4/_stackHas.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Checks if a stack value for `key` exists.
   *
   * @private
   * @name has
   * @memberOf Stack
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function stackHas(key) {
    return this.__data__.has(key);
  }

  module.exports = stackHas;
});
System.registerDynamic('npm:lodash@4.17.4/_stackSet.js', ['npm:lodash@4.17.4/_ListCache.js', 'npm:lodash@4.17.4/_Map.js', 'npm:lodash@4.17.4/_MapCache.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var ListCache = $__require('npm:lodash@4.17.4/_ListCache.js'),
      Map = $__require('npm:lodash@4.17.4/_Map.js'),
      MapCache = $__require('npm:lodash@4.17.4/_MapCache.js');
  var LARGE_ARRAY_SIZE = 200;
  function stackSet(key, value) {
    var data = this.__data__;
    if (data instanceof ListCache) {
      var pairs = data.__data__;
      if (!Map || pairs.length < LARGE_ARRAY_SIZE - 1) {
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
});
System.registerDynamic('npm:lodash@4.17.4/_Stack.js', ['npm:lodash@4.17.4/_ListCache.js', 'npm:lodash@4.17.4/_stackClear.js', 'npm:lodash@4.17.4/_stackDelete.js', 'npm:lodash@4.17.4/_stackGet.js', 'npm:lodash@4.17.4/_stackHas.js', 'npm:lodash@4.17.4/_stackSet.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
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
});
System.registerDynamic('npm:lodash@4.17.4/_Uint8Array.js', ['npm:lodash@4.17.4/_root.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var root = $__require('npm:lodash@4.17.4/_root.js');
  var Uint8Array = root.Uint8Array;
  module.exports = Uint8Array;
});
System.registerDynamic('npm:lodash@4.17.4/_hashClear.js', ['npm:lodash@4.17.4/_nativeCreate.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var nativeCreate = $__require('npm:lodash@4.17.4/_nativeCreate.js');
  function hashClear() {
    this.__data__ = nativeCreate ? nativeCreate(null) : {};
    this.size = 0;
  }
  module.exports = hashClear;
});
System.registerDynamic("npm:lodash@4.17.4/_hashDelete.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Removes `key` and its value from the hash.
   *
   * @private
   * @name delete
   * @memberOf Hash
   * @param {Object} hash The hash to modify.
   * @param {string} key The key of the value to remove.
   * @returns {boolean} Returns `true` if the entry was removed, else `false`.
   */
  function hashDelete(key) {
    var result = this.has(key) && delete this.__data__[key];
    this.size -= result ? 1 : 0;
    return result;
  }

  module.exports = hashDelete;
});
System.registerDynamic('npm:lodash@4.17.4/_hashGet.js', ['npm:lodash@4.17.4/_nativeCreate.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
});
System.registerDynamic('npm:lodash@4.17.4/_hashHas.js', ['npm:lodash@4.17.4/_nativeCreate.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var nativeCreate = $__require('npm:lodash@4.17.4/_nativeCreate.js');
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  function hashHas(key) {
    var data = this.__data__;
    return nativeCreate ? data[key] !== undefined : hasOwnProperty.call(data, key);
  }
  module.exports = hashHas;
});
System.registerDynamic('npm:lodash@4.17.4/_nativeCreate.js', ['npm:lodash@4.17.4/_getNative.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var getNative = $__require('npm:lodash@4.17.4/_getNative.js');
  var nativeCreate = getNative(Object, 'create');
  module.exports = nativeCreate;
});
System.registerDynamic('npm:lodash@4.17.4/_hashSet.js', ['npm:lodash@4.17.4/_nativeCreate.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var nativeCreate = $__require('npm:lodash@4.17.4/_nativeCreate.js');
  var HASH_UNDEFINED = '__lodash_hash_undefined__';
  function hashSet(key, value) {
    var data = this.__data__;
    this.size += this.has(key) ? 0 : 1;
    data[key] = nativeCreate && value === undefined ? HASH_UNDEFINED : value;
    return this;
  }
  module.exports = hashSet;
});
System.registerDynamic('npm:lodash@4.17.4/_Hash.js', ['npm:lodash@4.17.4/_hashClear.js', 'npm:lodash@4.17.4/_hashDelete.js', 'npm:lodash@4.17.4/_hashGet.js', 'npm:lodash@4.17.4/_hashHas.js', 'npm:lodash@4.17.4/_hashSet.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
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
});
System.registerDynamic("npm:lodash@4.17.4/_listCacheClear.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Removes all key-value entries from the list cache.
   *
   * @private
   * @name clear
   * @memberOf ListCache
   */
  function listCacheClear() {
    this.__data__ = [];
    this.size = 0;
  }

  module.exports = listCacheClear;
});
System.registerDynamic('npm:lodash@4.17.4/_listCacheDelete.js', ['npm:lodash@4.17.4/_assocIndexOf.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
});
System.registerDynamic('npm:lodash@4.17.4/_listCacheGet.js', ['npm:lodash@4.17.4/_assocIndexOf.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var assocIndexOf = $__require('npm:lodash@4.17.4/_assocIndexOf.js');
  function listCacheGet(key) {
    var data = this.__data__,
        index = assocIndexOf(data, key);
    return index < 0 ? undefined : data[index][1];
  }
  module.exports = listCacheGet;
});
System.registerDynamic('npm:lodash@4.17.4/_listCacheHas.js', ['npm:lodash@4.17.4/_assocIndexOf.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var assocIndexOf = $__require('npm:lodash@4.17.4/_assocIndexOf.js');
  function listCacheHas(key) {
    return assocIndexOf(this.__data__, key) > -1;
  }
  module.exports = listCacheHas;
});
System.registerDynamic("npm:lodash@4.17.4/eq.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || value !== value && other !== other;
  }

  module.exports = eq;
});
System.registerDynamic('npm:lodash@4.17.4/_assocIndexOf.js', ['npm:lodash@4.17.4/eq.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
});
System.registerDynamic('npm:lodash@4.17.4/_listCacheSet.js', ['npm:lodash@4.17.4/_assocIndexOf.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
});
System.registerDynamic('npm:lodash@4.17.4/_ListCache.js', ['npm:lodash@4.17.4/_listCacheClear.js', 'npm:lodash@4.17.4/_listCacheDelete.js', 'npm:lodash@4.17.4/_listCacheGet.js', 'npm:lodash@4.17.4/_listCacheHas.js', 'npm:lodash@4.17.4/_listCacheSet.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
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
});
System.registerDynamic('npm:lodash@4.17.4/_mapCacheClear.js', ['npm:lodash@4.17.4/_Hash.js', 'npm:lodash@4.17.4/_ListCache.js', 'npm:lodash@4.17.4/_Map.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var Hash = $__require('npm:lodash@4.17.4/_Hash.js'),
      ListCache = $__require('npm:lodash@4.17.4/_ListCache.js'),
      Map = $__require('npm:lodash@4.17.4/_Map.js');
  function mapCacheClear() {
    this.size = 0;
    this.__data__ = {
      'hash': new Hash(),
      'map': new (Map || ListCache)(),
      'string': new Hash()
    };
  }
  module.exports = mapCacheClear;
});
System.registerDynamic('npm:lodash@4.17.4/_mapCacheDelete.js', ['npm:lodash@4.17.4/_getMapData.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var getMapData = $__require('npm:lodash@4.17.4/_getMapData.js');
  function mapCacheDelete(key) {
    var result = getMapData(this, key)['delete'](key);
    this.size -= result ? 1 : 0;
    return result;
  }
  module.exports = mapCacheDelete;
});
System.registerDynamic('npm:lodash@4.17.4/_mapCacheGet.js', ['npm:lodash@4.17.4/_getMapData.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var getMapData = $__require('npm:lodash@4.17.4/_getMapData.js');
  function mapCacheGet(key) {
    return getMapData(this, key).get(key);
  }
  module.exports = mapCacheGet;
});
System.registerDynamic('npm:lodash@4.17.4/_mapCacheHas.js', ['npm:lodash@4.17.4/_getMapData.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var getMapData = $__require('npm:lodash@4.17.4/_getMapData.js');
  function mapCacheHas(key) {
    return getMapData(this, key).has(key);
  }
  module.exports = mapCacheHas;
});
System.registerDynamic('npm:lodash@4.17.4/_isKeyable.js', [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Checks if `value` is suitable for use as unique object key.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
   */
  function isKeyable(value) {
    var type = typeof value;
    return type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean' ? value !== '__proto__' : value === null;
  }

  module.exports = isKeyable;
});
System.registerDynamic('npm:lodash@4.17.4/_getMapData.js', ['npm:lodash@4.17.4/_isKeyable.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var isKeyable = $__require('npm:lodash@4.17.4/_isKeyable.js');
  function getMapData(map, key) {
    var data = map.__data__;
    return isKeyable(key) ? data[typeof key == 'string' ? 'string' : 'hash'] : data.map;
  }
  module.exports = getMapData;
});
System.registerDynamic('npm:lodash@4.17.4/_mapCacheSet.js', ['npm:lodash@4.17.4/_getMapData.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var getMapData = $__require('npm:lodash@4.17.4/_getMapData.js');
  function mapCacheSet(key, value) {
    var data = getMapData(this, key),
        size = data.size;
    data.set(key, value);
    this.size += data.size == size ? 0 : 1;
    return this;
  }
  module.exports = mapCacheSet;
});
System.registerDynamic('npm:lodash@4.17.4/_MapCache.js', ['npm:lodash@4.17.4/_mapCacheClear.js', 'npm:lodash@4.17.4/_mapCacheDelete.js', 'npm:lodash@4.17.4/_mapCacheGet.js', 'npm:lodash@4.17.4/_mapCacheHas.js', 'npm:lodash@4.17.4/_mapCacheSet.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
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
});
System.registerDynamic('npm:lodash@4.17.4/_setCacheAdd.js', [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /** Used to stand-in for `undefined` hash values. */
  var HASH_UNDEFINED = '__lodash_hash_undefined__';

  /**
   * Adds `value` to the array cache.
   *
   * @private
   * @name add
   * @memberOf SetCache
   * @alias push
   * @param {*} value The value to cache.
   * @returns {Object} Returns the cache instance.
   */
  function setCacheAdd(value) {
    this.__data__.set(value, HASH_UNDEFINED);
    return this;
  }

  module.exports = setCacheAdd;
});
System.registerDynamic("npm:lodash@4.17.4/_setCacheHas.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Checks if `value` is in the array cache.
   *
   * @private
   * @name has
   * @memberOf SetCache
   * @param {*} value The value to search for.
   * @returns {number} Returns `true` if `value` is found, else `false`.
   */
  function setCacheHas(value) {
    return this.__data__.has(value);
  }

  module.exports = setCacheHas;
});
System.registerDynamic('npm:lodash@4.17.4/_SetCache.js', ['npm:lodash@4.17.4/_MapCache.js', 'npm:lodash@4.17.4/_setCacheAdd.js', 'npm:lodash@4.17.4/_setCacheHas.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
    var MapCache = $__require('npm:lodash@4.17.4/_MapCache.js'),
        setCacheAdd = $__require('npm:lodash@4.17.4/_setCacheAdd.js'),
        setCacheHas = $__require('npm:lodash@4.17.4/_setCacheHas.js');
    function SetCache(values) {
        var index = -1,
            length = values == null ? 0 : values.length;
        this.__data__ = new MapCache();
        while (++index < length) {
            this.add(values[index]);
        }
    }
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    module.exports = SetCache;
});
System.registerDynamic("npm:lodash@4.17.4/_arraySome.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * A specialized version of `_.some` for arrays without support for iteratee
   * shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {boolean} Returns `true` if any element passes the predicate check,
   *  else `false`.
   */
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
});
System.registerDynamic("npm:lodash@4.17.4/_cacheHas.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Checks if a `cache` value for `key` exists.
   *
   * @private
   * @param {Object} cache The cache to query.
   * @param {string} key The key of the entry to check.
   * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
   */
  function cacheHas(cache, key) {
    return cache.has(key);
  }

  module.exports = cacheHas;
});
System.registerDynamic('npm:lodash@4.17.4/_equalArrays.js', ['npm:lodash@4.17.4/_SetCache.js', 'npm:lodash@4.17.4/_arraySome.js', 'npm:lodash@4.17.4/_cacheHas.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
        seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : undefined;
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
        if (!arraySome(other, function (othValue, othIndex) {
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
});
System.registerDynamic("npm:lodash@4.17.4/_mapToArray.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Converts `map` to its key-value pairs.
   *
   * @private
   * @param {Object} map The map to convert.
   * @returns {Array} Returns the key-value pairs.
   */
  function mapToArray(map) {
    var index = -1,
        result = Array(map.size);

    map.forEach(function (value, key) {
      result[++index] = [key, value];
    });
    return result;
  }

  module.exports = mapToArray;
});
System.registerDynamic("npm:lodash@4.17.4/_setToArray.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Converts `set` to an array of its values.
   *
   * @private
   * @param {Object} set The set to convert.
   * @returns {Array} Returns the values.
   */
  function setToArray(set) {
    var index = -1,
        result = Array(set.size);

    set.forEach(function (value) {
      result[++index] = value;
    });
    return result;
  }

  module.exports = setToArray;
});
System.registerDynamic('npm:lodash@4.17.4/_equalByTag.js', ['npm:lodash@4.17.4/_Symbol.js', 'npm:lodash@4.17.4/_Uint8Array.js', 'npm:lodash@4.17.4/eq.js', 'npm:lodash@4.17.4/_equalArrays.js', 'npm:lodash@4.17.4/_mapToArray.js', 'npm:lodash@4.17.4/_setToArray.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
        if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
          return false;
        }
        object = object.buffer;
        other = other.buffer;
      case arrayBufferTag:
        if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array(object), new Uint8Array(other))) {
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
        return object == other + '';
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
});
System.registerDynamic("npm:lodash@4.17.4/_arrayPush.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Appends the elements of `values` to `array`.
   *
   * @private
   * @param {Array} array The array to modify.
   * @param {Array} values The values to append.
   * @returns {Array} Returns `array`.
   */
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
});
System.registerDynamic('npm:lodash@4.17.4/_baseGetAllKeys.js', ['npm:lodash@4.17.4/_arrayPush.js', 'npm:lodash@4.17.4/isArray.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var arrayPush = $__require('npm:lodash@4.17.4/_arrayPush.js'),
      isArray = $__require('npm:lodash@4.17.4/isArray.js');
  function baseGetAllKeys(object, keysFunc, symbolsFunc) {
    var result = keysFunc(object);
    return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
  }
  module.exports = baseGetAllKeys;
});
System.registerDynamic("npm:lodash@4.17.4/_arrayFilter.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * A specialized version of `_.filter` for arrays without support for
   * iteratee shorthands.
   *
   * @private
   * @param {Array} [array] The array to iterate over.
   * @param {Function} predicate The function invoked per iteration.
   * @returns {Array} Returns the new filtered array.
   */
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
});
System.registerDynamic("npm:lodash@4.17.4/stubArray.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * This method returns a new empty array.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {Array} Returns the new empty array.
   * @example
   *
   * var arrays = _.times(2, _.stubArray);
   *
   * console.log(arrays);
   * // => [[], []]
   *
   * console.log(arrays[0] === arrays[1]);
   * // => false
   */
  function stubArray() {
    return [];
  }

  module.exports = stubArray;
});
System.registerDynamic('npm:lodash@4.17.4/_getSymbols.js', ['npm:lodash@4.17.4/_arrayFilter.js', 'npm:lodash@4.17.4/stubArray.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var arrayFilter = $__require('npm:lodash@4.17.4/_arrayFilter.js'),
      stubArray = $__require('npm:lodash@4.17.4/stubArray.js');
  var objectProto = Object.prototype;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var nativeGetSymbols = Object.getOwnPropertySymbols;
  var getSymbols = !nativeGetSymbols ? stubArray : function (object) {
    if (object == null) {
      return [];
    }
    object = Object(object);
    return arrayFilter(nativeGetSymbols(object), function (symbol) {
      return propertyIsEnumerable.call(object, symbol);
    });
  };
  module.exports = getSymbols;
});
System.registerDynamic("npm:lodash@4.17.4/_baseTimes.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * The base implementation of `_.times` without support for iteratee shorthands
   * or max array length checks.
   *
   * @private
   * @param {number} n The number of times to invoke `iteratee`.
   * @param {Function} iteratee The function invoked per iteration.
   * @returns {Array} Returns the array of results.
   */
  function baseTimes(n, iteratee) {
    var index = -1,
        result = Array(n);

    while (++index < n) {
      result[index] = iteratee(index);
    }
    return result;
  }

  module.exports = baseTimes;
});
System.registerDynamic('npm:lodash@4.17.4/_baseIsArguments.js', ['npm:lodash@4.17.4/_baseGetTag.js', 'npm:lodash@4.17.4/isObjectLike.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var argsTag = '[object Arguments]';
  function baseIsArguments(value) {
    return isObjectLike(value) && baseGetTag(value) == argsTag;
  }
  module.exports = baseIsArguments;
});
System.registerDynamic('npm:lodash@4.17.4/isArguments.js', ['npm:lodash@4.17.4/_baseIsArguments.js', 'npm:lodash@4.17.4/isObjectLike.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var baseIsArguments = $__require('npm:lodash@4.17.4/_baseIsArguments.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var objectProto = Object.prototype;
  var hasOwnProperty = objectProto.hasOwnProperty;
  var propertyIsEnumerable = objectProto.propertyIsEnumerable;
  var isArguments = baseIsArguments(function () {
    return arguments;
  }()) ? baseIsArguments : function (value) {
    return isObjectLike(value) && hasOwnProperty.call(value, 'callee') && !propertyIsEnumerable.call(value, 'callee');
  };
  module.exports = isArguments;
});
System.registerDynamic('npm:lodash@4.17.4/_isIndex.js', [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length && (typeof value == 'number' || reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
  }

  module.exports = isIndex;
});
System.registerDynamic('npm:lodash@4.17.4/_arrayLikeKeys.js', ['npm:lodash@4.17.4/_baseTimes.js', 'npm:lodash@4.17.4/isArguments.js', 'npm:lodash@4.17.4/isArray.js', 'npm:lodash@4.17.4/isBuffer.js', 'npm:lodash@4.17.4/_isIndex.js', 'npm:lodash@4.17.4/isTypedArray.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
      if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && (key == 'length' || isBuff && (key == 'offset' || key == 'parent') || isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset') || isIndex(key, length)))) {
        result.push(key);
      }
    }
    return result;
  }
  module.exports = arrayLikeKeys;
});
System.registerDynamic('npm:lodash@4.17.4/_isPrototype.js', [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Checks if `value` is likely a prototype object.
   *
   * @private
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
   */
  function isPrototype(value) {
    var Ctor = value && value.constructor,
        proto = typeof Ctor == 'function' && Ctor.prototype || objectProto;

    return value === proto;
  }

  module.exports = isPrototype;
});
System.registerDynamic("npm:lodash@4.17.4/_overArg.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Creates a unary function that invokes `func` with its argument transformed.
   *
   * @private
   * @param {Function} func The function to wrap.
   * @param {Function} transform The argument transform.
   * @returns {Function} Returns the new function.
   */
  function overArg(func, transform) {
    return function (arg) {
      return func(transform(arg));
    };
  }

  module.exports = overArg;
});
System.registerDynamic('npm:lodash@4.17.4/_nativeKeys.js', ['npm:lodash@4.17.4/_overArg.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var overArg = $__require('npm:lodash@4.17.4/_overArg.js');
  var nativeKeys = overArg(Object.keys, Object);
  module.exports = nativeKeys;
});
System.registerDynamic('npm:lodash@4.17.4/_baseKeys.js', ['npm:lodash@4.17.4/_isPrototype.js', 'npm:lodash@4.17.4/_nativeKeys.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
});
System.registerDynamic('npm:lodash@4.17.4/isArrayLike.js', ['npm:lodash@4.17.4/isFunction.js', 'npm:lodash@4.17.4/isLength.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var isFunction = $__require('npm:lodash@4.17.4/isFunction.js'),
      isLength = $__require('npm:lodash@4.17.4/isLength.js');
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }
  module.exports = isArrayLike;
});
System.registerDynamic('npm:lodash@4.17.4/keys.js', ['npm:lodash@4.17.4/_arrayLikeKeys.js', 'npm:lodash@4.17.4/_baseKeys.js', 'npm:lodash@4.17.4/isArrayLike.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
    var arrayLikeKeys = $__require('npm:lodash@4.17.4/_arrayLikeKeys.js'),
        baseKeys = $__require('npm:lodash@4.17.4/_baseKeys.js'),
        isArrayLike = $__require('npm:lodash@4.17.4/isArrayLike.js');
    function keys(object) {
        return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    module.exports = keys;
});
System.registerDynamic('npm:lodash@4.17.4/_getAllKeys.js', ['npm:lodash@4.17.4/_baseGetAllKeys.js', 'npm:lodash@4.17.4/_getSymbols.js', 'npm:lodash@4.17.4/keys.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
    var baseGetAllKeys = $__require('npm:lodash@4.17.4/_baseGetAllKeys.js'),
        getSymbols = $__require('npm:lodash@4.17.4/_getSymbols.js'),
        keys = $__require('npm:lodash@4.17.4/keys.js');
    function getAllKeys(object) {
        return baseGetAllKeys(object, keys, getSymbols);
    }
    module.exports = getAllKeys;
});
System.registerDynamic('npm:lodash@4.17.4/_equalObjects.js', ['npm:lodash@4.17.4/_getAllKeys.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
      if (!(compared === undefined ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
        result = false;
        break;
      }
      skipCtor || (skipCtor = key == 'constructor');
    }
    if (result && !skipCtor) {
      var objCtor = object.constructor,
          othCtor = other.constructor;
      if (objCtor != othCtor && 'constructor' in object && 'constructor' in other && !(typeof objCtor == 'function' && objCtor instanceof objCtor && typeof othCtor == 'function' && othCtor instanceof othCtor)) {
        result = false;
      }
    }
    stack['delete'](object);
    stack['delete'](other);
    return result;
  }
  module.exports = equalObjects;
});
System.registerDynamic('npm:lodash@4.17.4/_DataView.js', ['npm:lodash@4.17.4/_getNative.js', 'npm:lodash@4.17.4/_root.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
    var getNative = $__require('npm:lodash@4.17.4/_getNative.js'),
        root = $__require('npm:lodash@4.17.4/_root.js');
    var DataView = getNative(root, 'DataView');
    module.exports = DataView;
});
System.registerDynamic('npm:lodash@4.17.4/_Map.js', ['npm:lodash@4.17.4/_getNative.js', 'npm:lodash@4.17.4/_root.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
    var getNative = $__require('npm:lodash@4.17.4/_getNative.js'),
        root = $__require('npm:lodash@4.17.4/_root.js');
    var Map = getNative(root, 'Map');
    module.exports = Map;
});
System.registerDynamic('npm:lodash@4.17.4/_Promise.js', ['npm:lodash@4.17.4/_getNative.js', 'npm:lodash@4.17.4/_root.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
    var getNative = $__require('npm:lodash@4.17.4/_getNative.js'),
        root = $__require('npm:lodash@4.17.4/_root.js');
    var Promise = getNative(root, 'Promise');
    module.exports = Promise;
});
System.registerDynamic('npm:lodash@4.17.4/_Set.js', ['npm:lodash@4.17.4/_getNative.js', 'npm:lodash@4.17.4/_root.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
    var getNative = $__require('npm:lodash@4.17.4/_getNative.js'),
        root = $__require('npm:lodash@4.17.4/_root.js');
    var Set = getNative(root, 'Set');
    module.exports = Set;
});
System.registerDynamic('npm:lodash@4.17.4/isFunction.js', ['npm:lodash@4.17.4/_baseGetTag.js', 'npm:lodash@4.17.4/isObject.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
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
});
System.registerDynamic('npm:lodash@4.17.4/_coreJsData.js', ['npm:lodash@4.17.4/_root.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var root = $__require('npm:lodash@4.17.4/_root.js');
  var coreJsData = root['__core-js_shared__'];
  module.exports = coreJsData;
});
System.registerDynamic('npm:lodash@4.17.4/_isMasked.js', ['npm:lodash@4.17.4/_coreJsData.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var coreJsData = $__require('npm:lodash@4.17.4/_coreJsData.js');
  var maskSrcKey = function () {
    var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || '');
    return uid ? 'Symbol(src)_1.' + uid : '';
  }();
  function isMasked(func) {
    return !!maskSrcKey && maskSrcKey in func;
  }
  module.exports = isMasked;
});
System.registerDynamic('npm:lodash@4.17.4/_baseIsNative.js', ['npm:lodash@4.17.4/isFunction.js', 'npm:lodash@4.17.4/_isMasked.js', 'npm:lodash@4.17.4/isObject.js', 'npm:lodash@4.17.4/_toSource.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
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
});
System.registerDynamic("npm:lodash@4.17.4/_getValue.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Gets the value at `key` of `object`.
   *
   * @private
   * @param {Object} [object] The object to query.
   * @param {string} key The key of the property to get.
   * @returns {*} Returns the property value.
   */
  function getValue(object, key) {
    return object == null ? undefined : object[key];
  }

  module.exports = getValue;
});
System.registerDynamic('npm:lodash@4.17.4/_getNative.js', ['npm:lodash@4.17.4/_baseIsNative.js', 'npm:lodash@4.17.4/_getValue.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var baseIsNative = $__require('npm:lodash@4.17.4/_baseIsNative.js'),
      getValue = $__require('npm:lodash@4.17.4/_getValue.js');
  function getNative(object, key) {
    var value = getValue(object, key);
    return baseIsNative(value) ? value : undefined;
  }
  module.exports = getNative;
});
System.registerDynamic('npm:lodash@4.17.4/_WeakMap.js', ['npm:lodash@4.17.4/_getNative.js', 'npm:lodash@4.17.4/_root.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
    var getNative = $__require('npm:lodash@4.17.4/_getNative.js'),
        root = $__require('npm:lodash@4.17.4/_root.js');
    var WeakMap = getNative(root, 'WeakMap');
    module.exports = WeakMap;
});
System.registerDynamic('npm:lodash@4.17.4/_toSource.js', [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /** Used for built-in method references. */
  var funcProto = Function.prototype;

  /** Used to resolve the decompiled source of functions. */
  var funcToString = funcProto.toString;

  /**
   * Converts `func` to its source code.
   *
   * @private
   * @param {Function} func The function to convert.
   * @returns {string} Returns the source code.
   */
  function toSource(func) {
    if (func != null) {
      try {
        return funcToString.call(func);
      } catch (e) {}
      try {
        return func + '';
      } catch (e) {}
    }
    return '';
  }

  module.exports = toSource;
});
System.registerDynamic('npm:lodash@4.17.4/_getTag.js', ['npm:lodash@4.17.4/_DataView.js', 'npm:lodash@4.17.4/_Map.js', 'npm:lodash@4.17.4/_Promise.js', 'npm:lodash@4.17.4/_Set.js', 'npm:lodash@4.17.4/_WeakMap.js', 'npm:lodash@4.17.4/_baseGetTag.js', 'npm:lodash@4.17.4/_toSource.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
  if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map && getTag(new Map()) != mapTag || Promise && getTag(Promise.resolve()) != promiseTag || Set && getTag(new Set()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
    getTag = function (value) {
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
});
System.registerDynamic("npm:lodash@4.17.4/stubFalse.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * This method returns `false`.
   *
   * @static
   * @memberOf _
   * @since 4.13.0
   * @category Util
   * @returns {boolean} Returns `false`.
   * @example
   *
   * _.times(2, _.stubFalse);
   * // => [false, false]
   */
  function stubFalse() {
    return false;
  }

  module.exports = stubFalse;
});
System.registerDynamic('npm:lodash@4.17.4/isBuffer.js', ['npm:lodash@4.17.4/_root.js', 'npm:lodash@4.17.4/stubFalse.js', '@empty'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  (function (Buffer) {
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
});
System.registerDynamic('npm:lodash@4.17.4/isLength.js', [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  module.exports = isLength;
});
System.registerDynamic('npm:lodash@4.17.4/_baseIsTypedArray.js', ['npm:lodash@4.17.4/_baseGetTag.js', 'npm:lodash@4.17.4/isLength.js', 'npm:lodash@4.17.4/isObjectLike.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
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
});
System.registerDynamic("npm:lodash@4.17.4/_baseUnary.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * The base implementation of `_.unary` without support for storing metadata.
   *
   * @private
   * @param {Function} func The function to cap arguments for.
   * @returns {Function} Returns the new capped function.
   */
  function baseUnary(func) {
    return function (value) {
      return func(value);
    };
  }

  module.exports = baseUnary;
});
System.registerDynamic('npm:lodash@4.17.4/_nodeUtil.js', ['npm:lodash@4.17.4/_freeGlobal.js', '@empty'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  (function (process) {
    var freeGlobal = $__require('npm:lodash@4.17.4/_freeGlobal.js');
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function () {
      try {
        return freeProcess && freeProcess.binding && freeProcess.binding('util');
      } catch (e) {}
    }();
    module.exports = nodeUtil;
  })($__require('@empty'));
});
System.registerDynamic('npm:lodash@4.17.4/isTypedArray.js', ['npm:lodash@4.17.4/_baseIsTypedArray.js', 'npm:lodash@4.17.4/_baseUnary.js', 'npm:lodash@4.17.4/_nodeUtil.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
    var baseIsTypedArray = $__require('npm:lodash@4.17.4/_baseIsTypedArray.js'),
        baseUnary = $__require('npm:lodash@4.17.4/_baseUnary.js'),
        nodeUtil = $__require('npm:lodash@4.17.4/_nodeUtil.js');
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    module.exports = isTypedArray;
});
System.registerDynamic('npm:lodash@4.17.4/_baseIsEqualDeep.js', ['npm:lodash@4.17.4/_Stack.js', 'npm:lodash@4.17.4/_equalArrays.js', 'npm:lodash@4.17.4/_equalByTag.js', 'npm:lodash@4.17.4/_equalObjects.js', 'npm:lodash@4.17.4/_getTag.js', 'npm:lodash@4.17.4/isArray.js', 'npm:lodash@4.17.4/isBuffer.js', 'npm:lodash@4.17.4/isTypedArray.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
      stack || (stack = new Stack());
      return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
    }
    if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
      var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
          othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');
      if (objIsWrapped || othIsWrapped) {
        var objUnwrapped = objIsWrapped ? object.value() : object,
            othUnwrapped = othIsWrapped ? other.value() : other;
        stack || (stack = new Stack());
        return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
      }
    }
    if (!isSameTag) {
      return false;
    }
    stack || (stack = new Stack());
    return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
  }
  module.exports = baseIsEqualDeep;
});
System.registerDynamic('npm:lodash@4.17.4/_baseIsEqual.js', ['npm:lodash@4.17.4/_baseIsEqualDeep.js', 'npm:lodash@4.17.4/isObjectLike.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var baseIsEqualDeep = $__require('npm:lodash@4.17.4/_baseIsEqualDeep.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  function baseIsEqual(value, other, bitmask, customizer, stack) {
    if (value === other) {
      return true;
    }
    if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
      return value !== value && other !== other;
    }
    return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
  }
  module.exports = baseIsEqual;
});
System.registerDynamic('npm:lodash@4.17.4/isEqual.js', ['npm:lodash@4.17.4/_baseIsEqual.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var baseIsEqual = $__require('npm:lodash@4.17.4/_baseIsEqual.js');
  function isEqual(value, other) {
    return baseIsEqual(value, other);
  }
  module.exports = isEqual;
});
System.registerDynamic("npm:lodash@4.17.4/isArray.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  module.exports = isArray;
});
System.registerDynamic('npm:lodash@4.17.4/isString.js', ['npm:lodash@4.17.4/_baseGetTag.js', 'npm:lodash@4.17.4/isArray.js', 'npm:lodash@4.17.4/isObjectLike.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
    var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
        isArray = $__require('npm:lodash@4.17.4/isArray.js'),
        isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
    var stringTag = '[object String]';
    function isString(value) {
        return typeof value == 'string' || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
    }
    module.exports = isString;
});
System.registerDynamic('npm:lodash@4.17.4/isInteger.js', ['npm:lodash@4.17.4/toInteger.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var toInteger = $__require('npm:lodash@4.17.4/toInteger.js');
  function isInteger(value) {
    return typeof value == 'number' && value == toInteger(value);
  }
  module.exports = isInteger;
});
System.registerDynamic('npm:lodash@4.17.4/isObject.js', [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  module.exports = isObject;
});
System.registerDynamic('npm:lodash@4.17.4/_freeGlobal.js', [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  module.exports = freeGlobal;
});
System.registerDynamic('npm:lodash@4.17.4/_root.js', ['npm:lodash@4.17.4/_freeGlobal.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var freeGlobal = $__require('npm:lodash@4.17.4/_freeGlobal.js');
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;
  var root = freeGlobal || freeSelf || Function('return this')();
  module.exports = root;
});
System.registerDynamic('npm:lodash@4.17.4/_Symbol.js', ['npm:lodash@4.17.4/_root.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var root = $__require('npm:lodash@4.17.4/_root.js');
  var Symbol = root.Symbol;
  module.exports = Symbol;
});
System.registerDynamic('npm:lodash@4.17.4/_getRawTag.js', ['npm:lodash@4.17.4/_Symbol.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
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
});
System.registerDynamic("npm:lodash@4.17.4/_objectToString.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  module.exports = objectToString;
});
System.registerDynamic('npm:lodash@4.17.4/_baseGetTag.js', ['npm:lodash@4.17.4/_Symbol.js', 'npm:lodash@4.17.4/_getRawTag.js', 'npm:lodash@4.17.4/_objectToString.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /* */
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
        return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    module.exports = baseGetTag;
});
System.registerDynamic('npm:lodash@4.17.4/isObjectLike.js', [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  module.exports = isObjectLike;
});
System.registerDynamic('npm:lodash@4.17.4/isSymbol.js', ['npm:lodash@4.17.4/_baseGetTag.js', 'npm:lodash@4.17.4/isObjectLike.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var baseGetTag = $__require('npm:lodash@4.17.4/_baseGetTag.js'),
      isObjectLike = $__require('npm:lodash@4.17.4/isObjectLike.js');
  var symbolTag = '[object Symbol]';
  function isSymbol(value) {
    return typeof value == 'symbol' || isObjectLike(value) && baseGetTag(value) == symbolTag;
  }
  module.exports = isSymbol;
});
System.registerDynamic('npm:lodash@4.17.4/toNumber.js', ['npm:lodash@4.17.4/isObject.js', 'npm:lodash@4.17.4/isSymbol.js', '@empty'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  (function (process) {
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
        value = isObject(other) ? other + '' : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module.exports = toNumber;
  })($__require('@empty'));
});
System.registerDynamic('npm:lodash@4.17.4/toFinite.js', ['npm:lodash@4.17.4/toNumber.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var toNumber = $__require('npm:lodash@4.17.4/toNumber.js');
  var INFINITY = 1 / 0,
      MAX_INTEGER = 1.7976931348623157e+308;
  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
      var sign = value < 0 ? -1 : 1;
      return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }
  module.exports = toFinite;
});
System.registerDynamic('npm:lodash@4.17.4/toInteger.js', ['npm:lodash@4.17.4/toFinite.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  var toFinite = $__require('npm:lodash@4.17.4/toFinite.js');
  function toInteger(value) {
    var result = toFinite(value),
        remainder = result % 1;
    return result === result ? remainder ? result - remainder : result : 0;
  }
  module.exports = toInteger;
});
System.registerDynamic("lib/client/Path.js", ["npm:lodash@4.17.4/isObjectLike.js", "npm:lodash@4.17.4/isArray.js", "npm:lodash@4.17.4/isString.js", "npm:lodash@4.17.4/isInteger.js", "npm:lodash@4.17.4/toInteger.js"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    /**
     *  # olojs.Path module.
     *  - **Version:** 0.1.0
     *  - **Author:** Marcello Del Buono <m.delbuono@gmail.com>
     *  - **License:** MIT
     *  - **Content:**
     *      - [Path](#path-class)
     */

    const isObjectLike = $__require("npm:lodash@4.17.4/isObjectLike.js");
    const isArray = $__require("npm:lodash@4.17.4/isArray.js");
    const isString = $__require("npm:lodash@4.17.4/isString.js");
    const isInteger = $__require("npm:lodash@4.17.4/isInteger.js");
    const toInteger = $__require("npm:lodash@4.17.4/toInteger.js");

    const STRING_SEPARATOR = ".";

    /**
     *  ## Path class
     *  Class representing a filesystem-like path.
     *  It exteds the javascript Array object.
     */
    class Path extends Array {

        /**
         *  ### Constructor
         *  - Create a path from a string literal: `var path = new Path("a.b.c");`
         *  - Create a path from an array: `var path = new Path(['a', 'b', 'c']);`
         *  - Create a path from a combination of the two: `var path = new Path(['a', 'b.c.d', 'e.f']);`
         *  - Create a path from a serie of subpaths: `var path = new Path('a.b.c', ['d','e.f'], 'g');`
         */
        constructor(...paths) {
            super();

            for (let path of paths) {

                // Transform each subPath in an array of keys ...
                // ... case array
                if (Array.isArray(path) || path instanceof Path) {
                    path = new Path(...path);
                }
                // ... case string
                else if (path !== "" && path !== undefined && path !== null) {
                        path = String(path).split(STRING_SEPARATOR);
                    }
                    // ... not a string nor an array
                    else {
                            path = [];
                        }

                // Append each key of the subPath to this path
                for (let item of path) {
                    if (item !== "") {
                        this.push(item);
                    }
                }
            }
        }

        /**
         *  ### Path.prototype.slice(begin, end)
         *  Behaves like `Array.prototype.slice`, with the only difference that it returns a `Path` object
         */
        slice(begin, end) {
            return new Path(Array.from(this).slice(begin, end));
        }

        /**
         *  ### Path.prototype.leaf - getter
         *  Returns the last item of the path.
         *  Example: `(new Path('a/b/c')).leaf` returns `"c"`
         */
        get leaf() {
            return this[this.length - 1];
        }

        /**
         *  ### Path.prototype.parent - getter
         *  Returns the parent path of this path.
         *  Example: `(new Path('a.b.c')).parent` returns `new Path('a.b')`
         */
        get parent() {
            return this.slice(0, -1);
        }

        /**
         *  ### Path.prototype.equals(other)
         *  Compares this path with the other path and returns true if they are equal.
         *  `other` can be a Path object, a path string, a path array or any combination of them.
         *
         *  Example:
         *  ```javascript
         *  var path = new Path("a.b.c.d.e.f");
         *  path.equals("a.b.c.d.e.f")                          // true
         *  path.equals([`a.b`, ['c','d'], new Path('e.f'))     // true
         *  path.equals("x.y.z")                                // false
         *  ```
         */
        equals(other) {
            other = new Path(other);
            return String(this) === String(other);
        }

        /**
         *  ### Path.prototype.isSubPathOf(path)
         *  Returns true if this path is a sub-path of another path (e.g. a.b.c is a subpath of a.b).
         *  `path` can be a Path object, a path string, a path array or any combination of them.
         */
        isSubPathOf(path) {
            path = Path.from(path);
            return this.slice(0, path.length).equals(path);
        }

        /**
         *  ### Path.prototype.subPath(...subPathItems)
         *  Generates a sub-path of this path, allowing the following special items:
         *  - `^` represents the parent item
         *  - `^^` represents the root item
         *
         *  Example:
         *  ```javascript
         *  var path = new Path(`a.b.c`);
         *  path.subPath(`d.e`)             // -> new Path('a.b.c.d.e')
         *  path.subPaht('^.x')             // -> new Path('a.b.x')
         *  path.subPaht('^.^')             // -> new Path('a')
         *  path.subPaht('^.^.^.^')         // -> null
         *  ```
         subPath (...subPathItems) {
            subPathItems = new Path(subPathItems);
            var subPath = Array.from(this);
            for (let subPathItem of subPathItems) {
                if (subPathItem === ".") {
                    // subPath stays the same
                } else if (subPathItem == "..") {
                    let lastItem = subPath.pop();
                    if (lastItem === undefined) return null;
                } else {
                    subPath.push(subPathItem);
                }
            }
            return new Path(subPath);
        }
        */

        /**
         *  ### Path.prototype.lookup(obj)
         *  Searches the given object for the deep item matching this path.
         *
         *  Example:
         *  ```javascript
         *  var path = new Path("a.b.c");
         *  path.lookup({a:{b:{c:10}}})     // -> 10
         *  path.lookup({a:{b:{c:{d:20}}}}) // -> {d:20}
         *  path.lookup({x:1})              // -> null
         *  ```
         */
        lookup(obj) {
            var value = obj;
            for (let key of this) {

                if (isArray(value) || isString(value)) {
                    if (!isInteger(Number(key))) return null;
                    let index = toInteger(key);
                    value = value[index];
                } else if (isObjectLike(value) && value.hasOwnProperty(key)) {
                    value = value[key];
                } else {
                    return null;
                }
            }

            return value === undefined ? null : value;
        }

        /**
         *  ### Path.prototype.toString()
         *  Retruns the string represtnatation of the path as a slash-separated sequence of items.
         *  Example: `String(Path('a','b','c'))` returns `"a.b.c"`
         */
        toString() {
            return this.join(STRING_SEPARATOR);
        }

        /**
         *  ### Path.from(path)
         *  Converts a path or path literal to an object.
         *  The difference with the Path constructor is that this function will not
         *  create a new object if path is already a Path object.
         */
        static from(path) {
            return path instanceof Path ? path : new Path(path);
        }
    }

    module.exports = Path;
});
System.registerDynamic('lib/client/Change.js', ['lib/client/Path.js'], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;

    const Path = $__require('lib/client/Path.js');

    class Change {

        constructor(key, op) {
            this.key = key;
            this.op = op;
        }

        get path() {
            var change = this;
            var changePath = new Path();
            while (change.op instanceof Change) {
                changePath = new Path(changePath, change.key);
                change = change.op;
            }
            changePath = new Path(changePath, change.key);
            return changePath;
        }

        get type() {
            return this.op.type;
        }

        get del() {
            return this.op.del;
        }

        get ins() {
            return this.op.ins;
        }

        getSubChange(path) {
            path = Path.from(path);
            var thisPath = this.path;

            if (thisPath.equals(path)) {
                return new Change('', { del: this.del, ins: this.ins });
            }

            if (thisPath.isSubPathOf(path)) {
                var subChange = this;
                for (let key of path) {
                    subChange = subChange.op;
                }
                return subChange;
            }

            if (path.isSubPathOf(thisPath)) {
                const subChangePath = path.slice(thisPath.length);
                var op = { del: this.del, ins: this.ins };
                for (let key of subChangePath) {
                    try {
                        op.del = op.del[key];
                        op.ins = op.ins[key];
                    } catch (error) {
                        return null;
                    }
                }
                return op.del === op.ins ? null : new Change('', op);
            }

            return null;
        }
    }

    module.exports = Change;
});
System.registerDynamic("lib/client/types.js", ["npm:lodash@4.17.4/isPlainObject.js", "npm:lodash@4.17.4/isArray.js", "npm:lodash@4.17.4/isString.js", "npm:lodash@4.17.4/isBoolean.js", "npm:lodash@4.17.4/isNumber.js", "npm:lodash@4.17.4/isInteger.js", "npm:lodash@4.17.4/isEqual.js", "lib/client/Path.js", "lib/client/Change.js", "lib/client/exceptions.js"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;

    const isPlainObject = $__require("npm:lodash@4.17.4/isPlainObject.js");
    const isArray = $__require("npm:lodash@4.17.4/isArray.js");
    const isString = $__require("npm:lodash@4.17.4/isString.js");
    const isBoolean = $__require("npm:lodash@4.17.4/isBoolean.js");
    const isNumber = $__require("npm:lodash@4.17.4/isNumber.js");
    const isInteger = $__require("npm:lodash@4.17.4/isInteger.js");
    const isEqual = $__require("npm:lodash@4.17.4/isEqual.js");

    const Path = $__require("lib/client/Path.js");
    const Change = $__require("lib/client/Change.js");
    const exceptions = $__require("lib/client/exceptions.js");

    class Observable {

        constructor() {
            this._parents = new Set();
            this.beforeChangeCallbacks = new Set();
            this.afterChangeCallbacks = new Set();
        }

        _getData() {
            return this._data;
        }

        *parents() {
            for (let parent of this._parents) yield [parent.obj, parent.key];
        }

        getSnapshot() {
            return null;
        }

        _addParent(observable, key) {
            for (let [p, k] of this.parents()) {
                if (p === observable && k === key) return;
            }
            this._parents.add({ obj: observable, key: key });
        }

        _removeParent(observable, key) {
            for (let parent of this._parents) {
                if (parent.obj === observable && parent.key === key) {
                    this._parents.delete(parent);
                    return;
                }
            }
        }

        _dispatch(callbackSetName, change) {
            const callbacks = this[callbackSetName];

            for (let callback of callbacks) {
                if (typeof callback === "function") callback(change);
            }

            for (let parent of this._parents) {
                let parentChange = createChange(parent.key, change);
                parent.obj._dispatch(callbackSetName, parentChange);
            }
        }

        _hasAnchestor(observable) {
            if (this === observable) return true;
            for (let parent of this._parents) {
                if (parent.obj._hasAnchestor(observable)) return true;
            }
            return false;
        }
    }

    class ObservableContainer extends Observable {

        _validateValue(value) {
            if (isNumber(value) || isBoolean(value) || isString(value) || value === null) return value;

            if (isPlainObject(value)) value = new ObservableDict(value);else if (isArray(value)) value = new ObservableList(...value);

            if (value instanceof Observable) {
                if (this._hasAnchestor(value)) throw new exceptions.CyclicReferenceError("Cyclic references are not allowed.");
                return value;
            }

            throw new TypeError("Observable items must be observables, plain objects, arrays, strings, numbers or booleans.");
        }

        *find(test) {
            for (let value of this.values()) {
                if (test(value)) yield value;else if (value instanceof ObservableContainer) {
                    for (let match of value.find(test)) yield match;
                }
            }
        }
    }

    class ObservableDict extends ObservableContainer {

        constructor(dict = {}) {
            super();
            var data = {};
            for (let key in dict) {
                data[key] = this._validateValue(dict[key]);
            }
            for (let key in data) {
                let value = data[key];
                if (value instanceof Observable) value._addParent(this, key);
            }
            this._data = data;
        }

        get size() {
            return Object.keys(this._getData()).length;
        }

        has(key) {
            return key in this._getData();
        }

        *keys() {
            for (let key in this._getData()) yield key;
        }

        *values() {
            for (let key of this.keys()) yield this.get(key);
        }

        get(key) {
            return this._getData()[key];
        }

        set(key, value) {

            var newValue = this._validateValue(value);
            var oldValue = this.get(key);
            if (newValue === oldValue) return null;

            var change = createChange(key, { type: 'dict', del: oldValue, ins: newValue });
            this._dispatch('beforeChangeCallbacks', change);

            if (newValue instanceof Observable) newValue._addParent(this, key);
            if (oldValue instanceof Observable) oldValue._removeParent(this, key);
            this._getData()[key] = newValue;

            this._dispatch('afterChangeCallbacks', change);

            return change;
        }

        delete(key) {

            var oldValue = this.get(key);
            if (oldValue === undefined) return null;

            var change = createChange(key, { type: 'dict', del: oldValue, ins: undefined });
            this._dispatch('beforeChangeCallbacks', change);

            if (oldValue instanceof Observable) oldValue._removeParent(this, key);
            delete this._getData()[key];

            this._dispatch('afterChangeCallbacks', change);

            return change;
        }

        assign(dict) {
            if (isPlainObject(dict)) dict = new ObservableDict(dict);
            if (!(dict instanceof ObservableDict)) throw new TypeError('ObservableDict update argument must be a dictionary');

            const changes = [];

            for (let key of this.keys()) {
                if (!dict.has(key)) {
                    let change = this.delete(key);
                    if (change !== null) changes.push(change);
                }
            }

            for (let [key, newValue] of dict) {
                let oldValue = this.get(key);
                if (oldValue instanceof ObservableDict && newValue instanceof ObservableDict || oldValue instanceof ObservableList && newValue instanceof ObservableList) {

                    let deepChanges = oldValue.assign(newValue);
                    for (let change of deepChanges) changes.push(new Change(key, change));
                } else {
                    let change = this.set(key, newValue);
                    if (change !== null) changes.push(change);
                }
            }

            return changes;
        }

        apply(change) {
            if (!(change instanceof Change)) throw new exceptions.ValueError('Invalid change argument.');

            const currentValue = this.get(change.key);

            if (change.op instanceof Change) {
                if (currentValue instanceof ObservableContainer) {
                    let appliedChange = currentValue.apply(change.op);
                    return appliedChange === null ? null : new Change(change.key, appliedChange);
                }
                throw new exceptions.ValueError('Invalid change argument.');
            }

            if (change.type !== 'dict') {
                throw new exceptions.ValueError('Invalid change argument.');
            }

            if (currentValue instanceof ObservableContainer) currentValue = currentValue.getSnapshot();
            if (!isEqual(change.op.del, currentValue)) {
                throw new exceptions.ValueError('Invalid change argument.');
            }

            if (change.op.del !== undefined && change.op.ins === undefined) {
                return this.delete(change.key);
            } else {
                return this.set(change.key, change.op.ins);
            }
        }

        getSnapshot() {
            const plainObject = {};
            for (let [key, value] of this) {
                if (value instanceof ObservableContainer) value = value.getSnapshot();
                plainObject[key] = value;
            }
            return plainObject;
        }

        *[Symbol.iterator]() {
            for (let key of this.keys()) {
                let value = this.get(key);
                yield [key, value];
            }
        }
    }

    class ObservableList extends ObservableContainer {

        constructor(...list) {
            super();
            var data = [];
            for (let item of list) {
                data.push(this._validateValue(item));
            }
            for (let i = 0; i < data.length; i++) {
                let item = data[i];
                if (item instanceof Observable) item._addParent(this, i);
            }
            this._data = data;
        }

        get size() {
            return this._getData().length;
        }

        indexOf(item) {
            return this._getData().indexOf(item);
        }

        has(item) {
            return this.indexOf(item) !== -1;
        }

        *values() {
            for (let item of this._getData()) yield item;
        }

        get(index) {
            try {
                index = this._validateIndex(index);
                return this._getData()[index];
            } catch (e) {
                return undefined;
            }
        }

        slice(begin, end) {
            return this._getData().slice(begin, end);
        }

        set(index, value) {
            index = this._validateIndex(index);

            var newValue = this._validateValue(value);
            var oldValue = this.get(index);
            if (newValue === oldValue) return null;

            var change = createChange(index, { type: 'list', del: oldValue, ins: newValue });
            this._dispatch('beforeChangeCallbacks', change);

            if (newValue instanceof Observable) newValue._addParent(this, index);
            if (oldValue instanceof Observable) oldValue._removeParent(this, index);
            this._getData()[index] = newValue;

            this._dispatch('afterChangeCallbacks', change);

            return change;
        }

        insert(index, item) {
            index = this._validateIndex(index, 1);
            item = this._validateValue(item);

            var change = createChange(index, { type: 'list', del: undefined, ins: item });
            this._dispatch('beforeChangeCallbacks', change);

            for (let i = index; i < this.size; i++) {
                let child = this.get(i);
                if (child instanceof Observable) {
                    for (let parent of child._parents) {
                        if (parent.obj === this) parent.key = i + 1;
                    }
                }
            }
            if (item instanceof Observable) item._addParent(this, index);

            this._getData().splice(index, 0, item);

            this._dispatch('afterChangeCallbacks', change);

            return change;
        }

        append(item) {
            return this.insert(this.size, item);
        }

        delete(index) {
            index = this._validateIndex(index);

            var oldItem = this.get(index);

            var change = createChange(index, { type: 'list', del: oldItem, ins: undefined });
            this._dispatch('beforeChangeCallbacks', change);

            for (let i = index + 1; i < this.size; i++) {
                let child = this.get(i);
                if (child instanceof Observable) {
                    for (let parent of child._parents) {
                        if (parent.obj === this) parent.key = i - 1;
                    }
                }
            }
            if (oldItem instanceof Observable) oldItem._removeParent(this, index);

            this._getData().splice(index, 1);

            this._dispatch('afterChangeCallbacks', change);

            return change;
        }

        assign(list) {
            if (isArray(list)) list = new ObservableList(...list);
            if (!(list instanceof ObservableList)) throw new TypeError('ObservableList assign argument must be a list.');

            const changes = [];

            while (this.size > list.size) {
                let change = this.delete(this.size - 1);
                changes.push(change);
            }

            while (this.size < list.size) {
                let change = this.append(list.get(this.size));
                changes.push(change);
            }

            for (let i = 0; i < list.size; i++) {
                let newItem = list.get(i);
                let oldItem = this.get(i);
                if (oldItem instanceof ObservableDict && newItem instanceof ObservableDict || oldItem instanceof ObservableList && newItem instanceof ObservableList) {

                    let deepChanges = oldItem.assign(newItem);
                    for (let change of deepChanges) changes.push(new Change(i, change));
                } else {
                    let change = this.set(i, newItem);
                    if (change !== null) changes.push(change);
                }
            }

            return changes;
        }

        apply(change) {
            if (!(change instanceof Change)) throw new exceptions.ValueError('Invalid change argument.');

            const currentValue = this.get(change.key);

            if (change.op instanceof Change) {
                if (currentValue instanceof ObservableContainer) {
                    let appliedChange = currentValue.apply(change.op);
                    return appliedChange === null ? null : new Change(change.key, appliedChange);
                }
                throw new exceptions.ValueError('Invalid change argument.');
            }

            if (change.type !== 'list') {
                throw new exceptions.ValueError('Invalid change argument.');
            }

            if (currentValue instanceof ObservableContainer) currentValue = currentValue.getSnapshot();
            if (change.op.del !== undefined && !isEqual(change.op.del, currentValue)) {
                throw new exceptions.ValueError('Invalid change argument.');
            }

            if (change.op.del === undefined && change.op.ins !== undefined) {
                return this.insert(change.key, change.op.ins);
            }

            if (change.op.del !== undefined && change.op.ins === undefined) {
                return this.delete(change.key);
            }

            if (change.op.del !== undefined && change.op.ins !== undefined) {
                return this.set(change.key, change.op.ins);
            }
        }

        getSnapshot() {
            const array = [];
            for (let item of this) {
                if (item instanceof ObservableContainer) item = item.getSnapshot();
                array.push(item);
            }
            return array;
        }

        *[Symbol.iterator]() {
            for (let item of this.values()) yield item;
        }

        _validateIndex(index, overflow = 0) {
            const size = this.size;
            index = Number(index);
            if (!isInteger(index)) throw new TypeError("Index must be an integer.");
            if (index < 0) index = size + index;
            if (0 <= index && index < size + overflow) return index;
            throw new RangeError("Index out of range");
        }
    }

    function createChange(key, op) {
        if (!(op instanceof Change)) {
            if (op.del instanceof ObservableContainer) op.del = op.del.getSnapshot();
            if (op.ins instanceof ObservableContainer) op.ins = op.ins.getSnapshot();
        }
        return new Change(key, op);
    }

    exports.Observable = Observable;
    exports.ObservableContainer = ObservableContainer;
    exports.ObservableDict = ObservableDict;
    exports.ObservableList = ObservableList;
});
System.registerDynamic("lib/client/exceptions.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;

  exports.CyclicReferenceError = class extends Error {};

  exports.WritePermissionError = class extends Error {};

  exports.ValueError = class extends Error {};
});
System.registerDynamic('npm:process@0.11.10/browser.js', [], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // shim for using process in browser
    var process = module.exports = {};

    // cached from whatever global is present so that test runners that stub it
    // don't break things.  But we need to wrap it in a try catch in case it is
    // wrapped in strict mode code which doesn't define any globals.  It's inside a
    // function because try/catches deoptimize in certain engines.

    var cachedSetTimeout;
    var cachedClearTimeout;

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout() {
        throw new Error('clearTimeout has not been defined');
    }
    (function () {
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
    })();
    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch (e) {
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch (e) {
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }
    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e) {
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e) {
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
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

    process.nextTick = function (fun) {
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

    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    process.title = 'browser';
    process.browser = true;
    process.env = {};
    process.argv = [];
    process.version = ''; // empty string to avoid regexp issues
    process.versions = {};

    function noop() {}

    process.on = noop;
    process.addListener = noop;
    process.once = noop;
    process.off = noop;
    process.removeListener = noop;
    process.removeAllListeners = noop;
    process.emit = noop;
    process.prependListener = noop;
    process.prependOnceListener = noop;

    process.listeners = function (name) {
        return [];
    };

    process.binding = function (name) {
        throw new Error('process.binding is not supported');
    };

    process.cwd = function () {
        return '/';
    };
    process.chdir = function (dir) {
        throw new Error('process.chdir is not supported');
    };
    process.umask = function () {
        return 0;
    };
});
System.registerDynamic("npm:process@0.11.10.js", ["npm:process@0.11.10/browser.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = $__require("npm:process@0.11.10/browser.js");
});
System.registerDynamic('github:jspm/nodelibs-process@0.1.2/index.js', ['npm:process@0.11.10.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = System._nodeRequire ? process : $__require('npm:process@0.11.10.js');
});
System.registerDynamic("github:jspm/nodelibs-process@0.1.2.js", ["github:jspm/nodelibs-process@0.1.2/index.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = $__require("github:jspm/nodelibs-process@0.1.2/index.js");
});
System.registerDynamic('npm:punycode@1.3.2/punycode.js', ['github:jspm/nodelibs-process@0.1.2.js'], true, function ($__require, exports, module) {
  /* */
  "format cjs";

  var global = this || self,
      GLOBAL = global;
  (function (process) {
    ;
    (function (root) {
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
        return map(array, function (value) {
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
        for (index = basic > 0 ? basic + 1 : 0; index < inputLength;) {
          for (oldi = i, w = 1, k = base;; k += base) {
            if (index >= inputLength) {
              error('invalid-input');
            }
            digit = basicToDigit(input.charCodeAt(index++));
            if (digit >= base || digit > floor((maxInt - i) / w)) {
              error('overflow');
            }
            i += digit * w;
            t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
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
              for (q = delta, k = base;; k += base) {
                t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
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
        return mapDomain(input, function (string) {
          return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
        });
      }
      function toASCII(input) {
        return mapDomain(input, function (string) {
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
      if (typeof undefined == 'function' && typeof define.amd == 'object' && define.amd) {
        define('punycode', function () {
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
    })(this);
  })($__require('github:jspm/nodelibs-process@0.1.2.js'));
});
System.registerDynamic("npm:punycode@1.3.2.js", ["npm:punycode@1.3.2/punycode.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = $__require("npm:punycode@1.3.2/punycode.js");
});
System.registerDynamic('npm:querystring@0.2.0/decode.js', [], true, function ($__require, exports, module) {
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  'use strict';

  // If obj.hasOwnProperty has been overridden, then calling
  // obj.hasOwnProperty(prop) will break.
  // See: https://github.com/joyent/node/issues/1707

  var global = this || self,
      GLOBAL = global;
  function hasOwnProperty(obj, prop) {
    return Object.prototype.hasOwnProperty.call(obj, prop);
  }

  module.exports = function (qs, sep, eq, options) {
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
    // maxKeys <= 0 means that we should not limit keys count
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
});
System.registerDynamic('npm:querystring@0.2.0/encode.js', [], true, function ($__require, exports, module) {
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

  'use strict';

  var global = this || self,
      GLOBAL = global;
  var stringifyPrimitive = function (v) {
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

  module.exports = function (obj, sep, eq, name) {
    sep = sep || '&';
    eq = eq || '=';
    if (obj === null) {
      obj = undefined;
    }

    if (typeof obj === 'object') {
      return Object.keys(obj).map(function (k) {
        var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
        if (Array.isArray(obj[k])) {
          return obj[k].map(function (v) {
            return ks + encodeURIComponent(stringifyPrimitive(v));
          }).join(sep);
        } else {
          return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
        }
      }).join(sep);
    }

    if (!name) return '';
    return encodeURIComponent(stringifyPrimitive(name)) + eq + encodeURIComponent(stringifyPrimitive(obj));
  };
});
System.registerDynamic('npm:querystring@0.2.0/index.js', ['npm:querystring@0.2.0/decode.js', 'npm:querystring@0.2.0/encode.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  exports.decode = exports.parse = $__require('npm:querystring@0.2.0/decode.js');
  exports.encode = exports.stringify = $__require('npm:querystring@0.2.0/encode.js');
});
System.registerDynamic("npm:querystring@0.2.0.js", ["npm:querystring@0.2.0/index.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = $__require("npm:querystring@0.2.0/index.js");
});
System.registerDynamic('npm:url@0.10.3/url.js', ['npm:punycode@1.3.2.js', 'npm:querystring@0.2.0.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  // Copyright Joyent, Inc. and other Node contributors.
  //
  // Permission is hereby granted, free of charge, to any person obtaining a
  // copy of this software and associated documentation files (the
  // "Software"), to deal in the Software without restriction, including
  // without limitation the rights to use, copy, modify, merge, publish,
  // distribute, sublicense, and/or sell copies of the Software, and to permit
  // persons to whom the Software is furnished to do so, subject to the
  // following conditions:
  //
  // The above copyright notice and this permission notice shall be included
  // in all copies or substantial portions of the Software.
  //
  // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
  // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
  // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
  // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
  // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
  // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
  // USE OR OTHER DEALINGS IN THE SOFTWARE.

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

  // Reference: RFC 3986, RFC 1808, RFC 2396

  // define these here so at least they only have to be
  // compiled once on the first module load.
  var protocolPattern = /^([a-z0-9.+-]+:)/i,
      portPattern = /:[0-9]*$/,


  // RFC 2396: characters reserved for delimiting URLs.
  // We actually just auto-escape these.
  delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],


  // RFC 2396: characters not allowed for various reasons.
  unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),


  // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
  autoEscape = ['\''].concat(unwise),

  // Characters that are never ever allowed in a hostname.
  // Note that any invalid chars are also handled, but these
  // are the ones that are *expected* to be seen, so we fast-path
  // them.
  nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
      hostEndingChars = ['/', '?', '#'],
      hostnameMaxLen = 255,
      hostnamePartPattern = /^[a-z0-9A-Z_-]{0,63}$/,
      hostnamePartStart = /^([a-z0-9A-Z_-]{0,63})(.*)$/,

  // protocols that can allow "unsafe" and "unwise" chars.
  unsafeProtocol = {
    'javascript': true,
    'javascript:': true
  },

  // protocols that never have a hostname.
  hostlessProtocol = {
    'javascript': true,
    'javascript:': true
  },

  // protocols that always contain a // bit.
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
    if (url && isObject(url) && url instanceof Url) return url;

    var u = new Url();
    u.parse(url, parseQueryString, slashesDenoteHost);
    return u;
  }

  Url.prototype.parse = function (url, parseQueryString, slashesDenoteHost) {
    if (!isString(url)) {
      throw new TypeError("Parameter 'url' must be a string, not " + typeof url);
    }

    var rest = url;

    // trim before proceeding.
    // This is to support parse stuff like "  http://foo.com  \n"
    rest = rest.trim();

    var proto = protocolPattern.exec(rest);
    if (proto) {
      proto = proto[0];
      var lowerProto = proto.toLowerCase();
      this.protocol = lowerProto;
      rest = rest.substr(proto.length);
    }

    // figure out if it's got a host
    // user@server is *always* interpreted as a hostname, and url
    // resolution will treat //foo/bar as host=foo,path=bar because that's
    // how the browser resolves relative URLs.
    if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
      var slashes = rest.substr(0, 2) === '//';
      if (slashes && !(proto && hostlessProtocol[proto])) {
        rest = rest.substr(2);
        this.slashes = true;
      }
    }

    if (!hostlessProtocol[proto] && (slashes || proto && !slashedProtocol[proto])) {

      // there's a hostname.
      // the first instance of /, ?, ;, or # ends the host.
      //
      // If there is an @ in the hostname, then non-host chars *are* allowed
      // to the left of the last @ sign, unless some host-ending character
      // comes *before* the @-sign.
      // URLs are obnoxious.
      //
      // ex:
      // http://a@b@c/ => user:a@b host:c
      // http://a@b?@c => user:a host:c path:/?@c

      // v0.12 TODO(isaacs): This is not quite how Chrome does things.
      // Review our test case against browsers more comprehensively.

      // find the first instance of any hostEndingChars
      var hostEnd = -1;
      for (var i = 0; i < hostEndingChars.length; i++) {
        var hec = rest.indexOf(hostEndingChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
      }

      // at this point, either we have an explicit point where the
      // auth portion cannot go past, or the last @ char is the decider.
      var auth, atSign;
      if (hostEnd === -1) {
        // atSign can be anywhere.
        atSign = rest.lastIndexOf('@');
      } else {
        // atSign must be in auth portion.
        // http://a@b/c@d => host:b auth:a path:/c@d
        atSign = rest.lastIndexOf('@', hostEnd);
      }

      // Now we have a portion which is definitely the auth.
      // Pull that off.
      if (atSign !== -1) {
        auth = rest.slice(0, atSign);
        rest = rest.slice(atSign + 1);
        this.auth = decodeURIComponent(auth);
      }

      // the host is the remaining to the left of the first non-host char
      hostEnd = -1;
      for (var i = 0; i < nonHostChars.length; i++) {
        var hec = rest.indexOf(nonHostChars[i]);
        if (hec !== -1 && (hostEnd === -1 || hec < hostEnd)) hostEnd = hec;
      }
      // if we still have not hit it, then the entire thing is a host.
      if (hostEnd === -1) hostEnd = rest.length;

      this.host = rest.slice(0, hostEnd);
      rest = rest.slice(hostEnd);

      // pull out port.
      this.parseHost();

      // we've indicated that there is a hostname,
      // so even if it's empty, it has to be present.
      this.hostname = this.hostname || '';

      // if hostname begins with [ and ends with ]
      // assume that it's an IPv6 address.
      var ipv6Hostname = this.hostname[0] === '[' && this.hostname[this.hostname.length - 1] === ']';

      // validate a little.
      if (!ipv6Hostname) {
        var hostparts = this.hostname.split(/\./);
        for (var i = 0, l = hostparts.length; i < l; i++) {
          var part = hostparts[i];
          if (!part) continue;
          if (!part.match(hostnamePartPattern)) {
            var newpart = '';
            for (var j = 0, k = part.length; j < k; j++) {
              if (part.charCodeAt(j) > 127) {
                // we replace non-ASCII char with a temporary placeholder
                // we need this to make sure size of hostname is not
                // broken by replacing non-ASCII by nothing
                newpart += 'x';
              } else {
                newpart += part[j];
              }
            }
            // we test again with ASCII char only
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
        // hostnames are always lower case.
        this.hostname = this.hostname.toLowerCase();
      }

      if (!ipv6Hostname) {
        // IDNA Support: Returns a puny coded representation of "domain".
        // It only converts the part of the domain name that
        // has non ASCII characters. I.e. it dosent matter if
        // you call it with a domain that already is in ASCII.
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

      // strip [ and ] from the hostname
      // the host field still retains them, though
      if (ipv6Hostname) {
        this.hostname = this.hostname.substr(1, this.hostname.length - 2);
        if (rest[0] !== '/') {
          rest = '/' + rest;
        }
      }
    }

    // now rest is set to the post-host stuff.
    // chop off any delim chars.
    if (!unsafeProtocol[lowerProto]) {

      // First, make 100% sure that any "autoEscape" chars get
      // escaped, even if encodeURIComponent doesn't think they
      // need to be.
      for (var i = 0, l = autoEscape.length; i < l; i++) {
        var ae = autoEscape[i];
        var esc = encodeURIComponent(ae);
        if (esc === ae) {
          esc = escape(ae);
        }
        rest = rest.split(ae).join(esc);
      }
    }

    // chop off from the tail first.
    var hash = rest.indexOf('#');
    if (hash !== -1) {
      // got a fragment string.
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
      // no query string, but parseQueryString still requested
      this.search = '';
      this.query = {};
    }
    if (rest) this.pathname = rest;
    if (slashedProtocol[lowerProto] && this.hostname && !this.pathname) {
      this.pathname = '/';
    }

    //to support http.request
    if (this.pathname || this.search) {
      var p = this.pathname || '';
      var s = this.search || '';
      this.path = p + s;
    }

    // finally, reconstruct the href based on what has been validated.
    this.href = this.format();
    return this;
  };

  // format a parsed object into a url string
  function urlFormat(obj) {
    // ensure it's an object, and not a string url.
    // If it's an obj, this is a no-op.
    // this way, you can call url_format() on strings
    // to clean up potentially wonky urls.
    if (isString(obj)) obj = urlParse(obj);
    if (!(obj instanceof Url)) return Url.prototype.format.call(obj);
    return obj.format();
  }

  Url.prototype.format = function () {
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

    var search = this.search || query && '?' + query || '';

    if (protocol && protocol.substr(-1) !== ':') protocol += ':';

    // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
    // unless they had them to begin with.
    if (this.slashes || (!protocol || slashedProtocol[protocol]) && host !== false) {
      host = '//' + (host || '');
      if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
    } else if (!host) {
      host = '';
    }

    if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
    if (search && search.charAt(0) !== '?') search = '?' + search;

    pathname = pathname.replace(/[?#]/g, function (match) {
      return encodeURIComponent(match);
    });
    search = search.replace('#', '%23');

    return protocol + host + pathname + search + hash;
  };

  function urlResolve(source, relative) {
    return urlParse(source, false, true).resolve(relative);
  }

  Url.prototype.resolve = function (relative) {
    return this.resolveObject(urlParse(relative, false, true)).format();
  };

  function urlResolveObject(source, relative) {
    if (!source) return relative;
    return urlParse(source, false, true).resolveObject(relative);
  }

  Url.prototype.resolveObject = function (relative) {
    if (isString(relative)) {
      var rel = new Url();
      rel.parse(relative, false, true);
      relative = rel;
    }

    var result = new Url();
    Object.keys(this).forEach(function (k) {
      result[k] = this[k];
    }, this);

    // hash is always overridden, no matter what.
    // even href="" will remove it.
    result.hash = relative.hash;

    // if the relative url is empty, then there's nothing left to do here.
    if (relative.href === '') {
      result.href = result.format();
      return result;
    }

    // hrefs like //foo/bar always cut to the protocol.
    if (relative.slashes && !relative.protocol) {
      // take everything except the protocol from relative
      Object.keys(relative).forEach(function (k) {
        if (k !== 'protocol') result[k] = relative[k];
      });

      //urlParse appends trailing / to urls like http://www.example.com
      if (slashedProtocol[result.protocol] && result.hostname && !result.pathname) {
        result.path = result.pathname = '/';
      }

      result.href = result.format();
      return result;
    }

    if (relative.protocol && relative.protocol !== result.protocol) {
      // if it's a known url protocol, then changing
      // the protocol does weird things
      // first, if it's not file:, then we MUST have a host,
      // and if there was a path
      // to begin with, then we MUST have a path.
      // if it is file:, then the host is dropped,
      // because that's known to be hostless.
      // anything else is assumed to be absolute.
      if (!slashedProtocol[relative.protocol]) {
        Object.keys(relative).forEach(function (k) {
          result[k] = relative[k];
        });
        result.href = result.format();
        return result;
      }

      result.protocol = relative.protocol;
      if (!relative.host && !hostlessProtocol[relative.protocol]) {
        var relPath = (relative.pathname || '').split('/');
        while (relPath.length && !(relative.host = relPath.shift()));
        if (!relative.host) relative.host = '';
        if (!relative.hostname) relative.hostname = '';
        if (relPath[0] !== '') relPath.unshift('');
        if (relPath.length < 2) relPath.unshift('');
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
      // to support http.request
      if (result.pathname || result.search) {
        var p = result.pathname || '';
        var s = result.search || '';
        result.path = p + s;
      }
      result.slashes = result.slashes || relative.slashes;
      result.href = result.format();
      return result;
    }

    var isSourceAbs = result.pathname && result.pathname.charAt(0) === '/',
        isRelAbs = relative.host || relative.pathname && relative.pathname.charAt(0) === '/',
        mustEndAbs = isRelAbs || isSourceAbs || result.host && relative.pathname,
        removeAllDots = mustEndAbs,
        srcPath = result.pathname && result.pathname.split('/') || [],
        relPath = relative.pathname && relative.pathname.split('/') || [],
        psychotic = result.protocol && !slashedProtocol[result.protocol];

    // if the url is a non-slashed url, then relative
    // links like ../.. should be able
    // to crawl up to the hostname, as well.  This is strange.
    // result.protocol has already been set by now.
    // Later on, put the first path part into the host field.
    if (psychotic) {
      result.hostname = '';
      result.port = null;
      if (result.host) {
        if (srcPath[0] === '') srcPath[0] = result.host;else srcPath.unshift(result.host);
      }
      result.host = '';
      if (relative.protocol) {
        relative.hostname = null;
        relative.port = null;
        if (relative.host) {
          if (relPath[0] === '') relPath[0] = relative.host;else relPath.unshift(relative.host);
        }
        relative.host = null;
      }
      mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
    }

    if (isRelAbs) {
      // it's absolute.
      result.host = relative.host || relative.host === '' ? relative.host : result.host;
      result.hostname = relative.hostname || relative.hostname === '' ? relative.hostname : result.hostname;
      result.search = relative.search;
      result.query = relative.query;
      srcPath = relPath;
      // fall through to the dot-handling below.
    } else if (relPath.length) {
      // it's relative
      // throw away the existing file, and take the new path instead.
      if (!srcPath) srcPath = [];
      srcPath.pop();
      srcPath = srcPath.concat(relPath);
      result.search = relative.search;
      result.query = relative.query;
    } else if (!isNullOrUndefined(relative.search)) {
      // just pull out the search.
      // like href='?foo'.
      // Put this after the other two cases because it simplifies the booleans
      if (psychotic) {
        result.hostname = result.host = srcPath.shift();
        //occationaly the auth can get stuck only in host
        //this especialy happens in cases like
        //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
        var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
        if (authInHost) {
          result.auth = authInHost.shift();
          result.host = result.hostname = authInHost.shift();
        }
      }
      result.search = relative.search;
      result.query = relative.query;
      //to support http.request
      if (!isNull(result.pathname) || !isNull(result.search)) {
        result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
      }
      result.href = result.format();
      return result;
    }

    if (!srcPath.length) {
      // no path at all.  easy.
      // we've already handled the other stuff above.
      result.pathname = null;
      //to support http.request
      if (result.search) {
        result.path = '/' + result.search;
      } else {
        result.path = null;
      }
      result.href = result.format();
      return result;
    }

    // if a url ENDs in . or .., then it must get a trailing slash.
    // however, if it ends in anything else non-slashy,
    // then it must NOT get a trailing slash.
    var last = srcPath.slice(-1)[0];
    var hasTrailingSlash = (result.host || relative.host) && (last === '.' || last === '..') || last === '';

    // strip single dots, resolve double dots to parent dir
    // if the path tries to go above the root, `up` ends up > 0
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

    // if the path is allowed to go above the root, restore leading ..s
    if (!mustEndAbs && !removeAllDots) {
      for (; up--; up) {
        srcPath.unshift('..');
      }
    }

    if (mustEndAbs && srcPath[0] !== '' && (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
      srcPath.unshift('');
    }

    if (hasTrailingSlash && srcPath.join('/').substr(-1) !== '/') {
      srcPath.push('');
    }

    var isAbsolute = srcPath[0] === '' || srcPath[0] && srcPath[0].charAt(0) === '/';

    // put the host back
    if (psychotic) {
      result.hostname = result.host = isAbsolute ? '' : srcPath.length ? srcPath.shift() : '';
      //occationaly the auth can get stuck only in host
      //this especialy happens in cases like
      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
      var authInHost = result.host && result.host.indexOf('@') > 0 ? result.host.split('@') : false;
      if (authInHost) {
        result.auth = authInHost.shift();
        result.host = result.hostname = authInHost.shift();
      }
    }

    mustEndAbs = mustEndAbs || result.host && srcPath.length;

    if (mustEndAbs && !isAbsolute) {
      srcPath.unshift('');
    }

    if (!srcPath.length) {
      result.pathname = null;
      result.path = null;
    } else {
      result.pathname = srcPath.join('/');
    }

    //to support request.http
    if (!isNull(result.pathname) || !isNull(result.search)) {
      result.path = (result.pathname ? result.pathname : '') + (result.search ? result.search : '');
    }
    result.auth = relative.auth || result.auth;
    result.slashes = result.slashes || relative.slashes;
    result.href = result.format();
    return result;
  };

  Url.prototype.parseHost = function () {
    var host = this.host;
    var port = portPattern.exec(host);
    if (port) {
      port = port[0];
      if (port !== ':') {
        this.port = port.substr(1);
      }
      host = host.substr(0, host.length - port.length);
    }
    if (host) this.hostname = host;
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
});
System.registerDynamic("npm:url@0.10.3.js", ["npm:url@0.10.3/url.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = $__require("npm:url@0.10.3/url.js");
});
System.registerDynamic('github:jspm/nodelibs-url@0.1.0/index.js', ['npm:url@0.10.3.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  module.exports = System._nodeRequire ? System._nodeRequire('url') : $__require('npm:url@0.10.3.js');
});
System.registerDynamic("github:jspm/nodelibs-url@0.1.0.js", ["github:jspm/nodelibs-url@0.1.0/index.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = $__require("github:jspm/nodelibs-url@0.1.0/index.js");
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/mark.js', ['npm:js-yaml@3.9.1/lib/js-yaml/common.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var common = $__require('npm:js-yaml@3.9.1/lib/js-yaml/common.js');
  function Mark(name, buffer, position, line, column) {
    this.name = name;
    this.buffer = buffer;
    this.position = position;
    this.line = line;
    this.column = column;
  }
  Mark.prototype.getSnippet = function getSnippet(indent, maxLength) {
    var head, start, tail, end, snippet;
    if (!this.buffer) return null;
    indent = indent || 4;
    maxLength = maxLength || 75;
    head = '';
    start = this.position;
    while (start > 0 && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(start - 1)) === -1) {
      start -= 1;
      if (this.position - start > maxLength / 2 - 1) {
        head = ' ... ';
        start += 5;
        break;
      }
    }
    tail = '';
    end = this.position;
    while (end < this.buffer.length && '\x00\r\n\x85\u2028\u2029'.indexOf(this.buffer.charAt(end)) === -1) {
      end += 1;
      if (end - this.position > maxLength / 2 - 1) {
        tail = ' ... ';
        end -= 5;
        break;
      }
    }
    snippet = this.buffer.slice(start, end);
    return common.repeat(' ', indent) + head + snippet + tail + '\n' + common.repeat(' ', indent + this.position - start + head.length) + '^';
  };
  Mark.prototype.toString = function toString(compact) {
    var snippet,
        where = '';
    if (this.name) {
      where += 'in "' + this.name + '" ';
    }
    where += 'at line ' + (this.line + 1) + ', column ' + (this.column + 1);
    if (!compact) {
      snippet = this.getSnippet();
      if (snippet) {
        where += ':\n' + snippet;
      }
    }
    return where;
  };
  module.exports = Mark;
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/loader.js', ['npm:js-yaml@3.9.1/lib/js-yaml/common.js', 'npm:js-yaml@3.9.1/lib/js-yaml/exception.js', 'npm:js-yaml@3.9.1/lib/js-yaml/mark.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/default_safe.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/default_full.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var common = $__require('npm:js-yaml@3.9.1/lib/js-yaml/common.js');
  var YAMLException = $__require('npm:js-yaml@3.9.1/lib/js-yaml/exception.js');
  var Mark = $__require('npm:js-yaml@3.9.1/lib/js-yaml/mark.js');
  var DEFAULT_SAFE_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/default_safe.js');
  var DEFAULT_FULL_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/default_full.js');
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var CONTEXT_FLOW_IN = 1;
  var CONTEXT_FLOW_OUT = 2;
  var CONTEXT_BLOCK_IN = 3;
  var CONTEXT_BLOCK_OUT = 4;
  var CHOMPING_CLIP = 1;
  var CHOMPING_STRIP = 2;
  var CHOMPING_KEEP = 3;
  var PATTERN_NON_PRINTABLE = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x84\x86-\x9F\uFFFE\uFFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/;
  var PATTERN_NON_ASCII_LINE_BREAKS = /[\x85\u2028\u2029]/;
  var PATTERN_FLOW_INDICATORS = /[,\[\]\{\}]/;
  var PATTERN_TAG_HANDLE = /^(?:!|!!|![a-z\-]+!)$/i;
  var PATTERN_TAG_URI = /^(?:!|[^,\[\]\{\}])(?:%[0-9a-f]{2}|[0-9a-z\-#;\/\?:@&=\+\$,_\.!~\*'\(\)\[\]])*$/i;
  function is_EOL(c) {
    return c === 0x0A || c === 0x0D;
  }
  function is_WHITE_SPACE(c) {
    return c === 0x09 || c === 0x20;
  }
  function is_WS_OR_EOL(c) {
    return c === 0x09 || c === 0x20 || c === 0x0A || c === 0x0D;
  }
  function is_FLOW_INDICATOR(c) {
    return c === 0x2C || c === 0x5B || c === 0x5D || c === 0x7B || c === 0x7D;
  }
  function fromHexCode(c) {
    var lc;
    if (0x30 <= c && c <= 0x39) {
      return c - 0x30;
    }
    lc = c | 0x20;
    if (0x61 <= lc && lc <= 0x66) {
      return lc - 0x61 + 10;
    }
    return -1;
  }
  function escapedHexLen(c) {
    if (c === 0x78) {
      return 2;
    }
    if (c === 0x75) {
      return 4;
    }
    if (c === 0x55) {
      return 8;
    }
    return 0;
  }
  function fromDecimalCode(c) {
    if (0x30 <= c && c <= 0x39) {
      return c - 0x30;
    }
    return -1;
  }
  function simpleEscapeSequence(c) {
    return c === 0x30 ? '\x00' : c === 0x61 ? '\x07' : c === 0x62 ? '\x08' : c === 0x74 ? '\x09' : c === 0x09 ? '\x09' : c === 0x6E ? '\x0A' : c === 0x76 ? '\x0B' : c === 0x66 ? '\x0C' : c === 0x72 ? '\x0D' : c === 0x65 ? '\x1B' : c === 0x20 ? ' ' : c === 0x22 ? '\x22' : c === 0x2F ? '/' : c === 0x5C ? '\x5C' : c === 0x4E ? '\x85' : c === 0x5F ? '\xA0' : c === 0x4C ? '\u2028' : c === 0x50 ? '\u2029' : '';
  }
  function charFromCodepoint(c) {
    if (c <= 0xFFFF) {
      return String.fromCharCode(c);
    }
    return String.fromCharCode((c - 0x010000 >> 10) + 0xD800, (c - 0x010000 & 0x03FF) + 0xDC00);
  }
  var simpleEscapeCheck = new Array(256);
  var simpleEscapeMap = new Array(256);
  for (var i = 0; i < 256; i++) {
    simpleEscapeCheck[i] = simpleEscapeSequence(i) ? 1 : 0;
    simpleEscapeMap[i] = simpleEscapeSequence(i);
  }
  function State(input, options) {
    this.input = input;
    this.filename = options['filename'] || null;
    this.schema = options['schema'] || DEFAULT_FULL_SCHEMA;
    this.onWarning = options['onWarning'] || null;
    this.legacy = options['legacy'] || false;
    this.json = options['json'] || false;
    this.listener = options['listener'] || null;
    this.implicitTypes = this.schema.compiledImplicit;
    this.typeMap = this.schema.compiledTypeMap;
    this.length = input.length;
    this.position = 0;
    this.line = 0;
    this.lineStart = 0;
    this.lineIndent = 0;
    this.documents = [];
  }
  function generateError(state, message) {
    return new YAMLException(message, new Mark(state.filename, state.input, state.position, state.line, state.position - state.lineStart));
  }
  function throwError(state, message) {
    throw generateError(state, message);
  }
  function throwWarning(state, message) {
    if (state.onWarning) {
      state.onWarning.call(null, generateError(state, message));
    }
  }
  var directiveHandlers = {
    YAML: function handleYamlDirective(state, name, args) {
      var match, major, minor;
      if (state.version !== null) {
        throwError(state, 'duplication of %YAML directive');
      }
      if (args.length !== 1) {
        throwError(state, 'YAML directive accepts exactly one argument');
      }
      match = /^([0-9]+)\.([0-9]+)$/.exec(args[0]);
      if (match === null) {
        throwError(state, 'ill-formed argument of the YAML directive');
      }
      major = parseInt(match[1], 10);
      minor = parseInt(match[2], 10);
      if (major !== 1) {
        throwError(state, 'unacceptable YAML version of the document');
      }
      state.version = args[0];
      state.checkLineBreaks = minor < 2;
      if (minor !== 1 && minor !== 2) {
        throwWarning(state, 'unsupported YAML version of the document');
      }
    },
    TAG: function handleTagDirective(state, name, args) {
      var handle, prefix;
      if (args.length !== 2) {
        throwError(state, 'TAG directive accepts exactly two arguments');
      }
      handle = args[0];
      prefix = args[1];
      if (!PATTERN_TAG_HANDLE.test(handle)) {
        throwError(state, 'ill-formed tag handle (first argument) of the TAG directive');
      }
      if (_hasOwnProperty.call(state.tagMap, handle)) {
        throwError(state, 'there is a previously declared suffix for "' + handle + '" tag handle');
      }
      if (!PATTERN_TAG_URI.test(prefix)) {
        throwError(state, 'ill-formed tag prefix (second argument) of the TAG directive');
      }
      state.tagMap[handle] = prefix;
    }
  };
  function captureSegment(state, start, end, checkJson) {
    var _position, _length, _character, _result;
    if (start < end) {
      _result = state.input.slice(start, end);
      if (checkJson) {
        for (_position = 0, _length = _result.length; _position < _length; _position += 1) {
          _character = _result.charCodeAt(_position);
          if (!(_character === 0x09 || 0x20 <= _character && _character <= 0x10FFFF)) {
            throwError(state, 'expected valid JSON character');
          }
        }
      } else if (PATTERN_NON_PRINTABLE.test(_result)) {
        throwError(state, 'the stream contains non-printable characters');
      }
      state.result += _result;
    }
  }
  function mergeMappings(state, destination, source, overridableKeys) {
    var sourceKeys, key, index, quantity;
    if (!common.isObject(source)) {
      throwError(state, 'cannot merge mappings; the provided source object is unacceptable');
    }
    sourceKeys = Object.keys(source);
    for (index = 0, quantity = sourceKeys.length; index < quantity; index += 1) {
      key = sourceKeys[index];
      if (!_hasOwnProperty.call(destination, key)) {
        destination[key] = source[key];
        overridableKeys[key] = true;
      }
    }
  }
  function storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, startLine, startPos) {
    var index, quantity;
    keyNode = String(keyNode);
    if (_result === null) {
      _result = {};
    }
    if (keyTag === 'tag:yaml.org,2002:merge') {
      if (Array.isArray(valueNode)) {
        for (index = 0, quantity = valueNode.length; index < quantity; index += 1) {
          mergeMappings(state, _result, valueNode[index], overridableKeys);
        }
      } else {
        mergeMappings(state, _result, valueNode, overridableKeys);
      }
    } else {
      if (!state.json && !_hasOwnProperty.call(overridableKeys, keyNode) && _hasOwnProperty.call(_result, keyNode)) {
        state.line = startLine || state.line;
        state.position = startPos || state.position;
        throwError(state, 'duplicated mapping key');
      }
      _result[keyNode] = valueNode;
      delete overridableKeys[keyNode];
    }
    return _result;
  }
  function readLineBreak(state) {
    var ch;
    ch = state.input.charCodeAt(state.position);
    if (ch === 0x0A) {
      state.position++;
    } else if (ch === 0x0D) {
      state.position++;
      if (state.input.charCodeAt(state.position) === 0x0A) {
        state.position++;
      }
    } else {
      throwError(state, 'a line break is expected');
    }
    state.line += 1;
    state.lineStart = state.position;
  }
  function skipSeparationSpace(state, allowComments, checkIndent) {
    var lineBreaks = 0,
        ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      while (is_WHITE_SPACE(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      if (allowComments && ch === 0x23) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (ch !== 0x0A && ch !== 0x0D && ch !== 0);
      }
      if (is_EOL(ch)) {
        readLineBreak(state);
        ch = state.input.charCodeAt(state.position);
        lineBreaks++;
        state.lineIndent = 0;
        while (ch === 0x20) {
          state.lineIndent++;
          ch = state.input.charCodeAt(++state.position);
        }
      } else {
        break;
      }
    }
    if (checkIndent !== -1 && lineBreaks !== 0 && state.lineIndent < checkIndent) {
      throwWarning(state, 'deficient indentation');
    }
    return lineBreaks;
  }
  function testDocumentSeparator(state) {
    var _position = state.position,
        ch;
    ch = state.input.charCodeAt(_position);
    if ((ch === 0x2D || ch === 0x2E) && ch === state.input.charCodeAt(_position + 1) && ch === state.input.charCodeAt(_position + 2)) {
      _position += 3;
      ch = state.input.charCodeAt(_position);
      if (ch === 0 || is_WS_OR_EOL(ch)) {
        return true;
      }
    }
    return false;
  }
  function writeFoldedLines(state, count) {
    if (count === 1) {
      state.result += ' ';
    } else if (count > 1) {
      state.result += common.repeat('\n', count - 1);
    }
  }
  function readPlainScalar(state, nodeIndent, withinFlowCollection) {
    var preceding,
        following,
        captureStart,
        captureEnd,
        hasPendingContent,
        _line,
        _lineStart,
        _lineIndent,
        _kind = state.kind,
        _result = state.result,
        ch;
    ch = state.input.charCodeAt(state.position);
    if (is_WS_OR_EOL(ch) || is_FLOW_INDICATOR(ch) || ch === 0x23 || ch === 0x26 || ch === 0x2A || ch === 0x21 || ch === 0x7C || ch === 0x3E || ch === 0x27 || ch === 0x22 || ch === 0x25 || ch === 0x40 || ch === 0x60) {
      return false;
    }
    if (ch === 0x3F || ch === 0x2D) {
      following = state.input.charCodeAt(state.position + 1);
      if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
        return false;
      }
    }
    state.kind = 'scalar';
    state.result = '';
    captureStart = captureEnd = state.position;
    hasPendingContent = false;
    while (ch !== 0) {
      if (ch === 0x3A) {
        following = state.input.charCodeAt(state.position + 1);
        if (is_WS_OR_EOL(following) || withinFlowCollection && is_FLOW_INDICATOR(following)) {
          break;
        }
      } else if (ch === 0x23) {
        preceding = state.input.charCodeAt(state.position - 1);
        if (is_WS_OR_EOL(preceding)) {
          break;
        }
      } else if (state.position === state.lineStart && testDocumentSeparator(state) || withinFlowCollection && is_FLOW_INDICATOR(ch)) {
        break;
      } else if (is_EOL(ch)) {
        _line = state.line;
        _lineStart = state.lineStart;
        _lineIndent = state.lineIndent;
        skipSeparationSpace(state, false, -1);
        if (state.lineIndent >= nodeIndent) {
          hasPendingContent = true;
          ch = state.input.charCodeAt(state.position);
          continue;
        } else {
          state.position = captureEnd;
          state.line = _line;
          state.lineStart = _lineStart;
          state.lineIndent = _lineIndent;
          break;
        }
      }
      if (hasPendingContent) {
        captureSegment(state, captureStart, captureEnd, false);
        writeFoldedLines(state, state.line - _line);
        captureStart = captureEnd = state.position;
        hasPendingContent = false;
      }
      if (!is_WHITE_SPACE(ch)) {
        captureEnd = state.position + 1;
      }
      ch = state.input.charCodeAt(++state.position);
    }
    captureSegment(state, captureStart, captureEnd, false);
    if (state.result) {
      return true;
    }
    state.kind = _kind;
    state.result = _result;
    return false;
  }
  function readSingleQuotedScalar(state, nodeIndent) {
    var ch, captureStart, captureEnd;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x27) {
      return false;
    }
    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x27) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (ch === 0x27) {
          captureStart = state.position;
          state.position++;
          captureEnd = state.position;
        } else {
          return true;
        }
      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a single quoted scalar');
      } else {
        state.position++;
        captureEnd = state.position;
      }
    }
    throwError(state, 'unexpected end of the stream within a single quoted scalar');
  }
  function readDoubleQuotedScalar(state, nodeIndent) {
    var captureStart, captureEnd, hexLength, hexResult, tmp, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x22) {
      return false;
    }
    state.kind = 'scalar';
    state.result = '';
    state.position++;
    captureStart = captureEnd = state.position;
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      if (ch === 0x22) {
        captureSegment(state, captureStart, state.position, true);
        state.position++;
        return true;
      } else if (ch === 0x5C) {
        captureSegment(state, captureStart, state.position, true);
        ch = state.input.charCodeAt(++state.position);
        if (is_EOL(ch)) {
          skipSeparationSpace(state, false, nodeIndent);
        } else if (ch < 256 && simpleEscapeCheck[ch]) {
          state.result += simpleEscapeMap[ch];
          state.position++;
        } else if ((tmp = escapedHexLen(ch)) > 0) {
          hexLength = tmp;
          hexResult = 0;
          for (; hexLength > 0; hexLength--) {
            ch = state.input.charCodeAt(++state.position);
            if ((tmp = fromHexCode(ch)) >= 0) {
              hexResult = (hexResult << 4) + tmp;
            } else {
              throwError(state, 'expected hexadecimal character');
            }
          }
          state.result += charFromCodepoint(hexResult);
          state.position++;
        } else {
          throwError(state, 'unknown escape sequence');
        }
        captureStart = captureEnd = state.position;
      } else if (is_EOL(ch)) {
        captureSegment(state, captureStart, captureEnd, true);
        writeFoldedLines(state, skipSeparationSpace(state, false, nodeIndent));
        captureStart = captureEnd = state.position;
      } else if (state.position === state.lineStart && testDocumentSeparator(state)) {
        throwError(state, 'unexpected end of the document within a double quoted scalar');
      } else {
        state.position++;
        captureEnd = state.position;
      }
    }
    throwError(state, 'unexpected end of the stream within a double quoted scalar');
  }
  function readFlowCollection(state, nodeIndent) {
    var readNext = true,
        _line,
        _tag = state.tag,
        _result,
        _anchor = state.anchor,
        following,
        terminator,
        isPair,
        isExplicitPair,
        isMapping,
        overridableKeys = {},
        keyNode,
        keyTag,
        valueNode,
        ch;
    ch = state.input.charCodeAt(state.position);
    if (ch === 0x5B) {
      terminator = 0x5D;
      isMapping = false;
      _result = [];
    } else if (ch === 0x7B) {
      terminator = 0x7D;
      isMapping = true;
      _result = {};
    } else {
      return false;
    }
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }
    ch = state.input.charCodeAt(++state.position);
    while (ch !== 0) {
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === terminator) {
        state.position++;
        state.tag = _tag;
        state.anchor = _anchor;
        state.kind = isMapping ? 'mapping' : 'sequence';
        state.result = _result;
        return true;
      } else if (!readNext) {
        throwError(state, 'missed comma between flow collection entries');
      }
      keyTag = keyNode = valueNode = null;
      isPair = isExplicitPair = false;
      if (ch === 0x3F) {
        following = state.input.charCodeAt(state.position + 1);
        if (is_WS_OR_EOL(following)) {
          isPair = isExplicitPair = true;
          state.position++;
          skipSeparationSpace(state, true, nodeIndent);
        }
      }
      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
      keyTag = state.tag;
      keyNode = state.result;
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if ((isExplicitPair || state.line === _line) && ch === 0x3A) {
        isPair = true;
        ch = state.input.charCodeAt(++state.position);
        skipSeparationSpace(state, true, nodeIndent);
        composeNode(state, nodeIndent, CONTEXT_FLOW_IN, false, true);
        valueNode = state.result;
      }
      if (isMapping) {
        storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode);
      } else if (isPair) {
        _result.push(storeMappingPair(state, null, overridableKeys, keyTag, keyNode, valueNode));
      } else {
        _result.push(keyNode);
      }
      skipSeparationSpace(state, true, nodeIndent);
      ch = state.input.charCodeAt(state.position);
      if (ch === 0x2C) {
        readNext = true;
        ch = state.input.charCodeAt(++state.position);
      } else {
        readNext = false;
      }
    }
    throwError(state, 'unexpected end of the stream within a flow collection');
  }
  function readBlockScalar(state, nodeIndent) {
    var captureStart,
        folding,
        chomping = CHOMPING_CLIP,
        didReadContent = false,
        detectedIndent = false,
        textIndent = nodeIndent,
        emptyLines = 0,
        atMoreIndented = false,
        tmp,
        ch;
    ch = state.input.charCodeAt(state.position);
    if (ch === 0x7C) {
      folding = false;
    } else if (ch === 0x3E) {
      folding = true;
    } else {
      return false;
    }
    state.kind = 'scalar';
    state.result = '';
    while (ch !== 0) {
      ch = state.input.charCodeAt(++state.position);
      if (ch === 0x2B || ch === 0x2D) {
        if (CHOMPING_CLIP === chomping) {
          chomping = ch === 0x2B ? CHOMPING_KEEP : CHOMPING_STRIP;
        } else {
          throwError(state, 'repeat of a chomping mode identifier');
        }
      } else if ((tmp = fromDecimalCode(ch)) >= 0) {
        if (tmp === 0) {
          throwError(state, 'bad explicit indentation width of a block scalar; it cannot be less than one');
        } else if (!detectedIndent) {
          textIndent = nodeIndent + tmp - 1;
          detectedIndent = true;
        } else {
          throwError(state, 'repeat of an indentation width identifier');
        }
      } else {
        break;
      }
    }
    if (is_WHITE_SPACE(ch)) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (is_WHITE_SPACE(ch));
      if (ch === 0x23) {
        do {
          ch = state.input.charCodeAt(++state.position);
        } while (!is_EOL(ch) && ch !== 0);
      }
    }
    while (ch !== 0) {
      readLineBreak(state);
      state.lineIndent = 0;
      ch = state.input.charCodeAt(state.position);
      while ((!detectedIndent || state.lineIndent < textIndent) && ch === 0x20) {
        state.lineIndent++;
        ch = state.input.charCodeAt(++state.position);
      }
      if (!detectedIndent && state.lineIndent > textIndent) {
        textIndent = state.lineIndent;
      }
      if (is_EOL(ch)) {
        emptyLines++;
        continue;
      }
      if (state.lineIndent < textIndent) {
        if (chomping === CHOMPING_KEEP) {
          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
        } else if (chomping === CHOMPING_CLIP) {
          if (didReadContent) {
            state.result += '\n';
          }
        }
        break;
      }
      if (folding) {
        if (is_WHITE_SPACE(ch)) {
          atMoreIndented = true;
          state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
        } else if (atMoreIndented) {
          atMoreIndented = false;
          state.result += common.repeat('\n', emptyLines + 1);
        } else if (emptyLines === 0) {
          if (didReadContent) {
            state.result += ' ';
          }
        } else {
          state.result += common.repeat('\n', emptyLines);
        }
      } else {
        state.result += common.repeat('\n', didReadContent ? 1 + emptyLines : emptyLines);
      }
      didReadContent = true;
      detectedIndent = true;
      emptyLines = 0;
      captureStart = state.position;
      while (!is_EOL(ch) && ch !== 0) {
        ch = state.input.charCodeAt(++state.position);
      }
      captureSegment(state, captureStart, state.position, false);
    }
    return true;
  }
  function readBlockSequence(state, nodeIndent) {
    var _line,
        _tag = state.tag,
        _anchor = state.anchor,
        _result = [],
        following,
        detected = false,
        ch;
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }
    ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      if (ch !== 0x2D) {
        break;
      }
      following = state.input.charCodeAt(state.position + 1);
      if (!is_WS_OR_EOL(following)) {
        break;
      }
      detected = true;
      state.position++;
      if (skipSeparationSpace(state, true, -1)) {
        if (state.lineIndent <= nodeIndent) {
          _result.push(null);
          ch = state.input.charCodeAt(state.position);
          continue;
        }
      }
      _line = state.line;
      composeNode(state, nodeIndent, CONTEXT_BLOCK_IN, false, true);
      _result.push(state.result);
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if ((state.line === _line || state.lineIndent > nodeIndent) && ch !== 0) {
        throwError(state, 'bad indentation of a sequence entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'sequence';
      state.result = _result;
      return true;
    }
    return false;
  }
  function readBlockMapping(state, nodeIndent, flowIndent) {
    var following,
        allowCompact,
        _line,
        _pos,
        _tag = state.tag,
        _anchor = state.anchor,
        _result = {},
        overridableKeys = {},
        keyTag = null,
        keyNode = null,
        valueNode = null,
        atExplicitKey = false,
        detected = false,
        ch;
    if (state.anchor !== null) {
      state.anchorMap[state.anchor] = _result;
    }
    ch = state.input.charCodeAt(state.position);
    while (ch !== 0) {
      following = state.input.charCodeAt(state.position + 1);
      _line = state.line;
      _pos = state.position;
      if ((ch === 0x3F || ch === 0x3A) && is_WS_OR_EOL(following)) {
        if (ch === 0x3F) {
          if (atExplicitKey) {
            storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
            keyTag = keyNode = valueNode = null;
          }
          detected = true;
          atExplicitKey = true;
          allowCompact = true;
        } else if (atExplicitKey) {
          atExplicitKey = false;
          allowCompact = true;
        } else {
          throwError(state, 'incomplete explicit mapping pair; a key node is missed');
        }
        state.position += 1;
        ch = following;
      } else if (composeNode(state, flowIndent, CONTEXT_FLOW_OUT, false, true)) {
        if (state.line === _line) {
          ch = state.input.charCodeAt(state.position);
          while (is_WHITE_SPACE(ch)) {
            ch = state.input.charCodeAt(++state.position);
          }
          if (ch === 0x3A) {
            ch = state.input.charCodeAt(++state.position);
            if (!is_WS_OR_EOL(ch)) {
              throwError(state, 'a whitespace character is expected after the key-value separator within a block mapping');
            }
            if (atExplicitKey) {
              storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
              keyTag = keyNode = valueNode = null;
            }
            detected = true;
            atExplicitKey = false;
            allowCompact = false;
            keyTag = state.tag;
            keyNode = state.result;
          } else if (detected) {
            throwError(state, 'can not read an implicit mapping pair; a colon is missed');
          } else {
            state.tag = _tag;
            state.anchor = _anchor;
            return true;
          }
        } else if (detected) {
          throwError(state, 'can not read a block mapping entry; a multiline key may not be an implicit key');
        } else {
          state.tag = _tag;
          state.anchor = _anchor;
          return true;
        }
      } else {
        break;
      }
      if (state.line === _line || state.lineIndent > nodeIndent) {
        if (composeNode(state, nodeIndent, CONTEXT_BLOCK_OUT, true, allowCompact)) {
          if (atExplicitKey) {
            keyNode = state.result;
          } else {
            valueNode = state.result;
          }
        }
        if (!atExplicitKey) {
          storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, valueNode, _line, _pos);
          keyTag = keyNode = valueNode = null;
        }
        skipSeparationSpace(state, true, -1);
        ch = state.input.charCodeAt(state.position);
      }
      if (state.lineIndent > nodeIndent && ch !== 0) {
        throwError(state, 'bad indentation of a mapping entry');
      } else if (state.lineIndent < nodeIndent) {
        break;
      }
    }
    if (atExplicitKey) {
      storeMappingPair(state, _result, overridableKeys, keyTag, keyNode, null);
    }
    if (detected) {
      state.tag = _tag;
      state.anchor = _anchor;
      state.kind = 'mapping';
      state.result = _result;
    }
    return detected;
  }
  function readTagProperty(state) {
    var _position,
        isVerbatim = false,
        isNamed = false,
        tagHandle,
        tagName,
        ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x21) return false;
    if (state.tag !== null) {
      throwError(state, 'duplication of a tag property');
    }
    ch = state.input.charCodeAt(++state.position);
    if (ch === 0x3C) {
      isVerbatim = true;
      ch = state.input.charCodeAt(++state.position);
    } else if (ch === 0x21) {
      isNamed = true;
      tagHandle = '!!';
      ch = state.input.charCodeAt(++state.position);
    } else {
      tagHandle = '!';
    }
    _position = state.position;
    if (isVerbatim) {
      do {
        ch = state.input.charCodeAt(++state.position);
      } while (ch !== 0 && ch !== 0x3E);
      if (state.position < state.length) {
        tagName = state.input.slice(_position, state.position);
        ch = state.input.charCodeAt(++state.position);
      } else {
        throwError(state, 'unexpected end of the stream within a verbatim tag');
      }
    } else {
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        if (ch === 0x21) {
          if (!isNamed) {
            tagHandle = state.input.slice(_position - 1, state.position + 1);
            if (!PATTERN_TAG_HANDLE.test(tagHandle)) {
              throwError(state, 'named tag handle cannot contain such characters');
            }
            isNamed = true;
            _position = state.position + 1;
          } else {
            throwError(state, 'tag suffix cannot contain exclamation marks');
          }
        }
        ch = state.input.charCodeAt(++state.position);
      }
      tagName = state.input.slice(_position, state.position);
      if (PATTERN_FLOW_INDICATORS.test(tagName)) {
        throwError(state, 'tag suffix cannot contain flow indicator characters');
      }
    }
    if (tagName && !PATTERN_TAG_URI.test(tagName)) {
      throwError(state, 'tag name cannot contain such characters: ' + tagName);
    }
    if (isVerbatim) {
      state.tag = tagName;
    } else if (_hasOwnProperty.call(state.tagMap, tagHandle)) {
      state.tag = state.tagMap[tagHandle] + tagName;
    } else if (tagHandle === '!') {
      state.tag = '!' + tagName;
    } else if (tagHandle === '!!') {
      state.tag = 'tag:yaml.org,2002:' + tagName;
    } else {
      throwError(state, 'undeclared tag handle "' + tagHandle + '"');
    }
    return true;
  }
  function readAnchorProperty(state) {
    var _position, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x26) return false;
    if (state.anchor !== null) {
      throwError(state, 'duplication of an anchor property');
    }
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, 'name of an anchor node must contain at least one character');
    }
    state.anchor = state.input.slice(_position, state.position);
    return true;
  }
  function readAlias(state) {
    var _position, alias, ch;
    ch = state.input.charCodeAt(state.position);
    if (ch !== 0x2A) return false;
    ch = state.input.charCodeAt(++state.position);
    _position = state.position;
    while (ch !== 0 && !is_WS_OR_EOL(ch) && !is_FLOW_INDICATOR(ch)) {
      ch = state.input.charCodeAt(++state.position);
    }
    if (state.position === _position) {
      throwError(state, 'name of an alias node must contain at least one character');
    }
    alias = state.input.slice(_position, state.position);
    if (!state.anchorMap.hasOwnProperty(alias)) {
      throwError(state, 'unidentified alias "' + alias + '"');
    }
    state.result = state.anchorMap[alias];
    skipSeparationSpace(state, true, -1);
    return true;
  }
  function composeNode(state, parentIndent, nodeContext, allowToSeek, allowCompact) {
    var allowBlockStyles,
        allowBlockScalars,
        allowBlockCollections,
        indentStatus = 1,
        atNewLine = false,
        hasContent = false,
        typeIndex,
        typeQuantity,
        type,
        flowIndent,
        blockIndent;
    if (state.listener !== null) {
      state.listener('open', state);
    }
    state.tag = null;
    state.anchor = null;
    state.kind = null;
    state.result = null;
    allowBlockStyles = allowBlockScalars = allowBlockCollections = CONTEXT_BLOCK_OUT === nodeContext || CONTEXT_BLOCK_IN === nodeContext;
    if (allowToSeek) {
      if (skipSeparationSpace(state, true, -1)) {
        atNewLine = true;
        if (state.lineIndent > parentIndent) {
          indentStatus = 1;
        } else if (state.lineIndent === parentIndent) {
          indentStatus = 0;
        } else if (state.lineIndent < parentIndent) {
          indentStatus = -1;
        }
      }
    }
    if (indentStatus === 1) {
      while (readTagProperty(state) || readAnchorProperty(state)) {
        if (skipSeparationSpace(state, true, -1)) {
          atNewLine = true;
          allowBlockCollections = allowBlockStyles;
          if (state.lineIndent > parentIndent) {
            indentStatus = 1;
          } else if (state.lineIndent === parentIndent) {
            indentStatus = 0;
          } else if (state.lineIndent < parentIndent) {
            indentStatus = -1;
          }
        } else {
          allowBlockCollections = false;
        }
      }
    }
    if (allowBlockCollections) {
      allowBlockCollections = atNewLine || allowCompact;
    }
    if (indentStatus === 1 || CONTEXT_BLOCK_OUT === nodeContext) {
      if (CONTEXT_FLOW_IN === nodeContext || CONTEXT_FLOW_OUT === nodeContext) {
        flowIndent = parentIndent;
      } else {
        flowIndent = parentIndent + 1;
      }
      blockIndent = state.position - state.lineStart;
      if (indentStatus === 1) {
        if (allowBlockCollections && (readBlockSequence(state, blockIndent) || readBlockMapping(state, blockIndent, flowIndent)) || readFlowCollection(state, flowIndent)) {
          hasContent = true;
        } else {
          if (allowBlockScalars && readBlockScalar(state, flowIndent) || readSingleQuotedScalar(state, flowIndent) || readDoubleQuotedScalar(state, flowIndent)) {
            hasContent = true;
          } else if (readAlias(state)) {
            hasContent = true;
            if (state.tag !== null || state.anchor !== null) {
              throwError(state, 'alias node should not have any properties');
            }
          } else if (readPlainScalar(state, flowIndent, CONTEXT_FLOW_IN === nodeContext)) {
            hasContent = true;
            if (state.tag === null) {
              state.tag = '?';
            }
          }
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else if (indentStatus === 0) {
        hasContent = allowBlockCollections && readBlockSequence(state, blockIndent);
      }
    }
    if (state.tag !== null && state.tag !== '!') {
      if (state.tag === '?') {
        for (typeIndex = 0, typeQuantity = state.implicitTypes.length; typeIndex < typeQuantity; typeIndex += 1) {
          type = state.implicitTypes[typeIndex];
          if (type.resolve(state.result)) {
            state.result = type.construct(state.result);
            state.tag = type.tag;
            if (state.anchor !== null) {
              state.anchorMap[state.anchor] = state.result;
            }
            break;
          }
        }
      } else if (_hasOwnProperty.call(state.typeMap[state.kind || 'fallback'], state.tag)) {
        type = state.typeMap[state.kind || 'fallback'][state.tag];
        if (state.result !== null && type.kind !== state.kind) {
          throwError(state, 'unacceptable node kind for !<' + state.tag + '> tag; it should be "' + type.kind + '", not "' + state.kind + '"');
        }
        if (!type.resolve(state.result)) {
          throwError(state, 'cannot resolve a node with !<' + state.tag + '> explicit tag');
        } else {
          state.result = type.construct(state.result);
          if (state.anchor !== null) {
            state.anchorMap[state.anchor] = state.result;
          }
        }
      } else {
        throwError(state, 'unknown tag !<' + state.tag + '>');
      }
    }
    if (state.listener !== null) {
      state.listener('close', state);
    }
    return state.tag !== null || state.anchor !== null || hasContent;
  }
  function readDocument(state) {
    var documentStart = state.position,
        _position,
        directiveName,
        directiveArgs,
        hasDirectives = false,
        ch;
    state.version = null;
    state.checkLineBreaks = state.legacy;
    state.tagMap = {};
    state.anchorMap = {};
    while ((ch = state.input.charCodeAt(state.position)) !== 0) {
      skipSeparationSpace(state, true, -1);
      ch = state.input.charCodeAt(state.position);
      if (state.lineIndent > 0 || ch !== 0x25) {
        break;
      }
      hasDirectives = true;
      ch = state.input.charCodeAt(++state.position);
      _position = state.position;
      while (ch !== 0 && !is_WS_OR_EOL(ch)) {
        ch = state.input.charCodeAt(++state.position);
      }
      directiveName = state.input.slice(_position, state.position);
      directiveArgs = [];
      if (directiveName.length < 1) {
        throwError(state, 'directive name must not be less than one character in length');
      }
      while (ch !== 0) {
        while (is_WHITE_SPACE(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        if (ch === 0x23) {
          do {
            ch = state.input.charCodeAt(++state.position);
          } while (ch !== 0 && !is_EOL(ch));
          break;
        }
        if (is_EOL(ch)) break;
        _position = state.position;
        while (ch !== 0 && !is_WS_OR_EOL(ch)) {
          ch = state.input.charCodeAt(++state.position);
        }
        directiveArgs.push(state.input.slice(_position, state.position));
      }
      if (ch !== 0) readLineBreak(state);
      if (_hasOwnProperty.call(directiveHandlers, directiveName)) {
        directiveHandlers[directiveName](state, directiveName, directiveArgs);
      } else {
        throwWarning(state, 'unknown document directive "' + directiveName + '"');
      }
    }
    skipSeparationSpace(state, true, -1);
    if (state.lineIndent === 0 && state.input.charCodeAt(state.position) === 0x2D && state.input.charCodeAt(state.position + 1) === 0x2D && state.input.charCodeAt(state.position + 2) === 0x2D) {
      state.position += 3;
      skipSeparationSpace(state, true, -1);
    } else if (hasDirectives) {
      throwError(state, 'directives end mark is expected');
    }
    composeNode(state, state.lineIndent - 1, CONTEXT_BLOCK_OUT, false, true);
    skipSeparationSpace(state, true, -1);
    if (state.checkLineBreaks && PATTERN_NON_ASCII_LINE_BREAKS.test(state.input.slice(documentStart, state.position))) {
      throwWarning(state, 'non-ASCII line breaks are interpreted as content');
    }
    state.documents.push(state.result);
    if (state.position === state.lineStart && testDocumentSeparator(state)) {
      if (state.input.charCodeAt(state.position) === 0x2E) {
        state.position += 3;
        skipSeparationSpace(state, true, -1);
      }
      return;
    }
    if (state.position < state.length - 1) {
      throwError(state, 'end of the stream or a document separator is expected');
    } else {
      return;
    }
  }
  function loadDocuments(input, options) {
    input = String(input);
    options = options || {};
    if (input.length !== 0) {
      if (input.charCodeAt(input.length - 1) !== 0x0A && input.charCodeAt(input.length - 1) !== 0x0D) {
        input += '\n';
      }
      if (input.charCodeAt(0) === 0xFEFF) {
        input = input.slice(1);
      }
    }
    var state = new State(input, options);
    state.input += '\0';
    while (state.input.charCodeAt(state.position) === 0x20) {
      state.lineIndent += 1;
      state.position += 1;
    }
    while (state.position < state.length - 1) {
      readDocument(state);
    }
    return state.documents;
  }
  function loadAll(input, iterator, options) {
    var documents = loadDocuments(input, options),
        index,
        length;
    if (typeof iterator !== 'function') {
      return documents;
    }
    for (index = 0, length = documents.length; index < length; index += 1) {
      iterator(documents[index]);
    }
  }
  function load(input, options) {
    var documents = loadDocuments(input, options);
    if (documents.length === 0) {
      return undefined;
    } else if (documents.length === 1) {
      return documents[0];
    }
    throw new YAMLException('expected a single document in the stream, but found more');
  }
  function safeLoadAll(input, output, options) {
    if (typeof output === 'function') {
      loadAll(input, output, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
    } else {
      return loadAll(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
    }
  }
  function safeLoad(input, options) {
    return load(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
  }
  module.exports.loadAll = loadAll;
  module.exports.load = load;
  module.exports.safeLoadAll = safeLoadAll;
  module.exports.safeLoad = safeLoad;
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/dumper.js', ['npm:js-yaml@3.9.1/lib/js-yaml/common.js', 'npm:js-yaml@3.9.1/lib/js-yaml/exception.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/default_full.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/default_safe.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var common = $__require('npm:js-yaml@3.9.1/lib/js-yaml/common.js');
  var YAMLException = $__require('npm:js-yaml@3.9.1/lib/js-yaml/exception.js');
  var DEFAULT_FULL_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/default_full.js');
  var DEFAULT_SAFE_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/default_safe.js');
  var _toString = Object.prototype.toString;
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var CHAR_TAB = 0x09;
  var CHAR_LINE_FEED = 0x0A;
  var CHAR_SPACE = 0x20;
  var CHAR_EXCLAMATION = 0x21;
  var CHAR_DOUBLE_QUOTE = 0x22;
  var CHAR_SHARP = 0x23;
  var CHAR_PERCENT = 0x25;
  var CHAR_AMPERSAND = 0x26;
  var CHAR_SINGLE_QUOTE = 0x27;
  var CHAR_ASTERISK = 0x2A;
  var CHAR_COMMA = 0x2C;
  var CHAR_MINUS = 0x2D;
  var CHAR_COLON = 0x3A;
  var CHAR_GREATER_THAN = 0x3E;
  var CHAR_QUESTION = 0x3F;
  var CHAR_COMMERCIAL_AT = 0x40;
  var CHAR_LEFT_SQUARE_BRACKET = 0x5B;
  var CHAR_RIGHT_SQUARE_BRACKET = 0x5D;
  var CHAR_GRAVE_ACCENT = 0x60;
  var CHAR_LEFT_CURLY_BRACKET = 0x7B;
  var CHAR_VERTICAL_LINE = 0x7C;
  var CHAR_RIGHT_CURLY_BRACKET = 0x7D;
  var ESCAPE_SEQUENCES = {};
  ESCAPE_SEQUENCES[0x00] = '\\0';
  ESCAPE_SEQUENCES[0x07] = '\\a';
  ESCAPE_SEQUENCES[0x08] = '\\b';
  ESCAPE_SEQUENCES[0x09] = '\\t';
  ESCAPE_SEQUENCES[0x0A] = '\\n';
  ESCAPE_SEQUENCES[0x0B] = '\\v';
  ESCAPE_SEQUENCES[0x0C] = '\\f';
  ESCAPE_SEQUENCES[0x0D] = '\\r';
  ESCAPE_SEQUENCES[0x1B] = '\\e';
  ESCAPE_SEQUENCES[0x22] = '\\"';
  ESCAPE_SEQUENCES[0x5C] = '\\\\';
  ESCAPE_SEQUENCES[0x85] = '\\N';
  ESCAPE_SEQUENCES[0xA0] = '\\_';
  ESCAPE_SEQUENCES[0x2028] = '\\L';
  ESCAPE_SEQUENCES[0x2029] = '\\P';
  var DEPRECATED_BOOLEANS_SYNTAX = ['y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON', 'n', 'N', 'no', 'No', 'NO', 'off', 'Off', 'OFF'];
  function compileStyleMap(schema, map) {
    var result, keys, index, length, tag, style, type;
    if (map === null) return {};
    result = {};
    keys = Object.keys(map);
    for (index = 0, length = keys.length; index < length; index += 1) {
      tag = keys[index];
      style = String(map[tag]);
      if (tag.slice(0, 2) === '!!') {
        tag = 'tag:yaml.org,2002:' + tag.slice(2);
      }
      type = schema.compiledTypeMap['fallback'][tag];
      if (type && _hasOwnProperty.call(type.styleAliases, style)) {
        style = type.styleAliases[style];
      }
      result[tag] = style;
    }
    return result;
  }
  function encodeHex(character) {
    var string, handle, length;
    string = character.toString(16).toUpperCase();
    if (character <= 0xFF) {
      handle = 'x';
      length = 2;
    } else if (character <= 0xFFFF) {
      handle = 'u';
      length = 4;
    } else if (character <= 0xFFFFFFFF) {
      handle = 'U';
      length = 8;
    } else {
      throw new YAMLException('code point within a string may not be greater than 0xFFFFFFFF');
    }
    return '\\' + handle + common.repeat('0', length - string.length) + string;
  }
  function State(options) {
    this.schema = options['schema'] || DEFAULT_FULL_SCHEMA;
    this.indent = Math.max(1, options['indent'] || 2);
    this.skipInvalid = options['skipInvalid'] || false;
    this.flowLevel = common.isNothing(options['flowLevel']) ? -1 : options['flowLevel'];
    this.styleMap = compileStyleMap(this.schema, options['styles'] || null);
    this.sortKeys = options['sortKeys'] || false;
    this.lineWidth = options['lineWidth'] || 80;
    this.noRefs = options['noRefs'] || false;
    this.noCompatMode = options['noCompatMode'] || false;
    this.condenseFlow = options['condenseFlow'] || false;
    this.implicitTypes = this.schema.compiledImplicit;
    this.explicitTypes = this.schema.compiledExplicit;
    this.tag = null;
    this.result = '';
    this.duplicates = [];
    this.usedDuplicates = null;
  }
  function indentString(string, spaces) {
    var ind = common.repeat(' ', spaces),
        position = 0,
        next = -1,
        result = '',
        line,
        length = string.length;
    while (position < length) {
      next = string.indexOf('\n', position);
      if (next === -1) {
        line = string.slice(position);
        position = length;
      } else {
        line = string.slice(position, next + 1);
        position = next + 1;
      }
      if (line.length && line !== '\n') result += ind;
      result += line;
    }
    return result;
  }
  function generateNextLine(state, level) {
    return '\n' + common.repeat(' ', state.indent * level);
  }
  function testImplicitResolving(state, str) {
    var index, length, type;
    for (index = 0, length = state.implicitTypes.length; index < length; index += 1) {
      type = state.implicitTypes[index];
      if (type.resolve(str)) {
        return true;
      }
    }
    return false;
  }
  function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
  }
  function isPrintable(c) {
    return 0x00020 <= c && c <= 0x00007E || 0x000A1 <= c && c <= 0x00D7FF && c !== 0x2028 && c !== 0x2029 || 0x0E000 <= c && c <= 0x00FFFD && c !== 0xFEFF || 0x10000 <= c && c <= 0x10FFFF;
  }
  function isPlainSafe(c) {
    return isPrintable(c) && c !== 0xFEFF && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_COLON && c !== CHAR_SHARP;
  }
  function isPlainSafeFirst(c) {
    return isPrintable(c) && c !== 0xFEFF && !isWhitespace(c) && c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
  }
  var STYLE_PLAIN = 1,
      STYLE_SINGLE = 2,
      STYLE_LITERAL = 3,
      STYLE_FOLDED = 4,
      STYLE_DOUBLE = 5;
  function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
    var i;
    var char;
    var hasLineBreak = false;
    var hasFoldableLine = false;
    var shouldTrackWidth = lineWidth !== -1;
    var previousLineBreak = -1;
    var plain = isPlainSafeFirst(string.charCodeAt(0)) && !isWhitespace(string.charCodeAt(string.length - 1));
    if (singleLineOnly) {
      for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        plain = plain && isPlainSafe(char);
      }
    } else {
      for (i = 0; i < string.length; i++) {
        char = string.charCodeAt(i);
        if (char === CHAR_LINE_FEED) {
          hasLineBreak = true;
          if (shouldTrackWidth) {
            hasFoldableLine = hasFoldableLine || i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== ' ';
            previousLineBreak = i;
          }
        } else if (!isPrintable(char)) {
          return STYLE_DOUBLE;
        }
        plain = plain && isPlainSafe(char);
      }
      hasFoldableLine = hasFoldableLine || shouldTrackWidth && i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== ' ';
    }
    if (!hasLineBreak && !hasFoldableLine) {
      return plain && !testAmbiguousType(string) ? STYLE_PLAIN : STYLE_SINGLE;
    }
    if (string[0] === ' ' && indentPerLevel > 9) {
      return STYLE_DOUBLE;
    }
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
  }
  function writeScalar(state, string, level, iskey) {
    state.dump = function () {
      if (string.length === 0) {
        return "''";
      }
      if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
        return "'" + string + "'";
      }
      var indent = state.indent * Math.max(1, level);
      var lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
      var singleLineOnly = iskey || state.flowLevel > -1 && level >= state.flowLevel;
      function testAmbiguity(string) {
        return testImplicitResolving(state, string);
      }
      switch (chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)) {
        case STYLE_PLAIN:
          return string;
        case STYLE_SINGLE:
          return "'" + string.replace(/'/g, "''") + "'";
        case STYLE_LITERAL:
          return '|' + blockHeader(string, state.indent) + dropEndingNewline(indentString(string, indent));
        case STYLE_FOLDED:
          return '>' + blockHeader(string, state.indent) + dropEndingNewline(indentString(foldString(string, lineWidth), indent));
        case STYLE_DOUBLE:
          return '"' + escapeString(string, lineWidth) + '"';
        default:
          throw new YAMLException('impossible error: invalid scalar style');
      }
    }();
  }
  function blockHeader(string, indentPerLevel) {
    var indentIndicator = string[0] === ' ' ? String(indentPerLevel) : '';
    var clip = string[string.length - 1] === '\n';
    var keep = clip && (string[string.length - 2] === '\n' || string === '\n');
    var chomp = keep ? '+' : clip ? '' : '-';
    return indentIndicator + chomp + '\n';
  }
  function dropEndingNewline(string) {
    return string[string.length - 1] === '\n' ? string.slice(0, -1) : string;
  }
  function foldString(string, width) {
    var lineRe = /(\n+)([^\n]*)/g;
    var result = function () {
      var nextLF = string.indexOf('\n');
      nextLF = nextLF !== -1 ? nextLF : string.length;
      lineRe.lastIndex = nextLF;
      return foldLine(string.slice(0, nextLF), width);
    }();
    var prevMoreIndented = string[0] === '\n' || string[0] === ' ';
    var moreIndented;
    var match;
    while (match = lineRe.exec(string)) {
      var prefix = match[1],
          line = match[2];
      moreIndented = line[0] === ' ';
      result += prefix + (!prevMoreIndented && !moreIndented && line !== '' ? '\n' : '') + foldLine(line, width);
      prevMoreIndented = moreIndented;
    }
    return result;
  }
  function foldLine(line, width) {
    if (line === '' || line[0] === ' ') return line;
    var breakRe = / [^ ]/g;
    var match;
    var start = 0,
        end,
        curr = 0,
        next = 0;
    var result = '';
    while (match = breakRe.exec(line)) {
      next = match.index;
      if (next - start > width) {
        end = curr > start ? curr : next;
        result += '\n' + line.slice(start, end);
        start = end + 1;
      }
      curr = next;
    }
    result += '\n';
    if (line.length - start > width && curr > start) {
      result += line.slice(start, curr) + '\n' + line.slice(curr + 1);
    } else {
      result += line.slice(start);
    }
    return result.slice(1);
  }
  function escapeString(string) {
    var result = '';
    var char;
    var escapeSeq;
    for (var i = 0; i < string.length; i++) {
      char = string.charCodeAt(i);
      escapeSeq = ESCAPE_SEQUENCES[char];
      result += !escapeSeq && isPrintable(char) ? string[i] : escapeSeq || encodeHex(char);
    }
    return result;
  }
  function writeFlowSequence(state, level, object) {
    var _result = '',
        _tag = state.tag,
        index,
        length;
    for (index = 0, length = object.length; index < length; index += 1) {
      if (writeNode(state, level, object[index], false, false)) {
        if (index !== 0) _result += ',' + (!state.condenseFlow ? ' ' : '');
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = '[' + _result + ']';
  }
  function writeBlockSequence(state, level, object, compact) {
    var _result = '',
        _tag = state.tag,
        index,
        length;
    for (index = 0, length = object.length; index < length; index += 1) {
      if (writeNode(state, level + 1, object[index], true, true)) {
        if (!compact || index !== 0) {
          _result += generateNextLine(state, level);
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          _result += '-';
        } else {
          _result += '- ';
        }
        _result += state.dump;
      }
    }
    state.tag = _tag;
    state.dump = _result || '[]';
  }
  function writeFlowMapping(state, level, object) {
    var _result = '',
        _tag = state.tag,
        objectKeyList = Object.keys(object),
        index,
        length,
        objectKey,
        objectValue,
        pairBuffer;
    for (index = 0, length = objectKeyList.length; index < length; index += 1) {
      pairBuffer = '';
      if (index !== 0) pairBuffer += ', ';
      objectKey = objectKeyList[index];
      objectValue = object[objectKey];
      if (!writeNode(state, level, objectKey, false, false)) {
        continue;
      }
      if (state.dump.length > 1024) pairBuffer += '? ';
      pairBuffer += state.dump + ':' + (state.condenseFlow ? '' : ' ');
      if (!writeNode(state, level, objectValue, false, false)) {
        continue;
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = '{' + _result + '}';
  }
  function writeBlockMapping(state, level, object, compact) {
    var _result = '',
        _tag = state.tag,
        objectKeyList = Object.keys(object),
        index,
        length,
        objectKey,
        objectValue,
        explicitPair,
        pairBuffer;
    if (state.sortKeys === true) {
      objectKeyList.sort();
    } else if (typeof state.sortKeys === 'function') {
      objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
      throw new YAMLException('sortKeys must be a boolean or a function');
    }
    for (index = 0, length = objectKeyList.length; index < length; index += 1) {
      pairBuffer = '';
      if (!compact || index !== 0) {
        pairBuffer += generateNextLine(state, level);
      }
      objectKey = objectKeyList[index];
      objectValue = object[objectKey];
      if (!writeNode(state, level + 1, objectKey, true, true, true)) {
        continue;
      }
      explicitPair = state.tag !== null && state.tag !== '?' || state.dump && state.dump.length > 1024;
      if (explicitPair) {
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
          pairBuffer += '?';
        } else {
          pairBuffer += '? ';
        }
      }
      pairBuffer += state.dump;
      if (explicitPair) {
        pairBuffer += generateNextLine(state, level);
      }
      if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
        continue;
      }
      if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
        pairBuffer += ':';
      } else {
        pairBuffer += ': ';
      }
      pairBuffer += state.dump;
      _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = _result || '{}';
  }
  function detectType(state, object, explicit) {
    var _result, typeList, index, length, type, style;
    typeList = explicit ? state.explicitTypes : state.implicitTypes;
    for (index = 0, length = typeList.length; index < length; index += 1) {
      type = typeList[index];
      if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === 'object' && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
        state.tag = explicit ? type.tag : '?';
        if (type.represent) {
          style = state.styleMap[type.tag] || type.defaultStyle;
          if (_toString.call(type.represent) === '[object Function]') {
            _result = type.represent(object, style);
          } else if (_hasOwnProperty.call(type.represent, style)) {
            _result = type.represent[style](object, style);
          } else {
            throw new YAMLException('!<' + type.tag + '> tag resolver accepts not "' + style + '" style');
          }
          state.dump = _result;
        }
        return true;
      }
    }
    return false;
  }
  function writeNode(state, level, object, block, compact, iskey) {
    state.tag = null;
    state.dump = object;
    if (!detectType(state, object, false)) {
      detectType(state, object, true);
    }
    var type = _toString.call(state.dump);
    if (block) {
      block = state.flowLevel < 0 || state.flowLevel > level;
    }
    var objectOrArray = type === '[object Object]' || type === '[object Array]',
        duplicateIndex,
        duplicate;
    if (objectOrArray) {
      duplicateIndex = state.duplicates.indexOf(object);
      duplicate = duplicateIndex !== -1;
    }
    if (state.tag !== null && state.tag !== '?' || duplicate || state.indent !== 2 && level > 0) {
      compact = false;
    }
    if (duplicate && state.usedDuplicates[duplicateIndex]) {
      state.dump = '*ref_' + duplicateIndex;
    } else {
      if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
        state.usedDuplicates[duplicateIndex] = true;
      }
      if (type === '[object Object]') {
        if (block && Object.keys(state.dump).length !== 0) {
          writeBlockMapping(state, level, state.dump, compact);
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + state.dump;
          }
        } else {
          writeFlowMapping(state, level, state.dump);
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
          }
        }
      } else if (type === '[object Array]') {
        if (block && state.dump.length !== 0) {
          writeBlockSequence(state, level, state.dump, compact);
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + state.dump;
          }
        } else {
          writeFlowSequence(state, level, state.dump);
          if (duplicate) {
            state.dump = '&ref_' + duplicateIndex + ' ' + state.dump;
          }
        }
      } else if (type === '[object String]') {
        if (state.tag !== '?') {
          writeScalar(state, state.dump, level, iskey);
        }
      } else {
        if (state.skipInvalid) return false;
        throw new YAMLException('unacceptable kind of an object to dump ' + type);
      }
      if (state.tag !== null && state.tag !== '?') {
        state.dump = '!<' + state.tag + '> ' + state.dump;
      }
    }
    return true;
  }
  function getDuplicateReferences(object, state) {
    var objects = [],
        duplicatesIndexes = [],
        index,
        length;
    inspectNode(object, objects, duplicatesIndexes);
    for (index = 0, length = duplicatesIndexes.length; index < length; index += 1) {
      state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = new Array(length);
  }
  function inspectNode(object, objects, duplicatesIndexes) {
    var objectKeyList, index, length;
    if (object !== null && typeof object === 'object') {
      index = objects.indexOf(object);
      if (index !== -1) {
        if (duplicatesIndexes.indexOf(index) === -1) {
          duplicatesIndexes.push(index);
        }
      } else {
        objects.push(object);
        if (Array.isArray(object)) {
          for (index = 0, length = object.length; index < length; index += 1) {
            inspectNode(object[index], objects, duplicatesIndexes);
          }
        } else {
          objectKeyList = Object.keys(object);
          for (index = 0, length = objectKeyList.length; index < length; index += 1) {
            inspectNode(object[objectKeyList[index]], objects, duplicatesIndexes);
          }
        }
      }
    }
  }
  function dump(input, options) {
    options = options || {};
    var state = new State(options);
    if (!state.noRefs) getDuplicateReferences(input, state);
    if (writeNode(state, 0, input, true, true)) return state.dump + '\n';
    return '';
  }
  function safeDump(input, options) {
    return dump(input, common.extend({ schema: DEFAULT_SAFE_SCHEMA }, options));
  }
  module.exports.dump = dump;
  module.exports.safeDump = safeDump;
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/schema.js', ['npm:js-yaml@3.9.1/lib/js-yaml/common.js', 'npm:js-yaml@3.9.1/lib/js-yaml/exception.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var common = $__require('npm:js-yaml@3.9.1/lib/js-yaml/common.js');
  var YAMLException = $__require('npm:js-yaml@3.9.1/lib/js-yaml/exception.js');
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  function compileList(schema, name, result) {
    var exclude = [];
    schema.include.forEach(function (includedSchema) {
      result = compileList(includedSchema, name, result);
    });
    schema[name].forEach(function (currentType) {
      result.forEach(function (previousType, previousIndex) {
        if (previousType.tag === currentType.tag && previousType.kind === currentType.kind) {
          exclude.push(previousIndex);
        }
      });
      result.push(currentType);
    });
    return result.filter(function (type, index) {
      return exclude.indexOf(index) === -1;
    });
  }
  function compileMap() {
    var result = {
      scalar: {},
      sequence: {},
      mapping: {},
      fallback: {}
    },
        index,
        length;
    function collectType(type) {
      result[type.kind][type.tag] = result['fallback'][type.tag] = type;
    }
    for (index = 0, length = arguments.length; index < length; index += 1) {
      arguments[index].forEach(collectType);
    }
    return result;
  }
  function Schema(definition) {
    this.include = definition.include || [];
    this.implicit = definition.implicit || [];
    this.explicit = definition.explicit || [];
    this.implicit.forEach(function (type) {
      if (type.loadKind && type.loadKind !== 'scalar') {
        throw new YAMLException('There is a non-scalar type in the implicit list of a schema. Implicit resolving of such types is not supported.');
      }
    });
    this.compiledImplicit = compileList(this, 'implicit', []);
    this.compiledExplicit = compileList(this, 'explicit', []);
    this.compiledTypeMap = compileMap(this.compiledImplicit, this.compiledExplicit);
  }
  Schema.DEFAULT = null;
  Schema.create = function createSchema() {
    var schemas, types;
    switch (arguments.length) {
      case 1:
        schemas = Schema.DEFAULT;
        types = arguments[0];
        break;
      case 2:
        schemas = arguments[0];
        types = arguments[1];
        break;
      default:
        throw new YAMLException('Wrong number of arguments for Schema.create function');
    }
    schemas = common.toArray(schemas);
    types = common.toArray(types);
    if (!schemas.every(function (schema) {
      return schema instanceof Schema;
    })) {
      throw new YAMLException('Specified list of super schemas (or a single Schema object) contains a non-Schema object.');
    }
    if (!types.every(function (type) {
      return type instanceof Type;
    })) {
      throw new YAMLException('Specified list of YAML types (or a single Type object) contains a non-Type object.');
    }
    return new Schema({
      include: schemas,
      explicit: types
    });
  };
  module.exports = Schema;
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/str.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  module.exports = new Type('tag:yaml.org,2002:str', {
    kind: 'scalar',
    construct: function (data) {
      return data !== null ? data : '';
    }
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/seq.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  module.exports = new Type('tag:yaml.org,2002:seq', {
    kind: 'sequence',
    construct: function (data) {
      return data !== null ? data : [];
    }
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/map.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  module.exports = new Type('tag:yaml.org,2002:map', {
    kind: 'mapping',
    construct: function (data) {
      return data !== null ? data : {};
    }
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/schema/failsafe.js', ['npm:js-yaml@3.9.1/lib/js-yaml/schema.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/str.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/seq.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/map.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Schema = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema.js');
  module.exports = new Schema({ explicit: [$__require('npm:js-yaml@3.9.1/lib/js-yaml/type/str.js'), $__require('npm:js-yaml@3.9.1/lib/js-yaml/type/seq.js'), $__require('npm:js-yaml@3.9.1/lib/js-yaml/type/map.js')] });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/null.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  function resolveYamlNull(data) {
    if (data === null) return true;
    var max = data.length;
    return max === 1 && data === '~' || max === 4 && (data === 'null' || data === 'Null' || data === 'NULL');
  }
  function constructYamlNull() {
    return null;
  }
  function isNull(object) {
    return object === null;
  }
  module.exports = new Type('tag:yaml.org,2002:null', {
    kind: 'scalar',
    resolve: resolveYamlNull,
    construct: constructYamlNull,
    predicate: isNull,
    represent: {
      canonical: function () {
        return '~';
      },
      lowercase: function () {
        return 'null';
      },
      uppercase: function () {
        return 'NULL';
      },
      camelcase: function () {
        return 'Null';
      }
    },
    defaultStyle: 'lowercase'
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/bool.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  function resolveYamlBoolean(data) {
    if (data === null) return false;
    var max = data.length;
    return max === 4 && (data === 'true' || data === 'True' || data === 'TRUE') || max === 5 && (data === 'false' || data === 'False' || data === 'FALSE');
  }
  function constructYamlBoolean(data) {
    return data === 'true' || data === 'True' || data === 'TRUE';
  }
  function isBoolean(object) {
    return Object.prototype.toString.call(object) === '[object Boolean]';
  }
  module.exports = new Type('tag:yaml.org,2002:bool', {
    kind: 'scalar',
    resolve: resolveYamlBoolean,
    construct: constructYamlBoolean,
    predicate: isBoolean,
    represent: {
      lowercase: function (object) {
        return object ? 'true' : 'false';
      },
      uppercase: function (object) {
        return object ? 'TRUE' : 'FALSE';
      },
      camelcase: function (object) {
        return object ? 'True' : 'False';
      }
    },
    defaultStyle: 'lowercase'
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/int.js', ['npm:js-yaml@3.9.1/lib/js-yaml/common.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var common = $__require('npm:js-yaml@3.9.1/lib/js-yaml/common.js');
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  function isHexCode(c) {
    return 0x30 <= c && c <= 0x39 || 0x41 <= c && c <= 0x46 || 0x61 <= c && c <= 0x66;
  }
  function isOctCode(c) {
    return 0x30 <= c && c <= 0x37;
  }
  function isDecCode(c) {
    return 0x30 <= c && c <= 0x39;
  }
  function resolveYamlInteger(data) {
    if (data === null) return false;
    var max = data.length,
        index = 0,
        hasDigits = false,
        ch;
    if (!max) return false;
    ch = data[index];
    if (ch === '-' || ch === '+') {
      ch = data[++index];
    }
    if (ch === '0') {
      if (index + 1 === max) return true;
      ch = data[++index];
      if (ch === 'b') {
        index++;
        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (ch !== '0' && ch !== '1') return false;
          hasDigits = true;
        }
        return hasDigits && ch !== '_';
      }
      if (ch === 'x') {
        index++;
        for (; index < max; index++) {
          ch = data[index];
          if (ch === '_') continue;
          if (!isHexCode(data.charCodeAt(index))) return false;
          hasDigits = true;
        }
        return hasDigits && ch !== '_';
      }
      for (; index < max; index++) {
        ch = data[index];
        if (ch === '_') continue;
        if (!isOctCode(data.charCodeAt(index))) return false;
        hasDigits = true;
      }
      return hasDigits && ch !== '_';
    }
    if (ch === '_') return false;
    for (; index < max; index++) {
      ch = data[index];
      if (ch === '_') continue;
      if (ch === ':') break;
      if (!isDecCode(data.charCodeAt(index))) {
        return false;
      }
      hasDigits = true;
    }
    if (!hasDigits || ch === '_') return false;
    if (ch !== ':') return true;
    return (/^(:[0-5]?[0-9])+$/.test(data.slice(index))
    );
  }
  function constructYamlInteger(data) {
    var value = data,
        sign = 1,
        ch,
        base,
        digits = [];
    if (value.indexOf('_') !== -1) {
      value = value.replace(/_/g, '');
    }
    ch = value[0];
    if (ch === '-' || ch === '+') {
      if (ch === '-') sign = -1;
      value = value.slice(1);
      ch = value[0];
    }
    if (value === '0') return 0;
    if (ch === '0') {
      if (value[1] === 'b') return sign * parseInt(value.slice(2), 2);
      if (value[1] === 'x') return sign * parseInt(value, 16);
      return sign * parseInt(value, 8);
    }
    if (value.indexOf(':') !== -1) {
      value.split(':').forEach(function (v) {
        digits.unshift(parseInt(v, 10));
      });
      value = 0;
      base = 1;
      digits.forEach(function (d) {
        value += d * base;
        base *= 60;
      });
      return sign * value;
    }
    return sign * parseInt(value, 10);
  }
  function isInteger(object) {
    return Object.prototype.toString.call(object) === '[object Number]' && object % 1 === 0 && !common.isNegativeZero(object);
  }
  module.exports = new Type('tag:yaml.org,2002:int', {
    kind: 'scalar',
    resolve: resolveYamlInteger,
    construct: constructYamlInteger,
    predicate: isInteger,
    represent: {
      binary: function (object) {
        return '0b' + object.toString(2);
      },
      octal: function (object) {
        return '0' + object.toString(8);
      },
      decimal: function (object) {
        return object.toString(10);
      },
      hexadecimal: function (object) {
        return '0x' + object.toString(16).toUpperCase();
      }
    },
    defaultStyle: 'decimal',
    styleAliases: {
      binary: [2, 'bin'],
      octal: [8, 'oct'],
      decimal: [10, 'dec'],
      hexadecimal: [16, 'hex']
    }
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/common.js', [], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  function isNothing(subject) {
    return typeof subject === 'undefined' || subject === null;
  }

  function isObject(subject) {
    return typeof subject === 'object' && subject !== null;
  }

  function toArray(sequence) {
    if (Array.isArray(sequence)) return sequence;else if (isNothing(sequence)) return [];

    return [sequence];
  }

  function extend(target, source) {
    var index, length, key, sourceKeys;

    if (source) {
      sourceKeys = Object.keys(source);

      for (index = 0, length = sourceKeys.length; index < length; index += 1) {
        key = sourceKeys[index];
        target[key] = source[key];
      }
    }

    return target;
  }

  function repeat(string, count) {
    var result = '',
        cycle;

    for (cycle = 0; cycle < count; cycle += 1) {
      result += string;
    }

    return result;
  }

  function isNegativeZero(number) {
    return number === 0 && Number.NEGATIVE_INFINITY === 1 / number;
  }

  module.exports.isNothing = isNothing;
  module.exports.isObject = isObject;
  module.exports.toArray = toArray;
  module.exports.repeat = repeat;
  module.exports.isNegativeZero = isNegativeZero;
  module.exports.extend = extend;
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/float.js', ['npm:js-yaml@3.9.1/lib/js-yaml/common.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var common = $__require('npm:js-yaml@3.9.1/lib/js-yaml/common.js');
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  var YAML_FLOAT_PATTERN = new RegExp('^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?' + '|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?' + '|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*' + '|[-+]?\\.(?:inf|Inf|INF)' + '|\\.(?:nan|NaN|NAN))$');
  function resolveYamlFloat(data) {
    if (data === null) return false;
    if (!YAML_FLOAT_PATTERN.test(data) || data[data.length - 1] === '_') {
      return false;
    }
    return true;
  }
  function constructYamlFloat(data) {
    var value, sign, base, digits;
    value = data.replace(/_/g, '').toLowerCase();
    sign = value[0] === '-' ? -1 : 1;
    digits = [];
    if ('+-'.indexOf(value[0]) >= 0) {
      value = value.slice(1);
    }
    if (value === '.inf') {
      return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    } else if (value === '.nan') {
      return NaN;
    } else if (value.indexOf(':') >= 0) {
      value.split(':').forEach(function (v) {
        digits.unshift(parseFloat(v, 10));
      });
      value = 0.0;
      base = 1;
      digits.forEach(function (d) {
        value += d * base;
        base *= 60;
      });
      return sign * value;
    }
    return sign * parseFloat(value, 10);
  }
  var SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
  function representYamlFloat(object, style) {
    var res;
    if (isNaN(object)) {
      switch (style) {
        case 'lowercase':
          return '.nan';
        case 'uppercase':
          return '.NAN';
        case 'camelcase':
          return '.NaN';
      }
    } else if (Number.POSITIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase':
          return '.inf';
        case 'uppercase':
          return '.INF';
        case 'camelcase':
          return '.Inf';
      }
    } else if (Number.NEGATIVE_INFINITY === object) {
      switch (style) {
        case 'lowercase':
          return '-.inf';
        case 'uppercase':
          return '-.INF';
        case 'camelcase':
          return '-.Inf';
      }
    } else if (common.isNegativeZero(object)) {
      return '-0.0';
    }
    res = object.toString(10);
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace('e', '.e') : res;
  }
  function isFloat(object) {
    return Object.prototype.toString.call(object) === '[object Number]' && (object % 1 !== 0 || common.isNegativeZero(object));
  }
  module.exports = new Type('tag:yaml.org,2002:float', {
    kind: 'scalar',
    resolve: resolveYamlFloat,
    construct: constructYamlFloat,
    predicate: isFloat,
    represent: representYamlFloat,
    defaultStyle: 'lowercase'
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/schema/json.js', ['npm:js-yaml@3.9.1/lib/js-yaml/schema.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/failsafe.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/null.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/bool.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/int.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/float.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Schema = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema.js');
  module.exports = new Schema({
    include: [$__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/failsafe.js')],
    implicit: [$__require('npm:js-yaml@3.9.1/lib/js-yaml/type/null.js'), $__require('npm:js-yaml@3.9.1/lib/js-yaml/type/bool.js'), $__require('npm:js-yaml@3.9.1/lib/js-yaml/type/int.js'), $__require('npm:js-yaml@3.9.1/lib/js-yaml/type/float.js')]
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/schema/core.js', ['npm:js-yaml@3.9.1/lib/js-yaml/schema.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/json.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Schema = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema.js');
  module.exports = new Schema({ include: [$__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/json.js')] });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/timestamp.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  var YAML_DATE_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + '-([0-9][0-9])' + '-([0-9][0-9])$');
  var YAML_TIMESTAMP_REGEXP = new RegExp('^([0-9][0-9][0-9][0-9])' + '-([0-9][0-9]?)' + '-([0-9][0-9]?)' + '(?:[Tt]|[ \\t]+)' + '([0-9][0-9]?)' + ':([0-9][0-9])' + ':([0-9][0-9])' + '(?:\\.([0-9]*))?' + '(?:[ \\t]*(Z|([-+])([0-9][0-9]?)' + '(?::([0-9][0-9]))?))?$');
  function resolveYamlTimestamp(data) {
    if (data === null) return false;
    if (YAML_DATE_REGEXP.exec(data) !== null) return true;
    if (YAML_TIMESTAMP_REGEXP.exec(data) !== null) return true;
    return false;
  }
  function constructYamlTimestamp(data) {
    var match,
        year,
        month,
        day,
        hour,
        minute,
        second,
        fraction = 0,
        delta = null,
        tz_hour,
        tz_minute,
        date;
    match = YAML_DATE_REGEXP.exec(data);
    if (match === null) match = YAML_TIMESTAMP_REGEXP.exec(data);
    if (match === null) throw new Error('Date resolve error');
    year = +match[1];
    month = +match[2] - 1;
    day = +match[3];
    if (!match[4]) {
      return new Date(Date.UTC(year, month, day));
    }
    hour = +match[4];
    minute = +match[5];
    second = +match[6];
    if (match[7]) {
      fraction = match[7].slice(0, 3);
      while (fraction.length < 3) {
        fraction += '0';
      }
      fraction = +fraction;
    }
    if (match[9]) {
      tz_hour = +match[10];
      tz_minute = +(match[11] || 0);
      delta = (tz_hour * 60 + tz_minute) * 60000;
      if (match[9] === '-') delta = -delta;
    }
    date = new Date(Date.UTC(year, month, day, hour, minute, second, fraction));
    if (delta) date.setTime(date.getTime() - delta);
    return date;
  }
  function representYamlTimestamp(object) {
    return object.toISOString();
  }
  module.exports = new Type('tag:yaml.org,2002:timestamp', {
    kind: 'scalar',
    resolve: resolveYamlTimestamp,
    construct: constructYamlTimestamp,
    instanceOf: Date,
    represent: representYamlTimestamp
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/merge.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  function resolveYamlMerge(data) {
    return data === '<<' || data === null;
  }
  module.exports = new Type('tag:yaml.org,2002:merge', {
    kind: 'scalar',
    resolve: resolveYamlMerge
  });
});
System.registerDynamic('npm:base64-js@1.2.1/index.js', [], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  exports.byteLength = byteLength;
  exports.toByteArray = toByteArray;
  exports.fromByteArray = fromByteArray;

  var lookup = [];
  var revLookup = [];
  var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  for (var i = 0, len = code.length; i < len; ++i) {
    lookup[i] = code[i];
    revLookup[code.charCodeAt(i)] = i;
  }

  revLookup['-'.charCodeAt(0)] = 62;
  revLookup['_'.charCodeAt(0)] = 63;

  function placeHoldersCount(b64) {
    var len = b64.length;
    if (len % 4 > 0) {
      throw new Error('Invalid string. Length must be a multiple of 4');
    }

    // the number of equal signs (place holders)
    // if there are two placeholders, than the two characters before it
    // represent one byte
    // if there is only one, then the three characters before it represent 2 bytes
    // this is just a cheap hack to not do indexOf twice
    return b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;
  }

  function byteLength(b64) {
    // base64 is 4/3 + up to two characters of the original data
    return b64.length * 3 / 4 - placeHoldersCount(b64);
  }

  function toByteArray(b64) {
    var i, l, tmp, placeHolders, arr;
    var len = b64.length;
    placeHolders = placeHoldersCount(b64);

    arr = new Arr(len * 3 / 4 - placeHolders);

    // if there are placeholders, only get up to the last complete 4 chars
    l = placeHolders > 0 ? len - 4 : len;

    var L = 0;

    for (i = 0; i < l; i += 4) {
      tmp = revLookup[b64.charCodeAt(i)] << 18 | revLookup[b64.charCodeAt(i + 1)] << 12 | revLookup[b64.charCodeAt(i + 2)] << 6 | revLookup[b64.charCodeAt(i + 3)];
      arr[L++] = tmp >> 16 & 0xFF;
      arr[L++] = tmp >> 8 & 0xFF;
      arr[L++] = tmp & 0xFF;
    }

    if (placeHolders === 2) {
      tmp = revLookup[b64.charCodeAt(i)] << 2 | revLookup[b64.charCodeAt(i + 1)] >> 4;
      arr[L++] = tmp & 0xFF;
    } else if (placeHolders === 1) {
      tmp = revLookup[b64.charCodeAt(i)] << 10 | revLookup[b64.charCodeAt(i + 1)] << 4 | revLookup[b64.charCodeAt(i + 2)] >> 2;
      arr[L++] = tmp >> 8 & 0xFF;
      arr[L++] = tmp & 0xFF;
    }

    return arr;
  }

  function tripletToBase64(num) {
    return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F];
  }

  function encodeChunk(uint8, start, end) {
    var tmp;
    var output = [];
    for (var i = start; i < end; i += 3) {
      tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + uint8[i + 2];
      output.push(tripletToBase64(tmp));
    }
    return output.join('');
  }

  function fromByteArray(uint8) {
    var tmp;
    var len = uint8.length;
    var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
    var output = '';
    var parts = [];
    var maxChunkLength = 16383; // must be multiple of 3

    // go through the array every three bytes, we'll deal with trailing stuff later
    for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
      parts.push(encodeChunk(uint8, i, i + maxChunkLength > len2 ? len2 : i + maxChunkLength));
    }

    // pad the end with zeros, but make sure to not forget the extra bytes
    if (extraBytes === 1) {
      tmp = uint8[len - 1];
      output += lookup[tmp >> 2];
      output += lookup[tmp << 4 & 0x3F];
      output += '==';
    } else if (extraBytes === 2) {
      tmp = (uint8[len - 2] << 8) + uint8[len - 1];
      output += lookup[tmp >> 10];
      output += lookup[tmp >> 4 & 0x3F];
      output += lookup[tmp << 2 & 0x3F];
      output += '=';
    }

    parts.push(output);

    return parts.join('');
  }
});
System.registerDynamic("npm:base64-js@1.2.1.js", ["npm:base64-js@1.2.1/index.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = $__require("npm:base64-js@1.2.1/index.js");
});
System.registerDynamic("npm:ieee754@1.1.8/index.js", [], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  exports.read = function (buffer, offset, isLE, mLen, nBytes) {
    var e, m;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var nBits = -7;
    var i = isLE ? nBytes - 1 : 0;
    var d = isLE ? -1 : 1;
    var s = buffer[offset + i];

    i += d;

    e = s & (1 << -nBits) - 1;
    s >>= -nBits;
    nBits += eLen;
    for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    m = e & (1 << -nBits) - 1;
    e >>= -nBits;
    nBits += mLen;
    for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

    if (e === 0) {
      e = 1 - eBias;
    } else if (e === eMax) {
      return m ? NaN : (s ? -1 : 1) * Infinity;
    } else {
      m = m + Math.pow(2, mLen);
      e = e - eBias;
    }
    return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
  };

  exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
    var e, m, c;
    var eLen = nBytes * 8 - mLen - 1;
    var eMax = (1 << eLen) - 1;
    var eBias = eMax >> 1;
    var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
    var i = isLE ? 0 : nBytes - 1;
    var d = isLE ? 1 : -1;
    var s = value < 0 || value === 0 && 1 / value < 0 ? 1 : 0;

    value = Math.abs(value);

    if (isNaN(value) || value === Infinity) {
      m = isNaN(value) ? 1 : 0;
      e = eMax;
    } else {
      e = Math.floor(Math.log(value) / Math.LN2);
      if (value * (c = Math.pow(2, -e)) < 1) {
        e--;
        c *= 2;
      }
      if (e + eBias >= 1) {
        value += rt / c;
      } else {
        value += rt * Math.pow(2, 1 - eBias);
      }
      if (value * c >= 2) {
        e++;
        c /= 2;
      }

      if (e + eBias >= eMax) {
        m = 0;
        e = eMax;
      } else if (e + eBias >= 1) {
        m = (value * c - 1) * Math.pow(2, mLen);
        e = e + eBias;
      } else {
        m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
        e = 0;
      }
    }

    for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

    e = e << mLen | m;
    eLen += mLen;
    for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

    buffer[offset + i - d] |= s * 128;
  };
});
System.registerDynamic("npm:ieee754@1.1.8.js", ["npm:ieee754@1.1.8/index.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = $__require("npm:ieee754@1.1.8/index.js");
});
System.registerDynamic('npm:buffer@5.0.7/index.js', ['npm:base64-js@1.2.1.js', 'npm:ieee754@1.1.8.js'], true, function ($__require, exports, module) {
  /*!
   * The buffer module from node.js, for the browser.
   *
   * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
   * @license  MIT
   */
  /* eslint-disable no-proto */

  'use strict';

  var global = this || self,
      GLOBAL = global;
  var base64 = $__require('npm:base64-js@1.2.1.js');
  var ieee754 = $__require('npm:ieee754@1.1.8.js');

  exports.Buffer = Buffer;
  exports.SlowBuffer = SlowBuffer;
  exports.INSPECT_MAX_BYTES = 50;

  var K_MAX_LENGTH = 0x7fffffff;
  exports.kMaxLength = K_MAX_LENGTH;

  /**
   * If `Buffer.TYPED_ARRAY_SUPPORT`:
   *   === true    Use Uint8Array implementation (fastest)
   *   === false   Print warning and recommend using `buffer` v4.x which has an Object
   *               implementation (most compatible, even IE6)
   *
   * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
   * Opera 11.6+, iOS 4.2+.
   *
   * We report that the browser does not support typed arrays if the are not subclassable
   * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
   * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
   * for __proto__ and has a buggy typed array implementation.
   */
  Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

  if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== 'undefined' && typeof console.error === 'function') {
    console.error('This browser lacks typed array (Uint8Array) support which is required by ' + '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.');
  }

  function typedArraySupport() {
    // Can typed array instances can be augmented?
    try {
      var arr = new Uint8Array(1);
      arr.__proto__ = { __proto__: Uint8Array.prototype, foo: function () {
          return 42;
        } };
      return arr.foo() === 42;
    } catch (e) {
      return false;
    }
  }

  function createBuffer(length) {
    if (length > K_MAX_LENGTH) {
      throw new RangeError('Invalid typed array length');
    }
    // Return an augmented `Uint8Array` instance
    var buf = new Uint8Array(length);
    buf.__proto__ = Buffer.prototype;
    return buf;
  }

  /**
   * The Buffer constructor returns instances of `Uint8Array` that have their
   * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
   * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
   * and the `Uint8Array` methods. Square bracket notation works as expected -- it
   * returns a single octet.
   *
   * The `Uint8Array` prototype remains unmodified.
   */

  function Buffer(arg, encodingOrOffset, length) {
    // Common case.
    if (typeof arg === 'number') {
      if (typeof encodingOrOffset === 'string') {
        throw new Error('If encoding is specified then the first argument must be a string');
      }
      return allocUnsafe(arg);
    }
    return from(arg, encodingOrOffset, length);
  }

  // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
  if (typeof Symbol !== 'undefined' && Symbol.species && Buffer[Symbol.species] === Buffer) {
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true,
      enumerable: false,
      writable: false
    });
  }

  Buffer.poolSize = 8192; // not used by this implementation

  function from(value, encodingOrOffset, length) {
    if (typeof value === 'number') {
      throw new TypeError('"value" argument must not be a number');
    }

    if (isArrayBuffer(value)) {
      return fromArrayBuffer(value, encodingOrOffset, length);
    }

    if (typeof value === 'string') {
      return fromString(value, encodingOrOffset);
    }

    return fromObject(value);
  }

  /**
   * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
   * if value is a number.
   * Buffer.from(str[, encoding])
   * Buffer.from(array)
   * Buffer.from(buffer)
   * Buffer.from(arrayBuffer[, byteOffset[, length]])
   **/
  Buffer.from = function (value, encodingOrOffset, length) {
    return from(value, encodingOrOffset, length);
  };

  // Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
  // https://github.com/feross/buffer/pull/148
  Buffer.prototype.__proto__ = Uint8Array.prototype;
  Buffer.__proto__ = Uint8Array;

  function assertSize(size) {
    if (typeof size !== 'number') {
      throw new TypeError('"size" argument must be a number');
    } else if (size < 0) {
      throw new RangeError('"size" argument must not be negative');
    }
  }

  function alloc(size, fill, encoding) {
    assertSize(size);
    if (size <= 0) {
      return createBuffer(size);
    }
    if (fill !== undefined) {
      // Only pay attention to encoding if it's a string. This
      // prevents accidentally sending in a number that would
      // be interpretted as a start offset.
      return typeof encoding === 'string' ? createBuffer(size).fill(fill, encoding) : createBuffer(size).fill(fill);
    }
    return createBuffer(size);
  }

  /**
   * Creates a new filled Buffer instance.
   * alloc(size[, fill[, encoding]])
   **/
  Buffer.alloc = function (size, fill, encoding) {
    return alloc(size, fill, encoding);
  };

  function allocUnsafe(size) {
    assertSize(size);
    return createBuffer(size < 0 ? 0 : checked(size) | 0);
  }

  /**
   * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
   * */
  Buffer.allocUnsafe = function (size) {
    return allocUnsafe(size);
  };
  /**
   * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
   */
  Buffer.allocUnsafeSlow = function (size) {
    return allocUnsafe(size);
  };

  function fromString(string, encoding) {
    if (typeof encoding !== 'string' || encoding === '') {
      encoding = 'utf8';
    }

    if (!Buffer.isEncoding(encoding)) {
      throw new TypeError('"encoding" must be a valid string encoding');
    }

    var length = byteLength(string, encoding) | 0;
    var buf = createBuffer(length);

    var actual = buf.write(string, encoding);

    if (actual !== length) {
      // Writing a hex string, for example, that contains invalid characters will
      // cause everything after the first invalid character to be ignored. (e.g.
      // 'abxxcd' will be treated as 'ab')
      buf = buf.slice(0, actual);
    }

    return buf;
  }

  function fromArrayLike(array) {
    var length = array.length < 0 ? 0 : checked(array.length) | 0;
    var buf = createBuffer(length);
    for (var i = 0; i < length; i += 1) {
      buf[i] = array[i] & 255;
    }
    return buf;
  }

  function fromArrayBuffer(array, byteOffset, length) {
    if (byteOffset < 0 || array.byteLength < byteOffset) {
      throw new RangeError('\'offset\' is out of bounds');
    }

    if (array.byteLength < byteOffset + (length || 0)) {
      throw new RangeError('\'length\' is out of bounds');
    }

    var buf;
    if (byteOffset === undefined && length === undefined) {
      buf = new Uint8Array(array);
    } else if (length === undefined) {
      buf = new Uint8Array(array, byteOffset);
    } else {
      buf = new Uint8Array(array, byteOffset, length);
    }

    // Return an augmented `Uint8Array` instance
    buf.__proto__ = Buffer.prototype;
    return buf;
  }

  function fromObject(obj) {
    if (Buffer.isBuffer(obj)) {
      var len = checked(obj.length) | 0;
      var buf = createBuffer(len);

      if (buf.length === 0) {
        return buf;
      }

      obj.copy(buf, 0, 0, len);
      return buf;
    }

    if (obj) {
      if (isArrayBufferView(obj) || 'length' in obj) {
        if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
          return createBuffer(0);
        }
        return fromArrayLike(obj);
      }

      if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
        return fromArrayLike(obj.data);
      }
    }

    throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.');
  }

  function checked(length) {
    // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
    // length is NaN (which is otherwise coerced to zero.)
    if (length >= K_MAX_LENGTH) {
      throw new RangeError('Attempt to allocate Buffer larger than maximum ' + 'size: 0x' + K_MAX_LENGTH.toString(16) + ' bytes');
    }
    return length | 0;
  }

  function SlowBuffer(length) {
    if (+length != length) {
      // eslint-disable-line eqeqeq
      length = 0;
    }
    return Buffer.alloc(+length);
  }

  Buffer.isBuffer = function isBuffer(b) {
    return b != null && b._isBuffer === true;
  };

  Buffer.compare = function compare(a, b) {
    if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
      throw new TypeError('Arguments must be Buffers');
    }

    if (a === b) return 0;

    var x = a.length;
    var y = b.length;

    for (var i = 0, len = Math.min(x, y); i < len; ++i) {
      if (a[i] !== b[i]) {
        x = a[i];
        y = b[i];
        break;
      }
    }

    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
  };

  Buffer.isEncoding = function isEncoding(encoding) {
    switch (String(encoding).toLowerCase()) {
      case 'hex':
      case 'utf8':
      case 'utf-8':
      case 'ascii':
      case 'latin1':
      case 'binary':
      case 'base64':
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return true;
      default:
        return false;
    }
  };

  Buffer.concat = function concat(list, length) {
    if (!Array.isArray(list)) {
      throw new TypeError('"list" argument must be an Array of Buffers');
    }

    if (list.length === 0) {
      return Buffer.alloc(0);
    }

    var i;
    if (length === undefined) {
      length = 0;
      for (i = 0; i < list.length; ++i) {
        length += list[i].length;
      }
    }

    var buffer = Buffer.allocUnsafe(length);
    var pos = 0;
    for (i = 0; i < list.length; ++i) {
      var buf = list[i];
      if (!Buffer.isBuffer(buf)) {
        throw new TypeError('"list" argument must be an Array of Buffers');
      }
      buf.copy(buffer, pos);
      pos += buf.length;
    }
    return buffer;
  };

  function byteLength(string, encoding) {
    if (Buffer.isBuffer(string)) {
      return string.length;
    }
    if (isArrayBufferView(string) || isArrayBuffer(string)) {
      return string.byteLength;
    }
    if (typeof string !== 'string') {
      string = '' + string;
    }

    var len = string.length;
    if (len === 0) return 0;

    // Use a for loop to avoid recursion
    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'ascii':
        case 'latin1':
        case 'binary':
          return len;
        case 'utf8':
        case 'utf-8':
        case undefined:
          return utf8ToBytes(string).length;
        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return len * 2;
        case 'hex':
          return len >>> 1;
        case 'base64':
          return base64ToBytes(string).length;
        default:
          if (loweredCase) return utf8ToBytes(string).length; // assume utf8
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  }
  Buffer.byteLength = byteLength;

  function slowToString(encoding, start, end) {
    var loweredCase = false;

    // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
    // property of a typed array.

    // This behaves neither like String nor Uint8Array in that we set start/end
    // to their upper/lower bounds if the value passed is out of range.
    // undefined is handled specially as per ECMA-262 6th Edition,
    // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
    if (start === undefined || start < 0) {
      start = 0;
    }
    // Return early if start > this.length. Done here to prevent potential uint32
    // coercion fail below.
    if (start > this.length) {
      return '';
    }

    if (end === undefined || end > this.length) {
      end = this.length;
    }

    if (end <= 0) {
      return '';
    }

    // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
    end >>>= 0;
    start >>>= 0;

    if (end <= start) {
      return '';
    }

    if (!encoding) encoding = 'utf8';

    while (true) {
      switch (encoding) {
        case 'hex':
          return hexSlice(this, start, end);

        case 'utf8':
        case 'utf-8':
          return utf8Slice(this, start, end);

        case 'ascii':
          return asciiSlice(this, start, end);

        case 'latin1':
        case 'binary':
          return latin1Slice(this, start, end);

        case 'base64':
          return base64Slice(this, start, end);

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return utf16leSlice(this, start, end);

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
          encoding = (encoding + '').toLowerCase();
          loweredCase = true;
      }
    }
  }

  // This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
  // to detect a Buffer instance. It's not possible to use `instanceof Buffer`
  // reliably in a browserify context because there could be multiple different
  // copies of the 'buffer' package in use. This method works even for Buffer
  // instances that were created from another copy of the `buffer` package.
  // See: https://github.com/feross/buffer/issues/154
  Buffer.prototype._isBuffer = true;

  function swap(b, n, m) {
    var i = b[n];
    b[n] = b[m];
    b[m] = i;
  }

  Buffer.prototype.swap16 = function swap16() {
    var len = this.length;
    if (len % 2 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 16-bits');
    }
    for (var i = 0; i < len; i += 2) {
      swap(this, i, i + 1);
    }
    return this;
  };

  Buffer.prototype.swap32 = function swap32() {
    var len = this.length;
    if (len % 4 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 32-bits');
    }
    for (var i = 0; i < len; i += 4) {
      swap(this, i, i + 3);
      swap(this, i + 1, i + 2);
    }
    return this;
  };

  Buffer.prototype.swap64 = function swap64() {
    var len = this.length;
    if (len % 8 !== 0) {
      throw new RangeError('Buffer size must be a multiple of 64-bits');
    }
    for (var i = 0; i < len; i += 8) {
      swap(this, i, i + 7);
      swap(this, i + 1, i + 6);
      swap(this, i + 2, i + 5);
      swap(this, i + 3, i + 4);
    }
    return this;
  };

  Buffer.prototype.toString = function toString() {
    var length = this.length;
    if (length === 0) return '';
    if (arguments.length === 0) return utf8Slice(this, 0, length);
    return slowToString.apply(this, arguments);
  };

  Buffer.prototype.equals = function equals(b) {
    if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
    if (this === b) return true;
    return Buffer.compare(this, b) === 0;
  };

  Buffer.prototype.inspect = function inspect() {
    var str = '';
    var max = exports.INSPECT_MAX_BYTES;
    if (this.length > 0) {
      str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
      if (this.length > max) str += ' ... ';
    }
    return '<Buffer ' + str + '>';
  };

  Buffer.prototype.compare = function compare(target, start, end, thisStart, thisEnd) {
    if (!Buffer.isBuffer(target)) {
      throw new TypeError('Argument must be a Buffer');
    }

    if (start === undefined) {
      start = 0;
    }
    if (end === undefined) {
      end = target ? target.length : 0;
    }
    if (thisStart === undefined) {
      thisStart = 0;
    }
    if (thisEnd === undefined) {
      thisEnd = this.length;
    }

    if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
      throw new RangeError('out of range index');
    }

    if (thisStart >= thisEnd && start >= end) {
      return 0;
    }
    if (thisStart >= thisEnd) {
      return -1;
    }
    if (start >= end) {
      return 1;
    }

    start >>>= 0;
    end >>>= 0;
    thisStart >>>= 0;
    thisEnd >>>= 0;

    if (this === target) return 0;

    var x = thisEnd - thisStart;
    var y = end - start;
    var len = Math.min(x, y);

    var thisCopy = this.slice(thisStart, thisEnd);
    var targetCopy = target.slice(start, end);

    for (var i = 0; i < len; ++i) {
      if (thisCopy[i] !== targetCopy[i]) {
        x = thisCopy[i];
        y = targetCopy[i];
        break;
      }
    }

    if (x < y) return -1;
    if (y < x) return 1;
    return 0;
  };

  // Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
  // OR the last index of `val` in `buffer` at offset <= `byteOffset`.
  //
  // Arguments:
  // - buffer - a Buffer to search
  // - val - a string, Buffer, or number
  // - byteOffset - an index into `buffer`; will be clamped to an int32
  // - encoding - an optional encoding, relevant is val is a string
  // - dir - true for indexOf, false for lastIndexOf
  function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
    // Empty buffer means no match
    if (buffer.length === 0) return -1;

    // Normalize byteOffset
    if (typeof byteOffset === 'string') {
      encoding = byteOffset;
      byteOffset = 0;
    } else if (byteOffset > 0x7fffffff) {
      byteOffset = 0x7fffffff;
    } else if (byteOffset < -0x80000000) {
      byteOffset = -0x80000000;
    }
    byteOffset = +byteOffset; // Coerce to Number.
    if (numberIsNaN(byteOffset)) {
      // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
      byteOffset = dir ? 0 : buffer.length - 1;
    }

    // Normalize byteOffset: negative offsets start from the end of the buffer
    if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
    if (byteOffset >= buffer.length) {
      if (dir) return -1;else byteOffset = buffer.length - 1;
    } else if (byteOffset < 0) {
      if (dir) byteOffset = 0;else return -1;
    }

    // Normalize val
    if (typeof val === 'string') {
      val = Buffer.from(val, encoding);
    }

    // Finally, search either indexOf (if dir is true) or lastIndexOf
    if (Buffer.isBuffer(val)) {
      // Special case: looking for empty string/buffer always fails
      if (val.length === 0) {
        return -1;
      }
      return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
    } else if (typeof val === 'number') {
      val = val & 0xFF; // Search for a byte value [0-255]
      if (typeof Uint8Array.prototype.indexOf === 'function') {
        if (dir) {
          return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
        } else {
          return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
        }
      }
      return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
    }

    throw new TypeError('val must be string, number or Buffer');
  }

  function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
    var indexSize = 1;
    var arrLength = arr.length;
    var valLength = val.length;

    if (encoding !== undefined) {
      encoding = String(encoding).toLowerCase();
      if (encoding === 'ucs2' || encoding === 'ucs-2' || encoding === 'utf16le' || encoding === 'utf-16le') {
        if (arr.length < 2 || val.length < 2) {
          return -1;
        }
        indexSize = 2;
        arrLength /= 2;
        valLength /= 2;
        byteOffset /= 2;
      }
    }

    function read(buf, i) {
      if (indexSize === 1) {
        return buf[i];
      } else {
        return buf.readUInt16BE(i * indexSize);
      }
    }

    var i;
    if (dir) {
      var foundIndex = -1;
      for (i = byteOffset; i < arrLength; i++) {
        if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
          if (foundIndex === -1) foundIndex = i;
          if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
        } else {
          if (foundIndex !== -1) i -= i - foundIndex;
          foundIndex = -1;
        }
      }
    } else {
      if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
      for (i = byteOffset; i >= 0; i--) {
        var found = true;
        for (var j = 0; j < valLength; j++) {
          if (read(arr, i + j) !== read(val, j)) {
            found = false;
            break;
          }
        }
        if (found) return i;
      }
    }

    return -1;
  }

  Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
    return this.indexOf(val, byteOffset, encoding) !== -1;
  };

  Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
  };

  Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
    return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
  };

  function hexWrite(buf, string, offset, length) {
    offset = Number(offset) || 0;
    var remaining = buf.length - offset;
    if (!length) {
      length = remaining;
    } else {
      length = Number(length);
      if (length > remaining) {
        length = remaining;
      }
    }

    // must be an even number of digits
    var strLen = string.length;
    if (strLen % 2 !== 0) throw new TypeError('Invalid hex string');

    if (length > strLen / 2) {
      length = strLen / 2;
    }
    for (var i = 0; i < length; ++i) {
      var parsed = parseInt(string.substr(i * 2, 2), 16);
      if (numberIsNaN(parsed)) return i;
      buf[offset + i] = parsed;
    }
    return i;
  }

  function utf8Write(buf, string, offset, length) {
    return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length);
  }

  function asciiWrite(buf, string, offset, length) {
    return blitBuffer(asciiToBytes(string), buf, offset, length);
  }

  function latin1Write(buf, string, offset, length) {
    return asciiWrite(buf, string, offset, length);
  }

  function base64Write(buf, string, offset, length) {
    return blitBuffer(base64ToBytes(string), buf, offset, length);
  }

  function ucs2Write(buf, string, offset, length) {
    return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length);
  }

  Buffer.prototype.write = function write(string, offset, length, encoding) {
    // Buffer#write(string)
    if (offset === undefined) {
      encoding = 'utf8';
      length = this.length;
      offset = 0;
      // Buffer#write(string, encoding)
    } else if (length === undefined && typeof offset === 'string') {
      encoding = offset;
      length = this.length;
      offset = 0;
      // Buffer#write(string, offset[, length][, encoding])
    } else if (isFinite(offset)) {
      offset = offset >>> 0;
      if (isFinite(length)) {
        length = length >>> 0;
        if (encoding === undefined) encoding = 'utf8';
      } else {
        encoding = length;
        length = undefined;
      }
    } else {
      throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
    }

    var remaining = this.length - offset;
    if (length === undefined || length > remaining) length = remaining;

    if (string.length > 0 && (length < 0 || offset < 0) || offset > this.length) {
      throw new RangeError('Attempt to write outside buffer bounds');
    }

    if (!encoding) encoding = 'utf8';

    var loweredCase = false;
    for (;;) {
      switch (encoding) {
        case 'hex':
          return hexWrite(this, string, offset, length);

        case 'utf8':
        case 'utf-8':
          return utf8Write(this, string, offset, length);

        case 'ascii':
          return asciiWrite(this, string, offset, length);

        case 'latin1':
        case 'binary':
          return latin1Write(this, string, offset, length);

        case 'base64':
          // Warning: maxLength not taken into account in base64Write
          return base64Write(this, string, offset, length);

        case 'ucs2':
        case 'ucs-2':
        case 'utf16le':
        case 'utf-16le':
          return ucs2Write(this, string, offset, length);

        default:
          if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
          encoding = ('' + encoding).toLowerCase();
          loweredCase = true;
      }
    }
  };

  Buffer.prototype.toJSON = function toJSON() {
    return {
      type: 'Buffer',
      data: Array.prototype.slice.call(this._arr || this, 0)
    };
  };

  function base64Slice(buf, start, end) {
    if (start === 0 && end === buf.length) {
      return base64.fromByteArray(buf);
    } else {
      return base64.fromByteArray(buf.slice(start, end));
    }
  }

  function utf8Slice(buf, start, end) {
    end = Math.min(buf.length, end);
    var res = [];

    var i = start;
    while (i < end) {
      var firstByte = buf[i];
      var codePoint = null;
      var bytesPerSequence = firstByte > 0xEF ? 4 : firstByte > 0xDF ? 3 : firstByte > 0xBF ? 2 : 1;

      if (i + bytesPerSequence <= end) {
        var secondByte, thirdByte, fourthByte, tempCodePoint;

        switch (bytesPerSequence) {
          case 1:
            if (firstByte < 0x80) {
              codePoint = firstByte;
            }
            break;
          case 2:
            secondByte = buf[i + 1];
            if ((secondByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0x1F) << 0x6 | secondByte & 0x3F;
              if (tempCodePoint > 0x7F) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 3:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | thirdByte & 0x3F;
              if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
                codePoint = tempCodePoint;
              }
            }
            break;
          case 4:
            secondByte = buf[i + 1];
            thirdByte = buf[i + 2];
            fourthByte = buf[i + 3];
            if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
              tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | fourthByte & 0x3F;
              if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
                codePoint = tempCodePoint;
              }
            }
        }
      }

      if (codePoint === null) {
        // we did not generate a valid codePoint so insert a
        // replacement char (U+FFFD) and advance only 1 byte
        codePoint = 0xFFFD;
        bytesPerSequence = 1;
      } else if (codePoint > 0xFFFF) {
        // encode to utf16 (surrogate pair dance)
        codePoint -= 0x10000;
        res.push(codePoint >>> 10 & 0x3FF | 0xD800);
        codePoint = 0xDC00 | codePoint & 0x3FF;
      }

      res.push(codePoint);
      i += bytesPerSequence;
    }

    return decodeCodePointsArray(res);
  }

  // Based on http://stackoverflow.com/a/22747272/680742, the browser with
  // the lowest limit is Chrome, with 0x10000 args.
  // We go 1 magnitude less, for safety
  var MAX_ARGUMENTS_LENGTH = 0x1000;

  function decodeCodePointsArray(codePoints) {
    var len = codePoints.length;
    if (len <= MAX_ARGUMENTS_LENGTH) {
      return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
    }

    // Decode in chunks to avoid "call stack size exceeded".
    var res = '';
    var i = 0;
    while (i < len) {
      res += String.fromCharCode.apply(String, codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH));
    }
    return res;
  }

  function asciiSlice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i] & 0x7F);
    }
    return ret;
  }

  function latin1Slice(buf, start, end) {
    var ret = '';
    end = Math.min(buf.length, end);

    for (var i = start; i < end; ++i) {
      ret += String.fromCharCode(buf[i]);
    }
    return ret;
  }

  function hexSlice(buf, start, end) {
    var len = buf.length;

    if (!start || start < 0) start = 0;
    if (!end || end < 0 || end > len) end = len;

    var out = '';
    for (var i = start; i < end; ++i) {
      out += toHex(buf[i]);
    }
    return out;
  }

  function utf16leSlice(buf, start, end) {
    var bytes = buf.slice(start, end);
    var res = '';
    for (var i = 0; i < bytes.length; i += 2) {
      res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
    }
    return res;
  }

  Buffer.prototype.slice = function slice(start, end) {
    var len = this.length;
    start = ~~start;
    end = end === undefined ? len : ~~end;

    if (start < 0) {
      start += len;
      if (start < 0) start = 0;
    } else if (start > len) {
      start = len;
    }

    if (end < 0) {
      end += len;
      if (end < 0) end = 0;
    } else if (end > len) {
      end = len;
    }

    if (end < start) end = start;

    var newBuf = this.subarray(start, end);
    // Return an augmented `Uint8Array` instance
    newBuf.__proto__ = Buffer.prototype;
    return newBuf;
  };

  /*
   * Need to make sure that buffer isn't trying to write out of bounds.
   */
  function checkOffset(offset, ext, length) {
    if (offset % 1 !== 0 || offset < 0) throw new RangeError('offset is not uint');
    if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length');
  }

  Buffer.prototype.readUIntLE = function readUIntLE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }

    return val;
  };

  Buffer.prototype.readUIntBE = function readUIntBE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
      checkOffset(offset, byteLength, this.length);
    }

    var val = this[offset + --byteLength];
    var mul = 1;
    while (byteLength > 0 && (mul *= 0x100)) {
      val += this[offset + --byteLength] * mul;
    }

    return val;
  };

  Buffer.prototype.readUInt8 = function readUInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 1, this.length);
    return this[offset];
  };

  Buffer.prototype.readUInt16LE = function readUInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] | this[offset + 1] << 8;
  };

  Buffer.prototype.readUInt16BE = function readUInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    return this[offset] << 8 | this[offset + 1];
  };

  Buffer.prototype.readUInt32LE = function readUInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);

    return (this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16) + this[offset + 3] * 0x1000000;
  };

  Buffer.prototype.readUInt32BE = function readUInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);

    return this[offset] * 0x1000000 + (this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3]);
  };

  Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var val = this[offset];
    var mul = 1;
    var i = 0;
    while (++i < byteLength && (mul *= 0x100)) {
      val += this[offset + i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val;
  };

  Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) checkOffset(offset, byteLength, this.length);

    var i = byteLength;
    var mul = 1;
    var val = this[offset + --i];
    while (i > 0 && (mul *= 0x100)) {
      val += this[offset + --i] * mul;
    }
    mul *= 0x80;

    if (val >= mul) val -= Math.pow(2, 8 * byteLength);

    return val;
  };

  Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 1, this.length);
    if (!(this[offset] & 0x80)) return this[offset];
    return (0xff - this[offset] + 1) * -1;
  };

  Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset] | this[offset + 1] << 8;
    return val & 0x8000 ? val | 0xFFFF0000 : val;
  };

  Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 2, this.length);
    var val = this[offset + 1] | this[offset] << 8;
    return val & 0x8000 ? val | 0xFFFF0000 : val;
  };

  Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);

    return this[offset] | this[offset + 1] << 8 | this[offset + 2] << 16 | this[offset + 3] << 24;
  };

  Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);

    return this[offset] << 24 | this[offset + 1] << 16 | this[offset + 2] << 8 | this[offset + 3];
  };

  Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, true, 23, 4);
  };

  Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 4, this.length);
    return ieee754.read(this, offset, false, 23, 4);
  };

  Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, true, 52, 8);
  };

  Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
    offset = offset >>> 0;
    if (!noAssert) checkOffset(offset, 8, this.length);
    return ieee754.read(this, offset, false, 52, 8);
  };

  function checkInt(buf, value, offset, ext, max, min) {
    if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance');
    if (value > max || value < min) throw new RangeError('"value" argument is out of bounds');
    if (offset + ext > buf.length) throw new RangeError('Index out of range');
  }

  Buffer.prototype.writeUIntLE = function writeUIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var mul = 1;
    var i = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      this[offset + i] = value / mul & 0xFF;
    }

    return offset + byteLength;
  };

  Buffer.prototype.writeUIntBE = function writeUIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    byteLength = byteLength >>> 0;
    if (!noAssert) {
      var maxBytes = Math.pow(2, 8 * byteLength) - 1;
      checkInt(this, value, offset, byteLength, maxBytes, 0);
    }

    var i = byteLength - 1;
    var mul = 1;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      this[offset + i] = value / mul & 0xFF;
    }

    return offset + byteLength;
  };

  Buffer.prototype.writeUInt8 = function writeUInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
    this[offset] = value & 0xff;
    return offset + 1;
  };

  Buffer.prototype.writeUInt16LE = function writeUInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };

  Buffer.prototype.writeUInt16BE = function writeUInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
    return offset + 2;
  };

  Buffer.prototype.writeUInt32LE = function writeUInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset + 3] = value >>> 24;
    this[offset + 2] = value >>> 16;
    this[offset + 1] = value >>> 8;
    this[offset] = value & 0xff;
    return offset + 4;
  };

  Buffer.prototype.writeUInt32BE = function writeUInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
    return offset + 4;
  };

  Buffer.prototype.writeIntLE = function writeIntLE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = 0;
    var mul = 1;
    var sub = 0;
    this[offset] = value & 0xFF;
    while (++i < byteLength && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = (value / mul >> 0) - sub & 0xFF;
    }

    return offset + byteLength;
  };

  Buffer.prototype.writeIntBE = function writeIntBE(value, offset, byteLength, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      var limit = Math.pow(2, 8 * byteLength - 1);

      checkInt(this, value, offset, byteLength, limit - 1, -limit);
    }

    var i = byteLength - 1;
    var mul = 1;
    var sub = 0;
    this[offset + i] = value & 0xFF;
    while (--i >= 0 && (mul *= 0x100)) {
      if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
        sub = 1;
      }
      this[offset + i] = (value / mul >> 0) - sub & 0xFF;
    }

    return offset + byteLength;
  };

  Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
    if (value < 0) value = 0xff + value + 1;
    this[offset] = value & 0xff;
    return offset + 1;
  };

  Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    return offset + 2;
  };

  Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
    this[offset] = value >>> 8;
    this[offset + 1] = value & 0xff;
    return offset + 2;
  };

  Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    this[offset] = value & 0xff;
    this[offset + 1] = value >>> 8;
    this[offset + 2] = value >>> 16;
    this[offset + 3] = value >>> 24;
    return offset + 4;
  };

  Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
    if (value < 0) value = 0xffffffff + value + 1;
    this[offset] = value >>> 24;
    this[offset + 1] = value >>> 16;
    this[offset + 2] = value >>> 8;
    this[offset + 3] = value & 0xff;
    return offset + 4;
  };

  function checkIEEE754(buf, value, offset, ext, max, min) {
    if (offset + ext > buf.length) throw new RangeError('Index out of range');
    if (offset < 0) throw new RangeError('Index out of range');
  }

  function writeFloat(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
    }
    ieee754.write(buf, value, offset, littleEndian, 23, 4);
    return offset + 4;
  }

  Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
    return writeFloat(this, value, offset, true, noAssert);
  };

  Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
    return writeFloat(this, value, offset, false, noAssert);
  };

  function writeDouble(buf, value, offset, littleEndian, noAssert) {
    value = +value;
    offset = offset >>> 0;
    if (!noAssert) {
      checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
    }
    ieee754.write(buf, value, offset, littleEndian, 52, 8);
    return offset + 8;
  }

  Buffer.prototype.writeDoubleLE = function writeDoubleLE(value, offset, noAssert) {
    return writeDouble(this, value, offset, true, noAssert);
  };

  Buffer.prototype.writeDoubleBE = function writeDoubleBE(value, offset, noAssert) {
    return writeDouble(this, value, offset, false, noAssert);
  };

  // copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
  Buffer.prototype.copy = function copy(target, targetStart, start, end) {
    if (!start) start = 0;
    if (!end && end !== 0) end = this.length;
    if (targetStart >= target.length) targetStart = target.length;
    if (!targetStart) targetStart = 0;
    if (end > 0 && end < start) end = start;

    // Copy 0 bytes; we're done
    if (end === start) return 0;
    if (target.length === 0 || this.length === 0) return 0;

    // Fatal error conditions
    if (targetStart < 0) {
      throw new RangeError('targetStart out of bounds');
    }
    if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
    if (end < 0) throw new RangeError('sourceEnd out of bounds');

    // Are we oob?
    if (end > this.length) end = this.length;
    if (target.length - targetStart < end - start) {
      end = target.length - targetStart + start;
    }

    var len = end - start;
    var i;

    if (this === target && start < targetStart && targetStart < end) {
      // descending copy from end
      for (i = len - 1; i >= 0; --i) {
        target[i + targetStart] = this[i + start];
      }
    } else if (len < 1000) {
      // ascending copy from start
      for (i = 0; i < len; ++i) {
        target[i + targetStart] = this[i + start];
      }
    } else {
      Uint8Array.prototype.set.call(target, this.subarray(start, start + len), targetStart);
    }

    return len;
  };

  // Usage:
  //    buffer.fill(number[, offset[, end]])
  //    buffer.fill(buffer[, offset[, end]])
  //    buffer.fill(string[, offset[, end]][, encoding])
  Buffer.prototype.fill = function fill(val, start, end, encoding) {
    // Handle string cases:
    if (typeof val === 'string') {
      if (typeof start === 'string') {
        encoding = start;
        start = 0;
        end = this.length;
      } else if (typeof end === 'string') {
        encoding = end;
        end = this.length;
      }
      if (val.length === 1) {
        var code = val.charCodeAt(0);
        if (code < 256) {
          val = code;
        }
      }
      if (encoding !== undefined && typeof encoding !== 'string') {
        throw new TypeError('encoding must be a string');
      }
      if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
        throw new TypeError('Unknown encoding: ' + encoding);
      }
    } else if (typeof val === 'number') {
      val = val & 255;
    }

    // Invalid ranges are not set to a default, so can range check early.
    if (start < 0 || this.length < start || this.length < end) {
      throw new RangeError('Out of range index');
    }

    if (end <= start) {
      return this;
    }

    start = start >>> 0;
    end = end === undefined ? this.length : end >>> 0;

    if (!val) val = 0;

    var i;
    if (typeof val === 'number') {
      for (i = start; i < end; ++i) {
        this[i] = val;
      }
    } else {
      var bytes = Buffer.isBuffer(val) ? val : new Buffer(val, encoding);
      var len = bytes.length;
      for (i = 0; i < end - start; ++i) {
        this[i + start] = bytes[i % len];
      }
    }

    return this;
  };

  // HELPER FUNCTIONS
  // ================

  var INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

  function base64clean(str) {
    // Node strips out invalid characters like \n and \t from the string, base64-js does not
    str = str.trim().replace(INVALID_BASE64_RE, '');
    // Node converts strings with length < 2 to ''
    if (str.length < 2) return '';
    // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
    while (str.length % 4 !== 0) {
      str = str + '=';
    }
    return str;
  }

  function toHex(n) {
    if (n < 16) return '0' + n.toString(16);
    return n.toString(16);
  }

  function utf8ToBytes(string, units) {
    units = units || Infinity;
    var codePoint;
    var length = string.length;
    var leadSurrogate = null;
    var bytes = [];

    for (var i = 0; i < length; ++i) {
      codePoint = string.charCodeAt(i);

      // is surrogate component
      if (codePoint > 0xD7FF && codePoint < 0xE000) {
        // last char was a lead
        if (!leadSurrogate) {
          // no lead yet
          if (codePoint > 0xDBFF) {
            // unexpected trail
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue;
          } else if (i + 1 === length) {
            // unpaired lead
            if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
            continue;
          }

          // valid lead
          leadSurrogate = codePoint;

          continue;
        }

        // 2 leads in a row
        if (codePoint < 0xDC00) {
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
          leadSurrogate = codePoint;
          continue;
        }

        // valid surrogate pair
        codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
      } else if (leadSurrogate) {
        // valid bmp char, but last char was a lead
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
      }

      leadSurrogate = null;

      // encode utf8
      if (codePoint < 0x80) {
        if ((units -= 1) < 0) break;
        bytes.push(codePoint);
      } else if (codePoint < 0x800) {
        if ((units -= 2) < 0) break;
        bytes.push(codePoint >> 0x6 | 0xC0, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x10000) {
        if ((units -= 3) < 0) break;
        bytes.push(codePoint >> 0xC | 0xE0, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else if (codePoint < 0x110000) {
        if ((units -= 4) < 0) break;
        bytes.push(codePoint >> 0x12 | 0xF0, codePoint >> 0xC & 0x3F | 0x80, codePoint >> 0x6 & 0x3F | 0x80, codePoint & 0x3F | 0x80);
      } else {
        throw new Error('Invalid code point');
      }
    }

    return bytes;
  }

  function asciiToBytes(str) {
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      // Node's code seems to be doing this and not & 0x7F..
      byteArray.push(str.charCodeAt(i) & 0xFF);
    }
    return byteArray;
  }

  function utf16leToBytes(str, units) {
    var c, hi, lo;
    var byteArray = [];
    for (var i = 0; i < str.length; ++i) {
      if ((units -= 2) < 0) break;

      c = str.charCodeAt(i);
      hi = c >> 8;
      lo = c % 256;
      byteArray.push(lo);
      byteArray.push(hi);
    }

    return byteArray;
  }

  function base64ToBytes(str) {
    return base64.toByteArray(base64clean(str));
  }

  function blitBuffer(src, dst, offset, length) {
    for (var i = 0; i < length; ++i) {
      if (i + offset >= dst.length || i >= src.length) break;
      dst[i + offset] = src[i];
    }
    return i;
  }

  // ArrayBuffers from another context (i.e. an iframe) do not pass the `instanceof` check
  // but they should be treated as valid. See: https://github.com/feross/buffer/issues/166
  function isArrayBuffer(obj) {
    return obj instanceof ArrayBuffer || obj != null && obj.constructor != null && obj.constructor.name === 'ArrayBuffer' && typeof obj.byteLength === 'number';
  }

  // Node 0.10 supports `ArrayBuffer` but lacks `ArrayBuffer.isView`
  function isArrayBufferView(obj) {
    return typeof ArrayBuffer.isView === 'function' && ArrayBuffer.isView(obj);
  }

  function numberIsNaN(obj) {
    return obj !== obj; // eslint-disable-line no-self-compare
  }
});
System.registerDynamic("npm:buffer@5.0.7.js", ["npm:buffer@5.0.7/index.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = $__require("npm:buffer@5.0.7/index.js");
});
System.registerDynamic('github:jspm/nodelibs-buffer@0.1.1/index.js', ['npm:buffer@5.0.7.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  module.exports = System._nodeRequire ? System._nodeRequire('buffer') : $__require('npm:buffer@5.0.7.js');
});
System.registerDynamic("github:jspm/nodelibs-buffer@0.1.1.js", ["github:jspm/nodelibs-buffer@0.1.1/index.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = $__require("github:jspm/nodelibs-buffer@0.1.1/index.js");
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/binary.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js', 'github:jspm/nodelibs-buffer@0.1.1.js'], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  /* */
  (function (Buffer) {
    'use strict';

    var NodeBuffer;
    try {
      var _require = $__require;
      NodeBuffer = _require('buffer').Buffer;
    } catch (__) {}
    var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
    var BASE64_MAP = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=\n\r';
    function resolveYamlBinary(data) {
      if (data === null) return false;
      var code,
          idx,
          bitlen = 0,
          max = data.length,
          map = BASE64_MAP;
      for (idx = 0; idx < max; idx++) {
        code = map.indexOf(data.charAt(idx));
        if (code > 64) continue;
        if (code < 0) return false;
        bitlen += 6;
      }
      return bitlen % 8 === 0;
    }
    function constructYamlBinary(data) {
      var idx,
          tailbits,
          input = data.replace(/[\r\n=]/g, ''),
          max = input.length,
          map = BASE64_MAP,
          bits = 0,
          result = [];
      for (idx = 0; idx < max; idx++) {
        if (idx % 4 === 0 && idx) {
          result.push(bits >> 16 & 0xFF);
          result.push(bits >> 8 & 0xFF);
          result.push(bits & 0xFF);
        }
        bits = bits << 6 | map.indexOf(input.charAt(idx));
      }
      tailbits = max % 4 * 6;
      if (tailbits === 0) {
        result.push(bits >> 16 & 0xFF);
        result.push(bits >> 8 & 0xFF);
        result.push(bits & 0xFF);
      } else if (tailbits === 18) {
        result.push(bits >> 10 & 0xFF);
        result.push(bits >> 2 & 0xFF);
      } else if (tailbits === 12) {
        result.push(bits >> 4 & 0xFF);
      }
      if (NodeBuffer) {
        return NodeBuffer.from ? NodeBuffer.from(result) : new NodeBuffer(result);
      }
      return result;
    }
    function representYamlBinary(object) {
      var result = '',
          bits = 0,
          idx,
          tail,
          max = object.length,
          map = BASE64_MAP;
      for (idx = 0; idx < max; idx++) {
        if (idx % 3 === 0 && idx) {
          result += map[bits >> 18 & 0x3F];
          result += map[bits >> 12 & 0x3F];
          result += map[bits >> 6 & 0x3F];
          result += map[bits & 0x3F];
        }
        bits = (bits << 8) + object[idx];
      }
      tail = max % 3;
      if (tail === 0) {
        result += map[bits >> 18 & 0x3F];
        result += map[bits >> 12 & 0x3F];
        result += map[bits >> 6 & 0x3F];
        result += map[bits & 0x3F];
      } else if (tail === 2) {
        result += map[bits >> 10 & 0x3F];
        result += map[bits >> 4 & 0x3F];
        result += map[bits << 2 & 0x3F];
        result += map[64];
      } else if (tail === 1) {
        result += map[bits >> 2 & 0x3F];
        result += map[bits << 4 & 0x3F];
        result += map[64];
        result += map[64];
      }
      return result;
    }
    function isBinary(object) {
      return NodeBuffer && NodeBuffer.isBuffer(object);
    }
    module.exports = new Type('tag:yaml.org,2002:binary', {
      kind: 'scalar',
      resolve: resolveYamlBinary,
      construct: constructYamlBinary,
      predicate: isBinary,
      represent: representYamlBinary
    });
  })($__require('github:jspm/nodelibs-buffer@0.1.1.js').Buffer);
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/omap.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  var _toString = Object.prototype.toString;
  function resolveYamlOmap(data) {
    if (data === null) return true;
    var objectKeys = [],
        index,
        length,
        pair,
        pairKey,
        pairHasKey,
        object = data;
    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      pairHasKey = false;
      if (_toString.call(pair) !== '[object Object]') return false;
      for (pairKey in pair) {
        if (_hasOwnProperty.call(pair, pairKey)) {
          if (!pairHasKey) pairHasKey = true;else return false;
        }
      }
      if (!pairHasKey) return false;
      if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);else return false;
    }
    return true;
  }
  function constructYamlOmap(data) {
    return data !== null ? data : [];
  }
  module.exports = new Type('tag:yaml.org,2002:omap', {
    kind: 'sequence',
    resolve: resolveYamlOmap,
    construct: constructYamlOmap
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/pairs.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  var _toString = Object.prototype.toString;
  function resolveYamlPairs(data) {
    if (data === null) return true;
    var index,
        length,
        pair,
        keys,
        result,
        object = data;
    result = new Array(object.length);
    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      if (_toString.call(pair) !== '[object Object]') return false;
      keys = Object.keys(pair);
      if (keys.length !== 1) return false;
      result[index] = [keys[0], pair[keys[0]]];
    }
    return true;
  }
  function constructYamlPairs(data) {
    if (data === null) return [];
    var index,
        length,
        pair,
        keys,
        result,
        object = data;
    result = new Array(object.length);
    for (index = 0, length = object.length; index < length; index += 1) {
      pair = object[index];
      keys = Object.keys(pair);
      result[index] = [keys[0], pair[keys[0]]];
    }
    return result;
  }
  module.exports = new Type('tag:yaml.org,2002:pairs', {
    kind: 'sequence',
    resolve: resolveYamlPairs,
    construct: constructYamlPairs
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/set.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  var _hasOwnProperty = Object.prototype.hasOwnProperty;
  function resolveYamlSet(data) {
    if (data === null) return true;
    var key,
        object = data;
    for (key in object) {
      if (_hasOwnProperty.call(object, key)) {
        if (object[key] !== null) return false;
      }
    }
    return true;
  }
  function constructYamlSet(data) {
    return data !== null ? data : {};
  }
  module.exports = new Type('tag:yaml.org,2002:set', {
    kind: 'mapping',
    resolve: resolveYamlSet,
    construct: constructYamlSet
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/schema/default_safe.js', ['npm:js-yaml@3.9.1/lib/js-yaml/schema.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/core.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/timestamp.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/merge.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/binary.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/omap.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/pairs.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/set.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Schema = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema.js');
  module.exports = new Schema({
    include: [$__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/core.js')],
    implicit: [$__require('npm:js-yaml@3.9.1/lib/js-yaml/type/timestamp.js'), $__require('npm:js-yaml@3.9.1/lib/js-yaml/type/merge.js')],
    explicit: [$__require('npm:js-yaml@3.9.1/lib/js-yaml/type/binary.js'), $__require('npm:js-yaml@3.9.1/lib/js-yaml/type/omap.js'), $__require('npm:js-yaml@3.9.1/lib/js-yaml/type/pairs.js'), $__require('npm:js-yaml@3.9.1/lib/js-yaml/type/set.js')]
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/js/undefined.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  function resolveJavascriptUndefined() {
    return true;
  }
  function constructJavascriptUndefined() {
    return undefined;
  }
  function representJavascriptUndefined() {
    return '';
  }
  function isUndefined(object) {
    return typeof object === 'undefined';
  }
  module.exports = new Type('tag:yaml.org,2002:js/undefined', {
    kind: 'scalar',
    resolve: resolveJavascriptUndefined,
    construct: constructJavascriptUndefined,
    predicate: isUndefined,
    represent: representJavascriptUndefined
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/js/regexp.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  function resolveJavascriptRegExp(data) {
    if (data === null) return false;
    if (data.length === 0) return false;
    var regexp = data,
        tail = /\/([gim]*)$/.exec(data),
        modifiers = '';
    if (regexp[0] === '/') {
      if (tail) modifiers = tail[1];
      if (modifiers.length > 3) return false;
      if (regexp[regexp.length - modifiers.length - 1] !== '/') return false;
    }
    return true;
  }
  function constructJavascriptRegExp(data) {
    var regexp = data,
        tail = /\/([gim]*)$/.exec(data),
        modifiers = '';
    if (regexp[0] === '/') {
      if (tail) modifiers = tail[1];
      regexp = regexp.slice(1, regexp.length - modifiers.length - 1);
    }
    return new RegExp(regexp, modifiers);
  }
  function representJavascriptRegExp(object) {
    var result = '/' + object.source + '/';
    if (object.global) result += 'g';
    if (object.multiline) result += 'm';
    if (object.ignoreCase) result += 'i';
    return result;
  }
  function isRegExp(object) {
    return Object.prototype.toString.call(object) === '[object RegExp]';
  }
  module.exports = new Type('tag:yaml.org,2002:js/regexp', {
    kind: 'scalar',
    resolve: resolveJavascriptRegExp,
    construct: constructJavascriptRegExp,
    predicate: isRegExp,
    represent: representJavascriptRegExp
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type.js', ['npm:js-yaml@3.9.1/lib/js-yaml/exception.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var YAMLException = $__require('npm:js-yaml@3.9.1/lib/js-yaml/exception.js');
  var TYPE_CONSTRUCTOR_OPTIONS = ['kind', 'resolve', 'construct', 'instanceOf', 'predicate', 'represent', 'defaultStyle', 'styleAliases'];
  var YAML_NODE_KINDS = ['scalar', 'sequence', 'mapping'];
  function compileStyleAliases(map) {
    var result = {};
    if (map !== null) {
      Object.keys(map).forEach(function (style) {
        map[style].forEach(function (alias) {
          result[String(alias)] = style;
        });
      });
    }
    return result;
  }
  function Type(tag, options) {
    options = options || {};
    Object.keys(options).forEach(function (name) {
      if (TYPE_CONSTRUCTOR_OPTIONS.indexOf(name) === -1) {
        throw new YAMLException('Unknown option "' + name + '" is met in definition of "' + tag + '" YAML type.');
      }
    });
    this.tag = tag;
    this.kind = options['kind'] || null;
    this.resolve = options['resolve'] || function () {
      return true;
    };
    this.construct = options['construct'] || function (data) {
      return data;
    };
    this.instanceOf = options['instanceOf'] || null;
    this.predicate = options['predicate'] || null;
    this.represent = options['represent'] || null;
    this.defaultStyle = options['defaultStyle'] || null;
    this.styleAliases = compileStyleAliases(options['styleAliases'] || null);
    if (YAML_NODE_KINDS.indexOf(this.kind) === -1) {
      throw new YAMLException('Unknown kind "' + this.kind + '" is specified for "' + tag + '" YAML type.');
    }
  }
  module.exports = Type;
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/type/js/function.js', ['npm:js-yaml@3.9.1/lib/js-yaml/type.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var esprima;
  try {
    var _require = $__require;
    esprima = _require('esprima');
  } catch (_) {
    if (typeof window !== 'undefined') esprima = window.esprima;
  }
  var Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  function resolveJavascriptFunction(data) {
    if (data === null) return false;
    try {
      var source = '(' + data + ')',
          ast = esprima.parse(source, { range: true });
      if (ast.type !== 'Program' || ast.body.length !== 1 || ast.body[0].type !== 'ExpressionStatement' || ast.body[0].expression.type !== 'FunctionExpression') {
        return false;
      }
      return true;
    } catch (err) {
      return false;
    }
  }
  function constructJavascriptFunction(data) {
    var source = '(' + data + ')',
        ast = esprima.parse(source, { range: true }),
        params = [],
        body;
    if (ast.type !== 'Program' || ast.body.length !== 1 || ast.body[0].type !== 'ExpressionStatement' || ast.body[0].expression.type !== 'FunctionExpression') {
      throw new Error('Failed to resolve function');
    }
    ast.body[0].expression.params.forEach(function (param) {
      params.push(param.name);
    });
    body = ast.body[0].expression.body.range;
    return new Function(params, source.slice(body[0] + 1, body[1] - 1));
  }
  function representJavascriptFunction(object) {
    return object.toString();
  }
  function isFunction(object) {
    return Object.prototype.toString.call(object) === '[object Function]';
  }
  module.exports = new Type('tag:yaml.org,2002:js/function', {
    kind: 'scalar',
    resolve: resolveJavascriptFunction,
    construct: constructJavascriptFunction,
    predicate: isFunction,
    represent: representJavascriptFunction
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/schema/default_full.js', ['npm:js-yaml@3.9.1/lib/js-yaml/schema.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/default_safe.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/js/undefined.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/js/regexp.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type/js/function.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var Schema = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema.js');
  module.exports = Schema.DEFAULT = new Schema({
    include: [$__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/default_safe.js')],
    explicit: [$__require('npm:js-yaml@3.9.1/lib/js-yaml/type/js/undefined.js'), $__require('npm:js-yaml@3.9.1/lib/js-yaml/type/js/regexp.js'), $__require('npm:js-yaml@3.9.1/lib/js-yaml/type/js/function.js')]
  });
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml/exception.js', [], true, function ($__require, exports, module) {
  // YAML error class. http://stackoverflow.com/questions/8458984
  //
  'use strict';

  var global = this || self,
      GLOBAL = global;
  function YAMLException(reason, mark) {
    // Super constructor
    Error.call(this);

    this.name = 'YAMLException';
    this.reason = reason;
    this.mark = mark;
    this.message = (this.reason || '(unknown reason)') + (this.mark ? ' ' + this.mark.toString() : '');

    // Include stack trace in error object
    if (Error.captureStackTrace) {
      // Chrome and NodeJS
      Error.captureStackTrace(this, this.constructor);
    } else {
      // FF, IE 10+ and Safari 6+. Fallback for others
      this.stack = new Error().stack || '';
    }
  }

  // Inherit from Error
  YAMLException.prototype = Object.create(Error.prototype);
  YAMLException.prototype.constructor = YAMLException;

  YAMLException.prototype.toString = function toString(compact) {
    var result = this.name + ': ';

    result += this.reason || '(unknown reason)';

    if (!compact && this.mark) {
      result += ' ' + this.mark.toString();
    }

    return result;
  };

  module.exports = YAMLException;
});
System.registerDynamic('npm:js-yaml@3.9.1/lib/js-yaml.js', ['npm:js-yaml@3.9.1/lib/js-yaml/loader.js', 'npm:js-yaml@3.9.1/lib/js-yaml/dumper.js', 'npm:js-yaml@3.9.1/lib/js-yaml/type.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/failsafe.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/json.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/core.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/default_safe.js', 'npm:js-yaml@3.9.1/lib/js-yaml/schema/default_full.js', 'npm:js-yaml@3.9.1/lib/js-yaml/exception.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var loader = $__require('npm:js-yaml@3.9.1/lib/js-yaml/loader.js');
  var dumper = $__require('npm:js-yaml@3.9.1/lib/js-yaml/dumper.js');
  function deprecated(name) {
    return function () {
      throw new Error('Function ' + name + ' is deprecated and cannot be used.');
    };
  }
  module.exports.Type = $__require('npm:js-yaml@3.9.1/lib/js-yaml/type.js');
  module.exports.Schema = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema.js');
  module.exports.FAILSAFE_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/failsafe.js');
  module.exports.JSON_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/json.js');
  module.exports.CORE_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/core.js');
  module.exports.DEFAULT_SAFE_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/default_safe.js');
  module.exports.DEFAULT_FULL_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/default_full.js');
  module.exports.load = loader.load;
  module.exports.loadAll = loader.loadAll;
  module.exports.safeLoad = loader.safeLoad;
  module.exports.safeLoadAll = loader.safeLoadAll;
  module.exports.dump = dumper.dump;
  module.exports.safeDump = dumper.safeDump;
  module.exports.YAMLException = $__require('npm:js-yaml@3.9.1/lib/js-yaml/exception.js');
  module.exports.MINIMAL_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/failsafe.js');
  module.exports.SAFE_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/default_safe.js');
  module.exports.DEFAULT_SCHEMA = $__require('npm:js-yaml@3.9.1/lib/js-yaml/schema/default_full.js');
  module.exports.scan = deprecated('scan');
  module.exports.parse = deprecated('parse');
  module.exports.compose = deprecated('compose');
  module.exports.addConstructor = deprecated('addConstructor');
});
System.registerDynamic('npm:js-yaml@3.9.1/index.js', ['npm:js-yaml@3.9.1/lib/js-yaml.js'], true, function ($__require, exports, module) {
  /* */
  'use strict';

  var global = this || self,
      GLOBAL = global;
  var yaml = $__require('npm:js-yaml@3.9.1/lib/js-yaml.js');
  module.exports = yaml;
});
System.registerDynamic("npm:js-yaml@3.9.1.js", ["npm:js-yaml@3.9.1/index.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  module.exports = $__require("npm:js-yaml@3.9.1/index.js");
});
System.registerDynamic("lib/client/Document.js", ["lib/client/types.js", "lib/client/exceptions.js", "github:jspm/nodelibs-url@0.1.0.js", "npm:js-yaml@3.9.1.js"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;

    const types = $__require("lib/client/types.js");
    const exceptions = $__require("lib/client/exceptions.js");
    const URL = $__require("github:jspm/nodelibs-url@0.1.0.js");

    class _Document extends types.ObservableDict {

        constructor(url) {
            super();

            this._url = url;
            this._loaded = false;

            this._readonly = false;
            this.beforeChangeCallbacks.add(change => {
                if (this._readonly) {
                    throw new exceptions.writePermissionError(`Write access denied to document ${this.url.href}`);
                }
            });
        }

        get url() {
            return this._url;
        }

        async load(cache = true) {
            if (cache && this._loaded) return this;

            await this.update();
            this._loaded = true;

            const subDocs = this.find(value => value instanceof Document);
            for (let subDoc of subDocs) await subDoc.load();

            return this;
        }

        async update() {

            const response = await fetch(this.url.href, {
                method: "GET",
                headers: new Headers({
                    'authorization': await Document.authorization(this.url)
                })
            });

            switch (response.status) {

                case 200:
                    var docAuth = response.headers.has('olo-Doc-Auth') ? response.headers.get('olo-Doc-Auth') : "read";
                    var docContent = await response.text();
                    break;

                default:
                    let errorMessage = await response.text();
                    throw new Error(errorMessage);
            }

            const dict = OML.load(docContent);
            this.assign(dict);
            this._readonly = docAuth === "read";
        }

        async store() {

            const dict = {};
            for (let [key, value] of this) dict[key] = value;
            const docContent = OML.dump(dict);

            const response = await fetch(this.url.href, {
                method: "POST",
                headers: new Headers({
                    'Content-Type': 'text/plain',
                    'Authorization': await Document.authorization(this.url)
                }),
                body: docContent
            });

            switch (response.status) {

                case 200:
                    break;

                default:
                    let errorMessage = await response.text();
                    throw new Error(errorMessage);
            }
        }
    }

    const documentCache = new Map();

    function Document(url) {
        url = URL.parse(url);

        var doc = documentCache.get(url.href);
        if (!doc) {
            doc = new _Document(url);
            documentCache.set(url.href, doc);
        }

        return doc;
    }

    Document.prototype = _Document.prototype;

    Document.authorization = async function (url) {
        return undefined;
    };

    const YAML = $__require("npm:js-yaml@3.9.1.js");

    const OML = {

        load: function (str) {
            return YAML.load(str, { schema: this._SCHEMA });
        },

        dump: function (obj) {
            return YAML.dump(obj, { schema: this._SCHEMA });
        },

        _TYPES: [],

        _SCHEMA: YAML.Schema.create([]),

        defineType: function (tag, options) {
            const Type = new YAML.Type(tag, options);
            this._TYPES.push(Type);
            this._SCHEMA = YAML.Schema.create(this._TYPES);
        }
    };

    OML.defineType('!link', {
        kind: 'scalar',
        resolve: url => typeof url === 'string',
        construct: url => Document(url),
        instanceOf: Document,
        represent: document => document.url.href
    });

    OML.defineType('!dict', {
        kind: 'mapping',
        resolve: map => map !== null,
        construct: map => new types.ObservableDict(map),
        instanceOf: types.ObservableDict,
        represent: dict => dict.getSnapshot()
    });

    OML.defineType('!list', {
        kind: 'sequence',
        resolve: seq => seq !== null,
        construct: seq => new types.ObservableList(...seq),
        instanceOf: types.ObservableList,
        represent: list => list.getSnapshot()
    });

    module.exports = Document;
});
System.registerDynamic("lib/client.js", ["lib/client/exceptions.js", "lib/client/Path.js", "lib/client/Change.js", "lib/client/types.js", "lib/client/Document.js"], true, function ($__require, exports, module) {
  var global = this || self,
      GLOBAL = global;
  exports.exceptions = $__require("lib/client/exceptions.js");
  exports.Path = $__require("lib/client/Path.js");
  exports.Change = $__require("lib/client/Change.js");

  const types = $__require("lib/client/types.js");
  exports.Observable = types.Observable;
  exports.ObservableContainer = types.ObservableContainer;
  exports.ObservableDict = types.ObservableDict;
  exports.ObservableList = types.ObservableList;
  exports.Document = $__require("lib/client/Document.js");
});
//# sourceMappingURL=client.js.map