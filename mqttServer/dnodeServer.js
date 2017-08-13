/**
 * Created by MengLei on 2015/6/6.
 */

var dnode = require('dnode');
var log = require('./../utils/log').mqtt;
var serverConfig = require('./../config').dnodeConfig;

//需要暴露的方法列表
var server = dnode({
    sendTo: require('./sendTo'),
    push: require('./push'),
    setOrder: require('./order/setOrder')
});

//start mqtt service
require('./mqtt/mqttClient');

require('./zmqServer');

//start dnode service
server.listen(serverConfig.mqttServer.port);
log.fatal('mqtt dnode service listening at: ' + serverConfig.mqttServer.port);
console.log('mqtt dnode service listening at: ' + serverConfig.mqttServer.port);

