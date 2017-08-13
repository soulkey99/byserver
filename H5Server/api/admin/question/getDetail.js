/**
 * Created by MengLei on 2016/2/4.
 */

var proxy = require('../../../../common/proxy');
var result = require('../../../utils/result');

//获取问题详情
module.exports = function(req, res){
    proxy.BattleQuestion.getDetail(req.body.question_id, function(err, doc){
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        if(!doc){
            return result(res, {statusCode: 971, message: '问题id不存在！'});
        }
        result(res, {statusCode: 900, detail: doc.toObject({getters: true})});
    });
};

