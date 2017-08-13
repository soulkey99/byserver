/**
 * Created by MengLei on 2015/12/20.
 */

var mongoose = require('mongoose');
var BaseModel = require('./baseModel');
var Schema = mongoose.Schema;

var FeedbackSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    userID: {type: String, default: ''},
    stars: {type: String},
    type: {type: String, default: 'text'},
    content: {type: String, default: ''},
    orientation: {type: String},
    duration: {type: Number},
    nick: {type: String},
    direction: {type: String, default: 'u2a'},  //反馈信息的流向，u2a：用户向管理员，a2u：管理员向用户
    email: {type: String},
    qq: {type: String, default: ''},
    platform: {type: String},
    os_version: {type: String},
    userType: {type: String, default: ''},
    client_version: {type: String},
    channel: {type: String},
    time: {type: Number},   //回复时间
    read: {type: Boolean, default: false}    //管理员是否已读
});

FeedbackSchema.plugin(BaseModel);

FeedbackSchema.pre('save', function(next) {
    this.time = Date.now();
    if (this.type == 'text') {
        this.orientation = undefined;
        this.duration = undefined;
    } else if (this.type == 'voice') {
        this.orientation = undefined;
    } else if (this.type == 'image') {
        this.duration = undefined;
    }
    if(this.direction == 'a2u'){
        //如果是管理员回复用户的消息，那么强制设置成已读，并设置默认昵称
        this.read = true;
        this.nick = 'CallCall教师客服';
    }
    next();
});

FeedbackSchema.virtual('feedback_id').get(function(){
    return this._id.toString();
});

//FeedbackSchema.virtual('time_str').get(function(){
//    var t = new Date(this.time);
//    return t.getFullYear() + '/' + (t.getMonth() + 1) + '/' + t.getDate();
//});

mongoose.model('Feedback', FeedbackSchema, 'feedbacks');

