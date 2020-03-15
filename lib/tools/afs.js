const fs = require("fs");


exports.readFile = path => new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
        if (err) reject(err);
        else resolve(data);
    });
});
    
exports.writeFile = (path, text) => new Promise((resolve, reject) => {
    fs.writeFile(path, text, "utf8", (err, data) => {
        if (err) reject(err);
        else resolve(data);
    });
});
