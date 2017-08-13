/**
 * Created by hjy on 2015/11/3 0003.
 */

function loadArticleList() {
    $('html,body').scrollTop(0);
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1) * vm.pageSize() + 1;
    postObj.pageSize = vm.pageSize();
    postObj.startTime = new Date($("#startTime").val() + " 00:00:00").getTime();
    postObj.endTime = new Date($("#endTime").val() + " 23:59:59").getTime();
    postObj.delete = "";
    util.callServerFunction('pubGetMyTopicList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.articleList.removeAll();
            if (data.list.length > 0) {
                for(var i=0;i<data.list.length;i++){
                    vm.articleList.push({
                        cover: data.list[i].cover,
                        createTime: util.convertTime2Str(data.list[i].createTime),
                        summary: data.list[i].summary,
                        title: data.list[i].title,
                        pt_id: data.list[i].pt_id
                    });
                }
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos()-1);
                util.alert("系统提示","您已经在最后一页了！","s");
                loadArticleList();
            } else {
                util.alert("系统提示","哎呦！没有数据哦！","s");
            }
        } else {
            util.alert("系统提示",data.message,"s");
        }
    });
}

function prevPage(){
    if(vm.startPos()==1){
        util.alert("系统提示","您已经在第一页了！","s");
    }else{
        vm.startPos(vm.startPos()-1);
        loadArticleList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadArticleList();
}

function showArticleDeTail(){
    var pt_id = this.pt_id;
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.pt_id = pt_id;
    util.callServerFunction('pubGetMyTopicDetail', postObj, function (data) {
        if (data.statusCode == 900) {
            var html = "<div>"+
                "<div class='row' style='padding:5px'>"+
                "<div class='large-12'>"+data.detail.title+"</div>"+
                "<div class='large-12'>"+util.convertTime2Str(data.detail.createTime)+"</div>"+
                "<div class='large-12' style='height: 1px;background: #CCCCCC'></div>"+
                "<div class='large-12' id='content'>"+data.detail.content+"</div>"+
                "</div>";
            util.alert("文章详情",html,"m");
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function editArticle(){
    util.setSessionStorage("pt_id",this.pt_id);
    tabEditArticle();
}

function delArticle(){
    var pt_id = this.pt_id;
    util.confirm("文章详情","是否要删除 '"+this.title+"' 此篇文章？",function(){
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.pt_id = pt_id;
        postObj.delete = true;
        util.callServerFunction('pubEditTopic',postObj, function(data){
            if(data.statusCode == 900){
                util.toast("删除文章成功！", "success", "系统提示");
                loadArticleList();
            }else{
                util.toast(data.message,"error","系统提示");
            }
        });
    },"m");
}

function subLoadArticleList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadArticleList();
}

var dialog;
var viewModel = function(){
    this.articleList = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.loadArticleList = loadArticleList;
    this.subLoadArticleList =subLoadArticleList;
    this.showArticleDeTail = showArticleDeTail;
    this.delArticle = delArticle;
    this.editArticle = editArticle;
}
var vm = new viewModel();
var date = new Date();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("articleList"));
    var nowTemp = new Date();
    var now = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
    var checkin = $('#startTime').fdatepicker({
        format: 'yyyy/mm/dd',
        language: 'zh-CN'
    }).on('changeDate', function (ev) {
        if (ev.date.valueOf() > checkout.date.valueOf()) {
            var newDate = new Date(ev.date)
            newDate.setDate(newDate.getDate() + 1);
            checkout.update(newDate);
        }
        checkin.hide();
        $('#endTime')[0].focus();
    }).data('datepicker');
    var checkout = $('#endTime').fdatepicker({
        format: 'yyyy/mm/dd',
        language: 'zh-CN'
    }).on('changeDate', function (ev) {
        checkout.hide();
    }).data('datepicker');
    $("#startTime").val(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate());
    $("#endTime").val(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate());
    //loadArticleList();
});