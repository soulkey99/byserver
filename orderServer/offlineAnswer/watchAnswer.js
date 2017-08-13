/**
 * Created by MengLei on 2015/8/28.
 */

var db = require('../../config').db;
var config = require('../../config');
var objectId = require('mongojs').ObjectId;
var hot = require("hot-ranking");
var log = require('./../../utils/log').order;
var rankData = require('./rank/data');

//关注答案，param={userID: '', answer_id: '', action: ''}
module.exports = function(param, callback){
    //答案不需要关注
};
