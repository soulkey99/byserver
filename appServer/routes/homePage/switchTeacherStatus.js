/**
 * Created by zhengyi on 15/2/25.
 */
"use strict";
const proxy = require('../../../common/proxy');
const result = require('../../utils/result');
const log = require('../../../utils/log').http;

module.exports = function (req, res) {
    proxy.User.getUserById(req.body.userID, (err, user)=> {
        if (err) {
            log.error('switch teacher status error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
            return;
        }
        if (!user) {
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        if (user.userType != 'teacher') {
            return result(res, {statusCode: 904, message: '无效用户类型！'});
        }
        if (user.status == 'unavailable') {
            user.status = 'online';
            proxy.GSList.onUpdate(req.body.userID, 'online');
        } else {
            user.status = 'unavailable';
            proxy.GSList.onUpdate(req.body.userID, 'unavailable');
        }
        user.save((err, doc)=> {
            if (err) {
                log.error('switch teacher status error: ' + err.message);
                result(res, {statusCode: 905, message: err.message});
                return;
            }
            result(res, {statusCode: 900, currentStatus: doc.status});
        });
    });
};
