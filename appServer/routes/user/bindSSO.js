/**
 * Created by MengLei on 2015/7/15.
 */
"use strict";
const config = require('../../../config');
const db = require('../../../config').db;
const proxy = require('../../../common/proxy');
const eventproxy = require('eventproxy');
const checkSMSCode = require('../../../utils/checkSMSCode');
const result = require('../../utils/result');
const objectId = require('mongojs').ObjectId;
const log = require('../../../utils/log').http;


//用户登录后，绑定sso第三方登录信息，需要首先判断此sso信息是否已经存在于系统中，
//如果该sso信息的账号曾经创建过新的账号并且没有绑定过手机号，那么就创建关联账户
//如果该手机号没有绑定过sso信息，则可以绑定，否则不允许
//如果该sso信息已经被其他账号绑定，那么就不允许操作
module.exports = function (req, res) {
    if ((req.body.action == 'bind' || req.body.action == 'link') && req.body.ssoType == 'phone') {
        //绑定手机号、关联手机号，需要验证码
        checkSMSCode(req.body.openid, req.body.smscode, function (err, resp) {
            if (err) {
                log.trace('bindSSO, check sms code error: ' + err.message);
                return result(res, {statusCode: 905, message: err.message});
            }
            if (!resp.code) {
                //校验成功，继续
                doBind(req, res);
            } else {
                //sms code 检验失败，返回错误信息
                log.trace('check sms code error: ' + resp.error);
                result(res, {statusCode: resp.code, message: resp.error});
            }
        });
    } else {
        //其他情况不需要短信验证码
        doBind(req, res);
    }
};

function doBind(req, res) {
    proxy.User.getUserById(req.body.userID, (err, user)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        if (!user) {
            return result(res, {statusCode: 902, message: '用户不存在！'});
        }
        let ssoType = req.body.ssoType || 'qq';
        switch (req.body.action) {
            case 'unbind':
            {
                //解绑操作
                switch (ssoType) {
                    case 'phone':
                        user.phone = '';
                        break;
                    case 'qq':
                    case 'weixin':
                    case 'weibo':
                    {
                        user.sso_info[ssoType].openid = '';
                        user.sso_info[ssoType].nick = '';
                        user.sso_info[ssoType].avatar = '';
                        user.sso_info[ssoType].token = '';
                        user.sso_info[ssoType].expire = 0;
                    }
                        break;
                    default:
                        //参数不对，直接返回错误
                        result(res, {statusCode: 950, message: 'action 参数错误！'});
                        return;
                }
                user.save(function (err) {
                    if (err) {
                        return result(res, {statusCode: 905, message: err.message});
                    }
                    //绑定并保存信息成功
                    result(res, {statusCode: 900});
                });
            }
                break;
            case 'bind':
            {
                if (ssoType == 'phone') {
                    //如果要绑定的是手机号，那么判断当前用户是否有手机号，如果有的话，返回错误
                    if (user.phone) {
                        result(res, {statusCode: 957, message: '绑定手机号失败，用户已有手机号！'});
                        return;
                    }
                } else {
                    if (user.sso_info && user.sso_info[ssoType] && user.sso_info[ssoType].openid) {
                        result(res, {statusCode: 957, message: '绑定sso信息失败，用户已经绑定过！'});
                        return;
                    }
                }
                var ep = new eventproxy();
                ep.all('ssoUser', function (ssoUser) {
                    if (ssoUser) {
                        //如果要绑定的信息已经存在用户了，绑定失败
                        result(res, {statusCode: 957, message: '待绑定sso信息已经在系统中注册过，推荐使用账号关联！'});
                        return;
                    }
                    //这里执行绑定操作，也就是修改用户的信息
                    switch (ssoType) {
                        case 'phone': //如果是手机号，那么直接将手机号赋值给用户自己
                            user.phone = req.body.openid;
                            break;
                        case 'qq':
                        case 'weixin':
                        case 'weibo':
                        {
                            user.sso_info[ssoType].openid = req.body.openid;
                            user.sso_info[ssoType].nick = req.body.nick || '';
                            user.sso_info[ssoType].avatar = req.body.avatar || '';
                            user.sso_info[ssoType].token = req.body.token || '';
                            user.sso_info[ssoType].expire = parseFloat(req.body.expire || '0');
                        }
                            break;
                        default:
                            //参数不对，直接返回错误
                            result(res, {statusCode: 950, message: 'action 参数错误！'});
                            return;
                    }
                    user.save(function (err) {
                        if (err) {
                            result(res, {statusCode: 905, message: err.message});
                        } else {
                            //绑定并保存信息成功
                            result(res, {statusCode: 900});
                        }
                    });
                });
                ep.fail(function (err) {
                    result(res, {statusCode: 905, message: err.message});
                });
                proxy.User.getUserBySSO(req.body.openid, req.body.ssoType, ep.done('ssoUser'));
            }
                break;
            case 'unlink':
            {
                //解除账号关联
                proxy.User.getUserBySSO(req.body.openid, req.body.ssoType, function (err, doc) {
                    if (err) {
                        result(res, {statusCode: 905, message: err.message});
                    } else {
                        if (doc) {
                            //用户存在
                            if (doc.userID == req.body.userID) {
                                result(res, {statusCode: 958, message: '用户不能与自己解除关联！'});
                                return;
                            }
                            var ep2 = new eventproxy();
                            ep2.all('user1', 'user2', function () {
                                result(res, {statusCode: 900});
                            });
                            ep2.fail(function (err2) {
                                result(res, {statusCode: 905, message: err2.message});
                            });
                            if (doc.linkID.indexOf(req.body.userID) < 0) {
                                //未关联过，无需解除，直接返回成功
                                ep2.emit('user1');
                            } else {
                                doc.linkID.pull(req.body.userID);
                                doc.save(ep2.done('user1'));
                            }
                            if (user.linkID.indexOf(doc.userID) < 0) {
                                //未关联过，无需解除，直接返回成功
                                ep2.emit('user2');
                            } else {
                                user.linkID.pull(doc.userID);
                                user.save(ep2.done('user2'));
                            }
                        }
                    }
                });
            }
                break;
            case 'link':
            {
                //账号关联操作，两个用户互相将对方的userID加入到linkID数组中
                switch (ssoType) {
                    case 'phone':
                    case 'qq':
                    case 'weixin':
                    case 'weibo':
                    {
                        proxy.User.getUserBySSO(req.body.openid, req.body.ssoType, function (err, doc) {
                            if (err) {
                                result(res, {statusCode: 905, message: err.message});
                            } else {
                                if (doc) {
                                    //用户存在，可以关联
                                    if (doc.userID == req.body.userID) {
                                        result(res, {statusCode: 958, message: '用户不能关联自己！'});
                                        return;
                                    }
                                    var ep2 = new eventproxy();
                                    ep2.all('user1', 'user2', function () {
                                        result(res, {statusCode: 900});
                                    });
                                    ep2.fail(function (err2) {
                                        result(res, {statusCode: 905, message: err2.message});
                                    });
                                    if (doc.linkID.indexOf(req.body.userID) >= 0) {
                                        //已关联过，无需再次关联，直接返回成功
                                        ep2.emit('user1');
                                    } else {
                                        doc.linkID.push(req.body.userID);
                                        doc.save(ep2.done('user1'));
                                    }
                                    if (user.linkID.indexOf(doc.userID) >= 0) {
                                        //已关联过，无需再次关联，直接返回成功
                                        ep2.emit('user2');
                                    } else {
                                        user.linkID.push(doc._id.toString());
                                        user.save(ep2.done('user2'));
                                    }
                                } else {
                                    //用户不存在，返回错误
                                    result(res, {statusCode: 902, message: '待关联用户不存在！'});
                                }
                            }
                        });
                    }
                        break;
                    default:
                        //参数不对，直接返回错误
                        result(res, {statusCode: 950, message: 'ssoType 参数错误！'});
                        return;
                }
            }
                break;
            default:
                //参数不对，直接返回错误
                result(res, {statusCode: 950, message: 'action 参数错误！'});
                return;
        }
    });
}
