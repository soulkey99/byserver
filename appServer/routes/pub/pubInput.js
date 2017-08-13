/**
 * Created by MengLei on 2015/11/27.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var dnode = require('../../utils/dnodeClient');

module.exports = function (req, res) {
    //公众号页面输入消息
    var param = {
        userID: req.body.userID,
        pub_id: req.body.pub_id
    };
    if (req.body.reply_id) {
        param['reply_id'] = req.body.reply_id;
    } else {
        param['text'] = req.body.text;
    }
    dnode('orderServer', 'pubInput', param, function (err, resp) {
        if (err) {
            result(res, {statusCode: 905, message: err});
        } else {
            log.trace('pub input request success.');
            result(res, resp);
        }
    });
};
