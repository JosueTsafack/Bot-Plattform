import { error } from 'util';

var axios = require('axios')

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

var LPUtils = function () {
  function parse(jsonp) {
    if (jsonp.indexOf(";") > 0) {
      jsonp = jsonp.substring(0, jsonp.indexOf(";"));
    }
    var parse = JSON.parse(jsonp.substring(jsonp.indexOf("(") + 1, jsonp.length - 1))
    return parse;
  }


  function LPUtils() {
    _classCallCheck(this, LPUtils);
  }

  LPUtils.getDomain = function getDomain(account, name) {
    return new Promise(function (res, rej) {
      return axios.get("https://adminlogin.liveperson.net/csdr/account/" + account + "/service/" + name + "/baseURI.lpCsds?version=1.0").then(function (response) {
        if (!parse(response.data).ResultSet.lpData) return rej("Fehler beim anmelden");
        return res(parse(response.data).ResultSet.lpData[0].lpServer);
      }).catch(err => {
        console.log(err)
        return rej(err);
      })
    });
  };

  LPUtils.agentProfile = function agentProfile(account, agentID) {
    var _this = this;
    return new Promise(function (res, rej) {
      return _this.getDomain(account, "acCdnDomain").then(function (accdnDomain) {
        return axios.get("https://" + accdnDomain + "/api/account/" + account + "/configuration/le-users/users/" + agentID).then(function (response) {
          return res(accdnResp);
        }).catch(err => {
          console.log(err)
          return rej(err);
        })
      });
    });
  };

  LPUtils.signup = function signup(account) {
    var _this2 = this;
    return new Promise(function (res, rej) {
      return _this2.getDomain(account, "idp").then(function (idpDomain) {
        return axios.get("https://" + idpDomain + "/api/account/" + account + "/signup.jsonp").then(function (response) {
          return res(parse(response.data).jwt);
        }).catch(err => {
          console.log(err)
          return rej(err);
        })
      });
    });
  };

  // fetch jwt from localstorage or create one
  LPUtils.getJWT = function getJWT(account) {
    var localJWT = localStorage.getItem(account + "-jwt");
    if (localJWT) return Promise.resolve(localJWT);
    else return this.signup(account).then(function (newJWT) {
      localStorage.setItem(account + "-jwt", newJWT);
      return Promise.resolve(newJWT);
    });
  };

  LPUtils.clearJWT = function clearJWT(account) {
    localStorage.removeItem(account + "-jwt");
  };

  return LPUtils;
}();
var LPWs = function () {
  LPWs.connect = function connect(url) {
    return new LPWs(url)._connect();
  };

  LPWs.connectDebug = function connectDebug(url) {
    return new LPWs(url, true)._connect();
  };

  function LPWs(url) {
    _classCallCheck(this, LPWs);

    this.reqs = {};
    this.subs = [];
    this.url = url;
  }

  LPWs.prototype._connect = function _connect() {
    var _this3 = this;

    return new Promise(function (resolve, reject) {
      var ws = new WebSocket(_this3.url);
      _this3.ws = ws;
      ws.onopen = function () {
        return resolve(_this3);
      };
      ws.onmessage = function (msg) {
        return _this3.onmessage(msg);
      };
      ws.onclose = function (evt) {
        _this3.ws = null;
        reject(evt);
      };
    });
  };

  LPWs.prototype.request = function request(type, body, headers) {
    var _this4 = this;

    return new Promise(function (resolve, reject) {
      var obj = {
        "kind": "req",
        "type": type,
        "body": body || {},
        "id": Math.floor(Math.random() * 1e9),
        "headers": headers
      };
      _this4.reqs[obj.id] = function (type, code, body) {
        return resolve({
          type: type,
          code: code,
          body: body
        });
      };
      var str = JSON.stringify(obj);
      if (_this4.debug) console.log("sending: " + str);
      _this4.ws.send(str);
    });
  };

  LPWs.prototype.onNotification = function onNotification(filterFunc, _onNotification) {
    this.subs.push({
      filter: filterFunc,
      cb: _onNotification
    });
  };

  LPWs.prototype.toFuncName = function toFuncName(reqType) {
    var str = reqType.substr(1 + reqType.lastIndexOf('.'));
    return str.charAt(0).toLowerCase() + str.slice(1);
  };

  LPWs.prototype.registerRequests = function registerRequests(arr) {
    var _this5 = this;

    arr.forEach(function (reqType) {
      return _this5[_this5.toFuncName(reqType)] = function (body, headers) {
        return _this5.request(reqType, body, headers);
      };
    });
  };

  LPWs.prototype.onmessage = function onmessage(msg) {
    if (this.debug) console.log("recieved: " + msg.data);
    var obj = JSON.parse(msg.data);
    if (obj.kind == "resp") {
      var id = obj.reqId;
      delete obj.reqId;
      delete obj.kind;
      this.reqs[id].call(this, obj.type, obj.code, obj.body);
      delete this.reqs[id];
    } else if (obj.kind == "notification") {
      this.subs.forEach(function (sub) {
        if (sub.filter.call(this, obj)) {
          sub.cb.call(this, obj.body);
        };
      });
    }
  };

  return LPWs;
}();

export {
  LPWs,
  LPUtils
}
