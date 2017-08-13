/**
 * Created by MengLei on 2015/6/12.
 */

var httpReq = require('../utils/httpReq');
var config = require('../../config');
var db = require('../../config').db;
var log = require('../../utils/log').flow;

//订购流量
module.exports = function(param, callback) {
    //测试环境，就不充值流量了
    if(config.production_mode == 'false'){
        callback(null, {msgid: '0000000', status: '1', description: 'test'});
        return;
    }
    //暂停充值
    if(config.pause_flow == 'true'){
        callback(null, {msgid: 'pause', status: '1', description: 'system pause'});
        //记录，重试的时候会用到
        db.flowOrders.save({status: 'pause', 'description': 'system pause', num: param.num, flow: param.flow, purpose: param.purpose || '', retry: 0, checked: false});
        return;
    }
    //订购流量
    httpReq({mobile: param.num, flow: param.flow, api: 'orderFlow'}, function (err, resp) {
    //httpReq({mobile: '', flow: 10, api: 'orderFlow'}, function (err, resp) {
        callback(err, resp);
        //流量订购请求成功且返回无错误，那么将请求记录到数据库中
        //resp = {msgid: '', status: '', description: ''}  //status:1，成功，其他代码为失败
        try{
            var respObj = JSON.parse(resp);
            if(respObj) {
                log.trace('save flow order response to database.');
                respObj.num = param.num;
                respObj.flow = param.flow;
                respObj.purpose = param.purpose || '';
                respObj.retry = param.retry || 0; //重试次数，如果没传则默认为0
                respObj.checked = false;
                db.flowOrders.save(respObj);
            }
        }catch(ex){
            log.error('parse flow order response error: ' + ex.message);
        }
    });
};

//httpReq({mobile: '13912341234', flow: '2', api: 'orderFlow'}, function(err, resp){
//    console.log(err);
//    console.log(resp);
//});

//httpReq({api: 'orderStatusApi'}, function(err, resp){
//    console.log(err);
//    console.log(resp);
//});

//httpReq({msgid:'1501081533100114',mobile: '15510331875', api: 'statusConfirm'}, function(err, resp){
//    console.log(err);
//    console.log(resp);
//});