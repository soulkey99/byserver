/**
 * Created by MengLei on 2015/7/30.
 */

var cronJob = require('cron').CronJob;
var db = require('../../config').db;
var orderStatus = require('../api/orderStatus');
var orderFlow = require('../api/orderFlow');
var BagPipe = require('bagpipe');
var statusConfirm = require('../api/statusConfirm');
var umeng = require('../../utils/umeng');
var sendSMS = require('../../utils/sendSMS');
var log = require('../../utils/log').flow;
var bagPipe = new BagPipe(10);

var job = new cronJob('00 45 03 * * *', jobExec, null, true);


//每日执行任务
function jobExec() {
    checkFlowTask();  //流量对账任务，如果失败则重新发送任务
}

function checkFlowTask() {
    db.flowOrders.find({$and: [{status: {$ne: '1'}}, {status: {$ne: '00000'}}, {status: {$ne: '1203'}}, {status: {$ne: 'pause'}}, {retry: {$lte: 2}}, {checked: false}]}, function (err, doc) {
        if (err) {
            //handle error
        } else {
            //
            log.trace('flow order daily check num: ' + doc.length);
            for (var i = 0; i < doc.length; i++) {
                //console.log(doc.length);
                db.flowOrders.update({_id: doc[i]._id}, {$set: {checked: true}});
                bagPipe.push(reSend, doc[i], function (err, doc) {
                    if (err) {
                        //handle error
                        log.error('daily check error: ' + JSON.stringify(err));
                    } else {
                        //success
                        //console.log(doc);
                    }
                });
            }
        }
    });
}

function reSend(info, callback) {
    orderFlow({
        num: info.num,
        flow: info.flow,
        retry: ((info.retry || 0) + 1),
        purpose: info.purpose
    }, function (err, resp) {
        callback(err, resp);
    });
}

module.exports = job;
