/**
 * Created by MengLei on 2015/6/12.
 */

var dnode = require('dnode');
var log = require('./../utils/log').flow;
var serverConfig = require('./../config').dnodeConfig;

//需要暴露的方法列表
var server = dnode({
    orderFlow: require('./api/orderFlow')

});

//启动流量维护任务
require('./task/checkStatus').start();
//启动每日维护任务
require('./task/dailyCheck').start();

require('./zmqServer');


server.listen(serverConfig.flowServer.port);
log.fatal('flowServer dnode service listening at: ' + serverConfig.flowServer.port);