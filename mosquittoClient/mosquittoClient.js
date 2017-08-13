/**
 * Created by MengLei on 2015/7/6.
 */

var mqtt = require('mqtt');
var connect = require('./connect');
var log = require('../utils/log').mos;
var disconnect = require('./disconnect');


var opt = {
    keepalive: 300,
    clean: false,
    clientId: 'mosquitto-client'
};

var client = mqtt.connect('mqtt://127.0.0.1:8065', opt);


client.on('connect', function () {
    //连接成功，订阅主题
    client.subscribe('byserver', function(){
        //subscribe success.
        log.trace('connect success and subscribe success.');
    });

    client.subscribe('$SYS/brokers/+/clients/#', function(){
        log.trace('log topic subscribed.');
    });
});


client.on('message', function (topic, message) {
    //处理接受到的消息
    //console.log(message.toString());
    switch (topic){
        case 'byserver':{
            try {
                var msgObj = JSON.parse(message);
                switch (msgObj.action) {
                    case 'connect': //连接动作
                        connect(msgObj.content);
                        log.trace('on connect: ' + message);
                        break;
                    case 'disconnect':  //断开动作
                        disconnect(msgObj.content);
                        log.trace('on disconnect: ' + message);
                        break;
                    default :
                        break;
                }
            } catch (ex) {
                log.error('parse message error: ' + message);
            }
        }
            break;
        default :
            break;
    }
});

//{"clientid":"paho-98741406216559","username":"undefined","ipaddress":"113.233.19.37","session":false,"protocol":4,"connack":0,"ts":1443515223}
//{"clientid":"paho-98741406216559","reason":"normal","ts":1443515223}
function log4emqttd(topic, message){
    var msgObj = {};
    if(/\$SYS\/brokers\/emqttd@127.0.0.1\/clients\/.*\/connected/.test(topic)){//客户端连接
        msgObj = JSON.parse(message);
    }
    if(/\$SYS\/brokers\/emqttd@127.0.0.1\/clients\/.*\/disconnected/.test(topic)){//客户端断开
    }
}
