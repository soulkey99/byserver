/**
 * Created by MengLei on 2016/3/1.
 */
"use strict";
const EventEmitter = require('events');
const log = require('../../../utils/log').game;

class MonitorEmitter extends EventEmitter {}

const monitor = new MonitorEmitter();

monitor.on('error', function() {
    log.error('an error was emitted to monitor, ' + err.message);
});

module.exports = monitor;
