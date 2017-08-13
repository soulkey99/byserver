/**
 * Created by MengLei on 2016-04-26.
 */
"use strict";
const model = require('../../model');
const eventproxy = require('eventproxy');
const lodash = require('lodash');
const Chapter = model.StudyChapter;
const Section = model.StudySection;

/**
 * 添加、编辑、删除章
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 章内容，{cha_id: '', action: '', ver_id: '', title: '', remark: '', sections: '', seq: ''}
 * @param {Function} callback 回调函数
 */
exports.editChapter = function (param, callback) {
    getChapterOrNew(param.cha_id, (err, chapter)=> {
        if (err) {
            return callback(err);
        }
        if (param.action == 'remove') {
            return Chapter.findByIdAndRemove(chapter._id, callback);
        }
        if (param.ver_id != undefined) {
            chapter.ver_id = param.ver_id;
        }
        if (param.title != undefined) {
            chapter.title = param.title;
        }
        if (param.remark != undefined) {
            chapter.remark = param.remark;
        }
        if (param.sections != undefined) {
            if (param.sections == "") {
                chapter.sections = [];
            } else {
                chapter.sections = param.sections.split(',');
            }
        }
        if (param.seq != undefined) {
            chapter.seq = param.seq;
        }
        if (!chapter.ver_id) {
            return callback(new Error('ver_id不能为空！'));
        }
        chapter.save(callback);
    });
    function getChapterOrNew(cha_id, callback) {
        if (!cha_id) {
            return callback(null, new Chapter());
        }
        Chapter.findById(cha_id, (err, doc)=> {
            if (err) {
                return callback(err);
            }
            if (!doc) {
                return callback(new Error('cha_id对应的内容不存在！'));
            }
            callback(null, doc);
        });
    }
};


/**
 * 添加、编辑、删除节
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 问题内容，{cha_id: '', sec_id: '', action: '', title: '', remark: '', seq: '', q_id: ''}
 * @param {Function} callback 回调函数
 */
exports.editSection = function (param, callback) {
    if (!param.sec_id) {    //没传sec_id，那么就是新增小节的操作，需要将相应的小节挂载到对应的章下方
        if (!param.cha_id) {
            return callback(new Error('请输入cha_id！'));
        }
        Chapter.findById(param.cha_id, (err, chapter)=> {
            if (err) {
                return callback(err);
            }
            if (!chapter) {
                return callback(new Error('cha_id对应的内容不存在！'));
            }
            let section = new Section({title: param.title, remark: param.remark, seq: param.seq});
            if (param.q_id != undefined) {
                let q_ids = [];
                if (param.q_id) {
                    q_ids = param.q_id.split(',');
                }
                section.questions = q_ids;
            }
            section.save((err, doc)=> {
                if (err) {
                    return callback(err);
                }
                chapter.sections.push(doc._id);
                chapter.save((err)=> {
                    if (err) {
                        return callback(err);
                    }
                    callback(null, doc);
                });
            });
        });
    } else {//如果传了sec_id，就当作是编辑
        Section.findById(param.sec_id, (err, section)=> {
            if (err) {
                return callback(err);
            }
            if (!section) {
                return callback(new Error('sec_id对应内容不存在！'));
            }
            if (param.action == 'remove') {
                Chapter.find({sections: section._id}, (err, doc)=> {
                    if (err) {
                        return callback(err);
                    }
                    for (let i = 0; i < doc.length; i++) {
                        for (let j = 0; j < doc[i].sections.length; j++) {
                            if (doc[i].sections[j].toString() == param.sec_id) {
                                doc[i].sections.splice(j, 1);
                                break;
                            }
                        }
                        doc[i].save();
                    }
                    Section.findByIdAndRemove(section._id, callback);
                });
                return;
            }
            if (param.title != undefined) {
                section.title = param.title;
            }
            if (param.remark != undefined) {
                section.remark = param.remark;
            }
            if (param.seq != undefined) {
                section.seq = param.seq;
            }
            if (param.q_id != undefined) {
                let q_ids = [];
                if (param.q_id) {
                    q_ids = param.q_id.split(',');
                }
                section.questions = q_ids;
            }
            section.save(callback);
        });
    }
};

/**
 * 编辑节下面的所属问题
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 章内容，{sec_id: '', action: 'add/remove', q_id: ''}
 * @param {Function} callback 回调函数
 */
exports.editSectionQuestion = function (param, callback) {
    if (!param.q_id) {
        return callback(new Error('q_id不能为空！'));
    }
    if (!param.sec_id) {
        return callback(new Error('sec_id不能为空！'));
    }
    Section.findById(param.sec_id, (err, section)=> {
        if (err) {
            return callback(err);
        }
        if (!section) {
            return callback(new Error('sec_id对应的内容不存在！'));
        }
        if (section.type != 'section') {
            return callback(new Error('sec_id对应的类型错误！'));
        }
        if (param.action == 'remove') {
            // Section.findByIdAndUpdate(section._id, {$update: {$pull: {'questions': param.q_id}}}, {new: true}, callback);
            for (let i = 0; i < section.questions.length; i++) {
                if (section.questions[i].toString() == param.q_id) {
                    section.questions.splice(i, 1);
                    break;
                }
            }
            section.save(callback);
        } else {
            // Section.findByIdAndUpdate(section._id, {$update: {$push: {'questions': {$each: param.q_id.split(',')}}}}, {new: true}, callback);
            let q_ids = param.q_id.split(',');
            let sqStr = section.questions.toString();
            for (let i = 0; i < q_ids.length; i++) {
                if (sqStr.indexOf(q_ids[i]) < 0) {
                    section.questions.push(q_ids[i]);
                }
            }
            section.save(callback);
        }
    });
};

/**
 * 获取节下面的所属问题
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 章内容，{userID: '', sec_id: '', limit: '', userType: ''}
 * @param {Function} callback 回调函数
 */
exports.getSectionQuestion = function (param, callback) {
    let limit = Number.parseInt(param.limit || '1');
    if (param.userType == 'student') {
        limit = 0;
    }
    Section.findById(param.sec_id, (err, section)=> {
        if (err) {
            return callback(err);
        }
        if (!section) {
            return callback(new Error('sec_id对应内容不存在！'));
        }
        if (section.type != 'section') {
            return callback(new Error('sec_id对应内容类型不正确！'));
        }
        let q_ids = [];
        if (limit == 0) {
            q_ids = section.questions.toObject();
        } else {
            q_ids = lodash.sampleSize(section.questions, limit);
        }
        model.StudyQuestion.find({_id: {$in: q_ids}}, (err2, doc2)=> {
            if (err2) {
                return callback(err2);
            }
            let tmpList = [];
            q_ids.forEach(q_id=> {
                for (let i = 0; i < doc2.length; i++) {
                    if (q_id.toString() == doc2[i]._id.toString()) {
                        tmpList.push(doc2[i]);
                    }
                }
            });
            doc2 = tmpList;
            let list = [];
            if (param.userType == 'student') {
                //如果是学生端获取，那么需要检测列表中的题目是否曾经做过
                let ep = new eventproxy();
                ep.after('items', doc2.length, (items)=> {
                    for (let i = 0; i < list.length; i++) {
                        for (let j = 0; j < items.length; j++) {
                            if (items[j] != null && (items[j].q_id == list[i].q_id)) {
                                list[i].hasPending = items[j].pending;
                                list[i].hasFinished = items[j].finished;
                            } else {
                                list[i].hasPending = false;
                                list[i].hasFinished = false;
                            }
                        }
                    }
                    callback(null, list);
                });
                ep.fail(callback);
                for (let i = 0; i < doc2.length; i++) {
                    list.push(doc2[i].toObject({getters: true}));
                    model.StudyExercise.find({
                        userID: param.userID,
                        sec_id: param.sec_id,
                        q_id: doc2[i].q_id
                    }, ep.done('items', (doc)=> {
                        if (doc.length == 0) {
                            return null;
                        }
                        let resp = {q_id: doc[0].q_id, pending: false, finished: false};
                        for (let i = 0; i < doc.length; i++) {
                            if (doc[i].status == 'pending') {
                                resp.pending = true;
                            } else if (doc[i].status == 'finished') {
                                resp.finished = true;
                            }
                        }
                        return resp;
                    }));
                }
            } else {
                for (let i = 0; i < doc2.length; i++) {
                    list.push(doc2[i].toObject({getters: true}));
                }
                callback(null, list);
            }
        });
    });
};

/**
 * 获取列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 问题内容，{ver_id: ''}
 * @param {Function} callback 回调函数
 */
exports.getList = function (param, callback) {
    if (!param.ver_id) {
        return callback(new Error('请输入ver_id！'));
    }
    Chapter.find({ver_id: param.ver_id}, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        let ep = new eventproxy();
        ep.after('items', doc.length, (list)=> {
            list.sort((a, b)=>a.seq - b.seq);
            callback(null, list);
        });
        ep.fail(callback);
        for (let i = 0; i < doc.length; i++) {
            arrangeSection(doc[i], ep.done('items'));
        }
    });
    function arrangeSection(chapter, callback) {
        let item = {
            cha_id: chapter.cha_id,
            title: chapter.title,
            remark: chapter.remark,
            seq: chapter.seq,
            sections: []
        };
        Section.find({_id: {$in: chapter.sections}, type: 'section'}, (err, doc)=> {
            if (err) {
                return callback(err);
            }
            for (let i = 0; i < doc.length; i++) {
                item.sections.push({
                    sec_id: doc[i].sec_id,
                    title: doc[i].title,
                    remark: doc[i].remark,
                    seq: doc[i].seq
                });
            }
            item.sections.sort((a, b)=>a.seq - b.seq);
            callback(null, item);
        });
    }
};







