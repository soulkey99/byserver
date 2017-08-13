/**
 * Created by MengLei on 2015/12/25.
 */
var dispatcher = require('../../../util/dispatcher');

module.exports = function(app) {
    return new Handler(app);
};

var Handler = function(app) {
    this.app = app;
};

var handler = Handler.prototype;

/**
 * Gate handler that dispatch user to connectors.
 *
 * @param {Object} msg message from client
 * @param {Object} session
 * @param {Function} next next step callback
 *
 */
handler.queryEntry = function(msg, session, next) {
    var userID = msg.userID;
    if(!userID) {
        next(null, {
            statusCode: 902,
            message: '未上传userID'
        });
        return;
    }
    // get all connectors
    var connectors = this.app.getServersByType('connector');
    if(!connectors || connectors.length === 0) {
        next(null, {
            statusCode: 905,
            message: 'connector查询错误！'
        });
        return;
    }
    // select connector, because more than one connector existed.
    var res = dispatcher.dispatch(userID, connectors);
    next(null, {
        statusCode: 900,
        host: res.clientHost,
        port: res.clientPort
    });
};
