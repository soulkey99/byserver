/**
 * Created by MengLei on 2015/3/8.
 */

var rack = require('../config').rack;
var path = require('path');
var ALY = require('aliyun-sdk');
var ossConfig = require('../config').aliyunOSSConfig;
var fs = require('fs-extra');
var log = require('./../utils/log').file;
var db = require('./../config').db;
var result = require('./result');

var oss = new ALY.OSS({
    accessKeyId: ossConfig.key,
    secretAccessKey: ossConfig.secret,
    //endpoint: 'http://oss-cn-beijing.aliyuncs.com',  //外网使用
    endpoint: 'http://oss-cn-beijing-internal.aliyuncs.com',  //阿里云内网使用，速度无限制
    // 这是 oss sdk 目前支持最新的 api 版本, 不需要修改
    apiVersion: '2013-10-15'
});

module.exports = function(req, res) {

    //生成八位日期字符串
    var curDate = new Date();
    var year = curDate.getFullYear().toString();
    var month = (curDate.getMonth() + 1).toString();
    month = month.length < 2 ? '0' + month : month;
    var date = curDate.getDate().toString();
    date = date.length < 2 ? '0' + date : date;
    var dateStr = year + month + date;

    //var form = new formidable.IncomingForm();
    var tmpPath = '';

    var name = req.files.upload.name;
    tmpPath = req.files.upload.path;
    var filePath = path.join('upload', dateStr, rack() + path.extname(name).toLowerCase()).replace(/\\/g, '/');

    if(req.fields.path){    //如果前端传递了路径，那么按照给定的路径进行命名
        filePath = req.fields.path;
    }
    //上传文件
    upOSS(tmpPath, filePath, function(err){
        if(err){
            result(res, {statusCode: 905, message: err.message});
        }else{
            result(res, {statusCode: 900, filePath: ossConfig.prefix + filePath})
        }
    });
    //记录文件上传历史
    if(req.fields.userID) {
        db.fileLog.insert({userID: req.fields.userID, filePath: filePath, t: Date.now()});
    }

    if (req.fields.thumbnail == 'true') {
        //如果需要缩略图，那么前面应该已经生成了临时文件，这里只需要上传oss即可
        upOSS(tmpPath + '_thumb', filePath + '_thumb.jpg', function(err){
            if(err){
                log.error('upload thumbnail error: ' + err.message);
            }else{
                log.trace('upload thumbnail success: ' + filePath + '_thumb.jpg');
            }
        });
    }
};

//上传oss
function upOSS(tmpPath, destPath, callback){
    if(callback != undefined){
        //
    }else{
        callback = function(){};
    }
    fs.readFile(tmpPath, function (err, data) {

        fs.remove(tmpPath);  //读取出来文件内容之后，立刻删除临时文件，节约服务器存储空间

        if (err) {
            log.error('read uploaded file error:', err.message);
            callback(err);
            return;
        }
        var contentDisposition = '';
        if((destPath.lastIndexOf('jpg') > 0) || (destPath.lastIndexOf('png') > 0) || (destPath.lastIndexOf('gif') > 0)) {
            contentDisposition = 'inline; filename="' + path.basename(destPath) + '"';
        }
        oss.putObject({
            Bucket: ossConfig.bucket,
            Key: destPath,                 // 注意, Key 的值不能以 / 开头, 否则会返回错误.
            Body: data,
            ContentType: contentType(destPath),
            AccessControlAllowOrigin: '',
            ContentDisposition: contentDisposition,            // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec19.html#sec19.5.1
            CacheControl: 'no-cache'          // 参考: http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.9
        }, function (err, data) {
            if (err) {
                log.error('oss upload file error:' + err.message);
                callback(err);
                return;
            }
            log.trace('upload to oss success: ' + JSON.stringify(data));
            log.trace('file path: ' + ossConfig.prefix + destPath);
            callback();
        });
    });
}

function contentType(filePath){
    var contentType = 'application/octet-stream';
    switch (path.extname(filePath)){
        case '.jpeg':
        case '.jpg':
        case '.jpe':
        case '.jfif':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.tif':
        case '.tiff':
            contentType = 'image/tiff';
            break;
        case '.fax':
            contentType = 'image/fax';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
        case '.net':
            contentType = 'image/pnetvue';
            break;
        case '.bmp':
            contentType = 'application/x-bmp';
            break;
        case '.amr':
            contentType = 'audio/amr';
            break;
        case '.ogg':
            contentType = 'audio/ogg';
            break;
        case '.wma':
            contentType = 'audio/x-ms-wma';
            break;
        case '.wav':
            contentType = 'audio/x-wav';
            break;
        case '.mp3':
            contentType = 'audio/mp3';
            break;
        case '.ra':
            contentType = 'audio/vnd.rn-realaudio';
            break;
        default :
            break;
    }
    return contentType;
}