/**
 * Created by MengLei on 2015/4/10.
 */

var log = require('../../utils/log').admin;
var result = require('../utils/result');

module.exports = function (req, res) {
    log.trace('internal api route for admin server begin');

    var method = req.query.m;
    log.debug('api method: ' + method + ', body: ' + JSON.stringify(req.body));

    if (!method) {
        log.error('internal api for admin server error: method parameter is empty');
        result(res, {statusCode: 905, message: 'method null'});
        return;
    }


    switch (method) {
        case 'adminLogin':  //管理员登陆
            require('./admin/adminLogin')(req, res);
            break;
        case 'changeAdminType':
            require('./admin/changeAdminType')(req, res);
            break;
        case 'changeInfo':
            require('./admin/changeInfo')(req, res);
            break;
        case 'changePwd':
            require('./admin/changePwd')(req, res);
            break;
        case 'createAdmin':
            require('./admin/createAdmin')(req, res);
            break;
        case 'getAdminList':
            require('./admin/getAdminList')(req, res);
            break;
        case 'getTeacherListToVerify':
            require('./admin/getTeacherListToVerify')(req, res);
            break;
        case 'manageAdvertise':
            require('./admin/manageAdvertise')(req, res);
            break;
        case 'verifyTeacher':
            require('./admin/verifyTeacher')(req, res);
            break;
        case 'getUserByPhoneNum':
            require('./admin/getUserByPhoneNum')(req, res);
            break;
        case 'getPromoters':
            require('./shareCode/getPromoters')(req, res);
            break;
        case 'setPromoter':
            require('./shareCode/setPromoter')(req, res);
            break;
        case 'getStatistics':
            require('./shareCode/getStatistics')(req, res);
            break;
        case 'queryTeacherAnswerStat':
            require('./stats/queryTeacherAnswerStat')(req, res);
            break;
        case 'getInvitedUser':
            require('./shareCode/getInvitedUser')(req, res);
            break;
        case 'getTeacherStat':
            require('./stats/getTeacherStat')(req, res);
            break;
        case 'getQuestionStat':
            require('./stats/getQuestionStats')(req, res);
            break;
        case 'modifyGname':
            require('./stats/modifyGname')(req, res);
            break;
        case 'getFeedbacks':
            require('./stats/getFeedbacks')(req, res);
            break;
        case 'getQuestionCount':
            require('./stats/getQuestionCount')(req, res);
            break;
        case 'teacherStatDetail':
            require('./stats/teacherStatDetail')(req, res);
            break;


        //离线问题管理
        case 'getOfflineTopicList'://离线问题列表
            require('./offlineOrders/getOfflineTopicList')(req, res);
            break;
        case 'deleteOfflineTopic'://删除离线问题
            require('./offlineOrders/deleteTopic')(req, res);
            break;
        default:
            result(res, {statusCode: 905, message: 'invalid api name'});
            break;
    }
};