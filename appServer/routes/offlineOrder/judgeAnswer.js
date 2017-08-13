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


//选定最佳答案param={userID: '', off_id: '', answer_id: ''}
module.exports = function(req, res){
    var param = {
        userID: req.body.userID,
        off_id: req.body.off_id,
        answer_id: req.body.answer_id
    };
    proxy.OfflineAnswer.judgeAnswer(param, (err, doc)=>{
        if(err){
            return result(res, {statusCode: doc || 905, message: err.message});
        }
        result(res, {statusCode: 900});
    });

    // zrpc('orderServer', 'judgeAnswer', param, function(err, resp){
    //     if(err){
    //         //
    //         log.error('judge answer error: ' + err.message);
    //         result(res, {statusCode: 905, message: err.message});
    //     }else{
    //         log.trace('judge answer request success.');
    //         result(res, {statusCode: 900});
    //     }
    // });
};
