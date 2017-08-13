/**
 * Created by MengLei on 2015/8/10.
 */


module.exports = function(t) {
    //unix时间戳转字符串
    var ts = new Date(t);
    var year = ts.getFullYear().toString();
    var month = (ts.getMonth() + 1).toString();
    month = month.length < 2 ? '0' + month : month;
    var date = ts.getDate().toString();
    date = date.length < 2 ? '0' + date : date;
    var dateStr = year + '-' + month + '-' + date;
    var hour = ts.getHours().toString();
    hour = hour.length < 2 ? '0' + hour : hour;
    var min = ts.getMinutes().toString();
    min = min.length < 2 ? '0' + min : min;
    var sec = ts.getSeconds().toString();
    sec = sec.length < 2 ? '0' + sec : sec;
    var timeStr = hour + ':' + min + ':' + sec;
    return dateStr + ' ' + timeStr;
};
