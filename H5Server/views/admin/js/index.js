/**
 * Created by MengLei on 2015/8/3.
 */

//记住密码
function rember(){
    $("#inputUserName").val(localStorage.getItem("userName"));
    $("#inputPassword").val(localStorage.getItem("passwd"));
}

//登陆
function signin(){
    var userName = $('#inputUserName')[0].value;
    var passwd = $('#inputPassword')[0].value;
    var postData = {userName: userName, passwd: passwd};

    if($("#rember").is(':checked')){
        localStorage.setItem("userName", userName);
        localStorage.setItem("passwd", passwd);
    }else{
        localStorage.clear();
    }

    util.callServerFunction('adminLogin', postData, function(data){
        switch (data.statusCode){
            case 900:
                util.setSessionStorage('userID', data.userID);
                util.setSessionStorage('authSign', data.authSign);
                util.setSessionStorage('userType', data.userType);
                util.setSessionStorage('sections', data.sections);
                util.setSessionStorage('pages', data.pages);
                util.setSessionStorage('nick', data.nick);
                util.setSessionStorage('lastLoginTime', util.convertTime2Str(data.lastLoginTime));
                window.location.href = 'admin/index.html';
                break;
            default :
                $.dialog({
                    icon: 'icon icon-warning',
                    title: '提示信息',
                    content:"请输入正确的用户名和密码！"
                })
                break;
        }
    })
}
document.onkeydown=function(event){
    e = event ? event :(window.event ? window.event : null);
    if(e.keyCode==13){
        signin();
    }
}
rember();