/**
 * Created by MengLei on 2016/1/7.
 */

var cronJob = require('cron').CronJob;
var notify = require('../utils/notify');
var proxy = require('../../common/proxy');
var log = require('../../utils/log').game;
var redis = require('../utils/redis');

function Battle(battle_id, ai) {
    var self = this;
    this.battle_id = battle_id;
    this.cron = null;
    this.battle = null;
    this.start_time = 0;
    this.current_question_id = '';
    this.current_check_times = 0;
    this.users = {};
    this.userBonus = {};
    this.ai = ai;
    this.questions = {};

    proxy.Battle.getBattleByID(self.battle_id, function (err, doc) {
        if (err) {
            log.error('battle constructor error: ' + err.message);
            return;
        }
        if(!doc){
            log.error('battle constructor, no battle for id: ' + self.battle_id);
            return;
        }
        if (doc) { //游戏的初始化状态
            self.battle = doc.toObject();
            for (var i = 0; i < self.battle.questions.length; i++) {
                var q_item = {
                    question_id: self.battle.questions[i].question_id,
                    is_last: (i == self.battle.questions.length - 1),
                    users: {},
                    start_time: 0,
                    check_count: 0
                };
                for (var j = 0; j < self.battle.users.length; j++) {
                    q_item.users[self.battle.users[j]] = '';
                }
                self.questions[self.battle.questions[i].question_id] = q_item;
                if (i == 0) {
                    self.current_question_id = q_item.question_id;
                }
            }
            //记录对战双方是否进入游戏状态
            for (var k = 0; k < self.battle.users.length; k++) {
                self.users[self.battle.users[k]] = 'preparing';
            }
            //redis.setex('game/' + self.battle_id, 180, JSON.stringify(self.battle), function (err, doc) {
            //    log.trace(err);
            //    log.trace(doc);
            //});
            self.cronTask();
        }
    });
}

module.exports = Battle;

Battle.prototype.join = function (u_id) { //用户加入游戏，通知对手，如果双方都加入游戏，则开始游戏
    log.trace('battle, join game userID: ' + u_id);
    this.users[u_id] = 'playing';
    require('./userPool').setStatus(u_id, 'playing');
    this.users[u_id] = 'playing';
    if (this.ai) {
        log.trace('battle, join game with an ai, auto set ai status.');
        this.users[this.ai.userID] = 'playing';
    }
    for (var i = 0; i < this.battle.users.length; i++) {
        if (u_id != this.battle.users[i]) {
            notify(this.battle.users[i], 'joinGame', {battle_id: this.battle_id, userID: u_id});
            if (this.users[u_id] == 'playing' && this.users[this.battle.users[i]] == 'playing') {
                log.trace('battle, join game, both joined, ready to start.');
                //双方都在游戏中，可以开始游戏
                this.start();
            }
        }
    }

};

Battle.prototype.tick = function () {
    //
};

Battle.prototype.stop = function () {
    if (this.cron) {
        this.cron.stop();
    }
};

Battle.prototype.start = function () {    //开始游戏
    log.trace('battle, start game.');
    this.setStatus('playing');
    this.start_time = Date.now();
    //通知双方开始游戏
    notify(this.battle.users[0], 'startGame', {battle_id: this.battle_id});
    notify(this.battle.users[1], 'startGame', {battle_id: this.battle_id});
    //记录游戏开始数据
    proxy.GameUserRecord.startGame(this.battle.users[0]);
    proxy.GameUserRecord.startGame(this.battle.users[1]);
    //双方积分置为0
    this.userBonus[this.battle.users[0]] = 0;
    this.userBonus[this.battle.users[1]] = 0;
    //预留出一些buffer，这里每道题的时间设定为11秒（再加上一些之前的各种动画消耗时间，第一题需要再多加7.8秒）
    this.nextTick(11000 + 7800);
    if (this.ai) {
        log.trace('battle, start game, with ai: ' + this.ai.userID);
        this.ai.battle_id = this.battle_id;
        this.ai.current_question_id = this.current_question_id;
        this.ai.nextTick(1500, 7800);
    }
};

Battle.prototype.check = function (q_id, u_id, choice, time, point) {    //某道题选择答案
    var self = this;
    log.trace('check quesiton, q_id: ' + q_id + ', cur q_id: ' + this.current_question_id);
    if (q_id == this.current_question_id) {
        this.current_check_times++;
        if (this.current_check_times == 2) {
            //两个人都答题完毕，进入下一题
            this.nextQuestion();
        }
    }
    if (point > 0) {  //积分大于0，就是回答正确
        this.userBonus[this.battle.users[0]] += point;
        proxy.GameUserRecord.checkQuestion(u_id);
    }
};

Battle.prototype.setStatus = function (status, callback) {
    this.status = status;
    log.trace('set status: ' + this.status);
    proxy.Battle.setStatus(this.battle_id, status, callback);
};

Battle.prototype.isLast = function (q_id) {
    //
};

Battle.prototype.nextQuestion = function () {
    log.trace('next question, cur id: ' + this.current_question_id + ', check time: ' + this.current_check_times);
    var ids = Object.keys(this.questions);
    for (var i = 0; i < ids.length; i++) {
        if (ids[i] == this.current_question_id) {
            this.current_question_id = ids[i + 1];
            this.current_check_times = 0;
            log.trace('change cur id to: ' + this.current_question_id + ', index: ' + i);
            if (this.current_question_id) {
                //如果id有值，那么就是进入下一题，否则就是已经答题结束，向双方发送答题结束的消息
                //加上一些之前的各种动画消耗时间，除第一题外，需要再多加6.8秒
                this.nextTick(11000 + 6800);
                notify(this.battle.users[0], 'nextQuestion', {
                    battle_id: this.battle_id,
                    question_id: this.current_question_id
                });
                notify(this.battle.users[1], 'nextQuestion', {
                    battle_id: this.battle_id,
                    question_id: this.current_question_id
                });
                if (this.ai) {
                    //如果有ai，那么操作ai进行下一次答题的步骤
                    this.ai.current_question_id = this.current_question_id;
                    this.ai.choice = this.choice;
                    this.ai.nextTick();
                }
            } else {
                //如果id没有值，那就表示已经答题结束，通知双方并且将
                notify(this.battle.users[0], 'endGame', {battle_id: this.battle_id});
                notify(this.battle.users[1], 'endGame', {battle_id: this.battle_id});
                this.setStatus('finished');
                require('./battlePool').remove(this.battle_id);
            }
            break;
        }
    }
};

Battle.prototype.cronTask = function () {    //定时任务
    //redis.get('game/' + this.battle_id, function (err, doc) {
    //    if (err) {
    //        return;
    //    }
    //    var battle = JSON.parse(doc);
    //});
    if (this.status == 'playing') {
        this.nextQuestion();
    }
};

Battle.prototype.nextTick = function (t) {
    log.trace('next tick, cur q_id: ' + this.current_question_id);
    if (!t) {
        t = 5000;
    }
    if (this.cron) {
        this.cron.stop();
        this.cron = null;
    }
    this.cron = new cronJob(new Date(Date.now() + t), run, null, true);
    var self = this;

    function run() { //确保cronTask在执行的时候，this指向的是Battle对象，并且是含有最新的cron对象
        self.cronTask.apply(self);
    }
};


