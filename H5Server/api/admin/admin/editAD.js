/**
 * Created by MengLei on 2015/11/18.
 */

var result = require('../../../utils/result');
var objectId =  require('mongojs').ObjectId;
var db = require('../../../../config').db;
var log = require('../../../../utils/log').h5;

//编辑广告内容
module.exports = function(req, res) {
    var _id = new objectId();
    if (req.body.ad_id) {
        try {
            _id = new objectId(req.body.ad_id);
        } catch (ex) {
            result(res, {statusCode: 919, message: ex.message});
            return;
        }
        //如果传广告id进来了，那么就是编辑已有，否则就是新建
        var setObj = {};
        if (req.body.startTime) {
            setObj['start'] = parseFloat(req.body.startTime);
        }
        if (req.body.endTime) {
            setObj['end'] = parseFloat(req.body.endTime);
        }
        if (req.body.valid != undefined) {
            setObj['valid'] = (req.body.valid == 'true');
        }
        if (req.body.type != undefined) {
            setObj['type'] = req.body.type;
        }
        if (req.body.platform != undefined) {
            setObj['platform'] = req.body.platform.split(',');
        }
        if (req.body.userType != undefined) {
            setObj['userType'] = req.body.userType.split(',');
        }
        if (req.body.desc != undefined) {
            setObj['desc'] = req.body.desc;
        }
        if (req.body.seq != undefined) {
            setObj['seq'] = parseInt(req.body.seq);
        }
        if (req.body.link != undefined) {
            setObj['content.link'] = req.body.link;
        }
        if (req.body.text != undefined) {
            setObj['content.text'] = req.body.text;
        }
        if (req.body.pic != undefined) {
            setObj['content.pic'] = req.body.pic;
        }
        if (req.body.goodName != undefined) {
            setObj['content.goodName'] = req.body.goodName;
        }
        if (req.body.action != undefined) {
            setObj['content.action'] = req.body.action;
        }
        if(req.body.resolution != undefined) {
            setObj['resolution'] = req.body.resolution;
        }
        db.advertise.update({_id: _id}, {$set: setObj}, function (err) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                result(res, {statusCode: 900});
            }
        });
    } else {
        //这里就是新建
        var item = {
            _id: _id,
            start: req.body.startTime ? parseFloat(req.body.startTime) : (new Date().setHours(0, 0, 0, 0)),
            end: req.body.endTime ? parseFloat(req.body.endTime) : (new Date().setHours(23, 59, 59, 999)),
            valid: req.body.valid == 'true',
            content: {
                pic: req.body.pic || '',
                link: req.body.link || '',
                text: req.body.text || ''
            },
            type: req.body.type,
            platform: ['android'],
            userType: ['student'],
            desc: req.body.desc || '',
            seq: parseInt(req.body.seq) || 999
        };
        if (req.body.platform) {
            item.platform = req.body.platform.split(',');
            if(req.body.platform == 'ios'){
                item.resolution = (req.body.resolution || 'iphone5');
            }
        }
        if (req.body.userType) {
            item.userType = req.body.userType.split(',');
        }
        if (item.type == 'storeBanner') {
            delete(item.platform);
            delete(item.userType);
            delete(item.content);
            item.content = {
                action: req.body.action || '',
                link: req.body.link || '',
                pic: req.body.pic || '',
                text: req.body.text || '',
                goodName: req.body.goodName || ''
            }
        }
        db.advertise.insert(item, function (err) {
            if (err) {
                result(res, {statusCode: 905, message: err.message});
            } else {
                result(res, {statusCode: 900});
            }
        });
    }
};
