/**
 * Created by MengLei on 2016/1/5.
 */

var proxy = require('./../../common/proxy');
var notify = require('./../utils/notify');
var battlePool = require('../model/battlePool');
var log = require('./../../utils/log').game;

//获取问答题目，param = {userID: '', battle_id: ''}
module.exports = function(param, callback) {
    proxy.Battle.getBattleQuestions(param.battle_id, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (doc) {
            //在获取问答题目延迟一秒钟后，将用户状态设置为已经开始游戏，并通知对方
            setTimeout(function () {
                battlePool.join(param);
            }, 500);
        }
        callback(null, doc);
    });
};

