/**
 * Created by zhengyi on 15/2/19.
 */
var appServer = {};
module.exports = appServer;

appServer.start = function () {
    var express = require('express');
    var path = require('path');
    var favicon = require('serve-favicon');
    var checkAuthSign = require('./utils/checkAuthSign');
    var checkAuthSignV2 = require('./utils/checkAuthSignV2');
    var cookieParser = require('cookie-parser');
    var bodyParser = require('body-parser');
    var log = require('../utils/log').http;
    var config = require('../config');

    var http = require('http');
    var https = require('https');

    var apis = require('./routes/api');
    var apiV2 = require('./apiV2');
    var webhooks = require('./routes/pay/webhooks');
    const bcWebhooks = require('./routes/pay/bcWebhooks');
    var checkUserConf = require('./utils/checkUserConf');

    var app = express();
    app.disable('x-powered-by');
    //log.use(app);


    //静态目录
    app.use(express.static(require('path').join(__dirname, './public')));

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
    //app.use(logger('dev'));

    app.use('/pingppWebhooks', bodyParser.json());
    app.use('/pingppWebhooks', webhooks);
    app.use('/bcWebhooks', bodyParser.json());
    app.use('/bcWebhooks', bcWebhooks);

    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());

    app.use(function(req, res, next){//所有其他形式的请求都挡住，只保留post请求进入下一步处理
        if(req.method.toLowerCase() == 'post'){
            next();
        }else{
            res.end('Not allowed!');
        }
    });
    app.use('/api', checkAuthSignV2);
    app.use('/apiV2', checkAuthSignV2);

    // app.use('/api', checkUserConf);
    // app.use('/apiV2', checkUserConf);

    app.post('/api', apis);

    app.post('/apiV2', apiV2);


    http.createServer(app).listen(config.httpPort, function () {
        log.fatal('app server http port listening on localhost, port: ' + config.httpPort);
        console.info('app server http port listening on localhost, port: ' + config.httpPort);
    });
    https.createServer(config.ssl_opt, app).listen((config.httpPort + config.ssl_inc), function () {
        log.fatal('app server https port listening on localhost, port: ' + (config.httpPort + config.ssl_inc));
        console.info('app server https port listening on localhost, port: ' + (config.httpPort + config.ssl_inc));
    });
};
//引入预定义资源
require('../utils/predefine');

appServer.start();

