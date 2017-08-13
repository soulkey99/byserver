/**
 * Created by MengLei on 2015/9/19.
 */
"use strict";
const db = require('../../../../config').db;
const result = require('../../../utils/result');
const eventproxy = require('eventproxy');
const log = require('./../../../../utils/log').h5;

//获取指定教师指定时间段内的分日答题数据
//返回数据：id，手机号，昵称，姓名，接单数
module.exports = function (req, res) {
    db.users.findOne({phone: req.body.phonenum}, {_id: 1}, function (err, doc) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            return result(res, {statusCode: 902, message: '教师的手机号码不存在！'});
        }
        let ep = new eventproxy();

        let d1 = new Date();//开始时间
        let d2 = new Date();//截止时间

        if (req.body.startTime) {
            d1 = new Date(parseFloat(req.body.startTime));
        }
        if (req.body.endTime) {
            d2 = new Date(parseFloat(req.body.endTime));
        }
        d1.setHours(0, 0, 0, 0);
        d2.setHours(23, 59, 59, 999);
        let start = d1.getTime();
        let end = d2.getTime();

        ep.after('daily', Math.round((end - start) / 86400000), function (list) {
            let resList = [];
            for (let i = 0; i < list.length; i++) {
                if (list[i].date) {
                    resList.push(list[i]);
                }
            }
            resList.sort((a, b)=>a.t - b.t);
            result(res, {statusCode: 900, list: resList});
        });

        for (let i = 0; i < Math.round((end - start) / 86400000); i++) {
            let query = {
                t_id: doc._id.toString(),
                start_time: {$gte: start + 86400000 * i, $lte: start + 86400000 * (i + 1)}
            };
            db.orders.find(query, {start_time: 1, s_id: 1, grade: 1, subject: 1}, ep.done('daily', (doc2)=> {
                let resp = {date: '', t: 0, count: 0, s_count: 0, detail: {}};
                if (doc2.length > 0) {
                    let detail = {};
                    let s_idObj = {};
                    for (let i = 0; i < doc2.length; i++) {
                        s_idObj[doc2[i].s_id] = 1;
                        detail[doc2[i].grade] ? (detail[doc2[i].grade]++) : (detail[doc2[i].grade] = 1);
                        detail[doc2[i].grade + doc2[i].subject] ? (detail[doc2[i].grade + doc2[i].subject]++) : (detail[doc2[i].grade + doc2[i].subject] = 1);
                    }
                    resp = {
                        date: dateStr(doc2[0].start_time),
                        t: doc2[0].start_time,
                        count: doc2.length,
                        s_count: Object.keys(s_idObj).length,
                        detail: detail
                    };
                }
                return resp;
            }));
        }
    });
};

//日期string
function dateStr(t) {
    let ts = new Date(t);
    let year = ts.getFullYear().toString();
    let month = (ts.getMonth() + 1).toString();
    month = month.length < 2 ? '0' + month : month;
    let date = ts.getDate().toString();
    date = date.length < 2 ? '0' + date : date;
    return year + month + date;
}