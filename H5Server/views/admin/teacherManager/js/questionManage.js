/**
 * Created by hjy on 2015/12/16 0016.
 */

function loadQuestionList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPos()-1)*vm.pageSize()+1;
    postObj.pageSize = vm.pageSize();
    postObj.type = $("#type").val();
    postObj.status = $("#statusSearch").val();
    postObj.valid = $("#valid").val();
    postObj.key = $("#key").val();
    util.callServerFunction('adminGetQuestionList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.questionList.removeAll();
            if (data.list.length > 0) {
                var list = [],questionAbstract = "",tag = "";
                for (var i = 0; i < data.list.length; i++) {
                    questionAbstract = "",tag = "";
                    for(var j=0;j<data.list[i].question.length;j++){
                        if(data.list[i].question[j].type == "text"){
                            questionAbstract = data.list[i].question[j].msg;
                            break;
                        }
                    }
                    $.each(data.list[i].tag,function(index,value){
                        tag += "<span class='label label-info'>"+value+"</span>&nbsp;&nbsp;";
                    });
                    list.push({
                        id: (i + 1),
                        question_id: data.list[i].question_id,
                        answer: data.list[i].answer,
                        category: data.list[i].category,
                        choice: data.list[i].choice,
                        correct: data.list[i].correct,
                        contributor: data.list[i].contributor,
                        copyRight: data.list[i].copyRight,
                        createTime: util.convertTime2Str(data.list[i].createTime),
                        difficulty: data.list[i].difficulty,
                        lastVerify: data.list[i].lastVerify,
                        layout: data.list[i].layout,
                        presence: data.list[i].presence,
                        question: data.list[i].question,
                        questionAbstract: questionAbstract,
                        status: data.list[i].status,
                        tags: data.list[i].tag,
                        valid: data.list[i].valid,
                        tag: tag,
                        type: data.list[i].type,
                        typeText: data.list[i].type,
                        updateTime: util.convertTime2Str(data.list[i].updateTime)
                    });
                }
                vm.questionList(list);
                $('i').tooltip({
                    "margin-top": "50px"
                });
            } else if (vm.startPos() != 1) {
                vm.startPos(vm.startPos() - 1);
                loadQuestionList();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content: "您已经在最后一页了！"
                })
            }
        } else {
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
        loadQuestionList();
    }
}

function nextPage(){
    vm.startPos(vm.startPos()+1);
    loadQuestionList();
}

function subLoadQuestionList(){
    vm.startPos(1);
    vm.pageSize(15);
    loadQuestionList();
}

function showDetail(){
    var question = "",answer = "",sort = ["A","B","C","D"];
    for(var i=0;i<this.question.length;i++){
        if(this.question[i].type == "text"){
            question += this.question[i].msg + "<br>";
        }else if(this.question[i].type == "image"){
            question += "<image style='width: 100%;height: auto' src='"+ util.changeUrl(this.question[i].msg) +"'><br>";
        }else if(this.question[i].type == "voice"){
            question += "<audio src='http://123.57.16.157:8062/redirectAmr?url="+ this.question[i].msg +"' controls='controls'></audio><br>";
        }
    }
    for(var j=0;j<sort.length;j++){
        for(var k=0;k<this.choice.length;k++){
            if(this.choice[k].flag == sort[j]){
                for(var p=0;p<this.choice[k].content.length;p++){
                    var msg = "";
                    if(this.choice[k].content[p].type == "text"){
                        msg = this.choice[k].content[p].msg;
                    }else if(this.choice[k].content[p].type == "image"){
                        msg = "<image style='width: 100%;height: auto' src='"+ util.changeUrl(this.choice[k].content[p].msg) +"'>";
                    }else if(this.choice[k].content[p].type == "voice"){
                        msg = "<audio src='http://123.57.16.157:8062/redirectAmr?url="+ this.choice[k].content[p].msg +"' controls='controls'></audio>";
                    }
                    if(p == 0){
                        answer += "<div style='margin-bottom: 5px'><button class='btn source'>"+ sort[j] +"</button><span style='margin-left: 10px'>"+ msg +"</span></div>";
                    }else{
                        answer += "<div style='margin-bottom: 5px'><span style='margin-left: 10px'>"+ msg +"</span></div>";
                    }
                }
            }
        }
    }
    var html = "<table class='table'>"+
        "<tbody>"+
        "<tr>"+
        "<td class='col-lg-2 col-md-3 col-sm-3 col-xs-4'> 问题：</td>"+
        "<td class='subject'>"+ question +"</td>"+
        "</tr>"+
        "<tr><td class='col-lg-2'> 答案：</td><td class='col-lg-10 subject'>"+ answer +"</td></tr>"+
        "<tr><td> 正确答案：</td><td class='subject'>"+ this.answer +"</td></tr>"+
        "<tr><td> 标签：</td><td class='subject'>"+ this.tag +"</td></tr>"+
        "<tr><td> 难度：</td><td class='subject'>"+ this.difficulty +"</td></tr>"+
        "<tr><td> 回答次数：</td><td class='subject'>"+ this.presence +"</td></tr>"+
        "<tr><td> 正确次数：</td><td class='subject'>"+ this.correct +"</td></tr>"+
        "</tbody>"+
        "<table>";
    $.dialog({
        icon: "icon icon-document-edit",
        title: '问题详情',
        content: html
    });
}

function initAddQuestion(){
    vm.questions([]);
    vm.choices([]);
    vm.contentTemp([]);
    var html = "<div class='row' id='addQuestion'>" +
        "<div class='col-lg-6 column' style='border-right: 1px #CCCCCC solid'>" +
            "<div class='form-group col-lg-12'>"+
                "<label>问题分类：</label>" +
                "<select id='typeAddEdit' class='form-control valid'>"+
                "<option value='default'>对战问题</option>"+
                "<option value='inspire'>父节点</option>"+
                "<option value='subinspire'>子节点</option>"+
                "</select>"+
            "</div>"+
            "<div class='form-group col-lg-12'>"+
                "<label>问题内容：</label>" +
                "<a href='javascript:void(0)' data-bind='click: initAddQuestionText'>" +
                //"<span class='entypo-keyboard'></span>添加文本</a>&nbsp;&nbsp;&nbsp;"+
                "<a href='javascript:void(0)' onclick='selectQuestionImg()'><span class='entypo-picture'></span>添加图片</a><br>" +
                "<div id='questions' data-bind='foreach: questions'>" +
                    "<div data-bind=\"visible: type=='text'\" class='form-group'>" +
                        "<div data-bind='text:msg' class='col-lg-9' style='border-left: 5px #e1e1e1 solid'></div>" +
                        "<div class='col-lg-3'><a href='javascript:void(0)' class='entypo-pencil' data-bind='click:initEditQuestionText'>&nbsp;修改</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='entypo-trash' data-bind='click:deleteQuestionContent'>&nbsp;删除</a></div>" +
                    "</div>" +
                    "<div data-bind=\"visible: type=='image'\" class='form-group'>" +
                        "<div class='col-lg-9' style='border-left: 5px #e1e1e1 solid'><image style='width: 100%;height: auto' data-bind=\"attr: {src: type=='image'?msg:''}\"></div>" +
                        "<div class='col-lg-3'><a href='javascript:void(0)' class='entypo-pencil' data-bind='click:editQuestionImg'>&nbsp;修改</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='entypo-trash' data-bind='click:deleteQuestionContent'>&nbsp;删除</a></div>" +
                    "</div>"+
                "</div>"+
                "<div><textarea style='width: 100%;height: 100px;border-color: #C7D5E0' id='inputText'></textarea></div>"+
            "</div>"+
            "<div class='form-group col-lg-12'>"+
                "<label>问题选项：</label>" +
                "<div id='choices' data-bind='foreach: choices'>" +
                    "<div class='btn-group' style='margin-right: 5px'>"+
                        "<button type='button' class='btn btn-info' data-bind='click:initEditChoice'><span class='entypo-link' title='选项'></span>&nbsp;&nbsp;<span data-bind='text: flag'></span>选项</button>"+
                        "<button type='button' class='btn btn-warning' data-bind='click:deleteChoice'><span class='entypo-trash' title='删除选项'></span></button>"+
                    "</div>" +
                "</div>"+
            "</div>"+
            "<div class='form-group col-lg-12'>"+
                "<label>正确选项：</label>" +
                "<div class='radio'><label><input type='radio' name='answer' value='A'>A&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
                "<label><input type='radio' name='answer' value='B'>B&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
                "<label><input type='radio' name='answer' value='C'>C&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
                "<label><input type='radio' name='answer' value='D'>D&nbsp;&nbsp;&nbsp;&nbsp;</label></div>" +
            "</div>"+
            "<div class='form-group col-lg-12'>"+
                "<label>标签：</label><input id='tag' type='text' class='form-control tags'>"+
            "</div>"+
            "<div class='form-group col-lg-12'>"+
                "<label>难易度：</label><input type='text' class='form-control' id='difficulty' placeholder='范围：0(易)-99(难)'>"+
            "</div>"+
            "<div class='form-group col-lg-12'>"+
                "<label>版权：</label>" +
                "<select id='copyRight' class='form-control valid'>"+
                    "<option value='internet'>网络</option>"+
                    "<option value='person'>个人</option>"+
                "</select>"+
            "</div>"+
            "<div class='form-group col-lg-12'>"+
                "<label>布局：</label>" +
                "<select id='layout' class='form-control valid'>"+
                    "<option value='default'>默认布局</option>"+
                "</select>"+
            "</div>"+
            "<div class='form-group col-lg-12'>"+
                "<label>是/否发布：</label>" +
                "<select id='validAdd' class='form-control valid'>"+
                    "<option value='false'>否</option>"+
                    "<option value='true'>是</option>"+
                "</select>"+
            "</div>" +
            "<input type='file' id='questionImgFile' style='display: none'>"+
        "</div>" +
        "<div class='col-lg-6 column'>" +
            "<div id='addChoiceDiv'>" +
                //"<div class='form-group col-lg-12'>"+
                //    "<label>选项名称：</label>" +
                //    "<div class='radio' onclick='initAnswer()'><label><input type='radio' name='flag' value='A'>A&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
                //    "<label><input type='radio' name='flag' value='B'>B&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
                //    "<label><input type='radio' name='flag' value='C'>C&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
                //    "<label><input type='radio' name='flag' value='D'>D&nbsp;&nbsp;&nbsp;&nbsp;</label></div>" +
                //"</div>"+
                "<div class='form-group col-lg-12'>"+
                    "<label>选项内容：</label>"+
                    "<a href='javascript:void(0)' onclick='initAddChoiceText()'>" +
                    //"<span class='entypo-keyboard'></span>添加文本</a>&nbsp;&nbsp;&nbsp;"+
                    "<a href='javascript:void(0)' onclick='selectChoiceImg()'><span class='entypo-picture'></span>添加图片</a>"+
                "</div>" +
                "<div class='form-group col-lg-12'>" +
                    "<textarea style='width: 100%;height: 100px;border-color: #C7D5E0' id='choiceText'></textarea>" +
                "</div>" +
                "<div class='form-group col-lg-12' data-bind='foreach: contentTemp'>" +
                    //"<div data-bind=\"visible: type=='text'\">" +
                    //    "<div data-bind='text:msg' class='col-lg-9' style='border-left: 5px #e1e1e1 solid'></div>" +
                    //    "<div class='col-lg-3'><a href='javascript:void(0)' class='entypo-pencil' data-bind='click:initEditChoiceText'>&nbsp;修改</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='entypo-trash' data-bind='click:deleteChoiceContent'>&nbsp;删除</a></div>" +
                    //"</div>" +
                    "<div data-bind=\"visible: type=='image'\">" +
                        "<div class='col-lg-9' style='border-left: 5px #e1e1e1 solid'><image style='width: 100%;height: auto' data-bind=\"attr: {src: type=='image'?msg:''}\"></div>" +
                        "<div class='col-lg-3'><a href='javascript:void(0)' class='entypo-pencil' data-bind='click:editChoiceImg'>&nbsp;修改</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='entypo-trash' data-bind='click:deleteChoiceContent'>&nbsp;删除</a></div>" +
                    "</div>"+
                "</div>" +
                "<div class='row' align='center'>"+
                    "<div class='form-group col-lg-12' style='margin-top: 10px'>"+
                        "<input type='file' id='choiceImgFile' style='display: none'>"+
                        "<button type='button' class='btn btn-primary' onclick=\"subAddChoice('add')\"><span class='entypo-left-open-big'></span>&nbsp;&nbsp;添加选项</button>"+
                    "</div>" +
                "</div>" +
            "</div>"+
        "</div>" +
    "</div><br>" +
    "<div class='row text-center'><button class='btn btn-primary' onclick=\"subAddQuestion('add')\">提 交</button></div>";
    dialogAddQuestion = $.dialog({
        icon: "icon icon-plus",
        title: '新增问题',
        content: html,
        columnClass: "col-lg-12"
    });
    $('#tag').tagsInput({
        width: 'auto',
        defaultText: '添加标签'
    });
    $("#questionImgFile").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var blob = util.dataURLtoBlob(reader.result);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = addQuestionImg;
            xhr.send(fd);
        };
    });
    $("#choiceImgFile").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var blob = util.dataURLtoBlob(reader.result);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = addChoiceImg;
            xhr.send(fd);
        };
    });
    ko.applyBindings(vm,document.getElementById("addQuestion"));
}

function initAddQuestionText(){
    var html = "<div class='form-group'>"+
        "<label>问题文本内容：</label><textarea style='width: 100%;height: 200px' id='inputText'></textarea>"+
        "</div><button class='btn btn-primary' onclick='addQuestionText()'>提 交</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '添加文本内容',
        content: html
    });
    setTimeout((function(){$("#inputText").focus()}),100);
}

function addQuestionText(){
    if($("#inputText").val() == ""){
        errorDialog = $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写问题文本内容！"
        })
    }else{
        var option = {
            msg: $("#inputText").val(),
            type: "text"
        }
        option.seq = vm.questions.length + 1;
        vm.questions.push(option);
        dialog.close();
        util.toast("添加成功！","success","提示信息");
    }
}

function initEditQuestionText(){
    var html = "<div class='form-group'>"+
        "<label>问题文本内容：</label><textarea style='width: 100%;height: 200px' id='questionText'>"+ this.msg +"</textarea>"+
        "</div><button class='btn btn-primary' onclick='editQuestionText("+ vm.questions.indexOf(this) +")'>提 交</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改问题文本内容',
        content: html
    });
    setTimeout((function(){$("#questionText").focus()}),100);
}

function editQuestionText(index){
    if($("#inputText").val() == ""){
        errorDialog = $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写问题文本内容！"
        })
    }else {
        var question = {
            msg: $("#questionText").val(),
            seq: vm.questions.length + 1,
            type: "text"
        }
        vm.questions.splice(index, 1, question);
        dialog.close();
        util.toast("修改成功！", "success", "提示信息");
    }
}

function deleteQuestionContent(){
    var index = vm.questions.indexOf(this);
    dialog = $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '删除问题内容',
        content: "确定要删除此内容吗！",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function(){
            vm.questions.splice(index,1);
            dialog.close();
            util.toast("删除成功！","success","提示信息");
        }
    });
}

function selectQuestionImg(){
    $("#questionImgFile").click();
}

function addQuestionImg(){
    if (xhr.readyState == 4 && xhr.status === 200) {//readyState表示文档加载进度,4表示完毕
        var question = {
            msg: JSON.parse(xhr.response).filePath,
            orientation: "portrait",
            seq: vm.questions.length + 1,
            type: "image"
        }
        if(vm.isEditQuestionImg() != ""){
            vm.questions.splice(vm.isEditQuestionImg(),1,question);
            vm.isEditQuestionImg("");
        }else{
            vm.questions.push(question);
        }
        util.toast("添加成功！","success","提示信息");
    }
}

function editQuestionImg(){
    vm.isEditQuestionImg(vm.questions.indexOf(this) + "");
    $("#questionImgFile").click();
}

function initAddChoice(){
    vm.contentTemp([]);
    var html = "<div id='addChoiceDiv'><div class='form-group'>"+
        "<label>选项名称：</label>" +
        "<div class='radio'><label><input type='radio' name='flag' value='A'>A&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
        "<label><input type='radio' name='flag' value='B'>B&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
        "<label><input type='radio' name='flag' value='C'>C&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
        "<label><input type='radio' name='flag' value='D'>D&nbsp;&nbsp;&nbsp;&nbsp;</label></div>" +
        "</div>"+
        "<div class='form-group'>"+
            "<label>选项内容：</label>"+
            "<a href='javascript:void(0)' onclick='initAddChoiceText()'><span class='entypo-keyboard'></span>添加文本</a>&nbsp;&nbsp;&nbsp;"+
            "<a href='javascript:void(0)' onclick='selectChoiceImg()'><span class='entypo-picture'></span>添加图片</a>"+
        "</div>" +
        "<div class='form-group' data-bind='foreach: contentTemp'>" +
            "<div data-bind=\"visible: type=='text'\">" +
                "<div data-bind='text:msg' class='col-lg-9' style='border-left: 5px #e1e1e1 solid'></div>" +
                "<div class='col-lg-3'><a href='javascript:void(0)' class='entypo-pencil' data-bind='click:initEditChoiceText'>&nbsp;修改</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='entypo-trash' data-bind='click:deleteChoiceContent'>&nbsp;删除</a></div>" +
            "</div>" +
            "<div data-bind=\"visible: type=='image'\">" +
                "<div class='col-lg-9' style='border-left: 5px #e1e1e1 solid'><image style='width: 100%;height: auto' data-bind=\"attr: {src: type=='image'?msg:''}\"></div>" +
                "<div class='col-lg-3'><a href='javascript:void(0)' class='entypo-pencil' data-bind='click:editChoiceImg'>&nbsp;修改</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='entypo-trash' data-bind='click:deleteChoiceContent'>&nbsp;删除</a></div>" +
            "</div>"+
        "</div>" +
        "<div class='row'>"+
            "<div class='form-group col-lg-12' style='margin-top: 10px'>"+
                "<input type='file' id='choiceImgFile' style='display: none'>"+
                "<button class='btn btn-primary' onclick=\"subAddChoice('update')\">提 交</button>"+
            "</div>" +
        "</div>" +
        "</div>";
    dialogAddChoice = $.dialog({
        icon: "icon icon-plus",
        title: '添加选项',
        content: html
    });
    $("#choiceImgFile").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var blob = util.dataURLtoBlob(reader.result);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = addChoiceImg;
            xhr.send(fd);
        };
    });
    ko.applyBindings(vm,document.getElementById("addChoiceDiv"));
}

function initAddChoiceText(){
    var html = "<div class='form-group'>"+
        "<label>选项文本内容：</label><textarea style='width: 100%;height: 200px' id='choiceTextAdd'></textarea>"+
        "</div>"+
        "<button class='btn btn-primary' onclick='addChoiceText()'>提 交</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '添加选项文本内容',
        content: html
    });
    setTimeout((function(){$("#choiceText").focus()}),100);
}

function addChoiceText(){
    if($("#choiceTextAdd").val() == ""){
        errorDialog = $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写选项文本内容！"
        })
    }else{
        var option = {
            msg: $("#choiceTextAdd").val(),
            type: "text"
        }
        vm.contentTemp.push(option);
        dialog.close();
        util.toast("添加成功！", "success", "提示信息");
    }
}

function selectChoiceImg(){
    $("#choiceImgFile").click();
}

function addChoiceImg(){
    if (xhr.readyState == 4 && xhr.status === 200) {//readyState表示文档加载进度,4表示完毕
        var option = {
            msg: JSON.parse(xhr.response).filePath,
            orientation: "portrait",
            seq: vm.contentTemp.length + 1,
            type: "image"
        }
        if(vm.isEditChoiceImg() != ""){
            vm.contentTemp.splice(vm.isEditChoiceImg(),1,option);
            vm.isEditChoiceImg("");
        }else{
            vm.contentTemp.push(option);
        }
        util.toast("添加成功！","success","提示信息");
    }
}

function initEditChoiceText(){
    var html = "<div class='form-group'>"+
        "<label>选项文本内容：</label><textarea style='width: 100%;height: 200px' id='choiceTextEdit' value='"+ this.msg +"'>"+ this.msg +"</textarea>"+
        "</div><button class='btn btn-primary' onclick=\"editChoiceText('"+ vm.contentTemp.indexOf(this) +"')\">提 交</button>";
    dialog = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改选项文本内容',
        content: html
    });
    setTimeout((function(){$("#choiceText").focus()}),100);
}

function editChoiceText(index){
    if($("#choiceTextEdit").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写选项文本内容！"
        })
    }else {
        var option = {
            msg: $("#choiceTextEdit").val(),
            type: "text"
        }
        vm.contentTemp.splice(index, 1, option);
        dialog.close();
        util.toast("修改成功！", "success", "提示信息");
    }
}

function deleteChoiceContent(){
    var index = vm.contentTemp.indexOf(this);
    dialog = $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '删除选项内容',
        content: "确定要删除此内容吗！",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function(){
            vm.contentTemp.splice(index,1);
            dialog.close();
            util.toast("删除成功！","success","提示信息");
        }
    });
}

function editChoiceImg(){
    vm.isEditChoiceImg(vm.contentTemp.indexOf(this) + "");
    $("#choiceImgFile").click();
}

function subAddChoice(sign){
    if(sign == "add"){
        if($("#choiceText").val() == ""){
            errorDialog = $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content:"请填写选项文本内容！"
            })
        }else if($("#choiceText").val().length > 16){
            errorDialog = $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content:"选项文本内容最多为 8个汉字 或 16个英文！"
            })
        }else{
            var option = {
                msg: $("#choiceText").val(),
                type: "text"
            }
            vm.contentTemp.push(option);
            var content = new Array();
            for(var i=0;i<vm.contentTemp().length;i++){
                content.push(vm.contentTemp()[i]);
            }
            var option = {
                content: content,
                //flag: $("input:radio[name='flag']:checked").val()
                flag: flags[vm.choices().length]
            };
            vm.choices.push(option);
            if(dialogAddChoice != ""){
                dialogAddChoice.close();
            }
            util.toast("添加成功！","success","提示信息");
            initAnswer();
        }
    }else if(sign == "update"){
        if($("input:radio[name='flag']:checked").val() == undefined){
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content:"请选择选项名称！"
            })
        }else if(vm.contentTemp().length <= 0){
            $.dialog({
                icon: 'icon icon-warning',
                title: '提示信息',
                content:"请填写选项内容！"
            })
        }else{
            var content = new Array();
            for(var i=0;i<vm.contentTemp().length;i++){
                content.push(vm.contentTemp()[i]);
            }
            var option = {
                content: content,
                //flag: $("input:radio[name='flag']:checked").val()
                flag: flags[vm.choices().length]
            };
            vm.choices.push(option);
            if(dialogAddChoice != ""){
                dialogAddChoice.close();
            }
            util.toast("添加成功！","success","提示信息");
            initAnswer();
        }
    }
}

function subEditChoice(index){
    if($("input:radio[name='flagEdit']:checked").val() == undefined){
        errorDialog = $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择选项名称！"
        })
    }else if(vm.contentTemp().length<=0){
        errorDialog = $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请添加选项内容！"
        })
    }else{
        var content = new Array();
        for (var i = 0; i < vm.contentTemp().length; i++) {
            content.push(vm.contentTemp()[i]);
        }
        var option = {
            content: content,
            flag: $("input:radio[name='flagEdit']:checked").val()
        };
        vm.choices.splice(index, 1, option);
        if(dialogAddChoice != ""){
            dialogAddChoice.close();
        }
        util.toast("修改成功！", "success", "提示信息");
    }
}

function initEditChoice(){
    var contentTemp = new Array();
    for(var i=0;i<this.content.length;i++){
        contentTemp.push(this.content[i]);
    }
    vm.contentTemp(contentTemp);
    var html = "<div id='editChoiceDiv'><div class='form-group'>"+
        "<label>选项名称：</label>" +
        "<div class='radio'><label><input type='radio' name='flagEdit' value='A'>A&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
        "<label><input type='radio' name='flagEdit' value='B'>B&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
        "<label><input type='radio' name='flagEdit' value='C'>C&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
        "<label><input type='radio' name='flagEdit' value='D'>D&nbsp;&nbsp;&nbsp;&nbsp;</label></div>" +
        "</div>"+
        "<div class='form-group'>"+
            "<label>选项内容：</label>"+
            "<a href='javascript:void(0)' onclick='initAddChoiceText()'><span class='entypo-keyboard'></span>添加文本</a>&nbsp;&nbsp;&nbsp;"+
            "<a href='javascript:void(0)' onclick='selectChoiceImg()'><span class='entypo-picture'></span>添加图片</a>"+
        "</div>" +
        "<div data-bind='foreach: contentTemp'>" +
            "<div data-bind=\"visible: type=='text'\" class='form-group'>" +
                "<div data-bind='text:msg' class='col-lg-9' style='border-left: 5px #e1e1e1 solid'></div>" +
                "<div class='col-lg-3'><a href='javascript:void(0)' class='entypo-pencil' data-bind='click:initEditChoiceText'>&nbsp;修改</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='entypo-trash' data-bind='click:deleteChoiceContent'>&nbsp;删除</a></div>" +
            "</div>" +
            "<div data-bind=\"visible: type=='image'\" class='form-group'>" +
                "<div class='col-lg-9' style='border-left: 5px #e1e1e1 solid'><image style='width: 100%;height: auto' data-bind=\"attr: {src: type=='image'?msg:''}\"></div>" +
                "<div class='col-lg-3'><a href='javascript:void(0)' class='entypo-pencil' data-bind='click:editChoiceImg'>&nbsp;修改</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='entypo-trash' data-bind='click:deleteChoiceContent'>&nbsp;删除</a></div>" +
            "</div>"+
        "</div>"+
        "<div class='row'>"+
            "<div class='form-group col-lg-12' style='margin-top: 10px'>"+
                "<input type='file' id='choiceImgFile' style='display: none'>"+
                "<button class='btn btn-primary' onclick=\"subEditChoice('"+ vm.choices.indexOf(this) +"')\">提 交</button>"+
            "</div>"+
        "</div>";
    dialogAddChoice = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改选项',
        content: html
    });
    $("#choiceImgFile").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var blob = util.dataURLtoBlob(reader.result);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = addChoiceImg;
            xhr.send(fd);
        };
    });
    $("input:radio[name='flagEdit'][value='"+ this.flag +"']").prop('checked',true);
    ko.applyBindings(vm,document.getElementById("editChoiceDiv"));
}

function deleteChoice(){
    var index = vm.choices.indexOf(this);
    dialog = $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '删除选项',
        content: "确定要删除此选项吗！",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function(){
            vm.choices.splice(index,1);
            dialog.close();
            util.toast("删除选项成功！","success","提示信息");
        }
    });
}

function subAddQuestion(sign){
    //if(vm.questions().length <= 0){
    //    $.dialog({
    //        icon: 'icon icon-warning',
    //        title: '提示信息',
    //        content:"请填写问题内容！"
    //    })
    //}else
    if(($("#inputText").val() == "" || $("#inputText").val() == undefined) && vm.questions().length <= 0){
        errorDialog = $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写问题文本内容！"
        })
    }else if(vm.choices().length <= 0){
        errorDialog = $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写问题选项！"
        })
    }else if($("input:radio[name='answer']:checked").val() == undefined){
        errorDialog = $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写正确选项！"
        })
    }else if($("input[id^='tag']").val() == ""){
        errorDialog = $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写标签！"
        })
    }else if($("#difficulty").val() == ""){
        errorDialog = $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写难易度！"
        })
    }else if($("#copyRight").val() == ""){
        errorDialog = $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请选择版权！"
        })
    }else{
        var postObj = {}, msg = "", temp = true;
        if (sign == "add") {
            if($("#inputText").val().length > 108){
                temp = false;
                errorDialog = $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"选项文本内容最多为 8个汉字 或 16个英文！"
                })
            }
            var option = {
                msg: $("#inputText").val(),
                type: "text"
            }
            option.seq = vm.questions.length + 1;
            vm.questions.push(option);
            msg = "添加成功！";
        } else if (sign == "edit") {
            msg = "修改成功！";
            postObj.question_id = $("#question_id").val();
        }
        if(temp) {
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.typeAdd = $("#typeAddEdit").val();
            postObj.tag = $("input[id^='tag']").val();
            postObj.difficulty = $("#difficulty").val();
            postObj.question = JSON.stringify(vm.questions());
            postObj.choice = JSON.stringify(vm.choices());
            postObj.copyRight = $("#copyRight").val();
            postObj.layout = $("#layout").val();
            postObj.answer = $("input:radio[name='answer']:checked").val();
            postObj.valid = $("#validAdd").val();
            util.callServerFunction('adminEditQuestion', postObj, function (data) {
                if (data.statusCode == 900) {
                    util.toast(msg, "success", "提示信息");
                    loadQuestionList();
                    if(dialogAddQuestion != "" && dialogAddQuestion != undefined){
                        dialogAddQuestion.close();
                    }
                    if(dialogEditQuestion != "" && dialogEditQuestion != undefined){
                        dialogEditQuestion.close();
                    }
                    dialogAddQuestion = "";
                    dialogEditQuestion = "";
                } else {
                    errorCodeApi(data.statusCode);
                }
            });
        }
    }
}

function initEditQuestion(){
    var questionTemp = new Array(),choicesTemp = new Array();
    for(var i=0;i<this.question.length;i++){
        questionTemp.push(this.question[i]);
    }
    for(var j=0;j<this.choice.length;j++){
        choicesTemp.push(this.choice[j]);
    }
    vm.questions(questionTemp);
    vm.choices(choicesTemp);
    var html = "<div id='editQuestion'><div class='form-group'>"+
            "<label>问题分类：</label>" +
            "<select id='typeAddEdit' class='form-control valid'>"+
                "<option value='default'>对战问题</option>"+
                "<option value='inspire'>父节点</option>"+
                "<option value='subinspire'>子节点</option>"+
            "</select>"+
        "</div>"+
        "<div class='form-group col-lg-12' style='padding: 0px'>"+
            "<label>问题内容：</label>" +
            "<a href='javascript:void(0)' data-bind='click: initAddQuestionText'><span class='entypo-keyboard'></span>添加文本</a>&nbsp;&nbsp;&nbsp;"+
            "<a href='javascript:void(0)' onclick='selectQuestionImg()'><span class='entypo-picture'></span>添加图片</a><br>"+
            "<div id='questions' data-bind='foreach: questions'>" +
                "<div data-bind=\"visible: type=='text'\" class='form-group'>" +
                    //"<div data-bind='text:msg' class='col-lg-9' style='border-left: 5px #e1e1e1 solid'></div>" +
                    "<div class='col-lg-9' style='border-left: 5px #e1e1e1 solid'>" +
                        "<textarea data-bind='value: msg' style='width: 100%;'></textarea>" +
                    "</div>" +
                    "<div class='col-lg-3'><a href='javascript:void(0)' class='entypo-pencil' data-bind='click:initEditQuestionText'>&nbsp;修改</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='entypo-trash' data-bind='click:deleteQuestionContent'>&nbsp;删除</a></div>" +
                "</div>" +
                "<div data-bind=\"visible: type=='image'\" class='form-group'>" +
                    "<div class='col-lg-9' style='border-left: 5px #e1e1e1 solid'><image style='width: 100%;height: auto' data-bind=\"attr: {src: type=='image'?msg:''}\"></div>" +
                    "<div class='col-lg-3'><a href='javascript:void(0)' class='entypo-pencil' data-bind='click:editQuestionImg'>&nbsp;修改</a>&nbsp;&nbsp;<a href='javascript:void(0)' class='entypo-trash' data-bind='click:deleteQuestionContent'>&nbsp;删除</a></div>" +
                "</div>"+
            "</div>"+
        "</div>"+
        "<div class='form-group'>"+
            "<label>问题选项：</label>" +
            "<a href='javascript:void(0)' data-bind='click: initAddChoice'><span class='entypo-plus'></span>添加选项</a>"+
            "<div id='choices' data-bind='foreach: choices'>" +
                //"<div class='btn-group' style='margin-right: 5px'>"+
                //    "<button type='button' class='btn btn-info' data-bind='click:initEditChoice'><span class='entypo-book' title='选项'></span>&nbsp;&nbsp;<span data-bind='text: flag'></span>选项</button>"+
                //    "<button type='button' class='btn btn-warning' data-bind='click:deleteChoice'><span class='entypo-trash' title='删除选项'></span></button>"+
                //"</div>" +
                "<div class='col-lg-12' style='margin-bottom: 5px'>" +
                    "<div class='col-lg-2'><input type='text' class='form-control' data-bind='value: flag'></div>" +
                    "<div class='col-lg-8'><input type='text' class='form-control' data-bind='value: content[0].msg'></div>" +
                    "<div class='col-lg-2'>" +
                        //"<a href='javascript:void(0)' class='entypo-pencil' data-bind='click:initEditChoice' style='vertical-align: -webkit-baseline-middle'>&nbsp;修改</a>&nbsp;&nbsp;" +
                        "<a href='javascript:void(0)' class='entypo-trash' data-bind='click:deleteChoice' style='vertical-align: -webkit-baseline-middle'>&nbsp;删除</a>" +
                    "</div>" +
                "</div>" +
            "</div>"+
        "</div>"+
        "<div class='form-group'>"+
            "<label>正确选项：</label>" +
            "<div class='radio'><label><input type='radio' name='answer' value='A'>A&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
            "<label><input type='radio' name='answer' value='B'>B&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
            "<label><input type='radio' name='answer' value='C'>C&nbsp;&nbsp;&nbsp;&nbsp;</label>" +
            "<label><input type='radio' name='answer' value='D'>D&nbsp;&nbsp;&nbsp;&nbsp;</label></div>" +
        "</div>"+
        "<div class='form-group'>"+
            "<label>标签：</label><input id='tag' type='text' class='form-control tags' value='"+ this.tags.join(",") +"'>"+
        "</div>"+
        "<div class='form-group'>"+
            "<label>难易度：</label><input type='text' class='form-control' id='difficulty' placeholder='范围：0(易)-99(难)' value='"+ this.difficulty +"'>"+
        "</div>"+
        "<div class='form-group'>"+
            "<label>版权：</label>" +
            "<select id='copyRight' class='form-control valid'>"+
                "<option value='internet'>网络</option>"+
                "<option value='person'>个人</option>"+
            "</select>"+
        "</div>"+
        "<div class='form-group'>"+
            "<label>布局：</label>" +
            "<select id='layout' class='form-control valid'>"+
                "<option value='default'>默认布局</option>"+
            "</select>"+
        "</div>"+
        "<div class='form-group'>"+
            "<label>是/否发布：</label>" +
            "<select id='validAdd' class='form-control valid'>"+
                "<option value='false'>否</option>"+
                "<option value='true'>是</option>"+
            "</select>"+
        "</div>" +
        "<input type='file' id='questionImgFile' style='display: none'>"+
        "<input type='hidden' id='question_id' value='"+ this.question_id +"'>"+
        "<button class='btn btn-primary' onclick=\"subAddQuestion('edit')\">提 交</button><div>";
    dialogEditQuestion = $.dialog({
        icon: "icon icon-document-edit",
        title: '修改问题',
        content: html
    });
    $('#tag').tagsInput({
        width: 'auto',
        defaultText: '添加标签'
    });
    $("#questionImgFile").change(function() {
        var file = this.files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            // 通过 reader.result 来访问生成的 DataURL
            var blob = util.dataURLtoBlob(reader.result);
            var fd = new FormData();
            fd.append("upload", blob, "image.png");
            xhr.open('POST', '/upload', true);
            xhr.onreadystatechange = addQuestionImg;
            xhr.send(fd);
        };
    });
    $("#typeAddEdit").val(this.type);
    $("#copyRight").val(this.copyRight);
    $("#layout").val(this.layout);
    $("#validAdd").val(this.valid+"");
    $("input:radio[name='answer'][value='"+ this.answer +"']").prop('checked',true);
    ko.applyBindings(vm,document.getElementById("editQuestion"));
}

//问题上/下线
function setValid(){
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        question_id: this.question_id,
        valid: !this.valid
    };
    util.callServerFunction('adminEditQuestion', postObj, function (data) {
        if(data.statusCode == 900){
            util.toast("操作成功！","success","系统提示");
            loadQuestionList();
        }else{
            errorCodeApi(data.statusCode);
        }
    })
}

function initAnswer(){
    vm.contentTemp([]);
    $("#choiceText").val("");
    $("#choiceText").focus();
}


function initHeuristicQuestions(){
    vm.questionListH([]);
    vm.fatherQuestion("");
    vm.fatherAnswer("");
    vm.fatherRightAnswer("");
    vm.fatherTag("");
    vm.fatherDifficulty("");
    vm.fatherPresence("");
    vm.fatherCorrect("");
    vm.startPosH(1);
    vm.pageSizeH(10);
    var html = "<div class='row' id='heuristicQuestions'>" +
                    "<div class='col-lg-6 column' style='border-right: 1px #CCCCCC solid'>" +
                        "<div style='margin-top: 10px;margin-bottom: 10px'><span class='label'>检索问题</span></div>" +
                        "<div class='form-group'>" +
                            "<label>关键字：</label>" +
                            "<div class='row' style='padding: 0px 5px 0px 15px'>" +
                                "<div class='col-lg-7 column' style='padding: 0px'><input id='heuristicKey' class='form-control' type='text'></div>" +
                                "<div class='col-lg-3 column' style='padding: 0px 10px 0px 10px'>" +
                                    "<select id='typeHeuristic' class='form-control valid'>" +
                                        "<option value=''>全部</option>" +
                                        "<option value='default'>对战问题</option>" +
                                        "<option value='inspire'>父节点</option>" +
                                        "<option value='subinspire'>子节点</option>" +
                                    "</select>" +
                                "</div>" +
                                "<div class='col-lg-2 column' style='padding: 0px'><button class='btn btn-rounded' onclick='seachChildrenQuestion()'><span class='entypo-search'></span>&nbsp;&nbsp;检索</button></div>" +
                            "</div>" +
                        "</div>" +
                        "<div class='table-responsive'>" +
                            "<table class='table table-bordered table-striped cf'>" +
                                "<thead class='cf'>" +
                                    "<tr>" +
                                        "<th align='center' class='col-lg-1'>序号</th>" +
                                        "<th align='center' class='col-lg-6'>问题摘要</th>" +
                                        "<th align='center' class='col-lg-2'>问题类型</th>" +
                                        "<th align='center' class='col-lg-3'>操作</th>" +
                                    "</tr>" +
                                "</thead>" +
                                "<tbody data-bind='foreach: questionListH'>" +
                                    "<tr>" +
                                        "<td align='center'><span data-bind='text: id'></span></td>" +
                                        "<td align='left'><span data-bind='text: questionAbstract'></span></td>" +
                                        "<td align='center'><span data-bind=\"text: typeText=='default'?'对战问题':typeText=='inspire'?'父节点':typeText=='subinspire'?'子节点':'其他'\"></span></td>" +
                                        "<td align='center'>" +
                                            "<div><a href='' data-bind='click:selectFather'><span class='entypo-flow-line'></span>&nbsp;选择节点</a></div>" +
                                            "<div><a href='' data-bind='click:setChildren'><span class='entypo-flow-cascade'></span>&nbsp;设为子节点</a></div>" +
                                        "</td>" +
                                    "</tr>" +
                                "</tbody>" +
                            "</table>" +
                        "</div>" +
                        "<div class='col-lg-12 col-md-12 col-sm-12' id='page' style='padding: 0px;' data-bind='visible: questionListH().length > 0'>" +
                            "<div>当前第 <span style='font-size:2rem;color: #4db6ac' data-bind='text:startPosH'></span> 页&nbsp;&nbsp;&nbsp;每页 <span style='font-size:2rem;color: #4db6ac' data-bind='text:pageSizeH'></span> 项</div>" +
                            "<ul class='pager'>" +
                                "<li id='prevLi'><a style='color: darkgray;cursor: pointer' data-bind='click:prevPageH'><span class='entypo-left-open-big'></span>&nbsp;&nbsp;上一页</a></li>" +
                                "<li id='nextLi'><a style='color: darkgray;cursor: pointer' data-bind='click:nextPageH'>下一页&nbsp;&nbsp;<span class='entypo-right-open-big'></span></a></li>" +
                            "</ul>" +
                        "</div>" +
                    "</div>" +
                    "<div class='col-lg-6 column'>" +
                        "<div>" +
                            "<div style='margin-top: 10px;margin-bottom: 10px'><span class='label label-success'>父节点问题</span></div>" +
                                "<table class='table'>"+
                                "<tbody>" +
                                    "<tr>"+
                                        "<td class='col-lg-2 col-md-3 col-sm-3 col-xs-4'> 问题：</td>"+
                                        "<td class='subject' data-bind='html: fatherQuestion()'></td>"+
                                    "</tr>"+
                                    "<tr><td class='col-lg-2'> 答案：</td><td class='col-lg-10 subject' data-bind='html: fatherAnswer()'></td></tr>"+
                                    "<tr><td> 正确答案：</td><td class='subject' data-bind='text: fatherRightAnswer()'></td></tr>"+
                                    "<tr><td> 标签：</td><td class='subject' data-bind='html: fatherTag()'></td></tr>"+
                                    "<tr><td> 难度：</td><td class='subject' data-bind='text: fatherDifficulty()'></td></tr>"+
                                    "<tr><td> 回答次数：</td><td class='subject' data-bind='text: fatherPresence()'></td></tr>"+
                                    "<tr><td> 正确次数：</td><td class='subject' data-bind='text: fatherCorrect()'></td></tr>"+
                                "</tbody>"+
                            "</table>" +
                        "</div>"+
                    "</div>" +
                "</div>";
    dialogHQuestion = $.dialog({
        icon: "icon icon-plus",
        title: '启发式教学用题目',
        content: html,
        columnClass: "col-lg-12"
    });
    ko.applyBindings(vm,document.getElementById("heuristicQuestions"));
}

function seachChildrenQuestion(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPosH()-1)*vm.pageSizeH()+1;
    postObj.pageSize = vm.pageSizeH();
    postObj.key = $("#heuristicKey").val();
    postObj.type = $("#typeHeuristic").val();
    util.callServerFunction('adminGetQuestionList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.questionListH.removeAll();
            if (data.list.length > 0) {
                var list = [],questionAbstract = "",tag = "";
                for (var i = 0; i < data.list.length; i++) {
                    questionAbstract = "",tag = "";
                    for(var j=0;j<data.list[i].question.length;j++){
                        if(data.list[i].question[j].type == "text"){
                            questionAbstract = data.list[i].question[j].msg;
                            break;
                        }
                    }
                    $.each(data.list[i].tag,function(index,value){
                        tag += "<span class='label label-info'>"+value+"</span>&nbsp;&nbsp;";
                    });
                    list.push({
                        id: (i + 1),
                        question_id: data.list[i].question_id,
                        answer: data.list[i].answer,
                        category: data.list[i].category,
                        choice: data.list[i].choice,
                        correct: data.list[i].correct,
                        contributor: data.list[i].contributor,
                        copyRight: data.list[i].copyRight,
                        createTime: util.convertTime2Str(data.list[i].createTime),
                        difficulty: data.list[i].difficulty,
                        lastVerify: data.list[i].lastVerify,
                        layout: data.list[i].layout,
                        presence: data.list[i].presence,
                        question: data.list[i].question,
                        questionAbstract: questionAbstract,
                        status: data.list[i].status,
                        tags: data.list[i].tag,
                        valid: data.list[i].valid,
                        tag: tag,
                        type: data.list[i].type,
                        typeText: data.list[i].type,
                        updateTime: util.convertTime2Str(data.list[i].updateTime)
                    });
                }
                vm.questionListH(list);
            } else if (vm.startPosH() != 1) {
                vm.startPosH(vm.startPosH() - 1);
                seachChildrenQuestion();
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content: "您已经在最后一页了！"
                })
            }
            nextIdAll = "";
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function setChildren(){
    if(choiceIdAll == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "请选择右侧父节点问题答案选项！"
        })
    }else if(this.type == "default"){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "此问题已被设置为对战问题！"
        })
    }else if(this.type == "inspire"){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "此问题已被设置为父节点！"
        })
    }else{
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.question_id = fatherQusetionId;
        postObj.choice_id = choiceIdAll;
        postObj.sub_question_id = this.question_id;
        util.callServerFunction('adminAddSubQuestion', postObj, function (data) {
            if (data.statusCode == 900) {
                util.toast("设置子节点成功", "success", "提示信息");
                choiceIdAll = "";
                seachChildrenQuestion();
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

function setFather(){
    if(this.type == "default"){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "此问题已被设置为对战问题！"
        })
    }else if(this.type == "subinspire"){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content: "此问题已被设置为子节点！"
        })
    }else{
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.question_id = this.question_id;
        postObj.type = "inspire";
        util.callServerFunction('adminEditQuestion', postObj, function (data) {
            if (data.statusCode == 900) {
                util.toast("设置父节点成功", "success", "提示信息");
                seachChildrenQuestion();
            } else {
                errorCodeApi(data.statusCode);
            }
        });
    }
}

function selectFather(){
    fatherQusetionId = this.question_id;
    choiceIdAll = "";
    var question = "",answer = "",sort = ["A","B","C","D"];
    for(var i=0;i<this.question.length;i++){
        if(this.question[i].type == "text"){
            question += this.question[i].msg + "<br>";
        }else if(this.question[i].type == "image"){
            question += "<image style='width: 100%;height: auto' src='"+ util.changeUrl(this.question[i].msg) +"'><br>";
        }else if(this.question[i].type == "voice"){
            question += "<audio src='http://123.57.16.157:8062/redirectAmr?url="+ this.question[i].msg +"' controls='controls'></audio><br>";
        }
    }
    for(var j=0;j<sort.length;j++){
        for(var k=0;k<this.choice.length;k++){
            if(this.choice[k].flag == sort[j]){
                for(var p=0;p<this.choice[k].content.length;p++){
                    var msg = "";
                    if(this.choice[k].content[p].type == "text"){
                        msg = this.choice[k].content[p].msg;
                    }else if(this.choice[k].content[p].type == "image"){
                        msg = "<image style='width: 100%;height: auto' src='"+ util.changeUrl(this.choice[k].content[p].msg) +"'>";
                    }else if(this.choice[k].content[p].type == "voice"){
                        msg = "<audio src='http://123.57.16.157:8062/redirectAmr?url="+ this.choice[k].content[p].msg +"' controls='controls'></audio>";
                    }
                    if(p == 0){
                        answer += "<div style='margin-bottom: 5px'><button class='btn source' name='answerBtn' onclick=\"setFatherAnswer(this,'"+ this.choice[k].choice_id +"')\">"+ sort[j] +"</button><span style='margin-left: 10px'>"+ msg +"</span></div>";
                    }else{
                        answer += "<div style='margin-bottom: 5px'><span style='margin-left: 10px'>"+ msg +"</span></div>";
                    }
                }
                if(this.choice[k].next != "" && this.choice[k].next != undefined){
                    answer += "<div style='padding-left: 10px;margin-bottom: 5px;border-bottom: 1px #ddd solid'><span class='icon icon-checkmark'>已绑定子节点</span>&nbsp;&nbsp;<a style='cursor: pointer' onclick=\"showChildQuestion('"+ this.choice[k].next +"')\"><span class='icon icon-location'></span>查看子节点</a>&nbsp;&nbsp;<a style='cursor: pointer' onclick=\"delChildQuestion('"+ this.choice[k].choice_id +"')\"><span class='icon icon-trash'></span>删除子节点</a></div>";
                }else{
                    answer += "<div style='padding-left: 10px;margin-bottom: 5px;border-bottom: 1px #ddd solid'><span class='icon icon-cross'>无绑定子节点</div>";
                }
            }
        }
    }
    vm.fatherQuestion(question);
    vm.fatherAnswer(answer);
    vm.fatherRightAnswer(this.answer);
    vm.fatherTag(this.tag);
    vm.fatherDifficulty(this.difficulty);
    vm.fatherPresence(this.presence);
    vm.fatherCorrect(this.correct);
}

function setFatherAnswer(obj,choiceId) {
    choiceIdAll = choiceId;
    $(":button[name='answerBtn']").each(function(){
        $(this).removeClass("btn-info");
    });
    $(obj).addClass("btn-info");
}

function prevPageH(){
    if(vm.startPosH()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vm.startPosH(vm.startPosH()-1);
        seachChildrenQuestion();
    }
}

function nextPageH(){
    vm.startPosH(vm.startPosH()+1);
    seachChildrenQuestion();
}

function showChildQuestion(nextId){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.question_id = nextId;
    util.callServerFunction('adminGetQuestionDetail', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.questionListH.removeAll();
            var list = [], questionAbstract = "", tag = "";
            for(var j=0;j<data.detail.question.length;j++){
                if(data.detail.question[j].type == "text"){
                    questionAbstract = data.detail.question[j].msg;
                    break;
                }
            }
            $.each(data.detail.tag,function(index,value){
                tag += "<span class='label label-info'>"+value+"</span>&nbsp;&nbsp;";
            });
            list.push({
                id: 1,
                question_id: data.detail.question_id,
                answer: data.detail.answer,
                category: data.detail.category,
                choice: data.detail.choice,
                correct: data.detail.correct,
                contributor: data.detail.contributor,
                copyRight: data.detail.copyRight,
                createTime: util.convertTime2Str(data.detail.createTime),
                difficulty: data.detail.difficulty,
                lastVerify: data.detail.lastVerify,
                layout: data.detail.layout,
                presence: data.detail.presence,
                question: data.detail.question,
                questionAbstract: questionAbstract,
                status: data.detail.status,
                tags: data.detail.tag,
                valid: data.detail.valid,
                tag: tag,
                type: data.detail.type,
                typeText: data.detail.type,
                updateTime: util.convertTime2Str(data.detail.updateTime)
            });
            vm.questionListH(list);
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function delChildQuestion(choiceId){
    $.confirm({
        icon: 'fontawesome-warning-sign',
        title: '提示信息',
        content: "确定要删除此节点吗？",
        confirmButton: "<span class='fontawesome-ok'></span>&nbsp;&nbsp;确定",
        cancelButton: "<span class='fontawesome-remove'></span>&nbsp;&nbsp;取消",
        confirm: function() {
            var postObj = {};
            postObj.userID = util.getSessionStorage("userID");
            postObj.authSign = util.getSessionStorage("authSign");
            postObj.question_id = fatherQusetionId;
            postObj.choice_id = choiceId;
            postObj.sub_question_id = "";
            util.callServerFunction('adminAddSubQuestion', postObj, function (data) {
                if (data.statusCode == 900) {
                    util.toast("删除子节点成功", "success", "提示信息");
                    seachChildrenQuestion();
                } else {
                    errorCodeApi(data.statusCode);
                }
            });
        }
    })
}

var viewModel = function(){
    this.questionList = ko.observableArray();
    this.questions = ko.observableArray();
    this.choices = ko.observableArray();
    this.contentTemp = ko.observableArray();
    this.startPos = ko.observable(1);
    this.pageSize = ko.observable(15);
    this.isEditQuestionImg = ko.observable("");
    this.isEditChoiceImg = ko.observable("");
    this.prevPage = prevPage;
    this.nextPage = nextPage;
    this.loadQuestionList = loadQuestionList;
    this.subLoadQuestionList = subLoadQuestionList;
    this.showDetail = showDetail;
    this.initEditQuestionText = initEditQuestionText;
    this.deleteQuestionContent = deleteQuestionContent;
    this.addQuestionImg = addQuestionImg;
    this.editQuestionImg = editQuestionImg;
    this.deleteChoice = deleteChoice;
    this.addQuestionText = addQuestionText;
    this.initEditChoiceText = initEditChoiceText;
    this.deleteChoiceContent = deleteChoiceContent;
    this.editChoiceImg = editChoiceImg;
    this.initEditChoice = initEditChoice;
    this.initAddChoice = initAddChoice;
    this.subAddQuestion = subAddQuestion;
    this.initEditQuestion = initEditQuestion;

    this.fatherQuestion = ko.observable("");
    this.fatherAnswer = ko.observable("");
    this.fatherRightAnswer = ko.observable("");
    this.fatherTag = ko.observable("");
    this.fatherDifficulty = ko.observable("");
    this.fatherPresence = ko.observable("");
    this.fatherCorrect = ko.observable("");

    this.questionListH = ko.observableArray();
    this.setChildren = setChildren;
    this.setFather = setFather;
    this.selectFather = selectFather;
    this.startPosH = ko.observable(1);
    this.pageSizeH = ko.observable(10);
    this.prevPageH = prevPageH;
    this.nextPageH = nextPageH;

};
var vm = new viewModel();
var date = new Date();
var xhr = new XMLHttpRequest();
var dialogAddChoice = "", flags = ["A","B","C","D","E","F","G"], dialogAddQuestion = "", dialogEditQuestion = "", dialogHQuestion = "", errorDialog = "", choiceIdAll = "", fatherQusetionId = "";
$(document).ready(function() {
    ko.applyBindings(vm,document.getElementById("questionManage"));
    $('.selectpicker').selectpicker({
        style: 'btn btn-info'
    });
    $('.btn-group').css("width","100%");
    document.onkeydown = function(event) {
        if (window.event.keyCode == 13 && window.event.ctrlKey) {
            subAddChoice("add");
            return false;
        }
        if(window.event.keyCode==13) {
            if(dialogAddQuestion!="") {
                subAddQuestion("add");
            } else if(dialogEditQuestion!="") {
                subAddQuestion("edit");
            } else {
                subLoadQuestionList();
            }
            return false;
        }
    }
    loadQuestionList();
});