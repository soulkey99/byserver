/**
 * Created by MengLei on 2016/3/22.
 */
"use strict";
let zerorpc = require("zerorpc");
let log = require('./../utils/log').game;
let serverConfig = require('./../config').zmqConfig;
var mqttRoute = require('./route/mqtt');
var httpRoute = require('./route/http');

var server = new zerorpc.Server({
    request: httpRoute,
    route: mqttRoute
}, 10000);

server.bind('tcp://' + serverConfig.gameServer.host + ':' + serverConfig.gameServer.port);
log.fatal('game server zmq service listening at: ' + serverConfig.gameServer.port);
console.log('game server zmq service listening at: ' + serverConfig.gameServer.port);
server.on('error', function (err) {
    log.error('game zmq server error: ' + err);
});
