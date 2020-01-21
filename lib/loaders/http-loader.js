require("isomorphic-fetch");

function Loader (host) {
    while (host.slice(-1) === "/") host = host.slice(0,-1);
    return async (path) => {
        if (path[0] !== "/") path = "/" + path;
        const url = host + path;
        return await Loader.fetch(url);
    }
}

Loader.fetch = async function (url) {
    const response = await fetch(url, {
        method: 'get',
        headers: {
            'Content-Type': 'text/olo'
        },
    });
    if (response.status === 200) {
        return await response.text();
    } else {
        let message = await response.text();
        throw new Error(message);
    }    
}

module.exports = Loader;