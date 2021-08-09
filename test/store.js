const describeStore = require('./describe-store');
const Store = require("../lib/store");

describeStore('VoidStore', {
    create: documents => new Store(), 
    voidStore: true
});
