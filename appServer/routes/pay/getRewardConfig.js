/**
 * Created by MengLei on 2016/1/4.
 */

var result = require('../../utils/result');
var db = require('../../../config').db;

//获取打赏教师配置
module.exports = function(req, res) {
    db.byConfig.findOne({_id: 'rewardConfig'}, function (err, doc) {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        var config = {
            list: [{text: '2元', amount: 200, checked: true},
                {text: '3元', amount: 300, checked: false},
                {text: '5元', amount: 500, checked: false}],
            rate: 1
        };
        //如果数据库中有内容那么取配置，否则直接使用默认配置
        if (doc) {
            config = doc.config;
        }
        result(res, {statusCode: 900, config: config});
    });
};
