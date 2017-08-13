/**
 * Created by MengLei on 2015/7/20.
 */

var config = require('../../../config');
var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var proxy = require('../../../common/proxy');
var log = require('../../../utils/log').http;

//获取绑定、关联的账号信息
module.exports = function(req, res){
    var ep = new eventproxy();
    ep.after('item', req.user.linkID.length, function(list){
        var linkInfo = [];
        for(var i=0; i<list.length; i++){
            linkInfo.push({
                userID: list[i].userID,
                authSign: list[i].authSign,
                phone: list[i].phone,
                nick: list[i].nick,
                intro: list[i].intro,
                sso_info: list[i].sso_info
            });
        }
        result(res, {statusCode: 900, sso_info: req.user.sso_info, link_info: linkInfo});
    });
    ep.fail(function(err){
        result(res, {statusCode: 905, message: err.message});
    });
    for(var i=0; i<req.user.linkID.length; i++){
        proxy.User.getUserById(req.user.linkID[i], ep.done('item'));
    }
};
