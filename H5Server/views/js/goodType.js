/**
 * Created by hjy on 2015/10/15 0015.
 */

function genDetailUrl(goodId){
    return '/detail.html?goodId=' + goodId;
}

var isEnd = false; //是否加载到最后一条
function loadGoodTypeList(category) {
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = vm.pageNum()*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.category = category;
    util.callServerFunction('getGoodList&random='+parseInt(Math.random()*10000), postObj, function (data) {
        if (data.statusCode == 900) {
            //获取商品列表成功，执行加载操作
            //vm.itemList.removeAll();
            var goodList = vm.itemListType();
            var item = {};
            for (var i = 0; i < data.goodList.length; i++) {
                item = {
                    goodId: data.goodList[i].goodId,
                    goodName: data.goodList[i].goodName,
                    avatar: data.goodList[i].avatar,
                    goodInfo: data.goodList[i].goodInfo,
                    price: data.goodList[i].price,
                    stock: data.goodList[i].stock,
                    type: data.goodList[i].type
                };
                if (data.goodList[i].type.indexOf('Lucky') > 0) {
                    item.btnTXT = '抽奖';
                } else {
                    item.btnTXT = '兑换';
                }
                if (data.goodList[i].stock > 0) {
                    item.style = '';
                    item.enabled = true;
                    item.detailUrl = 'detail.html?goodId=' + item.goodId;
                } else {
                    item.btnTXT += '已结束';
                    item.style = 'background-color: grey';
                    item.enabled = false;
                    item.detailUrl = '#';
                }
                goodList.push(item);
            }
            if(data.goodList.length > 0){
                vm.itemListType(goodList);
                $("#upload").empty();
                $("#upload").append("上拉加载更多");
            }else{
                $("#upload").empty();
                $("#upload").append("暂无更多");
                isEnd = true;
            }
            $("body").css("visibility","visible");
            $("body").addClass('animated fadeIn');
        }else{
            //获取商品列表失败
            $("#upload").empty();
            $("#upload").append("暂无更多");
        }
    });
}

function onExchange(){
    if(this.enabled) {
        window.location.href = genDetailUrl(this.goodId);
    }
}

function nextPage(){
    var category = util.getUrlParameter('category');
    vm.pageNum(vm.pageNum()+1);
    loadGoodTypeList(category);
}

function loadImg(obj){
    $(obj).prev().remove();
}

function sendLog(event, attr) {
    // 发送自定义的统计事件
    analytics.send({
        // 事件名称
        event: event,
        // 事件属性，任意数据
        attr: attr,
        // 该事件持续时间（毫秒）
        duration: 1000
    }, function (result) {
        if (result) {
            console.log('统计数据发送成功！');
        }
    });
}

var analytics = AV.analytics({
    // 设置 AppId
    appId: "593tvxmvvbzlb178tszjl1l21ewztqu805768lno6ttk5r82",
    // 设置 AppKey
    appKey: "8w60idssacdpsc0kni8vwb4jgapoy8h8ze1px0ryaxcsj35l",
    // 你当前应用或者想要指定的版本号（自定义）
    version: '2016.3.15',
    // 你当前应用的渠道或者你想指定的渠道（自定义）
    channel: '商城首页统计-'+util.serviceConfig
});
var viewModel = function(){
    this.banner = ko.observableArray();
    this.bonus = ko.observable();
    this.exchangeListUrl = ko.observable();
    this.bonusListUrl = ko.observable();
    this.sliderList = ko.observableArray();
    this.itemListType = ko.observableArray();
    this.pageSize = ko.observable(10);
    this.pageNum = ko.observable(0);
    this.onExchange = onExchange;
    this.goodClassName = ko.observable();
};
var vm = new viewModel();
ko.applyBindings(vm);

//滚动加载
$(document).ready(function() {
    FastClick.attach(document.body);
    var category = util.getUrlParameter('category');
    if(category == "xiuxian"){
        vm.goodClassName("休闲娱乐");
        $("#hotBox").css({"border-left":"5px #f07d6b solid","border-right":"5px #f07d6b solid"});
        $("#eTitle1,#eTitle2").css("color","#f07d6b");
        $("#eTitle1").text("REST");
        $("#eTitle2").text("RECREATION");
    }else if(category == "jiaoyu"){
        vm.goodClassName("教育培训");
        $("#hotBox").css({"border-left":"5px #bd74e7 solid","border-right":"5px #bd74e7 solid"});
        $("#eTitle1,#eTitle2").css("color","#bd74e7");
        $("#eTitle1").text("TRAINING");
        $("#eTitle2").text("EDUCATION");
    }else if(category == "shenghuo"){
        vm.goodClassName("生活服务");
        $("#hotBox").css({"border-left":"5px #57cc65 solid","border-right":"5px #57cc65 solid"});
        $("#eTitle1,#eTitle2").css("color","#57cc65");
        $("#eTitle1").text("REST");
        $("#eTitle2").text("RECREATION");
    }else if(category == "canyin"){
        vm.goodClassName("餐饮美食");
        $("#hotBox").css({"border-left":"5px #f97a2d solid","border-right":"5px #f97a2d solid"});
        $("#eTitle1,#eTitle2").css("color","#f97a2d");
        $("#eTitle1").text("DRINK");
        $("#eTitle2").text("FOOD");
    }
    sendLog("访问商城商品分类-"+util.serviceConfig, {分类名称: vm.goodClassName()});
    loadGoodTypeList(category);
    vm.bonusListUrl('./bonusList.html');
    vm.exchangeListUrl('./exchangeList.html');
    $(window).scroll(function(){
        if($(document).scrollTop() >= $(document).height() - $(window).height() && !isEnd) {
            sendLog("加载更多商品-"+util.serviceConfig, {商品类型: util.getUrlParameter('category')});
            $("#upload").empty();
            $("#upload").append("正在加载...");
            nextPage();
        }
    });
});