/**
 * Created by MengLei on 2015/7/24.
 */

var https = require('https');
var log = require('./log').sms;

module.exports = function(body, callback){
    var options = {
        host: 'leancloud.cn',
        path: '/1.1/requestSmsCode',
        method: 'POST',
        headers: require('./../config').smsConfig
    };

    var req = https.request(options, function (res) {
        res.setEncoding('utf8');
        var str = '';
        res.on('data', function (chunk) {
            //parse response data from third part api
            str += chunk.toString();
        });
        res.on('end', function(){
            log.debug('SMS data from lean cloud api: ' + str);
            try{
                callback(null, JSON.parse(str));
            }catch(ex){
                callback({message: ex.message});
            }
        });
    });

    req.on('error', function (e) {
        log.error('request to third part api error: ' + e.message);
        callback(e);
    });

// write data to request body
    log.trace('send sms: ' + JSON.stringify(body));
    req.write(JSON.stringify(body));
    req.end();
};