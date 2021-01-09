
var olojs = require('..');

const store = new olojs.FileStore(`${__dirname}/public`);
const server = olojs.HTTPServer.createServer(store);

server.listen(8010, async () => {
    console.log("olojs http server listening on port 8010");
    console.log("Loading the client application in the browser ...");
    await exec('xdg-open http://localhost:8010/#index');
    console.log(`Killing the server in 5s ...`);
    setTimeout(() => process.exit(), 5000);
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
