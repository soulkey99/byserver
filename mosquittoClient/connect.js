/**
 * Created by MengLei on 2015/7/6.
 */

var redis = require('./redis');

module.exports = function(obj){
    redis.set(obj.uid, obj.token);
    redis.expire(obj.uid, 86400);
};
