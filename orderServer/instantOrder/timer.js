/**
 * Created by MengLei on 2015/8/12.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var cronJob = require('cron').CronJob;
var log = require('./../../utils/log').order;
var dnode = require('../utils/dnodeClient');
var zrpc = require('../../utils/zmqClient');
var proxy = require('../../common/proxy');
var setOrderStatus = require('./setOrderStatus');
var notify = require('./../notify');
var badgeUtil = require('../utils/badgeUtil');
var freePush = require('./freePush2');

//订单定时器
function Timer(o_id) {
    this.pendingCount = 0; //推送计数器
    this.pendingCronCount = 0;//定时器计数器
    this.receivedCronCount = 0;
    this.o_id = o_id;
    this.s_id = '';
    this.t_id = '';
    this.type = '';
    this.create_time = 0;
    this.start_time = 0;
    this.duration = 600000;
    this.status = '';
    this.badges = [];

    this.init();//初始化
}

module.exports = Timer;

Timer.prototype.init = function(){
    this.cronTask(); //立刻触发一次任务，之后根据定时器触发任务
};

Timer.prototype.cronTask = function() {
    var self = this;
    proxy.Order.getOrderByID(this.o_id, function (err, doc) {
        var d2 = new Date();
        var t2 = Date.now();
        if (err) {
            return log.trace('order cron task o_id ' + self.o_id + ' timer error: ' + err.message);
        }
        if (!doc) {
            //订单不存在
            return log.error('timer, cron task o_id not exists. o_id=' + o_id);
        }
        self.s_id = doc.s_id;
        self.t_id = doc.t_id;
        self.create_time = doc.create_time;
        self.start_time = doc.start_time;
        self.duration = doc.duration;
        self.status = doc.status;
        self.type = doc.type;
        self.badges = doc.badges;
        log.trace('timer one tick. o_id = ' + self.o_id + ', status = ' + self.status);
        //以下就是订单存在的情况，判断订单状态，分别执行不同操作
        switch (self.status){
            case 'pending':
            {//如果订单状态是推送中，那么需要判断订单的本次tick是否需要执行推送动作，还是仅仅启动下次tick
                if(t2 - self.create_time + 2000 > config.pendingTime){//加一个2秒钟的buffer
                    //如果当前时间减去订单创建时间超出推送时长，那么将订单状态设置为超时，同时发送mqtt消息
                    log.trace('set to timeout, o_id=' + self.o_id);
                    setOrderStatus(self.o_id, 'timeout');
                    return;
                }
                //从订单创建时间开始，每隔config.pendingInterval时间间隔推送一次，这里进行计算是否执行推送动作，同时预留2000毫秒的buffer，以免出现问题
                var pushTimes = (t2 - self.create_time) / config.pendingInterval;  //计算出的推送次数
                if (Math.abs(self.create_time - (t2 - Math.round(pushTimes) * config.pendingInterval)) < 2000) {
                    //这里执行推送动作
                    log.trace('o_id = ' + self.o_id + ', order status = pending, start push and the next cron job.');
                    freePush(self.o_id);
                    //推送后，则直接下次tick
                    self.nextTick(self.create_time + (Math.round(pushTimes) + 1) * config.pendingInterval);
                    return;
                }
                //启动下次tick计时器
                self.nextTick(self.create_time + Math.ceil(pushTimes) * config.pendingInterval);
                return;
            }
                break;
            case 'received':
            case 'toBeFinished':
            { //如果订单是received/toBeFinished状态，那么需要在这里只需要每分钟tick一次就好了，然后判断订单是否发送倒计时三分钟、两分钟、一分钟的通知，以及是否自动结束订单
                if (t2 - self.start_time > self.duration) {//答题超过时长，自动结束
                    log.trace('timer, received/toBeFinished auto set to finished. o_id: ' + self.o_id);
                    setOrderStatus(self.o_id, 'finished');
                    //如果订单完成，则直接走这一分支
                    badgeUtil.calcFinal(self.o_id);
                    return;
                }
                //没超时，则启动下一轮tick
                self.nextTick();
                //设置徽章状态
                self.badge();
            }
                break;
            default:
            {
                //其他状态的订单，计时器不进行继续的动作
                log.info('timer, o_id = ' + self.o_id + ' other tick: ' + (t2 - self.start_time).toString() + ', status = ' + self.status);
            }
                break;
        }
    });
};

//计算计时器下一次tick的时间（每分钟一次tick）
Timer.prototype.nextTick = function (t) {
    var t2 = Date.now();
    var interval = 60000;   //默认interval
    if((this.status == 'received' || this.status == 'toBeFinished') && (t2 - this.start_time < this.duration)){//订单有效周期内
        var r = Math.round((this.start_time + this.duration - t2) / 60000);
        log.trace('timer, received/toBeFinished tick, o_id = ' + this.o_id + ' ' + r.toString() + ' minutes left.');
        //计算倒计时三分钟、两分钟、一分钟消息
        switch (r) {
            case 1:
            {
                sendOrderState({o_id: this.o_id, status: '1minutes', userType: 'teacher'}, this.t_id);
                sendOrderState({o_id: this.o_id, status: '1minutes', userType: 'student'}, this.s_id);
            }
                break;
            case 2:
            {
                sendOrderState({o_id: this.o_id, status: '2minutes', userType: 'teacher'}, this.t_id);
                sendOrderState({o_id: this.o_id, status: '2minutes', userType: 'student'}, this.s_id);
            }
                break;
            case 3:
            {
                sendOrderState({o_id: this.o_id, status: '3minutes', userType: 'teacher'}, this.t_id);
                sendOrderState({o_id: this.o_id, status: '3minutes', userType: 'student'}, this.s_id);
            }
                break;
            default :
                break;
        }
    }
    if (!t) {
        switch (this.status){
            case 'pending':
                t = this.create_time + Math.ceil((t2 - this.create_time) / config.pendingInterval) * config.pendingInterval;
                break;
            case 'received':
            case 'toBeFinished':
                t = this.start_time + Math.ceil((t2 - this.start_time) / interval) * interval;
                break;
        }
    }
    if (this.cron) {
        this.cron.stop();
        this.cron = null;
    }
    this.cron = new cronJob(new Date(t), run, null, true);
    var self = this;
    function run(){ //确保cronTask在执行的时候，this指向的是timer自己的对象，并且是含有最新的cron对象
        self.cronTask.apply(self);
    }
};


//计算badge状态
Timer.prototype.badge = function(){
    var t2 = Date.now();
    switch (this.status){
        case 'received':
        case 'toBeFinished':
        {
            if(t2 - this.start_time + 2000 > 300000){   //超过5分钟，得到一个徽章（加两秒钟的buffer）
                for(var i=0; i<this.badges.length; i++){
                    if(this.badges[i].id == 'fiveminute' && (!this.badges[i].is_on)){//五分钟徽章还没亮，那么就点亮徽章
                        badgeUtil.setBadge(this.o_id, 'fiveminute');
                    }
                }
            }
        }
            break;
        default:
            break;
    }
};

//向用户发送订单状态信息
function sendOrderState(content, to) {
    zrpc('mqttServer', 'setOrder', {content: content, to: to}, function (err, resp) {
        //
        if (err) {
            log.error('set order error: ' + err.message);
        } else {
            log.trace('timer, set order result to: ' + content.userType + ' ' + to + ', resp=' + JSON.stringify(resp));
        }
    });
}





