/**
 * Created by MengLei on 2016/3/8.
 */
"use strict";
const eventproxy = require('eventproxy');
const proxy = require('../../../common/proxy');
const log = require('../../../utils/log').game;
const mission_list = require('./mission_list.json');

//领取任务奖励，param = {userID: '', identifier: ''}
module.exports = function(param, callback) {
    log.trace('get mission award: userID: ' + param.userID + ', identifier: ' + param.identifier);
    switch (param.identifier) {
        case '56d7ddcd6e5c4a201f61dd50':
            require('./items/continuousLogin').getAward(param, callback);
            break;
        case '56d7ddcd6e5c4a201f61dd51':
            require('./items/continuousWin').getAward(param, callback);
            break;
        case '56d7ddcd6e5c4a201f61dd52':
            require('./items/dailyInstantOrder').getAward(param, callback);
            break;
        default:
            process.nextTick(function(){
                callback(new Error('任务不存在！'));
            });
            break;
    }
};
