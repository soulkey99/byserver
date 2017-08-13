/**
 * Created by MengLei on 2015/10/20.
 */

var http = require('http');
var result = require('./result');

//重定向音频文件请求
module.exports = function(req, res){
    var url = 'http://test.soulkey99.com:8082/AmrToMp3ServletNew?url=' + req.query.url;
    http.get(url, function(resp){
        var str = '';
        resp.on('data', function(data){
            str += data;
        });
        resp.on('end', function(){
            res.redirect(str.substr(34, 72));
        });
    }).on('error', function(err){
        result(res, {statusCode: 905, message: err.message});
    });
};

