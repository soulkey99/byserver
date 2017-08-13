/**
 * Created by hjy on 2016/4/27 0027.
 */

function loadPointList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;;
    postObj.pageSize = vm.pageSize();
    postObj.query = $("#keyQ").val();
    postObj.stage = $("#stageQ").val();
    postObj.grade = $("#gradeQ").val();
    postObj.subject = $("#subjectQ").val();
    util.callServerFunction('adminGetStudyPointList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.pointList.removeAll();
            if (data.list.length > 0) {
                vm.pointList(data.list);
                MathJax.Hub.Queue(["Typeset",MathJax.Hub, "pointTable"]);
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadPointList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content: "您已经在最后一页了！"
                })
            }
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
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
        loadPointList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadPointList();
}

function subLoadPointList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadPointList();
}

function initEditPoint(){
    vm.p_id(this.p_id);
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.p_id = this.p_id;
    util.callServerFunction('adminGetStudyPoint', postObj, function (data) {
        if (data.statusCode == 900) {
            var html = "<div id='pointEditDiv'>" +
                "<div class='form-group'><label>知识点标题：</label><input type='text' class='form-control' id='title' value='"+ data.info.title +"'></div>" +
                "<div class='form-group'><label>知识点内容：</label><textarea id='content' style='width: 100%;height: 100px;border-color: #C7D5E0' value='"+ data.info.content +"' onkeyup='contentPreview()'>"+ data.info.content +"</textarea></div>" +
                "<div class='form-group'><label>知识点内容预览：</label><div id='contentPreview' style='width: 100%;height: 100px;border: 1px #C7D5E0 solid;overflow-y: scroll'></div></div>"+
                "<div class='form-group'><label>学段：</label>" +
                    "<select id='stageE' class='form-control valid'>" +
                        "<option value=''>-请选择-</option>" +
                        "<option value='小学'>小学</option>" +
                        "<option value='初中'>初中</option>" +
                        "<option value='高中'>高中</option>" +
                    "</select>" +
                "</div>" +
                "<div class='form-group'><label>年级：</label>" +
                    "<select id='gradeE' class='form-control valid'>" +
                        "<option value=''>-请选择-</option>" +
                        "<option value='一年级'>一年级</option>" +
                        "<option value='二年级'>二年级</option>" +
                        "<option value='三年级'>三年级</option>" +
                        "<option value='四年级'>四年级</option>" +
                        "<option value='五年级'>五年级</option>" +
                        "<option value='六年级'>六年级</option>" +
                        "<option value='七年级'>七年级</option>" +
                        "<option value='八年级'>八年级</option>" +
                        "<option value='九年级'>九年级</option>" +
                    "</select>" +
                "</div>" +
                "<div class='form-group'><label>学科：</label>" +
                    "<select id='subjectE' class='form-control valid'>" +
                        "<option value=''>-请选择-</option>" +
                        "<option value='语文'>语文</option>" +
                        "<option value='数学'>数学</option>" +
                        "<option value='英语'>英语</option>" +
                        "<option value='物理'>物理</option>" +
                        "<option value='化学'>化学</option>" +
                        "<option value='生物'>生物</option>" +
                        "<option value='政治'>政治</option>" +
                        "<option value='地理'>地理</option>" +
                        "<option value='历史'>历史</option>" +
                    "</select>" +
                "</div>" +
                "<div class='form-group'><label>前置知识点：<a href='javascript:void(0)' onclick=\"initSearchPoint('pre')\"><span class='entypo-location'></span>&nbsp;添加前置知识点</a></label>" +
                    "<div data-bind='foreach: prePoints'>" +
                        "<div class='btn-group' style='margin: 5px 5px'>" +
                            "<button type='button' class='btn btn-info'>" +
                                "<span class='entypo-link' title='前置知识点'></span>&nbsp;&nbsp;<span data-bind='text: title'>前置知识点</span></button>" +
                            "<button type='button' class='btn btn-warning' data-bind=\"event: { click: deletePoint.bind($data, 'pre') }\"><span class='entypo-trash' title='删除前置知识点'></span></button>" +
                        "</div>" +
                    "</div>" +
                "</div>" +
                "<div class='form-group'><label>相关知识点：<a href='javascript:void(0)' onclick=\"initSearchPoint('related')\"><span class='entypo-location'></span>&nbsp;添加相关知识点</a></label>" +
                    "<div data-bind='foreach: relatedPoints'>" +
                        "<div class='btn-group' style='margin: 5px 5px'>" +
                        "<button type='button' class='btn btn-info'>" +
                        "<span class='entypo-link' title='相关知识点'></span>&nbsp;&nbsp;<span data-bind='text: title'>相关知识点</span></button>" +
                        "<button type='button' class='btn btn-warning' data-bind=\"event: { click: deletePoint.bind($data, 'related') }\"><span class='entypo-trash' title='删除相关知识点'></span></button>" +
                        "</div>" +
                    "</div>" +
                "</div>" +
                "<div class='form-group'><label>后置知识点：<a href='javascript:void(0)' onclick=\"initSearchPoint('next')\"><span class='entypo-location'></span>&nbsp;添加后置知识点</a></label>" +
                    "<div data-bind='foreach: nextPoints'>" +
                        "<div class='btn-group' style='margin: 5px 5px'>" +
                        "<button type='button' class='btn btn-info'>" +
                        "<span class='entypo-link' title='后置知识点'></span>&nbsp;&nbsp;<span data-bind='text: title'>后置知识点</span></button>" +
                        "<button type='button' class='btn btn-warning' data-bind=\"event: { click: deletePoint.bind($data, 'next') }\"><span class='entypo-trash' title='删除后置知识点'></span></button>" +
                        "</div>" +
                    "</div>" +
                "</div>" +
                "<div class='form-group'><label>备注：</label><textarea id='remark' style='width: 100%;height: 100px;border-color: #C7D5E0' value='"+ data.info.remark +"'>"+ data.info.remark +"</textarea></div>" +
                "<button class='btn btn-primary' onclick=\"subPoint('edit')\">提 交</button>" +
                "</div>";
            dialogPoint = $.dialog({
                icon: "icon icon-edit",
                title: "修改知识点",
                content: html
            });
            $("#stageE").val(data.info.stage);
            $("#gradeE").val(data.info.grade);
            $("#subjectE").val(data.info.subject);
            $("#contentPreview").html(data.info.content);
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "contentPreview"]);
            ko.applyBindings(vm,document.getElementById("pointEditDiv"));

            postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.p_id = data.info.p_id;
            postObj.type = "pre";
            postObj.limit = 0;
            util.callServerFunction('adminGetStudyPointExtra', postObj, function (data) {
                if (data.statusCode == 900) {
                    vm.prePoints(data.list);
                } else {
                    alert(data.message);
                    errorCodeApi(data.statusCode);
                }
            });

            postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.p_id = data.info.p_id;
            postObj.type = "related";
            postObj.limit = 0;
            util.callServerFunction('adminGetStudyPointExtra', postObj, function (data) {
                if (data.statusCode == 900) {
                    vm.relatedPoints(data.list);
                } else {
                    alert(data.message);
                    errorCodeApi(data.statusCode);
                }
            });

            postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.p_id = data.info.p_id;
            postObj.type = "next";
            postObj.limit = 0;
            util.callServerFunction('adminGetStudyPointExtra', postObj, function (data) {
                if (data.statusCode == 900) {
                    vm.nextPoints(data.list);
                } else {
                    alert(data.message);
                    errorCodeApi(data.statusCode);
                }
            });
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
        }
    });
}

function initSearchPoint(sign){
    var html = "<div id='searchPointDiv'>" +
        "<div>" +
        "<form class='form-horizontal' role='form' id='questionForm'>" +
        "<div class='form-group'>" +
        "<div class='col-lg-3'>" +
        "<label class='control-label'>关键词</label>" +
        "<input id='keyES' class='form-control' type='text'>" +
        "<div style='height:10px;'></div>" +
        "</div>" +
        "<div class='col-lg-2'>" +
        "<label class='control-label'>学段</label>" +
        "<select id='stageES' class='form-control valid'>" +
        "<option value=''>全部</option>" +
        "<option value='小学'>小学</option>" +
        "<option value='初中'>初中</option>" +
        "<option value='高中'>高中</option>" +
        "</select>" +
        "<div style='height:10px;'></div>" +
        "</div>" +
        "<div class='col-lg-2'>" +
        "<label class='control-label'>年级</label>" +
        "<select id='gradeES' class='form-control valid'>" +
        "<option value=''>全部</option>" +
        "<option value='一年级'>一年级</option>" +
        "<option value='二年级'>二年级</option>" +
        "<option value='三年级'>三年级</option>" +
        "<option value='四年级'>四年级</option>" +
        "<option value='五年级'>五年级</option>" +
        "<option value='六年级'>六年级</option>" +
        "<option value='七年级'>七年级</option>" +
        "<option value='七年级'>七年级</option>" +
        "<option value='八年级'>八年级</option>" +
        "<option value='九年级'>九年级</option>" +
        "</select>" +
        "<div style='height:10px;'></div>" +
        "</div>" +
        "<div class='col-lg-2'>" +
        "<label class='control-label'>学科</label>" +
        "<select id='subjectES' class='form-control valid'>" +
        "<option value=''>全部</option>" +
        "<option value='语文'>语文</option>" +
        "<option value='数学'>数学</option>" +
        "<option value='英语'>英语</option>" +
        "<option value='物理'>物理</option>" +
        "<option value='化学'>化学</option>" +
        "<option value='生物'>生物</option>" +
        "<option value='政治'>政治</option>" +
        "<option value='地理'>地理</option>" +
        "<option value='历史'>历史</option>" +
        "</select>" +
        "<div style='height:10px;'></div>" +
        "</div>" +
        "<div class='col-lg-3'>" +
        "<label class='control-label'>操作</label><br>" +
        "<button type='button' class='btn btn-rounded' onclick='searchPoint()'><span class='entypo-search'></span>&nbsp;&nbsp;检 索</button>&nbsp;&nbsp;" +
        "</div>" +
        "</div>" +
        "</form>" +
        "</div>" +
        "<div class='table-responsive'>" +
        "<table class='table table-bordered table-striped cf'>" +
        "<thead class='cf'>" +
        "<tr>" +
        "<th align='center' class='col-lg-1'><input type='checkbox' name='selectAll' onclick=\"selectAllPoints('"+ sign +"')\"></th>" +
        "<th align='center' class='col-lg-3'>标题</th>" +
        "<th align='center' class='col-lg-7'>内容</th>" +
        "</tr>" +
        "</thead>" +
        "<tbody data-bind='foreach: points'>" +
        "<tr>" +
        "<td align='center'><input type='checkbox' name='pointId' data-bind='value: p_id' onclick=\"getSelectPoints('"+ sign +"')\"></td>" +
        "<td align='left'><span data-bind='text: title'></span></td>" +
        "<td align='left'><span data-bind='text: content'></span></td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        "</div></div>";
    dialogPoint = $.dialog({
        icon: "icon icon-plus",
        title: "检索知识点",
        content: html,
        columnClass: "col-lg-12"
    });
    ko.applyBindings(vm,document.getElementById("searchPointDiv"));
    vm.points([]);
}

function searchPoint(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = 1;
    postObj.pageSize = 999;
    postObj.query = $("#keyES").val();
    postObj.stage = $("#stageES").val();
    postObj.grade = $("#gradeES").val();
    postObj.subject = $("#subjectES").val();
    util.callServerFunction('adminGetStudyPointList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.points(data.list);
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
        }
    });
}

function selectAllPoints(sign){
    if($("input:checkbox[name='selectAll']").prop("checked")){
        $("input:checkbox[name='pointId']").each(function(){
            $(this).prop("checked",true);
        });
    }else{
        $("input:checkbox[name='pointId']").each(function(){
            $(this).prop("checked",false);
        });
    }
    getSelectPoints(sign);
}

function getSelectPoints(sign){
    $("input:checkbox[name='pointId']").each(function(){
        if($(this).prop("checked")){
            for(var i=0;i<vm.pointList().length;i++){
                if(vm.pointList()[i].p_id == $(this).val()){
                    if(sign == "pre"){
                        if(vm.prePoints.indexOf(vm.pointList()[i]) < 0){
                            vm.prePoints.push(vm.pointList()[i]);
                        }
                    }else if(sign == "related"){
                        if(vm.relatedPoints.indexOf(vm.pointList()[i]) < 0){
                            vm.relatedPoints.push(vm.pointList()[i]);
                        }
                    }else if(sign == "next"){
                        if(vm.nextPoints.indexOf(vm.pointList()[i]) < 0){
                            vm.nextPoints.push(vm.pointList()[i]);
                        }
                    }
                }
            }
        }
    });
}

function deletePoint(sign){
    var ponit = this;
    var sign = sign;
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "确定要删除此知识点吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            if(sign == "pre"){
                vm.prePoints.splice(vm.prePoints.indexOf(ponit),1);
            }else if(sign == "related"){
                vm.relatedPoints.splice(vm.relatedPoints.indexOf(ponit),1);
            }else if(sign == "next"){
                vm.nextPoints.splice(vm.nextPoints.indexOf(ponit),1);
            }
        }
    })
}

function initAddPoint(){
    vm.prePoints([]);
    vm.relatedPoints([]);
    vm.nextPoints([]);
    var html = "<div id='pointAddDiv'>" +
        "<div class='form-group'><label>知识点标题：</label><input type='text' class='form-control' id='title' value=''></div>" +
        "<div class='form-group'><label>知识点内容：</label><textarea id='content' style='width: 100%;height: 100px;border-color: #C7D5E0;overflow-y: scroll' value='' onkeyup='contentPreview()'></textarea></div>" +
        "<div class='form-group'><label>知识点内容预览：</label><div id='contentPreview' style='width: 100%;height: 100px;border: 1px #C7D5E0 solid;overflow-y: scroll'></div></div>"+
        "<div class='form-group'><label>学段：</label>" +
        "<select id='stageE' class='form-control valid'>" +
        "<option value=''>-请选择-</option>" +
        "<option value='小学'>小学</option>" +
        "<option value='初中'>初中</option>" +
        "<option value='高中'>高中</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'><label>年级：</label>" +
        "<select id='gradeE' class='form-control valid'>" +
        "<option value=''>-请选择-</option>" +
        "<option value='一年级'>一年级</option>" +
        "<option value='二年级'>二年级</option>" +
        "<option value='三年级'>三年级</option>" +
        "<option value='四年级'>四年级</option>" +
        "<option value='五年级'>五年级</option>" +
        "<option value='六年级'>六年级</option>" +
        "<option value='七年级'>七年级</option>" +
        "<option value='七年级'>七年级</option>" +
        "<option value='八年级'>八年级</option>" +
        "<option value='九年级'>九年级</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'><label>学科：</label>" +
        "<select id='subjectE' class='form-control valid'>" +
        "<option value=''>-请选择-</option>" +
        "<option value='语文'>语文</option>" +
        "<option value='数学'>数学</option>" +
        "<option value='英语'>英语</option>" +
        "<option value='物理'>物理</option>" +
        "<option value='化学'>化学</option>" +
        "<option value='生物'>生物</option>" +
        "<option value='政治'>政治</option>" +
        "<option value='地理'>地理</option>" +
        "<option value='历史'>历史</option>" +
        "</select>" +
        "</div>" +
        "<div class='form-group'><label>前置知识点：<a href='javascript:void(0)' onclick=\"initSearchPoint('pre')\"><span class='entypo-location'></span>&nbsp;添加前置知识点</a></label>" +
        "<div data-bind='foreach: prePoints'>" +
        "<div class='btn-group' style='margin: 5px 5px'>" +
        "<button type='button' class='btn btn-info'>" +
        "<span class='entypo-link' title='前置知识点'></span>&nbsp;&nbsp;<span data-bind='text: title'>前置知识点</span></button>" +
        "<button type='button' class='btn btn-warning' data-bind=\"event: { click: deletePoint.bind($data, 'pre') }\"><span class='entypo-trash' title='删除前置知识点'></span></button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<div class='form-group'><label>相关知识点：<a href='javascript:void(0)' onclick=\"initSearchPoint('related')\"><span class='entypo-location'></span>&nbsp;添加相关知识点</a></label>" +
        "<div data-bind='foreach: relatedPoints'>" +
        "<div class='btn-group' style='margin: 5px 5px'>" +
        "<button type='button' class='btn btn-info'>" +
        "<span class='entypo-link' title='相关知识点'></span>&nbsp;&nbsp;<span data-bind='text: title'>相关知识点</span></button>" +
        "<button type='button' class='btn btn-warning' data-bind=\"event: { click: deletePoint.bind($data, 'related') }\"><span class='entypo-trash' title='删除相关知识点'></span></button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<div class='form-group'><label>后置知识点：<a href='javascript:void(0)' onclick=\"initSearchPoint('next')\"><span class='entypo-location'></span>&nbsp;添加后置知识点</a></label>" +
        "<div data-bind='foreach: nextPoints'>" +
        "<div class='btn-group' style='margin: 5px 5px'>" +
        "<button type='button' class='btn btn-info'>" +
        "<span class='entypo-link' title='后置知识点'></span>&nbsp;&nbsp;<span data-bind='text: title'>后置知识点</span></button>" +
        "<button type='button' class='btn btn-warning' data-bind=\"event: { click: deletePoint.bind($data, 'next') }\"><span class='entypo-trash' title='删除后置知识点'></span></button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "<div class='form-group'><label>备注：</label><textarea id='remark' style='width: 100%;height: 100px;border-color: #C7D5E0' value=''></textarea></div>" +
        "<button class='btn btn-primary' onclick=\"subPoint('add')\">提 交</button>" +
        "</div>";
    dialogPoint = $.dialog({
        icon: "icon icon-edit",
        title: "修改知识点",
        content: html
    });
    ko.applyBindings(vm,document.getElementById("pointAddDiv"));
}

function contentPreview(){
    $("#contentPreview").html($("#content").val());
    MathJax.Hub.Queue(["Typeset",MathJax.Hub, "contentPreview"]);
}

function subPoint(sign){
    if(checkPoint()) {
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        if (sign == "edit") {
            postObj.p_id = vm.p_id();
        }
        postObj.title = $("#title").val();
        postObj.content = $("#content").val();
        postObj.remark = $("#remark").val();
        postObj.stage = $("#stageE").val();
        postObj.grade = $("#gradeE").val();
        postObj.subject = $("#subjectE").val();
        var preId = []
            , relatedId = []
            , nextId = [];
        for (var i = 0; i < vm.prePoints().length; i++) {
            preId.push(vm.prePoints()[i].p_id);
        }
        for (var i = 0; i < vm.relatedPoints().length; i++) {
            relatedId.push(vm.relatedPoints()[i].p_id);
        }
        for (var i = 0; i < vm.nextPoints().length; i++) {
            nextId.push(vm.nextPoints()[i].p_id);
        }
        postObj.pre = preId.join(",");
        postObj.related = relatedId.join(",");
        postObj.next = nextId.join(",");
        util.callServerFunction('adminEditStudyPoint', postObj, function (data) {
            if (data.statusCode == 900) {
                if (sign == "add") {
                    util.toast("添加知识点成功", "success", "系统提示");
                } else {
                    util.toast("修改知识点成功", "success", "系统提示");
                }
                vm.p_id("");
                dialogPoint.close();
                loadPointList();
            } else {
                alert(data.message);
                errorCodeApi(data.statusCode);
            }
        });
    }
}

function checkPoint(){
    if($("#title").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请输入知识点标题！"
        })
        return false;
    }else if($("#stageE").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择学段！"
        })
        return false;
    }else if($("#gradeE").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择年级！"
        })
        return false;
    }else if($("#subjectE").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择学科！"
        })
        return false;
    }else{
        return true;
    }
}

function showQuestionList(){

}

var viewModel = function(){
    this.p_id = ko.observable("");
    this.pointList = ko.observableArray();
    this.prePoints = ko.observableArray();
    this.relatedPoints = ko.observableArray();
    this.nextPoints = ko.observableArray();
    this.points = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.initEditPoint = initEditPoint;
    this.showQuestionList = showQuestionList;
}
var vm = new viewModel();
var dialogPoint = null;
$(document).ready(function(){
    ko.applyBindings(vm, document.getElementById("studyPointManage"));
    MathJax.Hub.Config({
        showProcessingMessages: false,
        messageStyle: "none",
        jax: ["input/TeX", "output/HTML-CSS"],
        tex2jax: {
            inlineMath: [ ['$','$'], ["\\(","\\)"] ],
            displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
            processEscapes: true
        },
        "HTML-CSS": {
            availableFonts: ["TeX"],
            styles: {
                ".MathJax_Display": {
                    "text-align": "left !important",
                    display: "-webkit-inline-box !important",
                    margin:  "0em 0em !important"
                }
            }
        }
    });
    subLoadPointList();
});