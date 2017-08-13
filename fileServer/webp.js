/**
 * Created by MengLei on 2015/10/13.
 */

var isWebp = require('is-webp');
var readChunk = require('read-chunk');
var webp = require('webpconv');
var result = require('./result');
var log = require('./../utils/log').file;

//对于webp类型的图片进行预处理
module.exports = function(req, res, next){
    var path = req.files.upload.path;
    var buffer = new Buffer(0);
    try {
        //对这个读取片段buffer的地方进行try catch处理，防止文件不存在的时候抛出异常
        buffer = readChunk.sync(path, 0, 12);
    }catch (ex){
        result(res, {statusCode: 905, message: ex.message});
        return;
    }
    if(isWebp(buffer)){
        //处理webp格式
        webp.dwebp(path, path, function(err, resp){
            if(err){
                result(res, {statusCode: 905, message: err.message});
            }else{
                //console.log(JSON.stringify(resp));
                log.trace('convert webp format success.');
                next();
            }
        });
    }else{
        next();
    }
};
