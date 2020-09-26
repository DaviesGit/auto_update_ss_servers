(function (global) {
    const net = require('net');
    const { SocksClient } = require('socks-2.2.1')
    function test_ss_proxy(host, port, callback) {
        var is_called = false;
        function callback_once(param) {
            if (!is_called) {
                is_called = true;
                callback(param);
            }
        }
        const options = {
            proxy: {
                ipaddress: host,
                port: port,
                type: 5 // Proxy version (4 or 5)
            },

            command: 'connect', // SOCKS command (createConnection factory function only supports the connect command)

            destination: {
                host: 'google.com',
                port: 80
            }
        };
        SocksClient.createConnection(options, function (err, info) {
            if (err) {
                callback_once(false);
                if (info && info.socket) {
                    info.socket.destroy();
                }
            }
            else {
                socket = info.socket;
                // Connection has been established, we can start sending data now: 
                socket.on('data', function (data) {
                    if (data.length) {
                        callback_once(true);
                        socket.destroy();
                    } else {
                        callback_once(false);
                        socket.destroy();
                    }
                });
                socket.on('error', function (error) {
                    callback_once(false);
                    socket.destroy();
                });
                socket.on('timeout', function () {
                    callback_once(false);
                    socket.destroy();
                });
                socket.on('close', function () {
                    callback_once(false);
                    socket.destroy();
                });
                socket.on('connect', function () {
                });
                socket.on('end', function () {
                    callback_once(false);
                    socket.destroy();
                });
                socket.write(
                    'GET http://google.com/ HTTP/1.1\r\n' +
                    'Host: google.com\r\nConnection: keep-alive\r\nUpgrade-Insecure-Requests: 1\r\n' +
                    'User-Agent: Mozilla/5.0 (Windows NT 6.3; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.87 Safari/537.36\r\n' +
                    'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8\r\n' +
                    'Accept-Encoding: gzip, deflate\r\n' +
                    'Accept-Language: en,en-US;q=0.9,zh-CN;q=0.8,zh;q=0.7' +
                    '\r\n\r\n'
                );
            }
        });
    };
    module.exports = test_ss_proxy;
})(this);