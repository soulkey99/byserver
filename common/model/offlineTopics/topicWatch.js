/**
 * Created by MengLei on 2015/12/10.
 */

var mongoose = require('mongoose');
var BaseModel = require('../baseModel');
var Schema = mongoose.Schema;

var TopicWatchSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    off_id: {type: String, default: ''},
    userID: {type: String, default: ''},
    time: {type: Number, default: 0}
});

TopicWatchSchema.plugin(BaseModel);

TopicWatchSchema.pre('save', function (next) {
    if (!this.time) {
        this.time = Date.now();
    }
    next();
});

TopicWatchSchema.index({off_id: 1});
TopicWatchSchema.index({userID: 1});

mongoose.model('TopicWatch', TopicWatchSchema, 'topicWatch');
