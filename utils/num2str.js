/**
 * Created by MengLei on 2016-04-14.
 */
"use strict";
//转换数字为string，例如： 1234 => 1.2k
module.exports = function (number, digits) {
    if (number < 0) return '0';
    if (number < 1e3) return number.toString();

    if (!digits) digits = 2;

    var exp = Math.floor(Math.log(number) / Math.log(1e3));
    number = number / Math.pow(1e3, exp);

    var exp2 = Math.ceil(Math.log(number) / Math.log(1e1));
    if (digits < exp2) digits = exp2;

    return (+number.toPrecision(digits) + 'kMGTPE'.charAt(exp - 1)).toString();
};
