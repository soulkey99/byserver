/**
 * Created by MengLei on 2015/8/21.
 */


$(document).ready(function() {
    if(util.getSessionStorage('userID')) {
        Init();
    }else{
        $('#popupLogin').show();
    }
});


function Init(){
    var d=new Date();
    $('#startTime')[0].value = (d.getFullYear().toString()+'-' + (d.getMonth()+1).toString() + '-' + d.getDate().toString());
    $('#endTime')[0].value = (d.getFullYear().toString()+'-' + (d.getMonth()+1).toString() + '-' + d.getDate().toString());
    $('#startTime1')[0].value = (d.getFullYear().toString()+'-' + (d.getMonth()+1).toString() + '-' + d.getDate().toString());
    $('#endTime1')[0].value = (d.getFullYear().toString()+'-' + (d.getMonth()+1).toString() + '-' + d.getDate().toString());
    //queryData();
    queryTeacherStat()
}

function setSessionStorage(key, value){
    if (window.sessionStorage){
        window.sessionStorage.setItem(key, value);
        return true;
    }else {
        return false;
    }
}


function doLogin(){
    var userName = $('#user_name')[0].value;
    var userPwd = $('#user_pwd')[0].value;
    if(!userName || !userPwd){
        alert('请输入用户名和密码！');
    }
    var postObj = {
        userName: userName,
        userPwd: userPwd
    };

    util.callServerFunction('adminLogin', postObj, function(data){
        if(data.statusCode == 900){
            util.setSessionStorage('userID', data.userID);
            util.setSessionStorage('authSign', data.authSign);
            $('#popupLogin').hide();
            Init();
        }else{
            alert('登录失败！');
        }
    })
}

function getSessionStorage(key){
    if (window.sessionStorage){
        return window.sessionStorage.getItem(key);
    } else{
        return null;
    }
}

function queryData(){
    var postObj = {
        userID: getSessionStorage('userID'),
        authSign: getSessionStorage('authSign')
    };
    if($('#startTime1')[0].value){
        var ts = new Date($('#startTime1')[0].value);
        ts.setHours(0);
        ts.setMinutes(0);
        ts.setSeconds(0);
        postObj.startTime = ts.getTime();
    }
    if($('#endTime1')[0].value){
        var te = new Date($('#endTime1')[0].value);
        te.setHours(23);
        te.setMinutes(59);
        te.setSeconds(59);
        postObj.endTime = te.getTime();
    }

    $.ajax({type: "POST",
        dataType: "JSON",
        url: '/api?m=getQuestionStat',
        data: postObj,
        success: function (resp) {
            if (resp.statusCode == 900) {
                //成功
                vm.stat_all(resp.stats.total || 0);
                vm.stat_canceled(resp.stats.canceled || 0);
                vm.stat_finished(resp.stats.finished || 0);
                vm.stat_timeout(resp.stats.timeout || 0);
                vm.stat_pending(resp.stats.pending || 0);
                vm.stat_received(resp.stats.received || 0);
                vm.stat_toBeFinished(resp.stats.toBeFinished || 0);
                var stat_primary = '小学： ';
                var stat_junior = '初中： ';
                var stat_senior = '高中： ';
                for(var item in resp.stats.gs['小学']){
                    stat_primary += (item + '：' + resp.stats.gs['小学'][item] + '，');
                }
                vm.stat_primary(stat_primary);
                for(var item in resp.stats.gs['初中']){
                    stat_junior += (item + '：' + resp.stats.gs['初中'][item] + '，');
                }
                vm.stat_junior(stat_junior);
                for(var item in resp.stats.gs['高中']){
                    stat_senior += (item + '：' + resp.stats.gs['高中'][item] + '，');
                }
                vm.stat_senior(stat_senior);
            }else if(resp.statusCode == 903) {
                alert('请重新登陆！');
                $('#popupLogin').show();
            }else{
                //获取积分失败
            }
        },
        error: function(err){
            console.log(err);
        }
    });
}

function queryTeacherStat(){
    //
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign')
    };
    if($('#allTeacher')[0].checked){
        postObj.qType = 'all';
    }
    if($('#startTime')[0].value){
        var ts = new Date($('#startTime')[0].value);
        ts.setHours(0);
        ts.setMinutes(0);
        ts.setSeconds(0);
        postObj.startTime = ts.getTime();
    }
    if($('#endTime')[0].value){
        var te = new Date($('#endTime')[0].value);
        te.setHours(23);
        te.setMinutes(59);
        te.setSeconds(59);
        postObj.endTime = te.getTime();
    }

    util.callServerFunction('queryTeacherAnswerStat', postObj, function(resp){
        if(resp.statusCode == 900){
            //
            vm.itemList.removeAll();
            resp.list.sort(function(a, b){
                return b.t_count - a.t_count;
            });
            vm.itemList(resp.list);
        }else if(resp.statusCode == 903) {
            alert('请重新登陆！');
            $('#popupLogin').show();
        }else{
            //加载失败
        }
    })
}

function queryTeacherStatDetail(u_id) {
    //
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        u_id: u_id
    };
    if ($('#startTime')[0].value) {
        var ts = new Date($('#startTime')[0].value);
        ts.setHours(0);
        ts.setMinutes(0);
        ts.setSeconds(0);
        postObj.startTime = ts.getTime();
    }
    if ($('#endTime')[0].value) {
        var te = new Date($('#endTime')[0].value);
        te.setHours(23);
        te.setMinutes(59);
        te.setSeconds(59);
        postObj.endTime = te.getTime();
    }

    util.callServerFunction('teacherStatDetail', postObj, function (data) {
        if (data.statusCode == 900) {
            vm.total_num(data.total.total);
            var gsList = [];
            for (var item in data.total.data) {
                var gsItem = {gsItem: item + ': '};
                for (var item2 in data.total.data[item]) {
                    //
                    gsItem.gsItem += (item2 + ': ' + data.total.data[item][item2] + '     ');
                }
                gsList.push(gsItem);
            }
            vm.gsList(gsList);
            var dailyList = [];
            for (var i = 0; i < data.daily.length; i++) {
                dailyList.push({
                    fullDate: data.daily[i].fullDate,
                    count: data.daily[i].count,
                    s_count: data.daily[i].stu.length
                });
            }
            vm.dailyList(dailyList);
            var stuList = [];
            for (var j = 0; j < data.stu.length; j++) {
                stuList.push({
                    s_name: data.stu[j].s_name,
                    s_phone: data.stu[j].s_phone,
                    s_count: data.stu[j].s_count,
                    s_id: data.stu[j].s_id,
                    t_id: u_id,
                    self: (data.stu[j].self ? '是' : '否')
                });
            }
            vm.stuList(stuList);
        }
    });
}

function showDetail(){
    //
    $("#popupDetailList").show();
    vm.t_name(this.name);
    queryTeacherStatDetail(this.u_id);
}

function closePopup(){
    $("#popupDetailList").hide();
}

function closeQuestionListPopup(){
    $("#popupQuestionList").hide();
}

function closeQuestionDetailPopup(){
    $("popupQuestionDetail").hide();
}

function showQuestionList(){
    //
}

function showQuestionDetail(){
    //
}
