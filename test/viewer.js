//
//  This test module starts a http-http server exposing the filestore at
//  `/test/public` and serving a viewer client.
//
//  If you run this module with a parameter, it will be interpreted as a docId
//  and the corresponding doc will be rendered in the browser. For ecample:
//
//      node test/http-server /path/to/doc
//


var olojs = require('..');

const store = new olojs.FileStore(`${__dirname}/public`);

const server = olojs.HTTPServer.ViewerServer(store);

server.listen(8010, async () => {
    console.log("olojs http server listening on port 8010");

    const docId = process.argv[2];
    if (docId) {
        console.log(`opening ${docId} in the browser ...`);
        await exec(`xdg-open http://localhost:8010/#${docId}`);
    };
});



var child_process = require('child_process');
function exec (command) {
    let options = {
        cwd: __dirname
    };
    return new Promise((resolve, reject) => {
        child_process.exec(command, options, (error, stdout, stderr) => {
            if (error) reject(error); else resolve();
        });            
    });
}
