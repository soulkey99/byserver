/**
 * Created by MengLei on 2015/12/11.
 */

var mongoose = require('mongoose');
var objectId = require('mongoose').Types.ObjectId;
var Schema = mongoose.Schema;

var UserFollowingSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    list: {type: [String], default: []},
    pubList: {type: [String], default: []}
});

mongoose.model('UserFollowing', UserFollowingSchema, 'userFollowing');
