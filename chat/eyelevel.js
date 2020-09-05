try {
  var version = '2.0';
  var remoteURL = 'https://cdn.eyelevel.ai/chat';
  var chatURL = 'https://cdn.eyelevel.ai/chat';
  var cssURL = 'https://css.eyelevel.ai';
  window.remoteURL = remoteURL;
  window.chatURL = chatURL;
  window.cssURL = cssURL;
  var shouldTrack = (window.location.host.indexOf('localhost') > -1 || typeof gtag === 'undefined') ? false : true;

  function getQueryVar(vn, isIframe) {
    var qq = window.location.search.substring(1);
    if (isIframe) {
      if (document.referrer && document.referrer.indexOf('?') > -1) {
        qq = document.referrer.substring(document.referrer.indexOf('?'));
        qq = qq.substring(1);
      }
    }
    var vr = qq.split('&');
    for (var i = 0; i < vr.length; i++) {
      var pr = vr[i].split('=');
      if (decodeURIComponent(pr[0]) == vn) {
        return decodeURIComponent(pr[1]);
      }
    }
  }

  function getAlertStatus() {
    var ah = window.localStorage.getItem('eyelevel.conversation.alerts');
    if (ah) {
      return JSON.parse(ah);
    }
    return;
  }

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
  window.supportsPassive = supportsPassive;

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

  function loadGDPR(consent) {
    var es1 = document.createElement("script");
    es1.src = '//geoip-js.com/js/apis/geoip2/v2.1/geoip2.js';
    es1.type = 'text/javascript';
    es1.onload = function() {
      geoip2.country(function(d) {
        window.GDPR = (d && d.continent && d.continent.code && d.continent.code === 'EU') ? true : false;
        var is = document.getElementById("eyFrame");
        if (is) {
          is = is.contentWindow || ( is.contentDocument.document || is.contentDocument);
          is.postMessage("GDPR||" + JSON.stringify(consent), "*");
        }
      });
    };
    document.body.appendChild(es1);
  }

  function isVideo(video) {
    if (video && typeof video === 'object' && video.thumb && video.full) {
      return true;
    }
    return false;
  }

  window.GDPRCheck = function(consent) {
    window.GDPR = true;
    window.GDPRConsent = consent;
    if (document && document.body) {
      loadGDPR(consent);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        loadGDPR(consent);
      });
    }
  }

  window.initEYScripts = function() {
    var googleScript = document.createElement('script');
    googleScript.src = "https://www.googletagmanager.com/gtag/js?id=" + window.gaid;
    googleScript.async = true;
    var firstScript = document.getElementsByTagName('script')[0];
    firstScript.parentNode.insertBefore(googleScript, firstScript);
    var googlePixel = document.createElement('script');
    googlePixel.text = "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', '" + window.gaid + "');"
    googlePixel.async = true;
    firstScript.parentNode.insertBefore(googlePixel, firstScript);
    var es1 = document.createElement("script");
    es1.src = remoteURL + '/iframeResizer.min.js';
    document.body.appendChild(es1);
    if (window.eyusername) {
      var es2 = document.createElement("script");
      es2.src = cssURL + '/' + window.eyusername + '/behavior.js';
      document.body.appendChild(es2);
    }
    if (window.eyflowname) {
      var es2 = document.createElement("script");
      es2.src = cssURL + '/' + window.eyflowname + '/behavior.js';
      document.body.appendChild(es2);
    }
  }

  window.initBadgeFrame = function(n) {
    var ck = document.getElementById("eyBadgeCnt");
    if (ck) {
      ck.parentNode.removeChild(ck);
    }

    if (isVideo(window.eyvideo)) {
      return;
    }

    var af = document.createElement("section");
    af.classList.add("ey-badge-cnt");
    af.id = "eyBadgeCnt";
    af.innerHTML = '<iframe id="eyBadge" class="ey-badge-frame ey-iframe" data-hj-allow-iframe=""></iframe>';
    document.body.appendChild(af);
    var ei = document.getElementById("eyBadge");
    ei = ei.contentWindow || ( ei.contentDocument.document || ei.contentDocument);
    ei.document.open();
    ei.document.write('<!DOCTYPE html><html><head><base target="_parent"></base><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="https://fonts.googleapis.com/css?family=Roboto:500&subset=latin,cyrillic" rel="stylesheet" type="text/css"><link href="' + window.chatURL + '/chat.css?v=1.14" rel="stylesheet" type="text/css">' + (window.eyusername ? '<link href="' + window.cssURL + '/' + window.eyusername + '/chat.css" rel="stylesheet" type="text/css">' : '') + (window.eyflowname ? '<link href="' + window.cssURL + '/' + window.eyflowname + '/chat.css" rel="stylesheet" type="text/css">' : '') + '</head><body class="badge-body"><div class="badge-cnt"><div class="badge">' + n + '</div></div></body></html>');
    ei.document.close();
  }

  window.initAlertFrame = function(txt, eyType, eyConfig) {
    var ah = getAlertStatus();
    if (ah && eyType && eyConfig) {
			var tAlert = ah[eyType + ":" + eyConfig];
			var now = Date.now();
      if (tAlert && tAlert.closed && (now - parseInt(tAlert.closed)) < 24 * 60 * 60 * 1000) {
        return;
      }
    }
    window.eyAlert = { type: eyType, config: eyConfig, text: txt };
    var ck = document.getElementById("eyAlertCnt");
    if (ck) {
      ck.parentNode.removeChild(ck);
    }
    var af = document.createElement("section");
    af.classList.add("ey-alert-cnt");
    af.id = "eyAlertCnt";
    af.innerHTML = '<iframe id="eyAlert" class="ey-alert-frame ey-iframe" data-hj-allow-iframe="" style="background: transparent;"></iframe>';
    document.body.appendChild(af);
    var ei = document.getElementById("eyAlert");
    ei = ei.contentWindow || ( ei.contentDocument.document || ei.contentDocument);
    ei.document.open();
    ei.document.write('<!DOCTYPE html><html><head><base target="_parent"></base><meta name="viewport" content="width=device-width, initial-scale=1.0"><link href="https://fonts.googleapis.com/css?family=Roboto:500,400,300&subset=latin,cyrillic" rel="stylesheet" type="text/css"><link href="' + window.chatURL + '/chat.css?v=1.14" rel="stylesheet" type="text/css">' + (window.eyusername ? '<link href="' + window.cssURL + '/' + window.eyusername + '/chat.css" rel="stylesheet" type="text/css">' : '') + (window.eyflowname ? '<link href="' + window.cssURL + '/' + window.eyflowname + '/chat.css" rel="stylesheet" type="text/css">' : '') + '<script src="' + window.remoteURL + '/iframeResizer.contentWindow.min.js"></script></head><body class="alert-body" style="background: transparent;"><div class="ey-chat" style="background: transparent;"><div class="alert-nav" id="alertClose"><div class="alert-close">&#10006;</div></div><div class="ey-alert" id="alertOpen"><div class="alert-item"><div class="server-icon"><div class="server-icon-img"></div></div><div class="server-response alert-text">' + txt + '</div></div></div></div><script>function closeAlert(e){e.stopPropagation();e.preventDefault();window.parent.postMessage("close-alert", "*");}function openAlert(e){e.stopPropagation();e.preventDefault();window.parent.postMessage("open-alert", "*");}var ca=document.getElementById("alertClose");ca.addEventListener("click", closeAlert, false);ca.addEventListener("touchstart", closeAlert, false);var co=document.getElementById("alertOpen");co.addEventListener("click", openAlert, false);co.addEventListener("touchstart", openAlert, false);</script></body></html>');
    ei.document.close();
    iFrameResize({ checkOrigin: false }, '#eyAlert');
    if (eyType && eyConfig) {
      var now = Date.now();
      var ls = window.localStorage.getItem('eyelevel.conversation.alerts.lastSeen');
      ls = JSON.parse(ls);
      if (!ls) {
        ls = {};
      }
      ls[eyType + ":" + eyConfig] = now;
      window.localStorage.setItem('eyelevel.conversation.alerts.lastSeen', JSON.stringify(ls));
    }
  }

  window.removeChat = function() {
    var eyb = document.getElementById("eyBubble");
    if (eyb && eyb.remove) {
      eyb.remove();
    }
    var eyc = document.getElementById("eySection");
    if (eyc && eyc.remove) {
      eyc.remove();
    }
  }

  window.initChatStyle = function(origin) {
    var es = document.createElement("style");
    es.innerHTML = '@keyframes ey-app-animate{from{opacity:0;-webkit-transform:scale(.5);-moz-transform:scale(.5);-ms-transform:scale(.5);-o-transform:scale(.5);transform:scale(.5);}to{opacity:1;-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);-o-transform:scale(1);transform:scale(1);}}.ey-app-container{position:absolute;width:100%;height:100%;z-index:2147483001;cursor:pointer;-webkit-animation:ey-app-animate 0.5s ease-in-out;-moz-animation:ey-app-animate 0.5s ease-in-out;-ms-animation:ey-app-animate 0.5s ease-in-out;-o-animation:ey-app-animate 0.5s ease-in-out;animation:ey-app-animate 0.5s ease-in-out;}.ey-app-animate:focus{outline:0}.ey-app{display:none;position:fixed;z-index:2147483000;bottom:15px;right:15px;width:100px;height:100px;font-family:Roboto,"Helvetica Neue","Apple Color Emoji",Helvetica,Arial,sans-serif}.ey-alert-cnt{position:fixed;z-index:2147483000;bottom:100px;right:14px;font-family:Roboto,"Helvetica Neue","Apple Color Emoji",Helvetica,Arial,sans-serif;-webkit-animation:ey-app-animate 0.25s ease-in-out;-moz-animation:ey-app-animate 0.25s ease-in-out;-ms-animation:ey-app-animate 0.25s ease-in-out;-o-animation:ey-app-animate 0.25s ease-in-out;animation:ey-app-animate 0.25s ease-in-out;}.ey-badge-cnt{position:fixed;z-index:2147483000;bottom:82px;right:18px;font-family:Roboto,"Helvetica Neue","Apple Color Emoji",Helvetica,Arial,sans-serif;-webkit-animation:ey-app-animate 0.25s ease-in-out;-moz-animation:ey-app-animate 0.25s ease-in-out;-ms-animation:ey-app-animate 0.25s ease-in-out;-o-animation:ey-app-animate 0.25s ease-in-out;animation:ey-app-animate 0.25s ease-in-out;}.ey-badge-frame{width:24px;height:26px;min-width:100%;}.ey-alert-frame{width:100%;min-width:100%;}.ey-iframe{font-size:100%;font-style:normal;letter-spacing:normal;font-stretch:normal;font-weight:400;text-align-last:initial;text-indent:0;text-shadow:none;text-transform:none;alignment-baseline:baseline;animation-play-state:running;backface-visibility:visible;background-color:transparent;background-image:none;baseline-shift:baseline;bottom:auto;-webkit-box-decoration-break:slice;box-shadow:none;box-sizing:content-box;caption-side:top;clear:none;clip:auto;color:inherit;column-count:auto;column-fill:balance;column-gap:normal;column-width:auto;content:normal;counter-increment:none;counter-reset:none;cursor:auto;direction:ltr;display:inline;dominant-baseline:auto;empty-cells:show;float:none;-webkit-hyphenate-character:auto;hyphens:manual;image-rendering:auto;left:auto;line-height:inherit;max-height:none;max-width:none;min-height:0;min-width:0;opacity:1;orphans:2;outline-offset:0;page:auto;perspective:none;perspective-origin:50% 50%;pointer-events:auto;position:static;quotes:none;resize:none;right:auto;size:auto;table-layout:auto;top:auto;transform:none;transform-origin:50% 50% 0;transform-style:flat;unicode-bidi:normal;vertical-align:baseline;white-space:normal;widows:2;word-break:normal;word-spacing:normal;overflow-wrap:normal;text-align:start;-webkit-font-smoothing:antialiased;font-variant:normal;text-decoration:none;border-width:0;border-style:none;border-color:transparent;border-image:initial;border-radius:0;list-style:outside none disc;margin:0;overflow:hidden;padding:0;page-break-after:auto;page-break-before:auto;page-break-inside:auto}.ey-container{height:' + ((origin && origin === 'email') ? 'calc(100% - 40px)' : '100%') + ';width:' + ((origin && origin === 'email') ? 'calc(100% - 40px)' : '100%') + ';}.ey-section{display:flex;justify-content:center;align-items:center;' + ((origin && origin === 'email') ? 'background:rgba(0,0,0,0.50);' : '') + 'width:100%;height:100%;position:' + (origin === 'linkedin' ? 'absolute' : 'fixed') + ';top:0;left:0;right:0;bottom:0;z-index:2147483002;}.ey-section-invisible{opacity:0;top:100%;transition:all 0.5s ease-in;-webkit-transition:all 0.5s ease-in;-moz-transition:all 0.5s ease-in;-ms-transition:all 0.5s ease-in;-o-transition:all 0.5s ease-in;}.ey-section-visible {opacity:1;max-height:100%;transition:all 0.5s ease-out;-webkit-transition:all 0.5s ease-out;-moz-transition:all 0.5s ease-out;-ms-transition:all 0.5s ease-out;-o-transition:all 0.5s ease-out;}.ey-section-open{opacity:1;max-height:100%;transition:all 0.5s ease-out;-webkit-transition:all 0.5s ease-out;-moz-transition:all 0.5s ease-out;-ms-transition:all 0.5s ease-out;-o-transition:all 0.5s ease-out;}@media(min-width: 800px){.ey-container{width:100%;height:100%;}.ey-section{' + (origin === 'linkedin' ? 'height: 100%;min-width:376px;max-width:466px;display:block;width:40%;top:unset;bottom:unset;left:unset;right:unset;position:relative;' : 'width:376px;min-height:250px;bottom:120px;top:auto;left:auto;right:30px;box-shadow:rgba(0, 0, 0, 0.35) 0px 5px 40px;border-radius: 8px;height:calc(100% - 120px);') + 'overflow: hidden;}.ey-section-visible{max-height:704px;}.ey-section-open{' + (origin === 'linkedin' ? '' : 'max-height:704px;top:123px;bottom:auto') + '}.ey-section-invisible{top:100%;}}@media(max-width: 450px){.ey-app-open {display: none;}}';
    document.body.appendChild(es);
  }

  window.initChatBubble = function(username, flowname, shouldOpen, video) {
    if(window.hideChat) {
      return;
    }
    var eb = document.createElement("section");
    eb.id = "eyBubble";
    eb.classList.add("ey-app");
    if (shouldOpen) {
      eb.classList.add("ey-app-open");
      window.isOpen = true;
    }
    eb.innerHTML = '<iframe id="eyAppFrame" class="ey-app-container ey-iframe" data-hj-allow-iframe=""></iframe>';
    document.body.appendChild(eb);
    var isn = document.getElementById("eyAppFrame");
    isn = isn.contentWindow || ( isn.contentDocument.document || isn.contentDocument);

    var openIcon = '<div id="eyChatOpen" class="ey-icon-btn ' + (shouldOpen ? "ey-app-icon-inactive" : "ey-app-icon-active") + '"><svg class="ey-o-icon" width="45px" height="45px" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Launcher-icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><path d="M7.9558011,0 L56.0441989,0 C60.4465856,0 64,3.89804392 64,8.7273982 L64,43.636991 C64,48.4659574 60.4465856,52.3643892 56.0441989,52.3643892 L53.3922652,52.3643892 L53.3922652,61.0917874 C53.3922652,63.1935388 51.408442,64.7155971 49.4674033,63.6518242 C49.4143646,63.5936416 49.3081105,63.5936416 49.2550718,63.535265 C34.6666077,52.8034743 37.9360884,55.196333 34.6694365,52.8296565 C34.2453039,52.5387432 33.7679558,52.3643892 33.2375691,52.3643892 L7.9558011,52.3643892 C3.55341436,52.3643892 0,48.4659574 0,43.636991 L0,8.7273982 C0,3.89804392 3.55341436,0 7.9558011,0 Z M12,14 C10.8954305,14 10,14.8954305 10,16 L10,18 C10,19.1045695 10.8954305,20 12,20 L52,20 C53.1045695,20 54,19.1045695 54,18 L54,16 C54,14.8954305 53.1045695,14 52,14 L12,14 Z M12,28 C10.8954305,28 10,28.8954305 10,30 L10,32 C10,33.1045695 10.8954305,34 12,34 L40,34 C41.1045695,34 42,33.1045695 42,32 L42,30 C42,28.8954305 41.1045695,28 40,28 L12,28 Z" id="Combined-Shape" fill="#6897CD" fill-rule="nonzero"></path></g></svg></div>';
    if (isVideo(video)) {
      openIcon = '<div id="eyChatOpen" class="ey-class-video-thumb-cnt ' + (shouldOpen ? "ey-app-icon-inactive" : "ey-app-icon-active") + '"><video class="ey-class-video-thumb" preload autoplay loop muted="true" playsinline><source type="video/webm"></source><source src="' + video.thumb + '" type="video/mp4"></source></video></div>';
    }
    isn.document.open();
    isn.document.write('<!DOCTYPE html><html><head><base target="_parent"></base><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{overflow:hidden;}@keyframes growIcon{from{transform: scale(0);-webkit-transform:scale(0);-moz-transform:scale(0);-ms-transform:scale(0);-o-transform:scale(0);}to{transform:scale(1);-webkit-transform:scale(1);-moz-transform:scale(1);-ms-transform:scale(1);-o-transform:scale(1);}}.ey-app-icon-container{position:relative;}.ey-app-icon-active{height:90px;width:90px;animation:growIcon 0.1s;-webkit-animation:growIcon 0.1s;-ms-animation:growIcon 0.1s;-o-animation:growIcon 0.1s;-moz-animation:growIcon 0.1s;}.ey-app-icon-inactive{width:0;height:0;animation:growIcon 0.1s;-webkit-animation:growIcon 0.1s;-ms-animation:growIcon 0.1s;-moz-animation:growIcon 0.1s;-o-animation:growIcon 0.1s;}.ey-app-icon-inactive svg{width:0;height:0;}.ey-close-btn {position: absolute;top:-4px;left:0;font-size:60px;color:transparent;text-shadow: 0 0 0 #7197c9;display:flex;justify-content:center;align-items:center;}.ey-close-btn svg{margin:0;position:absolute;top:50%;left:50%;margin-right:-50%;transform:translate(-50%,-50%);-webkit-transform:translate3d(-50%,-50%,0);-moz-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);}.ey-icon-btn{position:absolute;top:-3px;left:0;}.ey-icon-btn svg{margin:0;position:absolute;top:50%;left:50%;margin-right:-50%;transform:translate(-50%,-50%);-webkit-transform:translate3d(-50%,-50%,0);-moz-transform:translate(-50%,-50%);-ms-transform:translate(-50%,-50%);-o-transform:translate(-50%,-50%);}.ey-app-icon-img{overflow:visible;}</style>' + (username ? '<link href="' + cssURL + '/' + username + '/bubble.css" rel="stylesheet" type="text/css">' : '') + (flowname ? '<link href="' + cssURL + '/' + flowname + '/bubble.css" rel="stylesheet" type="text/css">'  : '') + '<script>function toggleIcon(e){if(e && e.data === "open"){var ci = document.getElementById("eyChatOpen");ci.classList.remove("ey-app-icon-active");void ci.offsetWidth;ci.classList.add("ey-app-icon-inactive");var cbi = document.getElementById("eyChatClose");cbi.classList.remove("ey-app-icon-inactive");void cbi.offsetWidth;cbi.classList.add("ey-app-icon-active");}else if(e && e.data === "close"){var ci = document.getElementById("eyChatOpen");ci.classList.remove("ey-app-icon-inactive");void ci.offsetWidth;ci.classList.add("ey-app-icon-active");var cbi = document.getElementById("eyChatClose");cbi.classList.remove("ey-app-icon-active");void cbi.offsetWidth;cbi.classList.add("ey-app-icon-inactive");}}window.addEventListener("message", toggleIcon, false);</script></head><body><div class="ey-app-icon-container"><svg class="ey-app-icon-img" width="82px" height="82px" viewBox="0 0 64 63" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><defs><rect id="path-1" x="0" y="0" width="52" height="52" rx="8"></rect><filter x="-27.9%" y="-24.0%" width="155.8%" height="155.8%" filterUnits="objectBoundingBox" id="filter-2"><feMorphology radius="1" operator="dilate" in="SourceAlpha" result="shadowSpreadOuter1"></feMorphology><feOffset dx="0" dy="2" in="shadowSpreadOuter1" result="shadowOffsetOuter1"></feOffset><feGaussianBlur stdDeviation="3.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur><feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.354102928 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix></filter></defs><g id="Launcher-icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Group-5-Copy" transform="translate(9.000000, 4.000000)"><g id="Rectangle"><use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use><use fill="#FFFFFF" fill-rule="evenodd" xlink:href="#path-1"></use></g></g></g></svg>' + openIcon + '<div id="eyChatClose" class="ey-close-btn ' + (shouldOpen ? "ey-app-icon-active" : "ey-app-icon-inactive") + '"><svg class="ey-x-icon" width="36px" height="36px" viewBox="0 0 19 19" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><g id="Launcher-icon" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd"><g id="Group-11" fill="#6897CD" fill-rule="nonzero"><path d="M19.7250963,10.8364044 L-0.576929453,10.8364044 C-2.47047641,10.8364044 -2.47823332,8 -0.576929453,8 L19.7250963,8 C21.6186433,8 21.6264002,10.8364044 19.7250963,10.8364044 Z" id="Path-Copy-2" transform="translate(9.574083, 9.418202) scale(-1, 1) rotate(45.000000) translate(-9.574083, -9.418202) "></path><path d="M19.7250963,10.8364044 L-0.576929453,10.8364044 C-2.47047641,10.8364044 -2.47823332,8 -0.576929453,8 L19.7250963,8 C21.6186433,8 21.6264002,10.8364044 19.7250963,10.8364044 Z" id="Path-Copy-3" transform="translate(9.574083, 9.418202) scale(-1, -1) rotate(45.000000) translate(-9.574083, -9.418202) "></path></g></g></svg></div></div><script>window.addEventListener("load", function() { window.parent.postMessage("bubble-loaded", "*"); });</script></body></html>');
    isn.document.close();
    isn.addEventListener("click", toggleChat);
    isn.addEventListener("touchstart", toggleChat, supportsPassive() ? {passive : false} : false);
    var ebn = document.getElementById("eyBubble");
    ebn.addEventListener("click", toggleChat);
    ebn.addEventListener("touchstart", toggleChat, supportsPassive() ? {passive : false} : false);
  }

  window.initChatFrame = function(username, flowname, shouldOpen, origin, attn) {
    if(window.hideChat) {
      return;
    }
    var width = getWidth();
    var sn = document.createElement("section");
    sn.classList.add("ey-section");
    if (origin === 'linkedin') {
      sn.classList.add("ey-section-open");
      window.isOpen = true;
    } else if (shouldOpen) {
      sn.classList.add("ey-section-visible");
    } else {
      sn.classList.add("ey-section-invisible");
    }
    sn.id = "eySection";
    sn.innerHTML = '<iframe id="eyFrame" class="ey-container ey-iframe" data-hj-allow-iframe=""></iframe>';
    if (origin === 'linkedin') {
      var mainCnt = document.getElementById('linkedinContainer');
      mainCnt.appendChild(sn);
    } else {
      document.body.appendChild(sn);
    }
    var is = document.getElementById("eyFrame");
    is = is.contentWindow || ( is.contentDocument.document || is.contentDocument);
    is.document.open();
    is.document.write('<!DOCTYPE html><html><head><base target="_parent"></base><meta name="viewport" content="width=device-width, initial-scale=1.0"><script>window.GDPR = '+(window.GDPR ? window.GDPR : false)+';'+(window.GDPRConsent ? "window.GDPRConsent = "+JSON.stringify(window.GDPRConsent)+ ";" : "")+'window.username = "'+username+'";'+(typeof flowname !== 'undefined' ? 'window.flowname = "'+flowname+'";' : '')+'window.shouldOpen = '+(shouldOpen || false)+';window.attn = '+(attn || false)+';window.origin = "'+origin+'";'+(window.eyid ? 'window.eyid = "'+window.eyid+'";' : '')+(isVideo(window.eyvideo) ? 'window.eyvideo = '+JSON.stringify(window.eyvideo)+';' : '')+'if(typeof Promise !== "function"){ var firstScript = document.getElementsByTagName("script")[0]; var esb = document.createElement("script"); esb.src="//cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.5/bluebird.min.js"; firstScript.parentNode.insertBefore(esb, firstScript); }</script><script src="' + remoteURL + '/3rdparty.js"></script><link href="https://fonts.googleapis.com/css?family=Roboto:500,400,300&subset=latin,cyrillic" rel="stylesheet" type="text/css"><link href="' + chatURL + '/chat.css?v=1.14" rel="stylesheet" type="text/css">' + (username ? '<link href="' + cssURL + '/' + username + '/chat.css" rel="stylesheet" type="text/css">' : '') + (flowname ? '<link href="' + cssURL + '/' + flowname + '/chat.css" rel="stylesheet" type="text/css">' : '') + '<style>' + (screen.width < 800 ? '.ey-chat .chat-button { padding: 6px; font-size: 0.875em; } .ey-chat .user-request,.ey-chat .server-response { padding: 12px 18px; font-size: 1.0rem; }' : '') + '</style></head><body><div class="ey-chat-only ey-chat" id="eyChat"><div class="ey-chat-nav"><div class="ey-chat-logo-container"><div class="ey-chat-logo"></div><div id="eyChatName" class="ey-chat-name"></div></div><div id="eyMobileChatClose" class="ey-close-btn" '+((origin === 'linkedin' || screen.width > 450) && 'style="display:none;"')+'>&#10006;</div></div><div class="ey_result" id="resultWrapper"><table class="ey_result-table"><tr><td id="result"></td></tr></table></div><div class="clearfix"></div><div class="ey_input"><form class="menu" id="agentDemoForm"><div class="menu-icon" id="menuBtn"></div><div class="main-menu" id="mainMenu"><div class="close-icon"></div><ul class="menu-list" id="menuList"></ul></div><div class="menu-input"><input type="text" name="q" id="query" placeholder="Send a message..."><div class="ey_input-send icon-send" id="ey-send"></div></div></div></form></div><script>window.onload = function() { var as = document.createElement("script"); as.src = "' + chatURL + '/agent.js?v=1.43"; document.body.appendChild(as); }</script></body></html>');
    is.document.close();
  }

  window.loadBehavior = function(config) {
    var chatBehavior;
    var domB;
    var pathB;
    for (var k in config) {
      if (window.location.hostname === k) {
        chatBehavior = config[k].config;
        for (var j in config[k].path) {
          if (j.indexOf('*') > -1) {
            if (window.location.pathname.indexOf(j.replace('*','')) > -1) {
              chatBehavior = config[k].path[j].config;
              break;
            }
            if (config[k].path[j].config && config[k].path[j].config.isIframe) {
              if (document.referrer && document.referrer.indexOf('/') > -1) {
                var qq = document.referrer.substring(document.referrer.indexOf('/'));
                qq = qq.substring(1);
                if (qq.indexOf(j.replace('*','')) > -1) {
                  chatBehavior = config[k].path[j].config;
                  break;
                }
              }
            }
          } else {
            if (window.location.pathname === j) {
              chatBehavior = config[k].path[j].config;
              break;
            }
            if (config[k].path[j].config && config[k].path[j].config.isIframe) {
              if (document.referrer && document.referrer.indexOf('/') > -1) {
                var qq = document.referrer.substring(document.referrer.indexOf('/'));
                qq = qq.substring(1);
                qq = qq.split('?')[0];
                if (qq === j) {
                  chatBehavior = config[k].path[j].config;
                  break;
                }
              }
            }
          }
        }
        break;
      }
    }
    if (!chatBehavior && config['*']) {
      chatBehavior = config['*'].config;
      for (var j in config['*'].path) {
        if (j.indexOf('*') > -1) {
          if (window.location.pathname.indexOf(j.replace('*','')) > -1) {
            chatBehavior = config['*'].path[j].config;
            break;
          }
          if (config['*'].path[j].config && config['*'].path[j].config.isIframe) {
            if (document.referrer && document.referrer.indexOf('/') > -1) {
              var qq = document.referrer.substring(document.referrer.indexOf('/'));
              qq = qq.substring(1);
              qq = qq.split('?')[0];
              if (qq.indexOf(j.replace('*','')) > -1) {
                chatBehavior = config['*'].path[j].config;
                break;
              }
            }
          }
        } else {
          if (window.location.pathname === j) {
            chatBehavior = config['*'].path[j].config;
            break;
          }
          if (config['*'].path[j].config && config['*'].path[j].config.isIframe) {
            if (document.referrer && document.referrer.indexOf('/') > -1) {
              var qq = document.referrer.substring(document.referrer.indexOf('/'));
              qq = qq.substring(1);
              qq = qq.split('?')[0];

              if (qq === j) {
                chatBehavior = config['*'].path[j].config;
                break;
              }
            }
          }
        }
      }
    }

    if (chatBehavior) {
      var fn = getQueryVar("fn", chatBehavior.isIframe);
      window.eyvideo = chatBehavior.video;
      if (chatBehavior.hidden) {
        window.isOpen = true;
        window.hideChat = true;
      } else if (!fn && chatBehavior.flowname && chatBehavior.flowname !== window.eyflowname) {
        window.eyflowname = chatBehavior.flowname;
        var bb = document.getElementById('eyBubble');
        if (bb) {
          window.removeChat();
          window.initChatBubble(window.eyusername, window.eyflowname, window.eyshouldopen, window.eyvideo);
          window.initChatFrame(window.eyusername, window.eyflowname, window.eyshouldopen, window.eyorigin, window.eyattn);
        }
      }
    }

    window.addEventListener('load', function() {
      if (chatBehavior && !window.isOpen) {
        if (window.isReturn && chatBehavior.returnText) {
          setTimeout(function() {
            if (!window.isOpen) {
              window.initAlertFrame(chatBehavior.returnText, config.eyType, config.eyConfig);
              if (window.eyvideo)
              window.initBadgeFrame(1);
            }
          }, chatBehavior.returnTime || 5000);
        } else if (chatBehavior.alertText) {
          setTimeout(function() {
            if (!window.isOpen && chatBehavior.alertText) {
              window.initAlertFrame(chatBehavior.alertText, config.eyType, config.eyConfig);
              window.initBadgeFrame(1);
            }
          }, chatBehavior.alertTime || 5000);
        }
      } else if (window.hideChat) {
        window.removeChat();
      }
    }, false);
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

  function loadHistory() {
    var h = window.localStorage.getItem('eyelevel.conversation.history');
    window.isReturn = false;
    if (h && typeof h !== 'undefined') {
      var history = JSON.parse(h);
      for (var i in history) {
        if (history[i].sender && history[i].sender !== 'server') {
          window.isReturn = true;
          break;
        }
      }
    }
  }

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

  function clearBadge() {
    var cad = document.getElementById('eyBadgeCnt');
    if (cad) {
      cad.style.display = "none";
    }
  }

  function closeAlert() {
    if (!window.eyAlert) {
      return;
    }
    var cad = document.getElementById('eyAlertCnt');
    if (cad) {
      cad.style.display = "none";
    }
    var ah = window.localStorage.getItem('eyelevel.conversation.alerts');
    if (!ah && window.eyAlert) {
      ah = {};
    } else {
      ah = JSON.parse(ah);
    }
    window.eyAlert.closed = Date.now();
    ah[window.eyAlert.type+":"+window.eyAlert.config] = window.eyAlert;
    window.localStorage.setItem('eyelevel.conversation.alerts', JSON.stringify(ah));
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
      if (shouldTrack) {
        gtag('event', window.location.hostname, { event_category: 'chat_close', uid: window.eyuserid, username: window.eyusername, flowname: window.eyflowname, origin: window.eyorigin, shouldOpen: window.eyshouldopen });
      }
      setTimeout(function() {
        var is = document.getElementById("eyFrame");
        is = is.contentWindow || ( is.contentDocument.document || is.contentDocument);
        if (is) {
          is.postMessage("close", "*");
        }
        var eis = document.getElementById("eyAppFrame");
        eis = eis.contentWindow || ( eis.contentDocument.document || eis.contentDocument);
        if (eis) {
          eis.postMessage("close", "*");
        }
      }, 200);
    } else {
      setTimeout(function() {
        closeAlert();
        clearBadge();
      }, 250);
      window.isOpen = true;
      cb.classList.add("ey-app-open");
      var cw = document.getElementById("eySection");
      cw.classList.remove("ey-section-invisible");
      cw.classList.add("ey-section-visible");
      if (shouldTrack) {
        gtag('event', window.location.hostname, { event_category: 'chat_open', uid: window.eyuserid, username: window.eyusername, flowname: window.eyflowname, origin: window.eyorigin, shouldOpen: window.eyshouldopen });
      }
      setTimeout(function() {
        var is = document.getElementById("eyFrame");
        is = is.contentWindow || ( is.contentDocument.document || is.contentDocument);
        if (is) {
          is.postMessage("open", "*");
        }
        var eis = document.getElementById("eyAppFrame");
        eis = eis.contentWindow || ( eis.contentDocument.document || eis.contentDocument);
        if (eis) {
          eis.postMessage("open", "*");
        }
      }, 200);
    }
  }
  window.toggleChat = toggleChat;

  var eyelevel = {
    init: function(params) {
      var username = params.username;
      var un = getQueryVar("un", params.isIframe);
      if (un) {
        username = un;
      }
      window.eyusername = username;

      var flowname = params.flowname;
      var fn = getQueryVar("fn", params.isIframe);
      if (fn) {
        flowname = fn;
      }
      window.eyflowname = flowname;

      var channel = params.channel;
      var ch = getQueryVar("eychannel", params.isIframe);
      if (ch) {
        channel = ch;
      }
      if (channel) {
        window.eychannel = channel;
      }

      var origin = params.origin;
      var og = getQueryVar("eyorigin", params.isIframe);
      if (og) {
        origin = og;
      }
      if (origin) {
        window.eyorigin = origin;
      } else if (window.eychannel) {
        window.eyorigin = window.eychannel;
      } else {
        window.eyorigin = "web";
      }

      var shouldOpen = params.state && params.state === "open";
      var op = getQueryVar("eystate", params.isIframe);
      if (op) {
        shouldOpen = op === "open";
      }
      window.eyshouldopen = shouldOpen;

      var userId = window.getUser().userId;
      window.eyuserid = userId;

      window.gaid = params.gaid || "UA-173447538-1";

      var eyid = params.eyid;
      eyid = getQueryVar("eyid", params.isIframe);
      if (eyid) {
        window.eyid = eyid;
      }

      var attention = params.attention;
      var attn = getQueryVar("eyattn", params.isIframe);
      if (attn) {
        attention = attn;
      }
      if (attention) {
        window.eyattn = attention;
      } else if (window.eyorigin === 'linkedin') {
        window.eyattn = true;
      } else {
        window.eyattn = false;
      }

      if (document && document.body) {
        window.initEYScripts();
        shouldTrack = (window.location.host.indexOf('localhost') > -1 || window.location.host.indexOf('speatly') > -1 || typeof gtag === 'undefined') ? false : true;
        if (shouldTrack) {
          gtag('event', window.location.hostname, { event_category: 'chat_load:' + version, uid: window.eyuserid, username: window.eyusername, flowname: window.eyflowname, origin: window.eyorigin, shouldOpen: window.eyshouldopen });
        }
        if (!window.WebSocket || !window.addEventListener) {
          if (shouldTrack) {
            gtag('event', window.location.hostname, { event_category: 'chat_hidden', uid: window.eyuserid, username: window.eyusername, flowname: window.eyflowname, origin: window.eyorigin, shouldOpen: window.eyshouldopen });
          }
          return;
        }
      } else {
        document.addEventListener('DOMContentLoaded', function () {
          window.initEYScripts();
          shouldTrack = (window.location.host.indexOf('localhost') > -1 || window.location.host.indexOf('speatly') > -1 || typeof gtag === 'undefined') ? false : true;
          if (shouldTrack) {
            gtag('event', window.location.hostname, { event_category: 'chat_load', uid: window.eyuserid, username: window.eyusername, flowname: window.eyflowname, origin: window.eyorigin, shouldOpen: window.eyshouldopen });
          }
          if (!window.WebSocket || !window.addEventListener) {
            if (shouldTrack) {
              gtag('event', window.location.hostname, { event_category: 'chat_hidden', uid: window.eyuserid, username: window.eyusername, flowname: window.eyflowname, origin: window.eyorigin, shouldOpen: window.eyshouldopen });
            }
            return;
          }
        });
      }

      loadHistory();

      if (window.eyorigin === 'linkedin') {
        window.initChatStyle(window.eyorigin);
        window.initChatFrame(window.eyusername, window.eyflowname, window.eyshouldopen, window.eyorigin, window.eyattn);
      } else {
        window.addEventListener("load", function() {
          window.initChatStyle(window.eyorigin);
          window.initChatBubble(window.eyusername, window.eyflowname, window.eyshouldopen, window.eyvideo);
          window.initChatFrame(window.eyusername, window.eyflowname, window.eyshouldopen, window.eyorigin, window.eyattn);
        }, true);
      }

      window.addEventListener("message", function(e) {
        if (e.data && e.data && e.data.indexOf && e.data.indexOf("track:") === 0) {
          var jsonStr = e.data.replace("track:", "");
          var jsonObj = JSON.parse(jsonStr);
          if (shouldTrack) {
            jsonObj.event_category = 'chat_interaction';
            jsonObj.uid = window.eyuserid;
            jsonObj.username = window.eyusername;
            jsonObj.flowname = window.eyflowname;
            jsonObj.origin = window.eyorigin;
            jsonObj.shouldOpen = window.eyshouldopen;
            gtag('event', window.location.hostname, jsonObj);
          }
        } else if (e.data && e.data === "close") {
          toggleChat();
        } else if (e.data && e.data === "close-alert") {
          closeAlert();
        } else if (e.data && e.data === "open-alert") {
          toggleChat();
        } else if (e.data && e.data === "clear all") {
          window.location.href = window.location.pathname + window.location.search + window.location.hash;
        } else if (e.data && e.data === "bubble-loaded") {
          var eyb = document.getElementById("eyBubble");
          eyb.style.display = "block";
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
  if (typeof gtag !== 'undefined') {
    gtag('event', window.location.hostname, { event_category: 'chat_ey_error', event_label: (e && e.stack) ? e.stack : e, uid: window.eyuserid, username: window.eyusername, flowname: window.eyflowname, origin: window.eyorigin, shouldOpen: window.eyshouldopen });
  }
}
