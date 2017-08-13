/**
 * Created by MengLei on 2015/7/22.
 */

function loadBonus() {
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    util.callServerFunction('getUserInfo', postObj, function (data) {
        if(data.statusCode == 900){
            if(data.info.avatar != "" && data.info.avatar != undefined){
                vm.userAvatar(util.changeUrl(data.info.avatar));
            }
            vm.bonus(data.info.bonus);
            vm.userNick(data.info.nick);
        }else{
            //util.toast('获取积分失败！', '积分商城', 'error');
        }
    });
}

function loadBonusList(startPos) {
    if (!startPos) {
        startPos = 1;
    }
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    postObj.startPos = startPos;
    postObj.pageSize = vm.pageSize();
    util.callServerFunction('getBonusList', postObj, function (data) {
        if(data.statusCode == 900){
            if (data.bonusList.length > 0) {
                //获取商品列表成功，执行加载操作
                //vm.itemList.removeAll();
                var bonusList = vm.itemList();
                for (var i = 0; i < data.bonusList.length; i++) {
                    var time = new Date(data.bonusList[i].time).format('yyyy-MM-dd hh:mm');
                    var item = {goodName: data.bonusList[i].goodName, price: data.bonusList[i].bonus, time: time};
                    if (item.price > 0) {
                        item.price = '+' + item.price;
                    }
                    bonusList.push(item);
                }
                vm.itemList(bonusList);
                //vm.pageNum(Math.ceil(startPos / vm.pageSize()));
                $("#uploadSwipe").empty();
                $("#uploadSwipe").append("上拉加载更多");
            } else {
                isEnd = true;
                $("#uploadSwipe").empty();
                $("#uploadSwipe").append("暂无更多");
            }
            firstLoad = false;
            $("#element").addClass('animated fadeIn');
        }else{
            $("#uploadSwipe").empty();
            $("#uploadSwipe").append("获取商品列表失败");
        }
    });
}

function prevPage() {
    //上一页
    if (vm.pageNum() == 1) {
        //alert('已经是第一页了！');
        //util.toast('已经是第一页了！');
    } else {
        loadBonusList(((vm.pageNum() - 2) * vm.pageSize()) + 1);
    }
}

function nextPage() {
    vm.pageNum(vm.pageNum()+1);
    loadBonusList((vm.pageNum() * vm.pageSize()) + 1);
}

function popup(str){
    $('#messageBox').show();
    $('#message').html(str);
}

function closeAndBack(){
    $('#messageBox').hide();
    $('#message').html('');
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
        this.pageNum = ko.observable(0);
        this.pageSize = ko.observable(10);
        this.itemList = ko.observableArray();
    }
    , vm = new viewModel()
    , isEnd = false
    , firstLoad = true
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
var userID = util.querystring("userID")[0];
var authSign = util.querystring("authSign")[0];
if(userID == "" || userID == null || userID == undefined){
    userID = util.getSessionStorage("userID");
}
if(authSign == "" || authSign == null || authSign == undefined){
    authSign = util.getSessionStorage("authSign");
}
ko.applyBindings(vm);
$(document).ready(function() {
    FastClick.attach(document.body);
    sendLog("访问我的积分-"+util.serviceConfig, {登陆状态: "已登陆"});
    loadBonus();
    loadBonusList();
    $(window).scroll(function(){
        if($(document).scrollTop() >= $(document).height() - $(window).height() && !isEnd) {
            $("#uploadSwipe").empty();
            $("#uploadSwipe").append("正在加载...");
            nextPage();
        }
    });
});