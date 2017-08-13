/**
 * Created by MengLei on 2016-09-13.
 */
"use strict";
const db = require('./../../../../config').db;
const result = require('./../../../utils/result');

module.exports = function (req, res) {
    db.studyQuestions.distinct('userID', (err, ids)=> {
        if (err) {
            return result(res, {statusCode: 905, message: err.message});
        }
        db.admins.find({_id: {$in: ids}}, (err, doc)=> {
            if (err) {
                return result(res, {statusCode: 905, message: err.message});
            }
            let list = doc.map(item=> {
                return {userID: item._id.toString(), userNick: item.nick}
            });
            return result(res, {statusCode: 900, list});
        });
    });
};
