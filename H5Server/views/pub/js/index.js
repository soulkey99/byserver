/**
 * Created by hjy on 2015/11/2 0002.
 */

function tabArticleList(){
    var url = "articleList.html";
    var breadcrumbs = "<li>首页</li><li>文章管理</li><li>文章列表</li>";
    setData(url,breadcrumbs);
}

function tabAddArticle(){
    var url = "addArticle.html";
    var breadcrumbs = "<li>首页</li><li>文章管理</li><li>添加文章</li>";
    setData(url,breadcrumbs);
}

function tabEditArticle(){
    var url = "editArticle.html";
    var breadcrumbs = "<li>首页</li><li>文章管理</li><li>修改文章</li>";
    setData(url,breadcrumbs);
}

function tabAddNews(){
    var url = "addNews.html";
    var breadcrumbs = "<li>首页</li><li>消息管理</li><li>添加消息</li>";
    setData(url,breadcrumbs);
}

function tabNewsList(){
    var url = "newsList.html";
    var breadcrumbs = "<li>首页</li><li>消息管理</li><li>消息列表</li>";
    setData(url,breadcrumbs);
}

function tabEditNews(){
    var url = "editNews.html";
    var breadcrumbs = "<li>首页</li><li>消息管理</li><li>修改消息</li>";
    setData(url,breadcrumbs);
}

function tabImproveUserInfo(){
    var url = "improveUserInfo.html";
    var breadcrumbs = "<li>首页</li><li>完善我的信息</li>";
    setData(url,breadcrumbs);
}

function setData(url,breadcrumbs){
    $(".main").each(function(){
        if($(this).is(":visible")){
            $(this).empty();
            $(this).load(url);
        }
    })
    $(".breadcrumbs").each(function(){
        if($(this).is(":visible")){
            $(this).empty();
            $(this).append(breadcrumbs);
        }
    })
}

function loginOut(){
    window.sessionStorage.clear();
    window.location.href = "login.html";
}

$(document).ready(function(){
    $(document).foundation();
    var mtree = $('ul.mtree');
    $("#nick").append(util.getSessionStorage("nick"));
})

//判断是否登陆 未登陆直接跳转到登陆页
if ((!util.getSessionStorage("userID")) || (!util.getSessionStorage("authSign"))) {
    window.location.href = "login.html";
}