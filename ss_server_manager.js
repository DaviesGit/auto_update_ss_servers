(function (global) {
    const test_ss_proxy = require('./test_ss_proxy.js');
    const { Proxy } = require('./proxy.js');
    class Manager {
        constructor(interval = 5000, max_running_proxy = 2) {
            this.interval = interval;
            this.max_running_proxy = max_running_proxy;

            this.is_engine_started = false;
            this.servers = [];
            this.running_proxy = [];
        }
        add_servers(servers) {
            var manager = this
            servers.forEach(function (server1) {
                manager.servers.forEach(function (server2, index) {
                    if (server1.server === server2.server && server1.server_port === server2.server_port) {
                        manager.servers.splice(index, 1);
                    }
                });
                manager.servers.push(server1);
            });
        }
        start_manage_engine(callback) {
            var manager = this;
            if (this.is_engine_started) {
                callback('manage engine already been started!')
                return false;
            }
            // var is_loop = true;
            function loop() {
                // if (is_loop) {
                setTimeout(manage_loop, manager.interval);
                // is_loop = false;
                // }
            }
            function check_proxy(proxy, callback) {
                test_ss_proxy('127.0.0.1', proxy.local_prot, callback);
            }
            function start_new_proxy(port) {
                if (!manager.servers.length) {
                    return false;
                }
                var server = manager.servers.pop();
                var proxy = new Proxy(server.server, server.server_port, port, server.password, server.method);
                proxy.start(function (status) {
                    if (!status) {
                        if (callback) {
                            callback('proxy.start error!');
                        }
                    } else {
                        check_proxy(proxy, function (status) {
                            if (!status) {
                                proxy.stop(function (error) {
                                    start_new_proxy(port);
                                });
                            } else {
                                let port = get_available_port(1081, 1090);
                                if (!port) {
                                    if (callback) {
                                        callback('No tcp port available for using!');
                                    }
                                } else {
                                    proxy.start_http_proxy(port, function (error) {
                                        if (error) {
                                            if (callback) {
                                                callback(error);
                                            }
                                        } else {
                                            manager.running_proxy.push(proxy);
                                            if (callback) {
                                                callback('new proxy started! ' + 'port: ' + proxy.http_proxy_port);
                                            }
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
                return true;
            }
            function get_available_port(start = 1081, end = 1090) {
                while (start < end + 1) {
                    var is_available = true;
                    manager.running_proxy.forEach(function (proxy) {
                        if (start === proxy.local_prot
                            || (proxy.http_proxy_port && start === proxy.http_proxy_port)) {
                            is_available = false;
                        }
                    });
                    if (is_available) {
                        return start;
                    }
                    ++start;
                }
                return false;
            }
            function manage_loop() {
                if (manager.running_proxy.length < manager.max_running_proxy) {
                    var port = get_available_port(1091, 1100);
                    if (!port) {
                        if (callback) {
                            callback('No tcp port available for using!');
                        }
                    } else {
                        start_new_proxy(port);
                    }
                }
                manager.running_proxy.forEach(function (proxy, index) {
                    check_proxy(proxy, function (status) {
                        if (!status) {
                            proxy.stop();
                            manager.running_proxy.splice(index, 1);
                        }
                    });
                });
                loop();
            }
            manage_loop();
            return true;
        }
    }
    module.exports = new Manager(10000);
})(this);



