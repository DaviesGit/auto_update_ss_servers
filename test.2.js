const test_ss_proxy = require('test_ss_proxy.js');
test_ss_proxy('127.0.0.1', 1082, function (status) {
    console.log(status);
})

// const { get_servers } = require('get-ss-proxy-server.js');

// get_servers(function (servers) {
//     log(servers);
// });