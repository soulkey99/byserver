/**
 * Created by MengLei on 2015/2/7.
 */

var result = require('./result');
var constErrCode = require('./const').constErrCode;
//校验输入值是否为空
var checkNull = function (req, res) {
    for (var i = 2; i < arguments.length; i++) {
        if ((!req.body[arguments[i]]) && (!req.query[arguments[i]])) {
            console.log(arguments[i] + ' can not be null');
            result(req, res, constErrCode.argumentsNull, arguments[i]);
            return true;
        }
    }
    return false;
};
//校验输入值是否为空(仅针对GET方法)
var checkQueryNull = function (req, res) {
    for (var i = 2; i < arguments.length; i++) {
        if (!req.query[arguments[i]]) {
            console.log(arguments[i] + ' can not be null');
            result(req, res, constErrCode.argumentsNull, arguments[i]);
            return true;
        }
    }
    return false;
};
//校验输入值是否为空(仅针对POST方法)
var checkBodyNull = function (req, res) {
    for (var i = 2; i < arguments.length; i++) {
        if (!req.body[arguments[i]]) {
            console.log(arguments[i] + ' can not be null');
            result(req, res, constErrCode.argumentsNull, arguments[i]);
            return true;
        }
    }
    return false;
};

module.exports = checkNull;