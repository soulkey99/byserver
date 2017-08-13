/**
 * Created by MengLei on 2015/2/26.
 */

var orderStore = {};

orderStore.add = function(orderInfo){
    orderStore[orderInfo.o_id] = orderInfo;
};

orderStore.remove = function(o_id){
    if(orderStore.hasOwnProperty(o_id)){
        delete(orderStore[o_id]);
    }
};

module.exports = orderStore;