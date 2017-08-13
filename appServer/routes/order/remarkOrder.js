/**
 * Created by MengLei on 2015/3/15.
 */

var config = require('../../../config');
var result = require('../../utils/result');
var log = require('../../../utils/log').http;
var dnode = require('../../utils/dnodeClient');
var zrpc = require('../../../utils/zmqClient');

//评价订单param={o_id: '', stars: '', choice: '', content: '', userID: ''}，订单id，评价星级，选项，内容，用户id
module.exports = function (req, res) {
    //回答结束之后，学生评价教师
    var param = {userID: req.body.userID, o_id: req.body.o_id, choice: req.body.choice, content: req.body.content, stars: req.body.stars};
    zrpc('orderServer', 'remarkOrder2', param, function(err, resp){
        if(err){
            log.error('remark order error: ' + err.message);
            result(res, {statusCode: resp || 905, message: err.message});
        }else {
            log.trace('remark order success.');
            result(res, {statusCode: 900});
        }
    });
};
