/**
 * Created by MengLei on 2015/11/26.
 */

var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var db = require('../../../config').db;
var log = require('../../../utils/log').http;

//增加金钱的方法
//reward：学生打赏，rewardSuccess：webhook返回打赏成功，withdraw：教师提现，withdrawSuccess：提现成功
module.exports = function(id, money, action) {
    if (!action) {
        action = 'reward';
    }
    var _id = new objectId();
    try {
        _id = new objectId(id);
    } catch (ex) {
        //
    }
    var reward = {
        pending: 0, //待确认
        success: 0,   //支付成功
        withdrawing: 0, //正在提现中
        withdrawn: 0    //已提现
    };
    db.users.findOne({_id: _id}, {'userInfo.teacher_info': 1}, function (err, doc) {
        if (err) {
            //
        } else {
            if (doc) {
                if (doc.userInfo.teacher_info.reward) {
                    reward = doc.userInfo.teacher_info.reward;
                }
                switch (action) {
                    case 'reward'://这里是打赏老师，给老师增加对应的金钱
                        reward.pending += money;
                        break;
                    case 'rewardFail':
                        reward.pending -= money;
                        break;
                    case 'rewardSuccess':
                        reward.pending -= money;
                        reward.success += money;
                        break;
                    case 'withdraw':
                        reward.success -= money;
                        reward.withdrawing += money;
                        break;
                    case 'withdrawFail':
                        reward.success += money;
                        reward.withdrawing -= money;
                        break;
                    case 'withdrawSuccess':
                        reward.withdrawing -= money;
                        reward.withdrawn += money;
                        break;
                }
                db.users.update({_id: _id}, {$set: {'userInfo.teacher_info.reward': reward}});
            }
        }
    });
};
