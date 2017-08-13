/**
 * Created by MengLei on 2016-04-13.
 */
"use strict";
const db = require('./../../../../config').db;
const log = require('./../../../../utils/log').h5;
const proxy = require('./../../../../common/proxy');
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    let param = {
        startPos: req.body.startPos,
        pageSize: req.body.pageSize,
        type: req.body.type,
        query: req.body.query,
        stage: req.body.stage,
        grade: req.body.grade,
        subject: req.body.subject
    };
    if (req.body.self == 'true') {
        param.userID = req.body.userID;
    } else if (req.body.u_id) {
        param.userID = req.body.u_id;
    }

    if (req.body.status) {
        param.status = req.body.status;
    }
    proxy.StudyQuestion.getList(param, (err, list)=> {
        if (err) {
            log.error('getQuestionList, get list error: ' + err.message);
            return result(res, {statusCode: 905, message: err.message});
        }
        let ids = [];
        list.forEach(item=> {
            if (item.userID) {
                ids.push(item.userID);
            }
        });
        return result(res, {statusCode: 900, list});
        // db.admins.find({_id: ids[0]}, (err, doc)=> {
        //     if (err) {
        //         log.error('getQuestionList, db admin find error: ' + err);
        //         return result(res, {statusCode: 905, message: err.message});
        //     }
        //     for (let i = 0; i < list.length; i++) {
        //         for (let j = 0; j < doc.length; j++) {
        //             if (list[i].userID && list[i].userID.toString() == doc[j]._id.toString()) {
        //                 list[i].userNick = doc[j].nick;
        //             } else {
        //                 list[i].userNick = '';
        //             }
        //         }
        //     }
        //     result(res, {statusCode: 900, list});
        // });
    });
};

function* arrangeList(list) {
    let res = [];
    for(let i=0; i<list.length; i++){
        //
    }
}