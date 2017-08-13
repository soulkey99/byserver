/**
 * Created by MengLei on 2015/2/28.
 */

module.exports = function (res, content) {
    //设置返回值头数据
    //console.log('res begin: ' + JSON.stringify(content));
    res.setHeader('ContentType', 'application/json;charset=UTF-8');
    res.setHeader('Cache-control', 'no-cache');
    if (res.req.headers.platform && res.req.headers.platform.toLowerCase() == 'ios') {
        content = JSON.parse(JSON.stringify(content).replace(/http:\/\/oss.soulkey99.com/g, 'https://callcall-server.oss-cn-beijing.aliyuncs.com'));
    }
    res.end(JSON.stringify(content), function () {
        //console.log('res end: ' + JSON.stringify(content));
    });
};