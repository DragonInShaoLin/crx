function UsageMetrics(g,k,m,n,p){function l(b){if(navigator.onLine){var d=0,c=0,k;for(k in a){var g=parseInt(k);d++;g>c&&(c=g)}0<d?e(d,c,b):b&&b()}else b&&b()}function e(b,d,e){function l(b,k){if(b){a=[];d>c&&(c=d);var f=Persistent.get("uploaded");f||(f={});f[h.userId]=b.uploaded;Persistent.set("uploaded",f);var f=Persistent.get("savedAuthInfo"),g=Persistent.get("shownNearQuotaUpsell");f&&f.userInfo&&f.userInfo[h.userId]&&f.userInfo[h.userId].monthEnd&&f.userInfo[h.userId].monthEnd<new Date&&(f.userInfo[h.userId].monthEnd+=
2592E6,g||(g={}),delete g[h.userId],Persistent.set("shownNearQuotaUpsell",g));Persistent.set("savedAuthInfo",f)}e&&e()}function r(){q.client.NoteStore.getSyncStateWithMetrics(l,h.authenticationToken,{sessions:b})}var h,q;k(function(a){(h=a)&&h.authenticationToken?(q=new JsonRpc(null,["NoteStore.getSyncStateWithMetrics"],g,m,n,p),q.initWithAuthToken(h.authenticationToken,r)):(log.warn("Tried to send UsageMetrics, but not logged in."),e&&e())})}var c=0,a={};this.recordActivity=function(b){var d;d=new Date;
var e=15*Math.floor(d.getMinutes()/15);d.setMinutes(e);d.setSeconds(0);d.setMilliseconds(0);d=Math.round(d.getTime()/1E3);c>=d?b&&b():(a[d]=!0,l(b))};this.send=l;this.getJson=function(){var b={};b.lastSent=c;b.activityBlocks={};for(var d in a)b.activityBlocks[d]=a[d];return b};this.importFromJson=function(b){try{c=b.lastSent,a=b.activityBlocks}catch(d){c=0,a={},log.warn("Failed to import saved UsageMetrics from JSON object.")}};Object.preventExtensions(this)}Object.preventExtensions(UsageMetrics);
function UsageMetricsManager(g,k,m,n,p){function l(){var c={},a;for(a in e)c[a]=e[a].getJson();Persistent.set("usageMetrics",c)}var e={};(function(){try{var c=Persistent.get("usageMetrics"),a;for(a in c)e[a]=new UsageMetrics(g,k,m,n,p),e[a].importFromJson(c[a])}catch(b){log.warn("Failure restoring usage metrics. Setting blank."),e={}}})();this.recordActivity=function(){var c="";k(function(a){a&&(c=a.username);c&&(a=e[c],a||(a=new UsageMetrics(g,k,m,n,p),e[c]=a),a.recordActivity(l))})};Object.preventExtensions(this)}
Object.preventExtensions(UsageMetricsManager);