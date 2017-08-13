/**
 * Created by MengLei on 2015/8/7.
 */

//获取高级分页
function getPage(curPage, maxCount, pageCount){
    var pageinfor,pageBegin,pageEnd,totalPage;
    totalPage = Math.ceil(maxCount/pageCount);
    if((totalPage-curPage) <= 2) {
        //if (((curPage - 1) / pageCount + 1) * pageCount >= totalPage) { // 当前页应该显示的最大数量超过了总数记录数，则当页从maxCount-10开始，最后一条为maxCount
        pageBegin = totalPage - 4;
        pageEnd = totalPage;
    } else { // 否则，根据当前页，显示10条；末条为curPage*10，首条为curPage*10-9
        if(curPage > 3){
            pageBegin = curPage - 2;
            pageEnd = curPage + 2;
        }else{
            pageBegin = 1;
            if(totalPage<5){
                pageEnd = totalPage;
            }else{
                pageEnd = 5;
            }
        }
    }
    if (pageBegin <= 0)
        pageBegin = 1;
    pageinfor = "<div style='height:76px;padding: 27px 0px 24px 0px;float: left;'>总共&nbsp;&nbsp;" + maxCount + "&nbsp;&nbsp;项&nbsp;&nbsp;" + totalPage
        + "&nbsp;&nbsp;页&nbsp;&nbsp;&nbsp;当前是第&nbsp;&nbsp;" + curPage
        + "&nbsp;&nbsp;页</div>" +
        "<div style='height:76px;float: right'><ul class='pagination'>";
    if (curPage <= 1) {
        pageinfor = pageinfor
            + "<li class='disabled'><a>首页</a></li>";
    } else {
        pageinfor = pageinfor
            + "<li><a href='javascript:loadShopList(1)'>首页</a></li>";
    }
    for (; pageBegin <= pageEnd; pageBegin++)
        if (pageBegin == curPage)
            pageinfor = pageinfor + "<li class='active'><a>" + pageBegin + "</a></li>";
        else
            pageinfor = pageinfor + "<li><a href='javascript:loadShopList(" + pageBegin + ")'>" + pageBegin + "</a></li>";
    if (curPage == totalPage || totalPage == 0)
        pageinfor = pageinfor
            + "<li class='disabled'><a>末页</a></li>";
    else {
        pageinfor += "<li><a href='javascript:loadShopList(" + totalPage + ")'>末页</a></li>";
    }
    pageinfor +="</ul></div>";
    return pageinfor;
}

//上一页
function prevPageShopList(){
    if(vmShopList.startPosAllShopList()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vmShopList.startPosAllShopList(vmShopList.startPosAllShopList()-1);
        loadShopList();
    }
}

//下一页
function nextPageShopList(){
    vmShopList.startPosAllShopList(vmShopList.startPosAllShopList()+1);
    loadShopList();
}

//获取商家列表
function loadShopList(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        startPos: (vmShopList.startPosAllShopList()-1)*vmShopList.pageSizeAllShopList()+1,
        pageSize: vmShopList.pageSizeAllShopList()
    };
    util.callServerFunction('adminGetShopList', postObj, function(resp){
        if(resp.statusCode == 900){
            vmShopList.itemListShopList.removeAll();
            if(resp.list.length>0){
                var list = [];
                for(var i=0; i<resp.list.length; i++) {
                    list.push({
                        id: (i + 1),
                        shopID: resp.list[i].shopID,
                        shopName: resp.list[i].shopName,
                        userName: resp.list[i].userName,
                        type: resp.list[i].type,
                        name: resp.list[i].userInfo.name,
                        phone: resp.list[i].userInfo.phone,
                        desc: resp.list[i].userInfo.desc,
                        address: resp.list[i].userInfo.address
                    });
                }
                vmShopList.itemListShopList(list);
                //$("#page").html(getPage(page, 20, pageSizeAllShopList));
                $('i').tooltip({
                    "margin-top": "50px"
                });
            }else if(vmShopList.startPosAllShopList()!=1){
                vmShopList.startPosAllShopList(vmShopList.startPosAllShopList()-1);
                loadShopList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"您已经在最后一页了！"
                })
            }
        }else{
            errorCodeApi(resp.statusCode);
        }
    })
}

//添加新商家
var dialog;
function addNew(){
    //$('#editPopup').fadeIn('slow');
    var html = "<div class='form-group'>"+
                    "<input type='hidden' class='form-control' id='shopID'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>商户名：</label><input type='text' class='form-control' id='shopName'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>联系人：</label><input type='text' class='form-control' id='name'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>联系方式：</label><input type='text' class='form-control' id='phone'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>介绍：</label><input type='text' class='form-control' id='desc'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>地址：</label><input type='text' class='form-control' id='address'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>用户名：</label><input type='text' class='form-control' id='uName'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>密码：</label><input type='password' class='form-control' id='passwd'>"+
                "</div>"+
                "<button class='btn btn-primary' onclick='confirm()'>提 交</button>";
    dialog = $.dialog({
        icon: "icon icon-plus",
        title: '添加商家',
        content: html
    });
}

//修改商家
function showDetail(){
    //$('#editPopup').fadeIn('slow');
    var html = "<div class='form-group'>"+
                    "<input type='hidden' class='form-control' id='shopID'  value='"+this.shopID+"'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>商户名：</label><input type='text' class='form-control' id='shopName' value='"+this.shopName+"'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>联系人：</label><input type='text' class='form-control' id='name' value='"+this.name+"'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>联系方式：</label><input type='text' class='form-control' id='phone' value='"+this.phone+"'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>联系人介绍：</label><input type='text' class='form-control' id='desc' value='"+this.desc+"'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>地址：</label><input type='text' class='form-control' id='address' value='"+this.address+"'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>用户名：</label><input type='text' class='form-control' id='uName' value='"+this.userName+"'>"+
                "</div>"+
                "<div class='form-group'>"+
                    "<label>密码：</label><input type='password' class='form-control' id='passwd'>"+
                "</div>"+
                "<button class='btn btn-primary' onclick='confirm()'>确 定</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改商家',
        content: html
    });
}

//添加新商家
function confirm(){
    if($('#shopName').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写商户名！"
        });
    }else if($('#name').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写联系人！"
        });
    }else if($('#phone').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写联系方式！"
        });
    }else if($('#desc').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写联系人介绍！"
        });
    }else if($('#address').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写联系人地址！"
        });
    }else if($('#uName').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写用户名！"
        });
    }else if($('#passwd').val()==""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请填写密码！"
        });
    }else {
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.userName = $('#uName').val();
        util.callServerFunction('adminCheckUserName', postObj, function (data) {
            if(data.statusCode == 900){
                postObj = {
                    userID: util.getSessionStorage('userID'),
                    authSign: util.getSessionStorage('authSign'),
                    shopID: $('#shopID').val() || '',
                    shopName: $('#shopName').val(),
                    userName: $('#uName').val(),
                    type: 'shop',
                    passwd: $('#passwd').val(),
                    name: $('#name').val(),
                    phone: $('#phone').val(),
                    desc: $('#desc').val(),
                    address: $('#address').val()
                };
                util.callServerFunction('adminEditShop', postObj, function (resp) {
                    if (resp.statusCode == 900) {
                        util.toast("操作成功！","success","系统提示");
                        dialog.close();
                        vm.startPosAllShopList(1);
                        vm.pageSizeAllShopList(15);
                        loadShopList();
                    }else{
                        util.errorCodeApi(resp.statusCode);
                    }
                })
            }else if(data.statusCode == 901){
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"您输入的用户名已存在！"
                })
            }else{
                errorCodeApi(data.statusCode);
            }
        });
    }
}

//删除商家
function deleteShop(){
    var shopIdTemp = this.shopID;
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "确认要删除 <span class='label label-info'>"+ this.shopName +"</span> 商家吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            var postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                shopID: shopIdTemp,
                action: ""
                //action="un" 取消删除
            };
            util.callServerFunction('adminDeleteShop', postObj, function (resp) {
                if (resp.statusCode == 900) {
                    util.toast("删除成功！","success","系统提示");
                    loadShopList();
                }else{
                    util.errorCodeApi(resp.statusCode);
                }
            })
        }
    })
}

var viewModel = function(){
    this.itemListShopList = ko.observableArray();
    this.showDetail = showDetail;
    this.deleteShop = deleteShop;
    this.startPosAllShopList = ko.observable(1);
    this.pageSizeAllShopList = ko.observable(15);
};
var vmShopList = new viewModel();
$(document).ready(function() {
    ko.applyBindings(vmShopList,document.getElementById("shopListTable"));
    loadShopList();
    document.onkeydown = function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            loadShopList();
            return false;
        }
    }
});