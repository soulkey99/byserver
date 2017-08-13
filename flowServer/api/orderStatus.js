/**
 * Created by MengLei on 2015/6/12.
 */

var httpReq = require('../utils/httpReq');

module.exports = function(callback){
    //订购结果查询接口（需要处理反馈）,通过调用该接口，获得用户订购信息明细列表。
    //该方式查询流量订购结果时，在客户成功获得平台返回的订购结果后，客户需要将信息保存到本地，以备以后使用。同时，在成功把数据保存到本地后，需要反馈信息（任务id和手机号）给平台，避免下次请求时获得的数据与客户现存数据有重复。
    httpReq({api: 'orderStatus'}, function(err, resp){
        callback(err, resp);
    });
};
