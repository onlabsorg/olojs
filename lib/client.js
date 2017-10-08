const exceptions = exports.exceptions = require("./client/exceptions");
const Path = exports.Path = require("./client/Path");
const Change = exports.Change = require("./client/Change");

const types = require("./client/types");
exports.Observable = types.Observable;
exports.ObservableContainer = types.ObservableContainer;
exports.ObservableDict = types.ObservableDict;
exports.ObservableList = types.ObservableList;



const URL = require("url");
function origin (url) {
    var origin = url.href;
    if (url.hash) origin = href.substr(0, origin.length - url.hash.length);
    return origin;
}

class _Document extends types.ObservableDict {

    constructor (url) {
        super();

        this._url = url;
        this._loaded = false;

        this._readonly = false;
        this.beforeChangeCallbacks.add((change) => {
            if (this._readonly) {
                throw new exceptions.writePermissionError(`Write access denied to document ${this.url.href}`);
            }
        });
    }

    get url () {
        return this._url;
    }

    get href () {
        return origin(this.url);
    }

    async load (cache=true) {
        if (cache && this._loaded) return this;

        await this.update()
        this._loaded = true;

        const subDocs = this.find((value) => value instanceof Document)
        for (let subDoc of subDocs) await subDoc.load();

        return this;
    }

    async update () {

        const response = await fetch(this.url.href, {
            method: "GET",
            headers: new Headers({
                'authorization': await Document.authorization(this.url)
            }),
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

        const dict = loadYAML(docContent);
        this.assign(dict);
        this._readonly = (docAuth === "read");
    }

    async store () {

        const response = await fetch(this.url.href, {
            method: "POST",
            headers: new Headers({
                'Content-Type': 'text/plain',
                'Authorization': await Document.authorization(this.url)
            }),
            body: dumpYAML(this)
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

function Document (url) {
    url = URL.parse(url);
    const href = origin(url);

    var doc = documentCache.get(href);
    if (!doc) {
        doc = new _Document(url);
        documentCache.set(href, doc);
    }

    return doc;
}

Document.prototype = _Document.prototype;

Document.authorization = async function (url) {
    return undefined;
};






const YAML = require("js-yaml");
const isPlainObject = require("lodash/isPlainObject");
const isArray = require("lodash/isArray");

const YAML_SCHEMA = YAML.Schema.create([
    new YAML.Type('!link', {
        kind: 'scalar',
        resolve: (url) => typeof url === 'string',
        construct: (url) => Document(url),
        instanceOf: Document,
        represent: (document) => document.href,
    })
]);

function loadYAML (str) {
    const obj = YAML.load(str, {schema:YAML_SCHEMA});
    if (isPlainObject(obj)) return new types.ObservableDict(obj);
    if (isArray(obj)) return new types.ObservableList(obje);
    return obj;
}

function dumpYAML (obj) {
    const dumpableObj = (obj instanceof Document) ? dumpableDict(obj) : dumpable(obj);
    return YAML.dump(dumpableObj, {schema:YAML_SCHEMA});
}

function dumpable (obj) {
    if (obj instanceof Document) return obj;
    if (obj instanceof types.ObservableDict) return dumpableDict(obj);
    if (obj instanceof types.ObservableList) return dumpableList(obj);
    return obj;
}

function dumpableDict (dict) {
    const plainObject = {};
    for (let [key, value] of dict) plainObject[key] = dumpable(value);
    return plainObject;
}

function dumpableList (list) {
    const array = [];
    for (let item of list) array.push(dumpable(item));
    return array;
}



exports.Document = Document;
exports.loadYAML = loadYAML;
exports.dumpYAML = dumpYAML;
