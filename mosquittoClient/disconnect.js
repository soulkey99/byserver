/**
 * Created by MengLei on 2015/7/6.
 */

var redis = require('./redis');

module.exports = function(obj){
    redis.del(obj.uid);
};
