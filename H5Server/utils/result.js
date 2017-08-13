/**
 * Created by MengLei on 2015/4/20.
 */

module.exports = function (res, content) {
    //设置返回值头数据
    //console.log(JSON.stringify(content));
    res.setHeader('ContentType', 'application/json;charset=UTF-8');
    res.setHeader('Cache-control', 'no-cache');

    content = JSON.parse(JSON.stringify(content).replace(/http:\/\/oss.soulkey99.com/g, 'https://callcall-server.oss-cn-beijing.aliyuncs.com'));

    res.end(JSON.stringify(content));
};