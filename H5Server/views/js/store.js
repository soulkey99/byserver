/**
 * Created by MengLei on 2015/7/20.
 */

function genDetailUrl(goodId){
    return '/detail.html?goodId=' + goodId;
}

function loadBanner() {
    util.callServerFunction('getHomeBanner', {}, function (data) {
        var list = [];
        if (data.statusCode == 900) {
            for (var i = 0; i < data.banner.length; i++) {
                var option = {};
                option.index = i;
                option.src = data.banner[i].imgsrc;
                option.title = data.banner[i].text;
                if(data.banner[i].action == "detail"){
                    option.link = '/detail.html?goodId=' + data.banner[i].dest;
                }else if(data.banner[i].action == "lottery"){
                    option.link = '/lottery/rotate.html?goodId=' + data.banner[i].dest;
                }else{
                    option.link = data.banner[i].dest;
                }
                list.push(option);
            }
            vm.banner(list);
            initJssor();
        } else {
            for (var i = 0; i < 11; i++) {
                if ((i + 1) < 10) {
                    list.push({index: i, src: "http://www.jssor.com/img/landscape/0" + (i + 1) + ".jpg"});
                } else {
                    list.push({index: i, src: "http://www.jssor.com/img/landscape/" + (i + 1) + ".jpg"});
                }
            }
            vm.banner(list);
        }
    })
}

function onClickBannerImg(){
    if(this.link!=""){
        window.location.href = this.link;
    }
}

function loadBonus(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    util.callServerFunction('getUserInfo', postObj, function (data) {
        if(data.statusCode == 900){
            vm.bonus(data.info.bonus);
        }else if(data.statusCode == 903){
            util.removeSessionStorage("userID");
            util.removeSessionStorage("authSign");
        }else{
            //获取商品列表失败
        }
    });
}

var isEnd = false; //是否加载到最后一条
function loadGoodList() {
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = vm.pageNum();
    postObj.pageSize = vm.pageSize();
    postObj.category = "";
    util.callServerFunction('getGoodList&random='+parseInt(Math.random()*10000), postObj, function (data) {
        if(data.statusCode == 900){
            //获取商品列表成功，执行加载操作
            //vm.itemList.removeAll();
            var date = new Date();
            var goodList = vm.itemList();
            var item = {};
            for (var i = 0; i < data.goodList.length; i++) {
                item = {
                    goodId: data.goodList[i].goodId,
                    goodName: data.goodList[i].goodName,
                    avatar: data.goodList[i].avatar,
                    goodInfo: data.goodList[i].goodInfo,
                    price: data.goodList[i].price,
                    stock: data.goodList[i].stock,
                    type: data.goodList[i].type,
                    category: data.goodList[i].category
                };
                item.detailUrl = "javascript:void(0)";
                if(data.goodList[i].type=="lottery"){
                    item.btnTXT = '抽 奖'; //点这里，良辰必有重谢
                    item.detailUrl = '/lottery/rotate.html?goodId=' + data.goodList[i].goodId;
                    item.btType = 3;
                }else{
                    if(data.goodList[i].validTime < new Date(util.getTimestamp(1)).getTime()){
                        item.btnTXT = '已结束';
                        item.btType = 1;
                    }else if(data.goodList[i].stock<=0){
                        item.btnTXT = '已抢光';
                        item.btType = 2;
                    }else{
                        item.btnTXT = '兑 换';
                        item.detailUrl = 'detail.html?goodId=' + item.goodId;
                        item.btType = 4;
                    }
                }
                goodList.push(item);
            }
            if(data.goodList.length > 0){
                vm.itemList(goodList);
                $("#upload").empty();
                $("#upload").append("上拉加载更多");
            }else{
                $("#upload").empty();
                $("#upload").append("暂无更多");
                isEnd = true;
            }
            $("body").css("visibility","visible");
            $("body").addClass('animated fadeIn');
        }else {
            //获取商品列表失败
            $("#upload").empty();
            $("#upload").append("暂无更多");
        }
    });
}

function loadHotGoodList() {
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 4;
    postObj.category = "";
    postObj.hot = "true";
    util.callServerFunction('getGoodList&random='+parseInt(Math.random()*10000), postObj, function (data) {
        if(data.statusCode == 900){
            //获取商品列表成功，执行加载操作
            vm.hotGoodList.removeAll();
            var date = new Date();
            var goodList = [],item = {};
            for (var i = 0; i < data.goodList.length; i++) {
                item = {
                    goodId: data.goodList[i].goodId,
                    goodName: data.goodList[i].goodName,
                    avatar: data.goodList[i].avatar,
                    goodInfo: data.goodList[i].goodInfo,
                    price: data.goodList[i].price,
                    stock: data.goodList[i].stock,
                    type: data.goodList[i].type,
                    category: data.goodList[i].category
                };
                item.detailUrl = "javascript:void(0)";
                if(data.goodList[i].type=="lottery"){
                    item.btnTXT = '抽 奖'; //点这里，良辰必有重谢
                    item.detailUrl = '/lottery/rotate.html?goodId=' + data.goodList[i].goodId;
                    item.btType = 3;
                }else{
                    if(data.goodList[i].validTime < new Date(util.getTimestamp(1)).getTime()){
                        item.btnTXT = '已结束';
                        item.btType = 1;
                    }else if(data.goodList[i].stock<=0){
                        item.btnTXT = '已抢光';
                        item.btType = 2;
                    }else{
                        item.btnTXT = '兑 换';
                        item.detailUrl = 'detail.html?goodId=' + item.goodId;
                        item.btType = 4;
                    }
                }
                goodList.push(item);
            }
            if(data.goodList.length > 0){
                vm.hotGoodList(goodList);
                $("#upload").empty();
                $("#upload").append("上拉加载更多");
            }else{
                $("#upload").empty();
                $("#upload").append("暂无更多");
                isEnd = true;
            }
        }else {
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

function bonusList(){
    if(util.getSessionStorage("userID") == "" || util.getSessionStorage("userID") == "undefined" || util.getSessionStorage("userID") == null){
        sendLog("访问我的积分-"+util.serviceConfig, {登陆状态: "未登陆"});
        util.js2Phone();
    }else{
        window.location.href = vm.bonusListUrl();
    }
}

function exchangeList(){
    if(util.getSessionStorage("userID") == "" || util.getSessionStorage("userID") == "undefined" || util.getSessionStorage("userID") == null){
        sendLog("访问兑换记录-"+util.serviceConfig, {登陆状态: "未登陆"});
        util.js2Phone();
    }else{
        window.location.href = vm.exchangeListUrl();
    }
}

function clickMore(){
    if(vm.pageSize() == 10){
        vm.pageNum(17);
        vm.pageSize(10000);
        $(".moreButton").remove();
        sendLog("点击查看更多商品-"+util.serviceConfig, {点击类型: "加载所有"});
    }else{
        vm.pageNum(7);
        vm.pageSize(10);
        sendLog("点击查看更多商品-"+util.serviceConfig, {点击类型: "加载10个"});
    }
    loadGoodList();
}

function showGoodType(category){
    window.location.href = './goodType.html?category=' + category;
}

function showBonusHowTo(){
    window.location.href = './bonusHowTo.html';
}

function initJssor(){
    var jssor_1_SlideoTransitions = [
        [{b:0.0,d:600.0,y:-290.0,e:{y:27.0}}],
        [{b:0.0,d:600.0,x:410.0,e:{x:27.0}}],
        [{b:-1.0,d:1.0,o:-1.0},{b:0.0,d:600.0,o:1.0,r:0.0,e:{o:5.0}}],
        [{b:-1.0,d:1.0,c:{x:175.0,t:-175.0}},{b:0.0,d:800.0,c:{x:-175.0,t:175.0},e:{c:{x:7.0,t:7.0}}}],
        [{b:-1.0,d:1.0,o:-1.0},{b:0.0,d:1000.0,x:-570.0,o:1.0,e:{x:6.0}}],
        [{b:-1.0,d:1.0,o:-1.0,r:-180.0},{b:0.0,d:800.0,o:1.0,r:180.0,c:{x:0.0,t:0.0},e:{r:7.0,c:{x:7.0,t:7.0}}}],
        [{b:0.0,d:1000.0,y:80.0,c:{x:0.0,t:0.0},e:{y:24.0,c:{x:7.0,t:7.0}}},{b:1000.0,d:1100.0,x:570.0,y:170.0,o:-1.0,r:30.0,sX:9.0,sY:9.0,e:{x:2.0,y:6.0,r:1.0,sX:5.0,sY:5.0}}],
        [{b:0.0,d:1000.0,y:185.0},{b:1000.0,d:500.0,o:-1.0},{b:1500.0,d:500.0,o:1.0},{b:2000.0,d:1500.0,r:360.0},{b:3500.0,d:1000.0,rX:30.0},{b:4500.0,d:500.0,rX:-30.0},{b:5000.0,d:1000.0,rY:30.0},{b:6000.0,d:500.0,rY:-30.0},{b:6500.0,d:500.0,sX:1.0},{b:7000.0,d:500.0,sX:-1.0},{b:7500.0,d:500.0,sY:1.0},{b:8000.0,d:500.0,sY:-1.0},{b:8500.0,d:500.0,kX:30.0},{b:9000.0,d:500.0,kX:-30.0},{b:9500.0,d:500.0,kY:30.0},{b:10000.0,d:500.0,kY:-30.0},{b:10500.0,d:500.0,c:{x:87.50,t:-87.50}},{b:11000.0,d:500.0,c:{x:-87.50,t:87.50}}],
        [{b:2000.0,d:600.0,rY:30.0}],
        [{b:0.0,d:500.0,x:-105.0},{b:500.0,d:500.0,x:230.0},{b:1000.0,d:500.0,y:-120.0},{b:1500.0,d:500.0,x:-70.0,y:120.0},{b:2600.0,d:500.0,y:-80.0},{b:3100.0,d:900.0,y:160.0,e:{y:24.0}}],
        [{b:0.0,d:1000.0,o:-0.4,rX:2.0,rY:1.0},{b:1000.0,d:1000.0,rY:1.0},{b:2000.0,d:1000.0,rX:-1.0},{b:3000.0,d:1000.0,rY:-1.0},{b:4000.0,d:1000.0,o:0.19999999999999996,rX:-1.0,rY:-1.0}]
    ];
    var jssor_1_options = {
        $AutoPlay: true,
        $CaptionSliderOptions: {
            $Class: $JssorCaptionSlideo$,
            $Transitions: jssor_1_SlideoTransitions,
            $Breaks: [
                [{d:3000,b:1000}]
            ]
        },
        $ArrowNavigatorOptions: {
            $Class: $JssorArrowNavigator$
        },
        $BulletNavigatorOptions: {
            $Class: $JssorBulletNavigator$
        }
    };
    var jssor_1_slider = new $JssorSlider$("jssor_1", jssor_1_options);
    function ScaleSlider() {
        var refSize = jssor_1_slider.$Elmt.parentNode.clientWidth;
        if (refSize) {
            refSize = Math.min(refSize, 1920);
            jssor_1_slider.$ScaleWidth(refSize);
        }
        else {
            window.setTimeout(ScaleSlider, 30);
        }
    }
    ScaleSlider();
    $Jssor$.$AddEvent(window, "load", ScaleSlider);
    $Jssor$.$AddEvent(window, "resize", $Jssor$.$WindowResizeFilter(window, ScaleSlider));
    $Jssor$.$AddEvent(window, "orientationchange", ScaleSlider);
}

function setBgColorIn(obj){
    var timerId;
    document.ontouchmove = function(e){
        window.clearInterval(timerId);
        timerId = window.setTimeout(setBgColorOut(obj), 0);
    }
    $(obj).css("backgroundColor","#e5e5e5");
}

function setBgColorOut(obj){
    $(obj).css("backgroundColor","#ffffff");
}

function setGMBgColorIn(obj){
    var timerId;
    document.ontouchmove = function(e){
        window.clearInterval(timerId);
        timerId = window.setTimeout(setGMBgColorOut(obj), 0);
    }
    $(obj).css("backgroundColor","#3d8dcb");
}

function setGMBgColorOut(obj){
    $(obj).css("backgroundColor","#449de2");
}

function showDetail(url){
    window.location.href = url;
}

function showActivityDetail(){
    window.location.href = "/activityDetail.html";
}

function loadImg(obj){
    $(obj).prev().remove();
}

function setStoreScroll(){
    if(util.getSessionStorage("storeScrollVal") != null){
        setTimeout(function(){
            $(document).scrollTop(util.getSessionStorage("storeScrollVal"))
        },100);
    }
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

var viewModel = function(){
    this.banner = ko.observableArray();
    this.bonus = ko.observable("");
    this.exchangeListUrl = ko.observable();
    this.bonusListUrl = ko.observable();
    this.sliderList = ko.observableArray();
    this.itemList = ko.observableArray();
    this.hotGoodList = ko.observableArray();
    this.pageSize = ko.observable(6);
    this.pageNum = ko.observable(1);
    this.clickMore = clickMore;
    this.showBonusHowTo = showBonusHowTo;
    this.onExchange = onExchange;
    this.onClickBannerImg = onClickBannerImg;
    this.initJssor = initJssor;
    this.showDetail = showDetail;
};
var vm = new viewModel();
//获取用户session
var userID = util.querystring('userID')[0];
var authSign = util.querystring('authSign')[0];
var u = navigator.userAgent;
var analytics = AV.analytics({
    // 设置 AppId
    appId: "593tvxmvvbzlb178tszjl1l21ewztqu805768lno6ttk5r82",
    // 设置 AppKey
    appKey: "8w60idssacdpsc0kni8vwb4jgapoy8h8ze1px0ryaxcsj35l",
    // 你当前应用或者想要指定的版本号（自定义）
    version: "2016.3.15",
    // 你当前应用的渠道或者你想指定的渠道（自定义）
    channel: "商城首页统计-"+util.serviceConfig
});
ko.applyBindings(vm);
$(document).ready(function() {
    FastClick.attach(document.body);
    if(userID == "" || userID == undefined || authSign == "" || authSign == undefined){
        if((util.getSessionStorage("userID") == "" || util.getSessionStorage("userID") == undefined)  && util.getSessionStorage("isLogin")==null){
            if (u.indexOf('Android') > -1 || u.indexOf('Linux') > -1) {//安卓手机
                javascript:callcall.jsCallback('setLogin', {});
            } else if (u.indexOf('iPhone') > -1) {//苹果手机
                window.location = "/setLogin";
            }
            util.setSessionStorage("isLogin",true);
            if(util.setSessionStorage("userID") == "" || util.setSessionStorage("userID") == null || util.setSessionStorage("userID") == undefined){
                sendLog("访问商城首页-"+util.serviceConfig, {登陆状态: "未登陆"});
            }else{
                sendLog("访问商城首页-"+util.serviceConfig, {登陆状态: "自动登陆"});
            }
        }
    }else{
        sendLog("访问商城首页-"+util.serviceConfig, {登陆状态: "已登陆"});
        util.setSessionStorage("userID",userID);
        util.setSessionStorage("authSign",authSign);
    }
    loadBonus();
    loadGoodList();
    loadHotGoodList();
    loadBanner();
    vm.bonusListUrl('./bonusList.html');
    vm.exchangeListUrl('./exchangeList.html');
    //获取浏览器类型
    var browser = {
        versions: function () {
            var u = navigator.userAgent, app = navigator.appVersion;
            return {
                ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/),
                android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1
            };
        }()
    };
    if (browser.versions.ios) {
        $('.score-lst-all').append('<div style="margin-top:10px;font-size: 12px;text-align:center;color: #888888;">积分商城活动由索课科技提供，与Apple Inc.无关</div>');
    }

    var timerId;
    document.ontouchmove = function(e){
        window.clearInterval(timerId);
        timerId = window.setTimeout(myTouchEnd, 200);
    }

    /* $(document).scroll(function(){
        util.setSessionStorage("storeScrollVal",$(document).scrollTop());
    }); */
});