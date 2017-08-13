/**
 * Created by MengLei on 2015/12/4.
 */
"use strict";
const model = require('../../model');
const initTeacherGrades = require('../../../config').initTeacherGrades;
const ObjectId = require('mongoose').Types.ObjectId;
const eventproxy = require('eventproxy');
const User = model.User;
const UserSecure = model.UserSecure;
const Follow = require('./follow');
const OfflineAnswer = require('./../offlineTopics/offlineAnswer');

/**
 * 根据用户手机号列表查找用户列表
 * Callback:
 * - err, 数据库异常
 * - users, 用户列表
 * @param {Array} phones 用户手机号list
 * @param {Function} callback 回调函数
 */
exports.getUsersByPhones = function (phones, callback) {
    if (phones && phones.length == 0) {
        return callback(null, []);
    }
    User.find({phone: {$in: phones}}, callback);
};

/**
 * 根据用户手机号查找用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} phone 用户手机号
 * @param {Function} callback 回调函数
 */
exports.getUserByPhone = function (phone, callback) {
    User.findOne({phone: phone}, callback);
};

/**
 * 根据用户手机号查找用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} id 用户id
 * @param {Function} callback 回调函数
 */
exports.getUserById = function (id, callback) {
    User.findById(id, callback);
};

/**
 * 根据用户手机号列表查找用户列表
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {Array} ids 用户id列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByIds = function (ids, callback) {
    User.find({_id: {$in: ids}}, callback);
};

/**
 * 根据用户id给用户增加一定量的积分
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} id 用户id
 * @param {Number} bonus 修改积分量
 */
exports.incBonus = function (id, bonus) {
    User.update({_id: id}, {$inc: {'userInfo.bonus': bonus}}, function () {
    });
};

/**
 * 根据用户id给教师端用户增加一定量的余额
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} id 用户id
 * @param {Number} money 修改余额数量
 */
exports.incMoney = function (id, money) {
    User.update({_id: id}, {$inc: {'userInfo.money_info.money': money}}, function () {
    });
};

/**
 * 根据用户id给用户(提现中金额)增加一定量的余额
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} id 用户id
 * @param {Number} money 修改余额数量
 */
exports.incWithdrawingMoney = function (id, money) {
    User.update({_id: id}, {$inc: {'userInfo.money_info.withdrawing': money}}, function () {
    });
};

/**
 * 用户提现成功，将withdrawing部分的金额转至withdrawn内
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} id 用户id
 * @param {Number} money 修改余额数量
 */
exports.withdrawSuccess = function (id, money) {
    User.update({_id: id}, {
        $inc: {
            'userInfo.money_info.withdrawn': money,
            'userInfo.money_info.withdrawing': (0 - money)
        }
    }, function () {
    });
};

/**
 * 用户提现失败，将withdrawing部分的金额转至money内
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} id 用户id
 * @param {Number} money 修改余额数量
 */
exports.withdrawFail = function (id, money) {
    User.update({_id: id}, {
        $inc: {
            'userInfo.money_info.money': money,
            'userInfo.money_info.withdrawing': (0 - money)
        }
    }, function () {
    });
};

/**
 * 根据用户id给用户(已经提现)增加一定量的余额
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} id 用户id
 * @param {Number} money 修改余额数量
 */
exports.incWithdrawnMoney = function (id, money) {
    User.update({_id: id}, {$inc: {'userInfo.money_info.withdrawn': money}}, function () {
    });
};

/**
 * 根据用户id给学生端用户充值一定量的余额
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} id 用户id
 * @param {Number} money 修改余额数量
 */
exports.incStudentMoney = function (id, money) {
    User.update({_id: id}, {$inc: {'userInfo.money': money}}, function () {
    });
};

/**
 * 根据用户id列表查找用户列表
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {Array} ids 用户id列表
 * @param {Function} callback 回调函数
 */
exports.getUsersByIds1 = function (ids, callback) {
    User.find({_id: {$in: ids}}, callback);
};

/**
 * 根据特性query条件查找用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {Object} query 用户搜索条件
 * @param {Object} opt 查询条件
 * @param {Function} callback 回调函数
 */
exports.getUsersByQuery = function (query, opt, callback) {
    User.find(query, '', opt, callback);
};

/**
 * 根据用户第三方登录信息查找用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} openid 用户第三方登录openid
 * @param {String} ssoType 用户第三方登录类型(默认qq)
 * @param {Function} callback 回调函数
 */
exports.getUserBySSO = function (openid, ssoType, callback) {
    var query = {};
    if (ssoType == 'phone') { //此处为了兼容考虑，如果ssoType = phone，那么就按照正常的查找手机号来进行操作
        query = {phone: openid};
    } else {
        query['sso_info.' + ssoType + '.openid'] = openid;
    }
    User.findOne(query, callback);
};

/**
 * 设置用户提现信息
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {Object} param 输入参数 {userID: '', type: '', id: '', name: '', action: ''}
 * @param {Function} callback 回调函数
 */
exports.setWithdrawInfo = function (param, callback) {
    User.findOne({_id: param.userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback(null, false);
        }
        if (param.action == 'un') {
            for (var i = 0; i < doc.withdraw_info.length; i++) {
                if (doc.withdraw_info[i].type == param.type) {
                    doc.withdraw_info.splice(i, 1);
                }
            }
        } else {
            var needPush = true;
            for (var j = 0; j < doc.withdraw_info.length; j++) {
                if (doc.withdraw_info[j].type == param.type) {
                    needPush = false;
                    doc.withdraw_info.splice(j, 1, {type: param.type, id: param.id, name: param.name, t: Date.now()});
                }
            }
            if (needPush) {
                doc.withdraw_info.push({type: param.type, id: param.id, name: param.name, t: Date.now()});
            }
        }
        doc.save(callback);
    });
};


/**
 * 根据用户userID设置密保问题
 * 暂时密保问题：1:，2:，3:。
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {Object} param 输入参数，param = {userID: '', answer1: '', answer2: '', answer3: ''}
 * @param {Function} callback 回调函数
 */
exports.setSecureQuestions = function (param, callback) {
    UserSecure.findOne({_id: param.userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            doc = new UserSecure({
                _id: param.userID,
                answer1: param.answer1,
                answer2: param.answer2,
                answer3: param.answer3,
                createTime: Date.now()
            });
        } else {
            doc.answer1 = param.answer1;
            doc.answer2 = param.answer2;
            doc.answer3 = param.answer3;
        }
        doc.save(callback);
    });
};


/**
 * 根据用户userID清空密保问题
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} userID
 * @param {Function} callback 回调函数
 */
exports.clearSecureQuestions = function (userID, callback) {
    UserSecure.findOne({_id: userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            doc = new UserSecure({_id: userID, answer1: '', answer2: '', answer3: '', createTime: Date.now()});
        } else {
            doc.answer1 = '';
            doc.answer2 = '';
            doc.answer3 = '';
        }
        doc.save(callback);
    });
};


/**
 * 根据用户userID获取密保问题
 * 暂时密保问题：1:，2:，3:。
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} userID
 * @param {Function} callback 回调函数
 */
exports.getSecureQuestions = function (userID, callback) {
    UserSecure.findOne({_id: userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        var resp = {answer1: '', answer2: '', answer3: ''};
        if (doc) {
            resp.answer1 = doc.answer1;
            resp.answer2 = doc.answer2;
            resp.answer3 = doc.answer3;
        }
        callback(null, resp);
    });
};


/**
 * 根据用户userID校验密保问题
 * 暂时密保问题：1:，2:，3:。
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {Object} param 输入参数，param = {userID: '', answer1: '', answer2: '', answer3: ''}
 * @param {Function} callback 回调函数
 */
exports.checkSecureQuestions = function (param, callback) {
    UserSecure.findOne({_id: param.userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            return callback();
        }
        return callback(null, {
            answer1: param.answer1 == doc.answer1,
            answer2: param.answer2 == doc.answer2,
            answer3: param.answer3 == doc.answer3
        });
    });
};


/**
 * 根据用户userID设置支付密码
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {Object} param 输入参数，param = {userID: '', passwd: ''}
 * @param {Function} callback 回调函数
 */
exports.setPayPasswd = function (param, callback) {
    UserSecure.findOne({_id: param.userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            doc = new UserSecure({_id: param.userID, passwd: param.passwd, createTime: Date.now()});
        } else {
            doc.passwd = param.passwd;
        }
        doc.save(callback);
    });
};

/**
 * 根据用户userID校验支付密码
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {Object} param 输入参数，param = {userID: '', passwd: ''}
 * @param {Function} callback 回调函数
 */
exports.checkPayPasswd = function (param, callback) {
    UserSecure.findOne({_id: param.userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, !!(doc && doc.passwd == param.passwd));
    });
};


/**
 * 根据用户userID清除支付密码
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} userID
 * @param {Function} callback 回调函数
 */
exports.clearPayPasswd = function (userID, callback) {
    UserSecure.findOne({_id: userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        if (!doc) {
            doc = new UserSecure({
                _id: userID,
                answer1: '',
                answer2: '',
                answer3: '',
                passwd: '',
                createTime: Date.now()
            });
        } else {
            doc.passwd = '';
        }
        doc.save(callback);
    });
};

/**
 * 根据用户userID检查是否设置过支付密码、密保问题
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {Object} param 输入参数，param = {userID: ''}
 * @param {Function} callback 回调函数
 */
exports.checkSecure = function (param, callback) {
    UserSecure.findOne({_id: param.userID}, function (err, doc) {
        if (err) {
            return callback(err);
        }
        callback(null, {
            passwd: (!!doc && !!doc.passwd),
            questions: (!!doc && (!!doc.answer1 && !!doc.answer2 && !!doc.answer3))
        });
    });
};

/**
 * 获取一个游戏中使用的AI
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {Object} param 输入参数
 * @param {Function} callback 回调函数
 */
exports.getAI = function (param, callback) {
    if (!callback) {
        callback = function () {
        };
    }
    var query = {userType: 'gameAI'};
    if (param.iq) {
        query['iq'] = {'userInfo.iq': {$gte: param.iq}};
    }
    User.aggregate([{$match: query}, {$sample: {size: 1}}], function (err, doc) {
        if (err) {
            return callback(err);
        }
        //由于返回值是一个数组，所以此处取第一项
        callback(null, doc[0]);
    });
};

/**
 * 根据用户userID移除用户记录
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} id 用户userID
 * @param {Function} callback 回调函数
 */
exports.removeUserByID = function (id, callback) {
    User.remove({_id: id}, callback);
};

/**
 * 根据用户userID获取社交方面的信息
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} userID “我”的userID
 * @param {String|Function} u_id 用户userID
 * 参数策略：1、两个参数：第一个userID和第二个callback，获取该用户的信息
 *           2、三个参数：userID不为空，u_id为空，同两个参数情形。
 *                        userID不为空，u_id不为空，取u_id的信息，并判断userID与该用户的关系
 *                        userID为空，u_id不为空，取u_id的信息
 *                        userID与u_id同时为空，直接返回null
 * @param {Function} [callback] 回调函数
 */
exports.getUserSocialInfo = function (userID, u_id, callback) {
    if (callback == undefined && typeof u_id == 'function') {
        callback = u_id;
        u_id = userID;
    } else if (!!userID && !u_id && typeof callback == 'function') {
        u_id = userID;
    } else if (!userID && !u_id) {
        return callback();
    }
    // u_id = u_id || userID;//如果u_id为空，那么取userID的值
    User.findById(u_id, (err, user) => {
        if (err) {
            return callback(err);
        }
        if (!user) {
            return callback();
        }
        var info = {
            userID: user.userID,
            nick: user.nick,
            avatar: user.userInfo.avatar,
            userType: user.userType,
            intro: user.intro || '这个人很懒，什么也没留下...'
        };
        if (info.userType == 'public') {
            info.verify_type = user.userInfo.verify_info.verify_type;
            let ep = eventproxy.create('followers', 'followed', function (followers, followed) {
                info.followers = followers;
                info.followed = followed;
                callback(null, info);
            });
            ep.fail(callback);
            //被多少人关注
            Follow.getFollowersCount(u_id, ep.done('followers'));
            //“我”是否关注此人
            Follow.isFollowing(userID, u_id, ep.done('followed'));
        } else {
            //如果是普通用户
            let ep = eventproxy.create('following', 'followed', 'followers', 'ups', 'collect', function (following, followed, followers, ups, collect) {
                info.following = following;
                info.followers = followers;
                info.followed = followed;
                info.ups = ups;
                info.collect = collect;
                if (info.userType == 'teacher') {
                    //如果用户类型是教师，那么返回教师认证状态
                    info.verify_type = user.userInfo.teacher_info.verify_type;
                }
                callback(null, info);
            });
            ep.fail(callback);
            //关注了多少人
            Follow.getFollowingCount(u_id, ep.done('following'));
            //被多少人关注
            Follow.getFollowersCount(u_id, ep.done('followers'));
            //“我”是否关注此人
            Follow.isFollowing(userID, u_id, ep.done('followed'));
            //回答了多少问题，获得了多少赞，答案被多少收藏
            OfflineAnswer.getOfflineAnswersByQuery({author_id: u_id}, {
                ups: 1,
                collect: 1
            }, {}, function (err2, answers) {
                if (err2) {
                    return ep.throw(err2);
                }
                var ups = 0;
                var collect = 0;
                for (var i = 0; i < answers.length; i++) {
                    ups += answers[i].ups.length;
                    collect += answers[i].collect;
                }
                ep.emit('ups', ups);
                ep.emit('collect', collect);
            });
        }
    });
};

/**
 * 根据用户userID修改用户信息
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * @param {String} id 用户userID
 * @param {Object} info 待修改的用户信息
 * @param {Function} callback 回调函数
 */
exports.changeUserInfoByID = function (id, info, callback) {
    var setObj = {};
    if (info.nick != undefined) { //昵称
        setObj['nick'] = info.nick;
    }
    if (info.intro != undefined) {
        setObj['intro'] = info.intro;
    }
    if (info.autoReply != undefined) {    //教师接单后的自动回复
        setObj.autoReply = info.autoReply;
    }
    if (info.name != undefined) {  //姓名
        setObj['userInfo.name'] = info.name;
        //console.log('set name: ' + info.name);
    }
    if (info.family_name != undefined) {  //姓名
        setObj['userInfo.family_name'] = info.family_name;
    }
    if (info.given_name != undefined) {  //姓名
        setObj['userInfo.given_name'] = info.given_name;
    }
    if (info.avatar != undefined) {  //姓名
        setObj['userInfo.avatar'] = info.avatar;
    }
    if (info.gender != undefined) {  //性别
        setObj['userInfo.gender'] = info.gender;
    }
    if (info.id_no != undefined) {  //身份证号
        setObj['userInfo.id_no'] = info.id_no;
    }
    if (info.age != undefined) {  //年龄
        setObj['userInfo.age'] = info.age;
    }
    if (info.birthday != undefined) {  //出生日期
        setObj['userInfo.birthday'] = info.birthday;
    }
    if (info.country != undefined) {  //国家
        setObj['userInfo.address.country'] = info.country;
    }
    if (info.province != undefined) {  //省份
        setObj['userInfo.address.province'] = info.province;
    }
    if (info.city != undefined) {  //城市
        setObj['userInfo.address.city'] = info.city;
    }
    if (info.region != undefined) {  //区
        setObj['userInfo.address.region'] = info.region;
    }
    if (info.address != undefined) {  //地址
        setObj['userInfo.address.address'] = info.address;
    }
    if (info.school != undefined) {  //
        setObj['userInfo.school'] = info.school;
    }
    if (info.grade != undefined) {  //年级只是一个string，小学、初中、高中三种类型
        setObj['userInfo.student_info.grade'] = info.grade;
    }
    if (info.grades != undefined) {  //年级这里传上来的是一个object
        try {
            setObj['userInfo.teacher_info.grades'] = JSON.parse(info.grades);
        } catch (ex) {
            //log.error('change teacher info error: ' + ex.message);
        }
    }
    User.update({_id: id}, setObj, callback);
};

/**
 * 创建新用户
 * Callback:
 * - err, 数据库异常
 * - users, 用户信息
 * * @param {Object} info 用户信息(phone, nick, )
 * @param {Function} callback 回调函数
 */
exports.createNewUser = function (info, callback) {
    var user = new User();
    //主键_id如果没传就默认生成一个
    if (info._id != undefined) {
        user._id = info._id;
    } else {
        user._id = new ObjectId();
    }
    //昵称
    if (info.nick != undefined) {
        user.nick = info.nick;
    }
    //手机号
    if (info.phone != undefined) {
        user.phone = info.phone;
    }
    //authSign
    if (info.authSign != undefined) {
        user.authSign = info.authSign;
    } else {
        //如果没传authSign，那么要默认生成一个
        user.authSign = require('crypto').randomBytes(16).toString('hex');
    }
    //用户状态
    if (info.status != undefined) {
        user.status = info.status;
    }
    //用户姓名
    if (info.name != undefined) {
        user.userInfo.name = info.name;
    }
    //密码
    if (info.passwd != undefined) {
        user.passwd = info.passwd;
    }
    //用户类型
    if (info.userType != undefined) {
        user.userType = info.userType;
    }
    //头像
    if (info.avatar != undefined) {
        user.userInfo.avatar = info.avatar;
    }
    //是否首次登录
    if (info.first != undefined) {
        user.ext_info.first = info.first;
    }
    //邀请码
    if (info.promoterShareCode != undefined) {
        user.ext_info.promoterShareCode = info.promoterShareCode;
    }
    //sso登录类型
    if (info.ssoType != undefined) {
        var ssoType = info.ssoType || 'qq';
        //如果传了ssoType，那么就认为是sso登录创建用户
        if (info.sso_openid != undefined) {  //openid
            user.sso_info[ssoType]['openid'] = info.sso_openid;
        }
        if (info.sso_token != undefined) {   //sso token
            user.sso_info[ssoType]['token'] = info.sso_token;
        }
        //对于创建新用户来说，昵称和头像直接取sso的昵称和头像
        if (info.sso_nick != undefined) {    //sso 昵称
            user.sso_info[ssoType]['nick'] = info.sso_nick;
            user.nick = info.sso_nick;
        }
        if (info.sso_avatar != undefined) {  //sso 头像
            user.sso_info[ssoType]['avatar'] = info.sso_avatar;
            user.userInfo.avatar = info.sso_avatar;
        }
        if (info.sso_expire != undefined) {  //sso登录过期时间
            user.sso_info[ssoType]['expire'] = info.sso_expire;
        }
        //通过sso登录创建的用户，默认status=online
        user.status = 'online';
    }

    user.userInfo.teacher_info.grades = initTeacherGrades;
    user.save(callback);
};