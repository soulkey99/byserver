/**
 * Created by MengLei on 2015/6/13.
 */

var cronJob = require('cron').CronJob;
var db = require('../../config').db;
var orderStatus = require('../api/orderStatus');
var BagPipe = require('bagpipe');
var statusConfirm = require('../api/statusConfirm');
var umeng = require('../../utils/umeng');
var sendSMS = require('../../utils/sendSMS');
var log = require('../../utils/log').flow;
var bagPipe = new BagPipe(10);

var job = new cronJob('00 30 * * * *', jobExec, null, true);

//jobExec();

function jobExec() {
    //
    log.trace('flow check service started.');
    orderStatus(function (err, respStr) {
        if (err) {
            //handle error
        } else {
            var resp = {};
            try {
                resp = JSON.parse(respStr);
            } catch (ex) {
                log.error('check status response string error. not a valid json.');
                return;
            }
            //console.log(resp.reports.length);
            //获取成功，进行接下来的处理
            if (resp.status && resp.status == '1') {
                log.trace('report count to check: ' + resp.reports.length);
                for (var i = 0; i < resp.reports.length; i++) {
                    bagPipe.push(check, resp.reports[i], function (err, doc) {
                        //
                        if (err) {
                            log.error('check status error: ' + err.message);
                        } else {
                            if (doc) {
                                log.trace('check status success: mobile' + doc.num);
                            }
                        }
                    });
                }
            }
        }
    });
}


function check(info, callback) {
    //如果返回状态没有msgid，那么不继续
    if (!info.msgid) {
        //console.log('null msgid');
        callback(null, null);
        return;
    }

    //检查msgid
    db.flowOrders.findAndModify({
        query: {msgid: info.msgid, status: '1'},
        update: {$set: {status: info.status}},
        new: true
    }, function (err, doc) {
        if (err) {
            //handle error
            log.error('check flow record error: msgid: ' + info.msgid);
            callback(err);
        } else {
            //console.log(doc);
            //check success，返回修改后的值
            if (doc) {
                if (doc.status == '00000') {
                    //如果查到的状态是成功，那么发短信告知用户，否则，只更改数据库中状态，等待每日对账时，重新发送请求
                    notify(doc.num, doc.flow);
                }
                statusConfirm(info.msgid, info.mobile, function (err) {
                    if (err) {
                        log.error('status confirm error: ' + err.message);
                        callback(err);
                    } else {
                        log.trace('query and modify database success, msgid: ' + doc.msgid + ', phone number: ' + doc.num + ', status: ' + info.status);
                        callback(null, doc);
                    }
                });
            } else {
                log.trace('msgid: ' + info.msgid + 'not exists.');
                callback({message: 'msgid: ' + info.msgid + 'not exists.'});
            }
        }
    });
}

//通知用户流量已经到账
function notify(num, flow){
    log.trace('notify flow');
    //return;
    //短信
    sendSMS({mobilePhoneNumber: num, template: 'byflow', flow: flow}, function(err, resp){
        //
        if(err){
            log.error('send sms error: ' + err.message);
        }else{
            log.trace('send sms success. ' + JSON.stringify(resp));
        }
    });

    //推送通知
    //db.users.findOne({phone: num}, function(err, doc){
    //    if(err){
    //        //handle error
    //    }else{
    //        if(doc){
    //            var dest = doc._id.toString();
    //            log.trace('umeng push flow notify');
    //            umeng(dest, {text: '感谢您使用CallCall教师，为了感谢您的支持，' + flow + '兆免费流量已经存入您的手机账户，请注意查收短信通知。【CallCall教师】', type: 'notice'});
    //        }
    //    }
    //});
}

module.exports = job;
