/**
 * Created by MengLei on 2015/8/27.
 */
"use strict";
const db = require('../../config').db;
const redis = require('../../config').redis;
const objectId = require('mongojs').ObjectId;
const log = require('../../utils/log').http;

//获取user config
module.exports = function (req, res, next) {
    let phonenum = '';
    if (req.user && req.user.phone) {
        phonenum = req.user.phone;
    } else if (req.body.phonenum) {
        phonenum = req.body.phonenum;
    }
    if (phonenum) {
        redis.get('userConf:' + phonenum, (err, doc)=> {
            if (err) {
                return next();
            }
            if (!doc) {
                db.userConf.findOne({phonenum: phonenum}, function (err, doc) {
                    if (!err) {
                        log.trace('check user conf success, phone: ' + phonenum + ', config: ' + JSON.stringify(doc));
                        req.userConf = doc;
                        redis.set('userConf:' + phonenum, JSON.stringify(doc));
                        redis.set('userConf:' + phonenum, 1800);
                    }
                    next();
                });
            }
            if (!err) {
                log.trace('check user conf success from catch, phone: ' + phonenum + ', config: ' + JSON.stringify(doc));
                req.userConf = doc;
            }
        });
    } else {
        next();
    }
};

