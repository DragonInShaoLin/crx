function NoteSnippets(n,l,v,w,p,k,x,q,r){function s(a,e){a&&(g=a);m=e;g&&0!=g.length&&t(g)}function t(a){var e=n;if(e){e.innerHTML="";var b,c;for(c in a){q||0!=c%3||(b=document.createElement("div"),b.className="row",e.appendChild(b));var d=document.createElement("div");d.className="container";d.appendChild(y(a[c],c));var f;f=a[c];if(f.contact||f.notebookName){u=!0;var h=document.createElement("div");h.className=f.contact?"contactName":"notebookName";h.innerText=f.contact||f.notebookName;h.title=h.innerText;
f=h}else f=null;f&&d.appendChild(f);q?e.appendChild(d):b.appendChild(d)}m&&m>a.length&&e.appendChild(z())}}function z(){var a=m-g.length,a=1==a?Browser.i18n.getMessage("popup_oneMoreNoteLink"):Browser.i18n.getMessage("popup_moreNotesLink",[a]),e=document.createElement("div");e.className="moreOnServer";e.addEventListener("click",function(){Browser.sendToExtension({name:"main_recordActivity"});var a=l+"/SetAuthToken.action?auth="+encodeURIComponent(k.pers)+"&targetUrl="+encodeURIComponent("/Home.action#x="+
x);Browser.sendToExtension({name:"main_openTab",url:a})});e.innerHTML=a;return e}function A(a){var e=navigator.language,b="Sunday Monday Tuesday Wednesday Thursday Friday Saturday".split(" "),c=new Date;if(a.getMonth()===c.getMonth()&&a.getDate()===c.getDate()&&a.getFullYear()===c.getFullYear())return Browser.i18n.getMessage("Today");if(6048E5>=c.valueOf()-a.valueOf()&&c.getDay()!==a.getDay())return Browser.i18n.getMessage(b[a.getDay()]);b="%day %monthName %year";c=a.getDate();e.match(/en-us/i)&&
(b="%monthName %day, %year",c=1==c||21==c||31==c?c+"st":2==c||22==c?c+"nd":3==c||23==c?c+"rd":c+"th");e.match(/^zh/i)?b="%year\u5e74%month\u6708%day\u65e5":e.match(/^ja/i)&&(b="%year\u5e74%monthName%day\u65e5");b=b.replace(/%day/,c);b=b.replace(/%year/,a.getFullYear());b=b.replace(/%monthName/,Browser.i18n.getMessage("Jan Feb March April May June July Aug Sept Oct Nov Dec".split(" ")[a.getMonth()]));return b=b.replace(/%month/,a.getMonth()+1)}function y(a,e){var b,c=document.createElement("div");
"expert"==a.type?(c.className="expert",c.addEventListener("click",function(){Browser.sendToExtension({name:"main_recordActivity"});GlobalUtils.openDesktopLink("evernote://business/user/"+a.id)})):(c.className="noteBlock",c.addEventListener("click",function(){Browser.sendToExtension({name:"main_recordActivity"});r&&r(a.guid,a.inBusinessNotebook);var b=p;if(a.notebookName||a.contact)b="WEB";var c=GlobalUtils.getNoteURI(b,l,{shardId:a.shardId||w,noteGuid:a.guid,inBusinessNotebook:a.inBusinessNotebook,
notebookGuid:a.notebookGuid,linkedNotebookGuid:a.linkedNotebookGuid,shareKey:a.shareKey},"view",v,a.updateSequenceNum,k);"WEB"==b?Browser.sendToExtension({name:"main_openWindow",width:800,height:600,url:c}):"DESKTOP"==p&&GlobalUtils.openDesktopLink(c)}));if("expert"==a.type)b=document.createElement("img"),b.className="smallimage",b.setAttribute("guid",a.id),Browser.sendToExtension({name:"downloadThumbnail",guid:a.id,biz:!0,tokens:k,url:l+"/SetAuthToken.action?auth="+encodeURIComponent(k.pers)+"&targetUrl="+
encodeURIComponent("/user/"+a.id+"/photo?size=60")});else if(a.thumbsquare){var d=110;1.5<=devicePixelRatio&&(d*=2);b=document.createElement("img");a.snippet&&(d=60,1.5<=devicePixelRatio&&(d*=2),b.className="smallimage");a.inBusinessNotebook&&(a.thumbsquare=a.thumbsquare.replace("/thm","/business/dispatch/thm"));b.setAttribute("guid",a.guid);Browser.sendToExtension({name:"downloadThumbnail",guid:a.guid,biz:a.inBusinessNotebook,size:d,tokens:k,url:l+"/SetAuthToken.action?auth="+encodeURIComponent(k.pers)+
"&targetUrl="+encodeURIComponent(a.thumbsquare)})}d=document.createElement("div");d.className="snippet";if(a.snippet){var f=document.createElement("p");f.innerHTML=a.snippet;f.className="snippettext";a.thumbsquare&&(f.className+=" mixed")}var h=document.createElement("h1");h.textContent=a.title;if("expert"==a.type)d.appendChild(b),b=document.createElement("div"),b.className="divider",d.appendChild(b),d.appendChild(h),a.role&&(b=document.createElement("div"),b.textContent=a.role,b.className="role",
d.appendChild(b)),b=document.createElement("a"),b.className="seeMoreLink",b.textContent=Browser.i18n.getMessage("seeMore"),d.appendChild(b);else{var g=document.createElement("p");g.textContent=A(new Date(a.updated));g.className="date";d.appendChild(h);d.appendChild(g);a.snippet&&d.appendChild(f);a.thumbsquare&&d.appendChild(b)}c.appendChild(d);return c}var g,m=0,u=!1;s();this.setNotes=s;this.show=function(){};this.renderBlocks=t;this.hasAtLeastOneNotebookName=function(){return u};Browser.addMessageHandlers({receiveThumbnail:function(a,
e,b){if(e=n.querySelector("img[guid='"+a.guid+"']"))e.src=a.datauri,e.removeAttribute("guid")}});Object.preventExtensions(this)}Object.preventExtensions(NoteSnippets);