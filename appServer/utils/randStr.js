/**
 * Created by MengLei on 2015/5/14.
 */

//生成大小写字母和数字组成的随机串，默认长度8位，默认字符串集如下
//可以自定义长度以及字符串集
module.exports = function (charsLength, chars) {
    var length = 5;
    if (charsLength) {
        length = charsLength;
    }
    //默认密码集，已排除掉容易混淆的字母与数字，例如I,l,1,0,o,O
    var charsSets = "aAbBcC2dDeEfF3gGhHiJ4jKkLmM5nNpPqQ6rRsStT7uUvVwW8xXyYzZ9";
    if (chars) {
        charsSets = chars;
    }

    var randomChars = "";
    for (var x = 0; x < length; x++) {
        var i = Math.floor(Math.random() * charsSets.length);
        randomChars += charsSets.charAt(i);
    }

    return randomChars;
};
