
miner.popup = {
    i: 0,
    isNum: function (n) {
        var reg=/^\d*$/;
        return reg.test(n);
    },
    backgroundPage: function() {
        return chrome.extension.getBackgroundPage();
    },
    checkSelf: function(retryQuota){
        var xmlHttp = new XMLHttpRequest();
        var apiUrl = miner.global_data.api().url;
        
        xmlHttp.open("GET", apiUrl, true);
        xmlHttp.onreadystatechange = function(){
            if (xmlHttp.readyState == 4) {
                switch (xmlHttp.status) {
                    case 200:
                        clearTimeout(xmlHttpTimeout);
                        window.localStorage['global_data.networkStatus'] = 'internal-on';
                        break;
                    default:
                        window.localStorage['global_data.networkStatus'] = 'internal-off';
                        return null;
                        break;
                }
            }
        };
        
        xmlHttp.send("");
        
        function ajaxTimeout(){
            window.localStorage.setItem('checkSelf:ajaxTimeout:', 'retryQuota:'+retryQuota);
            xmlHttp.abort();
            
            if( retryQuota > 0){
                miner.popup.checkSelf(retryQuota-1);
            }else{
                window.localStorage.setItem('checkSelf:ajaxTimeout:', 'failed');
                window.localStorage['global_data.networkStatus'] = 'internal-off';
            }
        }
        
        var httpTimeout = window.localStorage['global_setting.http_timeout'] < 1 ? 1 : window.localStorage['global_setting.http_timeout'];
        var xmlHttpTimeout = setTimeout(ajaxTimeout, 1000*httpTimeout);
    },
    init: function() {
        //界面初始化
        $("#mainTable").accordion({
            header: "> thead",
            collapsible: true,
            animate: false,
            heightStyle: "content",
            active: false
        });
       
        //$("#banner").pin();
        
        //初始化捕获按钮
        this.backgroundPage().miner.global_data.captureTraffic = window.localStorage['global_data.captureTraffic'];
        if(this.backgroundPage().miner.global_data.captureTraffic == 'off'){
            this.captureTrafficOff();
            $("#capture").parent().addClass("active");
            $("#capture").children("i").removeClass("icon-ban-circle").addClass("icon-ok-circle");
            $("#capture").html('<i class="icon-ok-circle"></i>启动');
        }else{
            this.captureTrafficOn();
            $("#capture").parent().removeClass("active"); 
            $("#capture").children("i").removeClass("icon-ok-circle").addClass("icon-ban-circle");
            $("#capture").html('<i class="icon-ban-circle"></i>关闭');
        }
        
        //初始化播放按钮
        this.backgroundPage().miner.global_data.play = window.localStorage['global_data.play'];
        if( null == this.backgroundPage().miner.global_data.play){
            miner.popup.playOff();
        } 
        else if(this.backgroundPage().miner.global_data.play == 'off'){
            miner.popup.playOff();
        }
        else if(this.backgroundPage().miner.global_data.play == 'on'){
            miner.popup.playOn();
        }
        
        //初始化模式切换按钮
        window.localStorage['global_setting.task_mode'];
        if( 'record' == window.localStorage['global_setting.task_mode'] ){
            miner.popup.recordMode();
        }else{
            //其他一律实时模式
            miner.popup.realtimeMode();
        }        
        
        //自检
        this.checkSelf(3);
    },
    updateStatistic: function(domainItem){
        //var domainItem = $('#mainTable > thead[domain="' + domain + '"]');
        if( !domainItem || 'undefined' == domainItem || domainItem.length == 0 ){
            return;
        }
        
        var thStatistics = domainItem.find('tr > th.statistics');
        var spanRecordTotal = thStatistics.find('span').eq(0);
        var spanSuspendTotal = thStatistics.find('span').eq(1);
        var spanSafeTotal = thStatistics.find('span').eq(2);
        var spanDangerTotal = thStatistics.find('span').eq(3);
        var spanFaildTotal = thStatistics.find('span').eq(4);
        
        var recordTotal = 0;
        var suspendTotal = 0;
        var safeTotal = 0;
        var dangerTotal = 0;
        var faildTotal = 0;

        var tbody = domainItem.next();
        if( tbody.length > 0 ){
            tbody.find('tr > td > table > tbody > tr').each(function(){
                var task = JSON.parse( window.localStorage[( $(this).attr('id') )] );
                switch ( parseInt(task.status) )
                {   case -2:
                        recordTotal += 1;
                        spanRecordTotal.text(recordTotal).css('display', 'inline-block');
                        spanRecordTotal.attr('title', '当前域名共'+recordTotal+'个录制任务正在等待播放');
                        break;
                    case -1:
                    case 0:
                    case 1:
                        suspendTotal += 1;
                        spanSuspendTotal.text(suspendTotal).css('display', 'inline-block');
                        spanSuspendTotal.attr('title', '当前域名还有'+suspendTotal+'个任务正在提交或检测中');
                        break;
                    case 2:
                        if(task.result.sum>0){
                            dangerTotal += 1;
                            spanDangerTotal.text(dangerTotal).css('display', 'inline-block');
                            spanDangerTotal.attr('title', '当前域名共'+dangerTotal+'个任务检测发现存在漏洞');
                        }else{
                            safeTotal += 1;
                            spanSafeTotal.text(safeTotal).css('display', 'inline-block');
                            spanSafeTotal.attr('title', '当前域名共'+safeTotal+'个任务检测结果安全');
                        }
                        break;
                    case 3:
                    case 4:
                    case 5:
                        faildTotal += 1;
                        spanFaildTotal.text(faildTotal).css('display', 'inline-block');
                        spanFaildTotal.attr('title', '当前域名共'+faildTotal+'个任务运行失败');
                        break;
                    default:
                        break;
                }
            });
        } 
        if( !recordTotal ){
            spanRecordTotal.text(recordTotal).css('display', 'none');
        }
        if( !suspendTotal ){
            spanSuspendTotal.text(suspendTotal).css('display', 'none');
        }
        if( !safeTotal ){
            spanSafeTotal.text(safeTotal).css('display', 'none');
        }
        if( !dangerTotal ){
            spanDangerTotal.text(dangerTotal).css('display', 'none');
        }
        if( !faildTotal ){
            spanFaildTotal.text(faildTotal).css('display', 'none');
        }
        
        if( recordTotal + suspendTotal + safeTotal + dangerTotal + faildTotal == 0 ){
            domainItem.remove();
        }
        
    },
    draw: function(refreshRate) {
        var z = 0;
        (function drawing(){
        
            function getResultTitle(taskIndex){
                var resultList = miner.task_manager.getTaskResult(taskIndex);
                var resultTitle = '';
                if(resultList){
                    for(var j=0; j<resultList.length; j++){
                        resultTitle += '漏洞类型: ' + resultList[j].Type;
                        if(resultList[j].VulKey){
                            resultTitle += ', 参数: ' + resultList[j].VulKey;
                        }
                        resultTitle += '&#013;';
                    }
                }
                if(resultTitle == ''){
                    resultTitle = '没有发现漏洞';
                }
                return resultTitle;
            }
            
            //$("#responseList_0 > tr").remove();
            var trCollection;
            var thCollection;
            var taskTotal = parseInt(window.localStorage.getItem('taskIndex'));
            var realTaskTotal = 0;
            for(var i = 0; i<taskTotal+1; i++){
                    var task = window.localStorage.getItem(i);

                    if(!task || 'undefined' == task){;
                        continue;
                    }
                    realTaskTotal += 1;
                    task = JSON.parse(task);
                    /*
                    task.tid = i;
                    task.status = 2;
                    task.url = "http://www." + i + ".com/p?z=" + i;
                    task.method = "GET";
                    task.result = {};
                    task.result.sum = 1;
                    */
                    var domain = miner.url_filter.getHostName(task.url);
                    var domainItem = $('#mainTable > thead[domain="' + domain + '"]');
                    if( !domainItem || 'undefined' == domainItem || 0 == domainItem.length){
                        //首次创建domain tab
                        domainItem = '<thead domain="' + domain + '" title="" style="width: 600px; padding: 0px;">';
                        domainItem += '<tr>';
                        domainItem += '<th style="width: 15px;"><\/th>';
                        domainItem += '<th style="width: 400px;">' + domain + '<\/th>';
                        domainItem += '<th class="statistics" style="width: 150px; text-align: center;">'
                        domainItem += '<span class="btn btn-mini btn-info" style="display:none;float:right;">0</span><span class="btn btn-mini btn-default" style="display:none;float:right;">0</span><span class="btn btn-mini btn-success" style="display:none;float:right;">0</span><span class="btn btn-mini btn-danger" style="display:none;float:right;">0</span><span class="btn btn-mini btn-inverse" style="display:none;float:right;">0</span>';
                        domainItem += '<\/th>';
                        domainItem += '<th class="remove" style="width: 15px; text-align: center;">x<\/th>';
                        domainItem += '<\/tr>';
                        domainItem += '<\/thead>';
             
                        domainItem += '<tbody>';
                        domainItem += '<tr>';
                        domainItem += '<td>';
                        domainItem += '<table domain=' + domain + ' class="table table-condensed table-hover table-bordered">';
                        domainItem += '<\/table>';
                        domainItem += '<\/td>';
                        domainItem += '<\/tr>';
                        domainItem += '<\/tbody>';

                        $('#mainTable:first').prepend(domainItem);
                        domainItem = $('#mainTable > thead[domain="' + domain + '"]');
                    }
                    
                    //计算domain的漏洞总数
                    /*
                    thStatistics = domainHeader.find('tr > th.statistics');
                    var taskTotal = parseInt( thStatistics.find('span').eq(0).text() );
                    var resultTotal = parseInt( thStatistics.find('span').eq(1).text() );
                    resultTotal += task.result.sum;
                    thCollection.eq(2).attr('resultTotal', resultTotal);
                    */
                    
                    var taskTable = $('#mainTable > tbody > tr > td > table[domain="' + domain +'"]');
                    var taskItem = taskTable.find('tr[id=' + i + ']');
                    if( !taskItem || 'undefined' == taskItem || 0 == taskItem.length){
                        //UI上没有存在指定tid的taskItem，创建一个新的
                        var t = "";//must clear it!!!!
                        t += '<tr id=' + i + ' tid=' + task.tid + ' title="任务id:' + task.tid + '" status=' + task.status + ' class="taskItem" >';
                        t += '<td class="index" style="width: 15px; max-width: 45px; text-align: center;overflow: hidden; white-space: nowrap;text-overflow:ellipsis;">' + i + "<\/td>";
                        t += '<td class="url" style="width: 350px; max-width: 350px; text-align: left;overflow: hidden; white-space: nowrap;text-overflow:ellipsis;" title=' + task.url + ' >' + task.url + '<\/td>';
                        t += '<td class="method" style="width: 40px; max-width: 40px; text-align: center;overflow: hidden; white-space: nowrap;text-overflow:ellipsis;">' + task.method + "<\/td>";
                        
                        t += '<td class="result"  title="' + getResultTitle(i) + '" style="width: 100px; max-width: 100px; text-align: center;overflow: hidden; white-space: nowrap;text-overflow:ellipsis;">' + '<span id="result" class="result-count">' + task.result.sum + '个漏洞 ' + '<\/span>';
                        if(task.status == 2){//任务已完成
                            if(task.result.sum>0){
                                t += '<span class="badge badge-error result-badge">危险<\/span>' + '<\/td>';
                            }else{
                                t += '<span class="badge badge-success result-badge">安全<\/span>' + '<\/td>';
                            }
                        }else if(task.status == 3){//任务提交失败    
                            t += '<span class="badge badge-fail result-badge">失败<\/span>' + '<\/td>';
                        }else if(task.status == 4){//获取任务信息失败    
                            t += '<span class="badge badge-fail result-badge">获取状态失败<\/span>' + '<\/td>';
                        }else if(task.status == 5){//获取任务信息失败    
                            t += '<span class="badge badge-fail result-badge">获取结果失败<\/span>' + '<\/td>';
                        }else{
                            if(task.tid == -1){//任务还在提交
                                t += '<span class="badge badge-important result-badge">提交中<\/span>' + '<\/td>';
                            }else if(task.tid == -2){//任务还在已录制
                                t += '<span class="badge badge-info result-badge">已录制<\/span>' + '<\/td>';
                            }else{//任务还在运行
                                t += '<span class="badge badge-important result-badge">检测中<\/span>' + '<\/td>';
                            }
                        }
                
                        t += '<td class="operating" style="width: 40px; max-width: 40px; text-align: center;overflow: hidden; white-space: nowrap;text-overflow:ellipsis;">' + '<a href="#"><i title="查看详细结果" class="icon-th-list active"> <\/i><\/a>' + "|" + '<a href="#"><i title="删除本次任务" class="icon-remove"> <\/i><\/a>' + '<\/td>';
                        t += '<\/tr>';
                        
                        //$("#responseList > tbody tr").first().remove();
                        //$("#responseList > tbody:last").append(t);
                        taskTable.prepend(t);
                        
                    }else{
                        //UI已存在该taskItem，更新状态和结果
                        if(taskItem.find('tr').attr('tid') == -1){
                            taskItem.find('tr').attr('tid', task.tid);
                            taskItem.find('tr').attr('title', '任务id:'+task.tid);
                        }
                        var tdResult = taskItem.find('td').eq(3);
                        var spanResult = tdResult.find('span').eq(0);
                        var spanStatus = tdResult.find('span').eq(1);
                        
                        if(taskItem.attr('status') < 2){
                            if(task.status == 2){//任务已完成
                                if(task.result.sum>0){
                                    spanStatus.removeClass().addClass('badge badge-error result-badge');
                                    spanStatus.text('危险');
                                }else{
                                    spanStatus.removeClass().addClass('badge badge-success result-badge');
                                    spanStatus.text('安全');
                                }
                            }else if(task.status == 3){//任务提交失败
                                    spanStatus.removeClass().addClass('badge badge-fail result-badge');
                                    spanStatus.text('失败');
                            }else if(task.status == 4){//获取任务信息失败
                                spanStatus.removeClass().addClass('badge badge-fail result-badge');
                                spanStatus.text('获取状态失败');
                            }else if(task.status == 5){//获取任务信息失败    
                                spanStatus.removeClass().addClass('badge badge-fail result-badge');
                                spanStatus.text('获取结果失败');
                            }else{
                                if(task.tid == -1){//任务还在提交
                                    spanStatus.removeClass().addClass('badge badge-important result-badge');
                                    spanStatus.text('提交中');
                                }else if(task.tid == -2){//任务还在已录制
                                    spanStatus.removeClass().addClass('badge badge-info result-badge');
                                    spanStatus.text('已录制');
                                }else{//任务还在运行
                                    spanStatus.removeClass().addClass('badge badge-important result-badge');
                                    spanStatus.text('检测中');
                                }
                            }
                            
                            spanResult.text(task.result.sum + '个漏洞 ');
                            tdResult.attr('title', getResultTitle(i));
                        }
                        taskItem.attr('status', task.status);
                    }//if
            }//for

            //更新清除按钮
            if( realTaskTotal ){
                $('#clearAll').css('display','block');
            }else{
                $('#clearAll').css('display','none');
            }
            
            //更新domainItem 统计信息
            
            $('#mainTable > thead').each(function(){
                miner.popup.updateStatistic($(this));
            });
            
            
            //测试云端连通性，更新欢迎页面
            var networkStatus = window.localStorage['global_data.networkStatus'];
            var captureTraffic = window.localStorage['global_data.captureTraffic'];
            switch (networkStatus)
            {
                case 'internal-on':
                    if(captureTraffic != 'off'){
                        if( window.localStorage['global_setting.task_mode'] == 'record' ){
                            task_mode_name = '录制模式';
                        }else{
                            task_mode_name = '实时模式';
                        }
                            
                        $("#prologue_title").text('已连接到云端，抓包已开启。当前模式为'+task_mode_name+"。");
                    }else{
                        $("#prologue_title").text('抓包尚未开启，点击"启动"按钮后开始捕捉流量。');
                    }
                    $("#loading").css('display','none');
                    break;
                case 'internal-off':
                    $("#prologue_title").text('您所处的网络环境不在公司内网中，无法连接到云端。');
                    $("#loading").css('display','none');
                    break;
                case 'external-off':
                    $("#prologue_title").text('您所处的网络环境不稳定，无法连接到云端。');
                    $("#loading").css('display','none');
                    break;
                default:
                    $("#prologue_title").text('欢迎使用安全扫描插件，正在连接到云端...');
                    $("#loading").css('display','inline');
                    break;
            }
            
            //如果一个任务都没有，则切换到欢迎页面
            if(!realTaskTotal){
                $("#mainTable").css('display','none');
                $("#prologue").css('display','block');
            }else{
                $("#prologue").css('display','none');
                //$("#mainTable").css('display','inline');
                $("#mainTable").removeAttr("style");
                $("#mainTable").accordion('refresh');
            }

            if( parseInt(window.localStorage['taskTotal']) >= parseInt(window.localStorage['global_setting.max_url_count_global']) ){
                $('#message').text('当前共'+localStorage['taskTotal']+'个任务，已达任务数量上限。');
            }else{
                $('#message').text('当前共'+localStorage['taskTotal']+'个任务。');
            }
            
            //提示版本更新
            var lastVersion = miner.popup.checkVersion();
            if( !miner.utils.empty(lastVersion) ){

                $("#update_version").attr('href', window.localStorage['version_info.updater']);
                $("#update_version").text('新版本'+lastVersion+'发布啦，请及时升级。');
                $("#update_version").css('display','inline');
            }else{
                $("#update_version").css('display','none');
                
            }
            
            
            //更新模式切换按钮
            if( window.localStorage['global_setting.task_mode'] == 'record' ){
                miner.popup.recordMode();
            }else{
                miner.popup.realtimeMode();               
            }           
            
            setTimeout(drawing, 1000);
        })();
    },
    checkVersion: function(){
        var lastVersion = window.localStorage['version_info.lastVersion'];
        if( miner.utils.empty(lastVersion) ){
            return null;
        }
        
        var currentVersion = window.localStorage['version_info.version'];
        var lastVersionArray = lastVersion.split('.');
        var currentVersionArray = currentVersion.split('.');
        
        for(var i=0; i<lastVersionArray.length; i++){
            if(lastVersionArray[i] > currentVersionArray[i]){
                return lastVersion;
            }
        }    
        return null;
    },
    getStatus: function (index, tid){
        var xmlHttp = new XMLHttpRequest();
        var apiUrl = "http://api.scan.baidu.com/tasks?token=174365a1c0c96259275924f7734351f5&id="+tid+"&start=0&count=1";
        xmlHttp.open("GET", apiUrl, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlHttp.onreadystatechange = function(){
            if (xmlHttp.readyState == 4) {
                switch (xmlHttp.status) {
                    case 200:
                        clearTimeout(xmlHttpTimeout);
                        var response = JSON.parse(xmlHttp.responseText);
                        //alert(xmlHttp.responseText);
                        if (response.status == 'ok'){
                            //alert(response.tasks[0].Status);
                            miner.popup.updateStatus(index, tid, response);
                        }else{
                            alert(xmlHttp.responseText);
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
            console.log('getStatus:ajaxTimeout|'+tid);
            xmlHttp.abort();
        }
        var xmlHttpTimeout = setTimeout(ajaxTimeout, 1000*180);
    },
    updateStatus: function(index, tid, statusObj){
        var status = statusObj.tasks[0].Status;
        var resultCount = statusObj.tasks[0].LVScanner.Result;
        var id = $('#responseList > tbody > tr[tid=' + tid + ']').attr('id');
        var task = JSON.parse(window.localStorage.getItem(id));
        //window.localStorage.setItem("map"+id, id+"-"+tid);
        
        $('#responseList > tbody > tr[tid=' + tid + ']').attr('status', status);
        
        if(status == 2){//任务已完成
            task.status = 2;
            task.result.sum = resultCount;
            window.localStorage.setItem(id, JSON.stringify(task));
            if(resultCount>0){//有漏洞
                 miner.popup.getResult(index, tid);
                $('#responseList > tbody > tr[tid=' + tid + '] > td > span[id="result"]').text(resultCount+'个漏洞 ');
                $('#responseList > tbody > tr[tid=' + tid + '] > td > span[id="status"]').text('危险').removeClass().addClass('badge badge-error result-badge');
            }else{//没有漏洞
                $('#responseList > tbody > tr[tid=' + tid + '] > td > span[id="result"]').text('0个漏洞 ');
                $('#responseList > tbody > tr[tid=' + tid + '] > td > span[id="status"]').text('安全').removeClass().addClass('badge badge-success result-badge');
            }
        }else{//任务还在运行
            $('#responseList > tbody > tr[tid=' + tid + '] > td > span[id="result"]').text(resultCount+'个漏洞 ');
            $('#responseList > tbody > tr[tid=' + tid + '] > td > span[id="status"]').text('检测中').removeClass().addClass('badge badge-important result-badge');
        }
    },
    getResult: function (index, tid){
        var xmlHttp = new XMLHttpRequest();
        var apiUrl = "http://api.scan.baidu.com/tasks/"+tid+"/scan_results/vulnerability?token=174365a1c0c96259275924f7734351f5";
        xmlHttp.open("GET", apiUrl, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xmlHttp.onreadystatechange = function(){
            if (xmlHttp.readyState == 4) {
                switch (xmlHttp.status) {
                    case 200:
                        clearTimeout(xmlHttpTimeout);
                        var response = JSON.parse(xmlHttp.responseText);

                        if (response.status == 'ok'){
                            //alert(xmlHttp.responseText);
                            //window.localStorage.setItem("getResult", " miner.popup.updateResult("+tid+")");
                            miner.popup.updateResult(index, tid, response);
                        }else{
                            alert(xmlHttp.responseText);
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
             console.log('getResult:ajaxTimeout|'+tid);
            xmlHttp.abort();
        }
        var xmlHttpTimeout = setTimeout(ajaxTimeout, 1000*180);
    },
    updateResult: function(index, tid, resultObj){
        //window.localStorage.setItem("updateResult", " miner.popup.notify("+tid+")");
        miner.popup.notify(index, tid, resultObj);   
    },
    notify: function(index, tid, resultObj) {
        var vulItems = [];
        //alert(JSON.stringify(resultObj));
        for(var i=0; i<resultObj.results.length; i++){
            vulItems[i] = {};
            vulItems[i].title = "类型:" + resultObj.results[i].Type + " 链接:" + resultObj.results[i].Url;
            if(resultObj.results[i].VulKey){
                vulItems[i].title += " 参数:" + resultObj.results[i].VulKey;
            }
            vulItems[i].message = "";//链接:" + resultObj.results[i].Url + " 参数:" + resultObj.results[i].VulKey;
        }
        //alert(JSON.stringify(vulItems));
        var options = {
            type: "list",
            title: "任务" + index + " 发现" + resultObj.sum +"个安全漏洞!",
            message: "Primary message to display",
            iconUrl: "../icon/saolei_logo_128.png",
            items: vulItems
        };
        
        var now = new Date();
        var notificationId = "" + now.getTime();
        chrome.notifications.create(notificationId, options, function(notificationId) {});    
    },
    captureTrafficOn: function() {
        this.backgroundPage().miner.loader.unbindEvents();
        this.backgroundPage().miner.loader.bindEvents();
        this.backgroundPage().miner.global_data.captureTraffic = 'on';
        window.localStorage.setItem('global_data.captureTraffic', this.backgroundPage().miner.global_data.captureTraffic);
        //window.localStorage.setItem('onWebRequest', chrome.webRequest.onHeadersReceived.hasListener(this.backgroundPage().miner.loader.onHeadersReceived));
    },
    captureTrafficOff: function() {
        this.backgroundPage().miner.loader.unbindEvents();
        this.backgroundPage().miner.global_data.captureTraffic = 'off';
        window.localStorage.setItem('global_data.captureTraffic', this.backgroundPage().miner.global_data.captureTraffic);
        //window.localStorage.setItem('onWebRequest', chrome.webRequest.onHeadersReceived.hasListener(this.backgroundPage().miner.loader.onHeadersReceived));
    },
    playOn: function() {
        this.backgroundPage().miner.task_manager.play();
        
        this.backgroundPage().miner.global_data.play = 'on';
        window.localStorage['global_data.play'] = this.backgroundPage().miner.global_data.play;
        
        $("#play").children("i").removeClass("icon-play").addClass("icon-stop");
        $("#play").html('<i class="icon-stop"></i>停止');
        $("#play").attr('title', '停止播放已录制的流量');
    },
    playOff: function() {
        this.backgroundPage().miner.global_data.play = 'off';
        window.localStorage['global_data.play'] = this.backgroundPage().miner.global_data.play;
        
        $("#play").children("i").removeClass("icon-stop").addClass("icon-play");
        $("#play").html('<i class="icon-play"></i>播放');
        $("#play").attr('title', '回放录制的流量进行扫描');
    },
    realtimeMode: function() {
        //切换到实时模式
        window.localStorage['global_setting.task_mode'] = 'realtime';
        //$("#modeShift").parent().removeClass("active");
        $("#modeShift").children("i").removeClass("icon-time").addClass("icon-film");
        $("#modeShift").html('<i class="icon-film"></i>切换到录制模式');
        $("#modeShift").attr('title', '录制流量（先不扫描），点击"播放"按钮后统一进行扫描。录制模式自动抓取并携带cookie!');
        $('#play').css('display','none');  
    },
    recordMode: function() {
        //切换到录制模式
        window.localStorage['global_setting.task_mode'] = 'record';
        //$("#modeShift").parent().addClass("active");
        $("#modeShift").children("i").removeClass("icon-film").addClass("icon-time");
        $("#modeShift").html('<i class="icon-time"></i>切换到实时模式');
        $("#modeShift").attr('title', '实时抓取流量并扫描');
        $('#play').css('display','block'); 
    }
};

var g_lastAccordionIndex;
//UI事件处理函数
$(function(){
    miner.popup.init();
    miner.popup.draw(5);
    //miner.popup.monitor();
    
    $("#capture").click(function() {
        if( $("#capture").parent().hasClass("active") ){
            //由关闭切到启动
            miner.popup.captureTrafficOn();
            $("#capture").parent().removeClass("active");
            $("#capture").children("i").removeClass("icon-ok-circle").addClass("icon-ban-circle");
            $("#capture").html('<i class="icon-ban-circle"></i>关闭');
        }else{
            miner.popup.captureTrafficOff();
            $("#capture").parent().addClass("active");
            $("#capture").children("i").removeClass("icon-ban-circle").addClass("icon-ok-circle");
            $("#capture").html('<i class="icon-ok-circle"></i>启动');            
        }
    });
    
    $("#play").click(function() {
        
        if( $("#play").children("i").hasClass("icon-play") ){
            //开始播放
            miner.popup.playOn();
        }else{
            //停止播放
            miner.popup.playOff();
        }
        
    });
    
    $("#settings").click(function() {
        chrome.tabs.create({url: "html/options.html"});
    });

    $("#help").click(function() {
        chrome.tabs.create({url: "http://bb-art-ite02.bb01.baidu.com:8901/SSLPortal_Client/sslimages/2/root/ssl/product/80f655f6-707a-4458-828d-05fda81e810c/chrome%E5%AE%89%E5%85%A8%E6%89%AB%E6%8F%8F%E6%8F%92%E4%BB%B6%E7%94%A8%E6%88%B7%E6%89%8B%E5%86%8C.pdf"});
    });
    
    $("#modeShift").click(function() {

        if( $("#modeShift").children("i").hasClass("icon-time") ){
            //切换到实时模式

            miner.popup.realtimeMode();
        }else{
            //切换到录制模式
            miner.popup.recordMode();
            
            miner.popup.playOff();
            $("#play").children("i").removeClass("icon-stop").addClass("icon-play");
            $("#play").html('<i class="icon-play"></i>播放');
            $("#play").attr('title', '回放录制的流量进行扫描');           
        }
    });
    
    
    //所有表格元素事件都托管到mainTable
    $("#mainTable").click(function(event) {
    
        function showResultByStatus(statusList, isVul){
            var thead = $(event.target).closest('thead');
                var tbody = thead.next();
                if( tbody.length > 0 ){
                    tbody.find('tr > td > table > tbody > tr').each(function(){
                        var task = JSON.parse(window.localStorage[$(this).attr('id')]);
                        $(this).css('display', 'none');
                        for(var i=0; i<statusList.length; i++){
                            if(task.status == statusList[i]){
                                if( null != isVul ){
                                    if( isVul == true && task.result.sum > 0 ){    
                                        $(this).css('display', 'inline');
                                    }else if( isVul == false && task.result.sum == 0 ){
                                        $(this).css('display', 'inline');
                                    }
                                }else{
                                    $(this).css('display', 'inline');
                                }
                                break;
                            }
                        }
                    });
                }
        };

        if( $(event.target).is('th') && $(event.target).hasClass('remove') ){
            //删除domainItem
            var thead = $(event.target).closest('thead');
            var tbody = thead.next();
            if( tbody.length > 0 ){
                tbody.find('tr > td > table > tbody > tr').each(function(){
                    miner.task_manager.remove( $(this).attr('id') );
                });
                thead.remove();
                tbody.remove();
            }
            
            $("#mainTable").accordion('option', 'active', false);//防止点击删除按钮后accordion展开。
            event.stopPropagation();
            event.preventDefault();
        }else if( $(event.target).is('i') && $(event.target).hasClass('icon-th-list') ){
            //查看详细信息
            var tr = $(event.target).closest('tr');
            miner.task_manager.openReport(tr.attr('id'));
            event.stopPropagation();
            event.preventDefault();
        }else if( $(event.target).is('i') && $(event.target).hasClass('icon-remove') ){
            //删除taskItem
            var tr = $(event.target).closest('tr');
            miner.task_manager.remove( tr.attr('id') );
            tr.remove();
            event.stopPropagation();
            event.preventDefault();
        }else if( $(event.target).is('span') && $(event.target).hasClass('btn') ){
            //show special status task item
            if( $(event.target).hasClass('btn-info') ){
                showResultByStatus([-2]);
            }else if( $(event.target).hasClass('btn-default') ){
                showResultByStatus([-1,0,1]);
            }else if( $(event.target).hasClass('btn-success') ){
                showResultByStatus([2], false);
            }else if( $(event.target).hasClass('btn-danger') ){
                showResultByStatus([2], true);
            }else if( $(event.target).hasClass('btn-inverse') ){
                showResultByStatus([3,4,5]);
            }

            var accordionIndex = $("#mainTable").accordion('option', 'active');
            if( false === accordionIndex){
                //如果accordion将要关闭，则展开。
                $("#mainTable").accordion('option', 'active', g_lastAccordionIndex);
            }else{
                g_lastAccordionIndex = accordionIndex;
            }
            event.stopPropagation();
            event.preventDefault();
        }else{
            //show all task item
            var thead = $(event.target).closest('thead');
            var tbody = thead.next();
            if( tbody.length > 0 ){
                tbody.find('tr > td > table > tbody > tr').each(function(){
                    $(this).css('display', 'inline');
                });
            }
            
            var accordionIndex = $("#mainTable").accordion('option', 'active');
            if( false !== accordionIndex){
                g_lastAccordionIndex = accordionIndex;
            }
        }
        
        //event.stopPropagation();
        //event.preventDefault();
    });   
    
    $("mainTable").dblclick(function(event) {
        if( $(event.target).is('tr') && $(event.target).hasClass('taskItem') ){
            miner.task_manager.openReport($(event.target).attr('id'));
        };
    });
    
    $("#clearAll").click(function() {
        //window.localStorage.clear();
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
        $("#mainTable > thead").remove();
        $("#mainTable > tbody").remove();
        
        chrome.extension.getBackgroundPage().miner.task_manager.taskTotal = 0;
        window.localStorage['taskTotal'] = 0;
    });
    
    $("#saolei_url").click(function() {
        chrome.tabs.create({url: $(this).attr('href')});
    });

    $("#update_version").click(function() {
        chrome.tabs.create({url: $(this).attr('href')});
    });
    
    $("#help").click(function() {

        return;
        
        var now = new Date();
        var notificationId = "" + now.getTime();
        var options = {
            type: "basic",
            title: "Primary Title",
            message: "Primary message to display",
            iconUrl: "../icon/saolei_logo_128.png"
        };
        var options1 = {
            type: 'list',
            title: 'Primary Title',
            message: 'Primary message to display',
            iconUrl: '../img/exclamation-red.png',
            items: [{ title: "Item1", message: "This is item 1."},
                  { title: "Item2", message: "This is item 2."}],
            buttons: [{ title: '查看详情', iconUrl: '../icon/saolei_logo_48.png'}]
        }
        chrome.notifications.onButtonClicked.addListener(function onButtonClicked(_notificationId){
            if(notificationId == _notificationId){
                chrome.tabs.create({url: "http://scan.baidu.com"});
            }
        });
        chrome.notifications.create(notificationId, options1, function(notificationId) {});
        //miner.popup.submitTask(1, 'http://www.baidu.com', "GET", null)
        return;
   
    });
    
    $("#sendMail").click(function() {
        chrome.tabs.create({url: "mailto:zhaodaichong@baidu.com?cc=ssl-scan@baidu.com&subject=chrome浏览器安全扫描插件反馈"}, function(tab){});
    });
});