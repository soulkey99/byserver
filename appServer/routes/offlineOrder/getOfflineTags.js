/**
 * Created by MengLei on 2015/9/1.
 */
"use strict";
const config = require('../../../config');
const proxy = require('../../../common/proxy');
const result = require('../../utils/result');
const log = require('../../../utils/log').http;
const dnode = require('../../utils/dnodeClient');
const zrpc = require('../../../utils/zmqClient');

//获取离线问题的可用tags，param={startPos: '', pageSize: ''}
module.exports = function(req, res){
    var param = {};
    if(req.body.startPos){
        param.startPos = req.body.startPos;
    }
    if(req.body.pageSize){
        param.pageSize = req.body.pageSize;
    }
    proxy.OfflineTags.getList(param, (err, tags)=>{
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, tags});
    });
    // zrpc('orderServer', 'getOfflineTags', param, function(err, resp){
    //     if(err){
    //         //
    //         log.error('get offline tags error: ' + err.message);
    //         result(res, {statusCode: 905, message: err.message});
    //     }else{
    //         log.trace('get offline tags request success.');
    //         result(res, {statusCode: 900, tags: resp});
    //     }
    // });
};
