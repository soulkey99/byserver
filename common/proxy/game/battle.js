/**
 * Created by MengLei on 2016/1/6.
 */
"use strict";
var model = require('../../model');
var Battle = model.Battle;
var eventproxy = require('eventproxy');
var QuestionProxy = require('../battleQuestion');
var UserProxy = require('../user/user');
var GameUserRecordProxy = require('./userRecord');

/**
 * 根据battle_id查询游戏内容
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} id battle_id
 * @param {Function} callback 回调函数
 */
exports.getBattleByID = function(id, callback){
    Battle.findOne({_id: id}, callback);
};

/**
 * 根据query查询游戏内容
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} query 查询条件
 * @param {Object} opt 限制参数
 * @param {Function} callback 回调函数
 */
exports.getBattleByQuery = function(query, opt, callback){
    Battle.find(query, {}, opt, callback);
};

/**
 * 根据battle_id查询游戏详情
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} id battle_id
 * @param {Function} callback 回调函数
 */
exports.getBattleDetail = function(id, callback){
    Battle.findOne({_id: id}, function(err, doc){
        if(err){
            return callback(err);
        }
        if(!doc){
            return callback();
        }
        var battle = doc.toObject({getters: true});
        var ep = new eventproxy();
        ep.fail(callback);
        ep.after('question', battle.questions.length, function(list){
            for(var i=0; i<list.length; i++){
                for(var j=0; j<battle.questions.length; j++){
                    if(list[i].question_id == battle.questions[j].question_id){
                        battle.questions[j].category = list[i].category;
                        battle.questions[j].contributor = list[i].contributor;
                        battle.questions[j].answer = list[i].answer;
                        battle.questions[j].layout = list[i].layout;
                        battle.questions[j].choice = list[i].choice;
                        battle.questions[j].question = list[i].question;
                        battle.questions[j].copyRight = list[i].copyRight;
                        battle.questions[j].difficulty = list[i].difficulty;
                    }
                }
            }
            var ep2 = new eventproxy();
            ep2.after('user', battle.users.length, function(users){
                var userInfo = [];
                for(var i=0; i<users.length; i++){
                    userInfo.push({userID: users[i]._id.toString(), nick: users[i].nick, avatar: users[i].userInfo.avatar});
                }
                battle.userInfo = userInfo;
                callback(null, battle);
            });
            ep2.fail(callback);
            for(var k=0; k<battle.users.length; k++){
                UserProxy.getUserById(battle.users[k], ep2.done('user'));
            }
        });
        for(var i=0; i<battle.questions.length; i++){
            QuestionProxy.getQuestionById(battle.questions[i].question_id, ep.done('question'));
        }
    });
};

/**
 * 根据userID查询游戏列表
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} id battle_id
 * @param {String} status 游戏状态
 * @param {Function} callback 回调函数
 */
exports.setStatus = function(id, status, callback) {
    if (!callback) {
        callback = function () {
        };
    }
    Battle.findOne({_id: id}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback();
        }
        doc.status = status;
        if (status == 'finished') {
            //这里需要计算胜利者，存储到winner字段下
            var uObj = {};
            uObj[doc.users[0]] = 0;
            uObj[doc.users[1]] = 0;
            for (let i = 0; i < doc.questions.length; i++) {
                for (let j = 0; j < doc.questions[i].users.length; j++) {
                    uObj[doc.questions[i].users[j].userID] += doc.questions[i].users[j].point;
                }
            }
            // console.log('userID: ' + doc.users[0] + ', point: ' + uObj[doc.users[0]]);
            // console.log('userID: ' + doc.users[1] + ', point: ' + uObj[doc.users[1]]);
            let winner = (uObj[doc.users[0]] > uObj[doc.users[1]] ? doc.users[0] : (uObj[doc.users[0]] < uObj[doc.users[1]] ? doc.users[1] : ""));
            let loser = (uObj[doc.users[1]] > uObj[doc.users[0]] ? doc.users[0] : (uObj[doc.users[1]] < uObj[doc.users[0]] ? doc.users[1] : ""));
            //一局结束，计算游戏双方的各项参数情况
            if (winner) { //如果有人胜利
                //1.脑力
                let intellectual = 10;  //基础分10分
                let winIndex = [];
                for (let i = 0; i < doc.questions.length; i++) { //先计算最大 连胜
                    for (let j = 0; j < doc.questions[i].users.length; j++) {
                        if (doc.questions[i].users[j].userID == winner) {
                            if (doc.questions[i].users[j].answer == doc.questions[i].users[j].choice) {
                                winIndex.push(1);
                            } else {
                                winIndex.push(0);
                            }
                        }
                    }
                }
                let maxWin = 0;
                if (winIndex.length > 0) {
                    let k = 0;
                    for (let i = 0; i < winIndex.length; i++) {
                        if (winIndex[i] - winIndex[i - 1] == 1) {
                            k++;
                        } else {
                            maxWin = Math.max(maxWin, k);
                            k = 0;
                        }
                    }
                    maxWin = Math.max(maxWin, k) + 1;
                }
                intellectual += intellectual * (maxWin + 3) / 100;
                //todo;题目难度对应脑力暂时先没加
                //2.学分，只有赢家得学分，题目对应关卡抵押学分数的2倍（即取回自己的抵押并得到对方的抵押部分）
                GameUserRecordProxy.addBonus({
                    userID: winner,
                    bonus: 2 * levelBonus(doc.level),
                    intellectual: intellectual,
                    desc: '对战胜利获得积分与脑力'
                });
                GameUserRecordProxy.endGame(winner, 'win');
                GameUserRecordProxy.endGame(loser, 'lose');
                doc.winner = winner;    //记录胜利者id
                // console.log('winner: ' + winner + ', intellectual: ' + intellectual + ', bonus: ' + 2*levelBonus(doc.level));
            } else {//如果没有胜利者，那么双方只取回属于自己的抵押部分
                for (let i = 0; i < doc.users.length; i++) {
                    GameUserRecordProxy.addBonus({
                        userID: doc.users[i],
                        bonus: levelBonus(doc.level),
                        desc: '对战平局返还抵押积分'
                    });
                    GameUserRecordProxy.endGame(doc.users[i], 'draw');
                    GameUserRecordProxy.endGame(doc.users[i], 'draw');
                }
                // console.log('no winner.');
            }
        }
        doc.save(callback);
    });
};


/**
 * 根据userID查询游戏列表
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} id battle_id
 * @param {Function} callback 回调函数
 */
exports.getBattleQuestions = function(id, callback) {
    Battle.findOne({_id: id}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback();
        }
        doc.status = 'playing';
        doc.save(function () {
        });
        var battle = doc.toObject({getters: true});
        var ep = new eventproxy();
        ep.fail(callback);
        ep.after('question', battle.questions.length, function (list) {
            var q_list = [];
            for (var i = 0; i < battle.questions.length; i++) {
                for (var j = 0; j < list.length; j++) {
                    if (battle.questions[i].question_id == list[j].question_id) {
                        q_list.push({
                            question_id: list[j].question_id,
                            category: list[j].category,
                            contributor: list[j].contributor,
                            answer: list[j].answer,
                            layout: list[j].layout,
                            choice: list[j].choice.toObject(),
                            question: list[j].question.toObject(),
                            copyRight: list[j].copyRight,
                            difficulty: list[j].difficulty
                        });
                    }
                }
            }
            callback(null, {battle_id: id, users: battle.users, list: q_list});
        });
        for (var i = 0; i < battle.questions.length; i++) {
            QuestionProxy.getQuestionById(battle.questions[i].question_id, ep.done('question'));
        }
    });
};

/**
 * 根据userID查询游戏列表
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param 参数 {userID: '', startPos: '', pageSize: '', status: ''}
 * @param {Function} callback 回调函数
 */
exports.getBattleByUser = function(param, callback) {
    var start = 0;
    var count = 10;
    var query = {user: param.userID};
    if (param.startPos) {
        start = parseInt(param.startPos) - 1;
        if (start < 0) {
            start = 0;
        }
    }
    if (param.status) {
        query['status'] = param.status;
    }
    if (param.pageSize) {
        count = parseInt(param.pageSize);
    }
    Battle.find(query, {}, {sort: '-createTime', skip: start, limit: count}, callback);
};

/**
 * 创建一个对战
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {Object} param 参数{status: '', users: [], level: '关卡级别'}
 * @param {Function} callback 回调函数
 */
exports.createBattle = function(param, callback){
    //每个关卡选题数量是N+4
    QuestionProxy.getQuestionRandom({count: param.level + 4}, function(err, doc){
        if(err){
            return callback(err);
        }
        var battle = new Battle({status: param.status || 'preparing', level: param.level, users: param.users, questions: [], winner: ''});
        for(var i=0; i<doc.length; i++){
            battle.questions.push({question_id: doc[i].question_id, users: []});
        }
        for(var j=0; j<battle.questions.length; j++){
            delete(battle.questions[j]._id);
        }
        battle.save(function(err2, doc2){
            if(err2){
                return callback(err2);
            }
            callback(null, {battle_id: doc2._id.toString(), questions: doc});
        });
    });
};

//计算关卡等级对应的需抵押学分
function levelBonus(level){
    return floor((Math.pow((level - 1), 4) + 10) / 10 * ((level - 1) * 2 + 10) + 20, 20);
}

//FLOOR算法
function floor(num, sig){
    if(!sig){
        sig = 1;
    }
    return sig * Math.floor(num /sig);
}
