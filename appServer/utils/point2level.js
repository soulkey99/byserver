/**
 * Created by MengLei on 2015/6/6.
 */

module.exports = function(point) {
    //输入教师积分，返回教师星级
    if (point < 20) {
        //0 star
        return 0;
    } else if (point <= 70) {
        //1 stars
        return 1;
    } else if (point <= 170) {
        //2 stars
        return 2;
    } else if (point <= 470) {
        //3 stars
        return 3;
    } else if (point <= 970) {
        //4 stars
        return 4;
    } else {
        //5 stars
        return 5;
    }
};