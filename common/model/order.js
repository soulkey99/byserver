/**
 * Created by MengLei on 2015/12/3.
 */

var mongoose = require('mongoose');
var BaseModel = require('./baseModel');
var Schema = mongoose.Schema;

var OrderSchema = new Schema({
    _id: {type: Schema.Types.ObjectId},
    s_id: {type: String, default: ''},
    t_id: {type: String, default: ''},
    grade: {type: String, default: ''},
    subject: {type: String, default: ''},
    addPrice: {type: Number, default: 0},
    create_time: {type: Number, default: 0},
    q_msg: [{
        msg: {type: String, default: ''},
        type: {type: String, default: ''},
        time: {type: Number, default: 0},
        orientation: {type: String, default: 'portrait'},
        seq: {type: Number, default: 1},
        logo: {type: String, default: ''}
    }],
    chat_msg: [{
        o_id: {type: String, default: ''},
        msgid: {type: String, default: ''},
        from: {type: String, default: ''},
        to: {type: String, default: ''},
        type: {type: String, default: ''},
        status: {type: String, default: ''},
        msg: {type: String, default: ''},
        t: {type: Number, default: 0},
        logo: {type: String, default: ''},
        orientation: {type: String, default: ''}
    }],
    charge_info: {
        free: {type: Boolean, default: false},
        start: {type: Number},
        unit: {type: Number}
    },
    price: {type: Number, default: 0},
    money: {type: Number, default: 0},  //付费订单的费用
    performance: {type: Number, default: 0},    //记录订单绩效
    status: {type: String, default: ''},
    o_id: {type: String, default: ''},
    type: {type: String},   //题目类型，type=senior
    charge_time: {type: Number, default: 0},    //开始计费时间，截止计费时间取订单结束时间
    duration: {type: Number, default: 600000},
    specifyTeacher: {type: Boolean, default: false},
    start_time: {type: Number, default: 0},
    end_time: {type: Number, default: 0},
    cancel_time: {type: Number, default: 0},
    tobe_time: {type: Number, default: 0},
    stars: {type: String, default: ''},
    remark: {
        choice: {type: String, default: ''},
        content: {type: String, default: ''},
        auto: {type: Boolean, default: false}
    },
    stars_s: {type: String, default: ''},
    remark_s: {
        choice: {type: String, default: ''},
        content: {type: String, default: ''},
        auto: {type: Boolean, default: false}
    },
    badges: [{
        id: {type: String},
        name: {type: String, default: ''},
        desc: {type: String, default: ''},
        img_on: {type: String, default: ''},
        img_off: {type: String, default: ''},
        is_on: {type: Boolean, default: false}
    }],
    replyInterval: {type: Number, default: 20000},
    replyInTime: {type: Number, default: 0.6},  //及时回复比例
    off_id: {type: String, default: ''},
    money_id: {type: String, default: ''}
}, {_id: false});

OrderSchema.index({create_time: -1});
OrderSchema.index({s_id: 1});
OrderSchema.index({t_id: 1});
OrderSchema.index({status: 1});

OrderSchema.plugin(BaseModel);

OrderSchema.pre('save', function (next) {
    if (!this.o_id) {
        this.o_id = this._id.toString();
    }
    next();
});

mongoose.model('Order', OrderSchema, 'orders');