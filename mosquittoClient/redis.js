/**
 * Created by MengLei on 2015/7/6.
 */

var redis = require("redis");
var log = require('../utils/log').mos;

var client = redis.createClient(6379, '127.0.0.1');

client.on('ready', function(){
    //ready
    log.trace('on redis ready.')
});

module.exports = client;

