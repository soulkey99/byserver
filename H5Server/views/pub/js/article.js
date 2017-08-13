/**
 * Created by Hjy on 2015/10/30 0030.
 */

function loadArticle(){
    var postObj = {};
    if(util.getUrlParameter('userID')!="") {
        postObj.userID = util.getUrlParameter('userID');
    }
    if(util.getUrlParameter('authSign')!="") {
        postObj.authSign = util.getUrlParameter('authSign');
    }
    postObj.pt_id = util.getUrlParameter('pt_id');
    util.callServerFunction('getTopicDetail', postObj, function(resp){
        if(resp.statusCode == 900){
            vm.title(resp.detail.title);
            vm.author_nick(resp.detail.author_nick);
            vm.createTime(util.convertTime2Str(resp.detail.createTime));
            vm.content(resp.detail.content);
        }else{
            alert("错误代码：" + resp.statusCode + " 错误消息：" + resp.message);
        }
    })
}

var viewModel = function(){
    this.title = ko.observable();
    this.author_nick = ko.observable();
    this.createTime = ko.observable();
    this.content = ko.observable();
}
var vm = new viewModel();
$(document).ready(function(){
    ko.applyBindings(vm);
    loadArticle();
})