/**
 * Created by MengLei on 2015/7/7.
 */

var ALY = require('aliyun-sdk');
var log = require('./../utils/log').file;
var formidable = require('formidable');
var result = require('./result');
var ossConfig = require('../config').aliyunOSSConfig;

var oss = new ALY.OSS({
    accessKeyId: ossConfig.key,
    secretAccessKey: ossConfig.secret,
    endpoint: 'http://oss-cn-beijing.aliyuncs.com',  //外网使用
    //endpoint: 'http://oss-cn-beijing-internal.aliyuncs.com',  //阿里云内网使用，速度无限制
    // 这是 oss sdk 目前支持最新的 api 版本, 不需要修改
    apiVersion: '2013-10-15'
});

module.exports = function(req, res) {
    var form = new formidable.IncomingForm();
    try {
        form.parse(req, function (err, fields, files) {
            if (err) {
                log.error('parse upload file error: ' + err.message);
                result(res, {statusCode: 905, message: err.message});
            } else {
                var key = fields.filePath;
                oss.deleteObject({Bucket: 'callcall-server', Key: key}, function (err, data) {
                    if (err) {
                        log.error('delete file error: ' + err.message);
                        result(res, {statusCode: 905, message: err.message});
                    }else{
                        log.trace('delete file success, key=' + key + ', data: ' + JSON.stringify(data));
                        result(res, {statusCode: 900});
                    }
                });
            }
        });
    } catch (ex) {
        log.error('parse upload file excption: ' + ex.message);
        result(res, {statusCode: 905, message: 'upload file error: ' + ex.message});
    }
};

