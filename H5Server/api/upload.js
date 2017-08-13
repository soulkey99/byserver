/**
 * Created by MengLei on 2015/9/9.
 */

var formidable = require('formidable');
var rack = require('../../config').rack;
var path = require('path');
var ALY = require('aliyun-sdk');
var ossConfig = require('../../config').aliyunOSSConfig;
var fs = require('fs-extra');
var log = require('../../utils/log').file;
var result = require('../utils/result');
var request = require('request');


module.exports = function(req, res) {

    var form = new formidable.IncomingForm();
    var tmpPath = '';

    try {
        form.parse(req, function (err, fields, files) {
            if (err) {
                log.error('parse upload file error: ' + err.message);
                result(res, {statusCode: 905, message: err.message});
            } else {
                var name = files.upload.name;
                tmpPath = files.upload.path;
                var formData = {
                    path: fields.path || '',
                    upload: {
                        value: fs.createReadStream(tmpPath),
                        options: {
                            filename: name,
                            contentType: files.upload.type
                        }
                    }
                };

                request.post({url: 'http://123.57.16.157:8062/upload', formData: formData}, function(err, httpRes, body){
                    if(err){
                        //
                        result(res, {statusCode: 905, message: err.message});
                    }else{
                        result(res, JSON.parse(body));
                    }
                });
            }
        });
    } catch (ex) {
        log.error('parse upload file excption: ' + ex.message);
        result(res, {statusCode: 905, message: 'upload file error: ' + ex.message});
    }
};

