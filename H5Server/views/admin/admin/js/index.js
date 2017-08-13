/**
 * Created by MengLei on 2015/8/3.
 */
var startTimeAll="",endTimeAll="",phoneAll="";

function prevPage(){
    if(vmShop.startPosAll()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vmShop.startPosAll(vmShop.startPosAll()-1);
        loadGoodList();
    }
}

function nextPage(){
    vmShop.startPosAll(vmShop.startPosAll()+1);
    loadGoodList();
}

function subLoadGoodList(){
    vmShop.startPosAll(1);
    vmShop.pageSizeAll(15);
    loadGoodList();
}

function loadGoodList() {
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        startPos: (vmShop.startPosAll()-1)*vmShop.pageSizeAll()+1,
        pageSize: vmShop.pageSizeAll(),
        shopID: $("#shopID").val(),
        goodName: $("#goodName").val(),
        type: $("#type").val(),
        category: $("#category").val(),
        valid: $("#valid").val(),
        hot: $("#hot").val()
    };
    util.callServerFunction("adminGoodList",postObj, function(result){
        if(result.statusCode == 900) {
            vmShop.itemListShop.removeAll();
            goodIdAll = "";
            if (result.statusCode == 900) {
                if (result.goodList.length > 0) {
                    //获取商品列表成功，执行加载操作
                    var goodList = [];
                    for (var i = 0; i < result.goodList.length; i++) {
                        var typeStr = '';
                        switch (result.goodList[i].type) {
                            case 'vSale':
                                typeStr = '虚拟兑换';
                                break;
                            case 'rSale':
                                typeStr = '实物兑换';
                                break;
                            case 'api':
                                typeStr = 'api流量充值';
                                break;
                            case 'lottery':
                                typeStr = '抽奖活动';
                                break;
                            case 'vLucky':
                                typeStr = '虚拟抽奖';
                                break;
                            case 'api_hjjd':
                                typeStr = '用户信息';
                                break;
                            default :
                                typeStr = '未知类型';
                                break;
                        }
                        var category = "";
                        switch (result.goodList[i].category) {
                            case 'default':
                                category = '默认';
                                break;
                            case 'xiuxian':
                                category = '休闲娱乐';
                                break;
                            case 'jiaoyu':
                                category = '教育培训';
                                break;
                            case 'shenghuo':
                                category = '生活服务';
                                break;
                            case 'canyin':
                                category = '餐饮美食';
                                break;
                            default :
                                category = '未知类型';
                                break;
                        }
                        var item = {
                            id: (i + 1),
                            goodId: result.goodList[i].goodId,
                            goodName: result.goodList[i].goodName,
                            goodPic: result.goodList[i].goodPic,
                            goodInfo: result.goodList[i].goodInfo,
                            price: result.goodList[i].price,
                            ownerName: result.goodList[i].ownerName,
                            valid: result.goodList[i].valid,
                            hot: result.goodList[i].hot,
                            type: typeStr,
                            category: category,
                            createTime: util.convertTime2Str(result.goodList[i].createTime),
                            validTime: util.convertTime2Str(result.goodList[i].validTime),
                            stock: result.goodList[i].stock
                        };
                        goodList.push(item);
                    }
                    vmShop.itemListShop(goodList);
                    $('i').tooltip({
                        "margin-top": "50px"
                    });
                } else if (vmShop.startPosAll() != 1) {
                    //获取商品列表失败
                    vmShop.startPosAll(vmShop.startPosAll() - 1);
                    loadGoodList();
                    $.dialog({
                        icon: 'icon icon-warning',
                        title: '提示信息',
                        content: "您已经在最后一页了！"
                    })
                }
            } else {
                util.errorCodeApi(result.statusCode);
            }
        }else{
            util.errorCodeApi(result.statusCode);
        }
    });
}

//打开修改页面
var goodIdAll;
function showDetail(){
    //window.location.href = 'editDetail.html?goodId=' + this.goodId;
    goodIdAll = this.goodId;
    tabEditDetail();
}

//添加新商品
function addNew(){
    goodIdAll = "";
    tabEditDetail();
}

//商品上/下架
function setValid(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        goodId: this.goodId,
        valid: !this.valid
    };
    util.callServerFunction('adminEditGoodInfo', postObj, function (data) {
        if(data.statusCode == 900){
            util.toast("操作成功！","success","系统提示");
            loadGoodList();
        }else{
            errorCodeApi(data.statusCode);
        }
    })
}

//商品推不/推荐
function setHot(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        goodId: this.goodId,
        hot: !this.hot
    };
    util.callServerFunction('adminEditGoodInfo', postObj, function (data) {
        if(data.statusCode == 900){
            util.toast("操作成功！","success","系统提示");
            loadGoodList();
        }else{
            errorCodeApi(data.statusCode);
        }
    })
}

function getShopList(){
    var html = "<div><button type='button' class='btn btn btn-warning btn-md' onclick=\"shopConfirm('','全部商户')\" style='margin:0px 5px 5px 0px'>"+
        "<span class='glyphicon glyphicon-user'></span>全部商户</button>";
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign')
    };
    util.callServerFunction('adminGetShopList', postObj, function(resp){
        if(resp.statusCode == 900){
            for(var i=0; i<resp.list.length; i++){
                html += "<button type='button' class='btn btn btn-info btn-md' onclick=\"shopConfirm('"+resp.list[i].shopID+"','"+resp.list[i].shopName+"')\" style='margin:0px 5px 5px 0px'>"+
                    "<span class='glyphicon glyphicon-user'></span>"+resp.list[i].shopName+
                    "</button>";
            }
            html += "</div>";
            dialog = $.dialog({
                icon: "icon icon-user-group",
                title: '选择商户',
                content: html
            });
        }else{
            util.errorCodeApi(resp.statusCode);
        }
    });
}

function shopConfirm(shopIDTemp,shopName){
    $("#shopID").val(shopIDTemp);
    $("#shopName").text(shopName);
    dialog.close();
}

var viewModel = function(){
    this.itemListShop = ko.observableArray();
    this.showDetail = showDetail;
    this.setValid = setValid;
    this.setHot = setHot;
    this.startPosAll = ko.observable(1);
    this.pageSizeAll = ko.observable(15);
};
var vmShop = new viewModel();
var dialog = "";
$(document).ready(function() {
    ko.applyBindings(vmShop,document.getElementById("shopTable"));
    loadGoodList();
    //显示登陆用户名
    $("#nick").html("<strong>"+util.getSessionStorage("nick")+"</strong>");
    $("#rightNick").html(util.getSessionStorage("nick"));
    $("#lastLoginTime").html(util.getSessionStorage("lastLoginTime"));

    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    document.onkeydown = function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadGoodList();
            return false;
        }
    }
});