
import utils from "../utils";
import Path from "../Path";
import AbstractStore from "./AbstractStore";



class MemoryStore extends AbstractStore {

    async connect () {
        await super.connect();
    }

    async disconnect () {
        await super.disconnect();
    }

    static get protocol () {
        return "memory:";
    }

    static get Document () {
        return Document;
    }
}


class Document extends AbstractStore.Document {

    async open () {
        this.data = {}
        await super.open();
    }

    get (path) {
        path = Path.from(path);
        return path.lookup(this.data);
    }

    type (path) {
        var value = this.get(path);
        if (utils.isPlainObject(value)) return "dict";
        if (utils.isArray(value)) return "list";
        if (utils.isString(value)) return "text";
        if (utils.isNumber(value)) return "numb";
        if (utils.isBoolean(value)) return "bool";
        return "none";
    }

    getDictKeys (path) {
        var dict = this.get(path);
        return Object.keys(dict);
    }

    setDictItem (path, key, newValue) {
        var dict = this.get(path);
        var oldValue = dict[key] !== undefined ? dict[key] : null;
        dict[key] = newValue;
        this.dispatch(path, key, oldValue, newValue);
    }

    removeDictItem (path, key) {
        var dict = this.get(path);
        var oldValue = dict[key] !== undefined ? dict[key] : null;
        if (oldValue !== null) {
            delete dict[key];
            this.dispatch(path, key, oldValue, null);
        }
    }

    getListSize (path) {
        var list = this.get(path);
        return list.length;
    }

    setListItem (path, index, newItem) {
        var list = this.get(path);
        var oldItem = list[index] !== undefined ? list[index] : null;
        list[index] = newItem;
        this.dispatch(path, index, [oldItem], [newItem]);
    }


    insertListItems (path, index, ...newItems) {
        var list = this.get(path);
        list.splice(index, 0, ...newItems);
        this.dispatch(path, index, [], newItems);
    }

    removeListItems (path, index, count) {
        var list = this.get(path);
        var oldItems = list.slice(index, index+count);
        list.splice(index, count);
        this.dispatch(path, index, oldItems, []);

    } 

    getTextSize (path) {
        var text = this.get(path);
        return text.length;
    }

    insertText (path, index, subString) {
        var path = path instanceof Path ? path : new Path(path);
        var parent = this.get(path.parent);
        var key = path.leaf;

        var text = this.get(path);

        parent[key] = text.slice(0, index) + subString + text.slice(index);

        this.dispatch(path, index, "", subString);            
    }

    removeText (path, index, count) {
        var path = path instanceof Path ? path : new Path(path);
        var parent = this.get(path.parent);
        var key = path.leaf;

        var text = this.get(path);
        var oldText = text.slice(index, index+count);

        parent[key] = text.slice(0, index) + text.slice(index+count);

        this.dispatch(path, index, oldText, "");
    }
}


export default MemoryStore;
