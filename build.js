var co = require('co');
var fs = require('fs');

var browserify = require('browserify');

function absPath (relPath) {
    return __dirname + '/' + relPath;
}


function bundle (sourceFile, destFile) {
    return new Promise(function (resolve, reject) {
        var b = browserify(absPath(sourceFile));

        var rstream = b.bundle();
        rstream.on('error', function (err) {
            reject(err);
        });

        var wstream = fs.createWriteStream(absPath(destFile));
        wstream.on('finish', function () {
            resolve();
        });
        wstream.on('error', function (err) {
            reject(err);
        });

        rstream.pipe(wstream);
    });
}


var fcopy = co.wrap(function * (sourceFilePath, destFilePath) {
    fs.createReadStream(sourceFilePath).pipe(fs.createWriteStream(destFilePath));
});




co(function * () {

    console.log("building olojs:")

    console.log("-   browserify-ing olojs/index.js ...");
    yield bundle('index.js', 'dist/browser.js');
    yield fcopy('dist/browser.js', 'test/remote/browser.js');

    console.log("-   browserify-ing olojs/test/index.js ...");
    yield bundle('test/index.js', 'test/browser/test.js');

})
.then(function () {
    console.log("done.\n")
})
.catch(function (err) {
    console.log(err);
});

