/**
 * Created by MengLei on 2015/6/12.
 */

//require('./api/orderStatus')(function(err, resp){
//    //console.log(err);
//    console.log(resp);
//});
var num = '18609827172';
var flow = 50;
require('./api/orderFlow')({num: num, flow: flow},function(err, resp){
    //console.log(err);
    console.log('num: ' + num);
    console.log('flow: ' + flow);
    console.log(resp);
});

//1507012208495011

//require('./api/orderStatusApi')(function(err, resp){
//    //console.log(err);
//    console.log(resp);
//});

//require('./api/orderStatus')(function(err, resp){
//    //console.log(err);
//    console.log(resp);
//});

//for(var i=0; i<10000; i++) {
//    //
//    require('./api/statusConfirm')('233122', '13112341234', function (err, resp) {
//        if (err) {
//            console.log(err);
//        } else {
//            console.log(resp);
//        }
//    });
//}

//require('./api/statusConfirm')('1507271405550751', '13840124472', function (err, resp) {
//    if (err) {
//        console.log(err);
//    } else {
//        console.log(resp);
//    }
//});

