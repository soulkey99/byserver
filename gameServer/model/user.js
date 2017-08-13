/**
 * Created by MengLei on 2016/1/5.
 */

var cronJob = require('cron').CronJob;
var notify = require('../utils/notify');
var createGame = require('../api/createGame');
var AI = require('./ai');
var log = require('../../utils/log').game;
var proxy = require('../../common/proxy');

function User(userID) {
    this.userID = userID;
    this.currentLevel = 1;
    this.cron = null;
    this.searchTimes = 0;
    this.init();
}

module.exports = User;

User.prototype.init = function(){
    log.trace('user init, userID: ' + this.userID);
    this.online();
    this.cronTask();
};

User.prototype.online = function(callback){
    log.trace('user online: userID: ' + this.userID);
    this.setStatus('online', callback);
};

User.prototype.tick = function(callback){
    log.trace('user tick, userID: ' + this.userID);
    this.setStatus('tick', callback);
};

User.prototype.pair = function(callback){   //配对
    log.trace('start pair, userID: ' + this.userID);
    this.searchTimes = 0;   //搜索次数重置
    this.setWaiting(callback);
    this.nextTick(3000 * (1 - 0.3 * Math.random()));
};

User.prototype.setWaiting = function (callback) {
    log.trace('set waiting, userID: ' + this.userID + ', level: ' + this.currentLevel);
    proxy.GameUser.setWaiting(this.userID, this.currentLevel, callback);
};

User.prototype.setSearching = function (callback) {
    log.trace('set waiting, userID: ' + this.userID + ', level: ' + this.currentLevel);
    proxy.GameUser.setSearching(this.userID, this.currentLevel, callback);
};

User.prototype.setStatus = function(status, callback){  //设置用户状态
    log.trace('set user status, userID: ' + this.userID + ', status: ' + status);
    proxy.GameUser.setUserStatus(this.userID, status, callback);
};

User.prototype.getWaitingUser = function(callback){    //随机获取一个等待配对的用户
    log.trace('get one waiting user randomly.');
    proxy.GameUser.getWaitingUser(this.userID, this.currentLevel, callback);
};

User.prototype.getOngoingBattle = function(callback){   //获取用户自己在进行中的游戏
    log.trace('get user ongoing game.');
    proxy.Battle.getBattleByUser({userID: this.userID, status: 'playing'}, callback);
};

User.prototype.quit = function(callback){
    log.trace('user quit, userID: ' + this.userID);
    this.setStatus('offline', callback);
};

User.prototype.cronTask = function () {     //定时任务
    var self = this;
    log.trace('cron tick, userID=' + this.userID);
    proxy.GameUser.getUserStatus(self.userID, function (err, doc) {
        if (err) {
            log.error('cron tick, userID=' + self.userID + ', error: ' + err.message);
            return;
        }
        if (doc) {
            if (doc.closing === true) {
                self.nextTick(5000);
            }
            log.trace('tick: userID: ' + self.userID + ', status: ' + doc.status);
            switch (doc.status) {
                case 'waiting': //等待被对手寻找
                    self.setSearching(function(err2){
                        if(self.searchTimes >= 2){
                            //搜寻三次没有结果，启动ai配对
                            log.trace('no pair user, start an ai');
                            createGame({users: [self.userID], level: self.currentLevel}); //创建游戏，只有一个userID，所以创建游戏的时候配对一个ai
                            return;
                        }
                        self.searchTimes ++ ;
                        if(err2){
                            log.trace('set searching error: ' + err2.message);
                            return;
                        }
                        //在这里进行寻找游戏对手
                        self.getWaitingUser(function(err3, doc3){
                            if(err3){
                                log.error('get waiting user error: ' + err3.message);
                                return;
                            }
                            if (!doc3) {
                                log.trace('no waiting user. continue.');
                                return self.nextTick(2500 * (1 - 0.3 * Math.random()));
                            }
                            //找到之后，创建游戏
                            createGame({users: [self.userID, doc3._id.toString()], level: self.currentLevel});
                            //创建游戏，需要将双方的状态都设置为准备游戏状态
                            self.setStatus('preparing');
                            require('./userPool').setStatus(doc3._id.toString(), 'preparing');
                            //下次tick的时间15秒钟后，如果都还没进入游戏，那么就返回
                            self.nextTick(15000);
                            //将对手的next tick也设置成15秒之后
                            require('./userPool').nextTick(doc3._id.toString(), 15000);
                        });
                    });
                    break;
                case 'searching':   //寻找对手
                    self.setWaiting();
                    self.nextTick(3000 * (1 - 0.3 * Math.random()));//加一个随机，免得两个用户的状态同步造成死锁
                    break;
                case 'online':  //游戏在线
                    self.nextTick();
                    break;
                case 'playing': //正在游戏
                    self.getOngoingBattle(function (err2, doc2) {
                        if (err2) {
                            return;
                        }
                        if (doc2.length == 0) {
                            self.setStatus('online');
                        }
                        self.nextTick();
                    });
                    break;
                case 'preparing':   //准备进入游戏
                    self.setStatus('online');
                    //在准备游戏的状态下，15秒没有响应，仍然停留在这个状态，那么就是说明配对失败，返回
                    notify(self.userID, 'pair', {status: 'noresponse'});
                    self.nextTick();
                    break;
                default:
                    break;
            }
        }
    });
};

User.prototype.nextTick = function(t) {
    if (!t) {
        t = 30000;
    }
    if (this.cron) {
        this.cron.stop();
        this.cron = null;
    }
    this.cron = new cronJob(new Date(Date.now() + t), run, null, true);
    var self = this;
    function run(){ //确保cronTask在执行的时候，this指向的是用户对象，并且是含有最新的cron对象
        self.cronTask.apply(self);
    }
};

