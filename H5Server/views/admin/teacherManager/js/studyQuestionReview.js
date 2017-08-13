/**
 * Created by hjy on 2016/9/20 0020.
 */

function loadReviewList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.startPos = (vm.startPosReview()-1)*vm.pageSizeReview()+1;
    postObj.pageSize = vm.pageSizeReview();
    postObj.query = $("#query").val();
    postObj.status = $("#status").val();
    postObj.stage = $("#stage").val();
    postObj.grade = $("#grade").val();
    postObj.u_id = $("#u_id").val();
    util.callServerFunction('adminGetStudyQuestionList', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.reviewList.removeAll();
            if (data.list.length > 0) {
                vm.reviewList(data.list);
                MathJax.Hub.Queue(["Typeset",MathJax.Hub, "reviewTable"]);
            } else if (vm.startPosReview() != 1) {
                vm.startPosReview(vm.startPosReview() - 1);
                loadReviewList();
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

function prevPageReview(){
    if(vm.startPosReview()==1){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"您已经在第一页了！"
        })
    }else{
        vm.startPosReview(vm.startPosReview()-1);
        loadReviewList();
    }
}

function nextPageReview(){
    vm.startPosReview(vm.startPosReview()+1);
    loadReviewList();
}

function subLoadReviewList(){
    vm.startPosReview(1);
    vm.pageSizeReview(15);
    loadReviewList();
}

function loadUserList(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    util.callServerFunction('adminGetQuestionAdminList', postObj, function (data) {
        if (data.statusCode == 900) {
            $("#u_id").append("<option value=''>全部</option>");
            for(var i=0;i<data.list.length;i++){
                $("#u_id").append("<option value='"+ data.list[i].userID +"'>"+ data.list[i].userNick +"</option>");
            }
            $('.selectpicker').selectpicker({
                style: 'btn btn-info'
            });
            $('.btn-group').css("width","100%");
        } else {
            errorCodeApi(data.statusCode);
        }
    });
}

function initJit(){
    //init data
    json = {
        id: "",
        name: "",
        data: {
            type: "",
            parentId: ""
        },
        children: [{

        }]
    };
    var subtree = json.children.pop();
    //end
    var removing = false;
    //init Spacetree
    //Create a new ST instance
    st = new $jit.ST({
        injectInto: "infovis",
        orientation: "top",
        levelDistance: 50,
        levelsToShow: 50,
        //offsetY: 350,
        Navigation: {
            enable: true,
            panning: "avoid nodes",
            zooming: false
        },
        NodeStyles: {
            enable: false,
            type: 'auto',
            stylesHover: true,
            stylesClick: true
        },
        Tips: {
            enable: true,
            type: 'HTML',
            offsetX: 20,
            offsetY: 20,
            force: false,
            onShow: function(tip, node) {
                tip.innerHTML = "<span class='tip' style='border: 1px #CCCCCC solid;background-color: white'>"+ node.name +"</span>";
                MathJax.Hub.Queue(["Typeset",MathJax.Hub, tip]);
            },
            onHide: function() {

            }
        },
        Events: {
            enable: true,
            onClick: function(node, eventInfo, e){
                if(node){
                    st.select(node.id,"animate");
                }
            }
        },
        align: "center",
        //set overridable=true if you want
        //to set styles for nodes individually
        Node: {
            overridable: true,
            //width: 10,
            //height: 30,
            color: "#f77",
            autoHeight: false,
            autoWidth: true,
            height: 20
        },
        //change the animation/transition effect
        transition: $jit.Trans.Quart.easeOut,

        onBeforeCompute: function(node){
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
        },

        onAfterCompute: function(node){
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
        },

        //This method is triggered on label
        //creation. This means that for each node
        //this method is triggered only once.
        //This method is useful for adding event
        //handlers to each node label.
        onCreateLabel: function(label, node){
            //add some styles to the node label
            if(node.name.indexOf("<img")>=0){
                label.innerHTML = node.name.substring(0,node.name.indexOf("<img"));
            }else{
                label.innerHTML = node.name;
            }
            var style = label.style;
            label.id = node.id;
            style.color = 'green';
            style.fontSize = '0.6em';
            style.textAlign = 'center';
            //style.width = "60px";
            style.cursor = "pointer";
            if(node.getData('width') > 300){
                //style.width = "300px";
                //node.data.$width = 10;
            }else{
                //style.width = node.getData('width') + 'px';
                //node.data.$width = 10;
            }
            style.width = node.getData('width') + 'px';
            style.height = node.getData('height') + 'px';
            node.data.$height = node.getData('height');
            //console.log(node);
            //Delete the specified subtree
            //when clicking on a label.
            //Only apply this method for nodes
            //in the first level of the tree.
        },
        //This method is triggered right before plotting a node.
        //This method is useful for adding style
        //to a node before it's being rendered.
        onBeforePlotNode: function(node) {
            node.data.$width = node.getData('width');
            if (node._depth%2 == 0 && node._depth!=0 && node._depth!=1) {
                if (node.selected) {
                    node.data.$color = "#ff7";
                } else {
                    //delete node.data.$color;
                    node.data.$color = '#ccc';
                }
            } else {
                if (node.selected) {
                    node.data.$color = "#ff7";
                } else {
                    node.data.$color = '#f77';
                }
            }
        }
    });
    //load json data
    st.loadJSON(json);
    //compute node positions and layout
    st.compute();
    //optional: make a translation of the tree
    st.geom.translate(new $jit.Complex(-200, 0), "current");
    //Emulate a click on the root node.
    st.onClick(st.root);
    //end
}

function initJit(){
    //init data
    json = {
        id: "",
        name: "",
        data: {
            type: "",
            parentId: ""
        },
        children: [{

        }]
    };
    var subtree = json.children.pop();
    //end
    var removing = false;
    //init Spacetree
    //Create a new ST instance
    var st = new $jit.ST({
        injectInto: "infovis",
        orientation: "top",
        levelDistance: 50,
        levelsToShow: 50,
        //offsetY: 350,
        Navigation: {
            enable: true,
            panning: "avoid nodes",
            zooming: false
        },
        NodeStyles: {
            enable: false,
            type: 'auto',
            stylesHover: true,
            stylesClick: true
        },
        Tips: {
            enable: true,
            type: 'HTML',
            offsetX: 20,
            offsetY: 20,
            force: false,
            onShow: function(tip, node) {
                tip.innerHTML = "<span class='tip' style='border: 1px #CCCCCC solid;background-color: white'>"+ node.name +"</span>";
                MathJax.Hub.Queue(["Typeset",MathJax.Hub, tip]);
            },
            onHide: function() {

            }
        },
        Events: {
            enable: true,
            onClick: function(node, eventInfo, e){
                if(node){
                    st.select(node.id,"animate");
                }
            }
        },
        align: "center",
        //set overridable=true if you want
        //to set styles for nodes individually
        Node: {
            overridable: true,
            //width: 10,
            //height: 30,
            color: "#f77",
            autoHeight: false,
            autoWidth: true,
            height: 20
        },
        //change the animation/transition effect
        transition: $jit.Trans.Quart.easeOut,

        onBeforeCompute: function(node){
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
        },

        onAfterCompute: function(node){
            MathJax.Hub.Queue(["Typeset",MathJax.Hub, "infovis"]);
        },

        //This method is triggered on label
        //creation. This means that for each node
        //this method is triggered only once.
        //This method is useful for adding event
        //handlers to each node label.
        onCreateLabel: function(label, node){
            //add some styles to the node label
            if(node.name.indexOf("<img")>=0){
                label.innerHTML = node.name.substring(0,node.name.indexOf("<img"));
            }else{
                label.innerHTML = node.name;
            }
            var style = label.style;
            label.id = node.id;
            style.color = 'green';
            style.fontSize = '0.6em';
            style.textAlign = 'center';
            //style.width = "60px";
            style.cursor = "pointer";
            if(node.getData('width') > 300){
                //style.width = "300px";
                //node.data.$width = 10;
            }else{
                //style.width = node.getData('width') + 'px';
                //node.data.$width = 10;
            }
            style.width = node.getData('width') + 'px';
            style.height = node.getData('height') + 'px';
            node.data.$height = node.getData('height');
            //console.log(node);
            //Delete the specified subtree
            //when clicking on a label.
            //Only apply this method for nodes
            //in the first level of the tree.
        },
        //This method is triggered right before plotting a node.
        //This method is useful for adding style
        //to a node before it's being rendered.
        onBeforePlotNode: function(node) {
            node.data.$width = node.getData('width');
            if (node._depth%2 == 0 && node._depth!=0 && node._depth!=1) {
                if (node.selected) {
                    node.data.$color = "#ff7";
                } else {
                    //delete node.data.$color;
                    node.data.$color = '#ccc';
                }
            } else {
                if (node.selected) {
                    node.data.$color = "#ff7";
                } else {
                    node.data.$color = '#f77';
                }
            }
        }
    });
    //load json data
    st.loadJSON(json);
    //compute node positions and layout
    st.compute();
    //optional: make a translation of the tree
    st.geom.translate(new $jit.Complex(-200, 0), "current");
    //Emulate a click on the root node.
    st.onClick(st.root);
    //end
    return st;
}

function initReview(){
    vm.q_id(this.q_id);
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.q_id = this.q_id;
    util.callServerFunction('adminGetFullQuestion', postObj, function (data) {
        if (data.statusCode == 900) {
            dialog = $.dialog({
                columnClass: "col-lg-12",
                icon: "icon icon-preview",
                title: '审核',
                content: "<div id='infovis' class='col-lg-8' style='height: 500px;'></div>" +
                "<div class='col-lg-4' style='height: 500px;border-left: 1px #CCCCCC solid'>" +
                "<div><i class='fa entypo-info-circled'></i>不通过原因</div>" +
                "<div><textarea style='width:100%;border-color: #C7D5E0' id='reason' rows='5'></textarea></div>" +
                "<div style='width: 100%;text-align: center'>" +
                    "<button type='button' title='通过' class='btn btn-rounded' onclick='review_granted()'><i class='icon icon-checkmark'></i> 通过</button>&nbsp;&nbsp;&nbsp;&nbsp;" +
                    "<button type='button' title='不通过' class='btn btn-rounded' onclick='review_rejected()'><i class='icon icon-cross'></i> 不通过</button>" +
                "</div>" +
                "</div>"
            });
            var st = initJit();
            var json = data.info;
            st.loadJSON(json);
            st.compute();
            st.geom.translate(new $jit.Complex(-200, 0), "current");
            st.onClick(st.root);
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
        }
    });
}

function review_granted(){
    var postObj = {};
    postObj.userID = util.getSessionStorage("userID");
    postObj.authSign = util.getSessionStorage("authSign");
    postObj.q_id = vm.q_id();
    postObj.status = "verified";
    util.callServerFunction('adminCheckStudyQuestion', postObj, function (data) {
        if (data.statusCode == 900) {
            util.toast("操作成功", "success", "系统提示");
            dialog.close();
            vm.q_id("");
        } else {
            alert(data.message);
            errorCodeApi(data.statusCode);
        }
    });
}

function review_rejected(){
    if($("#reason").val() == ""){
        $.dialog({
            icon: 'icon icon-warning',
            title: '提示信息',
            content:"请填写不通过原因！"
        })
    }else{
        var postObj = {};
        postObj.userID = util.getSessionStorage("userID");
        postObj.authSign = util.getSessionStorage("authSign");
        postObj.q_id = vm.q_id();
        postObj.status = "fail";
        postObj.mag = $("#reason").val();
        util.callServerFunction('adminCheckStudyQuestion', postObj, function (data) {
            if (data.statusCode == 900) {
                util.toast("操作成功", "success", "系统提示");
                dialog.close();
                vm.q_id("");
            } else {
                alert(data.message);
                errorCodeApi(data.statusCode);
            }
        });
    }
}

var viewModel = function(){
    this.reviewList = ko.observableArray();
    this.startPosReview = ko.observable(1);
    this.pageSizeReview = ko.observable(15);
    this.q_id = ko.observable("");
    this.prevPageReview = prevPageReview;
    this.nextPageReview = nextPageReview;
    this.loadReviewList = loadReviewList;
    this.subLoadReviewList = subLoadReviewList;
    this.initReview = initReview;
};
var vm = new viewModel()
    ,dialog = "";
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
$(document).ready(function(){
    ko.applyBindings(vm,document.getElementById("studyQuestionReview"));
    loadUserList();
    document.onkeydown=function(event){
        e = event ? event :(window.event ? window.event : null);
        if(e.keyCode==13){
            subLoadReviewList();
            return false;
        }
    }
    loadReviewList();
});