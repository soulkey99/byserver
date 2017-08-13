/**
 * Created by MengLei on 2015/8/12.
 */
"use strict";
const config = require('../../../config');
const result = require('../../utils/result');
const proxy = require('../../../common/proxy');
const log = require('../../../utils/log').http;
const dnode = require('../../utils/dnodeClient');
const zrpc = require('../../../utils/zmqClient');

//获取离线问题详情param={off_id: '', userID: ''}
module.exports = function(req, res){
    proxy.OfflineTopic.getDetail(req.body.off_id, req.body.userID, (err, detail)=>{
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        if(!detail){
            return result(res, {statusCode: 914, message: '离线问题ID对应内容不存在！'});
        }
        result(res, {statusCode: 900, detail});
    });
    // var param = {
    //     userID: req.body.userID,
    //     off_id: req.body.off_id
    // };
    // zrpc('orderServer', 'getOfflineTopicDetail', param, function(err, resp){
    //     if(err){
    //         //
    //         log.error('get offline topic detail error: ' + err.message);
    //         result(res, {statusCode: 905, message: err});
    //     }else{
    //         log.trace('get offline topic detail request success.');
    //         result(res, {statusCode: 900, detail: resp});
    //     }
    // });
};
