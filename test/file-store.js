var describeStore = require('./describe-store');

var pathlib = require('path');
var fs = require("fs");
var rimraf = require("rimraf");
var mkdirp = require("mkdirp");
var FileStore = require("../lib/stores/file-store");



describeStore('FileStore', {
    
    create: async content => {
        const rootPath = `${__dirname}/file-store`;
        rimraf.sync(`${rootPath}`);

        for (let path in content) {
            const fullPath = pathlib.join(rootPath, path+'.olo');
            const dirPath = pathlib.join(fullPath, '..');
            mkdirp.sync(dirPath);
            fs.writeFileSync(fullPath, content[path], 'utf8');
        }
        
        return new FileStore(rootPath);
    }
});



describeStore('FileStore with custom extension', {

    create: async content => {
        const rootPath = `${__dirname}/file-store`;
        rimraf.sync(`${rootPath}`);
        const extension = '.txt'

        for (let path in content) {
            const fullPath = pathlib.join(rootPath, path+extension);
            const dirPath = pathlib.join(fullPath, '..');
            mkdirp.sync(dirPath);
            fs.writeFileSync(fullPath, content[path], 'utf8');
        }
        
        return new FileStore(rootPath, {extension});
    }
});
