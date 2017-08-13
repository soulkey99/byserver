/**
 * Created by MengLei on 2015/8/28.
 */
"use strict";
const config = require('../../../config');
const proxy = require('../../../common/proxy');
const result = require('../../utils/result');
const log = require('../../../utils/log').http;
const dnode = require('../../utils/dnodeClient');
const zrpc = require('../../../utils/zmqClient');

//获取离线问题答案详情param={answer_id: '', userID: ''}
module.exports = function (req, res) {
    proxy.OfflineAnswer.getDetail(req.body.answer_id, req.body.userID, (err, detail)=>{
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        if(!detail){
            return result(res, {statusCode: 915, message: '离线答案ID对应的内容不存在！'});
        }
        result(res, {statusCode: 900, detail});
    });
    // var param = {
    //     userID: req.body.userID,
    //     answer_id: req.body.answer_id
    // };
    // zrpc('orderServer', 'getOfflineAnswerDetail', param, function (err, resp) {
    //     if (err) {
    //         //
    //         log.error('get offline answer detail error: ' + err.message);
    //         result(res, {statusCode: 905, message: err});
    //     } else {
    //         log.trace('get offline answer detail request success.');
    //         result(res, {statusCode: 900, detail: resp});
    //     }
    // });
};
