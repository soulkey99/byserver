/**
 * Created by MengLei on 2015/7/21.
 */

var db = require('./../../config').db;
var proxy = require('./../../common/proxy');
var config = require('./../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../utils/result');
var log = require('../../utils/log').h5;
var exchangeCode = require('../utils/genExchangeCode');
var query = require('query-mobile-phone-area');
var dnode = require('./../utils/dnodeClient');

//兑换积分
module.exports = function (req, res) {
    //渠道教师禁止兑换，但是公立学校的教师除外
    if (req.user.userInfo.teacher_info.channel && (req.user.userInfo.teacher_info.channel != 'school' && req.user.userInfo.teacher_info.channel != 'fengya')) {
        return result(res, {statusCode: 938, message: '政策限制，禁止兑换积分！'});
    }
    db.userConf.findOne({phonenum: req.user.phone, type: 'teacher'}, {_id: 1}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                //手机号在答疑教师表中存在，不予兑换
                result(res, {statusCode: 938, message: '政策禁止兑换积分！'});
            } else {
                //非答疑教师可以进行兑换
                exchange(req, res);
            }
        }
    });
};

function exchange(req, res) {
    var _id = '';
    try {
        _id = new objectId(req.body.goodId);
    } catch (ex) {
        result(res, {statusCode: 931, message: '商品ID错误！'});
    }

    var userBonus = req.user.userInfo.bonus || 0;

    db.goods.findOne({_id: _id}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            if (doc) {
                //
                if (doc.price > userBonus) {
                    //积分不足
                    result(res, {statusCode: 933, message: '积分余额不足！'});
                    return;
                }
                if (!doc.valid) {
                    //商品不可用
                    result(res, {statusCode: 939, message: '商品不可兑换！'});
                    return;
                }
                if (doc.type == 'vSale' || doc.type == 'vLucky' || doc.type == 'dvSale' || doc.type == 'dvLucky') {
                    //虚拟商品要到库存中去统计存量，实物商品直接计数即可，接口调用类型的商品也是直接计数就可以了
                    db.stocks.count({goodId: req.body.goodId}, function (err2, doc2) {
                        if (err2) {
                            //handle error
                        } else {
                            doc.stock = doc2;
                            doExchange(req, res, doc);
                        }
                    });
                    return;
                }
                if (doc.type == 'lottery') {
                    //对于轮盘类的抽奖，每天限制10次机会，超过了之后只能第二天继续抽
                    var t1 = new Date();
                    var t2 = new Date();
                    t1.setHours(0, 0, 0, 0);
                    t2.setHours(23, 59, 59, 999);
                    db.bonus.count({
                        userID: req.user._id.toString(),
                        'detail.t': {$gte: t1.getTime(), $lte: t2.getTime()},
                        'detail.goodId': req.body.goodId
                    }, function (err2, doc2) {
                        if (err2) {
                            result(res, {statusCode: 905, message: err2.message});
                        } else {
                            if (doc2 < (doc.lotteryTimes || 10)) {
                                //console.log('lottery count: ' + doc2 + ', userID: ' + req.user._id.toString() + ', goodId: ' + req.body.goodId);
                                //次数小于10，可以继续抽奖，否则返回错误
                                db.bonusExchange.count({
                                    userID: req.user._id.toString(),
                                    goodId: req.body.goodId,
                                    createTime: {$gte: t1.getTime(), $lte: t2.getTime()}
                                }, function (err3, doc3) {
                                    if (err3) {
                                        result(res, {statusCode: 905, message: err3.message});
                                    } else {
                                        doLottery(req, res, doc);
                                        return;
                                        //console.log('lottery: ' + req.body.goodId + ', ' + (doc3 > 0) && (config.production_mode == 'true').toString());
                                        if ((doc3 > 0) && (config.production_mode == 'true')) {
                                            //已经中奖过了，直接返回不再中奖
                                            result(res, {statusCode: 900, rank: 0});
                                            //记录积分消耗
                                            var bonusDetail = {
                                                t: ((new Date()).getTime()),
                                                desc: '轮盘抽奖消费积分',
                                                goodId: doc._id.toString(),
                                                goodName: doc.goodName,
                                                goodType: 'lottery',
                                                deliver: '',
                                                prize: false
                                            };
                                            db.bonus.insert({
                                                userID: req.user._id.toString(),
                                                bonus: doc.price,
                                                type: '4',
                                                detail: bonusDetail
                                            });
                                        } else {
                                            //没有中奖过，可以继续
                                            doLottery(req, res, doc);
                                        }
                                    }
                                });
                            } else {
                                result(res, {statusCode: 936, message: '今日抽奖次数已达最大限制！'});
                            }
                        }
                    });
                    return;
                }
                //上面的虚拟商品和抽奖类的商品，库存计算方法不同
                if (doc.stock <= 0) {
                    //实物类商品，库存不足，无法兑换
                    result(res, {statusCode: 934, message: '商品库存不足！'});
                    return;
                }
                //普通商品兑换
                doExchange(req, res, doc);
            } else {
                //商品不存在
                result(res, {statusCode: 932, message: '商品不存在！'});
            }
        }
    });
}

//兑换，根据商品类型分发给不同的处理函数
function doExchange(req, res, doc) {
    switch (doc.type) {
        case 'vSale'://虚拟兑换
            vSaleExchange(req, res, doc);
            break;
        case 'api'://调用api兑换
            apiExchange(req, res, doc);
            break;
        case 'rSale'://实物兑换
            rSaleExchange(req, res, doc);
            break;
        case 'api_hjjd'://皇家极地兑换
            hjjdExchange(req, res, doc);
            break;
        default :
            break;
    }
}

//虚拟兑换
function vSaleExchange(req, res, doc) {
    result(res, {statusCode: 934, message: '商品库存不足！'});
}

//实物兑换
function rSaleExchange(req, res, doc) {
    //用户积分减少
    db.users.update({_id: req.user._id}, {$inc: {'userInfo.bonus': (0 - doc.price)}});
    //商品库存减少一个
    db.goods.update({_id: doc._id}, {$inc: {stock: -1}});

    var detailId = new objectId();
    var detail = {status: false};
    if (doc.deliver == 'code') {
        //如果是兑换码方式
        detail.code = exchangeCode();

        //用户积分记录中增加一条
        db.bonus.insert({
            userID: req.user._id.toString(),
            bonus: doc.price,
            type: '4',
            detail: {
                t: ((new Date()).getTime()),
                desc: '兑换商品消费积分',
                goodId: doc._id.toString(),
                goodName: doc.goodName,
                goodType: doc.type,
                deliver: 'code',
                detail: detailId.toString()
            }
        });
        //兑换历史中增加一个记录，为了与商家对账
        db.bonusExchange.insert({
            _id: detailId,
            userID: req.user._id.toString(),
            shopID: doc.owner,
            goodId: doc._id.toString(),
            goodName: doc.goodName,
            type: doc.type,
            deliver: doc.deliver,
            detail: detail,
            createTime: new Date().getTime()
        });
        //返回兑换码
        result(res, {statusCode: 900, code: detail.code});
    } else if (doc.deliver == 'mail') {
        //如果是包邮的兑换方式
        detail.name = req.body.name;
        detail.phone = req.body.phone;
        detail.address = req.body.address;
        detail.postCode = req.body.postCode || '';
        detail.remark = req.body.remark || '';    //用户备注
        detail.postCompany = '';
        detail.postNumber = '';

        //用户积分记录中增加一条
        db.bonus.insert({
            userID: req.user._id.toString(),
            bonus: doc.price,
            type: '4',
            detail: {
                t: ((new Date()).getTime()),
                desc: '兑换商品消费积分',
                goodId: doc._id.toString(),
                goodName: doc.goodName,
                goodType: doc.type,
                deliver: 'mail',
                detail: detailId.toString()
            }
        }, function (err, doc) {
            if (err) {
                log.error('h5, insert bonus type 4 error: ' + err.message);
            } else {
                log.trace('h5, insert bonus type 4 success.');
            }
        });
        //兑换历史中增加一个记录，为了与商家对账
        db.bonusExchange.insert({
            _id: detailId,
            userID: req.user._id.toString(),
            shopID: doc.owner,
            goodId: doc._id.toString(),
            goodName: doc.goodName,
            type: doc.type,
            deliver: doc.deliver,
            detail: detail,
            createTime: new Date().getTime()
        }, function (err, doc) {
            if (err) {
                log.error('h5, insert bonusExchange error: ' + err.message);
            } else {
                log.trace('h5, insert bonusExchange success.');
            }
        });
        //返回结果
        result(res, {statusCode: 900});
    }
}

//调用api兑换
function apiExchange(req, res, doc) {
    //用户积分减少
    db.users.update({_id: req.user._id}, {$inc: {'userInfo.bonus': (0 - doc.price)}});
    //商品库存减少一个
    db.goods.update({_id: doc._id}, {$inc: {stock: -1}});

    //用户积分记录中增加一条
    db.bonus.insert({
        userID: req.user._id.toString(),
        bonus: doc.price,
        type: '4',
        detail: {
            t: ((new Date()).getTime()),
            desc: '兑换商品消费积分',
            goodId: doc._id.toString(),
            goodName: doc.goodName,
            goodType: doc.type
        }
    });
    //兑换历史中增加一个记录，为了与商家对账
    db.bonusExchange.insert({
        userID: req.user._id.toString(),
        shopID: doc.owner,
        goodId: doc._id.toString(),
        goodName: doc.goodName,
        type: doc.type,
        detail: {phone: req.user.phone},
        createTime: new Date().getTime()
    });
    //调用接口
    callAPI(req.body.userID, doc.detail);
    result(res, {statusCode: 900});
}

//皇家极地
function hjjdExchange(req, res, doc) {
    //
    result(res, {statusCode: 900});
}

//轮盘抽奖
function doLottery(req, res, doc) {
    //用户积分减少
    db.users.update({_id: req.user._id}, {$inc: {'userInfo.bonus': (0 - doc.price)}});

    var random = Math.random();
    var detailId = new objectId();
    var bonusDetail = {
        t: ((new Date()).getTime()),
        desc: '轮盘抽奖消费积分',
        goodId: doc._id.toString(),
        goodName: doc.goodName,
        goodType: 'lottery',
        deliver: '',
        prize: false
    };
    //定义好返回值的结构
    var resp = {statusCode: 900, rank: 0};
    for (var i = 0; i < doc.detail.length; i++) {
        if ((doc.detail[i].probability > random) && (doc.detail[i].stock > 0)) {
            resp.rank = doc.detail[i].rank;
            //if(resp.rank == 2){
            //    var qq = query(req.user.phone);//查询归属地，暂时中奖的rank=2时，需要辽宁省内用户
            //    if(qq){
            //        if(qq.province == '辽宁'){
            //            //
            //        }else{
            //            //不是辽宁省手机号，奖项落至下一级
            //            continue;
            //        }
            //    }else{
            //        //没有结果，奖项落至下一级
            //        continue;
            //    }
            //}
            //这里中奖，进行各种库存、中奖纪录等操作。
            doc.detail[i].stock--;
            //更新商品信息库存
            db.goods.update({_id: doc._id}, {$set: {detail: doc.detail}});

            bonusDetail.deliver = doc.detail[i].deliver;
            bonusDetail.prize = true;

            //只有中奖了，才会记录exchange detail
            bonusDetail.detail = detailId.toString();
            resp.detailId = detailId.toString();    //同时返回detailId

            var detail = {};
            if (doc.detail[i].deliver == 'mail') {
                detail = {
                    status: false,
                    name: '',
                    phone: '',
                    address: '',
                    postCode: '',
                    postCompany: '',
                    postNumber: '',
                    remark: ''
                };
            } else if (doc.detail[i].deliver == 'code') {
                detail = {status: false, code: exchangeCode()};
                resp.code = detail.code;
            } else if (doc.detail[i].deliver == 'api') {
                //流量充值
                detail = {phone: ''};
                if (req.user.phone) {
                    detail.phone = req.user.phone;
                    resp.phone = req.user.phone;
                    var q = query(req.user.phone);
                    if (q) {
                        if (q.type == '中国移动') {
                            //10M
                            chargeFlow(req.user._id.toString(), 10);
                        } else if (q.type == '中国联通') {
                            //20M
                            chargeFlow(req.user._id.toString(), 20);
                        } else if (q.type == '中国电信') {
                            //10M
                            chargeFlow(req.user._id.toString(), 10);
                        }
                    }
                } else {
                    resp.phone = '';
                }
            } else if (doc.detail[i].deliver == 'bonus') {
                detail = {bonus: 10};
                proxy.Bonus.decBonus({userID: req.body.userID, bonus: 10, reason: '抽奖获得积分！'});
            }
            //兑换历史中增加一个记录，为了与商家对账
            db.bonusExchange.insert({
                _id: detailId,
                userID: req.user._id.toString(),
                shopID: doc.detail[i].owner,
                goodId: doc._id.toString(),
                goodName: doc.detail[i].name,
                type: 'lottery',
                deliver: doc.detail[i].deliver,
                money: doc.detail[i].money,
                detail: detail,
                createTime: new Date().getTime()
            });
            break;
        }
    }
    //用户积分记录中增加一条
    db.bonus.insert({userID: req.user._id.toString(), bonus: doc.price, type: '4', detail: bonusDetail});

    result(res, resp);
}

//调用api的方法
function callAPI(userID, detail) {
    switch (detail.goodType) {
        case 'flow':
            chargeFlow(userID, detail.quantity);
            break;
        default :
            break;
    }
}


function chargeFlow(userID, quantity) {
    db.users.findOne({_id: new objectId(userID)}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            if (doc && doc.phone) {
                //
                dnode('flowServer', 'orderFlow', {
                    num: doc.phone,
                    flow: quantity,
                    purpose: 'bonusExchange'
                }, function (err, resp) {
                    //handle callback
                    //console.log(err);
                    //console.log(resp);
                });
            } else {
                //
            }
        }
    })
}