(function (global) {
    const privoxy_config_dir = 'privoxy_config';
    const { exec, execFile } = require('child_process');
    const fs = require('fs');
    const { log } = require('log.js');
    class Proxy {
        start(callback_once, callback) {
            var is_called = false;
            var last_output;
            function _callback(data) {
                log(data);
                last_output = data;
                if (callback) {
                    callback(data);
                }
                if (!is_called && -1 !== data.search('listening at')) {
                    setTimeout(function () {
                        if (-1 === last_output.search('ERROR:')) {
                            is_called = true;
                            callback_once(true);
                        } else {
                            is_called = true;
                            callback_once(false);
                        }
                    }, 500);
                }
            }
            this.shadowsocks = execFile('ss-local.exe'
                , [
                    '-s', this.server_host,
                    '-p', this.server_port,
                    '-l', this.local_prot,
                    '-k', this.password,
                    '-m', this.encrypt_mothod,
                    '-v'
                ]
                , {
                    datached: true,
                    stdio: ['ignore', 1, 2],
                    windowsHide: true
                });
            this.shadowsocks.unref();
            this.shadowsocks.stdout.on('data', function (data) {
                _callback(data);
            });
        }
        start_http_proxy(port, callback) {
            var proxy = this;
            this.http_proxy_port = port;
            var configuration =
                'listen-address 127.0.0.1:' + port + '\r\n' +
                'toggle 0\r\n' +
                'logfile ss_privoxy.log\r\n' +
                'show-on-task-bar 0\r\n' +
                'activity-animation 0\r\n' +
                'forward-socks5 / 127.0.0.1:' + this.local_prot + ' .\r\n' +
                'hide-console\r\n';
            var config_file_name = privoxy_config_dir + '/privoxy_config_port_' + port + '.ini';
            var is_called = false;
            function _callback(param) {
                if (!is_called) {
                    is_called = true;
                    callback(param)
                }
            }
            fs.writeFile(config_file_name, configuration, function (error) {
                if (error) {
                    if (callback)
                        callback('write privoxy_config file error, error is: ' + error);
                } else {
                    // if (callback)
                    //     callback('write servers file success!');
                    proxy.privoxy = execFile('privoxy.exe',
                        [config_file_name],
                        {
                            datached: true,
                            stdio: ['ignore', 1, 2],
                            windowsHide: true
                        },
                        function (error, stdout, stderr) {
                            if (error) {
                                if (callback) {
                                    _callback('start error privoxy.exe, error is: ' + error);
                                    return;
                                }
                            } else {
                                if (callback) {
                                    _callback();
                                }
                            }
                        });
                    setTimeout(function () {
                        _callback();
                    }, 1000);
                }
            });
        }
        stop(callback) {
            var callback_time = 1;
            var callback_once_time = 0;
            var is_called = false;
            function callback_once(param) {
                if (!is_called) {
                    ++callback_once_time;
                    if (callback_once_time >= callback_time) {
                        is_called = true;
                        if (callback) {
                            callback(param);
                        }
                    }
                }
            }
            if (!this.shadowsocks) {
                callback('Proxy.stop() method error! shadowsocks is not running.');
                return;
            }
            this.shadowsocks.on('close', function (code, signal) {
                callback_once('shadowsocks terminated due to receipt of signal' + signal);
            });
            this.shadowsocks.kill();
            if (!this.privoxy) {
                return;
            }
            ++callback_time;
            this.privoxy.on('close', function (code, signal) {
                callback_once('privoxy terminated due to receipt of signal' + signal);
            });
            this.privoxy.kill();
        }
        constructor(server_host, server_port, local_prot, password, encrypt_mothod) {
            this.server_host = server_host;
            this.server_port = server_port;
            this.local_prot = local_prot;
            this.password = password;
            this.encrypt_mothod = encrypt_mothod;
        }
    }
    module.exports = {
        Proxy: Proxy
    }
})(this);