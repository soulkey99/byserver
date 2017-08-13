/**
 * Created by MengLei on 2015/7/17.
 */

var db = require('./../../../config').db;
var result = require('./../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../../utils/log').admin;

module.exports = function(req, res){
    var start = '';
};

//返回时间区间
function dateUtil(p){
    if(!p){
        p = 0;
    }
    var curDate = new Date();
    curDate.setDate(curDate.getDate() + p);

    curDate.setHours(0, 0, 0, 0);
    var start = curDate.getTime();
    curDate.setHours(24, 0,0,0);
    var end = curDate.getTime();
    return {start: start, end: end};
}