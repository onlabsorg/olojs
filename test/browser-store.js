const describeStore = require('./describe-store');
const BrowserStore = require("../src/browser-store");

describeStore('BrowserStore', {
    create: async (content) => {
        const pathlib = require('path');
        const store = new BrowserStore('testStore');
        await store._backend.clear();
        for (let path in content) {
            await store._backend.setItem(pathlib.normalize(`/${path}`), String(content[path]));
        }
        return store;
    }
});
