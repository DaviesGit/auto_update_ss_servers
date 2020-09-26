const { log } = require('log.js');
const { auto_update_ss_servers } = require('auto_update_ss_servers.js');
log('service started!');

auto_update_ss_servers(1000, function (msg) {
    log(msg);
})

