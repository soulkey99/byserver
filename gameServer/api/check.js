/**
 * Created by MengLei on 2016/1/7.
 */
var proxy = require('../../common/proxy');
var eventproxy = require('eventproxy');
var notify = require('../utils/notify');
var battlePool = require('../model/battlePool');
var log = require('../../utils/log').game;
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var BattleModel = require('../../common/model').Battle;

var SubUserSchema = new Schema({
    userID: {type: String},
    choice: {type: String},
    answer: {type: String},
    time: {type: Number},
    point: {type: Number}
}, {_id: false});

var SubModel = mongoose.model('submodel', SubUserSchema);

//问题选择答案，param = {userID; '', battle_id: '', question_id: '', choice: '', time: ''}
module.exports = function(param, callback) {
    log.trace('check question, userID: ' + param.userID + ', battle id: ' + param.battle_id + ', question id: ' + param.question_id + ', choice: ' + param.choice + ', time: ' + param.time);
    var ep = new eventproxy();
    ep.all('question', 'battle', function (question, battle) {
        var point = 0;
        if (question.answer == param.choice) {
            //选项正确
            point = 200 - Math.floor(param.time / 1000) * 10;
        }
        var obj = new SubModel({
            userID: param.userID,
            choice: param.choice,
            answer: question.answer,
            time: parseFloat(param.time),
            point: point
        });
        for (var i = 0; i < battle.questions.length; i++) {
            if (param.question_id == battle.questions[i].question_id) {
                if (battle.questions[i].users.length == 0) {
                    battle.questions[i].users.push(obj);
                } else {
                    var needPush = true;
                    for (var j = 0; j < battle.questions[i].users.length; j++) {
                        if (battle.questions[i].users[j].userID == param.userID) {
                            needPush = false;
                            battle.questions[i].users.splice(j, 1, obj);
                        }
                    }
                    if(needPush){
                        battle.questions[i].users.push(obj);
                    }
                }
            }
        }
        battle.save(function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, point);
            for (var k = 0; k < battle.users.length; k++) {
                if (battle.users[k] != param.userID) {
                    notify(battle.users[k], 'choice', {
                        userID: param.userID,
                        battle_id: param.battle_id,
                        question_id: param.question_id,
                        time: Math.floor(param.time/1000) * 1000,
                        choice: param.choice,
                        point: point
                    });
                }
            }
            battlePool.check(param.battle_id, param.question_id, param.userID, param.choice, parseFloat(param.time), point);
        });
    });
    ep.fail(callback);
    proxy.BattleQuestion.getQuestionById(param.question_id, ep.done('question'));
    proxy.Battle.getBattleByID(param.battle_id, ep.done('battle'));
};


