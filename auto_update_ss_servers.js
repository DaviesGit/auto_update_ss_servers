(function (global) {
    const servers_temp_dir = 'servers';
    const shadowsocks_start_wait = 1000;
    const { get_servers } = require('get-ss-proxy-server.js');
    const ss_server_manager = require('./ss_server_manager.js');
    const fs = require('fs');
    const { exec } = require('child_process');


    function get_date_str() {
        function fill_length(str, length) {
            str += '';
            while (str.length < length) {
                str = '0' + str;
            }
            return str;
        }
        date = new Date();
        date_FullYear = fill_length(date.getFullYear(), 4);
        date_Month = fill_length((1 + date.getMonth()), 2);
        date_Date = fill_length(date.getDate(), 2);
        date_Hours = fill_length(date.getHours(), 2);
        date_Minutes = fill_length(date.getMinutes(), 2);
        date_Seconds = fill_length(date.getSeconds(), 2);
        date_Milliseconds = fill_length(date.getMilliseconds(), 3);
        date = date_FullYear + '-' + date_Month + '-' + date_Date + '_' + date_Hours + '-' + date_Minutes + '-' + date_Seconds + '.' + date_Milliseconds;
        return date;
    }
    function format_servers(servers) {
        servers_formated = [];
        servers_sorted = [];
        servers.forEach(function (item) {
            servers_formated.push({
                "server": item.Address,
                "server_port": item.Port,
                "password": item.Password,
                "method": item.Method,
                "country": item.Country
            });
        });
        while (servers_formated.length) {
            var ele = servers_formated.splice(0, 1)[0];
            servers_sorted.push(ele);
            for (let i = 0; i < servers_formated.length; ++i) {
                if (servers_formated[i].country === ele.country) {
                    servers_sorted.push(servers_formated.splice(i, 1)[0]);
                    --i;
                }
            }
        }
        return servers_sorted;
    }

    function auto_update_ss_servers(interval, callback) {
        if (!interval)
            interval = 5 * 60 * 1000;
        /* setInterval */setTimeout(function () {
            get_servers(function (servers) {
                if (!servers) {
                    if (callback)
                        callback('get_servers function error!');
                    return false;
                }
                var date = get_date_str();
                fs.writeFile(servers_temp_dir + '/servers.' + date + '.json', JSON.stringify(servers), function (error) {
                    if (error) {
                        if (callback)
                            callback('write servers file error, error is: ' + error);
                    } else {
                        if (callback)
                            callback('write servers file success!');
                    }
                });
                servers = format_servers(servers);
                if (!ss_server_manager.is_engine_started) {
                    ss_server_manager.start_manage_engine(callback);
                }
                ss_server_manager.add_servers(servers);
            });
        }, interval);
    }
    module.exports.auto_update_ss_servers = auto_update_ss_servers;
})(this);