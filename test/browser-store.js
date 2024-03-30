const describeStore = require('./describe-store');
const BrowserStore = require("../src/browser-store");

describeStore('BrowserStore', {
    create: async content => {
        const store = new BrowserStore("test-store");
        await store._backend.clear();
        for (let key in content) {
            const path = store.normalizePath(key);
            const source = String(content[key]);
            await store._backend.setItem(path, source);
        }
        return store;
    }
});
