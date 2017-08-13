/**
 * Created by MengLei on 2015/7/7.
 */

var mqtt = require('mqtt');
var router = require('../router');
var log = require('./../../utils/log').mqtt;

var opt = {
    keepalive: 300,
    clean: false,
    clientId: 'mqtt-server'
};

var server = mqtt.connect('mqtt://127.0.0.1:8065', opt);

server.on('connect', function(){
    //connect success
    log.fatal('mqtt client connected.');
    server.subscribe('byserver');
});

server.on('message', function(topic, message){
    if(topic == 'byserver') {
        //只有发往byserver的消息才转发给router处理
        router.on_publish(message);
    }
});

exports.sendTo = function(msg, dest, qos) {
    if (msg.action == 'build' || msg.action == 'msg') {
        qos = 2;
    } else {
        qos = 0;
    }

    log.trace('Published, payload: ', JSON.stringify(msg) + ', from byserver to topic: ' + dest);
    server.publish(dest, JSON.stringify(msg), {qos: qos, retain: true}, function () {
        log.trace('mqtt message published ok.')
    });
};

