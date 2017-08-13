/**
 * Created by MengLei on 2015/12/15.
 */

var model = require('../model');
var objectId = require('mongoose').Types.ObjectId;
var eventproxy = require('eventproxy');
var BattleQuestion = model.BattleQuestion;

/**
 * 根据问题id获取问题内容
 * Callback
 * - err, 数据库异常
 * - doc, 问题内容
 * @param {String} id 问题id
 * @param {Function} callback 回调函数
 */
exports.getQuestionById = function(id, callback){
    BattleQuestion.findOne({_id: id}, callback);
};

/**
 * 随机获取一定数量的题目
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{category: '', count: '', difficulty: '', type: ''}
 * @param {Function} callback 回调函数
 */
exports.getQuestionRandom = function(param, callback) {
    var query = {valid: true, status: 'verified'};
    if (param.category != undefined) {
        query['category'] = param.category;
    }
    if (param.difficulty != undefined) {
        query['difficulty'] = param.difficulty;
    }
    if (param.type != undefined) {//对战题目除非指定类型，否则只选择type=default的
        if (param.type.indexOf(',') > 0) {
            query['type'] = {$in: param.type.indexOf(',')};
        } else {
            query['type'] = param.type;
        }
    } else {
        query['type'] = 'default';
    }
    if (param.count == undefined) {
        param.count = 10;
    }
    BattleQuestion.aggregate([{$match: query}, {$sample: {size: param.count}}], function (err, doc) {
        if (err) {
            return callback(err);
        }
        var list = [];
        for (var i = 0; i < doc.length; i++) {
            list.push({
                question_id: doc[i]._id.toString(),
                category: doc[i].category,
                contributor: doc[i].contributor,
                answer: doc[i].answer,
                layout: doc[i].layout,
                choice: doc[i].choice,
                question: doc[i].question,
                copyRight: doc[i].copyRight,
                difficulty: doc[i].difficulty,
                tag: doc[i].tag
            });
        }
        callback(null, list);
    });
};

/**
 * 获取题目列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 传入参数{category: '', startPos: '', pageSize: '', difficulty: '', status: '', valid: '', key: '搜索关键字', question_id: ''}
 * @param {Function} callback 回调函数
 */
exports.getQuestionList = function(param, callback) {
    var query = {};
    var start = (!!param.startPos ? parseInt(param.startPos) : 1) - 1;
    var count = !!param.pageSize ? parseInt(param.pageSize) : 10;
    var opt = {
        skip: start < 0 ? 0 : start,
        limit: count,
        sort: '-createTime'
    };
    if (param.type) {
        if (param.type.indexOf(',') > 0) {
            query['type'] = {$in: param.type.split(',')};
        } else {
            query['type'] = param.type;
        }
    }
    if (param.category != undefined) {
        query['category'] = param.category;
    }
    if (param.difficulty != undefined) {
        query['difficulty'] = parseInt(param.difficulty);
    }
    if (param.status != undefined) {
        query['status'] = param.status;
    }
    if (param.valid != undefined) {
        query['valid'] = param.valid;
    }
    if (param.key) {
        query['$or'] = [{'question.msg': {$regex: param.key}}, {'choice.content.msg': {$regex: param.key}}];
    }
    if (param.sort != undefined) {
        opt['sort'] = param.sort;
    }
    BattleQuestion.find(query, {}, opt, callback);
};

/**
 * 新增子问题
 * Callback:
 * - err, 数据库异常
 * - doc, 结果
 * @param {String} question_id 问题id
 * @param {Function} callback 回调函数
 */
exports.getDetail = function(question_id, callback){
    BattleQuestion.findById(question_id, callback);
};


/**
 * 新增子问题
 * Callback:
 * - err, 数据库异常
 * - doc, 结果
 * @param {Object} param 传入参数,param = {question_id: '', choice_id: '', sub_question_id: ''}
 * @param {Function} callback 回调函数
 */
exports.addSubQuestion = function(param, callback) {
    BattleQuestion.findOne({_id: param.question_id}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if(!doc){
            return callback(null, null, 'question_id不存在！');
        }
        var subdoc = doc.choice.id(param.choice_id);
        if(!subdoc){
            return callback(null, null, 'choice_id不存在！');
        }
        subdoc.next = param.sub_question_id;
        doc.save(callback);
    });
};

/**
 * 获取问题
 * Callback:
 * - err, 数据库异常
 * - doc, 结果
 * @param {Object} param 传入参数,param = {key: '', startPos: '', pageSize: ''}
 * @param {Function} callback 回调函数
 */
exports.searchQuestion = function(param, callback){
    var start = parseInt(param.startPos || '1') - 1;
    var count = parseInt(param.pageSize || '10');
    var query = {};
    if(param.key){
        query = {'question.msg': {$regex: param.key}};
    }
    BattleQuestion.find(query, {}, {skip: (start< 0? 0: start), limit: count}, callback);
};


/**
 * 新增问题
 * Callback:
 * - err, 数据库异常
 * - doc, 结果
 * @param {Object} param 传入参数
 * @param {Function} callback 回调函数
 */
exports.createQuestion = function(param, callback) {
    var question = new BattleQuestion();
    if (param.tag != undefined) {
        question.tag = param.tag.split(',');
    }
    if (param.category != undefined) {
        question.category = param.category;
    }
    if (param.type != undefined) {
        question.type = param.type;
    }
    if (param.difficulty != undefined) {
        question.difficulty = parseInt(param.difficulty);
    }
    if (param.copyRight) {
        question.copyRight = param.copyRight;
    }
    if (param.question != undefined) {
        try {
            question.question = JSON.parse(param.question);
        } catch (ex) {
            return callback(ex);
        }
    }
    if (param.choice != undefined) {
        try {
            question.choice = JSON.parse(param.choice);
        } catch (ex) {
            return callback(ex);
        }
    }
    if (param.layout != undefined) {
        question.layout = param.layout;
    }
    if (param.valid != undefined) {
        question.valid = (param.valid == 'true');
    }
    if (param.answer != undefined) {
        question.answer = param.answer;
    }
    if (param.contributor != undefined) {
        question.contributor = param.contributor;
    }
    question._id = new objectId();
    question.createTime = Date.now();
    question.updateTime = Date.now();
    question.save(callback);
};

/**
 * 编辑问题
 * Callback:
 * - err, 数据库异常
 * - doc, 结果
 * @param {Object} param 传入参数
 * @param {Function} callback 回调函数
 */
exports.editQuestion = function(param, callback) {
    BattleQuestion.findOne({_id: param.question_id}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(null, false);
        }
        if (param.category != undefined) {
            doc.category = param.category;
        }
        if (param.type != undefined) {
            doc.type = param.type;
        }
        if (param.status != undefined) {
            doc.status = param.status;
        }
        if (param.valid != undefined) {
            doc.valid = (param.valid == 'true');
        }
        if (param.contributor != undefined) {
            doc.contributor = param.contributor;
        }
        if (param.answer != undefined) {
            doc.answer = param.answer;
        }
        if (param.layout != undefined) {
            doc.layout = param.layout;
        }
        if (param.choice != undefined) {
            try {
                doc.choice = JSON.parse(param.choice);
            } catch (ex) {
                return callback(ex);
            }
        }
        if (param.question != undefined) {
            try {
                doc.question = JSON.parse(param.question);
            } catch (ex) {
                return callback(ex);
            }
        }
        if (param.copyRight != undefined) {
            doc.copyRight = param.copyRight;
        }
        if (param.difficulty != undefined) {
            doc.difficulty = parseInt(param.difficulty);
        }
        if (param.tag != undefined) {
            doc.tag = param.tag.split(',');
        }
        doc.updateTime = Date.now();
        doc.save(callback);
    });
};
