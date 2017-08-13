/**
 * Created by MengLei on 2015/10/9.
 */
"use strict";

var db = require('./../../../config').db;
var proxy = require('./../../../common/proxy');
var config = require('./../../../config');
var eventproxy = require('eventproxy');
var qv = require('qversion');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

//获取科目配置信息V2
module.exports = function (req, res) {
    log.trace('get available subjects.');
    // var ep = new eventproxy();
    // ep.all('default', 'channel', function (default_subject, channel_subject) {
    //     if (channel_subject) {
    //         default_subject = channel_subject;
    //     }
    //     return result(res, {
    //         statusCode: 900,
    //         grade: default_subject.config || [],
    //         subject: default_subject.subject || [],
    //         gradeStr: default_subject.gradeStr || '',
    //         subjectStr: default_subject.subjectStr || ''
    //     });
    // });
    // ep.fail(function (err) {
    //     return result(res, {statusCode: 905, message: err.message});
    // });
    //学生端1.4.6，教师端1.4.3
    var config = '';
    if (req.user && req.user.config && req.user.config.subject) {
        config = req.user.config.subject;
    }
    proxy.GradeSubject.getGSList(config, (err, doc)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (req.body.userType == 'student' && req.headers && req.headers.client) {
            if (qv.version_compare(req.headers.client, '1.4.5') > 0) {
            } else {
                doc.subject = [];
            }
        }
        result(res, Object.assign({statusCode: 900}, doc));
    });
    //分渠道获取科目列表配置情况，如果对应渠道的科目列表没有获取到，则获取默认的列表
    // db.byConfig.findOne({type: 'gradeConfig', channel: null}, ep.done('default'));
    // if (!config) {
    //     return ep.emit('channel', null);
    // }
    // db.byConfig.findOne({type: 'gradeConfig', channel: config}, ep.done('channel'));
};
