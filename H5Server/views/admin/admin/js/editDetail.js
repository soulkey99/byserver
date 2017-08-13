/**
 * Created by MengLei on 2015/8/3.
 */

//初始化ckEditor
var editorNew = "";

//修改商品
function loadGoodDetail(goodId){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        goodId: goodId
    };
    util.callServerFunction('adminGoodDetail', postObj, function(data){
        if(data.statusCode == 900){
            var picList = [];
            if(data.detail.goodPic instanceof Array){
                for(var i=0; i<data.detail.goodPic.length; i++){
                    picList.push({src: data.detail.goodPic[i]});
                }
            }else{
                picList.push({src: data.detail.goodPic});
            }

            var type = data.detail.type;
            if(data.detail.type == 'rSale'){
                if(data.detail.deliver == 'code'){
                    type = 'rSaleCode';
                }else if(data.detail.deliver == 'mail'){
                    type = 'rSaleMail';
                }
            }
            if(type == 'api'){
                vm.flow(data.detail.detail.quantity);
            }
            if(type == 'lottery'){
                vm.prizeList(data.detail.detail);
            }
            vm.goodName(data.detail.goodName);
            vm.goodPic(picList);
            vm.price(data.detail.price);
            vm.type(type);
            vm.valid(data.detail.valid+"");
            vm.stock(data.detail.stock);
            vm.avatar(data.detail.avatar);
            vm.validTime(util.convertTime2Str(parseFloat(data.detail.validTime)));
            vm.goodInfo(data.detail.goodInfo);
            vm.owner(data.detail.owner);
            vm.ownerName(data.detail.ownerName);
            vm.category(data.detail.category);
            vm.money(data.detail.money);
            vm.seq(data.detail.seq);
            vm.hot(data.detail.hot + "");
            vm.city(data.detail.city.join(","));
            vm.lotteryTimes(data.detail.lotteryTimes);
            editorNew = CKEDITOR.replace('NEWS_CONTENT',{
                filebrowserUploadUrl : '/ckeditor/uploader?Type=File',
                filebrowserImageUploadUrl : 'http://123.57.16.157:8062/upload',
                filebrowserFlashUploadUrl : '/ckeditor/uploader?Type=Flash',
                skin   : 'bootstrapck',
                width  : '99%',
                height : '500px'
            });
            editorNew.setData(vm.goodInfo());
            initCropS();
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

//添加新商品
function confirmDetail(){
    if(vm.type() == "lottery"){
        if(vfp.form()){
            var validTime = new Date($("#sd").val()).getTime();
            var postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                detail: JSON.stringify(vm.prizeList()),
                goodId: goodIdAll || '',
                goodInfo: editorNew.getData(),
                goodName: vm.goodName(),
                avatar: vm.avatar(),
                price: vm.price(),
                type: vm.type(),
                valid: vm.valid(),
                owner: vm.owner(),
                validTime: validTime,
                lotteryTimes: vm.lotteryTimes(),
                seq: vm.seq(),
                hot: vm.hot(),
                city: $("#city").val()
            };
            util.callServerFunction('adminEditDetail', postObj, function (data) {
                if(data.statusCode == 900){
                    //tabShop();
                    util.toast("操作成功！","success","系统提示");
                    $("html body").scrollTop(0);
                }else{
                    errorCodeApi(data.statusCode);
                }
            })
        }
    }else{
        if(vf.form()){
            var goodPic = '';
            for (var i = 0; i < vm.goodPic().length; i++) {
                if (vm.goodPic()[i].src) {
                    goodPic += vm.goodPic()[i].src + ',';
                }
            }
            if (goodPic.length > 2) {
                goodPic = goodPic.substr(0, goodPic.length - 1);
            }
            vm.validTime($("#sd").val());
            var validTime = new Date($("#sd").val()).getTime();
            var type = vm.type();
            var deliver = '';
            if (type == 'rSaleCode') {
                type = 'rSale';
                deliver = 'code';
            } else if (type == 'rSaleMail') {
                type = 'rSale';
                deliver = 'mail';
            }
            var postObj = {
                userID: util.getSessionStorage('userID'),
                authSign: util.getSessionStorage('authSign'),
                goodId: goodIdAll || '',
                goodInfo: editorNew.getData(),
                goodName: vm.goodName(),
                goodPic: goodPic,
                avatar: vm.avatar(),
                price: vm.price(),
                type: type,
                flow: vm.flow(),
                valid: vm.valid(),
                deliver: deliver,
                stock: vm.stock(),
                owner: vm.owner(),
                validTime: validTime,
                category: vm.category(),
                money: vm.money(),
                seq: vm.seq(),
                hot: vm.hot(),
                city: $("#city").val()
            };
            util.callServerFunction('adminEditDetail', postObj, function (data) {
                if(data.statusCode == 900){
                    util.toast("操作成功！","success","系统提示");
                    $("html body").scrollTop(0);
                    //tabShop();
                }else{
                    errorCodeApi(data.statusCode);
                }
            })
        }
    }
}

//选择商家列表
function onTypeChanged(obj){
    vm.type(obj.options[obj.options.selectedIndex].value);
}

function closePopup(){
    $('#popupShopList').hide();
    $('#popupUpload').hide();
    $('#popupImgView').hide();
}

//获取商家列表
function onGetShopList(){
    var html = "<div>";
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign')
    };
    util.callServerFunction('adminGetShopList', postObj, function(resp){
        //
        if(resp.statusCode == 900){
            vm.shopList.removeAll();
            var list = [];
            for(var i=0; i<resp.list.length; i++){
                list.push({
                    shopID: resp.list[i].shopID,
                    shopName: resp.list[i].shopName,
                    checked: ko.observable(true)
                })
                html += "<button type='button' class='btn btn btn-info btn-md' onclick=\"shopConfirm('"+resp.list[i].shopID+"','"+resp.list[i].shopName+"')\" style='margin:0px 5px 5px 0px'>"+
                    "<span class='glyphicon glyphicon-user'></span>"+resp.list[i].shopName+
                    "</button>";
            }
            //vm.shopList(list);
            html += "</div>";
            dialog = $.dialog({
                icon: "icon icon-user-group",
                title: '选择商户ID',
                content: html
            });
        }else{
            util.errorCodeApi(resp.statusCode);
        }
    });
    $('#popupShopList').show();
}

function shopConfirm(shopIDTemp,shopName){
    vm.owner(shopIDTemp);
    vm.ownerName(shopName);
    $("#prizeOwnerShow").val(shopName);
    $("#prizeOwner").val(shopIDTemp);
    dialog.close();
}

function onGetShopListPriez(){
    var html = "<div>";
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign')
    };
    util.callServerFunction('adminGetShopList', postObj, function(resp){
        //
        if(resp.statusCode == 900){
            vm.shopList.removeAll();
            var list = [];
            for(var i=0; i<resp.list.length; i++){
                list.push({
                    shopID: resp.list[i].shopID,
                    shopName: resp.list[i].shopName,
                    checked: ko.observable(true)
                })
                html += "<button type='button' class='btn btn btn-info btn-md' onclick=\"shopConfirmPriez('"+resp.list[i].shopID+"','"+resp.list[i].shopName+"')\" style='margin:0px 5px 5px 0px'>"+
                    "<span class='glyphicon glyphicon-user'></span>"+resp.list[i].shopName+
                    "</button>";
            }
            //vm.shopList(list);
            html += "</div>";
            dialog = $.dialog({
                icon: "icon icon-user-group",
                title: '选择商户ID',
                content: html
            });
        }else{
            util.errorCodeApi(resp.statusCode);
        }
    });
    $('#popupShopList').show();
}

function shopConfirmPriez(shopIDTemp,shopName){
    $("#prizeOwnerShow").val(shopName);
    $("#prizeOwner").val(shopIDTemp);
    dialog.close();
}

function delPic(){
    vm.goodPic.remove(this);
}

function viewPic(){
    if(this.src){
        vm.previewImg(this.src);
    }else{
        vm.previewImg(vm.avatar());
    }
    $("#popupImgView").fadeIn('slow');
}

//初始化截图框
function setCrop(l,t,w,h,ob){
    $('.'+ob+' > img').cropper("setCropBoxData",{"left":l,"top":t,"width":w,"height":h,"rotate":0,"scaleX":1,"scaleY":1});
}

//初始化小尺寸截图插件
function initCropS() {
    $('.cropperS > img').cropper({
        strict: false,
        guides: false,
        highlight: false,
        dragCrop: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
        setCropBoxData : {
            left : 35,
            top : 20,
            width : 640,
            height : 360
        },
        minCanvasWidth: 570,
        minCanvasHeight: 320,
        autoCropArea: 1
    });
    setCrop(35, 20, 570, 320, "cropperS");
}

//初始化大尺寸截图插件
function initCropB() {
    $('.cropperB > img').cropper({
        strict: false,
        guides: false,
        highlight: false,
        dragCrop: false,
        cropBoxMovable: false,
        cropBoxResizable: false,
        setCropBoxData : {
            left : 32,
            top : 18,
            width : 1306,
            height : 736
        },
        minCanvasWidth: 1242,
        minCanvasHeight: 700,
        autoCropArea: 1
    });
    setCrop(32, 18, 1242, 700, "cropperB");
}

//将DataURL数据转换成Blob类型(大文件，图片，声音)
function dataURLtoBlob(dataurl) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)[1],
        bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}

//上传截取后的小尺寸图片
function getCropImgS(){
    var cropImg = $('.cropperS > img').cropper("getCroppedCanvas",{width:570,height:320});
    var dataurl = cropImg.toDataURL('image/png');
    var blob = dataURLtoBlob(dataurl);
    var fd = new FormData();
    fd.append("upload", blob, "image.png");
    xhr.open('POST', '/upload', true);
    xhr.onreadystatechange = callbackS;
    xhr.send(fd);
}

//上传截取后的大尺寸图片
function getCropImgB(){
    var cropImg = $('.cropperB > img').cropper("getCroppedCanvas",{width:1242,height:700});
    var dataurl = cropImg.toDataURL('image/png');
    var blob = dataURLtoBlob(dataurl);
    var fd = new FormData();
    fd.append("upload", blob, "image.png");
    xhr.open('POST', '/upload', true);
    xhr.onreadystatechange = callbackB;
    xhr.send(fd);
}

//上传截取后的小尺寸图片回调函数
function callbackS() {
    //在这里面没有使用this.readyState这是因为IE下面ActiveXObject的特殊性
    if (xhr.readyState == 4 && xhr.status === 200) {//readyState表示文档加载进度,4表示完毕
        vm.avatar(JSON.parse(xhr.response).filePath);
        util.toast("上传成功！","success","提示信息");
    }
}

//上传截取后的大尺寸图片回调函数
function callbackB() {
    //在这里面没有使用this.readyState这是因为IE下面ActiveXObject的特殊性
    if (xhr.readyState == 4 && xhr.status === 200) {//readyState表示文档加载进度,4表示完毕
        var item = {
            src:JSON.parse(xhr.response).filePath
        };
        vm.goodPic.push(item);
        util.toast("上传成功！","success","提示信息");
    }
}

//显示添加新奖项
function initAddPrize(){
    var html = "<div class='form-group'>"+
            "<label>奖品名称：</label><input type='text' class='form-control' id='prizeName'>"+
            "</div>"+
            "<div class='form-group'>"+
            "<label>奖品发放方式：</label>" +
            "<select class='form-control' id='prizeDeliver'>"+
                "<option value=''>-请选择-</option>"+
                "<option value='api'>流量充值</option>"+
                "<option value='code'>实物兑换(兑换码)</option>"+
                "<option value='mail'>实物兑换(物流)</option>"+
                "<option value='bonus'>积分</option>"+
            "</select>"+
            "</div>"+
            "<div class='form-group'>"+
            "<label>库存：</label><input type='text' class='form-control' id='prizeStock'>"+
            "</div>"+
            "<div class='form-group'>"+
            "<label>商品所属商家：</label><input type='text' class='form-control' id='prizeOwnerShow' readonly data-bind='value: ownerName' placeholder='点击下方按钮选择商户ID'>"+
            "<input type='hidden' class='form-control' id='prizeOwner'><input type='button' value='查询商户ID' class='btn btn-default' onclick=\"onGetShopListPriez()\">"+
            "</div>"+
            "<div class='form-group'>"+
            "<label>商品结算价格：</label><input type='text' class='form-control' id='prizeMoney'>"+
            "</div>"+
            "<div class='form-group'>"+
            "<label>中奖等级 例：1（一等奖），2（二等奖）</label><input type='text' class='form-control' id='prizeRank'>"+
            "</div>"+
            "<div class='form-group'>"+
            "<label>中奖概率：</label><div><input type='text' class='form-control' id='prizeProbability' style='width:20%;display:inline'>% （百分比）</div>"+
            "</div>"+
            "<div class='form-group'>"+
            "<label>奖项等级描述：</label><input type='text' class='form-control' id='prizeRankDesc'>"+
            "</div>"+
            "<button class='btn btn-primary' onclick='addPrize()'>确 定</button>";
    dialog = $.dialog({
        icon: 'icon icon-plus',
        title: '添加奖项',
        content: html
    });
}

function addPrize(){
    var option = {
        name: $("#prizeName").val(),
        deliver: $("#prizeDeliver").val(),
        stock: $("#prizeStock").val(),
        owner: $("#prizeOwner").val(),
        money: $("#prizeMoney").val(),
        rank: $("#prizeRank").val(),
        probability: $("#prizeProbability").val()/100,
        rankDesc: $("#prizeRankDesc").val(),
        ownerName: $("#prizeOwnerShow").val()
    }
    vm.prizeList.push(option);
    dialog.close();
    util.toast("添加奖项成功！","success","提示信息");
}

function initEditPrize(){
    var html = "<div class='form-group'>"+
        "<label>奖品名称：</label><input type='text' class='form-control' id='prizeName' value='"+this.name+"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>奖品发放方式：</label>" +
        "<select class='form-control' id='prizeDeliver'>"+
            "<option value=''>-请选择-</option>";
    if(this.deliver == 'api'){
        html += "<option value='api' selected>流量充值</option>";
    }else{
        html += "<option value='api'>流量充值</option>";
    }
    if(this.deliver == 'code'){
        html += "<option value='code' selected>实物兑换(兑换码)</option>";
    }else{
        html += "<option value='code'>实物兑换(兑换码)</option>";
    }
    if(this.deliver == 'mail'){
        html += "<option value='mail' selected>实物兑换(物流)</option>";
    }else{
        html += "<option value='mail'>实物兑换(物流)</option>";
    }
    if(this.deliver == 'bonus'){
        html += "<option value='bonus' selected>积分</option>";
    }else{
        html += "<option value='bonus'>积分</option>";
    }
    html += "</select>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>库存：</label><input type='text' class='form-control' id='prizeStock' value='"+this.stock+"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>商品所属商家：</label><input type='text' class='form-control' id='prizeOwnerShow' readonly data-bind='value: ownerName' placeholder='点击下方按钮选择商户ID' value='"+this.ownerName+"'>"+
        "<input type='hidden' class='form-control' id='prizeOwner' value='"+this.owner+"'><input type='button' value='查询商户ID' class='btn btn-default' onclick=\"onGetShopListPriez()\">"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>商品结算价格：</label><input type='text' class='form-control' id='prizeMoney' value='"+this.money+"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>中奖等级 例：1（一等奖），2（二等奖）</label><input type='text' class='form-control' id='prizeRank' value='"+this.rank+"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>中奖概率：</label><div><input type='text' class='form-control' id='prizeProbability' value='"+this.probability*100+"' style='width:20%;display:inline'>% （百分比）</div>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>奖项等级描述：</label><input type='text' class='form-control' id='prizeRankDesc' value='"+this.rankDesc+"'>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='editPrize("+vm.prizeList.indexOf(this)+")'>确 定</button>";
    dialog = $.dialog({
        icon: 'icon icon-plus',
        title: '修改奖项',
        content: html
    });
}

function editPrize(index){
    var option = {
        name: $("#prizeName").val(),
        deliver: $("#prizeDeliver").val(),
        stock: $("#prizeStock").val(),
        owner: $("#prizeOwner").val(),
        money: $("#prizeMoney").val(),
        rank: $("#prizeRank").val(),
        probability: $("#prizeProbability").val()/100,
        rankDesc: $("#prizeRankDesc").val(),
        ownerName: $("#prizeOwnerShow").val()
    }
    vm.prizeList.splice(index,1,option);
    dialog.close();
    util.toast("修改奖项成功！","success","提示信息");
}

function deletePrize(){
    dialog = $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '删除奖项',
        content: "确定要删除 "+this.rankDesc+" 奖项吗！",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function(){
            vm.prizeList.splice(vm.prizeList.indexOf(this),1);
            dialog.close();
            util.toast("删除奖项成功！","success","提示信息");
        }
    });
}

var dialog;
var xhr = new XMLHttpRequest();
var viewModel = function(){
    this.shopList = ko.observableArray();
    this.goodName = ko.observable("");
    this.goodId = ko.observable("");
    this.price = ko.observable("");
    this.flow = ko.observable("");
    this.avatar = ko.observable("../img/640360.png");
    this.type = ko.observable("");
    this.stock = ko.observable("");
    this.validTime = ko.observable("");
    this.valid = ko.observable("");
    this.goodInfo = ko.observable("");
    this.goodPic = ko.observableArray();
    this.owner = ko.observable("");
    this.previewImg = ko.observable("");
    this.delPic = delPic;
    this.viewPic = viewPic;
    this.ownerName = ko.observable("");
    this.category = ko.observable("");
    this.money = ko.observable("");
    this.seq = ko.observable("");
    this.hot = ko.observable("");
    this.city = ko.observable("");

    this.initAddPrize = initAddPrize;
    this.initEditPrize = initEditPrize;
    this.deletePrize = deletePrize;
    this.prizeList = ko.observableArray();
    this.lotteryTimes = ko.observable("");
};
var vm = new viewModel();
ko.applyBindings(vm,document.getElementById("editDetailTable"));
$('#getting-started').countdown('2015/01/01', function(event) {
    $(this).html(event.strftime('<span>%M</span>' + '<span class="start-min">:</span>' + '<span class="start-min">%S</span>'));
});
util.initDateTimePicker("sd",{});
var goodId = util.querystring('goodId')[0];
if(goodIdAll) {
    //修改详情
    loadGoodDetail(goodIdAll);
}else{
    //新增商品
    vm.goodPic([{src: ''}, {src: ''}, {src: ''}, {src: ''}, {src: ''}]);
    //初始化ckeditor
    editorNew = CKEDITOR.replace('NEWS_CONTENT',{
        filebrowserUploadUrl : '/ckeditor/uploader?Type=File',
        filebrowserImageUploadUrl : 'http://123.57.16.157:8062/upload',
        filebrowserFlashUploadUrl : '/ckeditor/uploader?Type=Flash',
        skin   : 'bootstrapck',
        width  : '99%',
        height : '500px'
    });
    initCropS();
}

//切换小裁剪图片
$("#imgSelectS").change(function() {
    var file = this.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        // 通过 reader.result 来访问生成的 DataURL
        var url = reader.result;
        $('.cropperS > img').cropper('replace', url);
        setCrop(35, 20, 570, 320,"cropperS");
    };
});

//切换大裁剪图片
$("#imgSelectB").change(function() {
    var file = this.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        // 通过 reader.result 来访问生成的 DataURL
        var url = reader.result;
        $('.cropperB > img').cropper('replace', url);
        setCrop(32, 18, 1242, 700,"cropperB");
    };
});

//初始化验证一般商品验证
var vf = $('#goodForm').validate({
    rules: {
        goodName: {
            minlength: 2,
            required: true
        },
        price: {
            minlength: 1,
            number:true,
            required: true
        },
        priceTrue: {
            minlength: 1,
            number:true,
            required: true
        },
        flow: {
            minlength: 1,
            digits:true,
            required: true
        },
        stock: {
            minlength: 1,
            digits:true,
            required: true
        },
        validTime: {
            date:true ,
            required: true
        },
        owner: {
            required: true
        },
        NEWS_CONTENT: {
            minlength: 1,
            required: true
        }
    },
    highlight: function(element) {
        $(element).closest('.control-group').removeClass('success').addClass('error');
    },
    success: function(element) {
        element.text('OK!').addClass('valid').closest('.control-group').removeClass('error').addClass('success');
    }
});

//初始化奖品商品验证
var vfp = $('#goodForm').validate({
    rules: {
        goodName: {
            minlength: 2,
            required: true
        },
        price: {
            minlength: 1,
            number:true,
            required: true
        },
        lotteryTimes: {
            minlength: 1,
            number:true,
            required: true
        },
        validTime: {
            date:true ,
            required: true
        },
        owner: {
            required: true
        },
        NEWS_CONTENT: {
            minlength: 1,
            required: true
        }
    },
    highlight: function(element) {
        $(element).closest('.control-group').removeClass('success').addClass('error');
    },
    success: function(element) {
        element.text('OK!').addClass('valid').closest('.control-group').removeClass('error').addClass('success');
    }
});

//初始化截图工具
//initCropS();
initCropB();

//初始化城市选择插件
$("#city").kuCity();