/**
 * Created by MengLei on 2015/2/7.
 */

var http = require('http');
var log = require('./log');

module.exports = function (info, callback) {
    var req = http.request(options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            //parse response data from third part api
            var dataStr = chunk.toString();
            log.debug('SMS data from third part api: ' + dataStr);
            callback({code: 0, content: JSON.parse(chunk)});
        });
    });

    req.on('error', function (e) {
        log.error('request to third part api error: ' + e);
        callback({code: 0, conten: e});
    });

// write data to request body
    req.write(info);
    req.end();
};