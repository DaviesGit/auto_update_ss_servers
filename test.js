const { auto_update_ss_servers } = require('auto_update_ss_servers.js');
auto_update_ss_servers(100, function (msg) {
    console.log(msg);
})

const { exec, execFile } = require('child_process');

var child = execFile('ss-local.exe'
    , [
        '-s', '192.241.192.153',
        '-p', '19816',
        '-l', '1081',
        '-k', 'ssx.re-25076833',
        '-m', 'aes-256-cfb',
        '-v'
    ]
    , {
        datached: true,
        stdio: ['ignore', 1, 2]
    });
child.unref();
child.stdout.on('data', function (data) {
    console.log(data);
});


    const { exec, execFile } = require('child_process');
execFile('privoxy.exe',
    ['privoxy_config_port_1091.ini'],
    {
        datached: true,
        stdio: ['ignore', 1, 2],
        windowsHide: true
    },
    function (error, stdout, stderr) {
        debugger;
        if (error) {
            if (callback) {
                callback('start error privoxy.exe, error is: ' + error);
                return;
            }
        } else {
            if (callback) {
                callback();
            }
        }
    });

// const { get_servers } = require('get-ss-proxy-server.js');

// get_servers(function (servers) {
//     log(servers);
// });