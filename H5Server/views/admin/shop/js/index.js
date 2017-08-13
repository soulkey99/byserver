/**
 * Created by MengLei on 2015/8/4.
 */

function prevPageShopIndex(){
    if(vm.startPosAllShopIndex(1)){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vm.startPosAllShopIndex(vm.startPosAllShopIndex()-1);
        loadGoodList();
    }
}

function nextPageShopIndex(){
    vm.startPosAllShopIndex(vm.startPosAllShopIndex()+1);
    loadGoodList();
}

/*
    获取商品列表
 */
function loadGoodList(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        startPos: (vm.startPosAllShopIndex()-1)*vm.pageSizeAllShopIndex()+1,
        pageSize: vm.pageSizeAllShopIndex()
    };
    util.callServerFunction('shopGoodList', postObj, function(resp) {
        if (resp.statusCode == 900) {
            vm.itemList.removeAll();
            if (resp.goodList.length > 0) {
                //获取商品列表成功，执行加载操作
                var goodList = [];
                for (var i = 0; i < resp.goodList.length; i++) {
                    var typeStr = '';
                    switch (resp.goodList[i].type) {
                        case 'vSale':
                            typeStr = '虚拟兑换';
                            break;
                        case 'rSale':
                            typeStr = '实物兑换';
                            break;
                        case 'api':
                            typeStr = 'api充值';
                            break;
                        case 'vLucky':
                            typeStr = '虚拟抽奖';
                            break;
                        case 'rLucky':
                            typeStr = '实物抽奖';
                            break;
                        default :
                            typeStr = '未知类型';
                            break;
                    }
                    var deliverStr = '';
                    switch (resp.goodList[i].deliver) {
                        case 'mail':
                            deliverStr = '物流';
                            break;
                        case 'code':
                            deliverStr = '兑换码';
                            break;
                    }
                    var item = {
                        id: (i + 1),
                        goodId: resp.goodList[i].goodId,
                        goodName: resp.goodList[i].goodName,
                        goodPic: resp.goodList[i].goodPic,
                        goodInfo: resp.goodList[i].goodInfo,
                        price: resp.goodList[i].price,
                        ownerName: resp.goodList[i].ownerName,
                        valid: resp.goodList[i].valid,
                        type: typeStr,
                        deliver: deliverStr,
                        createTime: util.convertTime2Str(resp.goodList[i].createTime),
                        validTime: util.convertTime2Str(resp.goodList[i].validTime),
                        stock: resp.goodList[i].stock
                    };
                    goodList.push(item);
                }
                vm.itemList(goodList);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            } else if (vm.startPosAllShopIndex() != 1) {
                //获取商品列表失败
                vm.startPosAllShopIndex(vm.startPosAllShopIndex() - 1);
                loadGoodList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content: "您已经在最后一页了！"
                })
            }
        } else {
            errorCodeApi(resp.statusCode);
        }
    });
}

function showDetail(){
    $.dialog({
        iocn: "icon icon-document-edit",
        title:"商品列表",
        content: "url: ../../../exchangeList.html?goodId="+this.goodId
    })
    //window.location.href = '../../../exchangeList.html?goodId=' + this.goodId;
}

var viewModel = function(){
    this.itemList = ko.observableArray();
    this.showDetail = showDetail;
    this.startPosAllShopIndex = ko.observable(1);
    this.pageSizeAllShopIndex = ko.observable(15);
};

var vm = new viewModel();
$(document).ready(function() {
    ko.applyBindings(vm,document.getElementById("shopIndexTable"));
    loadGoodList();
});
