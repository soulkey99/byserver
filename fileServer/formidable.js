/**
 * Created by MengLei on 2015/10/13.
 */

var formidable = require('formidable');
var result = require('./result');
var log = require('./../utils/log').file;

//formidable预处理
module.exports = function(req, res, next) {
    var form = new formidable.IncomingForm();
    try {
        form.parse(req, function (err, fields, files) {
            if (err) {
                log.error('parse upload file error: ' + err.message);
                result(res, {statusCode: 905, message: err.message});
            } else {
                if (!files.upload) {
                    result(res, {statusCode: 905, message: 'upload error.'});
                    return;
                }
                req.fields = fields;
                req.files = files;
                next();
            }
        });
    } catch (ex) {
        log.error('parse upload file excption: ' + ex.message);
        result(res, {statusCode: 905, message: 'upload file error: ' + ex.message});
    }
};
