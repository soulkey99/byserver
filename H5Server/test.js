/**
 * Created by MengLei on 2015/7/22.
 */


var db = require('../config').db;
var objectId = require('mongojs').ObjectId;
var config = require('../config');
var eventproxy = require('eventproxy');
var ep = new eventproxy();

db.admins.find({_id: {$in: [new objectId('56d1c64faa2d05c34fca07d0')]}}, (err, doc)=> {
    if (err) {
        return console.log('getQuestionList, db admin find error: ' + err);
    }
    console.log(doc);
});
