require("isomorphic-fetch");
const pathlib = require('path');


module.exports = scheme => async (...paths) => {
    const url = `${scheme}:/${pathlib.join('/', ...paths)}`;

    const response = await fetch(url, {
        method: 'get',
        headers: {
            'Accept': 'text/*'
        },
    });
    
    if (response.ok) {
        return await response.text();            
    } else if (response.status === 404) {
        return "";
    } else {
        let message = await response.text();
        throw new Error(message);            
    }    
    
};
