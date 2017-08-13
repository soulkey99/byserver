/**
 * Created by hjy on 2016/2/19 0019.
 */

function subLoadOffLineQuestionList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadOffLineQuestionList();
}

/*
 获取离线问题列表
 */
function loadOffLineQuestionList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.startTime = new Date($("#startTime").val()).getTime();
    postObj.endTime = new Date($("#endTime").val()).getTime();
    postObj.section = "instant";
    util.callServerFunction('adminGetOfflineTopics',postObj, function(data){
        if(data.statusCode == 900){
            vm.offLineQuestionList.removeAll();
            if(data.list.length > 0) {
                var list = [];
                for (var i = 0; i < data.list.length; i++) {
                    var tag = "";
                    if(data.list[i].tag.length>0){
                        for(var j=0;j<data.list[i].tag.length;j++){
                            tag += "<span class='label label-info'>"+data.list[i].tag[j]+"</span>&nbsp;";
                        }
                    }
                    list.push({
                        id: (i+1),
                        off_id: data.list[i].off_id,
                        author_id: data.list[i].author_id,
                        author_nick: data.list[i].author_nick,
                        author_avatar: data.list[i].author_avatar,
                        grade: data.list[i].grade,
                        subject: data.list[i].subject,
                        topic: data.list[i].topic,
                        q_summary: data.list[i].q_summary,
                        tag: tag,
                        tagOld: data.list[i].tag,
                        o_id: data.list[i].o_id,
                        createTime: util.convertTime2Str(data.list[i].createTime),
                        updateTime: util.convertTime2Str(data.list[i].updateTime),
                        lastReplyTime: util.convertTime2Str(data.list[i].lastReplyTime),
                        lastReplyID: data.list[i].lastReplyID,
                        visit: data.list[i].visit,
                        reply: data.list[i].reply,
                        collect: data.list[i].collect,
                        watch: data.list[i].watch,
                        bonus: data.list[i].bonus,
                        status: data.list[i].status,
                        judgeTime: util.convertTime2Str(data.list[i].judgeTime),
                        judgeAnswerID: data.list[i].judgeAnswerID,
                        recommend: data.list[i].recommend
                    });
                }
                vm.offLineQuestionList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            }else if(vm.startPos()!=1){
                vm.startPos(vm.startPos()-1);
                loadOffLineQuestionList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"您已经在最后一页了！"
                })
            }
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

/*
 编辑修改离线问题详情
 */
function editOffLineQuestion(){
    msgArray = [];
    var html = "<div class='form-group'>"+
        "<input type='hidden' class='form-control' id='off_id'  value='"+this.off_id+"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>问题主题：</label><input type='text' class='form-control' id='topic' value='"+this.topic+"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>问题标签：</label><input type='text' class='form-control' id='tag' value='"+this.tagOld+"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>创建时间：</label>" +
        "<input id='createTime' class='form-control' type='text' value='"+this.createTime+"'>" +
        "</div>"+
        "<div class='form-group'>"+
        "<label>更新时间：</label>" +
        "<input id='updateTime' class='form-control' type='text' value='"+this.updateTime+"'>" +
        "</div>"+
        "<div class='form-group'>"+
        "<label>是/否推荐：</label>" +
        "<select class='form-control valid' id='recommend'>" +
        "<option value='false'>否</option>" +
        "<option value='true'>是</option>" +
        "</select>" +
        "</div>"+
        "<div class='form-group'>"+
        "<label>访问数：</label><input type='text' class='form-control' id='visit' value='"+this.visit+"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>回复数：</label><input type='text' class='form-control' id='reply' value='"+this.reply+"'>"+
        "</div>";
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.off_id = this.off_id;
    util.callServerFunction('adminGetTopicDetail',postObj, function(data){
        if(data.statusCode == 900){
            var q_msg  = data.detail.q_msg;
            html += "<div class='form-group'><label>问题详情：</label><br>";
            if(q_msg.length>0){
                var seqIndex = 0;
                for(var i=0;i<q_msg.length;i++){
                    if(q_msg[i].type == "text"){
                        html += "<textarea style='width:100%;height:80px;margin-top:4px;border-color: #C7D5E0' id='textMsg'>"+q_msg[i].msg+"</textarea>" +
                            "<input type='hidden' id='seq"+seqIndex+"' value='"+q_msg[i].seq+"'>";
                        seqIndex++;
                    }else if(q_msg[i].type == "image"){
                        html += "<div style='cursor:pointer;margin-bottom:4px' onclick=\"showSrcImg('"+ util.changeUrl(q_msg[i].msg) +"')\"><img width='50%' height='auto' src='"+ util.changeUrl(q_msg[i].msg) +"'></div>";
                        msgArray.push(q_msg[i]);
                    }else if(q_msg[i].type == "voice"){
                        html += "<audio src='http://123.57.16.157:8062/redirectAmr?url="+q_msg[i].msg+"' controls='controls'></audio>";
                        msgArray.push(q_msg[i]);
                    }
                }
            }
            html += "</div><button class='btn btn-primary' onclick='confirmQuestion()'>提  交</button>";
            dialog = $.dialog({
                icon: "icon icon-document-edit",
                title: '修改离线问题',
                content: html
            });
            util.initDateTimePicker("createTime",{});
            util.initDateTimePicker("updateTime",{});
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

/*
 提交离线问题详情修改
 */
var msgArray = [];
function confirmQuestion(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.off_id = $("#off_id").val();
    postObj.topic = $("#topic").val();
    postObj.tag = $("#tag").val();
    postObj.createTime = new Date($("#createTime").val()).getTime();;
    postObj.updateTime = new Date($("#updateTime").val()).getTime();;
    postObj.recommend = $("#recommend").val();
    postObj.visit = $("#visit").val();
    postObj.reply = $("#reply").val();
    var seqIndex = 0;
    $('[id=textMsg]').each(function(){
        var option = {
            type: "text",
            msg: $(this).val(),
            seq: parseInt($("#seq"+seqIndex).val()),
        };
        msgArray.push(option);
        seqIndex++;
    })
    postObj.q_msg = JSON.stringify(msgArray);
    util.callServerFunction('adminModifyTopic',postObj, function(data){
        if(data.statusCode == 900){
            util.toast("修改成功！","success","系统提示");
            loadOffLineQuestionList();
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

/*
 删除离线问题
 */
function deleteOffLineQuestion(){
    var off_id = this.off_id;
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '删除离线问题',
        content: "确认要删除 <span class='label label-info'>"+ this.topic +"</span> 吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.off_id = off_id;
            postObj.delete = "true";
            var dialog = util.callServerFunction('adminModifyTopic',postObj, function(data){
                if(data.statusCode == 900){
                    util.toast("删除成功！","success","系统提示");
                    loadOffLineQuestionList();
                }else{
                    errorCodeApi(data.statusCode);
                }
            });
        }
    });
}

/*
 弹出离线回答列表框
 */
function showAnswerList(){
    vm.off_id = this.off_id;
    $.dialog({
        icon: "icon icon-document-edit",
        title: '离线问题回答列表',
        content: "<div id='answerTable'><table class='table table-hover table-striped table-condensed'>" +
        "<tbody data-bind='foreach:answerList'>" +
        "<tr><td>" +
        "<a href='' class='pull-right' data-bind='click:showCommentList'><span class='fa fontawesome-file-alt'></span>&nbsp;查看评论</a>"+
        "<a href='' class='pull-right' data-bind='click:editOffLineAnswer'><span class='fa fa fontawesome-pencil'></span>&nbsp;修改回答|</a>"+
        "<span data-bind='text:author_nick'></span>-<span data-bind='text:createTime'></span><br/><span data-bind='text:summaryText'></span></td></tr>"+
        "</tbody>" +
        "</table>" +
        "<div>" +
        "<div>当前第 <span style='font-size:2rem;color: #4db6ac' data-bind='text:startPosAnswer'></span> 页&nbsp;&nbsp;&nbsp;每页 <span style='font-size:2rem;color: #4db6ac' data-bind='text:pageSizeAnswer'></span> 项</div>"+
        "<ul class='pager'>" +
        "<li><a style='color: darkgray;cursor: pointer' onclick='prevPageAnswer()'>上一页</a></li>" +
        "<li><a style='color: darkgray;cursor: pointer' onclick='nextPageAnswer()'>下一页</a></li>" +
        "</ul>" +
        "</div></div>"
    });
    ko.applyBindings(vm,document.getElementById("answerTable"));
    loadAnswerList();
}

/*
 离线回答列表上一页
 */
function prevPageAnswer(){
    if(vm.startPosAnswer()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vm.startPosAnswer(vm.startPosAnswer()-1);
        loadAnswerList();
    }
}

/*
 离线回答列表下一页
 */
function nextPageAnswer(){
    vm.startPosAnswer(vm.startPosAnswer()+1);
    loadAnswerList();
}

/*
 获取离线回答列表
 */
function loadAnswerList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.off_id = vm.off_id;
    postObj.startPos = (vm.startPosAnswer()-1)*vm.pageSizeAnswer()+1;
    postObj.pageSize = vm.pageSizeAnswer();
    util.callServerFunction('adminGetAnswers',postObj, function(data){
        if(data.statusCode == 900){
            vm.answerList.removeAll();
            var list = [];
            if(data.list.length>0){
                for(var j=0;j<data.list.length;j++){
                    var text = "";
                    if(data.list[j].summary.voice){
                        text = "声音";
                    }else if(data.list[j].summary.image){
                        text = "图片";
                    }else{
                        if(data.list[j].summary.text.length>30){
                            text = data.list[j].summary.text.substring(0,30)+"......";
                        }else{
                            text = data.list[j].summary.text;
                        }
                    }
                    list.push({
                        author_nick: data.list[j].author_nick,
                        createTime: util.convertTime2Str(data.list[j].createTime),
                        summaryText: text,
                        answer_id: data.list[j].answer_id,
                        off_id: data.list[j].off_id,
                        answer_id: data.list[j].answer_id
                    });
                }
                vm.answerList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            }else if(vm.startPosAnswer()!=1){
                vm.startPosAnswer(vm.startPosAnswer()-1);
                loadAnswerList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"您已经在最后一页了！"
                })
            }
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

/*
 修改离线回答
 */
function editOffLineAnswer(){
    msgArray = [];
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.answer_id = this.answer_id;
    util.callServerFunction('adminGetAnswerDetail',postObj, function(data){
        if(data.statusCode == 900){
            var html = "<div class='form-group'>"+
                "<label>创建时间：</label>" +
                "<input id='createTimeAnswer' class='form-control' type='text' value='"+util.convertTime2Str(data.detail.createTime)+"'>" +
                "</div>"+
                "<div class='form-group'>"+
                "<label>更新时间：</label>" +
                "<input id='updateTimeAnswer' class='form-control' type='text' value='"+util.convertTime2Str(data.detail.updateTime)+"'>" +
                "</div>"+
                "<div class='form-group'>"+
                "<input type='hidden' class='form-control' id='answer_id' value='"+data.detail.answer_id+"'>"+
                "</div><div class='form-group'><label>回答详情：</label><br>";
            var msg  = data.detail.msg;
            if(msg.length>0){
                var seqIndex = 0;
                for(var i=0;i<msg.length;i++){
                    if(msg[i].type == "text"){
                        html += "<textarea style='width:100%;height:200px;margin-top:5px;border-color: #C7D5E0' id='textMsg'>"+msg[i].msg+"</textarea>" +
                            "<input type='hidden' id='seq"+seqIndex+"' value='"+msg[i].seq+"'>";
                        seqIndex++;
                    }else if(msg[i].type == "image"){
                        html += "<div style='cursor:pointer;margin-bottom:4px' onclick=\"showSrcImg('"+ util.changeUrl(msg[i].msg) +"')\"><img width='50%' height='auto' src='"+ util.changeUrl(msg[i].msg) +"'></div>";
                        msgArray.push(msg[i]);
                    }else if(msg[i].type == "voice"){
                        html += "<audio src='http://123.57.16.157:8062/redirectAmr?url="+msg[i].msg+"' controls='controls'></audio>";
                        msgArray.push(msg[i]);
                    }
                }
            }
            html += "</div><button class='btn btn-primary' onclick='confirmAnswer()'>提  交</button>";
            dialog = $.dialog({
                icon: "icon icon-document-edit",
                title: '修改回答',
                content: html
            });
            util.initDateTimePicker("createTimeAnswer",{});
            util.initDateTimePicker("updateTimeAnswer",{});
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

/*
 提交离线回答修改
 */
function confirmAnswer(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.answer_id = $("#answer_id").val();
    postObj.createTime = new Date($("#createTimeAnswer").val()).getTime();;
    postObj.updateTime = new Date($("#updateTimeAnswer").val()).getTime();;
    var seqIndex = 0;
    $('[id=textMsg]').each(function(){
        var option = {
            type: "text",
            msg: $(this).val(),
            seq: parseInt($("#seq"+seqIndex).val()),
        };
        msgArray.push(option);
        seqIndex++;
    })
    postObj.msg = JSON.stringify(msgArray);
    util.callServerFunction('adminModifyAnswer',postObj, function(data){
        if(data.statusCode == 900){
            util.toast("修改成功！","success","系统提示");
            loadAnswerList();
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

/*
 显示离线回复列表
 */
function showCommentList(){
    vm.answer_id = this.answer_id
    $.dialog({
        icon: "icon icon-document-edit",
        title: '评论列表',
        content: "<div id='commentTable'><table class='table table-hover table-striped table-condensed'>" +
        "<tbody data-bind='foreach:commentList'>" +
        "<tr><td>" +
        "<a href='' class='pull-right' data-bind='click:editComment'><span class='fa fa fontawesome-pencil'></span>&nbsp;修改评论</a>"+
        "<span data-bind='text:author_nick'></span>-<span data-bind='text:createTime'></span><br/><span data-bind='text:msg'></span></td></tr>"+
        "</tbody>" +
        "</table>"+
        "<div>" +
        "<div>当前第 <span style='font-size:2rem;color: #4db6ac' data-bind='text:startPosComment'></span> 页&nbsp;&nbsp;&nbsp;每页 <span style='font-size:2rem;color: #4db6ac' data-bind='text:pageSizeComment'></span> 项</div>"+
        "<ul class='pager'>" +
        "<li><a style='color: darkgray;cursor: pointer' onclick='prevPageComment()'>上一页</a></li>" +
        "<li><a style='color: darkgray;cursor: pointer' onclick='nextPageComment()'>下一页</a></li>" +
        "</ul>" +
        "</div></div>"
    });
    ko.applyBindings(vm,document.getElementById("commentTable"));
    loadCommentList();
}

function prevPageComment(){
    if(vm.startPosComment()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vm.startPosComment(vm.startPosComment()-1);
        loadCommentList();
    }
}

function nextPageComment(){
    vm.startPosComment(vm.startPosComment()+1);
    loadCommentList();
}

/*
 获取离线回复列表
 */
function loadCommentList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPosComment()-1)*vm.pageSizeComment()+1;
    postObj.pageSize = vm.pageSizeComment();
    postObj.answer_id = vm.answer_id;
    util.callServerFunction('adminGetReplies',postObj, function(data){
        if(data.statusCode == 900){
            if(data.list.length>0){
                var list = [];
                vm.commentList.removeAll();
                for(var i=0;i<data.list.length;i++){
                    var option = {
                        answer_reply_id: data.list[i].answer_reply_id,
                        off_id: data.list[i].off_id,
                        answer_id: data.list[i].answer_id,
                        author_id: data.list[i].author_id,
                        msg: data.list[i].msg,
                        createTime: util.convertTime2Str(data.list[i].createTime),
                        author_nick: data.list[i].author_nick
                    }
                    list.push(option);
                }
                vm.commentList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            }else if(vm.startPosComment()!=1){
                vm.startPosComment(vm.startPosComment()-1);
                loadCommentList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"您已经在最后一页了！"
                })
            }
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

/*
 修改评论
 */
function editComment(){
    var html = "<div class='form-group'>"+
        "<input type='hidden' class='form-control' id='answer_reply_id'  value='"+this.answer_reply_id+"'>"+
        "</div>"+
        "<div class='form-group'>"+
        "<label>创建时间：</label>" +
        "<input id='createTimeComment' class='form-control' type='text' value='"+this.createTime+"'>" +
        "</div>"+
        "<div class='form-group'>"+
        "<label>评论详情：</label><textarea style='width:100%;height:100px;margin-top:5px;border-color: #C7D5E0' id='commentMsg'>"+this.msg+"</textarea>"+
        "</div>"+
        "</div><button class='btn btn-primary' onclick='confirmComment()'>提  交</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改评论',
        content: html
    });
    util.initDateTimePicker("createTimeComment",{});
}

/*
 提交评论修改
 */
function confirmComment(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.answer_reply_id = $("#answer_reply_id").val();
    postObj.createTime = new Date($("#createTimeComment").val()).getTime();
    postObj.msg = $("#commentMsg").val();
    util.callServerFunction('adminModifyReply',postObj, function(data){
        if(data.statusCode == 900){
            util.toast("修改成功！","success","系统提示");
            loadCommentList();
        }else{
            errorCodeApi(data.statusCode);
        }
    });
}

/*
 显示图片原图
 */
function showSrcImg(src){
    $.dialog({
        icon: "icon icon-document-edit",
        title: '原图',
        content: "<div align='center'><button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'left')\"><span class='entypo-ccw'></span>&nbsp;&nbsp;左转</button>&nbsp;&nbsp;"+
        "<button class='btn btn-success' onclick=\"util.rotateImg('testImg', 'right')\">右转&nbsp;&nbsp;<span class='entypo-cw'></span></button></div>" +
        "<br><img style='width:100%;max-width:100%;height:auto' src='"+src+"' id='testImg'>",
        columnClass: 'col-lg-12 col-md-6 col-sm-3 col-xs-2'
    });
}

/*
 离线问题列表分页
 */
function prevPage(){
    if(vm.startPos()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vm.startPos(vm.startPos()-1);
        loadOffLineQuestionList();
    }
}

/*
 离线问题列表分页
 */
function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadOffLineQuestionList();
}

var viewModel = function(){
    this.offLineQuestionList = ko.observableArray();
    this.loadOffLineQuestionList = loadOffLineQuestionList;
    this.editOffLineQuestion = editOffLineQuestion;
    this.deleteOffLineQuestion = deleteOffLineQuestion;
    this.showAnswerList = showAnswerList;
    this.subLoadOffLineQuestionList = subLoadOffLineQuestionList;
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.off_id = "";
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);

    this.answerList = ko.observableArray();
    this.startPosAnswer = ko.observable(1);
    this.pageSizeAnswer = ko.observable(15);

    this.showCommentList = showCommentList;
    this.editOffLineAnswer = editOffLineAnswer;

    this.commentList = ko.observableArray();
    this.loadCommentList = loadCommentList;
    this.editComment = editComment;
    this.answer_id = "";
    this.startPosComment = ko.observable(1);
    this.pageSizeComment = ko.observable(15);
};
var vm = new viewModel();
var date = new Date();
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("offLineQuestionDiv"));
    util.initDateTimePicker("startTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + ' 00:00:00')});
    util.initDateTimePicker("endTime",{defaultDate: new Date(date.getFullYear() + '/' + (date.getMonth()+1) + '/' + date.getDate() + " 23:59:59")});
    loadOffLineQuestionList();
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadOffLineQuestionList();
            return false;
        }
    }
});