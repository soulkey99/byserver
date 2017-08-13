/**
 * Created by MengLei on 2016/1/8.
 */

//var redis = require('./utils/redis');
var objectId = require('mongojs').ObjectId;
var BagPipe = require('bagpipe');
var bagPipe = new BagPipe(10);
var http = require('./route/http');
var mqtt = require('./route/mqtt');
var notify = require('./utils/notify');
var AI = require('./model/ai');
var cronJob = require('cron').CronJob;
var server = {route: require('./route/mqtt'), httpRoute: require('./route/http')};
var Battle = require('./model/battle');
var battlePool = require('./model/battlePool');
var getRank = require('./api/getRank');
var monitor = require('./api/achievement/monitor');

//require('./api/achievement/getMissionAward')({userID: '556a75d408eacc300cb55c72', identifier: '56d7ddcd6e5c4a201f61dd52'}, function(err, doc){
//    console.log(err);
//    console.log(JSON.stringify(doc));
//});13759435101

require('./api/getRank')({userID: '556a75d408eacc300cb55c72', type: 'friend'}, (err, doc)=>{
    console.log(err);
    console.log(doc);
});
return;


require('./dnodeServer');

mqtt({route: 'online', userID: '55c02d12079249975c6a4c88', body: {}});
//mqtt({route: 'online', userID: '54f3b5fec08b6f54100c1cbe', body: {}});

setTimeout(function(){
    mqtt({route: 'pair', userID: '55c02d12079249975c6a4c88', body: {}});
    //mqtt({route: 'pair', userID: '54f3b5fec08b6f54100c1cbe', body: {}});
}, 1000);

return;
battlePool.create('569deee3eb4453a62265a4a5');
var b = battlePool.getBattle('569deee3eb4453a62265a4a5');

setTimeout(function(){
    b.join('55c02d12079249975c6a4c88');

}, 1000);
setTimeout(function() {
    //b.join('54f3b5fec08b6f54100c1cbe');
}, 2000);


setTimeout(function(){
    http({m: 'check', body: {userID: '55c02d12079249975c6a4c88', battle_id: '569deee3eb4453a62265a4a5', question_id: '568f41d44ee6edda25359231', choice: 'B', time: '1234'}}, function(err, doc){
        console.log(err);
        console.log(JSON.stringify(doc));
    });
}, 3000);

setTimeout(function(){
    //http({m: 'check', body: {userID: '54f3b5fec08b6f54100c1cbe', battle_id: '569deee3eb4453a62265a4a5', question_id: '568f41d44ee6edda25359231', choice: 'B', time: '1234'}}, function(err, doc){
    //    console.log(err);
    //    console.log(JSON.stringify(doc));
    //});
}, 4000);

setTimeout(function(){
    http({m: 'check', body: {userID: '55c02d12079249975c6a4c88', battle_id: '569deee3eb4453a62265a4a5', question_id: '568cbf588be0a61b0e18f560', choice: 'B', time: '1234'}}, function(err, doc){
        console.log(err);
        console.log(JSON.stringify(doc));
    });
}, 16000);

setTimeout(function(){
    http({m: 'check', body: {userID: '55c02d12079249975c6a4c88', battle_id: '569deee3eb4453a62265a4a5', question_id: '568f7a1331a38b9401d62c19', choice: 'B', time: '1234'}}, function(err, doc){
        console.log(err);
        console.log(JSON.stringify(doc));
    });
}, 28000);




//notify('55c02d12079249975c6a4c88', 'pair', {status: 'noresponse'});

//55c02d12079249975c6a4c88->002,  54f3b5fec08b6f54100c1cbe->001

//setTimeout(function(){
//    var userID = '54f3b5fec08b6f54100c1cbe';
//    var route = 'online';
//    console.log('userID=' + userID + ', route=' + route);
//    server.route({route: route, userID: userID});
//}, 1000);
//return;
//setTimeout(function(){
//    var userID = '55c02d12079249975c6a4c88';
//    var route = 'online';
//    console.log('userID=' + userID + ', route=' + route);
//    server.route({route: route, userID: userID});
//}, 1000);
//setTimeout(function(){
//    var userID = '54f3b5fec08b6f54100c1cbe';
//    var route = 'pair';
//    console.log('userID=' + userID + ', route=' + route);
//    server.route({route: route, userID: userID});
//}, 4000);
//setTimeout(function(){
//    var userID = '55c02d12079249975c6a4c88';
//    var route = 'pair';
//    console.log('userID=' + userID + ', route=' + route);
//    server.route({route: route, userID: userID});
//}, 4000);

//setTimeout(function(){
//    var userID = '54f3b5fec08b6f54100c1cbe';
//    var route = 'pair';
//    console.log('userID=' + userID + ', route=' + route);
//    server.route({route: route, userID: userID});
//}, 1000);
//setTimeout(function(){
//    var userID = '55c02d12079249975c6a4c88';
//    var route = 'pair';
//    console.log('userID=' + userID + ', route=' + route);
//    server.route({route: route, userID: userID});
//}, 1000);
//setTimeout(function(){
//    var userID = '54f3b5fec08b6f54100c1cbe';
//    var route = 'pair';
//    console.log('userID=' + userID + ', route=' + route);
//    server.route({route: route, userID: userID});
//}, 1000);
//setTimeout(function(){
//    var userID = '55c02d12079249975c6a4c88';
//    var route = 'pair';
//    console.log('userID=' + userID + ', route=' + route);
//    server.route({route: route, userID: userID});
//}, 1000);



