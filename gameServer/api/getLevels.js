/**
 * Created by MengLei on 2016/2/4.
 */

var proxy = require('./../../common/proxy');
var log = require('../../utils/log').common;
//获取关卡列表，param={userID: ''}
module.exports = function(param, callback) {
    log.trace('get levels userID=' + param.userID + ', param: ' + JSON.stringify(param));
    proxy.GameLevel.getLevelByUserID(param, callback);
};
