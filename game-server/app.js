/**
 * Created by MengLei on 2015/12/24.
 */
var pomelo = require('pomelo');
var dispatcher = require('./app/util/dispatcher');

var app = pomelo.createApp();
app.set('name', 'callcall-battle-game-server');
//app.set('env', 'test');

app.configure('production|test|development', 'master', function() {
    app.enable('systemMonitor');
});

// route definition for chat server
var chatRoute = function(session, msg, app, cb) {
    var chatServers = app.getServersByType('chat');

    if(!chatServers || chatServers.length === 0) {
        cb(new Error('can not find chat servers.'));
        return;
    }

    var res = dispatcher.dispatch(session.get('rid'), chatServers);

    cb(null, res.id);
};

// route definition for game server
var gameRoute = function(session, msg, app, cb) {
    var gameServers = app.getServersByType('game');

    if(!gameServers || gameServers.length === 0) {
        cb(new Error('can not find game servers.'));
        return;
    }

    var res = dispatcher.dispatch(session.get('rid'), gameServers);

    cb(null, res.id);
};

// app configuration
//connector
app.configure('production|test|development', 'connector', function(){
    app.set('connectorConfig',
        {
            connector : pomelo.connectors.hybridconnector,
            heartbeat : 3
        });
});

//gate server
app.configure('production|test|development', 'gate', function(){
    app.set('connectorConfig',
        {
            connector : pomelo.connectors.hybridconnector
        });
});

//app route
app.configure('production|test|development', function() {
    // route configures
    app.route('chat', chatRoute);
    //app.route('game', gameRoute);

    // filter configures
    //app.filter(pomelo.timeout());
});

// start app
app.start();

process.on('uncaughtException', function(err) {
    console.error(' Caught exception: ' + err.stack);
});

