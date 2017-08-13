/**
 * Created by MengLei on 2015/12/11.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserFollowersSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    list: {type: [String], default: []}
});

mongoose.model('UserFollowers', UserFollowersSchema, 'userFollowers');
