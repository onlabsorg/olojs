
const express = require('express');
const bodyParser = require('body-parser');


const fs = require('fs');

function readFileAsync (path, options) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, options, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

function writeFileAsync (path, data, options) {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, options, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}



class Store {

    constructor (path) {
        this.path = path;
    }

    auth (docPath, authorization) {
        return "write";
        // or "read"
        // or "none"
    }

    async read (docPath, authorization) {
        const docAuth = this.auth(docPath, authorization);
        if (docAuth !== "read" && docAuth !== "write") {
            throw new Error(`Read permission denied on document path ${docPath}`);
        }

        const docContent = await readFileAsync(this.path + docPath, {encoding:'utf8'});
        return {
            head: {
                'olo-Doc-Auth': docAuth,
            },
            body: docContent,
        };
    }

    async write (docPath, docContent, authorization) {
        const docAuth = this.auth(docPath, authorization);
        if (docAuth !== "write") {
            throw new Error(`Write permission denied on document path ${docPath}`);
        }

        await writeFileAsync(this.path + docPath, docContent, {encoding:'utf8'});
    }
}



function Router (store) {
    const router = express.Router();

    router.use(function (req, res, next) {
        req.authorization = (req.header && req.header.authorization) || undefined;
        next();
    });

    router.use(bodyParser.text());

    router.get('*', function (req, res, next) {
        store.read(req.path, req.authorization)
        .then((file) => {
            res.set(file.head);
            res.status(200).send(file.body);
        })
        .catch((error) => {
            res.status(400).send(error);
        });
    });

    router.post('*', function (req, res, next) {
        const docContent = req.body || "";
        store.write(req.path, docContent, req.authorization)
        .then(() => {
            res.status(200).send();
        })
        .catch((error) => {
            res.status(400).send(error);
        });
    });

    return router;
}


exports.Store = Store;
exports.Router = Router;
