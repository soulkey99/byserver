/**
 * Created by MengLei on 2015/12/23.
 */

var objectId = require('mongoose').Types.ObjectId;

//给每条记录做提前校验，如果没有_id的话就主动加上，否则没办法保存
module.exports = exports = function (schema) {
    //保存记录前，将_id字段赋值
    schema.pre('save', function (next) {
        if(!this._id){
            this._id = new objectId();
        }
        next();
    });
};
