/**
 * Created by hjy on 2015/11/4 0004.
 */

var pt_id = util.getSessionStorage("pt_id");
util.removeSessionStorage("pt_id");
function initEditArticle(){
    if(pt_id!=""){
        vm.pt_id(pt_id);
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.pt_id = pt_id;
        util.callServerFunction('pubGetMyTopicDetail', postObj, function (data) {
            if (data.statusCode == 900) {
                vm.title(data.detail.title);
                vm.summary(data.detail.summary);
                vm.cover(data.detail.cover);
                vm.createTime(data.detail.createTime);
                vm.content(data.detail.content);
                //vm.ckContent = CKEDITOR.inline("content",vm.ckConfig);
                vm.ckContent = CKEDITOR.replace('content',{
                    filebrowserUploadUrl : '/ckeditor/uploader?Type=File',
                    filebrowserImageUploadUrl : 'http://123.57.16.157:8062/upload',
                    filebrowserFlashUploadUrl : '/ckeditor/uploader?Type=Flash',
                    skin   : 'moono',
                    width  : '99%',
                    height : '500px'
                });
                //vm.ckSummary = CKEDITOR.inline("summary",vm.ckConfig);
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

function addArticle(){
    if(vm.title() == ""){
        util.alert("系统提示","您还没有填写文章标题","s");
    }else if(vm.summary() == ""){
        util.alert("系统提示","您还没有填写文章摘要","s");
    }else if(vm.ckContent.getData() == ""){
        util.alert("系统提示","您还没有填写文章内容","s");
        vm.ckContent.setData("点击填写文章内容");
    }else {
        if (vm.cover() == "") {
            var dataurl = document.getElementById("imageT").src;
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

function selectCover(){
    $("#cover").click();
}

$("#cover").change(function(){
    vm.cover("");
    var file = this.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        // 通过 reader.result 来访问生成的 DataURL
        var url = reader.result;
        var html = "<img id='imageT' src='"+url+"' style='width:100%;height:100%;cursor: pointer' onclick='selectCover()'>"
        $("#img").empty();
        $("#img").append(html);
    };
});

function callback() {
    if(vm.cover()==""){
        if (xhr.readyState == 4) {
            vm.cover(JSON.parse(xhr.response).filePath);
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.title = vm.title();
            postObj.summary = vm.summary();
            postObj.content = vm.ckContent.getData();
            postObj.cover = vm.cover();
            postObj.delete = "";
            postObj.pt_id = vm.pt_id();
            util.callServerFunction('pubEditTopic', postObj, function (data) {
                if (data.statusCode == 900) {
                    util.toast("修改文章成功！", "success", "系统提示");
                } else {
                    util.toast(data.message, "error", "系统提示");
                }
            });
        }
    }else{
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.title = vm.title();
        postObj.summary = vm.summary();
        postObj.content = vm.ckContent.getData();
        postObj.cover = vm.cover();
        postObj.delete = "";
        postObj.pt_id = vm.pt_id();
        util.callServerFunction('pubEditTopic', postObj, function (data) {
            if (data.statusCode == 900) {
                util.toast("修改文章成功！", "success", "系统提示");
            } else {
                util.toast(data.message, "error", "系统提示");
            }
        });
    }
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

var xhr = new XMLHttpRequest();

var viewModel = function(){
    this.title = ko.observable("文章标题");
    this.initEditArticle = initEditArticle;
    this.callback = callback;
    this.title = ko.observable("");
    this.summary = ko.observable("");
    this.cover = ko.observable("");
    this.createTime = ko.observable("");
    this.content = ko.observable("");
    this.pt_id = ko.observable(pt_id);
    this.ckContent = "";
    this.ckSummary = "";
    this.ckConfig = {disableAutoInline: true,
        skin: 'bootstrapck',
        filebrowserImageUploadUrl : 'http://123.57.16.157:8062/upload',
        font_names: '宋体/宋体;黑体/黑体;仿宋/仿宋_GB2312;楷体/楷体_GB2312;隶书/隶书;幼圆/幼圆;微软雅黑/微软雅黑;Arial;Avant Garde;Calibri;Candara;Franklin Gothic Medium;Futura;Helvetica Neue;Impact;Optima;inherit'};
    this.userName = ko.observable(util.getSessionStorage("userName"));
}
var vm = new viewModel();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("addArticle"));
})
initEditArticle();