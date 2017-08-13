/**
 * Created by MengLei on 2015/7/28.
 */
"use strict";
const config = require('../../../config');
const proxy = require('../../../common/proxy');
const db = require('../../../config').db;
const result = require('../../utils/result');
const objectId = require('mongojs').ObjectId;
const log = require('../../../utils/log').http;

//设置登录密码
module.exports = function(req, res){
    proxy.User.getUserById(req.body.userID, (err, user)=>{
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        if(!user){
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        user.passwd = req.body.passwd;
        user.save((err2)=>{
            if(err2){
                return result(res, {statusCode: 905, message: err2.message});
            }
            result(res, {statusCode: 900});
        });
    });
};
