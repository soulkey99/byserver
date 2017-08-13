/**
 * Created by MengLei on 2015/12/4.
 */

var mongoose = require('mongoose');
var config = require('../../config');
mongoose.Promise = require('bluebird');

//数据库连接以及export model
mongoose.connect(config.mongoUrl, function (err) {
    if (err) {
        console.error('connect to %s error: ', config.mongoUrl, err.message);
        process.exit(1);
    }
});
//mongoose.createConnection(config.mongoUrl, {
//    'server': {
//        'poolSize': 10,
//        'socketOptions': {
//            'keepAlive': 1
//        },
//        'auto_reconnect': true
//    }
//});

//register models
require('./user/user');
require('./user/beta');
require('./user/userConf');
require('./user/fastReply');
require('./user/follow');
require('./order');
require('./offlineTopics/offlineTopic');
require('./user/pushToken');
require('./offlineTopics/tags');
require('./offlineTopics/topicWatch');
require('./offlineTopics/topicCollect');
require('./offlineTopics/offlineAnswer');
require('./offlineTopics/answerCollect');
require('./offlineTopics/offlineAnsReply');
require('./offlineTopics/rankData');
require('./offlineTopics/offlineOperate');
require('./battleQuestion');
require('./user/msgbox');
require('./user/msgStatus');
require('./feedback');
require('./bonus');
require('./money');
require('./advertise');
require('./user/gsList');
require('./gradeSubject');
require('./other/share');
require('./game/user');
require('./game/battle');
require('./game/level');
require('./game/userRecord');
require('./game/mission');
require('./game/achievement');
require('./study/question');
require('./study/point');
require('./study/exercise');
require('./study/catalog');
require('./study/version');
require('./other/activity');
require('./admin/admin');

//export models to be used
module.exports = {
    User: mongoose.model('User'),
    Admin: mongoose.model('Admin'),
    UserConf: mongoose.model('UserConf'),
    FastReply: mongoose.model('FastReply'),
    UserSecure: mongoose.model('UserSecure'),
    UserFollowing: mongoose.model('UserFollowing'),
    UserFollowers: mongoose.model('UserFollowers'),
    PushToken: mongoose.model('PushToken'),
    Order: mongoose.model('Order'),
    OfflineTags: mongoose.model('OfflineTags'),
    OfflineTopic: mongoose.model('OfflineTopic'),
    TopicWatch: mongoose.model('TopicWatch'),
    TopicCollect: mongoose.model('TopicCollect'),
    OfflineAnswer: mongoose.model('OfflineAnswer'),
    AnswerCollect: mongoose.model('AnswerCollect'),
    OfflineAnsReply: mongoose.model('OfflineAnsReply'),
    OfflineClick: mongoose.model('OfflineClick'),
    OfflineCollect: mongoose.model('OfflineCollect'),
    OfflineWatch: mongoose.model('OfflineWatch'),
    OfflineReply: mongoose.model('OfflineReply'),
    OfflineOperate: mongoose.model('OfflineOperate'),
    BattleQuestion: mongoose.model('BattleQuestion'),
    Msgbox: mongoose.model('Msgbox'),
    MsgStatus: mongoose.model('MsgStatus'),
    Bonus: mongoose.model('Bonus'),
    Feedback: mongoose.model('Feedback'),
    Money: mongoose.model('Money'),
    Advertise: mongoose.model('Advertise'),
    GameUser: mongoose.model('GameUser'),
    GameLevel: mongoose.model('GameLevel'),
    GameUserRecord: mongoose.model('GameUserRecord'),
    GameUserRecordHistory: mongoose.model('GameUserRecordHistory'),
    GameMission: mongoose.model('GameMission'),
    GameAchievement: mongoose.model('GameAchievement'),
    Battle: mongoose.model('Battle'),
    Beta: mongoose.model('Beta'),
    GradeSubject: mongoose.model('GradeSubject'),
    Share: mongoose.model('Share'),
    GSList: mongoose.model('gsList'),
    Activity: mongoose.model('Activity'),
    StudyQuestion: mongoose.model('StudyQuestion'),
    StudyPoint: mongoose.model('StudyPoint'),
    StudyExercise: mongoose.model('StudyExercise'),
    StudyChapter: mongoose.model('StudyChapter'),
    StudySection: mongoose.model('StudySection'),
    StudyVersion: mongoose.model('StudyVersion')
};



