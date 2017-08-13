/**
 * Created by MengLei on 2015/12/20.
 */

var proxy = require('../../../common/proxy');
var result = require('../../utils/result');

//获取意见反馈列表
module.exports = function(req, res){
    proxy.Feedback.getFeedbacksByUser({userID: req.body.userID, startPos: req.body.startPos, pageSize: req.body.pageSize}, function(err, doc){
        if(err){
            return result(res, {statusCode: 905, message: err.message});
        }
        var list = [];
        for(var i=0; i<doc.length; i++){
            var item = {
                feedback_id: doc[i].feedback_id,
                userID: doc[i].userID,
                type: doc[i].type,
                content: doc[i].content,
                direction: doc[i].direction,
                qq: doc[i].qq,
                platform: doc[i].platform,
                os_version: doc[i].os_version,
                userType: doc[i].userType,
                client_version: doc[i].client_version,
                channel: doc[i].channel,
                time: doc[i].time
            };
            if(item.type == 'voice'){
                item.duration = doc[i].duration;
            }else if(item.type == 'image'){
                item.orientation = doc[i].orientation;
            }
            list.push(item);
        }
        result(res, {statusCode: 900, list: list});
    });
};
