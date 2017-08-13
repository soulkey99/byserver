/**
 * Created by MengLei on 2016-05-05.
 */
"use strict";
var result = require('../../utils/result');
var proxy = require('../../../common/proxy');

module.exports = function (req, res) {
    proxy.Activity.getList({}, function (err, list) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900, list});
    });
};
