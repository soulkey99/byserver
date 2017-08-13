/**
 * Created by hjy on 2016/3/25 0025.
 */

function getMoneyOrderList() {
    var postObj = {};
    postObj.userID = userID;
    postObj.authSign = authSign;
    postObj.type = "charge";
    postObj.startPos = (vm.pageNum() * vm.pageSize()) + 1;
    postObj.pageSize = vm.pageSize();
    util.callServerFunction("getMoneyOrderList&random="+parseInt(Math.random()*10000), postObj, function(data) {
        if(data.statusCode == 900) {
            if (data.list.length > 0) {
                var list = vm.moneyOrderList();
                for (var i = 0; i < data.list.length; i++) {
                    var dateTime = util.convertTime2Str(data.list[i].createTime);
                    list.push({
                        id: (i + 1),
                        money: parseInt(data.list[i].amount)/100,
                        type: data.list[i].type,
                        date: dateTime.split(" ")[0],
                        time: dateTime.split(" ")[1]
                    });
                }
                vm.moneyOrderList(list);
                $("#uploadSwipe").text("上拉加载更多");
            }else{
                isEnd = true;
                $("#uploadSwipe").text("暂无更多");
            }
        }else{
            alert("系统繁忙，请稍后再试 "+data.statusCode);
        }
    });
}

function nextPage() {
    vm.pageNum(vm.pageNum()+1);
    getMoneyOrderList();
}

var viewModel = function() {
    this.moneyOrderList = ko.observableArray();
    this.pageNum = ko.observable(0);
    this.pageSize = ko.observable(10);
};
var vm = new viewModel();
var isEnd = false;
var userID = util.querystring('userID')[0];
var authSign = util.querystring('authSign')[0];
$(document).ready(function(){
    ko.applyBindings(vm);
    $(".nodetailDiv").css("height",$(window).height() + "px");
    $(".nodetailDiv").css("lineHeight",$(window).height() + "px");
    getMoneyOrderList();
    $("body").css("visibility","visible");
    $("body").addClass("animated fadeIn");
    $(window).scroll(function(){
        if($(document).scrollTop() >= $(document).height() - $(window).height() && !isEnd) {
            $("#uploadSwipe").empty();
            $("#uploadSwipe").append("正在加载...");
            nextPage();
        }
    });
});