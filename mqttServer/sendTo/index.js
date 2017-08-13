/**
 * Created by MengLei on 2015/12/20.
 */

var router = require('../router');
var log = require('./../../utils/log').mqtt;

//通过mqtt向指定用户发送特定消息{body: {action: '', content: {}}, dest: ''}
module.exports = function(info){
    log.trace('mqtt send ' + JSON.stringify(info.body) + ', to: ' + info.dest);
    router.sendTo(info.body, info.dest);
};
