/**
 * Created by MengLei on 2015/9/8.
 */
"use strict";
const config = require('../../../../config');
const result = require('../../../utils/result');
const proxy = require('../../../../common/proxy');
const log = require('../../../../utils/log').http;
const dnode = require('../../../utils/dnodeClient');

//获取用户个人信息，param={userID: '', u_id: ''}，如果传u_id，则取那个u_id的，如果没传，则取那个userID的
module.exports = function(req, res){
    proxy.User.getUserSocialInfo(req.body.userID, req.body.u_id, (err, info)=>{
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        if(!info){
            return result(res, {statusCode: 902, message: '待查询用户不存在！'});
        }
        result(res, {statusCode: 900, info});
    });
    // var param = {
    //     userID: req.body.userID,
    //     u_id: req.body.u_id
    // };
    //
    // dnode('orderServer', 'getUserSocialInfo', param, function(err, resp){
    //     if(err){
    //         //
    //         log.error('get user social info error: ' + err.message);
    //         result(res, {statusCode: 905, message: err});
    //     }else{
    //         log.trace('get user social info request success. ');
    //         result(res, resp);
    //     }
    // });
};
