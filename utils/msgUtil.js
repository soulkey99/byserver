/**
 * Created by MengLei on 2015/9/22.
 */

var db = require('./../config').db;
var config = require('./../config');
var objectId = require('mongojs').ObjectId;
var eventproxy = require('eventproxy');
var log = require('./../utils/log').order;

//收件箱相关，param = {to: '', type: '', u_id: '', detail: {type: '', id: ''}}
//type种类：answer回答离线问题，reply评论离线答案，
//upAnswer支持离线答案，downAnswer反对离线答案，cancelupAnswer取消支持离线答案，canceldownAnswer取消反对离线答案
//upReply支持离线回复，downReply反对离线回复，cancelupReply取消支持离线回复，canceldownReply取消反对离线回复
//follow关注，unfollow取消关注
//notice：通知消息，system：系统通知，活动：activity
//detail.type种类：watch我关注的，owner我的
module.exports = function(param){
    var item = {
        from: param.from || 'system',
        to: param.to,
        type: param.type,
        u_id: param.u_id || '',
        detail: {
            type: '',
            id: ''
        }
    };
};
