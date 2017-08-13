/**
 * Created by MengLei on 2015/8/3.
 */

var result = require('./result');
var log = require('./../../utils/log').h5;

module.exports = function (req, res) {
    for (var i = 2; i < arguments.length; i++) {
        if ((!req.body[arguments[i]]) && (!req.query[arguments[i]])) {
            log.error(arguments[i] + ' can not be null');
            result(res, {statusCode: 999, message: arguments[i] + 'can not be null.'});
            return true;
        }
    }
    return false;
};
