/**
 * Created by MengLei on 2015/5/29.
 */
var result = require('../../utils/result');
var proxy = require('./../../../common/proxy');
var log = require('../../../utils/log').http;

//接受用户意见反馈
module.exports = function(req, res) {
    var info = {
        userID: req.body.userID,
        stars: req.body.stars,
        type: req.body.type,
        content: req.body.content || '',
        email: req.body.email,
        direction: 'u2a',
        qq: req.body.qq || '',
        platform: req.headers.platform || 'unknown',
        os_version: req.body.os_version || '',
        userType: req.body.userType,
        client_version: req.headers.client || '',
        channel: req.headers.channel || ''
    };
    if(req.body.type == 'image'){
        info.orientation = req.body.orientation;
    }else if(req.body.type == 'voice'){
        info.duration = parseInt(req.body.duration);
    }

    proxy.Feedback.createFeedback(info, function(err){
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });
};