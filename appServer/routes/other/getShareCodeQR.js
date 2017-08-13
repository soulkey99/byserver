/**
 * Created by MengLei on 2015/5/23.
 */

var fs = require('fs-extra');
var qr = require('qr-encode');
var path = require('path');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var rootPath = require('../../../config').rootPath;

module.exports = function(req, res) {
    //生成邀请链接对应的二维码
    var link = req.body.link;
    if (!link) {
        log.error('link parameter empty.');
        result(res, {statusCode: 905, message: 'link parameter empty.'});
        return;
    }
    try {
        link = new Buffer(link, 'base64').toString('utf8');
    } catch (ex) {
        log.error('decode base64 error: ' + ex.message);
        result(res, {statusCode: 905, message: ex.message});
        return;
    }
    var userID = req.body.userID;
    var dataURI = qr(link, {type: 9, size: 6, level: 'L'});
    var imageType = '';
    if (dataURI.indexOf('image/') > 0) {
        imageType = dataURI.substring(dataURI.indexOf('image/') + 6, dataURI.indexOf(';base64'));
    } else {
        imageType = 'gif';
    }
    imageType = imageType.toLowerCase();
    var coverStr = dataURI.substr(dataURI.indexOf('base64,') + 7);
    var bitmap = new Buffer(coverStr, 'base64');

    var prefix = path.join(rootPath, 'public');
    var relativePath = path.join('qr-files', userID + '.' + imageType);

    fs.ensureDirSync(path.dirname(path.join(prefix, relativePath)));
    fs.writeFile(path.join(prefix, relativePath), bitmap, function (err) {
        if (err) {
            //hanlde error
            log.error('write file error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            log.trace('get share code qr success.');
            result(res, {statusCode: 900, url: relativePath});
        }
    });
};