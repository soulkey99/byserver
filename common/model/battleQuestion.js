/**
 * Created by MengLei on 2015/12/15.
 */

var mongoose = require('mongoose');
var objectId = mongoose.Types.ObjectId;
var BaseModel = require('./baseModel');
var Schema = mongoose.Schema;

var SubItemSchema = new Schema({    //问题、选项的item，都是同样的结构，可能包含文字、语音、图片，其中文字是必选项
    msg: {type: String, default: ''},
    type: {type: String, default: ''},
    time: {type: Number},
    orientation: {type: String},
    seq: {type: Number, default: 1},
    logo: {type: String}
});

var ChoiceContentSchema = new Schema({
    msg: {type: String, default: ''},       //内容
    type: {type: String, default: ''},
    time: {type: Number},
    orientation: {type: String},
    seq: {type: Number, default: 1},
    logo: {type: String}
});

var ChoiceSubSchema = new Schema({     //选项(每个选项是一个数组)
    flag: {type: String, default: ''},      //选项A、B、C、D
    next: {type: String},   //下一级题目的id
    content: {type: [SubItemSchema]}
});

var BattleQuestionSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    tag: {type: [String], default: []},         //标签
    type: {type: String, default: 'default'},   //问题类型（对战游戏问题(default)、诱导式教学问题(inspire)、诱导式教学问题子问题(subinspire)等等）
    category: {type: String, default: []},      //分类
    difficulty: {type: Number, default: 0},     //难度，0至99
    copyRight: {type: String, default: '来自网络！'},    //版权信息
    question: {type: [SubItemSchema]},
    choice: {type: [ChoiceSubSchema]},
    layout: {type: String, default: 'default'},     //选项布局，默认一列四行
    answer: {type: String, default: ''},                //答案
    contributor: {type: String, default: ''},           //贡献者
    createTime: {type: Number, default: 0},    //创建时间
    updateTime: {type: Number, default: 0},    //更新时间
    valid: {type: Boolean, default: false},  //上线状态
    status: {type: String, default: 'waitingVerify'},
    lastVerify: {type: String, default: ''},    //最后操作审核的管理员
    presence: {type: Number, default: 0},      //题目出现过多少次
    correct: {type: Number, default: 0}         //答对过多少次
});

BattleQuestionSchema.plugin(BaseModel);

BattleQuestionSchema.pre('save', function(next) {
    if (!this.contributor) {
        this.status = 'verified';
    }
    next();
});

BattleQuestionSchema.virtual('question_id').get(function(){
    return this._id.toString();
});

ChoiceSubSchema.virtual('choice_id').get(function() {
    if(this._id) {
        return this._id.toString();
    }
    return '';
});

BattleQuestionSchema.index({'type': 1});
BattleQuestionSchema.index({'valid': 1});
BattleQuestionSchema.index({'createTime': -1});
BattleQuestionSchema.index({'question.msg': 1});
BattleQuestionSchema.index({'choice.content.msg': 1});

mongoose.model('BattleQuestion', BattleQuestionSchema, 'battleQuestions');
