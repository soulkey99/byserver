/**
 * Created by hjy on 2015/12/8 0008.
 */

function getLocation(){ //successFunc获取定位成功回调函数，errorFunc获取定位失败回调
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
                var lat = position.coords.latitude;
                var lon = position.coords.longitude;
                //var map = new BMap.Map("container");   // 创建Map实例
                var point = new BMap.Point(lon, lat); // 创建点坐标
                var gc = new BMap.Geocoder();
                gc.getLocation(point, function (rs) {
                    var addComp = rs.addressComponents;
                    var curCity = {
                        id: '',
                        name: addComp.province,
                        date: new Date().getDate
                    };
                    alert(addComp.province + addComp.city);
                });
            },
            function (error) {
                switch (error.code) {
                    case 1:
                        alert("位置服务被拒绝。");
                        break;
                    case 2:
                        alert("暂时获取不到位置信息。");
                        break;
                    case 3:
                        alert("获取位置信息超时。");
                        break;
                    default:
                        alert("未知错误。");
                        break;
                }
            }, { timeout: 60000, enableHighAccuracy: false });
    } else {
        alert("你的浏览器不支持获取地理位置信息。");
    }
};
getLocation();