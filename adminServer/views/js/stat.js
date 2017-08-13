/**
 * Created by MengLei on 2015/8/20.
 */


$(document).ready(function() {
    Init();
});


function Init(){
    var d=new Date();
    $('#startTime')[0].value = (d.getFullYear().toString()+'-' + (d.getMonth()+1).toString() + '-' + d.getDate().toString());
    $('#endTime')[0].value = (d.getFullYear().toString()+'-' + (d.getMonth()+1).toString() + '-' + d.getDate().toString());
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

function getSessionStorage(key){
    if (window.sessionStorage){
        return window.sessionStorage.getItem(key);
    } else{
        return null;
    }
}

function queryData(){
    $.ajax({type: "POST",
        dataType: "JSON",
        url: '/api?m=getQuestionStat',
        data: {
            userID: getSessionStorage('userID'),
            authSign: getSessionStorage('authSign')
        },
        success: function (resp) {
            if (resp.statusCode == 900) {
                //成功
                vm.total(resp.stats.total || '');
                vm.timeout(resp.stats.timeout || '');
                vm.canceled(resp.stats.canceled || '');
                vm.finished(resp.stats.finished || '');
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
        }
    })
}

function queryTeacherStatDetail(u_id){
    //
    var postObj = {
        userID: util.getSessionStorage('userID'),
        authSign: util.getSessionStorage('authSign'),
        u_id: u_id
    };
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

    util.callServerFunction('teacherStatDetail', postObj, function(data){
        if(data.statusCode == 900){
            vm.total_num(data.total.total);
            var gsList = [];
            for(var item in data.total.data){
                var gsItem = {gsItem: item + ': '};
                for(var item2 in data.total.data[item]){
                    //
                    gsItem.gsItem += (item2 + ': ' + data.total.data[item][item2] + '     ');
                }
                gsList.push(gsItem);
            }
            vm.gsList(gsList);
            var dailyList = [];
            for(var i=0; i<data.daily.length; i++){
                dailyList.push({fullDate: data.daily[i].fullDate, count: data.daily[i].count, s_count: data.daily[i].stu.length});
            }
            vm.dailyList(dailyList);
            var stuList = [];
            for(var j=0; j<data.stu.length; j++){
                stuList.push({s_name: data.stu[j].s_name, s_phone: data.stu[j].s_phone, s_count: data.stu[j].s_count, s_id: data.stu[j].s_id});
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