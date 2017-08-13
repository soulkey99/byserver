/**
 * Created by MengLei on 2015/8/14.
 */

var timer = require('../instantOrder/timer');
var config = require('./../../config');

//各种定时任务
require('./hourlyTask').start();   //每小时扫描一次数据库，把僵尸单去除掉
require('./dailyTask').start();    //每天扫面数据库，对未完成订单自动评价

//数据统计任务，离线订单每小时计算一次各种权重数据
//require('./../offlineAnswer/rank/hourlyTask').start();

//自动恢复任务，程序挂掉之后，将未完成的订单所对应的定时器全都恢复
config.db.orders.find({status: {$in: ['pending', 'received', 'toBeFinished']}}, {_id: 1}, function(err, doc){
    if(err){
        //handle error
    }else{
        for(var i=0; i<doc.length; i++){
            new timer(doc[i]._id.toString());
        }
    }
});
