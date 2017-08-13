/**
 * Created by MengLei on 2015/4/20.
 */
var h5Server = {};
module.exports = h5Server;

h5Server.start = function () {
    var express = require('express');
    var path = require('path');
    var bodyParser = require('body-parser');
    var log = require('../utils/log').h5;
    var config = require('../config');

    var checkAuthSign = require('./utils/checkAuthSign');
    var api = require('./api');

    var app = express();
    app.disable('x-powered-by');

    var http = require('http');
    var https = require('https');

    //ios强制升级提示
    app.use('/setLogin', function(req, res){
        res.redirect('./update.html');
    });

    //静态目录
    app.use(express.static(require('path').join(__dirname, './views')));
    //app.use(express.static(require('path').join(__dirname, './public')));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use('/api', checkAuthSign);
    app.use('/api', api);

    app.post('/upload', require('./api/upload'));


    http.createServer(app).listen(config.h5Port, function () {
        log.fatal('h5 server listening on localhost, port: ' + config.h5Port);
        console.info('h5 server listening on localhost, port: ' + config.h5Port);
    });
    https.createServer(config.ssl_opt, app).listen((config.h5Port + config.ssl_inc), function () {
        log.fatal('h5 https server listening on localhost, port: ' + (config.h5Port + config.ssl_inc));
        console.info('h5 https server listening on localhost, port: ' + (config.h5Port + config.ssl_inc));
    });
    //process.on('uncaughtException', function(err){
    //    console.log('error occurred: ' + err.message);
    //})
};

h5Server.start();