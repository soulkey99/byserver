/**
 * Created by MengLei on 2016/1/19.
 */

var cronJob = require('cron').CronJob;
var check = require('../api/check');
var mqtt = require('../utils/mqtt');
var proxy = require('../../common/proxy');
var log = require('../../utils/log').game;
//游戏中的AI，当用户匹配对手的时候，20秒钟无法匹配成功，则启动AI与其对战，一共有10个AI，其智商分别为10到100，
//对应答题正确率百分比，答题耗时为根据时间随机计算
function Ai(level){
    this.userID = '';
    this.battle_id  = '';
    this.current_question_id = '';
    this.choice = '';
    this.level = level || 1;    //启动ai对应的关卡等级，默认第1关
    this.answers = [];
    this.iq = 0.6;
    this.inteval = 3000;
    this.nick = '';
}

module.exports = Ai;

Ai.prototype.init = function(callback){
    log.trace('ai init.');
    if(!callback){
        callback = function(){};
    }
    var self = this;
    proxy.User.getAI({}, function(err, doc){
        if(err){
            log.error('init ai error: ' + err.message);
            return callback(err);
        }
        if(doc){
            self.userID = doc._id.toString();
            self.nick = doc.nick;
            self.iq = doc.userInfo.iq;
        }
        callback(null, self);
    });
};

Ai.prototype.cronTask = function() {
    var choice = '';
    if (Math.random() < this.iq) {
        choice = this.choice;
    } else {
        this.answers.splice(this.answers.indexOf(this.choice), 1);
        choice = this.answers[Math.floor(this.answers.length * Math.random())];
    }
    log.trace('ai auto check, q id: ' + this.current_question_id + ', correct answer: ' + this.choice + ', ai answer: ' + choice);
    check({
        userID: this.userID,
        battle_id: this.battle_id,
        question_id: this.current_question_id,
        choice: choice,
        time: this.inteval
    }, function (err, doc) {
        //
    });
};

Ai.prototype.join = function(){
    log.trace('ai send join msg to user');
};

Ai.prototype.nextTick = function(t, extra) {
    log.trace('next tick for game ai: ' + this.userID);
    if (!t) {
        //ai答题时间根据智商来确定，智商越高答题时间越短
        if (this.iq >= 0.95) {
            t = 800 + 1000 * Math.random();//ai答题时间随机为0.8-1.8秒
        } else if (this.iq >= 0.85) {
            t = 1300 + 2000 * Math.random();//ai答题时间随机为1.3-3.3秒
        } else if (this.iq >= 0.75) {
            t = 1800 + 3000 * Math.random();//ai答题时间随机为1.8-4.8秒
        } else if (this.iq >= 0.65) {
            t = 2300 + 3500 * Math.random();//ai答题时间随机为2.3-5.3秒
        } else if (this.iq >= 0.55) {
            t = 2800 + 4000 * Math.random();//ai答题时间随机为2.8-6.8秒
        } else if (this.iq >= 0.45) {
            t = 3300 + 4000 * Math.random();//ai答题时间随机为3.3-7.3秒
        } else if (this.iq >= 0.25) {
            t = 3300 + 6000 * Math.random();//ai答题时间随机为3.3-9.3秒
        } else {
            t = 4500 + 5000 * Math.random();//ai答题时间随机为4.5-9.5秒
        }
    }
    if (!extra) {
        //加上一些之前的各种动画消耗时间，除指定外，默认需要再多加6.8秒
        extra = 6800;
    }
    this.inteval = t;
    if (this.cron) {
        this.cron.stop();
        this.cron = null;
    }
    var self = this;
    proxy.BattleQuestion.getQuestionById(this.current_question_id, function (err, doc) {
        if (err) {
            return;
        }
        if (doc) {
            self.choice = doc.answer;
            self.answers = [];
            for (var i = 0; i < doc.choice.length; i++) {
                self.answers.push(doc.choice[i].flag);
            }
            self.cron = new cronJob(new Date(Date.now() + t + extra), run, null, true);
            log.trace('ai next tick started, current q id: ' + self.current_question_id + ', choice: ' + self.choice + ', answers: ' + self.answers.join(','));
            function run() { //确保cronTask在执行的时候，this指向的是ai对象，并且是含有最新的cron
                self.cronTask.apply(self);
            }
        }
    });
};


