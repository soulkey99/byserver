/**
 * Created by hjy on 2015/11/6 0006.
 */

var pm_id = util.getSessionStorage("pm_id");
util.removeSessionStorage("pm_id");

function initEditNews(){
    if(pm_id!=""){
        vm.pm_id(pm_id);
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.pm_id = pm_id;
        util.callServerFunction('pubGetMyMsgDetail', postObj, function (data) {
            if (data.statusCode == 900) {
                vm.pt_title(data.detail.title);
                vm.type(data.detail.type);
                vm.summary(data.detail.summary);
                vm.castType(data.detail.castType);
                vm.pm_id(data.detail.pm_id);
                vm.pt_id(data.detail.pt_id);
                vm.cover(data.detail.cover);
                vm.text(data.detail.text);
                vm.title(data.detail.title);
                vm.link(data.detail.link);
                vm.ptList(data.detail.list);
                vm.createTime(util.convertTime2Str(data.detail.createTime));
                if(vm.type() == "text" || vm.type() == "link" || vm.type() == "richText"){
                    ckText = CKEDITOR.replace('text',{
                        filebrowserUploadUrl : '/ckeditor/uploader?Type=File',
                        filebrowserImageUploadUrl : 'http://123.57.16.157:8062/upload',
                        filebrowserFlashUploadUrl : '/ckeditor/uploader?Type=Flash',
                        skin   : 'moono',
                        width  : '99%',
                        height : '500px'
                    });
                    ckText.setData(vm.text());
                }
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

function onTypeChanged(obj){
    vm.type(obj.options[obj.options.selectedIndex].value);
    ckText.setData("");
}

function editNews(){
    if(vm.type() == ""){
        util.alert("系统提示","您还没有选择消息类型","s");
    }else if(vm.type() == "single"){
        if(vm.pt_id() == ""){
            util.alert("系统提示","您还没有选择文章","s");
        }else{
            callback();
        }
    }else if(vm.type() == "multi"){
        if(vm.ptList().length <= 0 ){
            util.alert("系统提示","您还没有选择文章","s");
        }else{
            callback();
        }
    }else if(vm.type() == "text"){
        if(ckText.getData() == ""){
            util.alert("系统提示","您还没有填写消息内容","s");
        }else{
            callback();
        }
    }else if(vm.type() == "link"){
        if($("#title").val() == ""){
            util.alert("系统提示","您还没有填写消息标题","s");
        }else if(ckText.getData() == ""){
            util.alert("系统提示","您还没有填写消息内容","s");
        }else if($("#title").val() == ""){
            util.alert("系统提示","您还没有填写封面跳转链接","s");
        }else if(vm.cover() == ""){
            util.alert("系统提示","您还没有上传消息封面","s");
        }else{
            if(vm.coverTemp()!="") {
                var dataurl = document.getElementById("imageT").src;
                var blob = dataURLtoBlob(dataurl);
                var fd = new FormData();
                fd.append("upload", blob, "image.png");
                xhr.open('POST', '/upload', true);
                xhr.onreadystatechange = callback;
                xhr.send(fd);
            }else{
                callback();
            }
        }
    }else if(vm.type() == "richText") {
        if($("#title").val() == ""){
            util.alert("系统提示","您还没有填写消息标题","s");
        }else if(ckText.getData() == ""){
            util.alert("系统提示","您还没有填写消息内容","s");
        }else{
            callback();
        }
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
        vm.coverTemp(url);
        var html = "<div onclick='selectCover()' style='cursor: pointer'><img id='imageT' src='"+url+"' style='width:450px;height:250px'></div>"
        $("#img").empty();
        $("#img").append(html);
    };
});

function callback() {
    //在这里面没有使用this.readyState这是因为IE下面ActiveXObject的特殊性
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.castType = "broadcast";
    postObj.type = vm.type();
    postObj.pm_id = vm.pm_id();
    if(vm.type()=="single"){
        postObj.pt_id = vm.pt_id();
        util.callServerFunction('pubEditMsg',postObj, function(data){
            if(data.statusCode == 900){
                util.toast("修改消息成功！","success","系统提示");
            }else{
                util.toast(data.message,"error","系统提示");
            }
        });
    }else if(vm.type()=="multi"){
        postObj.list = JSON.stringify(vm.ptList());
        util.callServerFunction('pubEditMsg',postObj, function(data){
            if(data.statusCode == 900){
                util.toast("修改消息成功！","success","系统提示");
            }else{
                util.toast(data.message,"error","系统提示");
            }
        });
    }else if(vm.type()=="text"){
        postObj.text = ckText.getData();
        util.callServerFunction('pubEditMsg',postObj, function(data){
            if(data.statusCode == 900){
                util.toast("修改消息成功！","success","系统提示");
            }else{
                util.toast(data.message,"error","系统提示");
            }
        });
    }else if(vm.type()=="link"){
        if(vm.coverTemp()!=""){
            if (xhr.readyState == 4) {//readyState表示文档加载进度,4表示完毕
                imgUrl = JSON.parse(xhr.response).filePath;
                postObj.text = ckText.getData();
                postObj.link = $("#link").val();
                postObj.title = $("#title").val();
                postObj.cover = imgUrl;
                util.callServerFunction('pubEditMsg',postObj, function(data){
                    if(data.statusCode == 900){
                        util.toast("修改消息成功！","success","系统提示");
                    }else{
                        util.toast(data.message,"error","系统提示");
                    }
                });
            }
        }else{
            postObj.text = ckText.getData();
            postObj.link = $("#link").val();
            postObj.title = $("#title").val();
            postObj.cover = vm.cover();
            util.callServerFunction('pubEditMsg',postObj, function(data){
                if(data.statusCode == 900){
                    util.toast("修改消息成功！","success","系统提示");
                }else{
                    util.toast(data.message,"error","系统提示");
                }
            });
        }
    }else if(vm.type()=="richText"){
        postObj.text = ckText.getData();
        postObj.title = $("#title").val();
        util.callServerFunction('pubEditMsg',postObj, function(data){
            if(data.statusCode == 900){
                util.toast("修改消息成功！","success","系统提示");
            }else{
                util.toast(data.message,"error","系统提示");
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

function showArticleList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 999999;
    util.callServerFunction('pubGetMyTopicList', postObj, function (data) {
        if(data.statusCode == 900){
            var html = "<div class='row'><div class='large-12 columns'>";
            if(data.list.length > 0){
                vm.articleList(data.list);
                for(var i=0;i<data.list.length;i++){
                    if(vm.type()=="single"){
                        if(vm.pt_id() == data.list[i].pt_id){
                            html += "<div><input id='articleBox"+i+"' name='articleBox' type='radio' value='"+data.list[i].pt_id+"' checked='true'><label for='articleBox"+i+"'>"+data.list[i].title+"</label></div>";
                        }else{
                            html += "<div><input id='articleBox"+i+"' name='articleBox' type='radio' value='"+data.list[i].pt_id+"'><label for='articleBox"+i+"'>"+data.list[i].title+"</label></div>";
                        }
                    }else{
                        if(checkPtId(data.list[i].pt_id)){
                            html += "<div><input name='box' id='articleBox"+i+"' type='checkbox' value='"+data.list[i].pt_id+"' checked='true'><label for='articleBox"+i+"'>"+data.list[i].title+"</label></div>";
                        }else{
                            html += "<div><input name='box' id='articleBox"+i+"' type='checkbox' value='"+data.list[i].pt_id+"'><label for='articleBox"+i+"'>"+data.list[i].title+"</label></div>";
                        }
                    }
                }
                html += "</div><div><div class='row' align='center'><a href='javascript:getPts()' class='button small secondary'>确 定</a></div>";
            }else{
                html += "哎呦！没有数据哦！</div><div>";
            }
            dialog = util.dialog("文章列表",html,"m");
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function getPts(){
    if(vm.type()=="single"){
        vm.pt_id($('input:radio[name=articleBox]:checked').val());
        vm.pt_title(getTitle(vm.pt_id()));
    }else if(vm.type()=="multi"){
        var i = 0;
        var option = {};
        vm.ptList.removeAll();
        $("input:checkbox").each(function() {
            if ($(this).prop("checked") == true) {
                option = {
                    seq: i,
                    pt_id: $(this).val(),
                    title: getTitle($(this).val())
                }
                vm.ptList.push(option);
                i++;
            }
        })
    }
    dialog.close();
}

function getTitle(pt_id){
    for(var i=0;i<vm.articleList().length;i++){
        if(vm.articleList()[i].pt_id == pt_id){
            return vm.articleList()[i].title;
        }
    }
}

function checkPtId(ptId){
    var temp = false;
    $.each(vm.ptList(),function(k,v){
        if(v.pt_id == ptId){
            temp = true;
        }
    });
    return temp;
}

function delPt(){
    vm.ptList.splice(vm.ptList.indexOf(this),1);
}

var ckConfig = {
    disableAutoInline: true,
    skin: 'bootstrapck',
    filebrowserImageUploadUrl : 'http://123.57.16.157:8062/upload',
    font_names: '宋体/宋体;黑体/黑体;仿宋/仿宋_GB2312;楷体/楷体_GB2312;隶书/隶书;幼圆/幼圆;微软雅黑/微软雅黑;Arial;Avant Garde;Calibri;Candara;Franklin Gothic Medium;Futura;Helvetica Neue;Impact;Optima;inherit'

}
var ckText = "",dialog = "",imgUrl = "";
var xhr = new XMLHttpRequest();

var viewModel = function(){
    this.callback = callback;
    this.showArticleList = showArticleList;
    this.delPt = delPt;
    this.editNews = editNews;
    this.initEditNews = initEditNews;
    this.title = ko.observable("");
    this.text = ko.observable("");
    this.link = ko.observable("");
    this.type = ko.observable("");
    this.summary = ko.observable("");
    this.castType = ko.observable("");
    this.cover = ko.observable("");
    this.coverTemp = ko.observable("");
    this.createTime = ko.observable("");
    this.pm_id = ko.observable("");
    this.pt_id = ko.observable("");
    this.pt_title = ko.observable("");
    this.ptList = ko.observableArray();
    this.articleList = ko.observableArray();
}
var vm = new viewModel();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("editNews"));
    initEditNews();
})