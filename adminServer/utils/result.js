/**
 * Created by MengLei on 2015/4/10.
 */

module.exports = function (res, content) {
    //���÷���ֵͷ����
    res.setHeader('ContentType', 'application/json;charset=UTF-8');
    res.setHeader('Cache-control', 'no-cache');

    res.end(JSON.stringify(content));
};