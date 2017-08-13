/**
 * Created by MengLei on 2016/3/15.
 */
"use strict";
let proxy = require('./../../../common/proxy');
let result = require('../../utils/result');
let log = require('../../../utils/log').http;

//获取用户快速回复列表
module.exports = function(req, res){
    proxy.FastReply.getUserFastReply(req.body.userID, {startPos: req.body.startPos, pageSize: req.body.pageSize}, function(err,doc){
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        let list = [];
        for(let i=0; i<doc.length; i++){
            let item = doc[i].toObject({getters: true});
            delete(item._id);
            delete(item.userID);
            delete(item.id);
            delete(item.__v);
            list.push(item);
        }
        result(res, {statusCode: 900, list: list});
    });
};
