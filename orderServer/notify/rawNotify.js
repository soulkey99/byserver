/**
 * Created by MengLei on 2016/1/20.
 */

var dnode = require('../../utils/dnodeClient');
var zrpc = require('../../utils/zmqClient');

//param = {dest: '', body: {action: 'game', content: {}}}
module.exports = function(param, callback) {
    if(!callback){
        callback = function(){};
    }
    zrpc('mqttServer', 'sendTo', param, callback);
};
