/**
 * Created by MengLei on 2016-06-01.
 */
"use strict";

/**
 * 用来执行Generator函数，
 * @param generator [Function] 传入Generator函数
 * @param param 传入参数
 * @param cb   [Function] 回调函数
 */
module.exports = function(generator, param, cb) {
    var it = generator(param, cb);

    function go(result) {
        if (result.done) return result.value;

        return result.value.then(function (value) {
            return go(it.next(value));
        }, function (error) {
            return go(it.throw(error));
        });
    }

    go(it.next());
};
