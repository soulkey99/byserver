/**
 * Created by MengLei on 2015/8/4.
 */


var db = require('../../../../config').db;
var config = require('../../../../config');
var objectId = require('mongojs').ObjectId;
var result = require('../../../utils/result');
var log = require('../../../../utils/log').h5;


//编辑商品详情，如果没传goodId，就是新建商品
module.exports =  function(req, res){
    switch (req.body.type){
        case 'api':
            editFlowDetail(req, res);
            break;
        case 'api_hjjd':
            editHJJD(req, res);
            break;
        case 'lottery':
            editLottery(req, res);
            break;
        default :
            editNormalGoods(req, res);
            break;
    }

};


function editNormalGoods (req, res){
    //商品图片，如果没有就是空字符串
    var goodPic = [];
    if(req.body.goodPic){
        goodPic = req.body.goodPic.split(',');
    }
    //库存，如果没有就是0
    var stock = 0;
    if(req.body.stock){
        stock = parseInt(req.body.stock);
    }
    //普通商品
    var info = {
        goodName: req.body.goodName,
        price: req.body.price,
        type: req.body.type,
        deliver: req.body.deliver || '',
        stock: stock,
        validTime: parseFloat(req.body.validTime),
        goodPic: goodPic,
        avatar: req.body.avatar || '',
        goodInfo: req.body.goodInfo,
        valid: req.body.valid == 'true',
        seq: req.body.seq || 999,
        money: req.body.money || 0,
        category: req.body.category || 'default',
        city: [],
        owner: req.body.owner
    };
    var goodId = '';
    if(req.body.goodId){
        //编辑已有商品
        goodId = new objectId(req.body.goodId);
    }else{
        //增加新商品
        info.createTime = new Date().getTime();
        goodId = new objectId()
    }
    //商品可用城市
    if(req.body.city){
        info.city = req.body.city.split(',');
    } else {
        info.city = [];
    }
    //是否热门商品
    info.hot = req.body.hot == 'true';
    db.goods.update({_id: goodId}, {$set: info}, {upsert: true}, function(err, doc){
        if(err){
            //
            console.log(err);
        }else{
            result(res, {statusCode: 900});
        }
    });
}

function editFlowDetail(req, res){
    //商品图片，如果没有就是空字符串
    var goodPic = [];
    if(req.body.goodPic){
        goodPic = req.body.goodPic.split(',');
    }
    //库存，如果没有就是0
    var stock = 0;
    if(req.body.stock){
        stock = parseInt(req.body.stock);
    }
    //流量包商品
    var info = {
        goodName: req.body.goodName,
        price: req.body.price,
        type: req.body.type,
        deliver: '',
        stock: stock,
        detail:{
            good: 'flow',
            goodType: 'flow',
            quantity: req.body.flow
        },
        validTime: parseFloat(req.body.validTime),
        goodPic: goodPic,
        avatar: req.body.avatar,
        goodInfo: req.body.goodInfo,
        valid: req.body.valid == 'true',
        seq: req.body.seq || 999,
        money: req.body.money || 0,
        category: req.body.category || 'default',
        owner: req.body.owner,
        city: []
    };
    var goodId = '';
    if(req.body.goodId){
        //编辑已有商品
        goodId = new objectId(req.body.goodId);
    }else{
        //增加新商品
        info.createTime = new Date().getTime();
        goodId = new objectId()
    }
    //商品可用城市
    if(req.body.city){
        info.city = req.body.city.split(',');
    } else {
        info.city = [];
    }
    //是否热门商品
    info.hot = req.body.hot == 'true';
    db.goods.update({_id: goodId}, {$set: info}, {upsert: true}, function(err, doc){
        if(err){
            //
            console.log(err);
        }else{
            result(res, {statusCode: 900});
        }
    });
 }

function editHJJD(req, res){
    //皇家极地门票兑换
}


function editLucky(req, res){
    //抽奖类的商品
}

function editLottery(req, res) {
    //商品detail结构：{name: '', deliver: '', stock: 'int', owner: '', money: 'double', rank: 'int', probability: 'double', rankDesc: 'string'}
    var detail = [];
    if(req.body.detail) {
        try {
            detail = JSON.parse(req.body.detail);
        } catch (ex) {
            result(res, {statusCode: 942, message: ex.message});
            return;
        }
    }
    var goodPic = [];
    if (req.body.goodPic) {
        goodPic = req.body.goodPic.split(',');
    }
    //每日抽奖次数限制，默认10次，可配
    var lotteryTimes = 10;
    if(req.body.lotteryTimes){
        lotteryTimes = parseInt(req.body.lotteryTimes);
    }
    //转盘类商品
    var info = {
        goodName: req.body.goodName,
        price: req.body.price,
        type: req.body.type,
        deliver: '',
        stock: 1,   //默认写成1，但是没有什么用处
        detail: detail,
        lotteryTimes: lotteryTimes,
        validTime: parseFloat(req.body.validTime),
        goodPic: goodPic,
        avatar: req.body.avatar || '',
        goodInfo: req.body.goodInfo || '',
        valid: req.body.valid == 'true',
        seq: req.body.seq || 999,
        money: req.body.money || 0,
        category: req.body.category || 'other',
        owner: req.body.owner,
        city: []
    };
    //根据传入goodid与否判断商品是新增还是编辑已有
    var goodId = '';
    if (req.body.goodId) {
        //编辑已有商品
        goodId = new objectId(req.body.goodId);
    } else {
        //增加新商品
        info.createTime = new Date().getTime();
        goodId = new objectId()
    }
    //商品可用城市
    if(req.body.city){
        info.city = req.body.city.split(',');
    } else {
        info.city = [];
    }
    //是否热门商品
    info.hot = req.body.hot == 'true';
    db.goods.update({_id: goodId}, {$set: info}, {upsert: true}, function (err, doc) {
        if (err) {
            //
            console.log(err);
        } else {
            result(res, {statusCode: 900});
        }
    });
}
