/**
 * Created by MengLei on 2015/11/9.
 */

var config = require('../../../config');
var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('../../../utils/log').http;
var sendSMS = require('../../../utils/sendSMS');
var dbLog = require('../../../utils/log').dbLog;

//获取签到状态信息
module.exports = function(req, res){
    db.dbLog.find({'action': 'checkin', 'userID': req.body.userID}).sort({t: -1}).limit(5).toArray(function(err, doc){
        if(err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            var t1 = (new Date()).setHours(0, 0, 0, 0), t2 = (new Date(t1)).setDate(-1), t3 = (new Date(t1)).setDate(-2), t4 = (new Date(t1)).setDate(-3), t5 = (new Date(t1)).setDate(-4), t6 = (new Date(t1)).setDate(-5), t7 = (new Date(t1)).setDate(-6);
                   //---<t0>---<t1>----<t2>----<t3>----<t4>----<t5>---<t6>---<t7>--
            var c_days = [false, false, false, false, false, false, false];   //最近7天是否签到（包括今天）

            for(var i=0; i<doc.length; i++) {
                if (doc[i].t > t1) {
                    c_days[0] = true;
                } else if (doc[i].t > t2) {
                    c_days[1] = true;
                } else if (doc[i].t > t3) {
                    c_days[2] = true;
                } else if (doc[i].t > t4) {
                    c_days[3] = true;
                } else if (doc[i].t > t5) {
                    c_days[4] = true;
                } else if (doc[i].t > t6) {
                    c_days[5] = true;
                } else if (doc[i].t > t7) {
                    c_days[6] = true;
                }
            }
            //此处计算用户连续签到的天数，首先假定今天已经签到，计算一共签到了几天，然后再看今天的实际情况，
            //如果今天没签到，那么再减去1
            var last = c_days.indexOf(false, 1);
            if(!c_days[0]) {
                last--;
            }
            result(res, {statusCode: 900, today: c_days[0], last: last, detail: c_days});
        }
    });
};
