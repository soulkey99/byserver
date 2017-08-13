/**
 * Created by MengLei on 2015/11/26.
 */
"use strict";
var config = require('../../../config');
var db = config.db;
var proxy = require('./../../../common/proxy');
var log = require('../../../utils/log').http;
var addMoney = require('./addMoney');

//这里是pingxx的wbhooks回调处理函数
module.exports = function (req, res) {
    if (!req.body.type) {
        resp(res, 400, 'Event 对象中缺少 type 字段！');
        return;
    }
    log.trace('log webhook: ' + JSON.stringify(req.body));
    //记录webhooks内容，将来对账使用
    req.body.t = (new Date()).getTime();
    req.body.hook_type = 'ping++';
    db.webhooks.insert(req.body);
    switch (req.body.type) {
        case "charge.succeeded":
            // 支付对象，支付成功时触发
            chargeSucceeded(req.body.data.object);
            resp(res, 200, "OK");
            break;
        case "refund.succeeded":
            // 退款对象，退款成功时触发
            refundSucceeded(req.body.data.object);
            resp(res, 200, "OK");
            break;
        case "summary.daily.available":
            // 上一天 0 点到 23 点 59 分 59 秒的交易金额和交易量统计，在每日 02:00 点左右触发
            resp(res, 200, "OK");
            break;
        case "summary.weekly.available":
            // 上周一 0 点至上周日 23 点 59 分 59 秒的交易金额和交易量统计，在每周一 02:00 点左右触发
            resp(res, 200, "OK");
            break;
        case "summary.monthly.available":
            // 上月一日 0 点至上月末 23 点 59 分 59 秒的交易金额和交易量统计，在每月一日 02:00 点左右触发
            resp(res, 200, "OK");
            break;
        case "transfer.succeeded":
            // 企业支付对象，支付成功时触发
            resp(res, 200, "OK");
            break;
        case "red_envelope.sent":
            // 红包对象，红包发送成功时触发
            resp(res, 200, "OK");
            break;
        case "red_envelope.received":
            // 红包对象，红包接收成功时触发
            resp(res, 200, "OK");
            break;
        default:
            resp(res, 400, "未知 Event 类型");
            break;
    }
};

//webhooks专用的返回方法，将错误码直接写入http请求的statusCode
function resp(res, status_code, msg) {
    res.writeHead(status_code, {"Content-Type": "text/plain; charset=utf-8"});
    res.end(msg);
}

//对charge.succeeded的处理
function chargeSucceeded(charge) {
    proxy.Money.getMoneyInfoByID(charge.order_no, function (err, doc) {
        if (err) {
            return;
        }
        if (!doc) {
            return;
        }
        if (doc.status != 'pending') {
            //表明之前已经处理过了，那么此处就不用再处理了
            return;
        }
        doc.charge = charge;
        if (charge.paid) {
            let setObj = {status: 'paid', client_status: 'success'};
            db.money.findAndModify({
                query: {_id: doc._id, status: 'pending'},
                update: {$set: setObj},
                new: true
            }, function (err2, doc2) {
                if (err2) {
                    return;
                }
                if (!doc2) {
                    return;
                }
                if (doc2.type == 'rewardTeacher') { //打赏类型的
                    //这里，打赏并且确认成功，才真正给教师增加余额，并且扣除掉学生的积分
                    proxy.User.incMoney(doc2.t_id, doc2.amount);
                    if (doc2.bonus > 0) {//
                        //给学生端扣除对应的抵扣积分
                        proxy.Bonus.rewardTeacher({
                            userID: doc2.userID,
                            bonus: doc2.bonus,
                            o_id: doc2.o_id
                        }, function () {
                        });
                    }
                } else if (doc2.type == 'charge') {//学生充值类型的，确认成功了才增加余额
                    // console.log('webhook add student money');
                    proxy.User.incStudentMoney(doc2.userID, doc2.amount);
                } else if (doc2.type == 'gameBuyBonus') {  //游戏购买学分
                    // log.trace(`add game bonus for userID: ${doc2.userID}, bonus: ${doc2.bonus}`);
                    proxy.GameUserRecord.addBonus({userID: doc2.userID, bonus: doc2.bonus, desc: doc2.subject});
                } else if (doc2.type == 'gameBuyStrength') { //游戏购买体力
                    // log.trace(`add game strength for userID: ${doc2.userID}, strength: ${doc2.strength}`);
                    proxy.GameUserRecord.addBonus({
                        userID: doc2.userID,
                        strength: doc2.strength,
                        desc: doc2.subject
                    });
                }
            });
        }
    });
}

//对refund.succeeded的处理
function refundSucceeded(refund) {
    var setObj = {'refund': refund};
    if (refund.succeed) {
        setObj['status'] = 'refunded';
    }
    db.money.update({'charge.id': refund.charge}, {$set: setObj});
}

