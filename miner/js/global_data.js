miner.global_data = {
    online: 'on',
    api: function() {
        if( this.online == 'on' ){
            return this.apiOnline;
        }else if( this.online == 'off' ){
            return this.apiOffline;
        }
    },
    apiOnline: {
        url: 'http://api.scan.baidu.com',
        ui: 'http://scan.baidu.com',
        messageCenter: 'http://0.evilcapricorn.duapp.com/broadcast.json?r=',
        token: '174365a1c0c96259275924f7734351f5'
    },
    apiOffline: {
        url: 'http://cq01-testing-ssl142.vm.baidu.com',
        ui: 'http://tc-scanner01.tc.baidu.com/',
        messageCenter: 'http://0.evilcapricorn.duapp.com/broadcast.json?r=',
        token: '936dd9fded73e59be3292281b4104bbc'
    },
    schedulerId: 4,
    messageCenterPollCycle: 600,
    queryInterval: 10,
    captureTraffic: 'on',
    networkStatus: 'external-off',//'internal-off'
    urlFreshness: 1800,
    maxTaskTotal: 500,
    taskMode: 'realtime',
    httpMethod: 'all',
    step: {'Spider': false, 'Weakness': false, 'Vulnerability': true, 'LVScanner': true, 'Pocscan': true},
    vulnerabilityPlugins: ['xss', 'flash_xss', 'sql', 'file_include', 'php_cmd', 'struts_cmd', 'intra_proxy', 'url_location', 'http_only', 'fastcgi_parse', 'csrf']
};
