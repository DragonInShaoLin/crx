
miner.request_manager = {
    requestQueue:{
        "http://www.baidu.com":{
            "http://www.baidu.com/x?a=1":{"method": "GET", "cookie": "", "startTime":"", "result":""},
            "http://www.baidu.com/y?a=1":{"method": "GET", "cookie": "", "startTime":"", "result":""},
            "http://www.baidu.com/z?a=1":{"method": "GET", "cookie": "", "startTime":"", "result":""}
        },
        "http://tieba.baidu.com":{
            "http://tieba.baidu.com/x?a=1":{"method": "GET", "cookie": "", "startTime":"", "result":""},
            "http://tieba.baidu.com/y?a=1":{"method": "GET", "cookie": "", "startTime":"", "result":""},
            "http://tieba.baidu.com/z?a=1":{"method": "GET", "cookie": "", "startTime":"", "result":""}          
        }
    },
    
    add: function (url, method, details){
        var domain =  miner.url_filter.getHostName(url);
        
        //Add url first time
        if( domain && null == this.requestQueue.domain ){
            this.requestQueue.domain = {};
        }
        
        var now = new Date();
        //Already has the same url
        if( this.requestQueue.domain.url ){
            if( now.getTime() < (this.requestQueue.domain.url.startTime + miner.global_data.urlFreshness * 1000) ){
                return true;
            }
        }
        
        this.requestQueue.domain.url = {"method": method, "cookie": details.responseHeaders.Cookie, "startTime": now.getTime(), "result": ""};
    },
    
    remove: function (url, method, details){
        var domain =  miner.url_filter.getHostName(url);
        
        if( domain && null == this.requestQueue.domain ){
            return true;
        }
        
        if( this.requestQueue.domain.url ){
            delete this.requestQueue.domain.url;
        }
        if( 0 == miner.utils.getAssocArrayLength(this.requestQueue.domain) ){
            delete this.requestQueue.domain;
        }
        
    
    },
    
    clear: function (){
        for( key in this.requestQueue ){
            delete this.requestQueue[key];
        }
    },
    
    isExist: function (url){
         var domain =  miner.url_filter.getHostName(url);
         if( domain && this.requestQueue.domain && this.requestQueue.domain.url ){
            return true;
        }
        return false;
    },
    
    check: function (url, method, details){
    
    }
    
}