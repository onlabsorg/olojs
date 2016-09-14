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


function readFile (filePath) {
    return new Promise (function (resolve, reject) {
        fs.readFile(absPath(filePath),'utf8', function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
}


function writeFile (filePath, data) {
    return new Promise (function (resolve, reject) {
        fs.writeFile(absPath(filePath), data, 'utf8', function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}



var generateDocumentation = co.wrap(function * (sourceFilePath, destFilePath) {
    var sourceFile = yield readFile(sourceFilePath);
    var destFile = "";
    var re = /^\s*\/\*{2}([\s\S]+?)\*\/\s*\n/mg;
    var match;
    while ((match = re.exec(sourceFile)) !== null) {
        let docBlock = match[0];
        docBlock = docBlock.replace(/^\s*$/mg, "");                 // remove empty lines
        docBlock = docBlock.replace(/^\s*\/\*{2}.*$/mg, "  \n");    // remove `/**` lines
        docBlock = docBlock.replace(/^\s*\*\/\s*$/mg, "  \n");      // remove ` */` lines
        docBlock = docBlock.replace(/^\s*\*\n/mg, "\n");            // remove leading * from empty doc lines ...
        docBlock = docBlock.replace(/^\s*\*\s{2}/mg, "");           // ... and from non-empty doc lines
        destFile = destFile + docBlock;
    }
    yield writeFile(destFilePath, destFile);
});


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

    console.log("-   creating documentation ...");
    yield generateDocumentation('lib/deep.js', 'wiki/olojs.deep.md');
    yield generateDocumentation('lib/observable.js', 'wiki/olojs.observable.md');
    yield generateDocumentation('lib/remote.js', 'wiki/olojs.remote.md');

})
.then(function () {
    console.log("done.\n")
})
.catch(function (err) {
    console.log(err);
});

