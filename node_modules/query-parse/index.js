var querystring = require('querystring');
var toPairs = require('lodash/toPairs');

var qp = {
  toString: function (params) {
    var str = '';
    toPairs(params)
      .sort()
      .map(function(param) {
          if (param[1] !== undefined) {
              if (str !== '') str += '&';
              str += param[0] + '=' + encodeURIComponent(param[1]);
          }
      });
    return str;
  },

  toObject: function (str) {
    return querystring.parse(str);
  }
};

//
module.exports = qp;
