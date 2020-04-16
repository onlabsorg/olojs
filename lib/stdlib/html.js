
const expression = require("../expression"); //xxx

async function createElement (tagName, attributes={}, ...childElements) {
    var html = `<${tagName}`;
    for (let attrName in attributes) {
        let attrValue = await expression.stringify(attributes[attrName]);
        html += ` ${attrName}="${attrValue}"`
    }
    html += ">";
    html += childElements.join("");
    html += `</${tagName}>`;
    return html;
}

exports.__apply__ = createElement;
