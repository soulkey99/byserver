/**
 * Created by MengLei on 2016/2/3.
 */

var proxy = require('./../../common/proxy');
//体力，param={userID: ''}
module.exports = function(param, callback) {
    proxy.GameUserRecord.getStrength(param.userID, callback);
};
