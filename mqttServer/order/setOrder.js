/**
 * Created by MengLei on 2015/3/13.
 */

var router = require('../router');

module.exports = function (param, result) {
    //
    result(null, {statusCode: 900});
    router.setOrder(param.content, param.to);
};
