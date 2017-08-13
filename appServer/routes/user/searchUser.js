/**
 * Created by MengLei on 2015/10/13.
 */

var db = require('../../../config').db;
var objectId = require('mongojs').ObjectId;
var result = require('../../utils/result');
var log = require('../../../utils/log').http;

//搜索用户
module.exports = function(req, res) {
    var start = parseInt(req.body.startPos || 1) - 1;
    var count = parseInt(req.body.pageSize || 10);

    var query = {};
    if (req.body.query) {
        if (isMobile(req.body.query)) {
            //如果搜索条件是手机号，那么要做两种匹配，对昵称的模糊匹配和对手机号的精确匹配
            query['$or'] = [{phone: req.body.query}, {nick: new RegExp(req.body.query)}];
        } else {
            //如果搜索条件不是手机号，那么只对搜索条件做昵称的模糊匹配
            var q_str = req.body.query;
            if (q_str.indexOf('*') >= 0) {
                q_str = q_str.replace(/\*/g, '\\\\*');
            }
            //console.log('q_str: ' + q_str);
            query['nick'] = new RegExp(q_str);
        }
    }
    //console.log(query);
    //默认搜索公众号和用户，如果指定搜索类型，那么可以进行过滤
    if (req.body.searchType == 'public') {
        //如果只搜索公众号
        query['userType'] = 'public';
        query['status'] = 'active'; //只有已经激活状态下的公众号才可以被搜索到
    } else if (req.body.searchType == 'teacher') {
        query['userType'] = 'teacher';
    } else if (req.body.searchType == 'student') {
        query['userType'] = 'student';
    } else if (req.body.searchType == 'recommend') {
        //获取推荐公众号，先查出50个，然后随机抽取5个
        query = {'userType': 'public'};
        start = 0;
        count = 50;
    } else {
        //默认只搜索普通用户
        query['userType'] = {$in: ['teacher', 'student']};
    }
    //console.log('query: ' + JSON.stringify(query) + ', searchType: ' + req.body.searchType);
    db.users.find(query, {_id: 1, nick: 1, intro: 1, 'userInfo.avatar': 1, userType: 1, 'userInfo.teacher_info.verify_type': 1, 'userInfo.verify_info.verify_type': 1}).skip(start < 0 ? 0 : start).limit(count).toArray(function (err, doc) {
        if (err) {
            result(res, {statusCode: 905, message: err.message});
        } else {
            var list = [];
            for (var i = 0; i < doc.length; i++) {
                var item = {
                    userID: doc[i]._id.toString(),
                    nick: doc[i].nick,
                    intro: doc[i].intro,
                    avatar: doc[i].userInfo.avatar || '',
                    userType: doc[i].userType
                };
                if (item.userType == 'teacher') {
                    item.verify_type = doc[i].userInfo.teacher_info.verify_type;
                } else if (item.userType == 'public') {
                    item.verify_type = doc[i].userInfo.verify_info.verify_type;
                }
                list.push(item);
            }
            if (req.body.searchType == 'recommend') {
                //如果要获取推荐公众号，那么从结果中随机抽出N个
                var count = parseInt(req.body.pageSize || 5);
                while (list.length > count) {
                    //只有在实际数量大于N个的时候才随机抽，否则直接返回已有的那些
                    var rand = Math.floor(list.length * Math.random());
                    list.splice(rand, 1);
                }
            }
            result(res, {statusCode: 900, list: list});
        }
    });
};

function isMobile(num){ //判断手机号
    return (/^(13[0-9]|14[0-9]|15[0-9]|17[0-9]|18[0-9])\d{8}$/.test(num));
}
