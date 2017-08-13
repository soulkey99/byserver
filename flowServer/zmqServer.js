/**
 * Created by MengLei on 2016/3/22.
 */
"use strict";
let zerorpc = require("zerorpc");
let log = require('./../utils/log').flow;
let serverConfig = require('./../config').zmqConfig;

var server = new zerorpc.Server({
    orderFlow: require('./api/orderFlow')
});

server.bind('tcp://' + serverConfig.flowServer.host + ':' + serverConfig.flowServer.port);
log.fatal('flowServer dnode service listening at: ' + serverConfig.flowServer.port);
console.log('flowServer dnode service listening at: ' + serverConfig.flowServer.port);
server.on('error', function (err) {
    log.error('flow zmq server error: ' + err.message);
});
