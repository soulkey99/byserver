/**
 * Created by MengLei on 2015/11/27.
 */

var db = require('./../../../../config').db;
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;

//获取公众号的菜单配置
module.exports = function(req, res) {
    db.users.findOne({_id: new objectId(req.body.userID)}, {menu: 1}, function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            var menu = [];
            if (doc && doc.menu) {
                menu = doc.menu;
            }
            result(res, {statusCode: 900, menu: menu});
        }
    });
};
