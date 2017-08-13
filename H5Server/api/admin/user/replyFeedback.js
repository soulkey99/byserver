/**
 * Created by MengLei on 2016/1/4.
 */

var proxy = require('../../../../common/proxy');
var result = require('./../../../utils/result');
var dnode = require('../../../utils/dnodeClient');
var zrpc = require('../../../../utils/zmqClient');

//管理员回复意见反馈
module.exports = function(req, res){
    var info = {
        userID: req.body.u_id,
        type: req.body.type,
        content: req.body.content || '',
        direction: 'a2u'
    };
    if(req.body.type == 'image'){
        info.orientation = req.body.orientation;
    }else if(req.body.type == 'voice'){
        info.duration = parseInt(req.body.duration);
    }else{
        info.type = 'text';
    }
    proxy.Feedback.createFeedback(info, function(err, doc){
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        result(res, {statusCode: 900});
        //通过mqtt发给用户
        zrpc('mqttServer', 'sendTo', {body: {action: 'feedback', content: doc.toObject({getters: true})}, dest: info.userID}, function(err2, resp){
        });
    });
};
