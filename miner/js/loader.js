/**
 * This Object desides when
 * the Extension has to
 * change the PageAction state
 */

miner.loader = {
    init: function(){
        this.bindEvents();
        miner.task_manager.init();
    },

    bindEvents: function(){
        //chrome.tabs.onSelectionChanged.addListener(this.onSelectionChanged);
        //chrome.tabs.onUpdated.addListener(this.onUpdated);
        chrome.webRequest.onSendHeaders.addListener(this.onSendHeaders, 
            {urls:["<all_urls>"], types:["main_frame", "sub_frame", "stylesheet", "script", "object", "xmlhttprequest", "other"]},
            ["requestHeaders"]
        );
        
        /*
        chrome.webRequest.onResponseStarted.addListener(this.onResponseStarted, 
            {urls:["<all_urls>"], types:["main_frame", "sub_frame", "stylesheet", "script", "object", "xmlhttprequest", "other"]},
            ["responseHeaders"]
        );
        */
        /*
        alert(chrome.webRequest.onHeadersReceived.hasListener(this.onHeadersReceived));
        chrome.webRequest.onHeadersReceived.removeListener(this.onHeadersReceived);
        alert(chrome.webRequest.onHeadersReceived.hasListener(this.onHeadersReceived));
        */
    },

    unbindEvents: function(){
        //chrome.tabs.onSelectionChanged.addListener(this.onSelectionChanged);
        //chrome.tabs.onUpdated.addListener(this.onUpdated);
        chrome.webRequest.onSendHeaders.removeListener(this.onSendHeaders);
        //chrome.webRequest.onResponseStarted.removeListener(this.onResponseStarted);
    },
    
    onUpdated: function(tabId, changeInfo, tab){
        if(changeInfo.status !== "loading")
            return;
        miner.loader.request(tab.url, "GET", null);
    },

    onSelectionChanged: function(tabId){
        chrome.tabs.query(
            {currentWindow:true, active:true}, 
            function(tabs){
                miner.loader.request(tabs[0].url, "GET", null);
            }
        );
    },
    onSendHeaders: function(details){
        //don't use this.request() here!! don't use this in callback!!
        if(window.miner.global_data.captureTraffic == 'on'){
            miner.loader.request(details.url, details.method, details);
        }
    },
    onResponseStarted: function(details){

        var urlMode = miner.url_filter.getUrlMode(details.url);
        var urlModeInfo = window.localStorage['urlMode:'+urlMode];
        if( !miner.utils.empty(urlModeInfo) ){
            urlModeInfo = JSON.parse(urlModeInfo);
            urlModeInfo['fromCache'] = details.fromCache;
            urlModeInfo['statusCode'] = details.statusCode;
            window.localStorage['urlMode:'+urlMode] = JSON.stringify(urlModeInfo);
        }
    },
    request: function(url, method, details){
        
        var includeList = window.localStorage['global_setting.include_list'];
        var excludeList = window.localStorage['global_setting.exclude_list'];
        var includeArray = null;
        var excludeArray = null;        
        
        if(includeList){
            includeArray = miner.utils.trim( includeList ).split(',');
        }

        if(excludeList){
            excludeArray = miner.utils.trim( excludeList ).split(',');
        }

        //匹配用户设置的exclude列表
        if( !miner.utils.empty(excludeArray) ){
            for(i=0; i<excludeArray.length; i++){
                    reg = new RegExp(excludeArray[i], 'i');
                    if( reg.test(url) ){
                        delete reg;
                        return;
                    }
                    delete reg;
            }
        }
        
        //匹配用户设置的include列表
        var isInclude = false;
        if( !miner.utils.empty(includeArray) ){
            for(i=0; i<includeArray.length; i++){
                    reg = new RegExp(includeArray[i], 'i');
                    if( reg.test(url) ){
                        delete reg;
                        isInclude = true;
                        break;
                    }
            }
            
            if( !isInclude ){
                return;
            }
        }


        
        //
        if( /^https?:\/\/((\/\/\d{1,3}[.]){3}\/\/\d{1,3}|([0-9a-zA-Z_!~*'()-]+[.])*(baidu.com))(:[0-9]{1,4})?(\/.*)*$/i.test(url) ||
            /^https?:\/\/((\/\/\d{1,3}[.]){3}\/\/\d{1,3}|([0-9a-zA-Z_!~*'()-]+[.])*(hao123.com))(:[0-9]{1,4})?(\/.*)*$/i.test(url) ||
            /^https?:\/\/((\/\/\d{1,3}[.]){3}\/\/\d{1,3}|([0-9a-zA-Z_!~*'()-]+[.])*(baifubao.com))(:[0-9]{1,4})?(\/.*)*$/i.test(url) ||
            /^https?:\/\/((\/\/\d{1,3}[.]){3}\/\/\d{1,3}|([0-9a-zA-Z_!~*'()-]+[.])*(shifen.com))(:[0-9]{1,4})?(\/.*)*$/i.test(url) ||
            /^https?:\/\/((\/\/\d{1,3}[.]){3}\/\/\d{1,3}|([0-9a-zA-Z_!~*'()-]+[.])*(skycn.com))(:[0-9]{1,4})?(\/.*)*$/i.test(url) ||
            /^https?:\/\/((10\.\d+|(172\.(1[6-9]|2[0-9]|3[01])))\.\d+\.\d+)(:[0-9]{1,4})?(\/.*)*$/i.test(url) ){
            
            if( !/^https?:\/\/.*scan\.baidu\.com/i.test(url) &&
                !/^https?:\/\/.*icafe\.baidu\.com/i.test(url) &&
                !/^https?:\/\/.*security\.baidu\.com/i.test(url) &&
                !/^https?:\/\/.*winrelay\.baidu\.com/i.test(url) &&
                !/^https?:\/\/.*erp\.baidu\.com/i.test(url) &&
                !/^https?:\/\/.*fusion\.baidu\.com/i.test(url) &&
                !/^https?:\/\/.*hm\.baidu\.com/i.test(url) && 
                !/^https?:\/\/.*rms\.baidu\.com/i.test(url) && 
                !/^https?:\/\/.*family\.baidu\.com/i.test(url) &&
                !/^https?:\/\/.*noah\.baidu\.com/i.test(url) &&
                !/^https?:\/\/.*babel\.baidu\.com/i.test(url) &&
                !/^http:\/\/.*cq01-testing-ssl142\.vm\.baidu\.com/i.test(url) &&
                !/^http:\/\/.*tc-scanner01\.tc\.baidu\.com/i.test(url) ){
                
                var now = new Date();
                if( parseInt(window.localStorage['taskTotal']) >= parseInt(window.localStorage['global_setting.max_url_count_global']) ){

                    if( window.localStorage['global_setting.auto_clear'] != 'on' ){
                        
                        var minutes = now.getMinutes();
                        
                        miner.task_manager.notice('任务数量达到上限，扫描任务停止。',
                                                '当前正在运行的任务数量为' + window.localStorage['taskTotal'] + '个，已达到最大任务数量上限，请及时清除已完成的任务。',
                                                '../img/exclamation-circle-yellow.png',
                                                [
                                                    {title: '清除已完成的任务（保留结果为危险的任务）', icon: '../img/information_16.png', target: { action: 'clearSafeResult'} },
                                                    {title: '清除全部任务', icon: '../img/info_red_16.png', target: { action: 'clearAll'} }
                                                ],
                                                'clear:'+minutes
                                            );
                    }else{
                        miner.task_manager.clearPartResult();
                    }
                    
                    return;
                }

                /*
                //按url 模式去重
                var urlMode = miner.url_filter.getUrlMode(url);
                var urlModeInfo = window.localStorage['urlMode:'+urlMode];
                if( !miner.utils.empty(urlModeInfo) ){
                    //该url 模式已经存在，则去重掉
                    urlModeInfo = JSON.parse(urlModeInfo);
                    urlModeInfo['type'] = details.type;
                    window.localStorage['urlMode:'+urlMode] = JSON.stringify(urlModeInfo);
                    return;
                }else{
                    urlModeInfo = {};
                    urlModeInfo['type'] = details.type;
                    window.localStorage['urlMode:'+urlMode] = JSON.stringify(urlModeInfo);
                }
                */
                
                //更新hostInfo,更新地址栏最新时间，消除自动化请求的干扰。
                var host = miner.url_filter.getHostName(url);
                var hostInfo = window.localStorage['host:'+host];
                
                if( !miner.utils.empty(hostInfo) ){
                    hostInfo = JSON.parse(hostInfo);
                }else{
                    hostInfo = {};
                }

                if( details.type == 'main_frame' ){
                    hostInfo['lastMainFrameTime'] = now.getTime();
                    window.localStorage['host:'+host] = JSON.stringify(hostInfo);
                    window.localStorage['lastMainFrameTime'] = hostInfo['lastMainFrameTime'];
                }else if( details.type == 'xmlhttprequest' ){ 
                    //过滤自动化Ajax请求
                    if(hostInfo['lastMainFrameTime']){
                        if( now.getTime() - hostInfo['lastMainFrameTime'] > 5*1000 ){
                            //如果本次Ajax距离同Host的地址栏url最后一次变化时间超过5秒，则认为是自动化Ajax，并且滤掉。
                            return;
                        }
                    }else{
                        //如果连地址栏url最后一次变化时间信息都没有，则认为是自动化Ajax，并且滤掉。
                        return;
                    }
                }else{// if( details.type == 'sub_frame' || details.type == 'script' ){
                    //由于其他自动化请求如jsonp、websocket、iframe可以跨域，因此不能按域名来判断Host地址栏url变化时间
                    if(window.localStorage['lastMainFrameTime']){
                        if( now.getTime() - window.localStorage['lastMainFrameTime'] > 5*1000 ){
                            return;
                        }
                    }else{
                        return;
                    }
                }

                /*
                else{
                    window.localStorage['filter'] = 'off';
                    chrome.tabs.get(details.tabId, function(tab){
                        var tabHost = miner.url_filter.getHostName(tab.url);
                        var tabHostInfo = window.localStorage['host:'+tabHost];
                        if( !miner.utils.empty(tabHostInfo) ){
                            tabHostInfo = JSON.parse(tabHostInfo);
                            if( now.getTime() - tabHostInfo['lastMainFrameTime'] > 5*1000 ){
                                window.localStorage['filter'] = 'on';
                                return;
                            }
                        }else{
                            window.localStorage['filter'] = 'on';
                            return;
                        }
                    });

                    if(window.localStorage['filter'] == 'on'){
                        return;
                    }
                }
                */

                //如果url是内网ip，则过滤
                if( miner.url_filter.isPrivate(url) ){
                    return;
                }

                if( method != 'POST' ){
                    //如果url是纯路径，则过滤
                    if( miner.url_filter.isPath(url) ){
                        return;
                    }

                    //如果无参数，且页面后缀无效，则过滤
                    if( miner.url_filter.isInvalidSuffix(url) ){
                        return;
                    }
                }

                //
                if( window.localStorage['global_setting.task_mode'] == 'realtime' ){
                    miner.task_manager.create(url, method, details);
                }else if( window.localStorage['global_setting.task_mode'] == 'record' ){
                    if( window.localStorage['global_data.play'] != 'on' ){
                        miner.task_manager.record(url, method, details);
                    }
                }
            }
        }

    }
};

miner.loader.init();