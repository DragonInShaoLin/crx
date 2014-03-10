miner.utils = {
    getAssocArrayLength: function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    },
    trim: function(stringObj){
        return stringObj.replace(/^\s+|\s+$/g, '');
    },
    empty: function(stringObj){
        return (!stringObj || '' == stringObj || 'undefined' == stringObj || 'null' == stringObj);
    },
    genGuid: function (){
        var guid = "";
        for (var i = 1; i <= 32; i++){
          var n = Math.floor(Math.random()*16.0).toString(16);
          guid +=   n;
          if((i==8)||(i==12)||(i==16)||(i==20))
            guid += "-";
        }
        return guid;    
    },
    getIP: function (){
        var RTCPeerConnection = /*window.RTCPeerConnection ||*/ window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
        if (RTCPeerConnection){
            var rtc = new RTCPeerConnection({iceServers:[]});
            if (window.mozRTCPeerConnection) {      // FF needs a channel/stream to proceed
                rtc.createDataChannel('', {reliable:false});
            };
            
            rtc.onicecandidate = function (evt) {
                if (evt.candidate){
                    userIP = grepSDP(evt.candidate.candidate);
                }
            };
            rtc.createOffer(function (offerDesc) {
                userIP = grepSDP(offerDesc.sdp);
                rtc.setLocalDescription(offerDesc);
            }, function (e) { console.warn("offer failed", e); });
            
            
            var addrs = Object.create(null);
            addrs["0.0.0.0"] = false;
            
            function updateDisplay(newAddr) {
                if (newAddr in addrs) return;
                else addrs[newAddr] = true;
                var displayAddrs = Object.keys(addrs).filter(function (k) { return addrs[k]; });
                var ip = displayAddrs.join(" or perhaps ") || "n/a";
                window.localStorage['global_data.ip'] = ip;
            }
            
            function grepSDP(sdp) {
                var hosts = [];
                sdp.split('\r\n').forEach(function (line) { // c.f. http://tools.ietf.org/html/rfc4566#page-39
                    if (~line.indexOf("a=candidate")) {     // http://tools.ietf.org/html/rfc4566#section-5.13
                        var parts = line.split(' '),        // http://tools.ietf.org/html/rfc5245#section-15.1
                            addr = parts[4],
                            type = parts[7];
                        if (type === 'host'){
                            updateDisplay(addr);
                        }
                    } else if (~line.indexOf("c=")) {       // http://tools.ietf.org/html/rfc4566#section-5.7
                        var parts = line.split(' '),
                            addr = parts[2];
                        updateDisplay(addr);
                    }
                });
            }
        }
    }
};