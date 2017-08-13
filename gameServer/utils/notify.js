/**
 * Created by MengLei on 2016/1/7.
 */

var dnode = require('../../utils/dnodeClient');
var zrpc = require('../../utils/zmqClient');

//param = {dest: '', body: {action: 'game', content: {}}}
//dest：目标userID，route：路由，body：内容
module.exports = function(dest, route, body, callback) {
    //
    if (dest) {
        zrpc('mqttServer', 'sendTo', {
            dest: dest, body: {
                action: 'game',
                content: {
                    route: route,
                    body: body
                }
            }
        }, callback);
    }
};
