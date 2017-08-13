/**
 * Created by MengLei on 2015/7/30.
 */
"use strict";
const config = require('../../../config');
const proxy = require('../../../common/proxy');
const result = require('../../utils/result');
const log = require('../../../utils/log').http;

//修改密码
module.exports = function (req, res) {
    //
    if (!req.body.old_passwd || !req.body.new_passwd) {
        log.error('change password, old_passwd or new_passwd can not be null.');
        return result(res, {statusCode: 927, message: '旧密码或新密码不能为空！'});
    }
    proxy.User.getUserById(req.body.userID, (err, user)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!user) {
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        if (user.passwd != req.body.old_passwd) {
            log.error('changePwd error, old_passwd error.');
            return result(res, {statusCode: 923, message: '旧密码错误！'});
        }
        user.passwd = req.body.new_passwd;
        user.save((err2)=> {
            if (err2) {
                return result(res, {statusCode: err2.message});
            }
            result(res, {statusCode: 900});
        });
    });
};
