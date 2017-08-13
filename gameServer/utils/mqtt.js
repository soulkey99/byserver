/**
 * Created by MengLei on 2016/1/26.
 */

var mqtt = require('mqtt');
var redis = require('redis');

var opt = {
    keepalive: 300,
    clean: false,
    clientId: 'game-mqtt-client'
};

var redisClient = redis.createClient(6379, '127.0.0.1');
var mqttClient = mqtt.connect('mqtt://127.0.0.1:8065', opt);


var exp = {
    redisClient: redisClient,
    mqttClient: mqttClient
};

module.exports = exp;

exp.aiSub = function(topic, callback){
    mqttClient.subscribe(topic, callback);
    redisClient.setex(topic, topic, 86400);
};

