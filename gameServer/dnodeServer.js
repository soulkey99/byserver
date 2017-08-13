/**
 * Created by MengLei on 2016/1/5.
 */
var dnode = require('dnode');
var log = require('./../utils/log').game;
var proxy = require('./../common/proxy');
var serverConfig = require('./../config').dnodeConfig;
var cronJob = require('cron').CronJob;
var mqttRoute = require('./route/mqtt');
var httpRoute = require('./route/http');

//需要暴露的方法列表
var server = dnode({
    request: httpRoute,
    route: mqttRoute
});


server.listen(serverConfig.gameServer.port);
log.fatal('game server dnode service listening at: ' + serverConfig.gameServer.port);
console.log('game server dnode service listening at: ' + serverConfig.gameServer.port);

require('./zmqServer');

//每月任务，每月1日凌晨0点0分0秒
//Seconds: 0-59
//Minutes: 0-59
//Hours: 0-23
//Day of Month: 1-31
//Months: 0-11
//Day of Week: 0-6
new cronJob('0 0 0 1 * *', function(){
    log.trace('monthly cron task started.');
    proxy.GameUserRecord.monthlyCronTask();
}, null, true);
//每周任务，每周日凌晨0点0分0秒
new cronJob('0 0 0 * * 0', function(){
    log.trace('weekly cron task started.');
    proxy.GameUserRecord.weeklyCronTask();
}, null, true);
