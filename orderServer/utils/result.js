/**
 * Created by MengLei on 2015/2/28.
 */

module.exports = function (res, content) {
    //设置返回值头数据
    res.setHeader('ContentType', 'application/json;charset=UTF-8');
    res.setHeader('Cache-control', 'no-cache');

    res.end(JSON.stringify(content));
};