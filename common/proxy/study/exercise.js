/**
 * Created by MengLei on 2016-04-18.
 */
"use strict";
const model = require('../../model');
const eventproxy = require('eventproxy');
const lodash = require('lodash');
const Exercise = model.StudyExercise;

/**
 * 根据id获取练习记录
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} id 练习id
 * @param {Function} callback 回调函数
 */
exports.getExerciseByID = function (id, callback) {
    Exercise.findById(id, callback);
};

/**
 * 获取练习列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {userID: '', type: '', startPos: '', pageSize: '', stage: '', grade: '', subject: ''}
 * @param {Function} callback 回调函数
 */
exports.getList = function (param, callback) {
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    let query = {userID: param.userID};
    if (param.stage) {
        query['stage'] = param.stage;
    }
    if (param.grade) {
        query['grade'] = param.grade;
    }
    if (param.subject) {
        query['subject'] = param.subject;
    }
    if (param.status) { //状态列表，默认取全部，可以按照条件来筛选，倒序排列
        query.status = {$in: param.status.split(',')};
    }
    Exercise.find(query, {
        stage: 1,
        grade: 1,
        subject: 1,
        type: 1,
        createAt: 1,
        updateAt: 1
    }, {sort: '-updateAt', skip: start, limit: count}, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        let list = [];
        for (let i = 0; i < doc.length; i++) {
            list.push({
                e_id: doc[i].e_id,
                stage: doc[i].stage,
                grade: doc[i].grade,
                subject: doc[i].subject,
                type: doc[i].type,
                createAt: doc[i].createAt,
                updateAt: doc[i].updateAt
            });
        }
        callback(null, list);
    });
};

/**
 * 获取上次对本题的练习是否结束
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {userID: '', q_id: '', sec_id: ''}
 * @param {Function} callback 回调函数
 */
exports.checkPending = function (param, callback) {
    Exercise.findOne({
        userID: param.userID,
        q_id: param.q_id,
        sec_id: param.sec_id,
        status: 'pending'
    }, {}, {sort: '-createAt'}, (err, e)=> {
        if (err) {
            return callback(err);
        }
        let resp = {hasPending: false, e_id: '', time: 0};
        if (e && e.status == 'pending') {
            resp.hasPending = true;
            resp.e_id = e.e_id;
            resp.time = e.updateAt;
        }
        callback(null, resp);
    });
};


/**
 * 创建一个新的练习记录
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {userID: '', type: '', sec_id: '', q_id: ''}
 * @param {Function} callback 回调函数
 */
exports.genExercise = function (param, callback) {
    let exercise = new Exercise({
        userID: param.userID,
        sec_id: param.sec_id,
        q_id: param.q_id
    });
    if (param.type) {   //默认不传是study，诱导式学习
        exercise.type = param.type;
    }
    model.StudyQuestion.findById(param.q_id, (err, question)=> {
        if (err) {
            return callback(err);
        }
        if (!question) {
            return callback(new Error('q_id问题不存在！'));
        }
        if (question.type != 'root') {
            return callback(new Error('q_id对应问题类型不正确！'));
        }
        exercise.step.push({q_id: question.q_id, type: question.type});
        exercise.save(callback);
    });
};

/**
 * 标识练习不再继续
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {userID: '', e_id: ''}
 * @param {Function} callback 回调函数
 */
exports.cancel = function (param, callback) {
    (!!param.e_id ? Exercise.findById(param.e_id) : Exercise.findOne({userID: param.userID}).sort({updateAt: -1})).exec((err, e)=> {
        if (err) {  //判断，如果传e_id了，那么就取消该e_id，否则查询用户最后一条记录
            return callback(err);
        }
        if (!e) {
            return callback(new Error('e_id对应内容不存在！'));
        }
        if (e.status == 'pending') {//如果状态是pending，那么设置为canceled
            e.status = 'canceled';
        }
        e.save(callback);
    });
};

/**
 * 答题
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {userID: '', e_id: '', q_id: '', choice_id: ''}
 * @param {Function} callback 回调函数
 */
exports.check = function (param, callback) {
    let ep = new eventproxy();
    ep.all('e', 'q', (e, q)=> {
        if (!e) {
            return callback('e_id不存在！');
        }
        if (!q) {
            return callback('q_id不存在！');
        }
        if (e.userID != param.userID) {
            return callback('不是自己的练习！');
        }
        if (q.type == 'root') {
            return callback(new Error('q_id类型不正确！'));
        }
        if (!q.choice.id(param.choice_id)) {
            return callback(new Error('choice_id不存在！'));
        }
        e.step.push({q_id: param.q_id, choice_id: param.choice_id, type: q.type});
        e.save(callback);
    });
    ep.fail(callback);
    Exercise.findById(param.e_id, ep.done('e'));
    model.StudyQuestion.findById(param.q_id, ep.done('q'));
};

/**
 * 根据id获取练习结果
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} id 练习id
 * @param {Function} callback 回调函数
 */
exports.getResult = function (id, callback) {
    Exercise.findById(id, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(new Error('e_id对应内容不存在！'));
        }
        if (doc.status != 'finished') {
            doc.save((err2, doc2)=> {
                if (err2) {
                    return callback(err2);
                }
                callback(null, {e_id: doc2.e_id, point: doc2.point, percent: 20});
            });
        }
    });
};

/**
 * 根据id获取练习回顾（题干的remark和所有错题的remark）
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} id 练习id
 * @param {Function} callback 回调函数
 */
exports.getReview = function (id, callback) {
    Exercise.findById(id, (err, e)=> {
        if (err) {
            return callback(err);
        }
        if (!e) {
            return callback(new Error('e_id对应内容不存在！'));
        }
        let root_id = null;
        let choice_ids = [];
        e.step.forEach(item=> {
            if (item.type == 'root') {
                root_id = item.q_id;
            } else {
                choice_ids.push(item.choice_id);
            }
        });
        let review = {root: '', list: []};
        let ep = eventproxy.create('root', 'qlist', (root, qlist)=> {
            if (root && root.remark) {
                review.root = root.remark;
            }
            qlist.forEach(item=> {
                if (item && item.remark) {
                    review.list.push(item.remark);
                }
            });
            callback(null, review);
        });
        ep.fail(callback);
        model.StudyQuestion.findById(root_id, ep.done('root'));
        model.StudyQuestion.find({'choice._id': {$in: choice_ids}, 'choice.correct': false}, ep.done('qlist'));
    });
};


/**
 * 根据id获取练习详情
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} id 练习id
 * @param {Function} callback 回调函数
 */
exports.getDetail = function (id, callback) {
    Exercise.findById(id, (err, e)=> {
        if (err) {
            return callback(err);
        }
        if (!e) {
            return callback(new Error('e_id对应内容不存在！'));
        }
        let exercise = e.toObject({getters: true});
        let q_ids = [];
        let respSteps = [];
        for (let i = 0; i < exercise.step.length; i++) {
            //对于一道题连续选多次的情况，那么只取最后一次选择的结果
            if (i > 1 && exercise.step[i].q_id.toString() == exercise.step[i - 1].q_id.toString()) {
                respSteps.pop();
            } else {
                q_ids.push(exercise.step[i].q_id);
            }
            respSteps.push({
                step_id: exercise.step[i].step_id,
                q_id: exercise.step[i].q_id,
                type: '',
                choice_id: exercise.step[i].choice_id,
                t: exercise.step[i].t
            });
        }
        model.StudyQuestion.find({_id: {$in: q_ids}}, (err2, doc2)=> {
            if (err2) {
                return callback(err2);
            }
            for (let i = 0; i < respSteps.length; i++) {
                for (let j = 0; j < doc2.length; j++) {
                    if (respSteps[i].q_id == doc2[j].q_id.toString()) {
                        respSteps[i].question = doc2[j].toObject({getters: true});
                    }
                }
            }
            exercise.step = respSteps;
            let ep = new eventproxy();
            ep.all('result', (result)=> {
                callback(null, result);
            });
            ep.fail(callback);
            //判断最后一个step的情况，如果最后一题选的是跳转下一题，那么同时获取下一题内容返回，否则直接返回
            let lastStep = exercise.step[exercise.step.length - 1];
            if (lastStep.question.type != 'root') {
                for (let i = 0; i < lastStep.question.choice.length; i++) {
                    if (lastStep.question.choice[i].choice_id == lastStep.choice_id) {
                        if (lastStep.question.choice[i].action == 'next') {
                            //先获取下一题，然后返回
                            model.StudyQuestion.findById(lastStep.question.choice[i].next, ep.done('result', (question)=> {
                                if (question) {
                                    exercise.step.push({
                                        step_id: '',
                                        q_id: question.q_id,
                                        question: question.toObject({getters: true}),
                                        type: question.type,
                                        choice_id: '',
                                        t: 0
                                    });
                                }
                                return exercise;
                            }))
                        } else {
                            //直接返回
                            ep.emit('result', exercise);
                        }
                    }
                }
            } else {
                callback(null, exercise);
            }
        });
    });
};


