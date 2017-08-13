/**
 * Created by MengLei on 2015/8/24.
 */

var db = require('./../../config').db;
var config = require('./../../config');
var objectId = require('mongojs').ObjectId;
var result = require('./../utils/result');
var log = require('../../utils/log').h5;

//获取商城首页banner
module.exports = function(req, res) {
    //
    var t = new Date().getTime();
    var query = {start: {$lte: t}, end: {$gte: t}, valid: true, type: 'storeBanner'};
    db.advertise.find(query, {content: 1, seq: 1}, function (err, doc) {
        if (err) {
            //
            result(res, {statusCode: 905, message: err.message});
        } else {
            var banner = [];
            doc.sort(function (a, b) {
                return a.seq - b.seq;
            });
            for (var i = 0; i < doc.length; i++) {
                var item = {
                    action: doc[i].content.action || '',
                    dest: doc[i].content.link || '',
                    text: doc[i].content.text || '',
                    imgsrc: doc[i].content.pic || '',
                    goodName: doc[i].content.goodName || ''
                };
                banner.push(item);
            }
            result(res, {statusCode: 900, banner: banner});
        }
    });
};
