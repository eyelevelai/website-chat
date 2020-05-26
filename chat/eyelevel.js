try {
  const remoteURL = 'https://cdn.eyelevel.ai/chat';
  const chatURL = 'https://cdn.eyelevel.ai/chat';
  const cssURL = 'https://css.eyelevel.ai';

  function supportsPassive() {
    var cold = false,
    hike = function() {};

    try {
      var aid = Object.defineProperty({}, 'passive', {
        get: function() {
          cold = true;
        }
      });
      window.addEventListener('test', hike, aid);
      window.removeEventListener('test', hike, aid);
    } catch (e) {}
    return cold;
  }

  function randomString(length) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for(var i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  function getWidth() {
    return Math.max(
      document.body.scrollWidth,
      document.documentElement.scrollWidth,
      document.body.offsetWidth,
      document.documentElement.offsetWidth,
      document.documentElement.clientWidth
    );
  }

if (!window.localStorage) {
  Object.defineProperty(window, "localStorage", new (function () {
    var aKeys = [], oStorage = {};
    Object.defineProperty(oStorage, "getItem", {
      value: function (sKey) { return sKey ? this[sKey] : null; },
      writable: false,
      configurable: false,
      enumerable: false
    });
    Object.defineProperty(oStorage, "key", {
      value: function (nKeyId) { return aKeys[nKeyId]; },
      writable: false,
      configurable: false,
      enumerable: false
    });
    Object.defineProperty(oStorage, "setItem", {
      value: function (sKey, sValue) {
        if(!sKey) { return; }
        document.cookie = escape(sKey) + "=" + escape(sValue) + "; expires=Tue, 19 Jan 2038 03:14:07 GMT; path=/";
      },
      writable: false,
      configurable: false,
      enumerable: false
    });
    Object.defineProperty(oStorage, "length", {
      get: function () { return aKeys.length; },
      configurable: false,
      enumerable: false
    });
    Object.defineProperty(oStorage, "removeItem", {
      value: function (sKey) {
        if(!sKey) { return; }
        document.cookie = escape(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
      },
      writable: false,
      configurable: false,
      enumerable: false
    });
    this.get = function () {
      var iThisIndx;
      for (var sKey in oStorage) {
        iThisIndx = aKeys.indexOf(sKey);
        if (iThisIndx === -1) { oStorage.setItem(sKey, oStorage[sKey]); }
        else { aKeys.splice(iThisIndx, 1); }
        delete oStorage[sKey];
      }
      for (aKeys; aKeys.length > 0; aKeys.splice(0, 1)) { oStorage.removeItem(aKeys[0]); }
      for (var aCouple, iKey, nIdx = 0, aCouples = document.cookie.split(/\s*;\s*/); nIdx < aCouples.length; nIdx++) {
        aCouple = aCouples[nIdx].split(/\s*=\s*/);
        if (aCouple.length > 1) {
          oStorage[iKey = unescape(aCouple[0])] = unescape(aCouple[1]);
          aKeys.push(iKey);
        }
      }
      return oStorage;
    };
    this.configurable = false;
    this.enumerable = true;
  })());
}
//window.localStorage.removeItem('eyelevel.conversation.history');

(function() {
  var cooldown = false;

  window.getUser = function() {
    var userId = window.localStorage.getItem('eyelevel.user.userId');
    var newUser = false;
    if (!userId) {
      newUser = true;
      userId = randomString(32);
      window.localStorage.setItem('eyelevel.user.userId', userId);
    }
    return { userId: userId, newUser: newUser };
  }

  function toggleChat(e) {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    var width = getWidth();
    var cb = document.getElementById("eyBubble");
    if (cb.classList.contains("ey-app-open")) {
      cb.classList.remove("ey-app-open");
      var cw = document.getElementById("eySection");
      cw.classList.remove("ey-section-visible");
      cw.classList.add("ey-section-invisible");
      if (typeof mixpanel !== 'undefined') {
        mixpanel.track("Close Chat", { host: window.location.host, pathname: window.location.pathname, uid: window.getUser().userId, username: window.eyusername, flowname: window.eyflowname });
      }
      setTimeout(function() {
        var eis = document.getElementById("eyAppFrame");
        eis = eis.contentWindow || ( eis.contentDocument.document || eis.contentDocument);
        eis.postMessage("close", "*");
      }, 200);
    } else {
      cb.classList.add("ey-app-open");
      var cw = document.getElementById("eySection");
      cw.classList.remove("ey-section-invisible");
      cw.classList.add("ey-section-visible");
      if (typeof mixpanel !== "undefined") {
        mixpanel.track("Open Chat", { host: window.location.host, pathname: window.location.pathname, uid: window.getUser().userId, username: window.eyusername, flowname: window.eyflowname });
      }
      setTimeout(function() {
        var is = document.getElementById("eyFrame");
        is = is.contentWindow || ( is.contentDocument.document || is.contentDocument);
        is.postMessage("open", "*");
        var eis = document.getElementById("eyAppFrame");
        eis = eis.contentWindow || ( eis.contentDocument.document || eis.contentDocument);
        eis.postMessage("open", "*");
      }, 200);
    }
  }

  var eyelevel = {
    init: function(params) {
      var username = params.username;
      var flowname = params.flowname;
      var shouldOpen = params.state && params.state === "open";
      var userId = window.getUser().userId;
      if (window.location.host.indexOf('eyelevel.ai') < 0 && typeof mixpanel !== 'undefined') {
        mixpanel.identify(userId);
        mixpanel.track("Page Loaded", { host: window.location.host, pathname: window.location.pathname, uid: userId, username: window.eyusername, flowname: window.eyflowname });
      }

      if (!window.WebSocket || !window.addEventListener) {
        if (typeof mixpanel !== 'undefined') {
          mixpanel.track("Chat Not Shown", { host: window.location.host, pathname: window.location.pathname, uid: userId, username: window.eyusername, flowname: window.eyflowname });
        }
        return;
      }
      if (!shouldOpen) {
        var eb = document.createElement("section");
        eb.id = "eyBubble";
        eb.classList.add("ey-app");
        eb.innerHTML = '<iframe id="eyAppFrame" class="ey-app-container ey-iframe"></iframe>';
        document.body.appendChild(eb);
        var isn = document.getElementById("eyAppFrame");
        isn = isn.contentWindow || ( isn.contentDocument.document || isn.contentDocument);
        isn.document.open();
        isn.document.write('<!DOCTYPE html><html><head><base target="_parent"></base><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{overflow:hidden;}@keyframes growIcon{from{transform: scale(0);-webkit-transform:scale(0);-moz-transform:scale(0);-ms-transform:scale(0);-o-transform:scale(0);}to{transform:scale(1);-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);-o-transform:scale(1);}}.ey-app-icon-container{position:relative;}.ey-app-icon-active{height:90px;width:90px;animation:growIcon 0.1s;-webkit-animation:growIcon 0.1s;-ms-animation:growIcon 0.1s;-o-animation:growIcon 0.1s;-moz-animation:growIcon 0.1s;}.ey-app-icon-inactive{width:0;height:0;animation:growIcon 0.1s;-webkit-animation:growIcon 0.1s;-ms-animation:growIcon 0.1s;-moz-animation:growIcon 0.1s;-o-animation:growIcon 0.1s;}.ey-app-icon-inactive svg{width:0;height:0;}.ey-close-btn {position: absolute;top:-4px;left:0;font-size:60px;color:transparent;text-shadow: 0 0 0 #7197c9;display:flex;justify-content:center;align-items:center;}.ey-close-btn svg{margin:0;position:absolute;top:50%;left:50%;margin-right:-50%;transform:translate(-50%,-50%);-webkit-transform:translate3d(-50%,-50%,0);-moz-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);}.ey-icon-btn{position:absolute;top:-3px;left:0;}.ey-icon-btn svg{margin:0;position:absolute;top:50%;left:50%;margin-right:-50%;transform:translate(-50%,-50%);-webkit-transform:translate3d(-50%,-50%,0);-moz-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);}</style>' + (username ? '<link href="' + cssURL + '/' + username + '/bubble.css" rel="stylesheet" type="text/css">' : '') + (flowname ? '<link href="' + cssURL + '/' + flowname + '/bubble.css" rel="stylesheet" type="text/css">'  : '') + '<script>window.addEventListener("message", function(e){if(e && e.data === "open"){var ci = document.getElementById("eyChatOpen");ci.classList.remove("ey-app-icon-active");void ci.offsetWidth;ci.classList.add("ey-app-icon-inactive");var cbi = document.getElementById("eyChatClose");cbi.classList.remove("ey-app-icon-inactive");void cbi.offsetWidth;cbi.classList.add("ey-app-icon-active");}else{var ci = document.getElementById("eyChatOpen");ci.classList.remove("ey-app-icon-inactive");void ci.offsetWidth;ci.classList.add("ey-app-icon-active");var cbi = document.getElementById("eyChatClose");cbi.classList.remove("ey-app-icon-active");void cbi.offsetWidth;cbi.classList.add("ey-app-icon-inactive");}})</script></head><body><div class="ey-app-icon-container"><svg class="ey-app-icon-img" width="90px" height="90px" viewBox="0 0 70 70" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><rect id="path-1" x="0" y="0" width="52" height="52" rx="8"></rect><filter x="-27.9%" y="-24.0%" width="155.8%" height="155.8%" filterUnits="objectBoundingBox" id="filter-2"><feMorphology radius="1" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology><feOffset dx="0" dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset><feGaussianBlur stdDeviation="3.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.354102928 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix></filter></defs><g id="Launcher-icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Group-5-Copy" transform="translate(9.000000, 4.000000)"><g id="Rectangle"><use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use><use fill="#FFFFFF" fill-rule="evenodd" xlink:href="#path-1"></use></g></g></g></svg><div id="eyChatOpen" class="ey-icon-btn ey-app-icon-active"><svg class="ey-o-icon" width="45px" height="41px" viewBox="0 0 35 32" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Launcher-icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M30.3572744,0 L4.30939227,0 C1.92476611,0 0,1.90029641 0,4.25460662 L0,21.2730331 C0,23.6271542 1.92476611,25.5276397 4.30939227,25.5276397 L5.74585635,25.5276397 L5.74585635,29.7822464 C5.74585635,30.8068502 6.82042726,31.5488536 7.8718232,31.0302643 C7.90055249,31.0019003 7.95810681,31.0019003 7.9868361,30.9734417 C15.8889208,25.7416937 14.1179521,26.9082123 15.8873886,25.7544575 C16.1171271,25.6126373 16.3756906,25.5276397 16.6629834,25.5276397 L30.3572744,25.5276397 C32.7419006,25.5276397 34.6666667,23.6271542 34.6666667,21.2730331 L34.6666667,4.25460662 C34.6666667,1.90029641 32.7419006,0 30.3572744,0 Z M26.7756906,17.0184265 L15.0924494,17.0184265 C13.1989024,17.0184265 13.1911455,14.1820221 15.0924494,14.1820221 L26.7756906,14.1820221 C28.6692376,14.1820221 28.6769945,17.0184265 26.7756906,17.0184265 Z M27.4843462,11.3456177 L7.18232044,11.3456177 C5.28877348,11.3456177 5.28101657,8.50921325 7.18232044,8.50921325 L27.4843462,8.50921325 C29.3778932,8.50921325 29.3856501,11.3456177 27.4843462,11.3456177 Z" id="Shape-Copy-5" fill="#6897CD" fill-rule="nonzero" transform="translate(17.333333, 15.600000) scale(-1, 1) translate(-17.333333, -15.600000) "></path></g></svg></div><div id="eyChatClose" class="ey-close-btn ey-app-icon-inactive"><svg class="ey-x-icon" width="36px" height="36px" viewBox="0 0 19 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Launcher-icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Group-11" fill="#6897CD" fill-rule="nonzero"><path d="M19.7250963,10.8364044 L-0.576929453,10.8364044 C-2.47047641,10.8364044 -2.47823332,8 -0.576929453,8 L19.7250963,8 C21.6186433,8 21.6264002,10.8364044 19.7250963,10.8364044 Z" id="Path-Copy-2" transform="translate(9.574083, 9.418202) scale(-1, 1) rotate(45.000000) translate(-9.574083, -9.418202) "></path><path d="M19.7250963,10.8364044 L-0.576929453,10.8364044 C-2.47047641,10.8364044 -2.47823332,8 -0.576929453,8 L19.7250963,8 C21.6186433,8 21.6264002,10.8364044 19.7250963,10.8364044 Z" id="Path-Copy-3" transform="translate(9.574083, 9.418202) scale(-1, -1) rotate(45.000000) translate(-9.574083, -9.418202) "></path></g></g></svg></div></div></body></html>');
        isn.document.close();
        isn.addEventListener("click", toggleChat);
        isn.addEventListener("touchstart", toggleChat, supportsPassive() ? {passive : false} : false);
        var ebn = document.getElementById("eyBubble");
        ebn.addEventListener("click", toggleChat);
        ebn.addEventListener("touchstart", toggleChat, supportsPassive() ? {passive : false} : false);
      }
      var es = document.createElement("style");
      es.innerHTML = '@keyframes ey-app-animate{from{opacity:0;-webkit-transform:scale(.5);-moz-transform:scale(.5);-ms-transform:scale(.5);-o-transform:scale(.5);transform:scale(.5);}to{opacity:1;-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);-o-transform:scale(1);transform:scale(1);}}.ey-app-container{position:absolute;width:100%;height:100%;z-index:2147483002;cursor:pointer;-webkit-animation:ey-app-animate 0.5s ease-in-out;-moz-animation:ey-app-animate 0.5s ease-in-out;-ms-animation:ey-app-animate 0.5s ease-in-out;-o-animation:ey-app-animate 0.5s ease-in-out;animation:ey-app-animate 0.5s ease-in-out;}.ey-app-animate:focus{outline:0}.ey-app{position:fixed;z-index:2147483000;bottom:15px;right:15px;width:100px;height:100px;font-family:Roboto,"Helvetica Neue","Apple Color Emoji",Helvetica,Arial,sans-serif}.ey-iframe{font-size:100%;font-style:normal;letter-spacing:normal;font-stretch:normal;font-weight:400;text-align-last:initial;text-indent:0;text-shadow:none;text-transform:none;alignment-baseline:baseline;animation-play-state:running;backface-visibility:visible;background-color:transparent;background-image:none;baseline-shift:baseline;bottom:auto;-webkit-box-decoration-break:slice;box-shadow:none;box-sizing:content-box;caption-side:top;clear:none;clip:auto;color:inherit;column-count:auto;column-fill:balance;column-gap:normal;column-width:auto;content:normal;counter-increment:none;counter-reset:none;cursor:auto;direction:ltr;display:inline;dominant-baseline:auto;empty-cells:show;float:none;-webkit-hyphenate-character:auto;hyphens:manual;image-rendering:auto;left:auto;line-height:inherit;max-height:none;max-width:none;min-height:0;min-width:0;opacity:1;orphans:2;outline-offset:0;page:auto;perspective:none;perspective-origin:50% 50%;pointer-events:auto;position:static;quotes:none;resize:none;right:auto;size:auto;table-layout:auto;top:auto;transform:none;transform-origin:50% 50% 0;transform-style:flat;unicode-bidi:normal;vertical-align:baseline;white-space:normal;widows:2;word-break:normal;word-spacing:normal;overflow-wrap:normal;text-align:start;-webkit-font-smoothing:antialiased;font-variant:normal;text-decoration:none;border-width:0;border-style:none;border-color:transparent;border-image:initial;border-radius:0;list-style:outside none disc;margin:0;overflow:hidden;padding:0;page-break-after:auto;page-break-before:auto;page-break-inside:auto}.ey-container{height:100%;width:100%;}.ey-section{display:block;width:100%;height:100%;position:fixed;top:0;left:0;right:0;bottom:0;z-index:2000000000;}.ey-section-invisible{opacity:0;top:100%;transition:all 0.5s ease-in;-webkit-transition:all 0.5s ease-in;-moz-transition:all 0.5s ease-in;-ms-transition:all 0.5s ease-in;-o-transition:all 0.5s ease-in;}.ey-section-visible {opacity:1;max-height:100%;transition:all 0.5s ease-out;-webkit-transition:all 0.5s ease-out;-moz-transition:all 0.5s ease-out;-ms-transition:all 0.5s ease-out;-o-transition:all 0.5s ease-out;}.ey-section-open{opacity:1;max-height:100%;transition:all 0.5s ease-out;-webkit-transition:all 0.5s ease-out;-moz-transition:all 0.5s ease-out;-ms-transition:all 0.5s ease-out;-o-transition:all 0.5s ease-out;}@media(min-width: 800px){.ey-section{width:376px;min-height:250px;bottom:120px;top:auto;left:auto;right:30px;box-shadow:rgba(0, 0, 0, 0.35) 0px 5px 40px;border-radius: 8px;overflow: hidden;height:calc(100% - 120px);}.ey-section-visible{max-height:704px;}.ey-section-open{max-height:704px;bottom:30px;}.ey-section-invisible{top:100%;}}@media(max-width: 450px){.ey-app-open {display: none;}}';
      document.body.appendChild(es);

      var width = getWidth();
      var sn = document.createElement("section");
      sn.classList.add("ey-section");
      if (!shouldOpen) {
        sn.classList.add("ey-section-invisible");
      } else {
        sn.classList.add("ey-section-open");
      }
      sn.id = "eySection";
      sn.innerHTML = '<iframe id="eyFrame" class="ey-container ey-iframe"></iframe>';
      document.body.appendChild(sn);
      var is = document.getElementById("eyFrame");
      is = is.contentWindow || ( is.contentDocument.document || is.contentDocument);
      is.document.open();
      is.document.write('<!DOCTYPE html><html><head><base target="_parent"></base><meta name="viewport" content="width=device-width, initial-scale=1.0"><script>window.username = "'+username+'";'+(typeof flowname !== 'undefined' ? 'window.flowname = "'+flowname+'";' : '')+'window.shouldOpen = '+(shouldOpen || false)+';if(typeof Promise !== "function"){ var firstScript = document.getElementsByTagName("script")[0]; var esb = document.createElement("script"); esb.src="//cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.5/bluebird.min.js"; firstScript.parentNode.insertBefore(esb, firstScript); }</script><script src="' + remoteURL + '/3rdparty.js"></script><link href="https://fonts.googleapis.com/css?family=Roboto:400,300&subset=latin,cyrillic" rel="stylesheet" type="text/css"><link href="' + chatURL + '/chat.css?v=1.0" rel="stylesheet" type="text/css">' + (username ? '<link href="' + cssURL + '/' + username + '/chat.css" rel="stylesheet" type="text/css">' : '') + (flowname ? '<link href="' + cssURL + '/' + flowname + '/chat.css" rel="stylesheet" type="text/css">' : '') + '</head><body><div class="ey-chat" id="eyChat"><div class="ey-chat-nav"><div class="ey-chat-logo-container"><div class="ey-chat-logo"></div><div id="eyChatName" class="ey-chat-name"></div></div><div id="eyMobileChatClose" class="ey-close-btn" '+((shouldOpen || screen.width > 450) && 'style="display:none;"')+'>&#10006;</div></div><div class="ey_result" id="resultWrapper"><table class="ey_result-table"><tr><td id="result"></td></tr></table></div><div class="clearfix"></div><div class="ey_input"><form class="menu" id="agentDemoForm"><div class="menu-icon" id="menuBtn"></div><div class="main-menu" id="mainMenu"><div class="close-icon"></div><ul class="menu-list" id="menuList"></ul></div><div class="menu-input"><input type="text" name="q" id="query" placeholder="Send a message..."><div class="ey_input-send icon-send" id="ey-send"></div></div></div></form></div><script>window.onload = function() { var as = document.createElement("script"); as.src = "' + chatURL + '/agent.js?v=1.1"; document.body.appendChild(as); }</script></body></html>');
      is.document.close();
      window.addEventListener("message", function(e) {
        if (e.data && e.data && e.data.indexOf && e.data.indexOf("track:") === 0) {
          var jsonStr = e.data.replace("track:", "");
          var jsonObj = JSON.parse(jsonStr);
          if (typeof mixpanel !== 'undefined') {
            mixpanel.track("CHAT INTERACTION", jsonObj);
          }
        } else if (e.data && e.data === "close") {
          toggleChat();
        }
      }, true);
    },
  };
  var execute = function() {
    var command = window.eyelevel.shift();
    var func = command[0];
    var parameters = command[1];
    if (typeof eyelevel[func] === 'function') {
      eyelevel[func].call(window, parameters);
    } else {
      console.error("Invalid function specified: " + func);
    }
  };
  execute();
})();
} catch(e) {
console.error(e);
  var userId;
  if (window.localStorage) {
    userId = window.localStorage.getItem('eyelevel.user.userId');
  }
  var xhr = new XMLHttpRequest();
  xhr.open('POST', 'https://api.eyelevel.ai/webhook/web/event', true);
  xhr.setRequestHeader('Content-type', 'application/json');
  xhr.onload = function () {
    console.log(this.responseText);
  };
  xhr.send(JSON.stringify({ event: "CATCH EYELEVEL.JS ERROR", error: e.message, stack: e.stack, uid: userId, username: window.eyusername, flowname: window.eyflowname }));
}
