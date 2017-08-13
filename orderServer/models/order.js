/**
 * Created by MengLei on 2015/2/26.
 */

var db = require('../../config').db;
var cronJob = require('cron').CronJob;

var Order = function (order) {
    var self = this;
    this.o_id = order.o_id;
    this.s_id = order.s_id;
    this.grade = order.grade;
    this.subject = order.subject;
    this.pushDest = [];
    this.cronJob = new cronJob((new Date().getSeconds() + 1).toString() + ' * * * * *', function () {
        //
        var uidsToPush = self.pushDest;
        uidsToPush.sort(function () {
            return Math.random() - 0.5
        });
        console.log('cron job tick ' + JSON.stringify(self.pushDest));
    });
};
module.exports = Order;

Order.prototype.startPush = function () {
    var self = this;

    db.users.find({
        userType: 'teacher',
        status: 'online',
        'userInfo.teacherInfo.subject': {$in: self.subject}
    }, function (err, doc) {
        if (err) {
            //handle error
        } else {
            //筛选教师，然后向教师推送题目
            if (doc && doc.length > 0) {
                self.pushDest = doc;
                self.cronJob.start();
            }
        }
    })
}