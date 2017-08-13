/**
 * Created by MengLei on 2015/7/30.
 */
"use strict";
const proxy = require('../../../common/proxy');
const config = require('../../../config');
const db = require('../../../config').db;
const result = require('../../utils/result');
const objectId = require('mongojs').ObjectId;
const log = require('../../../utils/log').http;

//
module.exports = function (req, res) {
    proxy.User.getUserById(req.body.userID, (err, user)=> {
        if (err) {
            log.error('kill user error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
            return;
        }
        if (!user) {
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        user.phone = (user.phone + '_' + getDateStr());
        user.save((err2, doc2)=> {
            if (err2) {
                return result(res, {statusCode: 905, message: err2.message});
            }
            result(res, {statusCode: 900, phone: doc2.phone});
        });
    });
};


function getDateStr() {
    var curDate = new Date();
    var year = curDate.getFullYear().toString();
    var month = (curDate.getMonth() + 1).toString();
    month = month.length < 2 ? '0' + month : month;
    var date = curDate.getDate().toString();
    date = date.length < 2 ? '0' + date : date;
    var hour = curDate.getHours().toString();
    hour = hour.length < 2 ? '0' + hour : hour;
    var min = curDate.getMinutes().toString();
    min = min.length < 2 ? '0' + min : min;
    var sec = curDate.getSeconds().toString();
    sec = sec.length < 2 ? '0' + sec : sec;
    return year + month + date + hour + min + sec;
}