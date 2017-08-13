/**
 * Created by MengLei on 2015/2/7.
 */

var config = require('../../config').logConfig;

var log4js = require('log4js');
log4js.configure({
    appenders: [
        {
            type: 'console',
            category: "console"
        } //控制台输出
    ],
    replaceConsole: true   //替换console.log
});

var dateFileLog = log4js.getLogger('console');

module.exports = dateFileLog;

dateFileLog.use = function (app) {
    //页面请求日志,用auto的话,默认级别是WARN
    //app.use(log4js.connectLogger(dateFileLog, {level:'auto', format:':method :url'}));
    app.use(log4js.connectLogger(dateFileLog, {level: config.level, format: ':method :url'}));
};