/**
 * Created by MengLei on 2015/12/16.
 */

var proxy = require('../../../../common/proxy');
var result = require('../../../utils/result');

//获取问题列表
module.exports = function(req, res) {
    var query = {};
    if (req.body.type) {
        query.type = req.body.type;
    }
    if (req.body.category) {
        query.category = req.body.category;
    }
    if (req.body.difficulty != undefined) {
        query.difficulty = req.body.difficulty;
    }
    if (req.body.startPos) {
        query.startPos = req.body.startPos;
    }
    if (req.body.pageSize) {
        query.pageSize = req.body.pageSize;
    }
    if (req.body.status) {
        query.status = req.body.status;
    }
    if (req.body.valid) {
        query.valid = (req.body.valid == 'true');
    }
    if (req.body.key) {
        query.key = req.body.key;
    }
    proxy.BattleQuestion.getQuestionList(query, function (err, doc) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        var list = [];
        for (var i = 0; i < doc.length; i++) {
            var item = {
                question_id: doc[i].question_id,
                type: doc[i].type,
                category: doc[i].category,
                correct: doc[i].correct,
                presence: doc[i].presence,
                lastVerify: doc[i].lastVerify,
                status: doc[i].status,
                valid: doc[i].valid,
                updateTime: doc[i].updateTime,
                createTime: doc[i].createTime,
                contributor: doc[i].contributor,
                answer: doc[i].answer,
                layout: doc[i].layout,
                choice: doc[i].choice.toObject({getters: true}),
                question: doc[i].question,
                copyRight: doc[i].copyRight,
                difficulty: doc[i].difficulty,
                tag: doc[i].tag
            };
            list.push(item);
        }
        result(res, {statusCode: 900, list: list});
    });
};
