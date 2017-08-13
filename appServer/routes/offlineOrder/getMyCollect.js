/**
 * Created by MengLei on 2015/8/26.
 */
"use strict";
const config = require('../../../config');
const result = require('../../utils/result');
const proxy = require('../../../common/proxy');
const log = require('../../../utils/log').http;
const dnode = require('../../utils/dnodeClient');

//获取我收藏的离线问答，param={userID: '', startPos: '', pageSize: '', type: 'topic/answer'}
module.exports = function (req, res) {
    var param = {
        userID: req.body.userID
    };
    if (req.body.startPos) {
        param.startPos = req.body.startPos;
    }
    if (req.body.pageSize) {
        param.pageSize = req.body.pageSize;
    }
    if (req.body.u_id) {
        param.u_id = req.body.u_id;
    }
    if (req.body.type == 'topic') {
        proxy.TopicCollect.getCollectedTopics(param, (err, list)=> {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900, list});
        });
    } else {
        proxy.AnswerCollect.getCollectedAnswers(param, (err, list)=> {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900, list});
        });
    }
    // dnode('orderServer', 'getMyCollect', param, function(err, resp){
    //     if(err){
    //         //
    //         log.error('get my collect offline topic error: ' + err.message);
    //         result(res, {statusCode: 905, message: err});
    //     }else{
    //         log.trace('get my collect offline topic request success.');
    //         result(res, {statusCode: 900, list: resp});
    //     }
    // });
};
