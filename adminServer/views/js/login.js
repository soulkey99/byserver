/**
 * Created by MengLei on 2015/4/10.
 */

/**
 * 执行登录操作
 */
function doLogin()
{
    var json =
    {
    };
    json.userName = $('#user_name').val();
    json.userPwd = $('#user_pwd').val();

    if (!json.userName)
    {
        util.showDialog('请输入用户名。');
        return;
    }
    if (!json.userPwd)
    {
        util.showDialog('请输入密码。');
        return;
    }
    showLoading('正在登录......');
    util.callServerFunction('adminLogin', json, loginCallback);
}

function loginCallback(data)
{
    hideLoading();
    if (data.statusCode == 900) {
        /* 用户信息更新到Storage */
        var userID = data.userID;
        var nick = data.nick;
        var authSign = data.authSign;
        var adminType = data.adminType;
        util.setSessionStorage('userID', userID);
        util.setSessionStorage('nick', nick);
        util.setSessionStorage('adminType', adminType);
        util.setSessionStorage('authSign', authSign);
        /* 打开主界面 */
        window.open('adminCenter.html', '_self');
    }
    else
    {
        util.showDialog('登录失败，请稍后重试。');
    }
}

/**
 * 密码输入框回车时调用login
 * @param {Object} event
 */
function pwdKeydown(event)
{
    if (event.keyCode == 13)
    {
        doLogin()
    }
}

$(document).ready(function()
{
    /* 页面初始焦点设置到用户名上 */
    $('#user_nick').focus();

    if(!window.sessionStorage)
    {
        util.showDialog('该浏览器不支持HTML5 Storage，可能无法正常使用。<br/>推荐使用新版本的Chrome或浏览器。');
    }
});

/**
 * 显示等待画面
 * @param {Object} msg
 */
function showLoading(msg)
{
    if (!msg)
    {
        msg = '';
    }
    $('#loadConatiner>span').html(msg);
    $('#loadmask').show();
    $('#loadConatiner').css('top', Math.ceil($(window).height() / 2));
    $('#loadConatiner').css('left', Math.ceil(($(window).width() - $('#loadConatiner').width()) / 2));
    $('#loadConatiner').show();
}

/**
 * 隐藏等待画面
 */
function hideLoading()
{
    $('#loadConatiner').hide();
    $('#loadmask').hide();
}