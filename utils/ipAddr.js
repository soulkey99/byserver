/**
 * Created by MengLei on 2015/10/22.
 */

var ipaddr = require('ipaddr.js');

//从request对象中取得客户端的ip地址
module.exports = function(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        '';
    if(ip) {
        var addr = ipaddr.process(ip);
        return addr.octets.join('.');
    }else{
        return '';
    }
};
