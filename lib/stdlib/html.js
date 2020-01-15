
const expression = require("../expression");

async function createElement (tagName, attributes={}, ...childElements) {
    var html = `<${tagName}`;
    for (let attrName in attributes) {
        let attrValue = await expression.stringify(attributes[attrName]);
        html += ` ${attrName}="${attrValue}"`
    }
    html += ">";
    for (let childElement of childElements) {
        if (Array.isArray(childElement)) {
            html += await createElement(childElement[0], childElement[1], ...childElements.slice(2));
        } else {
            html += await expression.stringify(childElement);
        }
    }
    html += `</${tagName}>`;
    return html;
}

exports.__apply__ = createElement;
