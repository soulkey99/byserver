/**
 * Created by MengLei on 2015/8/22.
 */

$(document).ready(function(){
    //
    loadPerformance();
});

//获取绩效
function loadPerformance(){
    var postObj = {
        userID: util.querystring('userID')[0],
        authSign: util.querystring('authSign')[0]
    };
    util.callServerFunction('getPerformance', postObj, function(data){
        if(data.statusCode == 900){
            vm.todayTotal(data.todayTotal);
            vm.monthTotal(data.monthTotal);
            vm.workDays(data.workDays);
            vm.standardDays(data.standardDays);
            vm.unStandardDays(data.workDays - data.standardDays);
        }else{
            alert('加载数据失败！');
        }
    });
}

//历史订单
function loadHistory(){
    $("#noFunc").fadeIn("fast");
    setTimeout('$("#noFunc").fadeOut("slow");', 5000);
}
