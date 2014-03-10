/*
chrome.tabs.onUpdated.addListener(function(tabId, changedInfo, tab) {
    //alert("tabId:"+tabId+", changedInfo:" + changedInfo + ", url:" + tab.url); 
    
    if( tab.url.toLowerCase().indexOf("www.baidu.com") >= 0 )
        chrome.tabs.update(tabId, {"url" : "http://www.sohu.com"}, function(){});
});
*/

miner.main = {
	delegateMessages: function(request, sender, sendResponse){
		switch (request.action) {
			case "miner_request":
                break;
			default:
				break;
		}
	}
};

chrome.extension.onMessage.addListener(miner.main.delegateMessages);

