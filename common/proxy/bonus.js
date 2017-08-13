/**
 * Created by MengLei on 2015/12/23.
 */
var model = require('../model');
var db = require('../../config').db;
var objectId = require('mongoose').Types.ObjectId;
var eventproxy = require('eventproxy');
var notify = require('../utils/notify');
var Bonus = model.Bonus;
var OfflineAnswer = require('./offlineTopics/offlineAnswer');

/**
 * 增加抢单积分
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', bonus: '', o_id: ''}（如果传bonus，那么）
 * @param {Function} callback 回调函数
 */
exports.grabOrder = function(param, callback) {
    if (!callback) {
        callback = function () {};
    }
    var ep = new eventproxy();
    ep.all('bonus', function (bonus) {
        var b = new Bonus({userID: param.userID, bonus: bonus, type: '2', detail: {o_id: param.o_id, desc: '抢答获取积分奖励'}});
        //保存积分记录
        b.saveBonus(callback);
        //同时通知教师端，已经获得抢单积分
        notify({dest: param.userID, body: {action: 'bonus', content: {bonus: bonus, type: 'grabOrder'}}});
    });
    ep.fail(callback);
    if(param.bonus != undefined){
        return ep.emit('bonus', parseInt(param.bonus));
    }
    db.byConfig.findOne({'_id': 'bonusConfig'}, ep.done('bonus', function(doc){
        if(doc && doc.config){
            return doc.config.grabOrder;
        }
        return 10;
    }));
};

/**
 * 增加提问积分
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', bonus: '', o_id}
 * @param {Function} callback 回调函数
 */
exports.genOrder = function(param, callback){
    if (!callback) {
        callback = function () {};
    }
    var ep = new eventproxy();
    ep.all('bonus', function (bonus) {
        var b = new Bonus({userID: param.userID, bonus: bonus, type: '3', detail: {o_id: param.o_id, desc: '提问获取积分奖励'}});
        //保存积分记录
        b.saveBonus(callback);
        //同时通知学生端，已经获得提问积分
        notify({dest: param.userID, body: {action: 'bonus', content: {bonus: bonus, type: 'genOrder'}}});
    });
    ep.fail(callback);
    if(param.bonus != undefined){
        return ep.emit('bonus', parseInt(param.bonus));
    }
    db.byConfig.findOne({'_id': 'bonusConfig'}, ep.done('bonus', function(doc){
        if(doc && doc.config){
            return doc.config.genOrder;
        }
        return 5;
    }));
};

/**
 * 增加首次注册奖励积分
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', bonus: '', desc: ''}
 * @param {Function} callback 回调函数
 */
exports.newReg = function(param, callback){
    if (!callback) {
        callback = function () {};
    }
    var ep = new eventproxy();
    ep.all('bonus', function (bonus) {
        var b = new Bonus({userID: param.userID, bonus: bonus, type: '0', detail: {desc: param.desc || '新用户注册奖励'}});
        //保存积分记录
        b.saveBonus(callback);
    });
    ep.fail(callback);
    if(param.bonus != undefined){
        return ep.emit('bonus', parseInt(param.bonus));
    }
    db.byConfig.findOne({'_id': 'bonusConfig'}, ep.done('bonus', function(doc){
        if(doc && doc.config){
            return doc.config.newReg;
        }
        return 50;
    }));
};


/**
 * 增加补全资料积分
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', bonus: '', o_id}
 * @param {Function} callback 回调函数
 */
exports.fillProfile = function(param, callback){
    if (!callback) {
        callback = function () {};
    }
    var ep = new eventproxy();
    ep.all('bonus', function (bonus) {
        getLastBonusRecord({userID: param.userID, type: '1'}, function(err, doc){
            if(err){
                return callback(err);
            }
            if(!doc){   //（只得一次）没增加过积分的人才会增加
                var b = new Bonus({userID: param.userID, bonus: bonus, type: '1', detail: {desc: '完善个人资料奖励'}});
                //保存积分记录
                b.saveBonus(callback);
            }else{
                callback(null, false);
            }
        });
    });
    ep.fail(callback);
    if(param.bonus != undefined){
        return ep.emit('bonus', parseInt(param.bonus));
    }
    db.byConfig.findOne({'_id': 'bonusConfig'}, ep.done('bonus', function(doc){
        if(doc && doc.config){
            return doc.config.fillProfile;
        }
        return 50;
    }));
};


/**
 * 增加邀请奖励积分
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', u_id: '被邀请的用户id'}
 * @param {Function} callback 回调函数
 */
exports.inviteUser = function(param, callback){
    if (!callback) {
        callback = function () {};
    }
    var ep = new eventproxy();
    ep.all('bonus', function (bonus) {
        var b = new Bonus({userID: param.userID, bonus: bonus, type: '8', detail: {desc: '邀请用户得奖励积分'}});
        //保存积分记录
        b.saveBonus(callback);
    });
    ep.fail(callback);
    if(param.bonus != undefined){
        return ep.emit('bonus', parseInt(param.bonus));
    }
    db.byConfig.findOne({'_id': 'bonusConfig'}, ep.done('bonus', function(doc){
        if(doc && doc.config){
            return doc.config.inviteUser;
        }
        return 30;
    }));
};


/**
 * 手动增加、扣减积分，type=9
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', reason: '', bonus: ''}
 * @param {Function} [callback] 回调函数
 */
exports.decBonus = function(param, callback) {
    if (!callback) {
        callback = function () {
        };
    }
    var bonus = parseInt(param.bonus || '100');//如果没传默认扣除100分
    var b = new Bonus({userID: param.userID, bonus: bonus, type: '9', detail: {desc: '扣减积分'}});
    if (param.reason) {
        b.detail.desc = param.reason;
    }
    //保存积分记录
    b.saveBonus(callback);
};


/**
 * 打赏教师扣减积分，type=11
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', bonus: '', o_id: ''}
 * @param {Function} callback 回调函数
 */
exports.rewardTeacher = function(param, callback) {
    var bonus = 0 - parseInt(param.bonus || 100);
    var b = new Bonus({userID: param.userID, bonus: bonus, type: '11', detail: {desc: '打赏教师积分抵扣金额', o_id: param.o_id}})
    b.saveBonus(callback);
};


/**
 * 积分商城兑换商品扣减积分，type=4
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', goodId: '', goodName: '', goodType: '', bonus: '', deliver: '', detail: ''}
 * @param {Function} callback 回调函数
 */
exports.exchangeBonus = function(param, callback) {
    var bonus = 0 - parseInt(param.bonus || 100);
    var b = new Bonus({userID: param.userID, bonus: bonus, type: '4', detail: {desc: '兑换商品消费积分', o_id: param.o_id}});
    b.saveBonus(callback);
};


/**
 * 点赞增加积分、取消点赞扣除积分（对答案的作者）
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', bonus: '', answer_id: '', action: ''}
 * @param {Function} [callback] 回调函数
 */
exports.upAnswer = function(param, callback) {
    if (!callback) {
        callback = function () {
        };
    }
    var ep = new eventproxy();
    ep.all('bonus', 'author', function (bonus, author) {
        var detail = {desc: '', action: param.action, answer_id: param.answer_id, u_id: param.userID};
        switch (param.action) {
            case 'cancelup':
            {
                detail.desc = '离线答案被取消赞扣除积分';
            }
                break;
            case 'up':
            {
                detail.desc = '离线答案被点赞得积分';
            }
                break;
            default:
                return callback();
        }
        var b = new Bonus({userID: author, bonus: bonus, type: '6', detail: detail});
        //保存积分记录
        b.saveBonus(callback);
    });
    ep.fail(callback);
    if (param.bonus != undefined) {
        return ep.emit('bonus', parseInt(param.bonus));
    }
    OfflineAnswer.getOfflineAnswerByID(param.answer_id, ep.done('author', function(doc) {
        if (!doc) {
            ep.unbind();
            return callback();
        }
        return doc.author_id;
    }));
    if (param.action == 'up') {
        //如果是点赞，那么去配置库中获取应该增加多少分
        db.byConfig.findOne({'_id': 'bonusConfig'}, function (err, doc) {
            if (err) {
                return ep.throw(err);
            }
            var offlineAnswerUp = 1, offlineAnswerUpAfter = 5, offlineAnswerUpAfterBonus = 2;
            if (doc && doc.config) {
                offlineAnswerUp = doc.config.offlineAnswerUp || offlineAnswerUp;
                offlineAnswerUpAfter = doc.config.offlineAnswerUpAfter || offlineAnswerUpAfter;
                offlineAnswerUpAfterBonus = doc.config.offlineAnswerUpAfterBonus || offlineAnswerUpAfterBonus;
            }
            OfflineAnswer.getOfflineAnswerByID(param.answer_id, function (err2, doc2) {
                if (err2) {
                    return ep.throw(err2);
                }
                if (!doc2) {//答案不存在，直接返回
                    ep.unbind();//卸载ep的绑定
                    return callback();
                }
                var bonus = offlineAnswerUp;
                if (doc2.ups.length > offlineAnswerUpAfter) {
                    bonus = offlineAnswerUpAfterBonus;
                }
                ep.emit('bonus', bonus);
            });
        });
    } else if (param.action == 'cancelup') {
        //如果是取消点赞，那么去获取该用户点赞的时候增加的分数，作为取消时扣减的分数
        getLastBonusRecord({'userID': param.userID,'answer_id': param.answer_id, type: '6'}, ep.done('bonus', function (doc) {
            if (!doc) {   //如果没找到之前的加分记录，那么取消点赞也不扣积分
                return 0;
            }
            return 0 - doc.bonus;
        }))
    }else{
        //action错误，直接卸载ep的绑定并返回
        ep.unbind();
        callback();
    }
};


/**
 * 增加积分
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', bonus: '', o_id}
 * @param {Function} callback 回调函数
 */
exports.grabOrderBonus = function(param, callback){}


/**
 * 增加积分
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', bonus: '', o_id}
 * @param {Function} callback 回调函数
 */
exports.grabOrderBonus = function(param, callback){}


/**
 * 增加积分
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', bonus: '', o_id}
 * @param {Function} callback 回调函数
 */
exports.grabOrderBonus = function(param, callback){};

/**
 * 获取指定用户制定操作类型的最后一条积分记录
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{userID: '', answer_id: '', type: '', off_id: '', answer_reply_id: ''}
 * @param {Function} callback 回调函数
 */
function getLastBonusRecord(param, callback) {
    var query = {'detail.u_id': param.userID, 'detail.answer_id': param.answer_id, type: param.type};
    Bonus.find(query, {}, {limit: 1, sort: '-detail.t'}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, doc[0]);
    });
}

exports.getLastBonusRecord = getLastBonusRecord;