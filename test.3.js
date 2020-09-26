const test_ss_proxy = require('test_ss_proxy.js');
test_ss_proxy('127.0.0.1', 1080, function (status) {
    console.log(status);
})

    (function () {
        var port = 100;
        setTimeout(function () {
            if (true) {
                console.log(port);
            } else {

            } var port = 1000;
            console.log(port);
        }, 0);
    })();


// const { get_servers } = require('get-ss-proxy-server.js');

// get_servers(function (servers) {
//     log(servers);
// });