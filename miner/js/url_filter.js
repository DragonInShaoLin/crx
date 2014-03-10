includeList = [
  'baidu.com',
   'baidu.com.cn',
   'baidu.cn',
  'hao123.com',
   'hao123.com.cn',
   'hao123.cn'
];

suffixIncludeList = [
    'do',
    'action',
    'swf'
];

miner.url_filter = {

    parseUrl: function (url) {
      var loc = {
        'href': url
      };
      var parts = url.replace('//', '/').split('/');
      loc.protocol = parts[0].substring(0, parts[0].length - 1);
      loc.host = parts[1];
      parts[1] = parts[1].split(':');
      loc.hostname = parts[1][0];
      return loc;
    },

    getHostName: function (url) {
      if (!url || !url.length) {
        return null;
      }
      var parsed = this.parseUrl(url);
      if (!parsed || !parsed.host || !this.isSupportedScheme(parsed.protocol)) {
        return null;
      }
      var hostname = parsed.hostname;//.replace(/^www\./i, '');
      hostname = hostname.toLowerCase();
      if (!hostname) {
        return null;
      }
      if (this.isPrivate(hostname)) return false;
      return hostname;
    },

    getUrlMode: function(url){
        url = URI(url);
        var query = url.query();
        url = url.query('');
        
        var paramArray = query.split('&');
        var queryMode = '';

        for( var i in paramArray ){
            if( paramArray[i] ){
                kv = paramArray[i].split('=');
                if(kv && kv[0]){
                    queryMode += kv[0] + '&';
                }
            }
        }
        return url.query(queryMode).normalize().toString();
    },
    
    isSupportedScheme: function (scheme) {
      try {
        return /^(https?|ftp|mms|rtsp)$/i.test(scheme);
      } catch (e) {}
      return false;
    },

    isPrivate: function (url) {
      if (!navigator.onLine) return true;
      try {
        //return /^(localhost|((10|127)\.\d+|(172\.(1[6-9]|2[0-9]|3[01])|192\.168))\.\d+\.\d+)$/.test(url);
        return /^(localhost|(127\.\d+|(192\.168))\.\d+\.\d+)$/.test(url);
      } catch (e) {}
      return false;
    },
    
    isPath: function (url){
        url = URI(url);
        if( miner.utils.empty( url.suffix() ) && miner.utils.empty( url.query() ) ){
            return true;
        }
        
        return false;
    },
    
    isInvalidSuffix: function (url){
        url = URI(url);

        if( !miner.utils.empty( url.query() ) ){
            //只要后参数，都视为有效后缀。
            return false;
        }
        
        for( var i in suffixIncludeList ){
            if( url.suffix() == suffixIncludeList[i] ){
                return false;
            }
        }
        return true;
    },
    
    isInclude: function (url) {
        if(includeList.indexOf( this.getHostName(url) ) > -1){
            return true;
        }
    }

  };