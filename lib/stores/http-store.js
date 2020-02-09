require("isomorphic-fetch");


class HTTPStore {
    
    constructor (host, headers={}) {
        while (host.slice(-1) === "/") host = host.slice(0,-1);
        this.host = host;
        this.headers = headers;
    }
    
    async read (path) {
        if (path[0] !== "/") path = "/" + path;
        const url = this.host + path;
        const response = await fetch(url, {
            method: 'get',
            headers: Object.assign({
                'Content-Type': 'text/olo'
            }, this.headers),
        });
        if (response.status === 200) {
            return await response.text();
        } else {
            let message = await response.text();
            throw new Error(message);
        }    
    }
}


module.exports = HTTPStore;
