/**
 * Created by MengLei on 2015/4/20.
 */

var db = require('./../../../config').db;
var config = require('./../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

module.exports = function (req, res) {
    //var _id = new objectId(req.body.userID);
    var shareCode = req.body.shareCode;
    db.shareCode.findOne({shareCode: shareCode}, function (err, doc) {
        if (err) {
            //handle error
            log.error('input share code error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc && doc.valid) {
                //这里加一个判断限制，如果邀请码已经被用户使用过了，那么就不允许再次输入，此处返回错误。
                //if (doc.users.indexOf(req.body.userID) >= 0) {
                //    result(res, {statusCode: 921, message: 'share code already used'});
                //    return;
                //}
                //被邀请者增加一定数量的虚拟货币
                //为该用户增加对应虚拟币
                db.users.update({_id: new objectId(req.body.userID)}, {$inc: {'userInfo.money': config.bonusMoney}, $set:{'userInfo.ext_info.promoterShareCode': shareCode}});
                //在虚拟币订单表中插入一条交易记录，新用户注册奖励的记录
                var moneyObj = {
                    userID: req.body.userID,
                    money: config.bonusMoney,
                    type: 2,
                    detail: {
                        desc: '新用户邀请码注册奖励',
                        time: (new Date().getTime()),
                        shareCode: doc.shareCode
                    }
                };
                db.money.insert(moneyObj);

                //如果邀请人是一个用户，那么给用户也增加相应数量的虚拟货币
                if (doc.role == '0') {
                    //在虚拟币订单表中插入一条记录，邀请人得到的奖励
                    var moneyObj2 = {
                        userID: doc.userID,
                        money: config.bonusMoney,
                        type: 2,
                        detail: {
                            desc: '邀请用户注册奖励',
                            time: (new Date().getTime()),
                            shareCode: doc.shareCode
                        }
                    };
                    db.money.insert(moneyObj2);
                    //同时，还要给邀请人个人信息表中，增加对应的虚拟币
                    db.users.update({_id: new objectId(doc.userID)}, {$inc: {'userInfo.money': config.bonusMoney}});
                }

                //推广数据库中做记录
                var curTime = new Date().getTime();
                var sCodeObj = {
                    shareCode: req.body.shareCode,
                    phonenum: req.user.phone,
                    from: req.body.from,
                    role: doc.role,
                    registered: true,  //已注册用户输入推广码
                    time: curTime
                };
                //保存到推广数据库
                db.promotion.insert(sCodeObj);
                result(res, {statusCode: 900});//返回成功
            } else {
                //邀请码无效
                result(res, {statusCode: 920, message: 'share code invalid.'});
            }
        }
    })
};


