/**
 * Created by MengLei on 2015/3/8.
 */
var fileServer = {};
module.exports = fileServer;

fileServer.start = function () {
    var express = require('express');
    var log = require('./../utils/log').file;
    var console = require('../utils/log');
    var config = require('./../config');
    var upload = require('./upload');
    var del = require('./delete');
    var formidable = require('./formidable');
    var webp = require('./webp');
    var thumbnail = require('./thumbnail');
    var redirectAmr = require('./redirectAmr');

    var app = express();
    var http = require('http');
    var https = require('https');

//注入log记录功能
//log.use(app);

//静态目录
    app.use(express.static(require('path').join(__dirname, '../public')));

    //先使用formidable对上传文件进行预处理
    app.use('/upload', formidable);
    //对于webp类型的图片进行预处理
    app.use('/upload', webp);
    //对于需要缩略图的地方进行预处理
    app.use('/upload', thumbnail);
    //post方法上传文件
    app.post('/upload', upload);
    //删除已上传的文件
    app.post('/del', del);

    //重定向amr文件到转码服务
    app.get('/redirectAmr', redirectAmr);

    //测试页面
    app.get('/test', function (req, res) {
        // show a file upload form
        res.writeHead(200, {'content-type': 'text/html'});
        res.end(
            '<form action="/upload" enctype="multipart/form-data" method="post">' +
            '<input type="text" name="thumbnail" placeholder="generate thumbnail or not"><br>' +
            '<input type="text" name="path" placeholder="specify upload path"><br>' +
            '<input type="text" name="userID" placeholder="specify userID"><br>' +
            '<input type="file" name="upload" multiple="multiple"><br>' +
            '<input type="submit" value="Upload">' +
            '</form>'
        );
    });


//start http service
    http.createServer(app).listen(config.fsPort, function () {
        log.fatal('file server http port listening on localhost, port: ' + config.fsPort);
        console.info('file server http port listening on localhost, port: ' + config.fsPort);
    });
    https.createServer(config.ssl_opt, app).listen((config.fsPort + config.ssl_inc), function () {
        log.fatal('file server https port listening on localhost, port: ' + (config.fsPort + config.ssl_inc));
        console.info('file server https port listening on localhost, port: ' + (config.fsPort + config.ssl_inc));
    });
};

fileServer.start();