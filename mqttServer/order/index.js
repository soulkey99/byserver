/**
 * Created by MengLei on 2015/2/19.
 */

var router = require('../router');
var config = require('../../config');
var dnode = require('../utils/dnodeClient');
var http = require('http');

module.exports = function (content) {
    var postStr = 'content=' + JSON.stringify(content);
    dnode('orderServer', 'endOrder', content, function(err, resp){
        if(err){
            content.error = err.message;
            router.setOrder(content, content.from);
        }
    });
};
