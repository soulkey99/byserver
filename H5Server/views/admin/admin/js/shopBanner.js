/**
 * Created by hjy on 2015/11/13 0013.
 */

function loadShopBannerList(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        startPos: (vm.startPos()-1)*vm.pageSize()+1,
        pageSize: vm.pageSize(),
        type: "storeBanner"
    };
    if($("#time").val() != ""){
        postObj.time = new Date($("#time").val()).getTime();
    }
    util.callServerFunction('adminGetADList', postObj, function(resp){
        if(resp.statusCode == 900){
            vm.shopBannerList.removeAll();
            if (resp.list.length > 0) {
                for (var i = 0; i < resp.list.length; i++) {
                    var goodName = "";
                    if (resp.list[i].content.goodName != undefined) {
                        goodName = resp.list[i].content.goodName;
                    }
                    vm.shopBannerList.push({
                        id: i + 1,
                        ad_id: resp.list[i].ad_id,
                        desc: resp.list[i].desc,
                        start: util.convertTime2Str(resp.list[i].start),
                        end: util.convertTime2Str(resp.list[i].end),
                        valid: resp.list[i].valid,
                        type: resp.list[i].type,
                        seq: resp.list[i].seq,
                        action: resp.list[i].content.action,
                        link: resp.list[i].content.link,
                        pic: resp.list[i].content.pic,
                        text: resp.list[i].content.text,
                        goodName: goodName
                    });
                }
            }else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadShopBannerList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content: "您已经在最后一页了！"
                })
            }
        }else{
            errorCodeApi(resp.statusCode);
        }
    });
}

function prevPage(){
    if(vm.startPos()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vm.startPos(vm.startPos()-1);
        loadShopBannerList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadShopBannerList();
}

function subLoadShopBannerList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadShopBannerList();
}

function initAddBanner(){
    vm.oldSrc("");
    vm.ad_id("");
    vm.tempSrc("");
    var html = "<div class='form-group'>"+
        "<input type='file' id='banner' style='display: none'>"+
        "<button type='button' class='btn btn-rounded' onclick='selectImg()'><span class='entypo-export'></span>&nbsp;&nbsp;选择文件</button>&nbsp;&nbsp;图片建议尺寸：1242像素 * 470像素(16:6)"+
        "<img id='tempImg' style='width: 100%;height: auto;margin-top: 5px' src='' alt='请上传banner图片'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>有效时间：</label>" +
        "<input id='startTime' class='form-control' data-format='yyyy/MM/dd hh:mm:ss' type='text'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>失效时间：</label>" +
        "<input id='endTime' class='form-control' data-format='yyyy/MM/dd hh:mm:ss' type='text'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>Banner标题：</label><input type='text' class='form-control' id='text'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>Banner描述：</label><input type='text' class='form-control' id='desc'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>点击跳转类型：</label>" +
        "<select id='action' class='form-control valid'>"+
        "<option value=''>无点击</option>"+
        "<option value='detail'>商品详情</option>"+
        "<option value='lottery'>转盘抽奖</option>"+
        "</select>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>跳转对应商品名称：</label>" +
        "<input id='autoLink' class='form-control visible-lg visible-md' type='text' data-provide='typeahead'>"+
        "<input id='link' type='hidden'>"+
        "<input id='goodName' type='hidden'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>显示顺序：</label><input type='text' class='form-control' id='seq' placeholder='例：填写1（第一位显示）'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>是/否有效：</label>" +
        "<select id='validAdd' class='form-control valid'>"+
        "<option value=''>-请选择-</option>"+
        "<option value='true'>有效</option>"+
        "<option value='false'>无效</option>"+
        "</select>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='uploadBanner()'>提 交</button>";
    dialog = $.dialog({
        icon: "icon icon-plus",
        title: '新增Banner',
        content: html
    });
    util.initDateTimePicker("startTime",{defaultDate: new Date(todayStartDate)});
    util.initDateTimePicker("endTime",{defaultDate: new Date(todayEndDate)});
    $("#banner").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            vm.tempSrc(url);
            $("#tempImg").attr('src',url);
        };
    });
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.getType = "simple";
    util.callServerFunction('adminGoodList',postObj, function(data){
        if(data.statusCode == 900){
            var goodList = data.goodList;
            $.fn.typeahead.Constructor.prototype.blur = function () {
                var that = this;
                setTimeout(function () {
                    that.hide()
                }, 250);
            };
            $('#autoLink').typeahead({
                source: function (query, process) {
                    var list = [];
                    $.each(goodList, function (name, value) {
                        list.push(value.goodName + "-" + value.goodId);
                    });
                    return list;
                },
                highlighter: function (item) {
                    return "" + item + "";
                },
                updater: function (item) {
                    $("#link").val(item.substring(item.indexOf('-') + 1, item.length));
                    $("#goodName").val(item.substring(0, item.indexOf('-')));
                    return item;
                }
            });
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

function selectImg(){
    $("#banner").click();
}

function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

function uploadBanner(){
    if($("#tempImg").attr("src") == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择Banner图片！"
        })
    }else if($("#startTime").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择有效时间！"
        })
    }else if($("#endTime").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择失效时间！"
        })
    }else if($("#validAdd")!=undefined && $("#validAdd").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择是/否有效！"
        })
    }else {
        if (vm.tempSrc() != "") {
            var dataurl = vm.tempSrc();
            var blob = dataURLtoBlob(dataurl);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = callback;
            xhr.send(fd);
        } else {
            callback();
        }
    }
}

function callback(){
    if(vm.tempSrc() != ""){
        if (xhr.readyState == 4 && xhr.status === 200) {//readyState表示文档加载进度,4表示完毕
            var imgsrc = JSON.parse(xhr.response).filePath;
            var postObj = {
                ad_id: vm.ad_id(),
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                startTime: new Date($("#startTime").val()).getTime(),
                endTime: new Date($("#endTime").val()).getTime(),
                valid: $("#validAdd").val(),
                text: $("#text").val(),
                action: $("#action").val(),
                link: $("#link").val(),
                goodName: $("#goodName").val(),
                desc: $("#desc").val(),
                pic: imgsrc,
                type: "storeBanner",
                seq: $("#seq").val()
            };
            util.callServerFunction('adminEditAD', postObj, function (resp) {
                if (resp.statusCode == 900) {
                    util.toast("添加成功", "success", "系统提示");
                    dialog.close();
                    subLoadShopBannerList();
                } else {
                    errorCodeApi(resp.statusCode);
                }
            });
        }
    }else{
        var imgsrc = vm.oldSrc();
        var postObj = {
            ad_id: vm.ad_id(),
            userID: util.getSessionStorage('userID'),
            authSign: util.getSessionStorage('authSign'),
            startTime: new Date($("#startTime").val()).getTime(),
            endTime: new Date($("#endTime").val()).getTime(),
            text: $("#text").val(),
            action: $("#action").val(),
            link: $("#link").val(),
            goodName: $("#goodName").val(),
            desc: $("#desc").val(),
            pic: imgsrc,
            type: "storeBanner",
            seq: $("#seq").val()
        };
        util.callServerFunction('adminEditAD', postObj, function (resp) {
            if (resp.statusCode == 900) {
                util.toast("修改成功", "success", "系统提示");
                dialog.close();
                loadShopBannerList();
            } else {
                errorCodeApi(resp.statusCode);
            }
        });
    }
}

function initEditBanner(){
    vm.oldSrc(this.pic);
    vm.ad_id(this.ad_id);
    vm.tempSrc("");
    var html = "<div class='form-group'>"+
        "<input type='file' id='banner' style='display: none'/>"+
        "<button type='button' class='btn btn-rounded' onclick='selectImg()'><span class='entypo-export'></span>&nbsp;&nbsp;选择文件</button>&nbsp;&nbsp;图片建议尺寸：1242像素 * 470像素(16:6)"+
        "<img id='tempImg' style='width: 100%;height: auto;margin-top: 5px' src='"+ this.pic +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>有效时间：</label>" +
        "<input id='startTime' class='form-control' type='text' value='"+ this.start +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>失效时间：</label>" +
        "<input id='endTime' class='form-control' type='text' value='"+ this.end +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>Banner标题：</label><input type='text' class='form-control' id='text' value='"+ this.text +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>Banner描述：</label><input type='text' class='form-control' id='desc' value='"+ this.desc +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>点击跳转类型：</label>" +
        "<select id='action' class='form-control valid'>"
    if(this.action == ""){
        html += "<option value='' selected>无点击</option>"+
        "<option value='detail'>商品详情</option>"+
        "<option value='lottery'>转盘抽奖</option>";
    }else if(this.action == "detail"){
        html += "<option value=''>无点击</option>"+
            "<option value='detail' selected>商品详情</option>"+
            "<option value='lottery'>转盘抽奖</option>";
    }else if(this.action == "lottery"){
        html += "<option value=''>无点击</option>"+
            "<option value='detail'>商品详情</option>"+
            "<option value='lottery' selected>转盘抽奖</option>";
    }
    html += "</select>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>跳转对应商品名称：</label>" +
        "<input id='autoLink' class='form-control visible-lg visible-md' type='text' data-provide='typeahead' value='"+ this.goodName +"'>"+
        "<input id='link' type='hidden' value='"+ this.link +"'>"+
        "<input id='goodName' type='hidden' value='"+ this.goodName +"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>显示顺序：</label><input type='text' class='form-control' id='seq' value='"+ this.seq +"'>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='uploadBanner()'>提 交</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改Banner',
        content: html
    });
    util.initDateTimePicker("startTime",{});
    util.initDateTimePicker("endTime",{});
    $("#banner").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var url = reader.result;
            vm.tempSrc(url);
            $("#tempImg").attr('src',url);
        };
    });
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.getType = "simple";
    util.callServerFunction('adminGoodList',postObj, function(data){
        if(data.statusCode == 900){
            var goodList = data.goodList;
            $.fn.typeahead.Constructor.prototype.blur = function () {
                var that = this;
                setTimeout(function () {
                    that.hide()
                }, 250);
            };
            $('#autoLink').typeahead({
                source: function (query, process) {
                    var list = [];
                    $.each(goodList, function (name, value) {
                        list.push(value.goodName + "-" + value.goodId);
                    });
                    return list;
                },
                highlighter: function (item) {
                    return "" + item + "";
                },
                updater: function (item) {
                    $("#link").val(item.substring(item.indexOf('-') + 1, item.length));
                    $("#goodName").val(item.substring(0, item.indexOf('-')));
                    return item;
                }
            });
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

function setValid(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        ad_id: this.ad_id,
        valid: !this.valid
    };
    util.callServerFunction('adminEditAD', postObj, function (data) {
        if(data.statusCode == 900){
            util.toast("操作成功！","success","系统提示");
            loadShopBannerList();
        }else{
            errorCodeApi(data.statusCode);
        }
    })
}

function showSrcImg(){
    $.dialog({
        icon: "icon icon-document-edit",
        title: '原图',
        content: "<div align='center'><button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'left')\"><span class='entypo-ccw'></span>&nbsp;&nbsp;左转</button>&nbsp;&nbsp;"+
        "<button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'right')\">右转&nbsp;&nbsp;<span class='entypo-cw'></span></button></div>" +
        "<br><img style='width:100%;max-width:100%;height:auto' src='"+ this.pic +"' id='testImg'>",
        columnClass: 'col-lg-12 col-md-6 col-sm-3 col-xs-2'
    });
}

var viewModel = function(){
    this.shopBannerList = ko.observableArray();
    this.tempSrc = ko.observable();
    this.ad_id = ko.observable("");
    this.oldSrc = ko.observable("");
    this.initEditBanner = initEditBanner;
    this.setValid = setValid;
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.subLoadShopBannerList = subLoadShopBannerList;
    this.showSrcImg = showSrcImg;
}
var vm = new viewModel();
var xhr = new XMLHttpRequest();
var date = new Date();
var todayStartDate = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00';
var todayEndDate = date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 23:59:59';
var dialog = "";
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("shopBanner"));
    loadShopBannerList();
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    util.initDateTimePicker("time",{});
    document.onkeydown = function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadShopBannerList();
            return false;
        }
    }
});