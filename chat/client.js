try {
  var wssURL = 'wss://inbox.eyelevel.ai';
  var devURL = 'wss://dinbox.eyelevel.ai'

  clearAll = function() {
  }

  var eIDs = {
    queryInput:         'query',
    queryInputWrapper:  'inputWrapper',
    queryResult:        'result',
    queryResultWrapper: 'resultWrapper',
    sendBtn:            'ey-send',
    statusMessage:      'statusMessage',
    statusMessageData:  'statusMessageData',
    window:             'eyChat'
  };

  var eyc = {
    body:               document.body,
    elements:           {},
    workplace:          document,

    attnElm:            null,
    connectAttempts:    0,
    isChatting:         false,
    socket:             null,

    getInputValue:      function() {
      return eyc.elements.queryInput.value;
    },
    mapElements:        function() {
      return eyc.elements = {
        chatWindow:         eyc.workplace.getElementById(eIDs.window),
        queryInput:         eyc.workplace.getElementById(eIDs.queryInput),
        queryInputWrapper:  eyc.workplace.getElementById(eIDs.queryInputWrapper),
        queryResult:        eyc.workplace.getElementById(eIDs.queryResult),
        queryResultWrapper: eyc.workplace.getElementById(eIDs.queryResultWrapper),
        sendBtn:            eyc.workplace.getElementById(eIDs.sendBtn)
      };
    },
    addUserRequestNode: function(n) {
      var t = eyc.workplace.createElement("div");
      if (n.text) {
        t.className = 'user-request-container', t.innerHTML = '<div class="user-request">' + n.text + '</div>', eyc.elements.queryResult.appendChild(t);
      } else if (n.input_value && n.id) {
        var input = eyc.workplace.getElementById(n.id + '-input');
        var cnt = eyc.workplace.getElementById(n.id);
        if (input) {
          input.value = n.input_value;
        }
        if (cnt) {
          cnt.classList.remove('icon-send');
          cnt.classList.add('icon-success');
        }
      }
      eyc.scrollToBottom();
      return;
    },
    addStatusMessage: function(msg) {
      var status = eyc.workplace.getElementById(eIDs.statusMessage);
      if (!status) {
        status = eyc.workplace.createElement("div");
        status.id = eIDs.statusMessage;
        status.className = 'status-container status-top';
        status.innerHTML = '<div class="status-update">' + msg + '</div>';
        eyc.elements.queryResult.appendChild(status);
      } else {
        status.innerHTML = '<div class="status-update">' + msg + '</div>';
        status.parentNode.removeChild(status);
        eyc.elements.queryResult.appendChild(status);
      }
      eyc.scrollToBottom();
      return;
    },
    buildPayLoad:       function(e, ty, dt, pos) {
      var ben = {
        type: ty || 'text',
        data: e,
        channelID: window.channelID,
        path: window.location.pathname,
        agentID: window.agentID,
        sessUUID: window.sessUUID,
        guid: window.guid,
        origin: window.origin,
        position: pos && pos,
        ref: window.location.href
      };
      if (typeof window.flowname !== 'undefined') {
        ben.flowname = window.flowname;
      }
      if (dt) {
        ben.value.passthrough.request = dt;
      }
      return ben;
    },
    chat: {
      text:             function(data) {
        return  eyc.escapeString(data);
      },
      image:            function(data) {
        var img = eyc.workplace.createElement('img');
        img.src = data;
        img.classList.add('chat-image');
        img.addEventListener('load', function() {
          eyc.scrollToBottom();
        });
        return img;
      },
      video:            function(data) {
        if (data.indexOf('https://youtu.be/') === 0) {
          var cnt = eyc.workplace.createElement('div');
          cnt.classList.add('youtube-container');
          cnt.innerHTML = '<iframe class="youtube-video" src="https://www.youtube.com/embed/' + data.replace('https://youtu.be/', '') + '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
          return cnt;
        }
        return;
      },
      card:             function(t, ttt, data) {
        if (data.length && data.length === 1) {
          var sc = ttt.getElementsByClassName('server-response');
          if (sc && sc.length && sc.length === 1) {
            while (sc[0].firstChild) {
              sc[0].removeChild(sc[0].firstChild);
            }
          }
          sc[0].parentElement.classList.add('chat-card');
          var cd = data[0];
          var isEmpty = true;
          if (cd.title) {
            var title = eyc.workplace.createElement('div');
            title.classList.add('card-title');
            title.innerHTML = cd.title;
            sc[0].appendChild(title);
            isEmpty = false;
            if (cd.subtitle) {
              var subtitle = eyc.workplace.createElement('div');
              subtitle.classList.add('card-subtitle');
              subtitle.innerHTML = cd.subtitle;
              sc[0].appendChild(subtitle);
            }
          }
          if (cd.buttons && cd.buttons.length) {
            var bt = eyc.chat.buttons(cd.buttons);
            if (bt && bt.length) {
              var buttons = eyc.workplace.createElement('div');
              buttons.classList.add('card-buttons');
              buttons.classList.add('chat-buttons');
              for (var i in bt) {
                buttons.appendChild(bt[i]);
              }
              sc[0].appendChild(buttons);
            } else if (isEmpty) {
              eyc.removeEmpty(ttt);
            }
          }
        } else {
          eyc.removeEmpty(ttt);
        }
      },
      button: function(data) {
        var button = eyc.workplace.createElement('button');
        button.classList.add('chat-button');
        var objData = data;
        if (objData.type === 'phone_number') {
          button.classList.add('click-to-call');
        } else if (objData.type === 'web_url') {
          button.classList.add('web-url');
          button.value = objData.url;
        } else if (objData.type === 'gdpr') {
          button.classList.add('gdpr-button');
          button.value = objData.value;
          objData.payload = objData.title;
        } else {
          try {
            var jsonPay = JSON.parse(objData.payload);
            if (jsonPay && jsonPay.title && jsonPay.action && jsonPay.position) {
              button.setAttribute('data-flow-uuid', jsonPay.position.flowUUID);
              button.setAttribute('data-turn-id', jsonPay.position.turnID);
            }
            objData.payload = objData.title;
          } catch (e) {}
        }
        button.setAttribute('id', objData.payload);
        button.innerHTML = objData.title;
        button.onclick = eyc.sendButton.bind(eyc);
        return button;
      },
      buttons: function(data) {
        var html = [];
        for (var i in data) {
          html.push(eyc.chat.button(data[i]));
        }
        return html;
      },
      user_input: function(msg) {
        var payload = JSON.parse(msg.payload);
        var data;
        for (var i in payload.quick_replies) {
          if (payload.quick_replies[i].content_type && (payload.quick_replies[i].content_type === 'user_email' || payload.quick_replies[i].content_type === 'user_phone_number')) {
            data = payload.quick_replies[i];
            break;
          }
        }
        if (!data) {
          if (payload.text === 'Name') {
            data = { content_type: 'user_name' };
          } else {
            return;
          }
        }
        var idPrefix;
        if (msg.id) {
          idPrefix = msg.id;
        } else {
          idPrefix = 'in-' + Date.now();
          msg.id = idPrefix;
        }
        var cnt = eyc.workplace.createElement('div');
        cnt.classList.add('user-input-container');
        var holder = eyc.workplace.createElement('div');
        holder.classList.add('user-input-holder');
        var input = eyc.workplace.createElement('input');
        input.classList.add('user-input');
        input.id = idPrefix + '-input';
        input.required = true;
        holder.appendChild(input);
        var status = eyc.workplace.createElement('div');
        status.classList.add('user-input-status');
        status.id = idPrefix + '-status';
        status.innerHTML = '&nbsp;';
        var inBtn = eyc.workplace.createElement('div');
        inBtn.classList.add('user-input-button');
        inBtn.classList.add('icon-send');
        inBtn.id = idPrefix;
        inBtn.onclick = eyc.inputButton.bind(eyc);
        var label = eyc.workplace.createElement('label');
        label.classList.add('user-input-label');
        label.innerHTML = payload.text;
        switch (data.content_type) {
          case 'user_email':
            eyc.socket.turnID = idPrefix;
            eyc.socket.turnType = 'email';
            inBtn.type = 'email';
            input.type = 'email';
            input.autocomplete = 'email';
            input.name = 'email';
            holder.appendChild(inBtn);
            cnt.appendChild(label);
            cnt.appendChild(holder);
            break;
          case 'user_phone_number':
            eyc.socket.turnID = idPrefix;
            eyc.socket.turnType = 'tel';
            inBtn.type = 'tel';
            input.type = 'tel';
            input.autocomplete = 'tel';
            input.name = 'tel';
            holder.appendChild(inBtn);
            cnt.appendChild(label);
            cnt.appendChild(holder);
            break;
          case 'user_name':
            eyc.socket.turnID = idPrefix;
            eyc.socket.turnType = 'name';
            inBtn.type = 'name';
            input.type = 'text';
            input.autocomplete = 'name';
            input.name = 'name';
            holder.appendChild(inBtn);
            cnt.appendChild(label);
            cnt.appendChild(holder);
            break;
          default:
            return;
        }
        cnt.appendChild(status);
        return cnt;
      },
      quick_reply: function(data) {
        var objData = data;
        if (objData.content_type === 'text') {
          try {
            var jsonPay = JSON.parse(objData.payload);
            if (jsonPay && jsonPay.title && jsonPay.action && jsonPay.position) {
              return eyc.chat.button({ title: jsonPay.title, type: "postback", payload: objData.payload });
            }
          } catch (e) {}
        }
        var button = eyc.workplace.createElement('button');
        button.classList.add('chat-button');
        button.setAttribute('id', objData.payload);
        button.innerHTML = objData.payload;
        button.onclick = eyc.sendButton.bind(t);
        return button;
      },
      is_input: function(msg) {
        var data = JSON.parse(msg.payload);
        if (data.quick_replies) {
          for (var i in data.quick_replies) {
            if (data.quick_replies[i].content_type && (data.quick_replies[i].content_type === 'user_email' || data.quick_replies[i].content_type === 'user_phone_number' || data.quick_replies[i].content_type === 'user_name' || data.quick_replies[i].content_type === 'custom')) {
              return true;
            }
          }
        }
        return false;
      },
      quick_replies: function(msg, data) {
        var html = [];
        for (var i in data) {
          if (data[i].content_type) {
            if (data[i].content_type === 'text') {
              html.push(eyc.chat.quick_reply(data[i]));
            }
          }
        }
        return html;
      }
    },
    checkWS:            function() {
      if (!eyc.socket || eyc.socket.readyState !== 1) {
        eyc.initializeWS(eyc.socket ? true : false);
      } else {
        eyc.handleInput();
      }
    },
    createMessage:      function(msg, obj, inp) {
      return new Promise(function(resolve, reject) {
        delete eyc.socket.turnType;
        delete eyc.socket.turnID;
        var ttt;
        if (obj) {
          ttt = obj;
        } else {
          ttt = eyc.empty();
        }
        var data = JSON.parse(msg.payload);
        var html = '';
        var needsReset = false;
        if (eyc.chat.is_input(msg)) {
          html = eyc.chat.user_input(msg);
          if (html) {
            eyc.setButtons([html], ttt, inp);
          } else {
            eyc.setText("Unsupported user input type", ttt);
          }
        } else {
          if (data.text) {
            html = eyc.chat.text(data.text);
            eyc.setText(html, ttt, inp);
            needsReset = true;
          }
          if (data.attachment && data.attachment.payload) {
            if (data.attachment.payload.text) {
              if (needsReset) {
                ttt = eyc.empty();
              }
              eyc.setText(eyc.chat.text(data.attachment.payload.text), ttt, inp);
              needsReset = true;
            }
            if (data.attachment.type && data.attachment.type === 'video' && data.attachment.payload.url) {
              if (needsReset) {
                ttt = eyc.empty();
              }
              html = eyc.chat.video(data.attachment.payload.url);
              if (html) {
                ttt.classList.add('chat-video');
                eyc.setMultimedia(html, ttt, inp);
              } else {
                var btn = eyc.chat.button({ title: "Watch Video", url: data.attachment.payload.url, type: "web_url" });
                eyc.setButtons([btn], ttt, inp);
              }
              needsReset = true;
            }
            if (data.attachment.type && data.attachment.type === 'image' && data.attachment.payload.url) {
              if (needsReset) {
                ttt = eyc.empty();
              }
              html = eyc.chat.image(data.attachment.payload.url);
              eyc.setMultimedia(html, ttt, inp);
              needsReset = true;
            }
            if (data.attachment.payload.buttons) {
              if (needsReset) {
                ttt = eyc.empty();
              }
              html = eyc.chat.buttons(data.attachment.payload.buttons);
              if (html && html.length) {
                eyc.setButtons(html, ttt, inp);
              } else {
                eyc.removeEmpty(ttt);
              }
            }
            if (data.attachment.payload.template_type === 'generic') {
              html = eyc.chat.card(eyc, ttt, data.attachment.payload.elements);
            }
          }
          if (data.quick_replies) {
            if (needsReset) {
              ttt = eyc.empty();
            }
            html = eyc.chat.quick_replies(msg, data.quick_replies);
            if (html && html.length) {
              eyc.setButtons(html, ttt, inp);
            } else {
              eyc.removeEmpty(ttt);
            }
          }
        }
        eyc.updateResponses();
        if (msg.typing) {
          eyc.socket.typingElement = eyc.empty();
          resolve();
        } else {
          eyc.socket.typingElement = null;
          resolve();
        }
      });
    },
    escapeString:       function(txt) {
      return txt && txt.toString() ? txt.toString().replace(/&/g, "&amp").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;") : txt
    },
    empty:              function() {
      var na = eyc.workplace.createElement('div');
      na.className = 'server-response-container';
      na.innerHTML = '<div class="server-icon"><div class="server-icon-img"></div></div><div class="server-response">...</div>';
      var aa = eyc.workplace.getElementById('result');
      aa.appendChild(na);
      eyc.scrollToBottom();
      return na;
    },
    handleEvent:        function(evt, type, dt, pos) {
      eyc.isChatting = true;
      var txt = evt || eyc.getInputValue();
      var shouldSend = true;
      if (txt !== 'loadTranscript' && txt !== 'reconnect' && type !== 'user_input') {
        if (eyc.socket.turnType && eyc.socket.turnID && (eyc.socket.turnType === 'email' || eyc.socket.turnType === 'tel' || eyc.socket.turnType === 'name')) {
          shouldSend = false;
          var inBtn = eyc.workplace.getElementById(eyc.socket.turnId);
          var input = eyc.workplace.getElementById(window.eySocket.turnId + '-input');
          input.value = n;
          inBtn.click();
        } else {
          if (txt.indexOf('tel:') < 0) {
            if (txt.indexOf('web}') < 0) {
              eyc.addUserRequestNode({text: txt});
              eyc.socket.lastInteraction = { action: "message", payload: JSON.stringify({ text: txt }), typing: false, sender: "user" };
            } else {
              shouldSend = false;
            }
          } else {
            shouldSend = false;
          }
        }
      } else if (type === 'user_input') {
        dt = null;
      }
      if (shouldSend) {
        eyc.socket.typingElement = eyc.empty();
        if (txt === 'reconnect' && eyc.socket.lastInteraction && eyc.chat.is_input(eyc.socket.lastInteraction)) {
        } else {
          delete eyc.socket.turnType;
          delete eyc.socket.turnID;
        }
        eyc.socket.send(JSON.stringify(eyc.buildPayLoad(evt || eyc.getInputValue(), type || 'event', dt, pos)));
      }
      eyc.isChatting = false;
      eyc.scrollToBottom();
    },
    handleInput:        function(type) {
      var n = eyc.getInputValue();
      if ("" !== n.replace(/\s/g, "") && !eyc.isChatting) {
        var lower = n.toLowerCase();
        if (lower === 'clear all' || lower === 'reset chat') {
          clearAll();
          eyc.createMessage({ payload: JSON.stringify({ text: 'cleared' }) });
          setTimeout(function() {
            eyc.socket.send(JSON.stringify(eyc.buildPayLoad("", "clear all")));
            eyc.setInputValue("");
            eyc.handleStopSend();
            window.location.href = window.location.pathname + window.location.search + window.location.hash;
          }, 500);
        } else if (eyc.socket.turnType && eyc.socket.turnID && (eyc.socket.turnType === 'email' || eyc.socket.turnType === 'tel' || eyc.socket.turnType === 'name')) {
          var inBtn = eyc.workplace.getElementById(eyc.socket.turnID);
          var input = eyc.workplace.getElementById(eyc.socket.turnID + '-input');
          input.value = n;
          inBtn.click();
          eyc.setInputValue("");
        } else {
          eyc.createMessage({ payload: JSON.stringify({ text: n }) }, null, { isUser: false, agentID: agentID, message: n, sender: "agent" });
          eyc.isChatting = true;
          if (n !== 'loadTranscript' && n !== 'reconnect') {
            eyc.socket.lastInteraction = { action: "message", payload: JSON.stringify({ text: eyc.escapeString(n) }), typing: false, sender: "agent" };
          }
          delete eyc.turnType;
          delete eyc.turnID;
          eyc.socket.send(JSON.stringify(eyc.buildPayLoad(eyc.getInputValue())));
          eyc.setInputValue("");
          eyc.handleStopSend();
        }
        eyc.isChatting = false;
        eyc.scrollToBottom();
      }
    },
    handleInputChange:  function(n) {
      if (n.target.value && n.target.value.length) {
        eyc.handleStartSend();
      } else {
        eyc.handleStopSend();
      }
    },
    handleInputFocus:   function(n) {
      window.scrollTo(0, 0);
      document.body.scrollTop = 0;
    },
    handleInputKeyDown: function(n) {
      n.keyCode === 13 && (n.preventDefault(), n.stopPropagation(), eyc.checkWS());
    },
    handleSendClick:    function(n) {
      n.preventDefault(), n.stopPropagation(), eyc.checkWS();
    },
    handleStartSend:    function() {
      return eyc.elements.sendBtn.className += " active";
    },
    handleStopSend:     function() {
      var n = new RegExp("(?:^|\\s)active(?!\\S)", "gi");
      return eyc.elements.sendBtn.className = eyc.elements.sendBtn.className.replace(n, "");
    },
    handleWSClose:      function(n) {
      var now = Date.now();
      if (eyc.socket && eyc.socket.connectTime && (eyc.socket.connectTime + 10000 < now || eyc.connectAttempts < 4)) {
        console.log('reconnecting');
        setTimeout(function() {
          eyc.initializeWS(true);
        }, 1000);
      }
    },
    handleWSError:      function(n) {
      console.error(n, eyc.socket);
      throw 'WS error';
    },
    handleWSMessage:    function(n) {
      eyc.isChatting = false;
      if (n && n.data) {
        var wsRes = JSON.parse(n.data);
        if (!eyc.socket.isStarted) {
          eyc.socket.isStarted = true;
          eyc.heartbeat();
        }
        if (wsRes) {
          switch (wsRes.action) {
            case 'loadTranscript':
              return eyc.loadTranscript(wsRes);
            case 'heartbeat':
              return;
            case 'reconnect':
              if (wsRes.session && wsRes.session.User) {
                return eyc.userReconnected(wsRes.session.User);
              } else {
                throw "Invalid WS disconnect payload";
              }
            case 'disconnect':
              if (wsRes.session && wsRes.session.User) {
                return eyc.userDisconnected(wsRes.session.User);
              } else {
                throw "Invalid WS disconnect payload";
              }
            default:
              if (wsRes.payload) {
                var pay = JSON.parse(wsRes.payload);
                if (pay && pay.sender && (pay.sender === 'server' || pay.sender === 'agent')) {
                  eyc.createMessage({ payload: JSON.stringify(pay) }, eyc.socket.typingElement, pay);
                } else {
                  eyc.addUserRequestNode(pay);
                }
              }
              return;
          }
        } else {
          throw "Invalid WS response payload";
        }
      } else {
        throw "Invalid WS response";
      }
    },
    handleWSOpen:       function(n) {
      if (!eyc.socket || !eyc.socket.isStarted) {
        eyc.startLoad();
      } else {
        eyc.handleInput();
      }
    },
    heartbeat:          function() {
      if (!eyc.socket) return;
      if (eyc.socket.readyState !== 1) return;
      eyc.socket.send(JSON.stringify(eyc.buildPayLoad("", "heartbeat")));
      setTimeout(eyc.heartbeat, 300000);
    },
    initializeWS:       function(isRestart) {
      if (eyc.env) {
        eyc.loadEnv();
      }
      eyc.socket = new WebSocket(wssURL+'?agentID='+window.agentID+'&channelID='+window.channelID+'&origin='+window.origin+'&guid='+window.guid+'&sessUUID='+window.sessUUID);
      eyc.socket.connectTime = Date.now();
      eyc.socket.queuedMessages = [];
      if (isRestart) {
        eyc.socket.isStarted = true;
      } else {
        eyc.socket.isStarted = false;
      }
      eyc.connectAttempts += 1;
      eyc.socket.onerror = eyc.handleWSError;
      eyc.socket.onopen = eyc.handleWSOpen;
      eyc.socket.onmessage = eyc.handleWSMessage;
      eyc.socket.onclose = eyc.handleWSClose;
    },
    inputButton:        function(ee) {
      if (!ee.target.classList.contains('icon-success')) {
        var input = eyc.workplace.getElementById(ee.target.id + '-input');
        var status = eyc.workplace.getElementById(ee.target.id + '-status');
        status.innerHTML = '&nbsp;';
        switch (ee.target.type) {
          case 'email':
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(input.value)) {
              ee.target.classList.remove('icon-send');
              ee.target.classList.add('icon-success');
              var ae = this;
              setTimeout(function() {
                ae.handleEvent(input.value, 'user_input', ee.target.id);
              }, 250);
            } else {
              status.innerHTML = 'Invalid Email';
            }
            break;
          case 'tel':
            var testNum = input.value.replace(/\D+/gm, '');
            if (testNum && testNum.length > 6) {
              ee.target.classList.remove('icon-send');
              ee.target.classList.add('icon-success');
              var ae = this;
              setTimeout(function() {
                ae.handleEvent(input.value, 'user_input', ee.target.id);
              }, 250);
            } else {
              status.innerHTML = 'Invalid Phone Number';
            }
            break;
          case 'name':
            if (/^[a-zA-Z ]+$/.test(input.value) && input.value.length > 2) {
              ee.target.classList.remove('icon-send');
              ee.target.classList.add('icon-success');
              var ae = this;
              setTimeout(function() {
                ae.handleEvent(input.value, 'user_input', ee.target.id);
              }, 250);
            } else {
              status.innerHTML = 'Invalid Name';
            }
            break;
          default:
            break;
        }
      }
    },
    loadEnv:            function() {
      switch(eyc.env) {
        case 'dev':
        case 'local-chat-dev':
        case 'local-css-dev':
        case 'local-dev':
          wssURL = devURL;
          break;
      }
    },
    loadTranscript:     function(data) {
      if (data && data.payload) {
        var transcript = JSON.parse(data.payload);
        for (var i in transcript) {
          var inp = transcript[i];
          if (inp.sender === 'user') {
            eyc.addUserRequestNode({ text: inp.message });
          } else if (inp.sender === 'server' || inp.sender === 'agent') {
            if (eyc.socket.typingElement) {
              eyc.createMessage({ payload: JSON.stringify({ text: inp.message }) }, eyc.socket.typingElement, inp);
            } else {
              eyc.createMessage({ payload: JSON.stringify({ text: inp.message }) }, null, inp);
            }
          }
        }
        if (data && data.session && data.session.IsOffline) {
          eyc.userDisconnected(data.session.User);
        }
      } else {
        throw 'malformed transcript data';
      }
    },
    removeEmpty:        function(nn) {
      nn.classList.add('remove-item');
      setTimeout(function() {
        nn.parentNode.removeChild(nn);
      }, 200);
    },
    scrollToBottom:     function() {
      var q = eyc.elements.queryResultWrapper;
      return q.scrollTop = q.scrollHeight;
    },
    sendButton:         function(ee) {
      if (ee.target.classList.contains('click-to-call')) {
        var aa = eyc.workplace.createElement('a');
        aa.href = 'tel:'+ee.target.id;
        aa.click();
        eyc.handleEvent('tel:'+ee.target.id);
        eyc.scrollToBottom();
      } else if (ee.target.classList.contains('web-url')) {
        var aa = eyc.workplace.createElement('a');
        aa.href = ee.target.value;
        aa.target = '_blank';
        aa.click();
        eyc.handleEvent('web}'+ee.target.value);
        eyc.scrollToBottom();
      } else {
        delete eyc.socket.turnType;
        delete eyc.socket.turnID;
        var flowUUID = ee.target.getAttribute('data-flow-uuid');
        var turnID = parseInt(ee.target.getAttribute('data-turn-id'));
        var pos;
        if (flowUUID && turnID && !isNaN(turnID)) {
          pos = { flowUUID: flowUUID, turnID: turnID };
        }
        eyc.handleEvent(ee.target.id, null, null, pos);
      }
    },
    setAuthor:         function(name) {
      var na = eyc.workplace.createElement('div');
      na.className = 'server-response-container';
      na.innerHTML = '<div class="author-name">' + name + '</div>';

      var aa = eyc.workplace.getElementById('result');
      aa.appendChild(na);
      eyc.scrollToBottom();
    },
    setButtons:         function(ee, nn, inp) {
      var sc = nn.getElementsByClassName('server-response');
      if (sc && sc.length && sc.length === 1) {
        while (sc[0].firstChild) {
          sc[0].removeChild(sc[0].firstChild);
        }
        var isInput = false;
        for (var i in ee) {
          if (i == 0 && ee.length === 1 && ee[i].classList.contains('user-input-container')) {
            isInput = true;
          }
          sc[0].appendChild(ee[i]);
        }
        if (isInput) {
          sc[0].classList.add('user-input-wrapper');
        } else {
          sc[0].classList.add('chat-buttons');
        }
        return nn;
      } else {
        console.warn('unexpected response', nn);
      }
    },
    setInputValue:      function(e) {
      return eyc.elements.queryInput.value = e;
    },
    setMultimedia:      function(ee, nn, inp) {
      var sc = nn.getElementsByClassName('server-response');
      if (sc && sc.length && sc.length === 1) {
        while (sc[0].firstChild) {
          sc[0].removeChild(sc[0].firstChild);
        }
        sc[0].classList.add('chat-multimedia');
        sc[0].appendChild(ee);
        return nn;
      } else {
        console.warn('unexpected response', nn);
      }
    },
    setText:            function(ee, nn, inp) {
      var sc = nn.getElementsByClassName('server-response');
      if (sc && sc.length && sc.length === 1) {
        sc[0].innerHTML = ee;
        if (inp && inp.sender && inp.sender === 'agent') {
          var name = inp.name;
          if (inp.agentID === agentID) {
            name = "Me";
          }
          if (name) {
            eyc.setAuthor(name);
          }
        }
        return nn;
      } else {
        console.warn('unexpected response', nn);
      }
    },
    startChat:          function() {
      eyc.mapElements();
      eyc.elements.queryInput.addEventListener("keydown", eyc.handleInputKeyDown, !1);
      window.addEventListener("message", eyc.handleChatWindow, !1);
      eyc.elements.queryInput.addEventListener("input", eyc.handleInputChange, !1);
      eyc.elements.sendBtn.addEventListener("click", eyc.handleSendClick, !1);
      eyc.elements.sendBtn.addEventListener("touchstart", eyc.handleSendClick, !1);
      eyc.elements.queryInput.addEventListener("focus", eyc.handleInputFocus, !1);
      if (!eyc.socket) {
        eyc.initializeWS();
      }
      eyc.inputHeight = Math.max(
        eyc.elements.queryInputWrapper.clientHeight,
        eyc.elements.queryInputWrapper.offsetHeight,
        eyc.elements.queryInputWrapper.scrollHeight
      );
      eyc.scrollToBottom();
    },
    startLoad:          function() {
      return eyc.handleEvent('loadTranscript', 'loadTranscript');
    },
    updateResponses:    function() {
      var tc = [];
      var aa = eyc.workplace.getElementById(eIDs.queryResult);
      var j = aa.childNodes.length - 1;
      while (j >= 0) {
        if (aa.childNodes[j].classList.contains('user-request-container') || aa.childNodes[j].classList.contains('remove-item')) {
          break;
        } else {
          var cn = aa.childNodes[j].getElementsByClassName('server-response');
          if (cn.length > 1) {
            console.warn('unexpected element', cn);
            break;
          } else if (cn.length > 0 && !cn[0].classList.contains('chat-buttons') && !cn[0].classList.contains('user-input-wrapper') &&
                  !cn[0].classList.contains('author-name')) {
            tc.push(j);
          } else {
            var icon = aa.childNodes[j].getElementsByClassName('server-icon');
            if (icon.length > 1) {
              console.warn('unexpected element', icon);
              break;
            } else if (cn.length > 0) {
              icon[0].innerHTML = '';
            }
          }
        }
        j--;
      }
      for (var k = 0; k < tc.length; k++) {
        var idx = tc[k];
        var icon = aa.childNodes[idx].getElementsByClassName('server-icon');
        if (!icon || !icon.length || icon.length !== 1) {
          console.warn('unexpected element', icon);
          break;
        }
        if (k > 0) {
          icon[0].innerHTML = '';
        } else {
          icon[0].innerHTML = '<div class="server-icon-img"></div>';
        }
      }
      eyc.scrollToBottom();
    },
    userReconnected:    function(user) {
      eyc.addStatusMessage(user.first_name + ' ' + user.last_name + ' just came back online');
      eyc.elements.queryInputWrapper.style.display = 'block';
      var status = eyc.workplace.getElementById(eIDs.statusMessageData);
      if (status) {
        status.parentNode.removeChild(status);
        eyc.scrollToBottom();
      }
    },
    userDisconnected:   function(user) {
      eyc.addStatusMessage(user.first_name + ' ' + user.last_name + ' is currently offline');
      eyc.elements.queryInputWrapper.style.display = 'none';
      if (user.email || user.phone) {
        var msg = 'You can reach them at ';
        if (user.phone) {
          msg += '<a href="tel:' + user.phone + '">' + user.phone + '</a>';
        }
        if (user.email) {
          if (user.phone) {
            msg += ' or ';
          }
          msg += '<a href="mailto:' + user.email + '">' + user.email + '</a>';
        }
        var status = eyc.workplace.getElementById(eIDs.statusMessageData);
        if (!status) {
          status = eyc.workplace.createElement("div");
          status.id = eIDs.statusMessageData;
          status.className = 'status-container';
          status.innerHTML = '<div class="status-update">' + msg + '</div>';
          eyc.elements.queryResult.appendChild(status);
        } else {
          status.innerHTML = '<div class="status-update">' + msg + '</div>';
          status.parentNode.removeChild(status);
          eyc.elements.queryResult.appendChild(status);
        }
        eyc.scrollToBottom();
      }
    }
  };
  window.eyc = eyc;

} catch(e) {
  console.error(e);
  if (typeof gtag !== 'undefined') {
    gtag('event', window.location.hostname, { event_category: 'chat_client_error', event_label: (e && e.stack) ? e.stack : e });
  }
}
