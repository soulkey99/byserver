/**
 * Created by MengLei on 2015/7/20.
 */


var config = require('./../../config');
var db = require('./../../config').db;
var result = require('../../utils/result');
var objectId = require('mongojs').ObjectId;
var log = require('./../../utils/log').order;
var dbLog = require('./../../utils/log').dbLog;

//增加/减少用户积分，同时增加一条积分记录
//userID：用户id，count：积分数（为负则减），operType：操作类型，detail：详细信息
//operType: 0：新用户注册奖励，1：完善个人资料，2：抢答，3：提问。
module.exports = function(userID, operType, detail){
    if(!detail){
        detail = {};
    }
    detail.t = (new Date()).getTime();

    log.trace('add bonus operation, userID: ' + userID + ', operType: ' + operType + ', detail: ' + JSON.stringify(detail));

    db.byConfig.findOne({'_id':'bonusConfig'}, function(err, doc){
        if(err){
            //handle error
        }else{
            if(doc && doc.config){
                var bonus = 0;

                switch(operType){
                    case '0':
                        detail.desc = '新用户注册奖励';
                        bonus = doc.config.newReg;
                        break;
                    case '1':
                        detail.desc = '完善个人资料奖励';
                        bonus = doc.config.fillProfile;
                        break;
                    case '2':
                        detail.desc = '抢答获取积分奖励';
                        bonus = doc.config.grabOrder;
                        break;
                    case '3':
                        detail.desc = '提问获取积分奖励';
                        bonus = doc.config.genOrder;
                        break;
                    default :
                        log.trace('in default, operType is: ' + operType);
                        break;
                }

                if(bonus != 0) {
                    if(operType == '1'){
                        //完善个人资料奖励只能获得一次
                        db.bonus.find({userID: userID, type: '1'}, function(err, doc){
                            if(err){
                                //handle error
                            }else{
                                if(doc && doc.length > 0){
                                    //获取过奖励，不再发放
                                }else{
                                    //没有获得过奖励，则发放
                                    doAdd(userID, bonus, operType, detail);
                                }
                            }
                        })
                    }else {
                        doAdd(userID, bonus, operType, detail);
                    }
                }
            }
        }
    });
};


//发放奖励的操作
function doAdd(userID, bonus, operType, detail){
    log.trace('add bonus success: userID: ' + userID + ', bonus: ' + bonus + ', detail: ' + JSON.stringify(detail));
    db.users.update({_id: new objectId(userID)}, {$inc: {'userInfo.bonus': bonus}});
    db.bonus.insert({userID: userID, bonus: bonus, type: operType, detail: detail});
}

