/**
 * Created by MengLei on 2015/9/6.
 */
"use strict";
const config = require('../../../../config');
const result = require('../../../utils/result');
const proxy = require('../../../../common/proxy');
const log = require('../../../../utils/log').http;
const dnode = require('../../../utils/dnodeClient');

//关注用户，param={userID: '', type: 'following/followers', startPos: '', pageSize: '', getType: ''}
module.exports = function (req, res) {
    let start = parseInt(req.body.startPos || '1') - 1;
    if (start != 0) {   //这段代码是为了兼容之前的分页操作，目前不分页，一次返回所有数据，所以凡是分页起始位置不是第一页的，直接返回空数组
        return result(res, {statusCode: 900, list: []});
    }
    if (req.body.type == 'followers') {
        proxy.Follow.getUserFollowersByID(req.body.userID, req.body.u_id, (err, list)=> {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900, list});
        });
    } else {
        proxy.Follow.getUserFollowingByID(req.body.userID, req.body.u_id, req.body.type, (err, list)=> {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900, list});
        });
    }
    // var param = {
    //     userID: req.body.userID,
    //     type: (req.body.type || 'following'),
    //     u_id: req.body.u_id,
    //     startPos: req.body.startPos || '1',
    //     pageSize: req.body.pageSize || '10'
    // };
    // if (req.body.getType) {
    //     param.getType = req.body.getType;
    // }
    //
    // dnode('orderServer', 'getUserSocialList', param, function (err, resp) {
    //     if (err) {
    //         //
    //         log.error('get my social error: ' + err.message);
    //         result(res, {statusCode: 905, message: err});
    //     } else {
    //         log.trace('get my social request success. off_id=' + param.off_id);
    //         result(res, resp);
    //     }
    // });
};

