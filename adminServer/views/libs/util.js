var util = function()
{
};

/**
 * 获取当前页面的URL参数
 */
util.getUrlParameter = function(paramName)
{
    var paramValue = "";
    var isFound = false;
    if ((document.location.search.indexOf("?") == 0) && (document.location.search.indexOf("=") > 1))
    {
        var arrSource = unescape(document.location.search).substring(1, document.location.search.length).split("&");
        var i = 0;
        while (i < arrSource.length && !isFound)
        {
            if (arrSource[i].indexOf("=") > 0)
            {
                if (arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase())
                {
                    paramValue = arrSource[i].split("=")[1];
                    isFound = true;
                }
            }
            i++;
        }
    }
    return paramValue;
};

/**
 * 获取Cookie值
 */
util.getCookieValue = function(key)
{
    var strCookie = document.cookie;
    var arrCookie = strCookie.split("; ");
    for (var i = 0; i < arrCookie.length; i++)
    {
        var arr = arrCookie[i].split("=");
        if (arr[0] == key)
            return arr[1];
    }
    return "";
};

/**
 * 增加html5本地存储
 */
util.setSessionStorage = function(key, value)
{
    if (window.sessionStorage)
    {
        window.sessionStorage.setItem(key, value);
        return true;
    }
    else
    {
        return false;
    }
};

/**
 * 获取html5本地存储
 */
util.getSessionStorage = function(key)
{
    if (window.sessionStorage)
    {
        return window.sessionStorage.getItem(key);
    }
    else
    {
        return null;
    }
};

/**
 * 删除html5本地存储
 */
util.removeSessionStorage = function(key)
{
    if (window.sessionStorage)
    {
        window.sessionStorage.removeItem(key);
        return true;
    }
    else
    {
        return false;
    }
};

/**
 * 异步调用服务器接口
 */
util.callServerFunction = function(funcName, postData, callback, method)
{
    var networkError =
    {
        "code" : -1000,
        "data" :
        {
            "result" : "网络错误。"
        }
    };
    if (!method)
    {
        method = 'POST';
    }

    /* 服务器暂未添加会话，为了记录日志，暂时由客户端传递用户名，后续改为服务器从Session获取 */
    if(!postData)
    {
        postData = {};
    }
    /* 增加checkflag，服务器校验请求完整性 */
    postData['checkflag'] = true;

    $.ajax(
    {
        type : 'POST',
        async : true,
        url : '/api?m=' + funcName,
        dataType : 'json',
        data : postData,
        /* 成功时直接返回数据 */
        success : function(data, textStatus, jqXHR)
        {
            callback(data);
        },
        /* 失败时返回默认错误 */
        error : function(jqXHR, textStatus, errorThrown)
        {
            callback(networkError);
        }
    });
};

/**
 * 单独为保存JSON封装一个函数，path为课程目录开始
 */
util.saveJsonToServer = function(path, name, json, callback)
{
    util.callServerFunction('json.save',
    {
        'filepath' : path,
        'filename' : name,
        'json' : json
    }, callback);
};

/**
 * 请求JSON文件，path为课程目录开始
 */
util.getJsonFromServer = function(path, callback)
{
    var networkError =
    {
        "code" : -1000,
        "data" :
        {
            "result" : "网络错误。"
        }
    };
    $.ajax(
    {
        type : 'GET',
        async : true,
        cache : false,
        datatype : 'json',
        url : '/course/' + path,
       // url : '/education/data/' + path,
        /* 成功时直接返回数据 */
        success : function(data, textStatus, jqXHR)
        {
            callback(data);
        },
        /* 失败时返回默认错误 */
        error : function(jqXHR, textStatus, errorThrown)
        {
            callback(networkError);
        }
    });
};

/**
 * 检查用户会话状态，如果会话失效则跳转到登录页（暂时仅检查用户名）
 */
util.checkUserSession = function()
{
    var userId = util.getSessionStorage('userId');
    if (!userId)
    {
        alert("请先登录！");
        window.top.location = "login.html";
        return false;
    }
    return true;
};

/**
 * 弹出提示对话框
 * @param {string} msg 提示信息
 * @param {function} 回调函数（alert时'确认'回调，confirm时'是'回调）
 * @param {string} type 类型（默认'alert'，可选'confirm'）
 * @param {function} 回调函数（confirm时'否'回调）
 */
util.showDialog = function(msg, func, type, nfunc)
{
    /* 如果顶级窗口有util，则由顶级窗口弹出 */
    var win = window;
    if (window.top && window.top.util)
    {
        win = window.top;
    }
    /* 如果不存在#dialog-message则创建 */
    if (win.$('#dialog-message').length > 0)
    {
        var html = '#dialog-message';
        win.$('#dialog-message').html(msg);
    }
    else
    {
        var html = '<div class="dialog" id="dialog-message">' + msg + '</div>';
    }

    if (type == 'confirm')
    {
        win.$(html).dialog(
        {
            resizable : false,
            modal : true,
            show :
            {
                effect : 'fade',
                duration : 300
            },
            title : "确认",
            open : function(event, ui)
            {
                win.$(".ui-dialog-titlebar-close").hide();
            },
            buttons :
            {
                "是" : function()
                {
                    var dlg = top.$(this).dialog("close");
                    func && func.call();
                },
                "否" : function()
                {
                    var dlg = top.$(this).dialog("close");
                    nfunc && nfunc.call();
                }
            }
        });
    }
    else
    {
        win.$(html).dialog(
        {
            resizable : false,
            modal : true,
            show :
            {
                effect : 'fade',
                duration : 300
            },
            title : "提示",
            open : function(event, ui)
            {
                win.$(".ui-dialog-titlebar-close").hide();
            },
            buttons :
            {
                "确定" : function()
                {
                    top.$(this).dialog("close");
                    func && func.call();
                }
            }
        });
    }
};

/**
 * 显示顶层页面的等待画面
 * @param {Object} msg
 */
util.showLoading = function(msg)
{
    var win = window;
    if (window.top && window.top.showLoading)
    {
        window.top.showLoading(msg);
    }
    else
    {
        window.showLoading(msg);
    }
};

/**
 * 隐藏顶层页面的等待画面
 */
util.hideLoading = function()
{
    var win = window;
    if (window.top && window.top.hideLoading)
    {
        window.top.hideLoading();
    }
    else
    {
        window.hideLoading();
    }
};

/**
 * 将textarea的内容中的回车转换为<br/>
 * 保证入库的数据无换行。
 */
util.enterToBr = function(data)
{
    return data.replace(/\n/gi, '<br\/>');
};

/**
 * 将textarea的内容中的<br/>转换为回车
 * 保证入库的数据无换行。
 */
util.brToEnter = function(data)
{
    return data.replace(/<br\/>/gi, '\n');
};

/**
 * 用"0"进行满位填充
 */
util.fillZero = function(num, len)
{
    num = '0000000000' + num;
    return num.substring(num.length - len);
};

/**
 * 获取时间戳
 * @param {Object} separator 1：正常分隔YYYY-MM-DD HH:mm:ss；其它：无分隔
 */
util.getTimestamp = function(separator)
{
    var time = new Date();
    var timeStr = '';
    if (separator == 1)
    {
        timeStr += time.getFullYear();
        timeStr += '-' + util.fillZero(time.getMonth() + 1, 2);
        timeStr += '-' + util.fillZero(time.getDate(), 2);
        timeStr += ' ' + util.fillZero(time.getHours(), 2);
        timeStr += ':' + util.fillZero(time.getMinutes(), 2);
        timeStr += ':' + util.fillZero(time.getSeconds(), 2);
    }
    else
    {
        timeStr += time.getFullYear();
        timeStr += util.fillZero(time.getMonth() + 1, 2);
        timeStr += util.fillZero(time.getDate(), 2);
        timeStr += util.fillZero(time.getHours(), 2);
        timeStr += util.fillZero(time.getMinutes(), 2);
        timeStr += util.fillZero(time.getSeconds(), 2);
    }
    return timeStr;
};
