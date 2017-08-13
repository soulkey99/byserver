/**
 * Created by hjy on 2015/11/3 0003.
 */

function addArticle(){
    if(vm.title() == ""){
        util.alert("系统提示","您还没有填写文章标题","s");
    }else if(document.getElementById("imageT") == null){
        util.alert("系统提示","您还没有上传封面图片","s");
    }else if($("#summary").val() == ""){
        util.alert("系统提示","您还没有填写文章摘要","s");
    }else if(ckContent.getData() == ""){
        util.alert("系统提示","您还没有填写文章内容","s");
        ckContent.setData("点击填写文章内容");
    }else{
        var dataurl = document.getElementById("imageT").src;
        var blob = dataURLtoBlob(dataurl);
        var fd = new FormData();
        fd.append("upload", blob, "image.png");
        xhr.open('POST', '/upload', true);
        xhr.onreadystatechange = callback;
        xhr.send(fd);
    }
}

function selectCover(){
    $("#cover").click();
}

$("#cover").change(function(){
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
    if (xhr.readyState == 4) {//readyState表示文档加载进度,4表示完毕
        imgUrl = JSON.parse(xhr.response).filePath;
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.title = vm.title();
        postObj.summary = $("#summary").val();
        postObj.content = ckContent.getData();
        postObj.cover = imgUrl;
        postObj.delete = "";
        util.callServerFunction('pubEditTopic', postObj, function (data) {
            if (data.statusCode == 900) {
                util.toast("发布文章成功！", "success", "系统提示");
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

function callBack(){
    window.parent.CKEDITOR.tools.callFunction(1,data.filePath);
}

var ckConfig = {
    disableAutoInline: true,
    skin: 'bootstrapck',
    filebrowserImageUploadUrl : 'http://123.57.16.157:8062/upload',
    font_names: '宋体/宋体;黑体/黑体;仿宋/仿宋_GB2312;楷体/楷体_GB2312;隶书/隶书;幼圆/幼圆;微软雅黑/微软雅黑;Arial;Avant Garde;Calibri;Candara;Franklin Gothic Medium;Futura;Helvetica Neue;Impact;Optima;inherit'

}
//var ckContent = CKEDITOR.inline("content",ckConfig);
//var ckContent = CKEDITOR.replace('content',{
//    filebrowserUploadUrl : '/ckeditor/uploader?Type=File',
//    filebrowserImageUploadUrl : 'http://123.57.16.157:8062/upload',
//    filebrowserFlashUploadUrl : '/ckeditor/uploader?Type=Flash',
//    skin   : 'moono',
//    width  : '99%',
//    height : '500px'
//});

var imgUrl = "";
var xhr = new XMLHttpRequest();

var viewModel = function(){
    this.title = ko.observable("");
    this.callback = callback;
    this.userName = ko.observable(util.getSessionStorage("userName"));
}
var vm = new viewModel()
    , ue = UE.getEditor('content',
        {
            imageActionName: "/upload",
            imageAllowFiles: [".png", ".jpg", ".jpeg", ".gif", ".bmp"]
        });
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("addArticle"));
});