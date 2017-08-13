/**
 * Created by MengLei on 2015/4/10.
 */

var adminServer = {};
module.exports = adminServer;

adminServer.start = function () {
    var express = require('express');
    var path = require('path');
    var bodyParser = require('body-parser');
    var log = require('../utils/log').admin;
    var config = require('../config');
    var checkAuthSign = require('./utils/checkAuthSign');

    var api = require('./api');

    var app = express();
    app.disable('x-powered-by');

    require('./api/shareCode/task').start();//启动推广效果维护定时任务

    //静态目录
    app.use(express.static(require('path').join(__dirname, './views')));
    //app.use(express.static(require('path').join(__dirname, './public')));

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));

    app.use('/api', checkAuthSign);

    app.use('/api', api);


    app.listen(config.adminPort, function () {
        log.fatal('admin server http port listening on localhost, port: ' + config.adminPort);
        console.info('admin server http port listening on localhost, port: ' + config.adminPort);
    });
};

adminServer.start();