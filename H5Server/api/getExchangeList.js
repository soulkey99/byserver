/**
 * Created by MengLei on 2015/7/21.
 */

var result = require('./../utils/result');
var objectId = require('mongojs').ObjectId;
var db = require('../../config').db;
var log = require('./../../utils/log').h5;

//积分兑换列表
module.exports = function(req, res){
    //
    //获取积分记录列表
    var query = {userID: req.body.userID, type: '4'};
    if (req.body.start && req.body.end) {
        query.detail.t = {$gte: parseInt(req.body.start), $lte: parseInt(req.body.end)};
    } else if (req.body.end) {
        query.detail.t = {$lte: parseInt(req.body.end)};
    } else if (req.body.start) {
        query.detail.t = {$gte: parseInt(req.body.start)};
    }
    var startPos = parseInt(req.body.startPos || '1');
    var pageSize = parseInt(req.body.pageSize || '50');

    db.bonus.find(query).sort({'detail.t': -1}).skip((startPos - 1) < 0 ? 0 : (startPos - 1)).limit(pageSize).toArray(function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            var bonusList = [];
            var goodIdArray = [];
            //type: 0：新用户注册奖励，1：完善个人资料，2：抢答，3：提问，4：兑换商品消费，分享客户端奖励。
            for (var i = 0; i < doc.length; i++) {
                var item = {
                    bonusID: doc[i]._id.toString(),
                    bonus: 0 - doc[i].bonus,
                    goodId: doc[i].detail.goodId,
                    goodName: doc[i].detail.goodName,
                    time: doc[i].detail.t,
                    hasDetail: false
                };

                if (doc[i].detail.detail) {
                    item.hasDetail = true;
                    item.detailId = doc[i].detail.detail;
                }
                bonusList.push(item);
                goodIdArray.push(new objectId(doc[i].detail.goodId));
            }
            db.goods.find({_id: {$in: goodIdArray}}, function(err2, doc2){
                if(err2){
                    //
                }else{
                    for(var i=0; i<bonusList.length; i++){
                        for(var j=0; j<doc2.length; j++){
                            //
                            if(bonusList[i].goodId == doc2[j]._id.toString()){
                                bonusList[i].avatar = doc2[j].avatar;
                            }
                        }
                    }
                    log.trace('get bonus list success, ');
                    result(res, {statusCode: 900, bonusList: bonusList});
                }
            });
        }
    });
};


