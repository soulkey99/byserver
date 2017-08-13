/**
 * Created by MengLei on 2015/4/10.
 */


var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var app = express();

var port = 80;

//app.use(app.router);
//app.use(function(req, res, next){
//    if(req.method == 'POST'){
//        console.log(req);
//        fs.readFile( path.join(__dirname, 'public',req.originalUrl), 'utf-8', function(err, str){
//            if(err){
//                console.log(err);
//                res.send(404);
//            }else{
//                res.end(str);
//            }
//        });
//    }else{
//        next();
//    }
//});

app.use(express.static(path.join(__dirname, 'views')));

app.listen(port);