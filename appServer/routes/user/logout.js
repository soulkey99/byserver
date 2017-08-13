/**
 * Created by zhengyi on 15/2/25.
 */
"use strict";
const config = require('../../../config');
const proxy = require('../../../common/proxy');
const objectId = require('mongojs').ObjectId;
const result = require('../../utils/result');
const log = require('../../../utils/log').http;

module.exports = function (req, res) {
    //删除session cache
    config.redis.del('session:' + req.body.userID);
    config.db.users.update({_id: new objectId(req.body.userID)}, {
        $set: {
            "authSign": null,
            "status": "offline"
        }
    }, function (err) {
        if (err) {
            //handle error
            log.error('log out error: ' + err.message);
            return result(res, {statusCode: 905, message: err.message});
        }
        proxy.GSList.onUpdate(req.body.userID, 'offline');
        //success
        log.debug('log out success');
        result(res, {statusCode: 900});
    });
};
