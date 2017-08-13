/**
 * Created by MengLei on 2016/3/21.
 */
"use strict";
let zerorpc = require("zerorpc");
let log = require('./log').sms;
let servers = {};
let serverConfig = require('../config').zmqConfig;

// connect();
for (let i = 0; i < Object.keys(serverConfig).length; i++) {
    let c = new zerorpc.Client();
    servers[Object.keys(serverConfig)[i]] = c;
    c.connect('tcp://' + serverConfig[Object.keys(serverConfig)[i]].host + ':' + serverConfig[Object.keys(serverConfig)[i]].port);
    c.on('error', function (err) {
        console.log('rpc client error: ' + err.message);
    });
}

function connect() {
    for (let i = 0; i < Object.keys(serverConfig).length; i++) {
        let c = new zerorpc.Client();
        servers[Object.keys(serverConfig)[i]] = c;
        c.connect('tcp://' + serverConfig[Object.keys(serverConfig)[i]].host + ':' + serverConfig[Object.keys(serverConfig)[i]].port);
        c.on('error', function (err) {
            console.log('rpc client error: ' + err.message);
        });
    }
}

function callRemote(dest, method, param, callback) {
    if (!callback) {
        callback = function () {
            log.trace('zmq client default callback.');
        }
    }
    if (!servers[dest]) {
        return callback(new Error('调用目标错误！'));
    }
    servers[dest].invoke(method, param, callback);
}

module.exports = callRemote;
