/**
 * Created by MengLei on 2016-04-21.
 */
"use strict";

const model = require('../model');
const eventproxy = require('eventproxy');
const GradeSubject = model.GradeSubject;

/**
 * 根据userID下发此人beta配置
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} id
 * @param {Function} callback 回调函数
 */
exports.getGSByID = function (id, callback) {
    GradeSubject.findById(id, callback);
};

/**
 * 根据channel以及当前时间获取科目配置
 * Callback:
 * - err, 数据库异常
 * - doc, 数量
 * @param {String} config
 * @param {Function} callback 回调函数
 */
exports.getGSList = function (config, callback) {
    let ep = new eventproxy();
    ep.all('default', 'channel', function (default_subject, channel_subject) {
        if (channel_subject) {
            default_subject = channel_subject;
        }
        let sList = [];
        for (let i = 0; i < default_subject.subject.length; i++) {
            if (default_subject.subject[i].valid_time.need) {
                //这里判断是否开启
                let t = new Date();
                let start = new Date();
                let end = new Date();
                start.setHours(default_subject.subject[i].valid_time.start.hour, default_subject.subject[i].valid_time.start.minute);
                end.setHours(default_subject.subject[i].valid_time.end.hour, default_subject.subject[i].valid_time.end.minute);
                //console.log(default_subject.subject[i].valid_time.days);
                let item = Object.assign({}, default_subject.subject[i].toObject(), {is_on: (start < t && t < end)});
                if (!item.is_on) {
                    let startHour = item.valid_time.start.hour.toString();
                    let startMin = item.valid_time.start.minute.toString();
                    let endHour = item.valid_time.end.hour.toString();
                    let endMin = item.valid_time.end.minute.toString();
                    item.hint = `开启时间：${startHour.length == 1 ? '0' + startHour : startHour}:${startMin.length == 1 ? '0' + startMin : startMin}-${endHour.length == 1 ? '0' + endHour : endHour}:${endMin.length == 1 ? '0' + endMin : endMin}！`;
                }
                delete(item.valid_time);
                sList.push(item);
            } else {
                sList.push(Object.assign({}, default_subject.subject[i].toObject(), {is_on: true}));
            }
        }
        callback(null, {
            grade: default_subject.config || [],
            subject: sList,
            gradeStr: default_subject.gradeStr || '',
            subjectStr: default_subject.subjectStr || ''
        });
    });
    ep.fail(callback);
    //分渠道获取科目列表配置情况，如果对应渠道的科目列表没有获取到，则获取默认的列表
    GradeSubject.findOne({type: 'gradeConfig', channel: null}, ep.done('default'));
    if (!config) {
        return ep.emit('channel', null);
    }
    GradeSubject.findOne({type: 'gradeConfig', channel: config}, ep.done('channel'));
};
