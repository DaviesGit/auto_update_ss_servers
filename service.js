const { log } = require('log.js');
const { Service } = require('node-windows.js');
var service = new Service({
    name: 'shadowsocks servers auto update',
    description: 'automatic update shadowsocks servers in background, using node.js',
    script: 'auto_run.js'
})
service.on('install', function () {
    log('shadowsocks servers auto update service installed!');
    service.start();
});
service.on('start', function () {
    log('shadowsocks servers auto update service started!');
});
service.install();

