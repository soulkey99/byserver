/**
 * Created by MengLei on 2015/8/14.
 */

var config = require('./../config');
var db = require('./../config').db;
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var log = require('./../utils/log').order;

//增加/减少用户积分，同时增加一条积分记录
//userID：用户id，count：积分数（为负则减），operType：操作类型，detail：详细信息
//operType: 0：新用户注册奖励，1：完善个人资料，2：抢答，3：提问，4：回答获5星好评，5：问题被关注，6：答案被赞，7：签到得积分，8：邀请用户得积分，9：管理扣分，10：关注用户。
//11：打赏老师减积分，12：被打赏得积分
module.exports = function(userID, operType, detail) {
    if (!detail) {
        detail = {};
    }
    detail.t = (new Date()).getTime();

    log.trace('add bonus operation, userID: ' + userID + ', operType: ' + operType + ', detail: ' + JSON.stringify(detail));
    db.byConfig.findOne({'_id': 'bonusConfig'}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            if (doc && doc.config) {
                var bonus = 0;

                switch (operType) {
                    case '0'://新用户注册
                        detail.desc = '新用户注册奖励';
                        bonus = doc.config.newReg;
                        break;
                    case '1'://完善个人信息
                        detail.desc = '完善个人资料奖励';
                        bonus = doc.config.fillProfile;
                        break;
                    case '2'://抢单
                        detail.desc = '抢答获取积分奖励';
                        bonus = doc.config.grabOrder;
                        break;
                    case '3'://提问
                        detail.desc = '提问获取积分奖励';
                        bonus = doc.config.genOrder;
                        break;
                    case '4'://回答获好评
                        remark5StarBonus(userID, detail);
                        return;
                    case '5'://关注离线问题
                        watchTopicBonus(userID, detail);
                        return;
                    case '6'://离线答案点赞
                        upAnswerBonus(userID, detail);
                        return;
                    case '7':   //签到积分
                        checkinBonus(userID);
                        return;
                    case '8':   //邀请用户
                        detail.desc = '邀请用户得奖励积分';
                        bonus = doc.config.inviteUser || 30;
                        break;
                    case '9': //扣减积分
                        detail.desc = detail.desc || '扣减积分';
                        bonus = (0 - detail.bonus);
                        break;
                    case '10':  //关注用户
                        followUserBonus(userID, detail);
                        break;
                    case '11':  //打赏扣分
                        detail.desc = '打赏教师积分抵扣金额';
                        bonus = (0 - detail.bonus);
                        break;
                    case '12':  //被打赏得分
                        break;
                    default :
                        log.trace('in default, operType is: ' + operType);
                        break;
                }

                if (bonus != 0) {
                    if (operType == '1') {
                        //完善个人资料奖励只能获得一次
                        db.bonus.find({userID: userID, type: '1'}, function (err, doc) {
                            if (err) {
                                //handle error
                            } else {
                                if (doc && doc.length > 0) {
                                    //获取过奖励，不再发放
                                } else {
                                    //没有获得过奖励，则发放
                                    doAdd(userID, bonus, operType, detail);
                                }
                            }
                        });
                    } else if (operType == '2') {
                        //获取当前小时
                        var curHour = new Date().getHours();
                        //如果是抢单的情况，判断是否内部教师，如果是内部教师，那么不增加积分
                        db.users.findOne({_id: new objectId(userID)}, {phone: 1}, function (err2, doc2) {
                            if (err2) {
                                //
                            } else {
                                //console.log('find teacher phone: ' + doc2.phone);
                                if (doc2 && doc2.phone) {
                                    db.userConf.findOne({phonenum: doc2.phone, type: 'teacher'}, {type: 1}, function (err3, doc3) {
                                        if (err3) {
                                            //
                                        } else {
                                            //console.log('find teacher type: ' + doc3.type);
                                            if (doc3 && doc3.type == 'teacher') {
                                                //如果是答疑中心教师，不增加积分
                                            } else {
                                                //其他情况，增加积分
                                                if (curHour >= 1 && curHour <= 5) {
                                                    //抢单的情况，如果是凌晨1点到5点，不增加抢单积分
                                                } else {
                                                    doAdd(userID, bonus, operType, detail);
                                                }
                                            }
                                        }
                                    });
                                } else {
                                    if (curHour >= 1 && curHour <= 5) {
                                        //抢单的情况，如果是凌晨1点到5点，不增加抢单积分
                                    } else {
                                        doAdd(userID, bonus, operType, detail);
                                    }
                                }
                            }
                        });
                    } else if (operType == '8') {   //邀请积分奖励，每个用户只有一次
                        db.bonus.count({userID: userID, type: '8'}, function (err, doc) {
                            if (err) {
                                //handle error
                            } else {
                                if (doc > 5) {
                                    //获取过奖励，不再发放
                                } else {
                                    //没有获得过奖励，则发放
                                    doAdd(userID, bonus, operType, detail);
                                }
                            }
                        });
                    } else {
                        doAdd(userID, bonus, operType, detail);
                    }
                }
            }
        }
    });
};


//发放奖励的操作
function doAdd(userID, bonus, operType, detail){
    if(bonus != 0) {
        log.trace('add bonus success: userID: ' + userID + ', bonus: ' + bonus + ', detail: ' + JSON.stringify(detail));
        db.users.update({_id: new objectId(userID)}, {$inc: {'userInfo.bonus': bonus}});
        db.bonus.insert({userID: userID, bonus: bonus, type: operType, detail: detail});
    }
}


//签到积分奖励
function checkinBonus(userID, detail){
    if(!detail) {
        detail = {desc: '签到得积分', t: (new Date()).getTime()};
    }
    //签到每天只能一次，多签不得分
    db.byConfig.findOne({_id: 'bonusConfig'}, {'config.checkin': 1, 'config.checkinContinuous': 1, 'config.checkinContinuousDays': 1}, function(err, doc) {
        if (err) {
            //
        } else {
            var checkin = 1, continuous = 5, continuousDays = 7;    //默认积分，如果配置信息中没有，那么就取默认的
            if (doc && doc.config) {
                checkin = doc.config.checkin || 1;
                continuous = doc.config.checkinContinuous || 5;
                continuousDays = doc.config.checkinContinuousDays || 7;
            }
            var query = {userID: userID, action: 'checkin', t: {$gte: (new Date()).setHours(0, 0, 0, 0), $lte: (new Date(new Date(new Date()).setDate((new Date()).getDate() - continuousDays))).setHours(0, 0, 0, 0)}};
            db.dbLog.find(query).sort({t: -1}).toArray(function (err2, doc2) {
                if (err2) {
                    //
                } else {
                    var bonus = checkin;
                    if (doc2.length >= continuousDays) {
                        //连续签到天数达标，赠送积分为continuous
                        bonus = continuous;
                    }
                    doAdd(userID, bonus, '7', detail);
                }
            });
        }
    });
}

//关注用户积分奖励，默认关注得1分，超10人每增加一个得5分，超50人每增加一个得10分，超100每增加一个得15分，取消关注扣对应积分
//注意，传入参数中，userID是发起动作的用户id，detail.u_id是接受动作的用户id，
//待到传出参数，记录到数据库中的时候，userID是接受动作的用户id，detail.u_id是发起动作的用户id
function followUserBonus(userID, detail) {
    //
    if(detail.action == 'unfollow'){
        detail.desc = '被取消关注扣积分';
    } else {
        detail.action = 'follow';
        detail.desc = '被关注得积分';
    }

    db.byConfig.findOne({_id: 'bonusConfig'}, {'config.userFollowed': 1}, function(err, doc){
        if(err){
            //
        } else {
            var defaultBonus = 1, after10 = 5, after50 = 10, after100 = 15;
            if (doc && doc.config && doc.config.userFollowed) {
                defaultBonus = doc.config.userFollowed.default;
                after10 = doc.config.userFollowed.after10;
                after50 = doc.config.userFollowed.after50;
                after100 = doc.config.userFollowed.after100;
            }
            var _id = new objectId();
            try {
                _id = new objectId(detail.u_id);
            } catch (ex) {
                //
            }
            db.userFollowers.findOne({_id: _id}, {list: 1}, function (err2, doc2) {
                if (err2) {
                    //
                } else {
                    if (doc2) {
                        var list = doc2.list || [];
                        if (detail.action == 'unfollow') {
                            //取消关注，扣对应积分
                            db.bonus.find({'type': '10', 'detail.u_id': userID, 'detail.action': 'follow'}).sort({'detail.t': -1}).limit(1).toArray(function(err3, doc3){
                                if(err3){
                                    //
                                }else{
                                    if(doc3.length == 1){
                                        doAdd(doc2.author_id, 0- doc3[0].bonus, '10', {desc: detail.desc, t: detail.t, action: 'unfollow', u_id: userID});
                                    }
                                }
                            });
                        } else {
                            var bonus = offlineAnswerUp;
                            if (list.length < 10) {
                                bonus = defaultBonus;
                            }else if(list.length < 50){
                                bonus = after10;
                            }else if(list.length < 100){
                                bonus = after50;
                            }else{
                                bonus = after100;
                            }
                            doAdd(detail.u_id, bonus, '10', {desc: detail.desc, t: detail.t, action: 'follow', u_id: userID});
                        }
                    }
                }
            });
        }
    });
}

//广场发答案，每获得一个赞得一分，超过5个以上赞，每个赞得5分，取消赞扣对应的积分detail = {action: '', answer_id: '', desc: '', t: ''}
function upAnswerBonus(userID, detail){
    //
    if(detail.action == 'cancelup'){
        detail.desc = '离线答案被取消赞扣积分';
    } else {
        detail.action = 'up';
        detail.desc = '离线答案被赞得积分';
    }
    detail.u_id = userID;   //操作者id
    db.byConfig.findOne({_id: 'bonusConfig'}, {'config.offlineAnswerUp': 1, 'config.offlineAnswerUpAfter': 1, 'config.offlineAnswerUpAfterBonus': 1}, function(err, doc){
        if(err){
            //
        } else {
            var offlineAnswerUp = 1, offlineAnswerUpAfter = 5, offlineAnswerUpAfterBonus = 5;
            if (doc && doc.config) {
                offlineAnswerUp = doc.config.offlineAnswerUp || offlineAnswerUp;
                offlineAnswerUpAfter = doc.config.offlineAnswerUpAfter || offlineAnswerUpAfter;
                offlineAnswerUpAfterBonus = doc.config.offlineAnswerUpAfterBonus || offlineAnswerUpAfterBonus;
            }
            var _id = new objectId();
            try {
                _id = new objectId(detail.answer_id);
            } catch (ex) {
                //
            }
            db.offlineAnswers.findOne({_id: _id}, {author_id: 1, ups: 1}, function (err2, doc2) {
                if (err2) {
                    //
                } else {
                    if (doc2) {
                        if (detail.action == 'cancelup') {
                            //取消关注，扣对应积分
                            db.bonus.find({'type': '6', 'detail.u_id': userID, 'detail.off_id': detail.off_id, 'detail.action': 'up'}).sort({'detail.t': -1}).limit(1).toArray(function(err3, doc3){
                                if(err3){
                                    //
                                }else{
                                    if(doc3.length == 1){
                                        doAdd(doc2.author_id, 0- doc3[0].bonus, '6', detail);
                                    }
                                }
                            })
                        } else {
                            var bonus = offlineAnswerUp;
                            if (doc2.ups.length >= offlineAnswerUpAfter) {
                                bonus = offlineAnswerUpAfterBonus;
                            }
                            doAdd(doc2.author_id, bonus, '6', detail);
                        }
                    }
                }
            });
        }
    });
}

//广场发问题，每获得一个关注得一分，超过5个以上关注，每个关注得5分，取消关注扣对应的积分
function watchTopicBonus(userID, detail, action){
    //
    if(action == 'un'){
        detail.action = 'unwatch';
        detail.desc = '离线问题被取消关注扣积分';
    } else {
        detail.action = 'watch';
        detail.desc = '离线问题被关注得积分';
    }
    detail.u_id = userID;   //操作者id
    db.byConfig.findOne({_id: 'bonusConfig'}, {'config.offlineTopicWatchBonus': 1, 'config.offlineTopicWatchAfter': 1, 'config.offlineTopicWatchAfterBonus': 1}, function(err, doc){
        if(err){
            //
        } else {
            var offlineTopicWatchBonus = 1, offlineTopicWatchAfter = 5, offlineTopicWatchAfterBonus = 5;
            if (doc && doc.config) {
                offlineTopicWatchBonus = doc.config.offlineTopicWatchBonus;
                offlineTopicWatchAfter = doc.config.offlineTopicWatchAfter;
                offlineTopicWatchAfterBonus = doc.config.offlineTopicWatchAfterBonus;
            }
            var _id = new objectId();
            try {
                _id = new objectId(detail.off_id);
            } catch (ex) {
                //
            }
            db.offlineTopics.findOne({_id: _id}, {author_id: 1, watch: 1}, function (err2, doc2) {
                if (err2) {
                    //
                } else {
                    if (doc2) {
                        if (detail.action == 'unwatch') {
                            //取消关注，扣对应积分
                            db.bonus.find({'type': '5', 'detail.u_id': userID, 'detail.off_id': detail.off_id, 'detail.action': 'watch'}).sort({'detail.t': -1}).limit(1).toArray(function(err3, doc3){
                                if(err3){
                                    //
                                }else{
                                    if(doc3.length == 1){
                                        doAdd(doc2.author_id, 0- doc3[0].bonus, '6', detail);
                                    }
                                }
                            })
                        } else {
                            var bonus = offlineTopicWatchBonus;
                            if (doc2.watch >= offlineTopicWatchAfter) {
                                bonus = offlineTopicWatchAfterBonus;
                            }
                            doAdd(doc2.author_id, bonus, '6', detail);
                        }
                    }
                }
            });
        }
    });
}

//抢单成功得5分
function grabOrderBonus(userID, detail){
    detail.desc = '抢答获取积分奖励';
    db.byConfig.findOne({_id: 'bonusConfig'}, {'config.grabOrder': 1}, function(err, doc){
        if(err){
            //
        }else{
            var bonus = 10;
            if(doc && doc.config){
                bonus = doc.config.grabOrder;
            }
            doAdd(userID, bonus, '2', detail);
        }
    });
}

//获得一个5星好评得10分，连续获得5单以上的5星好评，则每个5星好评得15分，中断之后重新计算
function remark5StarBonus(detail) {
    detail.desc = '回答获得好评得积分';
    var _id = new objectId();
    try {
        _id = new objectId(detail.o_id);
    } catch (ex) {
        //
    }
    db.byConfig.findOne({_id: 'bonusConfig'}, {'config.remark5Star': 1, 'config.remark5StarContinuous': 1, 'config.remarkContinuousCount': 1}, function(err, doc){
        if(err){
            //
        } else {
            var remark5Star = 10, remark5StarContinuous = 15, remarkContinuousCount = 5;
            db.orders.find({_id: _id}, {t_id: 1, s_id: 1, status: 1, stars: 1, start_time: 1}, function (err, doc) {
                if (err) {
                    //
                } else {
                    //有数据
                    if (doc) {
                        if(doc.stars == 5){//只有5星好评才去增加积分
                            //接下来根据教师id，取教师除了本道题之外的最近5道题有过评价的订单，然后判断是否都是全5星好评
                            db.orders.find({_id: {$ne: doc._id}, t_id: doc.t_id, stars: {$ne: null}}, {stars: 1}).sort({start_time: -1}).limit(remarkContinuousCount).toArray(function(err2, doc2){
                                if(err2){
                                    //
                                }else{
                                    var bonus = remark5StarContinuous; //默认增加15积分，如果连续5单中有非5星订单，那么就增加10积分
                                    for(var i=0; i<doc2.length; i++){
                                        if(doc2[i].stars != '5'){
                                            bonus = remark5Star;
                                        }
                                    }
                                    doAdd(doc.t_id, bonus, '4', detail);
                                }
                            });
                        }
                    }
                }
            });
        }
    });
}

//
