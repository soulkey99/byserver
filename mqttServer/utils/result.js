/**
 * Created by MengLei on 2015/2/7.
 */

module.exports = function (req, res, errCode, content, message) {
    //设置返回值头数据
    res.setHeader('ContentType', 'text/html;charset=UTF-8');

    var result = {};
    result.code = errCode;
    switch (errCode) {
        case 0://成功
            result.content = content;
            result.message = message;
            break;
        case 1://失败
            result.message = content;
            break;
        case 8:
            result.message = content + '参数为空';
            break;
        case 9:
            result.message = 'Invalid API request.';
            break;
        case 999:
            result.message = 'API签名校验失败';
            break;
        default :
            result.message = 'Unknown Error.';
            break;
    }
    res.end(JSON.stringify(result));
};