/**
 * Created by MengLei on 2015/12/8.
 */

var config = require('../../../config');
var db = require('../../../config').db;
var proxy = require('../../../common/proxy');
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('../../../utils/log').http;

//进行账号绑定之前，需要检查是否可以绑定
module.exports = function(req, res) {
    //定义返回值，用户是否存在，是否绑定了手机号，是否绑定了微信，是否绑定了qq，是否绑定了微博
    var resp = {statusCode: 900, exist: false, phone: false, weixin: false, qq: false, weibo: false, linked: false};
    if (req.body.type == 'phone') {
        proxy.User.getUserByPhone(req.body.phone, function (err, doc) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
                return;
            }
            if(doc){
                resp.exist = true;
                resp.phone = true;//手机号
                //存在用户
                if(doc.sso_info && doc.sso_info.qq && doc.sso_info.qq.openid){
                    //qq
                    resp.qq = true;
                }
                if(doc.sso_info && doc.sso_info.weixin && doc.sso_info.weixin.openid){
                    //微信
                    resp.weixin = true;
                }
                if(doc.sso_info && doc.sso_info.weibo && doc.sso_info.weibo.openid){
                    //微博
                    resp.weibo = true;
                }
                if(doc.linkID){
                    //是否已关联
                    resp.linked = (doc.linkID.indexOf(req.body.userID) >= 0);
                }
            }
            result(res, resp);
        });
    } else if (req.body.type == 'sso') {
        proxy.User.getUserBySSO(req.body.openid, req.body.ssoType || 'qq', function (err, doc) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
                return;
            }
            if(doc){
                resp.exist = true;
                //存在用户
                if(doc.phone){  //手机号
                    resp.phone = true;
                }
                if(doc.sso_info && doc.sso_info.qq && doc.sso_info.qq.openid){
                    //qq
                    resp.qq = true;
                }
                if(doc.sso_info && doc.sso_info.weixin && doc.sso_info.weixin.openid){
                    //微信
                    resp.weixin = true;
                }
                if(doc.sso_info && doc.sso_info.weibo && doc.sso_info.weibo.openid){
                    //微博
                    resp.weibo = true;
                }
                if(doc.linkID){
                    //是否已关联
                    resp.linked = (doc.linkID.indexOf(req.body.userID) >= 0);
                }
            }
            result(res, resp);
        });
    } else {
        result(res, {statusCode: 950, message: 'type参数不正确！'});
    }
};