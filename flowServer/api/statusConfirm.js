/**
 * Created by MengLei on 2015/6/12.
 */

var httpReq = require('../utils/httpReq');

module.exports = function(msgid, num, callback){
    //反馈信息处理接口描述
    //通过调用该接口，避免用户在下次查询订购结果时出现重复数据的现象。客户也可以不使用该接口，那样做的结果就是每次都会取到以前已经获取的数据。建议在每次请求订购结果后使用该接口。
    httpReq({msgid: msgid, mobile: num, api: 'statusConfirm'}, function(err, resp){
        callback(err, resp);
    });
};
