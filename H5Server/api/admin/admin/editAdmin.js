/**
 * Created by MengLei on 2015/11/4.
 */

var db = require('./../../../../config').db;
var result = require('./../../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../../utils/log').h5;

//新增、编辑管理员信息，如果传u_id就是编辑，否则就是新增
module.exports = function(req, res) {
    var _id = new objectId();
    var secs = [];
    var pages = [];
    if (req.body.u_id) {
        try {
            _id = new objectId(req.body.u_id)
        } catch (ex) {
            result(res, {statusCode: 919, message: ex.message});
            return;
        }
        var setObj = {};
        if (req.body.nick != undefined) {
            setObj['nick'] = req.body.nick;
        }
        if (req.body.userPwd != undefined) {
            setObj['userPwd'] = req.body.userPwd;
        }
        if (req.body.adminType != undefined) {
            setObj['adminType'] = req.body.adminType;
        }
        if (req.body.sections != undefined) {
            if (req.body.sections) {
                secs = req.body.sections.split(',');
            }
            setObj['sections'] = secs;
        }
        if (req.body.pages != undefined) {
            if (req.body.pages) {
                pages = req.body.pages.split(',');
            }
            setObj['pages'] = pages;
        }
        db.admins.update({_id: _id}, {$set: setObj}, function (err) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                result(res, {statusCode: 900});
            }
        });
    } else {
        var item = {
            userName: req.body.userName,
            userPwd: req.body.userPwd,
            authSign: '',
            adminType: req.body.adminType,
            nick: req.body.nick,
            createTime: (new Date()).getTime(),
            lastLoginTime: 0
        };
        if (req.body.adminType == 'admin') {
            if (req.body.sections) {
                secs = req.body.sections.split(',');
            }
            if (req.body.pages) {
                pages = req.body.pages.split(',');
            }
        }
        item['sections'] = secs;
        item['pages'] = pages;
        db.admins.insert(item, function (err) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                result(res, {statusCode: 900});
            }
        });
    }
};
