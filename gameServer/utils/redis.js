/**
 * Created by MengLei on 2016/1/7.
 */
var redis = require("redis");

var client = redis.createClient(6379, '127.0.0.1');

client.on('ready', function(){
    //ready
});

module.exports = client;