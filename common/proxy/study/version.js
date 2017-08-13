/**
 * Created by MengLei on 2016-04-27.
 */
"use strict";
const model = require('../../model');
const eventproxy = require('eventproxy');
const Version = model.StudyVersion;

/**
 * 添加、编辑、删除版本
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 版本的内容，{ver_id: '', action: '', stage: '', grade: '', subject: '', city: '', version: '', cover: '', remark: ''}
 * @param {Function} callback 回调函数
 */
exports.editVersion = function (param, callback) {
    getVersionByIdOrNew(param.ver_id, (err, version)=> {
        if (err) {
            return callback(err);
        }
        if (param.action == 'remove') {
            return Version.findByIdAndRemove(version._id, callback);
        }
        if (param.stage != undefined) {
            version.stage = param.stage;
        }
        if (param.grade != undefined) {
            version.grade = param.grade;
        }
        if (param.subject != undefined) {
            version.subject = param.subject;
        }
        if (param.city != undefined) {
            version.city = param.city.split(',');
        }
        if (param.title != undefined) {
            version.title = param.title;
        }
        if (param.intro != undefined) {
            version.intro = param.intro;
        }
        if (param.type != undefined) {
            version.type = param.type;
        }
        if (param.version != undefined) {
            version.version = param.version;
        }
        if (param.cover != undefined) {
            version.cover = param.cover;
        }
        if (param.remark != undefined) {
            version.remark = param.remark;
        }
        version.save(callback);
    });
    function getVersionByIdOrNew(id, callback) {
        if (!id) {
            return callback(null, new Version());
        }
        Version.findById(id, (err, version)=> {
            if (err) {
                return callback(err);
            }
            if (!version) {
                return callback(new Error('ver_id对应内容不存在！'));
            }
            // if (version.type != 'version') {
            //     return callback(new Error('ver_id对应的内容类型不正确！'));
            // }
            callback(null, version);
        });
    }
};

/**
 * 获取版本列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 版本的内容，{stage: '', grade: '', subject: '', city: '', startPos: '', pageSize: '', userType: '', action: 'getMore'}
 * 若userType='student',那么是学生端获取，如果传城市，那么第一次默认返回对应城市的数据，然后getMore的时候返回除该城市外的其他数据，如果没传城市，那么一次将所有数据返回
 * @param {Function} callback 回调函数
 */
exports.getList = function (param, callback) {
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    let query = {};
    let opt = {sort: '-createAt'};
    if (param.stage != undefined) {
        query['stage'] = param.stage;
    }
    if (param.grade != undefined) {
        query['grade'] = param.grade;
    }
    if (param.subject != undefined) {
        query['subject'] = param.subject;
    }
    if (param.type != undefined) {
        query['type'] = param.type;
    }
    if (param.city != undefined) {
        if (param.userType == 'student') {
            if (param.action == 'getMore') {
                query['city'] = {$ne: param.city};
            } else {
                query['city'] = param.city;
            }
        } else {
            query['city'] = param.city;
            opt['skip'] = start;
            opt['limit'] = count;
        }
    } else {
        opt['skip'] = start;
        opt['limit'] = count;
    }
    Version.find(query, {}, opt, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        let list = [];
        for (let i = 0; i < doc.length; i++) {
            list.push({
                ver_id: doc[i].ver_id,
                stage: doc[i].stage,
                grade: doc[i].grade,
                subject: doc[i].subject,
                version: doc[i].version,
                city: doc[i].city,
                title: doc[i].title,
                intro: doc[i].intro,
                type: doc[i].type,
                cover: doc[i].cover,
                remark: doc[i].remark
            });
        }
        callback(null, list);
    });
};

/**
 * 学生端获取教材版本列表
 * 学生端如果传城市，那么第一次默认返回对应城市的数据，然后getMore的时候返回除该城市外的其他数据，如果没传城市，那么一次将所有数据返回
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 版本的内容，{stage: '', grade: '', subject: '', city: '', action: 'getMore'}
 * @param {Function} callback 回调函数
 */
exports.getVersionList = function (param, callback) {
    let query = {};
    if (param.stage != undefined) {
        query['stage'] = param.stage;
    }
    if (param.grade != undefined) {
        query['grade'] = param.grade;
    }
    if (param.subject != undefined) {
        query['subject'] = param.subject;
    }
    if (param.city != undefined) {
        if (param.action == 'getMore') {
            query['city'] = {$ne: param.city};
        } else {
            query['city'] = param.city;
        }
    }
};
