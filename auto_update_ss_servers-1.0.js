(function (global) {
    const servers_temp_dir = 'servers';
    const gui_config_file_name = 'gui-config.json';
    const shadowsocks_start_wait = 1000;
    const { get_servers } = require('get-ss-proxy-server.js');
    const fs = require('fs');
    const { exec } = require('child_process');
    var gui_config = {
        "configs": [/* {
           "server": "172.104.96.59",
           "server_port": 1086,
           "password": "ad5095df",
           "method": "aes-256-cfb",
           "remarks": "",
           "auth": false,
           "timeout": 5
         } */],
        "strategy": null,
        "index": 0,
        "global": false,
        "enabled": false,
        "shareOverLan": false,
        "isDefault": false,
        "localPort": 1080,
        "pacUrl": null,
        "useOnlinePac": false,
        "availabilityStatistics": false,
        "autoCheckUpdate": false,
        "isVerboseLogging": false,
        "logViewer": {
            "fontName": "Consolas",
            "fontSize": 8.0,
            "bgColor": "black",
            "textColor": "white",
            "topMost": false,
            "wrapText": false,
            "toolbarShown": false,
            "width": 600,
            "height": 400,
            "top": 680,
            "left": 1320,
            "maximized": true
        },
        "proxy": {
            "useProxy": false,
            "proxyType": 0,
            "proxyServer": "",
            "proxyPort": 0,
            "proxyTimeout": 3
        },
        "hotkey": {
            "SwitchSystemProxy": "",
            "ChangeToPac": "",
            "ChangeToGlobal": "",
            "SwitchAllowLan": "",
            "ShowLogs": "",
            "ServerMoveUp": "",
            "ServerMoveDown": "Ctrl+Shift+N"
        }
    };


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
        for (let i = 0; i < servers.data.length; ++i) {
            servers_formated.push({
                "server": servers.data[i][1],
                "server_port": servers.data[i][2],
                "password": servers.data[i][3],
                "method": servers.data[i][4],
                "remarks": servers.data[i][6],
                "auth": false,
                "timeout": 5
            });
        }
        while (servers_formated.length) {
            var ele = servers_formated.splice(0, 1)[0];
            servers_sorted.push(ele);
            for (let i = 0; i < servers_formated.length; ++i) {
                if (servers_formated[i].remarks === ele.remarks) {
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
         setInterval (function () {
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
                gui_config.configs = servers;
                fs.writeFile(gui_config_file_name, JSON.stringify(gui_config), function (error) {
                    if (error) {
                        if (callback)
                            callback('write gui-config.json file error, error is: ' + status);
                    } else {
                        if (callback)
                            callback('write gui-config.json file success!');
                        exec('cmd /K call "Shadowsocks_restart.bat"', function (error, stdout, stderr) {
                            if (error) {
                                if (callback) {
                                    callback('exec call "Shadowsocks_restart.bat" error, error is: ' + error);
                                    return;
                                }
                            }
                        });
                    }
                });
            });
        }, interval);
    }
    module.exports.auto_update_ss_servers = auto_update_ss_servers;
})(this);