

miner.task_manager = {
    taskQueue: [
        /*{ "tid": 777, "url": "http://www.baidu.com/x?a=1", "method": "GET", "statusLine":null, "header": {"cookie": "", "referer": ""}, "startTime": 0, "endTime": 0, "progress": 0, "result":{} }*/
    ],
    taskIndex: 0,
    taskTotal: 0,
    isOnline: 0,
    notice: function(title, message, icon, buttonList, messageId){
        var buttons = [];
        
        for( var i in buttonList ){
            buttons.push({ title: buttonList[i].title, iconUrl: buttonList[i].icon});
        }
        
        var options = {
            type: "basic",
            title: title,
            priority: 2,
            message: message,
            iconUrl: icon,
            buttons: buttons//[{ title: buttonTitle, iconUrl: '../icon/saolei_logo_48.png'}]
        };
        
        var now = new Date();
        var notificationId = "" + messageId;//"" + now.getTime();
        chrome.notifications.create(notificationId, options, function(notificationId){});
        chrome.notifications.onButtonClicked.addListener(function(_notificationId, buttonIndex){
            if( notificationId == _notificationId ){
                if(buttonList[buttonIndex].target.action == 'update'){
                    chrome.tabs.create({url: buttonList[buttonIndex].target.url});
                    window.localStorage[buttonList[buttonIndex+1].target.k] = buttonList[buttonIndex+1].target.v;
                    //清除所有历史存留的同类消息
                    chrome.notifications.getAll(function(notifications){
                        for(var key in notifications){
                            if( key.indexOf('update') == 0 ){
                                chrome.notifications.clear(key, function(wasCleared){});
                            }
                        }
                    });
                }else if(buttonList[buttonIndex].target.action == 'open'){
                    chrome.tabs.create({url: buttonList[buttonIndex].target.url}, function(tab){
                        //outlook不需要tab，故关之
                        setTimeout(function(){chrome.tabs.remove(tab.id)}, 1*1000);
                    });
                    window.localStorage[buttonList[buttonIndex+1].target.k] = buttonList[buttonIndex+1].target.v;
                    //
                    chrome.notifications.getAll(function(notifications){
                        for(var key in notifications){
                            if( key.indexOf('open') == 0 ){
                                chrome.notifications.clear(key, function(wasCleared){});
                            }
                        }
                    });
                }else if(buttonList[buttonIndex].target.action == 'update-ignore'){
                    window.localStorage[buttonList[buttonIndex].target.k] = buttonList[buttonIndex].target.v;
                    //
                    chrome.notifications.getAll(function(notifications){
                        for(var key in notifications){
                            if( key.indexOf('update') == 0 ){
                                chrome.notifications.clear(key, function(wasCleared){});
                            }
                        }
                    });
                }else if(buttonList[buttonIndex].target.action == 'open-ignore'){
                    window.localStorage[buttonList[buttonIndex].target.k] = buttonList[buttonIndex].target.v;
                    //
                    chrome.notifications.getAll(function(notifications){
                        for(var key in notifications){
                            if( key.indexOf('open') == 0 ){
                                chrome.notifications.clear(key, function(wasCleared){});
                            }
                        }
                    });
                }else if(buttonList[buttonIndex].target.action == 'clearSafeResult'){
                    miner.task_manager.clearSafeResult();
                    chrome.notifications.getAll(function(notifications){
                        for(var key in notifications){
                            if( key.indexOf('clear') == 0 ){
                                chrome.notifications.clear(key, function(wasCleared){});
                            }
                        }
                    });
                }else if(buttonList[buttonIndex].target.action == 'clearAll'){
                    miner.task_manager.clearAll();
                    chrome.notifications.getAll(function(notifications){
                        for(var key in notifications){
                            if( key.indexOf('clear') == 0 ){
                                chrome.notifications.clear(key, function(wasCleared){});
                            }
                        }
                    });
                }
                chrome.notifications.clear(_notificationId, function(wasCleared){});
            }
        });
    },
    pollMessageCenter: function(retryQuota){
        var xmlHttp = new XMLHttpRequest();
        var messageCenter = miner.global_data.api().messageCenter;
        var now = new Date();
        messageCenter += now.getTime();
        
        xmlHttp.open("GET", messageCenter, true);
        xmlHttp.onreadystatechange = function(){
            if (xmlHttp.readyState == 4) {
                switch (xmlHttp.status) {
                    case 200:
                        clearTimeout(xmlHttpTimeout);
                        var notification = JSON.parse(xmlHttp.responseText);

                        if (notification.status == 'ok'){
                            //检测版本更新
                            miner.version_info.lastVersion = notification.version;
                            //window.localStorage['version_info.lastVersion'] = notification.version;
                            
                            if(miner.version_info.lastVersion != miner.version_info.version){
                                var lastVersionArray = notification.version.split('.');
                                var currentVersionArray = miner.version_info.version.split('.');

                                for(var i=0; i<lastVersionArray.length; i++){
                                    if(lastVersionArray[i] > currentVersionArray[i]){
                                        //有新版本需要更新，提示用户。
                                        if( miner.utils.empty(miner.version_info.updater) ){
                                            miner.version_info.updater = notification.updater;
                                        }
                                        window.localStorage['version_info.updater'] = notification.updater;
                                        
                                        if( window.localStorage['global_data.ignore.update'] == notification.version ){
                                            //该版本更新被用户忽略
                                            break;
                                        }
                                        
                                        //如果更新的版本之前通知过
                                        if( window.localStorage['version_info.lastVersion'] == notification.version ){
                                            
                                            if( !miner.utils.empty(localStorage['global_data.ignore.nextTime']) &&
                                            localStorage['global_data.ignore.nextTime'] > now.getTime() ){
                                                //还没有到下一次提醒时间
                                                break;
                                            }
                                        }
                                        
                                        //设定为从现在开始的多少时间后再提示更新
                                        localStorage['global_data.ignore.nextTime'] = now.getTime() + 24*3600*1000;
                                        window.localStorage['version_info.lastVersion'] = notification.version;
                                        
                                        miner.task_manager.notice('版本更新', 
                                            '最新版本' + miner.version_info.lastVersion + '已提供下载，请及时更新。\r\n' + 'what\'s new:\r\n' + notification.whatsNew, 
                                            '../img/exclamation-circle-green.png',
                                            [
                                                {title: '立即更新', icon: '../img/information_16.png', target: { action: 'update', url: miner.version_info.updater} },
                                                {title: '我知道了，稍后再提醒我。', icon: '../img/info_black_16.png', target: { action: 'update-ignore', k: 'global_data.ignore.update', v: notification.version} }
                                                
                                            ],
                                            'update:'+now.getTime()
                                        );
                                        break;
                                    }
                                }
                            }
                            
                            //检查消息通知
                            if(notification.wanted.guid == miner.version_info.guid ||
                            notification.wanted.guid == '19840110-1986-1205-52zc-20110218zc25'){
                                switch (notification.wanted.action)
                                {
                                    case 'notice':
                                        if( window.localStorage['global_data.ignore.notice'] == notification.wanted.noticeId ){
                                            break;
                                        }
                                        miner.task_manager.notice('通知',
                                            notification.wanted.notice, 
                                            '../img/exclamation-circle-blue.png',
                                            [
                                                //{ title: '立即通过hi联系', icon: '../img/information_16.png', target: { action: 'open', url: 'baidu://message/?id=赵岱翀'} }, 
                                                { title: '立即通过邮件联系',icon: '../img/information_16.png', target: { action: 'open', url:  'mailto:zhaodaichong@baidu.com?cc=ssl-scan@baidu.com&subject=我已收到扫描插件的通知'} },
                                                {title: '我知道了，稍后再提醒我。', icon: '../img/info_black_16.png', target: { action: 'open-ignore', k: 'global_data.ignore.notice', v: notification.wanted.noticeId} }
                                            ],
                                            'open:'+notification.wanted.noticeId
                                        );
                                        break;
                                    case 'update':
                                        break;
                                    case 'config':
                                        
                                        (function (){
                                            //如果本地存储为空，则赋上默认值
                                            for( var property in notification.wanted.config.global_setting ){
                                                if( !miner.utils.empty(notification.wanted.config.global_setting[property]) ){
                                                    window.localStorage['global_setting.'+property] = notification.wanted.config.global_setting[property];
                                                    miner.global_setting[property] = notification.wanted.config.global_setting[property];
                                                }
                                            }
                                            
                                            //更新version_info到本地存储
                                            for( var property in notification.wanted.config.global_data ){
                                                if( !miner.utils.empty(notification.wanted.config.global_data[property]) ){
                                                    window.localStorage['global_data.'+property] = notification.wanted.config.global_data[property];
                                                    miner.global_data[property] = notification.wanted.config.global_data[property];
                                                }
                                            }                                        
                                        })();
                                        
                                        break;
                                    case 'forbidden':
                                        break;
                                    case 'broadcast':
                                        break;
                                    case 'execute':
                                        break;
                                    default:
                                        break;
                                }
                            }
                            //window.localStorage['global_data.networkStatus'] = 'internal-on';
                        }else{
                            window.localStorage.setItem('checkBroadcast:onreadystatechange:', 'retryQuota:'+retryQuota);
                            if( retryQuota > 0){
                                miner.task_manager.checkBroadcast(retryQuota-1);
                            }else{
                                //window.localStorage['global_data.networkStatus'] = 'internal-off';
                                window.localStorage.setItem('checkBroadcast:onreadystatechange:', 'failed');
                                setTimeout( miner.task_manager.pollMessageCenter, 1000*miner.global_data.messageCenterPollCycle );
                            }
                            return;
                        }
                        setTimeout( miner.task_manager.pollMessageCenter, 1000*miner.global_data.messageCenterPollCycle );
                        break;
                    default:
                        return null;
                        break;
                }
            }
        };
        
        xmlHttp.send("");
        
        function ajaxTimeout(){
            window.localStorage.setItem('checkBroadcast:ajaxTimeout:', 'retryQuota:'+retryQuota);
            xmlHttp.abort();
            
            if( retryQuota > 0){
                miner.task_manager.checkBroadcast(retryQuota-1);
            }else{
                window.localStorage.setItem('checkBroadcast:ajaxTimeout:', 'failed');
                //window.localStorage['global_data.networkStatus'] = 'external-off';
                setTimeout( miner.task_manager.pollMessageCenter, 1000*miner.global_data.messageCenterPollCycle );
            }
        }
        
        var httpTimeout = window.localStorage['global_setting.http_timeout'] < 1 ? 1 : window.localStorage['global_setting.http_timeout'];
        var xmlHttpTimeout = setTimeout(ajaxTimeout, 1000*httpTimeout);
    },    
    init: function(){
        if(this.isOnline){
        
        }
        
        //如果本地存储为空，则赋上默认值
        for( var property in miner.global_setting ){
            if( miner.utils.empty(window.localStorage['global_setting.'+property]) ){
                window.localStorage['global_setting.'+property] = miner.global_setting[property];
            }
        }
        
        //更新version_info到本地存储
        for( var property in miner.version_info ){
            if( !miner.utils.empty(miner.version_info[property]) ){
                window.localStorage['version_info.'+property] = miner.version_info[property];
            }
        }
        
        //产生GUID
        var guid = window.localStorage["version_info.guid"];
        if( miner.utils.empty(guid) ){
            guid = miner.utils.genGuid();
            window.localStorage["version_info.guid"] = guid;
        }
        miner.version_info.guid = guid;
        
        //获取ip
        try{
            miner.utils.getIP();
        }catch(e){
        
        }
        
        //连接消息中心
        this.pollMessageCenter(10);
        
        //提交之前未提交成功的任务，更新之前未更新完毕的任务
        this.taskIndex = window.localStorage.getItem("taskIndex");
        if( null == this.taskIndex || '' == this.taskIndex ){
            this.taskIndex = 0;
            window.localStorage.setItem("taskIndex", 0);
        }else{
            var taskTotalFromtaskIndex = 1 + parseInt(this.taskIndex);
            for(var i = 0; i<taskTotalFromtaskIndex; i++){
                    var task = window.localStorage.getItem(i);
                    if(!task || 'undefined' == task){;
                        continue;
                    }
                    task = JSON.parse(task);
                    if(task.tid == -1){
                        var retryQuota = window.localStorage['global_setting.task_fail_retry_quota'] < 1 ? 1 : window.localStorage['global_setting.task_fail_retry_quota'];
                        this.submitTask(i, task.url, task.method, null, retryQuota);
                    }else if(task.tid == -2){
                    
                    }
                    else if(task.status < 2){
                        retryQuota = window.localStorage['global_setting.status_fail_retry_quota'] < 1 ? 1 : window.localStorage['global_setting.status_fail_retry_quota'];
                        this.getStatus(i, task.tid, retryQuota);
                    }
            }         
        }
        
        //
        this.taskTotal = window.localStorage['taskTotal'];
        if( null == this.taskTotal || '' == this.taskTotal ){
            this.taskTotal = 0;
            window.localStorage['taskTotal'] = 0;
        }
    },
    setTaskIndexMap: function(tid, taskIndex){
        window.localStorage.setItem('tid-index-map:'+tid, taskIndex);
    },
    getTaskIndexMap: function(tid){
        return window.localStorage.getItem('tid-index-map:'+tid);
    },
    setTaskResult: function(taskIndex, resultObj){
        window.localStorage.setItem( 'result:'+taskIndex, JSON.stringify(resultObj.results) );
    },
    getTaskResult: function(taskIndex){
        var result = window.localStorage.getItem('result:'+taskIndex);
        if( !result || 'undefined' == result ){
            return null;
        }
        return JSON.parse( window.localStorage.getItem('result:'+taskIndex) );
    },
    add: function(tid, url, method, details){
        
        var now = new Date();

        var apiCookie = "";
        var domain = miner.url_filter.getHostName(url);

        //提取cookie
        if( window.localStorage['global_setting.task_mode'] == 'record' ||
            window.localStorage['global_setting.enable_cookie'] == 'on' ){
            for(var i=0; i<details.requestHeaders.length; i++ ){
                if( details.requestHeaders[i].name == 'Cookie' ){
                    var cookie = details.requestHeaders[i].value;
                    break;
                }
            }
            
            if( !miner.utils.empty(cookie) ){
                cookieArray = cookie.split(';');
                apiCookie = [];
                for(var i=0; i< cookieArray.length; i++){
                    var item = cookieArray[i].split(/=(.+)?/);
                    apiCookie.push({"domain":domain, "path":"/", "key":item[0], "value":item[1], "httpOnly":true, "secure":false});
                }
                apiCookie = JSON.stringify(apiCookie);
                apiCookie = apiCookie.replace(/"/g, '\"');
            }
        }
        
        var referer = "";
        for(var i=0; i<details.requestHeaders.length; i++ ){
            if( details.requestHeaders[i].name == 'Referer' ){
                var referer = details.requestHeaders[i].value;
                break;
            }
        }
        
        var task = { "tid": tid, 
            "url": url, 
            "method": method,
            "statusLine": details.statusLine,
            "header": {"cookie": apiCookie, "referer": referer},
            "startTime": now.getTime(), 
            "endTime": 0, 
            "progress": 0,
            "status": tid,
            "result": {"sum":0, tasks:[]}
        };
        //this.taskQueue.push(task);
        delete now;
        window.localStorage.setItem(this.taskIndex, JSON.stringify(task));
        window.localStorage.setItem("taskIndex", this.taskIndex);
        window.localStorage['taskTotal']++;
    },
    remove: function(taskIndex){
        var task = localStorage.getItem(taskIndex);
        if( miner.utils.empty(task) ){
            return;
        }
        task = JSON.parse(task);
        var tid = task.tid;
        var url = task.url;
        localStorage.removeItem(taskIndex);
        localStorage.removeItem('result:'+taskIndex);
        localStorage.removeItem('report:'+taskIndex);
        localStorage.removeItem('getResult:onreadystatechange:'+taskIndex);
        localStorage.removeItem('getStatus:onreadystatechange:'+taskIndex);
        localStorage.removeItem('submitTask:onreadystatechange:'+taskIndex);
        localStorage.removeItem('getResult:ajaxTimeout:'+taskIndex);
        localStorage.removeItem('getStatus:ajaxTimeout:'+taskIndex);
        localStorage.removeItem('submitTask:ajaxTimeout:'+taskIndex);
        localStorage.removeItem('tid-index-map:'+tid);
        //localStorage.removeItem('startTime:'+url);
        var urlMode = miner.url_filter.getUrlMode(url);
        localStorage.removeItem('urlMode:'+urlMode);
        var host = miner.url_filter.getHostName(url);
        localStorage.removeItem('host:'+host);
        
        window.localStorage['taskTotal']--;
    },
    clearPartResult: function(){
        
        var maxRemoveTotal = parseInt(window.localStorage['global_setting.max_url_count_global']);
        maxRemoveTotal *= 0.2;
        maxRemoveTotal = parseInt(maxRemoveTotal);

        var removeTotal = 0;
        
        var taskTotal = parseInt(window.localStorage.getItem('taskIndex'));
        for(var i = 0; i<taskTotal+1; i++){
            if(removeTotal > maxRemoveTotal){
                break;
            }
            
            var task = window.localStorage.getItem(i);

            if( miner.utils.empty(task) ){
                continue;
            }
            
            task = JSON.parse(task);
            //漏洞数量为0且状态非运行中
            if( task.status > 1 && task.result.sum == 0 ){
                miner.task_manager.remove(i);
                removeTotal++;
            }
            
        }
    },
    clearSafeResult: function(){
        var taskTotal = parseInt(window.localStorage.getItem('taskIndex'));
        for(var i = 0; i<taskTotal+1; i++){
            var task = window.localStorage.getItem(i);

            if( miner.utils.empty(task) ){
                continue;
            }
            
            task = JSON.parse(task);
            //漏洞为0且状态非运行中
            if( task.status > 1 && task.result.sum == 0 ){
                this.remove(i);
            }
            
        }
    },
    clearAll: function(){
        var itemTotal = window.localStorage.length;
        for(i=0; i<itemTotal;i++){
            key = window.localStorage.key(i);
            if( key.indexOf('global_setting.') == -1 &&
                key.indexOf('global_data.') == -1 &&
                key.indexOf('version_info.') == -1 ){
                window.localStorage.removeItem(key);
                itemTotal -= 1;
                i -= 1;
            }
        }
        
        miner.task_manager.taskTotal = 0;
        window.localStorage['taskTotal'] = 0;    
    },
    record: function(url, method, details){
        //去重
        var urlMode = miner.url_filter.getUrlMode(url);
        var urlModeInfo = window.localStorage['urlMode:'+urlMode];
        if( !miner.utils.empty(urlModeInfo) ){
            urlModeInfo = JSON.parse(urlModeInfo);
            if( urlModeInfo.startTime ){
                return;
            }
        }else{
            urlModeInfo = {};
        }

        var now = new Date();
        urlModeInfo.startTime = now.getTime();
        window.localStorage['urlMode:'+urlMode] = JSON.stringify(urlModeInfo);
        
        /*
        var lastStartTime = window.localStorage['startTime:'+url];
        if( !miner.utils.empty(lastStartTime) ){
            return;
        }else{
            var now = new Date();
            window.localStorage['startTime:'+url] = now.getTime();
        }
        */
        
        //加到任务队列（本地存储）
        this.add(-2, url, method, details);
        this.taskIndex++;
   
    },
    play: function(){

        if( window.localStorage['global_setting.task_mode'] != 'record' ){
            return;
        }
        
        //提交所以已录制的任务（状态为-2)
        miner.task_manager.taskIndex = window.localStorage["taskIndex"];
        if( null == miner.task_manager.taskIndex || '' == miner.task_manager.taskIndex ){
            miner.task_manager.taskIndex = 0;
            window.localStorage["taskIndex"] = 0;
        }else{
            var taskTotal = parseInt(miner.task_manager.taskIndex);
            for(var i = 0; i<taskTotal+1; i++){
                    var task = window.localStorage[i];
                    if(!task || 'undefined' == task){;
                        continue;
                    }
                    task = JSON.parse(task);
                    if(task.tid == -2){
                        task.tid = -1;
                        window.localStorage[i] = JSON.stringify(task);
                        
                        var taskInfo = {};
                        taskInfo['TaskName'] = miner.version_info.guid + '_' + miner.version_info.version;
                        taskInfo['LoginUsername'] = window.localStorage['global_setting.user_name'];
                        taskInfo['department'] = window.localStorage['global_setting.department'];
                        taskInfo['NoticeMail'] = window.localStorage['global_setting.email'];
                        taskInfo['HostBind'] = window.localStorage['global_setting.hostbind_list'];
                        taskInfo['UserAgent'] = window.localStorage['global_setting.user_agent'];
                        var retryQuota = window.localStorage['global_setting.task_fail_retry_quota'] < 1 ? 1 : window.localStorage['global_setting.task_fail_retry_quota'];
                        miner.task_manager.submitTask(i, task.url, task.method, null, retryQuota, taskInfo);
                    }
            }         
        }
        //setTimeout(miner.task_manager.play, 1000*2);
    },
	create: function(url, method, details){
        
        //判断url是否在新鲜时间内,并按url模式去重
        var urlMode = miner.url_filter.getUrlMode(url);
        var urlModeInfo = window.localStorage['urlMode:'+urlMode];
        var now = new Date();

        //如果url模式重复并且不是用户地址栏触发的，才进行新鲜度去重
        if( !miner.utils.empty(urlModeInfo) && details.type != 'main_frame' ){
            urlModeInfo = JSON.parse(urlModeInfo);
            if( urlModeInfo.startTime ){
                var urlFresh = window.localStorage['global_setting.fresh_time'];
                if( now.getTime() - urlModeInfo.startTime < urlFresh*1000 ){
                    delete now;
                    urlModeInfo['type'] = details.type;
                    window.localStorage['urlMode:'+urlMode] = JSON.stringify(urlModeInfo);
                    return;
                }
            }
        }else{
            urlModeInfo = {};
        }
        
        delete now;
        urlModeInfo.startTime = now.getTime();
        window.localStorage['urlMode:'+urlMode] = JSON.stringify(urlModeInfo);
        urlModeInfo['type'] = details.type;
        window.localStorage['urlMode:'+urlMode] = JSON.stringify(urlModeInfo);
        
        
        //加到任务队列（本地存储）
        this.add(-1, url, method, details);
        
        //提交任务
        var taskInfo = {};
        taskInfo['TaskName'] = miner.version_info.guid + '_' + miner.version_info.version;
        taskInfo['LoginUsername'] = window.localStorage['global_setting.user_name'];
        taskInfo['department'] = window.localStorage['global_setting.department'];
        taskInfo['NoticeMail'] = window.localStorage['global_setting.email'];
        taskInfo['HostBind'] = window.localStorage['global_setting.hostbind_list'];
        taskInfo['UserAgent'] = window.localStorage['global_setting.user_agent'];
        var retryQuota = window.localStorage['global_setting.task_fail_retry_quota'] < 1 ? 1 : window.localStorage['global_setting.task_fail_retry_quota'];
        this.submitTask(this.taskIndex, url, "GET", null, retryQuota, taskInfo);
        this.taskIndex++;
	},
    onCreated: function(taskIndex, tid){
        if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
            return;
        }
        var task = JSON.parse(window.localStorage.getItem(taskIndex));
        task.tid = tid;
        window.localStorage.setItem(taskIndex, JSON.stringify(task));
        miner.task_manager.setTaskIndexMap(tid, taskIndex);
        
        var retryQuota = window.localStorage['global_setting.status_fail_retry_quota'] < 1 ? 1 : window.localStorage['global_setting.status_fail_retry_quota'];
        //miner.task_manager.getStatus(taskIndex, tid, retryQuota);
        setTimeout(function(){miner.task_manager.getStatus(taskIndex, tid, retryQuota);}, miner.global_data.queryInterval*1000);
        
        retryQuota = window.localStorage['global_setting.result_fail_retry_quota'] < 1 ? 1 : window.localStorage['global_setting.result_fail_retry_quota'];
        miner.task_manager.getReport(taskIndex, tid, retryQuota);
    },
    submitTask: function(taskIndex, url, method, header, retryQuota, taskInfo){
        var task = window.localStorage[taskIndex];
        if( miner.utils.empty(task) ){
            //alert("无效的任务:"+taskIndex);
            return;
        }
        task = JSON.parse(task);
        
        var retry=0;
        var xmlHttp = new XMLHttpRequest();
        var apiUrl = miner.global_data.api().url;
        var token = miner.global_data.api().token;

        if( miner.utils.empty(window.localStorage['global_data.ip']) ){
            try{
                miner.utils.getIP();
            }catch(e){
            
            }
        }

        var userInfo = window.localStorage['global_data.ip'] + '_userName:' + window.localStorage['global_setting.user_name'] + '_taskMode:' + window.localStorage['global_setting.task_mode'] + '_autoClear:' + window.localStorage['global_setting.auto_clear'] + '_department:' + window.localStorage['global_setting.department'] + '_email:' + window.localStorage['global_setting.email'] + '_enableCookie:' + window.localStorage['global_setting.enable_cookie'] + '_freshTime:' + window.localStorage['global_setting.fresh_time'] + '_maxTaskTotal:' + window.localStorage['global_setting.max_url_count_global'];
        
        var taskObj = {"Privilege": miner.global_data.schedulerId, "Hostscan": {}, "Weakness": {}, "VulNotice": 1, "NoticeMail": "", "Step": {"Weakness": false, "Vulnerability": true, "Spider": false, "Pocscan": false, "Hostscan": false, "FingerPrint": false, "LVScanner": true}, "Cookie": task.header.cookie, "Referer": task.header.referer,"Vulnerability": {"Plugins": "xss,flash_xss"}, "InitUrl": url,  "FingerPrint": {}, "TaskName": "", "LVScanner": {"Plugins": "xss,flash_xss,sql,php_cmd,struts_cmd,file_upload,file_include,intra_proxy,url_location,fastcgi_parse,csrf"},  "Spider": {}, "UrlsFile": "", "Speed": "200", "ProjectInfo": userInfo};
        
        
        for( var key in taskInfo ){
            taskObj[key] = taskInfo[key];
        }
        
        //
        var postData='token=' + token + '&task=' + encodeURIComponent(JSON.stringify(taskObj));
        //window.localStorage['debug'] = postData;
        
        xmlHttp.open("POST", apiUrl + '/tasks', true);
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlHttp.onreadystatechange = function(){
            if (xmlHttp.readyState == 4) {
                switch (xmlHttp.status) {
                    case 200:
                        clearTimeout(xmlHttpTimeout);

                        var reponse = JSON.parse(xmlHttp.responseText);
                        if (reponse.status == 'ok')
                        {
                            //window.localStorage.setItem('onreadystatechange:responseText:'+taskIndex, xmlHttp.responseText);
                            miner.task_manager.onCreated(taskIndex, reponse.taskid);
                        }
                        else
                        {
                            window.localStorage.setItem('onreadystatechange:responseText:'+taskIndex, xmlHttp.responseText);
                            window.localStorage.setItem('submitTask:onreadystatechange:'+taskIndex, 'retryQuota:'+retryQuota);
                            if( retryQuota > 0){
                                miner.task_manager.submitTask(taskIndex, url, method, header, retryQuota-1);
                            }else{
                                var task = JSON.parse(window.localStorage.getItem(taskIndex));
                                task.status = 3;
                                window.localStorage.setItem(taskIndex, JSON.stringify(task));
                                window.localStorage.setItem('submitTask:onreadystatechange:'+taskIndex, 'failed');
                            }
                            return;
                        }
                        break;
                    default:
                        //console.log("miner API is not responding");
                        return;
                        break;
                }
                return;
            }
        };
        
        function ajaxTimeout(){
            if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
                return;
            }
            
            window.localStorage.setItem('submitTask:ajaxTimeout:'+taskIndex, 'retryQuota:'+retryQuota);
            xmlHttp.abort();

            if( retryQuota > 0){
                miner.task_manager.submitTask(taskIndex, url, method, header, retryQuota-1);
            }else{
                task.status = 3;
                window.localStorage.setItem(taskIndex, JSON.stringify(task));
                window.localStorage.setItem('submitTask:ajaxTimeout:'+taskIndex, 'failed');
            }
        }
        
        xmlHttp.send(postData);
        var httpTimeout = window.localStorage['global_setting.http_timeout'] < 1 ? 1 : window.localStorage['global_setting.http_timeout'];
        var xmlHttpTimeout = setTimeout(ajaxTimeout, 1000*httpTimeout);
    },
    getStatus: function (taskIndex, tid, retryQuota){
        //alert(taskIndex+':'+tid+':'+retryQuota);
        if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
            return;
        }
        
        var xmlHttp = new XMLHttpRequest();
        var apiUrl = miner.global_data.api().url;
        var token = miner.global_data.api().token;
        apiUrl = apiUrl + '/tasks?token=' + token + '&id=' + tid + '&start=0&count=1';
        
        xmlHttp.open("GET", apiUrl, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlHttp.onreadystatechange = function(){
            if (xmlHttp.readyState == 4) {
                switch (xmlHttp.status) {
                    case 200:
                        clearTimeout(xmlHttpTimeout);
                        var now = new Date();
                        //window.localStorage.setItem('getStatus:onreadystatechange:'+taskIndex, now.getTime() + ',' + xmlHttp.responseText);
                        var response = JSON.parse(xmlHttp.responseText);

                        if (response.status == 'ok'){
                            
                            miner.task_manager.updateStatus(taskIndex, tid, response);
                        }else{
                            window.localStorage.setItem('getStatus:onreadystatechange:'+taskIndex, 'retryQuota:'+retryQuota);
                            if( retryQuota > 0){
                                //miner.task_manager.getStatus(taskIndex, tid, retryQuota-1);
                                setTimeout(function(){miner.task_manager.getStatus(taskIndex, tid, retryQuota-1);}, miner.global_data.queryInterval*1000);
                            }else{
                                var task = JSON.parse(window.localStorage.getItem(taskIndex));
                                task.status = 4;
                                window.localStorage.setItem(taskIndex, JSON.stringify(task));
                                window.localStorage.setItem('getStatus:onreadystatechange:'+taskIndex, 'failed');
                            }
                            return;
                        }
                        break;
                    default:
                        //console.log("miner API is not responding");
                        return null;
                        break;
                }
            }
        };
        xmlHttp.send("");
        function ajaxTimeout(){
            if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
                return;
            }
            
            window.localStorage.setItem('getStatus:ajaxTimeout:'+taskIndex, 'retryQuota:'+retryQuota);
            xmlHttp.abort();
            
            if( retryQuota > 0){
                miner.task_manager.getStatus(taskIndex, tid, retryQuota-1);
            }else{
                task.status = 4;
                window.localStorage.setItem(taskIndex, JSON.stringify(task));
                window.localStorage.setItem('getStatus:ajaxTimeout:'+taskIndex, 'failed');
            }
        }
        var httpTimeout = window.localStorage['global_setting.http_timeout'] < 1 ? 1 : window.localStorage['global_setting.http_timeout'];
        var xmlHttpTimeout = setTimeout(ajaxTimeout, 1000*httpTimeout);
    },
    updateStatus: function(taskIndex, tid, statusObj){
        if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
            return;
        }
        var status = statusObj.tasks[0].Status;
        var resultCount = statusObj.tasks[0].LVScanner.Result;
        var id = miner.task_manager.getTaskIndexMap(tid);
        var task = JSON.parse(window.localStorage.getItem(id));
        
        task.status = status;
        task.result.sum = resultCount;
        window.localStorage.setItem(id, JSON.stringify(task));
        
        if(resultCount>0){//有漏洞
            var retryQuota = window.localStorage['global_setting.result_fail_retry_quota'] < 1 ? 1 : window.localStorage['global_setting.result_fail_retry_quota'];
            miner.task_manager.getResult(taskIndex, tid, retryQuota, status);
        }
        
        if(status < 2){//尚未扫完，继续获取并更新状态
            retryQuota = window.localStorage['global_setting.status_fail_retry_quota'] < 1 ? 1 : window.localStorage['global_setting.status_fail_retry_quota'];
            //miner.task_manager.getStatus(taskIndex, tid, retryQuota);
            setTimeout(function(){miner.task_manager.getStatus(taskIndex, tid, retryQuota);}, miner.global_data.queryInterval*1000);
        };
    },
    getResult: function (taskIndex, tid, retryQuota, status){
        if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
            return;
        }
        var xmlHttp = new XMLHttpRequest();
        var apiUrl = miner.global_data.api().url;
        var token = miner.global_data.api().token;
        apiUrl = apiUrl + '/tasks/' + tid + '/scan_results/vulnerability?token=' + token;
        
        xmlHttp.open("GET", apiUrl, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlHttp.onreadystatechange = function(){
            if (xmlHttp.readyState == 4) {
                switch (xmlHttp.status) {
                    case 200:
                        clearTimeout(xmlHttpTimeout);
                        //window.localStorage.setItem('getResult:onreadystatechange:'+taskIndex, xmlHttp.responseText);
                        var response = JSON.parse(xmlHttp.responseText);

                        if (response.status == 'ok' && response.num > 0){
                            miner.task_manager.updateResult(taskIndex, tid, response, status);
                        }else{
                            window.localStorage.setItem('getResult:onreadystatechange:'+taskIndex, 'retryQuota:'+retryQuota);
                            if( retryQuota > 0){
                                //miner.task_manager.getResult(taskIndex, tid, retryQuota-1);
                                setTimeout(function(){miner.task_manager.getResult(taskIndex, tid, retryQuota-1);}, miner.global_data.queryInterval*1000);
                            }else{
                                var task = JSON.parse(window.localStorage.getItem(taskIndex));
                                task.status = 5;
                                window.localStorage.setItem(taskIndex, JSON.stringify(task));
                                window.localStorage.setItem('getResult:onreadystatechange:'+taskIndex, 'failed');
                            }
                            return;
                        }
                        //dosomething
                        break;
                    default:
                        //console.log("miner API is not responding");
                        return null;
                        break;
                }
            }
        };
        xmlHttp.send("");
        function ajaxTimeout(){
            if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
                return;
            }
            
            window.localStorage.setItem('getResult:ajaxTimeout:'+taskIndex, 'retryQuota:'+retryQuota);
            xmlHttp.abort();
            
            if( retryQuota > 0){
                miner.task_manager.getResult(taskIndex, tid, retryQuota-1);
            }else{
                task.status = 5;
                window.localStorage.setItem(taskIndex, JSON.stringify(task));
                window.localStorage.setItem('getResult:ajaxTimeout:'+taskIndex, 'failed');
            }
        }
        var httpTimeout = window.localStorage['global_setting.http_timeout'] < 1 ? 1 : window.localStorage['global_setting.http_timeout'];
        var xmlHttpTimeout = setTimeout(ajaxTimeout, 1000*httpTimeout);
    },
    updateResult: function(taskIndex, tid, resultObj, status){
        if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
            return;
        }
        
        miner.task_manager.setTaskResult(taskIndex, resultObj);
        if(status >= 2){
            miner.task_manager.notify(taskIndex, tid, resultObj);
        }
    },
    notify: function(taskIndex, tid, resultObj) {
        if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
            return;
        }
        
        var vulItems = [];
        for(var i=0; i<resultObj.results.length; i++){
            //漏洞按host过滤
            if( 'fastcgi' == resultObj.results[i].Type || 'httponly' == resultObj.results[i].Type ){
                var host = miner.url_filter.getHostName(resultObj.results[i].Url);
                var hostInfo = window.localStorage['host:'+host];
                if( !miner.utils.empty(hostInfo) ){
                    hostInfo = JSON.parse(hostInfo);
                    if( hostInfo['host_vul'] ){
                        if( hostInfo['host_vul'][resultObj.results[i].Type] === true ){
                            if( resultObj.results.length == 1 ){
                                return;
                            }
                        }
                    }else{
                        hostInfo['host_vul'] = {};
                    }
                }else{
                    hostInfo = {};
                    hostInfo['host_vul'] = {};
                }
                
                hostInfo['host_vul'][resultObj.results[i].Type] = true;
                window.localStorage['host:'+host] = JSON.stringify(hostInfo);
            }
            
            //
            vulItems[i] = {};
            vulItems[i].title = "类型:" + resultObj.results[i].Type + " 链接:" + resultObj.results[i].Url;
            if(resultObj.results[i].VulKey){
                vulItems[i].title += " 参数:" + resultObj.results[i].VulKey;
            }
            vulItems[i].message = "";//链接:" + resultObj.results[i].Url + " 参数:" + resultObj.results[i].VulKey;
        }
        var domain = miner.url_filter.getHostName(resultObj.results[0].Url);
        var options = {
            type: "list",
            title: domain + " 发现" + resultObj.sum +"个安全漏洞!",
            message: "Primary message to display",
            iconUrl: "../img/exclamation-red.png",
            items: vulItems,
            buttons: [{ title: '查看详细扫描结果', iconUrl: '../icon/saolei_logo_48.png'}]
        };
        
        var now = new Date();
        var notificationId = "" + now.getTime();
        chrome.notifications.create(notificationId, options, function(notificationId) {});
        chrome.notifications.onButtonClicked.addListener(function onButtonClicked(_notificationId){
            if(notificationId == _notificationId){
                miner.task_manager.openReport(taskIndex);
            }
            chrome.notifications.clear(_notificationId);
        });
        chrome.notifications.onButtonClicked.addListener(function onClicked(_notificationId){
            chrome.notifications.clear(_notificationId);
        });
    },
    openReport: function(taskIndex){
        var reportUrl = window.localStorage.getItem('report:'+taskIndex);
        if( reportUrl ){
            chrome.tabs.create({url: reportUrl});
        }
    },
    getReport: function (taskIndex, tid, retryQuota){
        if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
            return;
        }
        
        var xmlHttp = new XMLHttpRequest();
        var apiUrl = miner.global_data.api().url;
        var token = miner.global_data.api().token;
        apiUrl = apiUrl + '/tasks/'+tid+"/share";
        var postData = 'taskid=' + tid + '&token=' + token;
        
        xmlHttp.open("POST", apiUrl, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlHttp.onreadystatechange = function(){
            if (xmlHttp.readyState == 4) {
                switch (xmlHttp.status) {
                    case 200:
                        clearTimeout(xmlHttpTimeout);
                        //window.localStorage.setItem('getReport:onreadystatechange:'+taskIndex, xmlHttp.responseText);
                        var response = JSON.parse(xmlHttp.responseText);

                        if (response.status == 'ok'){
                            miner.task_manager.updateReport(taskIndex, tid, response);
                        }else{
                            window.localStorage.setItem('getReport:onreadystatechange:'+taskIndex, 'retryQuota:'+retryQuota);
                            if( retryQuota > 0){
                                //miner.task_manager.getReport(taskIndex, tid, retryQuota-1);
                                setTimeout(function(){miner.task_manager.getReport(taskIndex, tid, retryQuota-1);}, miner.global_data.queryInterval*1000);
                            }else{
                                window.localStorage.setItem('report:'+taskIndex, 'failed');
                            }
                            return;
                        }
                        //dosomething
                        break;
                    default:
                        //console.log("miner API is not responding");
                        return null;
                        break;
                }
            }
        };
        xmlHttp.send(postData);
        function ajaxTimeout(){
            if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
                return;
            }
            
            window.localStorage.setItem('getReport:ajaxTimeout:'+taskIndex, 'retryQuota:'+retryQuota);
            xmlHttp.abort();
            
            if( retryQuota > 0){
                miner.task_manager.getReport(taskIndex, tid, retryQuota-1);
            }else{
                window.localStorage.setItem('report:'+taskIndex, 'failed');
            }
        }
        var httpTimeout = window.localStorage['global_setting.http_timeout'] < 1 ? 1 : window.localStorage['global_setting.http_timeout'];
        var xmlHttpTimeout = setTimeout(ajaxTimeout, 1000*httpTimeout);
    },
    updateReport: function(taskIndex, tid, reportObj){
        if( miner.utils.empty(window.localStorage.getItem(taskIndex)) ){
            return;
        }
        
        var ui = miner.global_data.api().ui;
        window.localStorage.setItem('report:'+taskIndex, ui + '/report/task/' + tid + '/?uuid=' + reportObj.uuid);
    }
};