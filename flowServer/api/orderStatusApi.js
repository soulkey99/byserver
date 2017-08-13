/**
 * Created by MengLei on 2015/6/12.
 */

var httpReq = require('../utils/httpReq');

module.exports = function(callback){
    //订购结果查询接口（结果只返回一次），通过调用该接口，获得用户订购信息明细列表。
    //该方式查询流量订购结果时，在客户只能成功获得一次平台返回的订购结果。在获得结果后，客户需要将信息保存到本地，以备以后使用。

    httpReq({api: 'orderStatusApi'}, function(err, resp){
        callback(err, resp);
    });
};