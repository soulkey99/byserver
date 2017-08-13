/**
 * Created by MengLei on 2015/7/22.
 */

function loadExchangeList(startPos) {
    if (!startPos) {
        startPos = 1;
    }
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = startPos;
    postObj.pageSize = vm.pageSize();
    util.callServerFunction('getExchangeList', postObj, function (data) {
        if(data.statusCode == 900){
            if (data.bonusList.length > 0) {
                //获取商品兑换列表成功，执行加载操作
                //vm.itemList.removeAll();
                var bonusList = vm.itemList();
                for (var i = 0; i < data.bonusList.length; i++) {
                    var time = new Date(data.bonusList[i].time).format('yyyy-MM-dd hh:mm');
                    bonusList.push({
                        bonusID: data.bonusList[i].bonusID,
                        hasDetail: data.bonusList[i].hasDetail,
                        detailUrl: 'exchangeDetail.html?detailId=' + data.bonusList[i].detailId + '&userID=' + util.querystring('userID')[0] + '&authSign=' + util.querystring('authSign')[0],
                        detailId: data.bonusList[i].detailId || '',
                        goodName: data.bonusList[i].goodName,
                        avatar: data.bonusList[i].avatar,
                        price: data.bonusList[i].bonus,
                        time: time
                    });
                }
            }
            if(data.bonusList.length > 0){
                vm.itemList(bonusList);
                $("#upload").empty();
                $("#upload").append("上拉加载更多");
            }else{
                $("#upload").empty();
                $("#upload").append("暂无更多");
                isEnd = true;
            }
            firstLoad = false;
            $("#element").addClass('animated fadeIn');
        }else{
            $("#upload").empty();
            $("#upload").append("获取商品列表失败");
        }
    });
}

function onDetail() {
    window.location.href = 'exchangeDetail.html?detailId=' + this.detailId;
}

function prevPage() {
    //上一页
    if (vm.pageNum() == 1) {
        //util.toast('已经是第一页了！');
    } else {
        loadExchangeList(((vm.pageNum() - 2) * vm.pageSize()) + 1);
    }
}

function nextPage() {
    //下一页
    vm.pageNum(vm.pageNum()+1);
    loadExchangeList((vm.pageNum() * vm.pageSize()) + 1);
}

function loadUserInfo() {
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    util.callServerFunction('getUserInfo', postObj, function (data) {
        if(data.statusCode == 900){
            if(data.info.avatar != "" && data.info.avatar != undefined){
                vm.userAvatar(util.changeUrl(data.info.avatar));
            }
            vm.bonus(data.info.bonus);
            vm.userNick(data.info.nick);
        }else{
            //util.toast('获取用户信息失败！', '积分商城', 'error');
        }
    });
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

Date.prototype.format = function(fmt) { //author: meizz
    var o = {
        "M+": this.getMonth() + 1,                 //月份
        "d+": this.getDate(),                    //日
        "h+": this.getHours(),                   //小时
        "m+": this.getMinutes(),                 //分
        "s+": this.getSeconds(),                 //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds()             //毫秒
    };
    if (/(y+)/.test(fmt))
        fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (var k in o)
        if (new RegExp("(" + k + ")").test(fmt))
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

var viewModel = function(){
        this.bonus = ko.observable("");
        this.userNick = ko.observable("");
        this.userAvatar = ko.observable("img/store/userIcon.png");
        this.pageSize = ko.observable(10);
        this.pageNum = ko.observable(0);
        this.itemList = ko.observableArray();
    }
    , vm = new viewModel()
    , firstLoad = true
    , isEnd = false
    , analytics = AV.analytics({
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
    sendLog("访问兑换记录-"+util.serviceConfig, {登陆状态: "已登陆"});
    loadExchangeList();
    loadUserInfo();
    $(window).scroll(function() {
        //$(document).scrollTop() 获取垂直滚动的距离
        //$(document).scrollLeft() 这是获取水平滚动条的距离
        if ($(document).scrollTop() <= 0) {
        }
        if($(document).scrollTop() >= $(document).height() - $(window).height() && !isEnd) {
            $("#upload").empty();
            $("#upload").append("正在加载...");
            nextPage();
        }
    });
});