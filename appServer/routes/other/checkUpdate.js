/**
 * Created by MengLei on 2015/3/31.
 */

var db = require('../../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('../../../utils/log').http;

module.exports = function(req, res) {
    //
    db.update.findOne({platform: req.body.platform}, function (err, doc) {
        if (err) {
            log.error('check update error: ' + err.message);
            result(res, {statusCode: 905, message: err.message});
        } else {
            if (doc) {
                try {
                    var version = parseInt(req.body.version);

                    //doc: {_id: product id, platform: 平台, currentVersion: 当前版本号, enforceVersion: 强制升级版本号, guideVersion: 引导升级版本号, promptVersion: 提示升级版本号}
                    //通常情况下，都是                 最新客户端版本号   >   提示升级版本号   >   引导升级版本号   >   强制升级版本号
                    //当前客户端版本号范围情况          不升级||    <-提示升级->    ||    <-引导升级->    ||   <-强制升级->
                    //一般情况下以发布日期作为版本号，取8位int
                    if (version <= doc.guideVersion) {
                        //强制升级
                        log.trace('check update success. enforce update.');
                        result(res, {
                            statusCode: 900,
                            needUpdate: true,
                            updateVersion: doc.currentVersion,
                            updateType: 'enforce',
                            downloadUrl: doc.downloadUrl,
                            updateDesc: doc.updateDesc
                        });
                    } else if (version <= doc.promptVersion) {
                        //引导升级
                        log.trace('check update success. guide update.');
                        result(res, {
                            statusCode: 900,
                            needUpdate: true,
                            updateVersion: doc.currentVersion,
                            updateType: 'guide',
                            downloadUrl: doc.downloadUrl,
                            updateDesc: doc.updateDesc
                        });
                    } else if (version <= doc.currentVersion) {
                        //提示升级
                        log.trace('check update success. prompt update.');
                        result(res, {
                            statusCode: 900,
                            needUpdate: true,
                            updateVersion: doc.currentVersion,
                            updateType: 'prompt',
                            downloadUrl: doc.downloadUrl,
                            updateDesc: doc.updateDesc
                        });
                    } else {
                        //不需要升级
                        log.trace('check update success. no update.');
                        result(res, {statusCode: 900, needUpdate: false});
                    }
                } catch (ex) {
                    log.error('invalid version number.');
                    result(res, {statusCode: 905, message: 'invalid version number.'});
                }
            } else {
                log.error('invalid platform.');
                result(res, {statusCode: 905, message: 'invalid platform.'});
            }
        }
    })
};