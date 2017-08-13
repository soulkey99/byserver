/**
 * Created by MengLei on 2016/1/21.
 */
var log = require('../../utils/log').game;

//在这里将不同的http请求route给不同的处理函数
//param = {m: '', body: {}}
module.exports = function(param, callback){
    log.trace('game http request: m = ' + param.m + ', body: ' + JSON.stringify(param.body));

    switch (param.m){
        case 'getQuestions':    //获取对战问题详情
            require('../api/getQuestions')(param.body, callback);
            break;
        case 'check':   //回答问题
            require('../api/check')(param.body, callback);
            break;
        case 'getResult':   //获取游戏结果
            require('../api/getResult')(param.body, callback);
            break;
        case 'getRecord':   //获取战绩
            require('../api/record')(param.body, callback);
            break;
        case 'getStrength': //获取体力
            require('../api/getStrength')(param.body, callback);
            break;
        case 'getRank': //获取排行榜
            require('../api/getRank')(param.body, callback);
            break;
        case 'getMissionList':  //获取任务列表
            require('../api/achievement/getMyMission')(param.body, callback);
            break;
        case 'getMissionAward':     //获取任务奖励
            require('../api/achievement/getMissionAward')(param.body, callback);
            break;
        case 'getLevels':
            require('../api/getLevels')(param.body, callback);
            break;
        default:
            process.nextTick(function(){
                callback(new Error('请求方法不正确！'));
            });
            break;
    }
};

