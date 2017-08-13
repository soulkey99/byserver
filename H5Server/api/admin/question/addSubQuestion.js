/**
 * Created by MengLei on 2016/1/28.
 */

var proxy = require('../../../../common/proxy');
var result = require('../../../utils/result');

//关联子问题
module.exports = function(req, res) {
    var param = {
        question_id: req.body.question_id,
        choice_id: req.body.choice_id,
        sub_question_id: req.body.sub_question_id
    };
    proxy.BattleQuestion.addSubQuestion(param, function (err, doc, msg) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!doc) {
            result(res, {statusCode: 971, message: msg});
        }
        result(res, {statusCode: 900});
    });
};
