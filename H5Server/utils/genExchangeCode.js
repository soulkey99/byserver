/**
 * Created by MengLei on 2015/8/4.
 */

module.exports = function (charsLength, chars) {
    var length = 12;
    if (charsLength) {
        length = charsLength;
    }
    //默认密码集，纯数字
    var charsSets = "1234567890";
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
