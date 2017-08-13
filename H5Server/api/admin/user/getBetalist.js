/**
 * Created by MengLei on 2016/2/4.
 */

var result = require('./../../../utils/result');
var log = require('../../../../utils/log').h5;
var eventproxy = require('eventproxy');
var proxy = require('../../../../common/proxy');

//获取beta列表
module.exports = function(req, res){
    var ep = new eventproxy();
    var param = {startPos: req.body.startPos, pageSize: req.body.pageSize, platform: req.body.platform, userType: req.body.userType};
    ep.all('u_id', function(u_id){
        if(u_id){
            param['userID'] = u_id;
        }
        proxy.Beta.getBetaList(param, function(err, doc){
            if(err){
                return result(res, {statusCode: 905, message: err.message});
            }
            return result(res, {statusCode: 900, list: doc});
        });
    });
    ep.fail(function(err){
        return result(res, {statusCode: 905, message: err.message});
    });
    if(req.body.phone){
        proxy.User.getUserByPhone(req.body.phone, ep.done('u_id', function(doc){
            if(!doc){
                return '';
            }
            return doc._id.toString();
        }));
    }else{
        ep.emit('u_id', req.body.u_id);
    }
};
