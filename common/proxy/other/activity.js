/**
 * Created by MengLei on 2016-05-04.
 */
"use strict";
const model = require('../../model');
const Activity = model.Activity;

/**
 * 根据id获取广告详情内容
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} id 活动id
 * @param {Function} callback 回调函数
 */
exports.getActivityByID = function (id, callback) {
    Activity.findById(id, callback);
};

/**
 * 添加、编辑活动
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {activity_id: '', action: '', start: '', end: '', type: '', valid: '', delete: '', img: '', img_grey: '',. desc: ''}
 * @param {Function} callback 回调函数
 */
exports.editActivity = function (param, callback) {
    getOneActivityOrNew(param.activity_id, (err, activity)=> {
        if (err) {
            return callback(err);
        }
        if (param.start != undefined) {
            activity.start = Number.parseInt(param.start);
        }
        if (param.end != undefined) {
            activity.end = Number.parseInt(param.end);
        }
        if (param.type != undefined) {
            activity.type = param.type;
        }
        if (param.valid != undefined) {
            activity.valid = param.valid == 'true';
        }
        if (param.delete != undefined) {
            activity.delete = param.delete == 'true';
        }
        if (param.img != undefined) {
            activity.img = param.img;
        }
        if (param.img_grey != undefined) {
            activity.img_grey = param.img_grey;
        }
        if (param.dest != undefined) {
            activity.dest = param.dest;
        }
        if (param.title != undefined) {
            activity.title = param.title;
        }
        if (param.desc != undefined) {
            activity.desc = param.desc;
        }
        if (param.remark != undefined) {
            activity.remark = param.remark;
        }
        if (param.top != undefined) {
            activity.top = param.top == 'true';
        }
        activity.save(callback);
    });
    function getOneActivityOrNew(id, callback) {
        if (!id) {
            return callback(null, new Activity());
        }
        Activity.findById(id, (err, activity)=> {
            if (err) {
                return callback(err);
            }
            if (!activity) {
                return callback(new Error('activity_id对应的内容不存在！'));
            }
            callback(null, activity);
        });
    }
};

/**
 * 用户获取活动列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {startPos: '', pageSize: ''}
 * @param {Function} callback 回调函数
 */
exports.getList = function (param, callback) {
    let query = {valid: true, delete: false};
    let opt = {sort: '-top -start -end'};
    let start = Number.parseInt(param.startPos || '1') - 1;
    let count = Number.parseInt(param.pageSize || '10');
    if (count === 0) {
    } else {
        opt['skip'] = start;
        opt['limit'] = count;
    }
    query['$or'] = [{start: {$lt: Date.now()}, end: {$gt: Date.now()}}, {end: {$lt: Date.now()}}];
    Activity.find(query, {}, opt, (err, doc)=> {
        if (err) {
            return callback(err);
        }
        let list = [];
        for (let i = 0; i < doc.length; i++) {
            list.push(activity2Obj(doc[i]));
        }
        callback(null, list);
    });
    function activity2Obj(item) {
        return {
            activity_id: item.activity_id,
            start: item.start,
            end: item.end,
            type: item.type,
            status: item.status,
            dest: item.dest,
            img: item.status == 'pending' ? item.img : item.img_grey,
            title: item.title,
            desc: item.desc,
            remark: item.remark,
            top: item.top
        }
    }
};

/**
 * 管理员获取活动列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param = {activity_id: '', action: '', start: '', end: '', type: '', valid: '', delete: '', img: '', img_grey: '',. desc: ''}
 * @param {Function} callback 回调函数
 */
exports.adminGetList = function (param, callback) {
    let query = {};
};





