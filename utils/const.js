/**
 * Created by MengLei on 2015/2/7.
 */

//枚举错误码
var constErrCode = {
    success: 0,//操作成功
    notSuccess: 1,//操作失败
    apiMethodNull: 2,//API method为空

    argumentsNull: 8,//某项参数为空

    invalidAPI: 9,//无效API

    checkSignatureErr: 999,//api签名校验失败

    sessionExpired: 100011,//session过期

    sidExpired: 100011,//sid过期
    sidNotExists: 100022,//sid不存在
    sidError: 100023,//sid错误

    imageTypeNotSupported: 900031,//不支持的图片类型


    databaseConnectionError: 800001,//数据库链接错误
    dataTableConnectionError: 800002,//数据表链接错误
    dataTableSelectionError: 800003,//数据表查询失败

    APIdeprecated: 999998,//API弃用
    uncaughtException: 999999//异常
};

var constErrMessage = {
    checkSignatureErr: 'api签名校验失败',
    getBookListErr: '获取书籍列表失败'
};

exports.constErrCode = constErrCode;
exports.constErrMessage = constErrMessage;