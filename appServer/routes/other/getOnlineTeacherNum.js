/**
 * Created by MengLei on 2015/6/7.
 */

var config = require('../../../config');
var mongojs = require('mongojs');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;


module.exports = function(req, res){
    //获取在线教师数目
    config.db.users.find({userType: 'teacher'}).count(function(err, count){
        if(err){
            //handle error
        }else{
            result(res, {statusCode: 900, num: getNum(count)});
        }
    });
};


function getNum(num, t) {
    //目前是做一个假的在线教师人数，算法如下：总教师人数乘以0.1，得到的数目再
    //按照每日不同时间段设置加权，再按照每个小时内不同的分钟时间段进行加权，
    //得到的数目就是最终返回给用户的数目
    if(num < 500){
        num = 500;
    }
    var current = new Date();
    if(t){
        current = new Date(t);
    }
    var ph = 1;  //按照小时不同乘以的系数
    var pm = 1;  //按照分钟不同乘以的系数（由于小时内数目变化不会太大，所以该数目应该在1左右小范围变化）
    var k = 0.4;    //随机数的变化范围，人多的时候k略小，人少的时候k略大
    switch (current.getHours()) {
        case 0:
            ph = 0.08;
            break;
        case 1:
            ph = 0.02;
            break;
        case 2:
            ph = 0.01;
            break;
        case 3:
            ph = 0.004;
            break;
        case 4:
            ph = 0.002;
            break;
        case 5:
            ph = 0.01;
            break;
        case 6:
            ph = 0.03;
            break;
        case 7:
            ph = 0.1;
            k = 0.3;
            break;
        case 8:
            ph = 0.3;
            k = 0.2;
            break;
        case 9:
            ph = 0.6;
            k = 0.15;
            break;
        case 10:
            ph = 0.7;
            k = 0.15;
            break;
        case 11:
            ph = 0.8;
            k = 0.15;
            break;
        case 12:
            ph = 0.9;
            k = 0.1;
            break;
        case 13:
            ph = 0.8;
            k = 0.1;
            break;
        case 14:
            ph = 0.7;
            k = 0.1;
            break;
        case 15:
            ph = 0.9;
            k = 0.1;
            break;
        case 16:
            ph = 1.0;
            k = 0.1;
            break;
        case 17:
            ph = 0.75;
            k = 0.1;
            break;
        case 18:
            ph = 0.8;
            k = 0.1;
            break;
        case 19:
            ph = 1.05;
            k = 0.1;
            break;
        case 20:
            ph = 1.1;
            k = 0.1;
            break;
        case 21:
            ph = 1.15;
            k = 0.1;
            break;
        case 22:
            ph = 0.55;
            k = 0.15;
            break;
        case 23:
            ph = 0.3;
            k = 0.2;
            break;
        default :
            ph = 1;
            break;
    }
    switch (Math.floor(current.getMinutes() / 4)) {
        case 0:
            pm = 1.1;
            break;
        case 1:
            pm = 1.05;
            break;
        case 2:
            pm = 1.08;
            break;
        case 3:
            pm = 1.03;
            break;
        case 4:
            pm = 1.07;
            break;
        case 5:
            pm = 1.02;
            break;
        case 6:
            pm = 1.09;
            break;
        case 7:
            pm = 1.12;
            break;
        case 8:
            pm = 1.16;
            break;
        case 9:
            pm = 1.13;
            break;
        case 10:
            pm = 1.18;
            break;
        case 11:
            pm = 1.4;
            break;
        case 12:
            pm = 1.11;
            break;
        case 13:
            pm = 1.05;
            break;
        case 14:
            pm = 1.01;
            break;
        default :
            pm = 1;
            break;
    }
    return Math.ceil(num * 0.1 * ph * pm * getRandom(k));//总有效教师数量的10% ，乘以小时加权 ，再乘以分钟加权，再乘以一个0.8到1.2之间的随机数
}

function getRandom(k){
    if(k == undefined){
        k = 0.4;
    }
    //获取一个随机数，默认0.8到1.2之间的
    return (1 + (Math.random() - 0.5) * k);
}