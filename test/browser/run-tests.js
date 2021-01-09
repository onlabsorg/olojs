var express = require('express');
var http = require('http');
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


function startServer (port) {
    var app = express();

    app.use( express.static(`${__dirname}/public`) );
    
    var server = http.createServer(app);

    return new Promise((resolve, reject) => {
        server.listen(port, err => {
            if (err) reject(err);
            else resolve(server);
        });            
    });
}


async function run_tests () {
    console.log("Compiling tests for the browser with webpack ...")
    await exec('npx webpack --mode development')
    
    console.log("Starting the server ...")
    var server = await startServer(8011);
    console.log("olojs test server listening on port 8011");
    
    console.log("Running the tests in the browser ...");
    exec('xdg-open http://localhost:8011/index.html');
    
    console.log(`Killing the server in 5s ...`);
    setTimeout(() => process.exit(), 5000);
}

run_tests();
