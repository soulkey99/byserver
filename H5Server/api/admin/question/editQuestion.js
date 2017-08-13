/**
 * Created by MengLei on 2015/12/16.
 */

var proxy = require('../../../../common/proxy');
var result = require('../../../utils/result');

//新增、编辑问题
module.exports = function(req, res){
    if(req.body.question_id){
        //如果问题id非空，那么就是编辑问题，否则就是新增问题
        proxy.BattleQuestion.editQuestion(req.body, function(err, doc){
            if(err){
                return result(res, {statusCode: 905, message: err.message});
            }
            if(doc === false){
                return result(res, {statusCode: 971, message: '问题id不存在！'});
            }
            result(res, {statusCode: 900});
        });
    }else{
        proxy.BattleQuestion.createQuestion(req.body, function(err){
            if(err){
                return result(res, {statusCode: 905, message: err.message});
            }
            result(res, {statusCode: 900});
        });
    }
};
