/**
 * Created by MengLei on 2015/9/4.
 */
"use strict";
const config = require('../../../../config');
const result = require('../../../utils/result');
const proxy = require('../../../../common/proxy');
const log = require('../../../../utils/log').http;
const dnode = require('../../../utils/dnodeClient');

//关注用户，param={userID: '', u_id: '', action: ''}
module.exports = function (req, res) {
    if (req.body.userID == req.body.u_id) {
        return result(res, {statusCode: 949, message: '关注用户失败，不能关注自己！'});
    }
    proxy.Follow.doFollow(req.body.userID, req.body.u_id, req.body.action, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            return result(res, {statusCode: 948, message: '关注失败，待关注的用户不存在！'});
        }
        result(res, {statusCode: 900});
    });
    // var param = {
    //     userID: req.body.userID,
    //     u_id: req.body.u_id
    // };
    // if (req.body.action) {
    //     param.action = req.body.action;
    // }
    // dnode('orderServer', 'followUser', param, function (err, resp) {
    //     if (err) {
    //         //
    //         log.error('follow user error: ' + err.message);
    //         result(res, {statusCode: 905, message: err});
    //     } else {
    //         log.trace('follow user request success. off_id=' + param.off_id);
    //         result(res, resp);
    //     }
    // });
};
