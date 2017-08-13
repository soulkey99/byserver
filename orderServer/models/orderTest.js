/**
 * Created by MengLei on 2015/2/26.
 */

var Order = require('./order');

var order = new Order({o_id: '103', s_id: 'a2'});
order.startPush();