
const isPlainObject = require("lodash/isPlainObject");
const isArray = require("lodash/isArray");
const isString = require("lodash/isString");
const isBoolean = require("lodash/isBoolean");
const isNumber = require("lodash/isNumber");
const isInteger = require("lodash/isInteger");
const isEqual = require("lodash/isEqual");

const Path = require("./Path");
const Change = require("./Change");
const exceptions = require("./exceptions");



class Observable {

    constructor () {
        this._parents = new Set();
        this.beforeChangeCallbacks = new Set();
        this.afterChangeCallbacks = new Set();
    }

    _getData () {
        return this._data;
    }

    *parents () {
        for (let parent of this._parents) yield [parent.obj, parent.key];
    }

    getSnapshot () {
        return null;
    }

    _addParent (observable, key) {
        for (let [p,k] of this.parents()) {
            if (p === observable && k === key) return;
        }
        this._parents.add({obj:observable, key:key});
    }

    _removeParent (observable, key) {
        for (let parent of this._parents) {
            if (parent.obj === observable && parent.key === key) {
                this._parents.delete(parent);
                return;
            }
        }
    }

    _dispatch (callbackSetName, change) {
        const callbacks = this[callbackSetName];

        for (let callback of callbacks) {
            if (typeof callback === "function") callback(change);
        }

        for (let parent of this._parents) {
            let parentChange = createChange(parent.key, change);
            parent.obj._dispatch(callbackSetName, parentChange);
        }
    }

    _hasAnchestor (observable) {
        if (this === observable) return true;
        for (let parent of this._parents) {
            if (parent.obj._hasAnchestor(observable)) return true;
        }
        return false
    }
}



class ObservableContainer extends Observable {

    _validateValue (value) {
        if (isNumber(value) || isBoolean(value) || isString(value) || value === null) return value;

        if (isPlainObject(value)) value = new ObservableDict(value);
        else if (isArray(value)) value = new ObservableList(...value);

        if (value instanceof Observable) {
            if (this._hasAnchestor(value)) throw new exceptions.CyclicReferenceError("Cyclic references are not allowed.");
            return value;
        }

        throw new TypeError("Observable items must be observables, plain objects, arrays, strings, numbers or booleans.");
    }

    *find (test) {
        for (let value of this.values()) {
            if (test(value)) yield value;
            else if (value instanceof ObservableContainer) {
                for (let match of value.find(test)) yield match;
            }
        }
    }
}



class ObservableDict extends ObservableContainer {

    constructor (dict={}) {
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

    get size () {
        return Object.keys(this._getData()).length;
    }

    has (key) {
        return key in this._getData();
    }

    *keys () {
        for (let key in this._getData()) yield key;
    }

    *values () {
        for (let key of this.keys()) yield(this.get(key));
    }

    get (key) {
        return this._getData()[key];
    }

    set (key, value) {

        var newValue = this._validateValue(value);
        var oldValue = this.get(key);
        if (newValue === oldValue) return null;

        var change = createChange(key, {type:'dict', del:oldValue, ins:newValue});
        this._dispatch('beforeChangeCallbacks', change);

        if (newValue instanceof Observable) newValue._addParent(this, key);
        if (oldValue instanceof Observable) oldValue._removeParent(this, key);
        this._getData()[key] = newValue;

        this._dispatch('afterChangeCallbacks', change);

        return change;
    }

    delete (key) {

        var oldValue = this.get(key);
        if (oldValue === undefined) return null;

        var change = createChange(key, {type:'dict', del:oldValue, ins:undefined});
        this._dispatch('beforeChangeCallbacks', change);

        if (oldValue instanceof Observable) oldValue._removeParent(this, key);
        delete this._getData()[key];

        this._dispatch('afterChangeCallbacks', change);

        return change;
    }

    assign (dict) {
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
            if ((oldValue instanceof ObservableDict && newValue instanceof ObservableDict) ||
                    (oldValue instanceof ObservableList && newValue instanceof ObservableList)) {

                let deepChanges = oldValue.assign(newValue);
                for (let change of deepChanges) changes.push(new Change(key, change));
            }
            else {
                let change = this.set(key, newValue);
                if (change !== null) changes.push(change);
            }
        }

        return changes;
    }

    apply (change) {
        if (!(change instanceof Change)) throw new exceptions.ValueError('Invalid change argument.');

        const currentValue = this.get(change.key);

        if (change.op instanceof Change) {
            if (currentValue instanceof ObservableContainer) {
                let appliedChange = currentValue.apply(change.op);
                return (appliedChange === null) ? null : new Change(change.key, appliedChange);
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
        }

        else {
            return this.set(change.key, change.op.ins);
        }
    }

    getSnapshot () {
        const plainObject = {};
        for (let [key, value] of this) {
            if (value instanceof ObservableContainer) value = value.getSnapshot();
            plainObject[key] = value;
        }
        return plainObject;
    }

    *[Symbol.iterator] () {
        for (let key of this.keys()) {
            let value = this.get(key);
            yield [key, value];
        }
    }
}



class ObservableList extends ObservableContainer {

    constructor (...list) {
        super();
        var data = [];
        for (let item of list) {
            data.push(this._validateValue(item));
        }
        for (let i=0; i<data.length; i++) {
            let item = data[i];
            if (item instanceof Observable) item._addParent(this, i);
        }
        this._data = data;
    }

    get size () {
        return this._getData().length;
    }

    indexOf (item) {
        return this._getData().indexOf(item);
    }

    has (item) {
        return this.indexOf(item) !== -1;
    }

    *values () {
        for (let item of this._getData()) yield item;
    }

    get (index) {
        try {
            index = this._validateIndex(index);
            return this._getData()[index];
        }
        catch (e) {
            return undefined;
        }
    }

    slice (begin, end) {
        return this._getData().slice(begin, end);
    }

    set (index, value) {
        index = this._validateIndex(index);

        var newValue = this._validateValue(value);
        var oldValue = this.get(index);
        if (newValue === oldValue) return null;

        var change = createChange(index, {type:'list', del:oldValue, ins:newValue});
        this._dispatch('beforeChangeCallbacks', change);

        if (newValue instanceof Observable) newValue._addParent(this, index);
        if (oldValue instanceof Observable) oldValue._removeParent(this, index);
        this._getData()[index] = newValue;

        this._dispatch('afterChangeCallbacks', change);

        return change;
    }

    insert (index, item) {
        index = this._validateIndex(index, 1);
        item = this._validateValue(item);

        var change = createChange(index, {type:'list', del:undefined, ins:item});
        this._dispatch('beforeChangeCallbacks', change);

        for (let i=index; i<this.size; i++) {
            let child = this.get(i);
            if (child instanceof Observable) {
                for (let parent of child._parents) {
                    if (parent.obj === this) parent.key = i+1;
                }
            }
        }
        if (item instanceof Observable) item._addParent(this, index);

        this._getData().splice(index, 0, item);

        this._dispatch('afterChangeCallbacks', change);

        return change;
    }

    append (item) {
        return this.insert(this.size, item);
    }

    delete (index) {
        index = this._validateIndex(index);

        var oldItem = this.get(index);

        var change = createChange(index, {type:'list', del:oldItem, ins:undefined});
        this._dispatch('beforeChangeCallbacks', change);

        for (let i=index+1; i<this.size; i++) {
            let child = this.get(i);
            if (child instanceof Observable) {
                for (let parent of child._parents) {
                    if (parent.obj === this) parent.key = i-1;
                }
            }
        }
        if (oldItem instanceof Observable) oldItem._removeParent(this, index);

        this._getData().splice(index, 1);

        this._dispatch('afterChangeCallbacks', change);

        return change;
    }

    assign (list) {
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

        for (let i=0; i<list.size; i++) {
            let newItem = list.get(i);
            let oldItem = this.get(i);
            if ((oldItem instanceof ObservableDict && newItem instanceof ObservableDict) ||
                    (oldItem instanceof ObservableList && newItem instanceof ObservableList)) {

                let deepChanges = oldItem.assign(newItem);
                for (let change of deepChanges) changes.push(new Change(i, change));
            }
            else {
                let change = this.set(i, newItem);
                if (change !== null) changes.push(change);
            }
        }

        return changes;
    }

    apply (change) {
        if (!(change instanceof Change)) throw new exceptions.ValueError('Invalid change argument.');

        const currentValue = this.get(change.key);

        if (change.op instanceof Change) {
            if (currentValue instanceof ObservableContainer) {
                let appliedChange = currentValue.apply(change.op);
                return (appliedChange === null) ? null : new Change(change.key, appliedChange);
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

    getSnapshot () {
        const array = [];
        for (let item of this) {
            if (item instanceof ObservableContainer) item = item.getSnapshot();
            array.push(item);
        }
        return array;
    }

    *[Symbol.iterator] () {
        for (let item of this.values()) yield item;
    }

    _validateIndex (index, overflow=0) {
        const size = this.size;
        index = Number(index);
        if (!isInteger(index)) throw new TypeError("Index must be an integer.");
        if (index < 0) index = size + index;
        if (0 <= index && index < size+overflow) return index;
        throw new RangeError("Index out of range");
    }
}


function createChange (key, op) {
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
