/**
 * Created by MengLei on 2016/3/22.
 */
"use strict";
let zerorpc = require("zerorpc");
let log = require('./../utils/log').mqtt;
let serverConfig = require('./../config').zmqConfig;

var server = new zerorpc.Server({
    sendTo: require('./sendTo'),
    push: require('./push'),
    setOrder: require('./order/setOrder')
}, 10000);

require('./mqtt/mqttClient');

server.bind('tcp://' + serverConfig.mqttServer.host + ':' + serverConfig.mqttServer.port);
log.fatal('mqttServer zmq service listening at: ' + serverConfig.mqttServer.port);
console.log('mqttServer zmq service listening at: ' + serverConfig.mqttServer.port);
server.on('error', function (err) {
    log.error('mqtt zmq server error: ' + err);
});
