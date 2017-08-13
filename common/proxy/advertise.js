/**
 * Created by MengLei on 2016/1/29.
 */

var model = require('../model');
var Advertise = model.Advertise;

/**
 * 根据id获取广告详情内容
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {String} id 广告id
 * @param {Function} callback 回调函数
 */
exports.getAdByID = function(id, callback){
    Advertise.findOne({_id: id}, callback);
};

/**
 * 根据时间点获取特定广告
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 输入参数param = {time: '', platform: '', resolution: '', userType: ''}
 * @param {Function} callback 回调函数
 */
exports.getCurrentAd = function(param, callback) {
    //查询条件，默认条件是有效期在此期间、有效、安卓、学生端，然后根据客户端上传的参数进行筛选
    var query = {
        start: {$lte: !!param.time ? parseFloat(param.time) : Date.now()},
        end: {$gte: !!param.time ? parseFloat(param.time) : Date.now()},
        valid: true,
        type: {$ne: null},
        platform: {$all: ['android']},
        userType: {$all: ['student']}
    };
    if (param.platform) {
        query.platform = {$all: [param.platform.toLowerCase()]};
        if (param.platform.toLowerCase() == 'ios') {
            //对于ios类型的，需要分辨率信息，如果不传默认iphone5及以上的分辨率，如果传了，则直接取值
            //为了强迫症，需要把上传来的resolution的值强制转成全小写形式
            query['$or'] = [{type: 'splash', resolution: (!!param.resolution? (param.resolution.toLowerCase()):  'iphone5')}, {type: {$ne: 'splash'}}];
        }
    }
    if (param.userType) {
        query['userType'] = {$all: [param.userType]};
    }
    var list = {needPop: false, splash: [], waiting: [], banner: [], homePop: []};

    Advertise.find(query, {}, {sort: '-start'}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        doc.sort(function (a, b) {
            return a.seq - b.seq;
        });
        for (var i = 0; i < doc.length; i++) {
            switch (doc[i].type) {
                case 'banner':
                    list.banner.push(doc[i].content);
                    break;
                case 'splash':
                    list.splash.push(doc[i].content);
                    break;
                case 'waiting':
                    list.waiting.push(doc[i].content);
                    break;
                case 'homePop':
                    list.needPop = true;
                    list.homePop.unshift(doc[i].content);
                    break;
                case 'homeHide':
                    list.homePop.push(doc[i].content);
                    break;
            }
        }
        callback(null, list);
    });
};

/**
 * 根据条件获取广告列表
 * Callback:
 * - err, 数据库异常
 * - doc, 列表
 * @param {Object} param 输入参数，param={startPos: '', pageSize: '', valid: '', userType: '', platform: '', type: ''}
 * @param {Function} callback 回调函数
 */
exports.getList = function(param, callback) {
    var query = {type: {$in: ['banner', 'splash', 'waiting', 'homePop', 'homeHide']}};
    var start = (!!param.startPos ? parseInt(param.startPos) : 1) - 1;
    var count = !!param.pageSize ? parseInt(param.pageSize) : 10;
    if (param.valid) {
        query['valid'] = (param.valid == 'true');
    }
    if (param.time) {
        query['start'] = {$lte: parseFloat(param.time)};
        query['end'] = {$gte: parseFloat(param.time)};
    }
    if (param.userType) {
        query['userType'] = {$all: [param.userType]};
    }
    if (param.platform) {
        query['platform'] = {$all: [param.platform]};
    }
    if (param.type) {
        query['type'] = param.type;
    }
    Advertise.find(query, {}, {skip: start < 0 ? 0 : start, limit: count, sort: '-createTime'}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        var list = [];
        for (var i = 0; i < doc.length; i++) {
            var item = {
                ad_id: doc[i]._id.toString(),
                start: doc[i].start,
                end: doc[i].end,
                valid: doc[i].valid,
                content: doc[i].content,
                type: doc[i].type,
                platform: doc[i].platform,
                userType: doc[i].userType,
                desc: doc[i].desc,
                seq: doc[i].seq
            };
            if (item.type == 'storeBanner') {
                delete(item.platform);
                delete(item.userType);
            }
            if (item.type == 'splash') {
                item.resolution = doc[i].resolution
            }
            list.push(item);
        }
        callback(null, list);
    });
};


