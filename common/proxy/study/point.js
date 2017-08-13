/**
 * Created by MengLei on 2016-04-11.
 */
"use strict";
const model = require('../../model');
const lodash = require('lodash');
const eventproxy = require('eventproxy');
const Point = model.StudyPoint;

/**
 * 根据id获取知识点记录
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} id 知识点id
 * @param {Function} callback 回调函数
 */
exports.getPointByID = function (id, callback) {
    Point.findById(id, callback);
};

/**
 * 为知识点的添加相关知识点、前置知识点、后置知识点的id
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {p_id: '', type: '要修改的字段pre/related/next', extra_id: '附加的id列表，多个逗号分隔'}
 * @param {Function} callback 回调函数
 */
exports.editExtra = function (param, callback) {
    if (param.extra_id == undefined) {
        return callback(new Error('extra_id不能为空！'));
    }
    if (!param.type) {
        return callback(new Error('type字段不能为空！'));
    }
    let list = [];
    if (param.extra_id) {
        list = param.extra_id.split(',');
    }
    let setObj = {};
    setObj[param.type] = list;
    Point.findByIdAndUpdate(param.q_id, {$set: {point: list}}, {new: true}, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(new Error('p_id对应知识点不存在！'));
        }
        callback(null, doc);
    });
};

/**
 * 获取知识点附加信息列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {p_id: '', type: '', limit: ''}
 * @param {Function} callback 回调函数
 */
exports.getExtra = function (param, callback) {
    if (!param.type) {
        return callback(new Error('type字段为空！'));
    }
    Point.findById(param.p_id, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(new Error('p_id不存在！'));
        }
        let limit = Number.parseInt(param.limit || '1');
        let ids = lodash.sampleSize(doc[param.type], limit);
        if (limit == 0) {
            ids = doc[param.type];
        }
        Point.find({_id: {$in: ids}}, (err2, doc2)=> {
            if (err2) {
                return callback(err2);
            }
            let list = [];
            for (let i = 0; i < doc2.length; i++) {
                list.push({
                    p_id: doc2[i].p_id,
                    stage: doc2[i].stage,
                    grade: doc2[i].grade,
                    subject: doc2[i].subject,
                    title: doc2[i].title,
                    content: doc2[i].content,
                    remark: doc2[i].remark,
                    type: doc2[i].type
                });
            }
            callback(null, list);
        });
    });
};

/**
 * 获取知识点id获取相关的问题列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {p_id: '', startPos: '', pageSize: ''}
 * @param {Function} callback 回调函数
 */
exports.getQuestionsByPoint = function (param, callback) {
    Point.findById(param.p_id, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(new Error('p_id不存在！'));
        }
        let start = Number.parseInt(param.startPos || '1') - 1;
        let count = Number.parseInt(param.pageSize || '10');
        model.StudyQuestion.find({point: doc._id}, {}, {sort: '-createAt', skip: start, limit: count}, (err2, doc2)=> {
            if (err2) {
                return callback(err2);
            }
            let list = [];
            for (let i = 0; i < doc.length; i++) {
                list.push({
                    p_id: doc[i].p_id,
                    stage: doc[i].stage,
                    grade: doc[i].grade,
                    subject: doc[i].subject,
                    title: doc[i].title,
                    content: doc[i].content,
                    remark: doc[i].remark,
                    type: doc[i].type
                });
            }
            callback(null, list);
        })
    });
};


/**
 * 获取知识点列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {startPos: '', pageSize: '', query: '', stage: '', grade: '', subject: '', type: ''}
 * @param {Function} callback 回调函数
 */
exports.getList = function (param, callback) {
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    let query = {};
    if (param.stage) {
        query['stage'] = param.stage;
    }
    if (param.grade) {
        query['grade'] = param.grade;
    }
    if (param.subject) {
        query['subject'] = param.subject;
    }
    if (param.type) {
        query['type'] = param.type;
    }
    if (param.query) {
        query['$or'] = [{content: {$regex: param.query}}, {title: {$regex: param.query}}];
    }
    Point.find(query, {}, {sort: '-createAt', skip: start, limit: count}, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        let list = [];
        for (let i = 0; i < doc.length; i++) {
            list.push({
                p_id: doc[i].p_id,
                stage: doc[i].stage,
                grade: doc[i].grade,
                subject: doc[i].subject,
                title: doc[i].title,
                content: doc[i].content,
                remark: doc[i].remark,
                type: doc[i].type
            });
        }
        callback(null, list);
    });
};

/**
 * 添加、编辑知识点
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 知识点内容，{p_id: '', type: '', stage: '', grade: '', subject: '', title: '', content: '', pre: [], next: [], related: [], remark: ''}
 * @param {Function} callback 回调函数
 */
exports.editPoint = function (param, callback) {
    getPointByIdOrNew(param.p_id, (err, point)=> {
        if (err) {
            return callback(err);
        }
        if (param.type != undefined) {
            point.type = param.type;
        }
        if (param.stage != undefined) {
            point.stage = param.stage;
        }
        if (param.grade != undefined) {
            point.grade = param.grade;
        }
        if (param.subject != undefined) {
            point.subject = param.subject;
        }
        if (param.title != undefined) {
            point.title = param.title;
        }
        if (param.content != undefined) {
            point.content = param.content;
        }
        if (param.remark != undefined) {
            point.remark = param.remark;
        }
        if (param.pre != undefined) {
            if (param.pre) {
                point.pre = param.pre.split(',');
            } else {
                point.pre = [];
            }
        }
        if (param.next != undefined) {
            if (param.next) {
                point.next = param.next.split(',');
            } else {
                point.next = [];
            }
        }
        if (param.related != undefined) {
            if (param.related) {
                point.related = param.related.split(',');
            } else {
                point.related = [];
            }
        }
        point.save(callback);
    });
    //通过知识点id获取一个知识点，如果没有，就new一个
    function getPointByIdOrNew(id, callback) {
        if (!id) {
            let p = new Point();
            console.log(JSON.stringify(p.toObject()));
            return callback(null, p);
        }
        Point.findById(id, (err, doc)=> {
            if (err) {
                return callback(err);
            }
            if (!doc) {
                return callback(null, new Point({_id: id}));
            }
            callback(null, doc);
        });
    }
};


