/**
 * Created by MengLei on 2015/2/7.
 */

var log4js = require('log4js');
var path = require('path');
var fs = require('fs-extra');
var logLevels = require('./../config').logConfig;
var logPath = require('./../config').logPath;
var db = require('./../config').db;

//make sure the directory exists.
fs.ensureDirSync(path.join(__dirname, '../public/logs'));

log4js.configure({
    appenders: [
        {
            type: "dateFile",
            filename: path.join(__dirname, logPath , "logs/http.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "http"
        },
        {
            type: "dateFile",
            filename: path.join(__dirname, logPath, "logs/admin.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "admin"
        },
        {
            type: "dateFile",
            filename: path.join(__dirname, logPath, "logs/order.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "order"
        },
        {
            type: "dateFile",
            filename: path.join(__dirname, logPath, "logs/file.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "file"
        },
        {
            type: "dateFile",
            filename: path.join(__dirname, logPath, "logs/mqtt.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "mqtt"
        },
        {
            type: "dateFile",
            filename: path.join(__dirname, logPath, "logs/mos.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "mos"
        },
        {
            type: "dateFile",
            filename: path.join(__dirname, logPath , "logs/flow.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "flow"
        },
        {
            type: "dateFile",
            filename: path.join(__dirname, logPath, "logs/h5.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "h5"
        },
        {
            type: "dateFile",
            filename: path.join(__dirname, logPath, "logs/common.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "common"
        },
        {
            type: "dateFile",
            filename: path.join(__dirname, logPath, "logs/umeng.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "umeng"
        },
        {
            type: "dateFile",
            filename: path.join(__dirname, logPath, "logs/sms.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "sms"
        },
        {
            type: "console",
            filename: path.join(__dirname, logPath, "logs/game.log"),
            pattern: "_MMddhh.log",
            alwaysIncludePattern: false,
            category: "game"
        },
        {
            type: "console",
            category: "console"
        } //控制台输出
    ],
    levels: logLevels,

    replaceConsole: true   //替换console.log
});

function dbLog(userID, action, content){
    //
    if(!content){
        content = {};
    }
    var curDate = new Date();
    db.dbLog.insert({userID: userID, action: action, content: content, t: curDate.getTime()});
}

var logger = log4js.getLogger('console');
logger.http = log4js.getLogger('http');
logger.order = log4js.getLogger('order');
logger.file = log4js.getLogger('file');
logger.mqtt = log4js.getLogger('mqtt');
logger.mos = log4js.getLogger('mos');
logger.flow = log4js.getLogger('flow');
logger.h5 = log4js.getLogger('h5');
logger.common = log4js.getLogger('common');
logger.admin = log4js.getLogger('admin');
logger.umeng = log4js.getLogger('umeng');
logger.sms = log4js.getLogger('sms');
logger.game = log4js.getLogger('game');
logger.dbLog = dbLog;



module.exports = logger;

logger.use = function (app) {
    //页面请求日志,用auto的话,默认级别是WARN
    app.use(log4js.connectLogger(logger, {level: 'auto', format: ':method :url'}));
};