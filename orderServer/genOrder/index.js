/**
 * Created by MengLei on 2015/2/26.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
//var result = require('../utils/result');
var cronJob = require('cron').CronJob;
var log = require('./../../utils/log').order;
var dnode = require('../utils/dnodeClient');
var zrpc = require('../../utils/zmqClient');
var addBonus = require('../utils/bonus');

var notify = require('./../notify');

var job = {};

var genOrder = function (param, result) {
    //建立订单，将传过来的订单信息写入数据库
    log.trace('order server: orderInfo=' + param.orderInfo);
    var orderInfo = JSON.parse(param.orderInfo);
    var _id = new objectId();
    orderInfo._id = _id;
    orderInfo.s_id = param.userID;
    orderInfo.o_id = _id.toString();
    orderInfo.addPrice = 0;  //默认小费是0元
    orderInfo.create_time = new Date().getTime();   //订单创建时间，取当前时间戳
    orderInfo.chat_msg = [];   //刚创建的订单，chat_msg是空数组
    orderInfo.status = 'pending';  //刚下的订单，状态应该是pending

    setDuration(orderInfo);   //订单创建的时候，要根据年级与科目设置答题时间

    if (orderInfo.t_id) {
        //如果传入参数有teacher id，那么就是指定教师下单，否则走的就是抢单的流程
        log.debug('specify teacher, order id: ' + _id.toString());
        //指定教师下单的标志
        orderInfo.specifyTeacher = true;
        //指定教师下单，先要查看教师的当前状态，如果当前状态是有订单正在进行中，那么不给教师推送，同时给学生返回错误信息。
        //判断教师是否有订单正在进行中，是通过是否有received状态的订单的t_id为该教师来确定的。
        db.orders.find({t_id: orderInfo.t_id, start_time: {$lt: (new Date().getTime()) + config.pendingTime}, status: 'received'}, function(err, doc){
            if(err){
                //handle error
                log.error('find order by t_id error:  '+ err.message);
                result({statusCode: 905, message: err.message});
            }else{
                //判断是教师是否处于可接单的状态（对于普通订单，目前的逻辑是教师可以同时进行多个，所以此处订单数量可能大于1）
                if(doc && doc.length > 0){
                    log.debug('teacher: ' + orderInfo.t_id + 'is busy, gen order failed');
                    //有订单属于该状态，那么不给该教师推送这类订单，同时返回给学生端这个错误信息
                    result({statusCode: 906, message: 'teacher busy'});
                } else {
                    //教师没有处于忙碌状态，那么可以推送订单
                    db.orders.save(orderInfo, function (err) {
                        if (err) {
                            log.error('gen order error:  '+ err.message);
                            //handle error
                            result({statusCode: 905, message: err.message});
                        } else {
                            log.trace('gen order success, order id: ' + _id.toString());
                            //订单建立成功，将状态和订单号返回给学生，同时将题目推送给指定教师
                            result({statusCode: 900, o_id: _id.toString()});

                            //下单成功，增加一份下单积分
                            addBonus(param.userID, '3', {o_id: orderInfo.o_id});

                            //下单成功，将题目推送给指定教师
                            specifyTeacher(orderInfo);
                            //定时任务，十五分钟之内，每隔三分钟触发一次，指定教师下单，不需要重复推送
                            //job[orderInfo.o_id] = new cronJob(new Date(new Date().getTime() + 180000), cronCB, null, true);
                        }
                    });
                }
            }
        });
    } else {
        //传入参数没有t_id，则走普通下单流程
        log.debug('ordinary order, id: ' + _id.toString());
        orderInfo.specifyTeacher = false;
        db.orders.save(orderInfo, function (err, doc) {
            if (err) {
                //handle error
                result({statusCode: 905, message: err.message});
            } else {
                log.trace('gen order success, order id: ' + _id.toString());
                //订单建立成功，将状态和订单号返回给学生，同时触发教师筛选机制，进行筛选教师以及题目推送
                result({statusCode: 900, o_id: _id.toString()});

                //下单成功，增加一份下单积分
                addBonus(param.userID, '3', {o_id: orderInfo.o_id});

                //下单成功，触发一次教师筛选机制
                selectTeacher(orderInfo);
                //定时任务，十五分钟之内，每隔三分钟触发一次
                job[orderInfo.o_id] = new cronJob(new Date(new Date().getTime() + config.pendingInterval), cronCB, null, true);
            }
        });
    }

    function cronCB() {
        db.orders.findOne({o_id: orderInfo.o_id}, function (err, doc) {
            if (err) {
                //handle error
            } else {
                //success
                //判断，订单创建时间与当前时间差在推送时限之内，且订单未被接单，则重新触发一次教师筛选机制
                //如果已经被接单，则不做任何操作，停止任务，如果大于推送时限，则设置订单状态为超时，不再继续
                if (doc && (new Date().getTime() < (doc.create_time + config.pendingTime))) {
                    if (doc.status == 'pending') {
                        log.trace('cron job executed, order id: ' + orderInfo.o_id + ', push order again.');
                        selectTeacher(orderInfo);
                        //启动下一次定时器
                        job[orderInfo.o_id] = new cronJob(new Date(new Date().getTime() + config.pendingInterval), cronCB, null, true);
                    } else {
                        log.trace('cron job executed, order id: ' + orderInfo.o_id + ', current order: ' + doc.status);
                        //如果订单状态不是推送中，那么就不再继续进行推送，关闭定时器
                        if (job.hasOwnProperty(orderInfo.o_id)) {
                            delete(job[orderInfo.o_id]);
                        }
                    }
                } else if(doc) {
                    //如果订单存在；但是订单创建时间与当前时间差超过推送时限，且订单状态仍然为pending，那么将订单状态设置为timeout
                    if(doc.status == 'pending') {
                        log.trace('cron job executed, order id: ' + orderInfo.o_id + ', set status timeout.');
                        db.orders.update({o_id: orderInfo.o_id}, {$set: {status: 'timeout'}});
                        //关掉并删除该定时器
                        if (job.hasOwnProperty(orderInfo.o_id)) {
                            delete(job[orderInfo.o_id]);
                        }
                        //订单超时，向所有接单过的教师推送订单超时的消息
                        notify(orderInfo.o_id, 'timeout');
                    }
                    //删除定时器
                    if (job.hasOwnProperty(orderInfo.o_id)) {
                        delete(job[orderInfo.o_id]);
                    }
                }
            }
        });
    }
};


var selectTeacher = function (orderInfo) {
    //查询条件
    var query = {"status": "online", "userType": "teacher"};

    //搜索分三种情况，只有年级，只有科目，既有年级也有科目
    if (orderInfo.grade) {
        if (orderInfo.subject) {
            query = {
                "status": "online",
                "userType": "teacher",
                "userInfo.teacher_info.grades": {
                    $elemMatch: {
                        grade: orderInfo.grade,
                        subjects: {
                            $elemMatch: {
                                subject: orderInfo.subject
                            }
                        }
                    }
                }
            };
        }
        else {
            query = {
                "status": "online",
                "userType": "teacher",
                "userInfo.teacher_info.grades": {
                    $elemMatch: {
                        grade: orderInfo.grade
                    }
                }
            };
        }

    }
    else {
        if (orderInfo.subject) {
            query = {
                "status": "online",
                "userType": "teacher",
                "userInfo.teacher_info.grades": {
                    $elemMatch: {
                        subjects: {
                            $elemMatch: {
                                subject: orderInfo.subject
                            }
                        }
                    }
                }
            };
        }
    }

    //付费订单只推送三星以上的教师，即积分170分以上的教师
    if(orderInfo.price > 0){
        query.price = {$gte: 170};
    }

    db.users.find(query, {_id: 1}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            //满足条件的教师uid列表
            var uids = [];
            for (var i = 0; i < doc.length; i++) {
                uids.push(doc[i]._id.toString());
            }

            pushUids2DB(uids, orderInfo);

            //先查询学生的t_info，然后再推送
            db.users.findOne({_id: new objectId(orderInfo.s_id)}, function(err2, doc2){
                if(err2){
                    //handle error
                    log.error('gen order, get student info error: ' + err2.message);
                }else{
                    if(doc2) {
                        orderInfo.s_info = {
                            nick: doc2.nick || '',
                            name: doc2.userInfo.name || '',
                            family_name: doc2.userInfo.family_name || '',
                            given_name: doc2.userInfo.given_name || '',
                            avatar: doc2.userInfo.avatar || ''
                        };

                        zrpc('mqttServer', 'push', {content: orderInfo, to: uids}, function (err3, resp) {
                            //
                            if (err) {
                                log.error('push order error: ' + err3.message);
                            } else {
                                log.trace('push order result: ' + JSON.stringify(resp) + ', teacher count: ' + uids.length);
                            }
                        });
                    }else{
                        log.error('gen order, get student info null.');
                    }
                }
            });
        }
    })
};

//此处记录该订单推送的教师的uid列表
function pushUids2DB(uids, orderInfo) {
    if (uids.length > 0) {
        //对所有的uid，在以o_id为_id的记录中，执行inc 加一的操作，记录该条订单对该用户推送的次数
        var incObj = {};
        for (var i = 0; i < uids.length; i++) {
            incObj['uids.' + uids[i]] = 1;
        }

        db.push.update({_id: new objectId(orderInfo.o_id)}, {$inc: incObj, $set: {create_time: orderInfo.create_time}}, {upsert: true});
    }
}

function specifyTeacher(orderInfo) {
    //指定教师，向socket server发请求，推送题目
    var uids = [];
    uids.push(orderInfo.t_id);

    pushUids2DB(uids, orderInfo);

    zrpc('mqttServer', 'push', {content: orderInfo, to: uids}, function(err, resp){
        //
        if(err){
            log.error('push order error: ' + err.message);
        }else {
            log.trace('push order result: ' + JSON.stringify(resp));
        }
    });
}


//根据订单的年级科目，设置订单的答题时间，在config文件中取得配置信息
function setDuration(orderInfo) {
    if (orderInfo.duration) {
        //如果客户端传递该值，那么取该值，否则服务端根据配置文件进行赋值，单位毫秒
        orderInfo.duration = parseInt(orderInfo.duration);
    } else {
        //如果客户端没有传递该值，那么根据配置文件，通过年级科目取对应的时间，取出来的时间单位是分钟，后面转换成毫秒
        var duration = config.duration.default;
        switch (orderInfo.grade) {
            case "小学":
            {
                switch (orderInfo.subject) {
                    case "数学":
                        duration = config.duration.xiaoxue.shuxue;
                        break;
                    case "语文":
                        duration = config.duration.xiaoxue.yuwen;
                        break;
                    case "英语":
                        duration = config.duration.xiaoxue.yingyu;
                        break;
                    default :
                        duration = config.duration.xiaoxue.default;
                        break;
                }
            }
                break;
            case "初中":
            {
                switch (orderInfo.subject) {
                    case "数学":
                        duration = config.duration.chuzhong.shuxue;
                        break;
                    case "语文":
                        duration = config.duration.chuzhong.yuwen;
                        break;
                    case "英语":
                        duration = config.duration.chuzhong.yingyu;
                        break;
                    case "物理":
                        duration = config.duration.chuzhong.wuli;
                        break;
                    case "化学":
                        duration = config.duration.chuzhong.huaxue;
                        break;
                    default :
                        duration = config.duration.chuzhong.default;
                        break;
                }
            }
                break;
            case "高中":
            {
                switch (orderInfo.subject) {
                    case "数学":
                        duration = config.duration.gaozhong.shuxue;
                        break;
                    case "语文":
                        duration = config.duration.gaozhong.yuwen;
                        break;
                    case "英语":
                        duration = config.duration.gaozhong.yingyu;
                        break;
                    case "物理":
                        duration = config.duration.gaozhong.wuli;
                        break;
                    case "化学":
                        duration = config.duration.gaozhong.huaxue;
                        break;
                    case "生物":
                        duration = config.duration.gaozhong.shengwu;
                        break;
                    case "历史":
                        duration = config.duration.gaozhong.lishi;
                        break;
                    case "地理":
                        duration = config.duration.gaozhong.dili;
                        break;
                    case "政治":
                        duration = config.duration.gaozhong.zhengzhi;
                        break;
                    default :
                        duration = config.duration.gaozhong.default;
                        break;
                }
            }
                break;
            default:
                duration = config.duration.default;
                break;
        }
        //在这里转换成毫秒
        orderInfo.duration = duration * 60 * 1000;
    }
}


genOrder.job = job;
module.exports = genOrder;