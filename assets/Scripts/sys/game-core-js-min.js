var gcore = gcore || {};
module.exports = gcore;
var BaseEvent = cc.Class({
    ctor: function () {
        this._evt_idx = 0, this._evt_list = {}
    }, bind: function (t, e, i) {
        if (t) {
            if (e) {
                this._evt_list.hasOwnProperty(t) || (this._evt_list[t] = {});
                var s = this._evt_idx++;
                return this._evt_list[t][s] = {f: e, o: i}, {evt: t, id: s}
            }
            cc.log("evt_func===null")
        } else cc.log("evt_label===null")
    }, unbind: function (t) {
        this._evt_list.hasOwnProperty(t.evt) && (delete this._evt_list[t.evt][t.id], 0 == Object.keys(this._evt_list[t.evt]).length && delete this._evt_list[t.evt])
    }, fire: function (t) {
        if (this._evt_list.hasOwnProperty(t)) {
            var e = this._evt_list[t], i = Array.prototype.slice.apply(arguments);
            for (var s in i.shift(), e) e[s].f.apply(e[s].o, i)
        }
    }
});
gcore.BaseEvent = BaseEvent;
var Proto = require("proto_mate"), SmartSocket = {
    idx: 0,
    ws: null,
    buffer: null,
    cmd_func_list: [],
    msg_list: [],
    diff_time: 0,
    wait_time: 0,
    getInstance: function () {
        return this
    },
    getTime: function () {
        return this.diff_time + parseInt(Date.now() / 1e3)
    },
    getMsTime: function () {
        return 1e3 * this.diff_time + Date.now()
    },
    setTime: function (t) {
        this.diff_time = t - parseInt(Date.now() / 1e3)
    },
    init: function () {
        this.is_init || (this.is_init = !0, Uint8Array.prototype.slice || (Uint8Array.prototype.slice = Array.prototype.slice), this.bindCmd(1199, this.on1199.bind(this)))
    },
    on1199: function (t) {
        this.restHeartbeat(), this.setTime(t.time)
    },
    tick: function () {
        this.send(1199, {}), this.setTickTimer()
    },
    restHeartbeat: function () {
        this.wait_time = 0
    },
    updateTimer: function () {
        this.ws && (this.wait_time += 1), 10 <= this.wait_time ? this.close() : 6 <= this.wait_time && this.send(1199, {})
    },
    setTickTimer: function () {
        this.heart_timer || (this.heart_timer = gcore.Timer.set(this.updateTimer.bind(this), 1e3, -1))
    },
    stopHeart: function () {
        this.heart_timer && (gcore.Timer.del(this.heart_timer), this.heart_timer = null)
    },
    clearTickTimer: function () {
        this.tick_timer && (window.clearTimeout(this.tick_timer), this.tick_timer = null)
    },
    connect: function (t, e, i) {
        //i = i || "ws", OUT_NET && (i = "wss"), this.host = t, this.port = e, this.ws = i, this.buffer = null, this.msg_list = [], (i = new WebSocket("ws://10.0.0.23:1234/websocket")).binaryType = "arraybuffer";
        i = i || "ws", OUT_NET && (i = "wss"), this.host = t, this.port = e, this.ws = i, this.buffer = null, this.msg_list = [], (i = new WebSocket(i + "://" + t + ":" + e + "/websocket")).binaryType = "arraybuffer";
        var s = i.net_id = ++this.idx;
        this.ws = i, Log.debug("socket_connect start", i, t, e, s), i.onopen = function (t) {
            s == this.idx && (Log.debug("socket_connected", t, i), this.ws = i, gcore.GlobalEvent.fire(gcore.GlobalEvent.EVT_SOCKET_CONNECT), this.setTickTimer(), this.restHeartbeat())
        }.bind(this), i.onclose = function (t) {
            s == this.idx && (Log.debug("socket_close", t), gcore.GlobalEvent.fire(gcore.GlobalEvent.EVT_SOCKET_DISCONNECT), this.clearTickTimer(), this.ws = null)
        }.bind(this), i.onerror = function (t) {
        }.bind(this), i.onmessage = function (t) {
            this.restHeartbeat(), this.doRecv(t.data)
        }.bind(this)
    },
    close: function () {
        this.ws && (this.ws.close(), this.ws = null)
    },
    bindCmd: function (t, e) {
        this.cmd_func_list.hasOwnProperty(t) || (this.cmd_func_list[t] = []), this.cmd_func_list[t].push(e)
    },
    send: function (t, e) {
        try {
            if (null == this.ws) return void Log.debug("send_msg_socket_not_connect");
            var i = this.packData(t, e), s = new ArrayBuffer(i.length + 4), r = new DataView(s);
            r.setUint32(0, i.length);
            for (var n = 0; n < i.length; n++) r.setUint8(n + 4, i[n]);
            Log.socket("send_cmd:" + t), this.ws.send(r.buffer)
        } catch (t) {
            Log.error("send_msg_error:" + t.message, t.stack)
        }
    },
    handleMsg: function () {
        if (0 != this.msg_list.length) for (var t = 0; t < 5; t++) {
            var e = this.msg_list.shift();
            if (this.onCmdCallback(e.cmd, e.data), 0 == this.msg_list.length) return
        }
    },
    onCmdCallback: function (e, i) {
        try {
            for (var t = this.cmd_func_list[e], s = 0; s < t.length; s++) {
                (0, t[s])(i)
            }
        } catch (t) {
            Log.error("handle_msg_error:" + e + ", err=" + t.message + ", data=" + i, t, t.stack)
        }
    },
    doRecv: function (t) {
        this.ws && this.ws.net_id == this.idx ? "string" != typeof t ? (t = null == this.buffer ? new Uint8Array(t) : this.buffer.concat(Array.from(new Uint8Array(t))), this.unpackBuffer(t)) : Log.info("recv=text= " + t) : Log.error("网络切换 本协议数据无效", this.ws, this.idx)
    },
    unpackBuffer: function (e) {
        if (e.length < 6) this.buffer = e; else {
            var t = new DataView(new Uint8Array(e).buffer), i = t.getUint32(0, !1);
            8e4 < i && (Log.error("data_to_long:" + i), this.ws.close());
            var s = e.length;
            if (!(s < i + 4)) {
                var r = 0;
                try {
                    r = t.getUint16(4, !1), this.unpackData(t, r, e, i)
                } catch (t) {
                    Log.error(r + ": unpackData_error:" + t.message, e, t.stack)
                }
                i + 4 < s ? (Log.socket("data_length==", r, i), this.unpackBuffer(e.slice(i + 4))) : this.buffer = null
            }
        }
    },
    unpackData: function (t, e, i, s) {
        if (!Proto.recv.hasOwnProperty(e)) throw new Error("unpackData查找不到协议定义：" + e);
        if (this.cmd_func_list.hasOwnProperty(e)) {
            Log.socket("unpackData==start===== " + e, s);
            var r = {}, n = Proto.recv[e];
            return this.unpackData_(t, i, r, n, 6, s), this.msg_list.push({
                cmd: e,
                data: r
            }), Log.socket("unpackData==end===== " + e, s), r
        }
        Log.socket("协议处理函数未定义:" + e)
    },
    unpackData_: function (t, e, i, s, r, n) {
        for (var a = 0, o = s.length; a < o; a++) {
            var c = s[a];
            switch (c.t) {
                case 1:
                    i[c.s] = t.getInt8(r, !1), r += 1;
                    break;
                case 2:
                    i[c.s] = t.getUint8(r, !1), r += 1;
                    break;
                case 3:
                    i[c.s] = t.getInt16(r, !1), r += 2;
                    break;
                case 4:
                    i[c.s] = t.getUint16(r, !1), r += 2;
                    break;
                case 5:
                    i[c.s] = t.getInt32(r, !1), r += 4;
                    break;
                case 6:
                    i[c.s] = t.getUint32(r, !1), r += 4;
                    break;
                case 7:
                    var h = t.getUint16(r, !1);
                    r += 2;
                    var u = new Uint8Array(e.slice(r, r + h)), f = String.fromCharCode.apply(null, u);
                    i[c.s] = decodeURIComponent(escape(f)), r += h;
                    break;
                case 8:
                    h = t.getUint32(r, !1);
                    r += 4, i[c.s] = e.slice(r, r + h), r += h;
                    break;
                case 9:
                    h = t.getUint16(r, !1);
                    r += 2;
                    var l = [];
                    i[c.s] = l;
                    for (var g = 0; g < h; g++) {
                        var d = {};
                        l[g] = d, r = this.unpackData_(t, e, d, c.f, r, n)
                    }
            }
        }
        return r
    },
    packData: function (t, e) {
        if (!Proto.send.hasOwnProperty(t)) throw new Error("unpackData查找不到协议定义：" + t);
        Log.socket("pack_data2:" + t);
        var i = Proto.send[t], s = [];
        return this.i16ToBytes(s, t), this.packData_(s, i, e), s
    },
    packData_: function (t, e, i) {
        for (var s = 0, r = e.length; s < r; s++) {
            var n = e[s], a = i[n.s];
            switch (n.t) {
                case 1:
                case 2:
                    t.push(new Uint8Array([a])[0]);
                    break;
                case 3:
                case 4:
                    this.i16ToBytes(t, a);
                    break;
                case 5:
                case 6:
                    this.i32ToBytes(t, a);
                    break;
                case 7:
                    this.strToBytes(t, a);
                    break;
                case 8:
                    var o = a.length;
                    this.i32ToBytes(t, o);
                    for (var c = 0; c < o; c++) t.push(a[c]);
                    break;
                case 9:
                    o = a.length;
                    this.i16ToBytes(t, o);
                    for (c = 0; c < o; c++) this.packData_(t, n.f, a[c])
            }
        }
    },
    strToBytes: function (t, e) {
        var i = unescape(encodeURIComponent(e)), s = i.length;
        this.i16ToBytes(t, s);
        for (var r = 0; r < s; r++) t.push(i.charCodeAt(r))
    },
    i16ToBytes: function (t, e) {
        var i = new Uint8Array(new Uint16Array([e]).buffer);
        t.push(i[1]), t.push(i[0])
    },
    i32ToBytes: function (t, e) {
        var i = new Uint8Array(new Uint32Array([e]).buffer);
        t.push(i[3]), t.push(i[2]), t.push(i[1]), t.push(i[0])
    }
};
SmartSocket.init(), gcore.SmartSocket = SmartSocket;
var CoreUtils = {
    dataName: function (n) {
        switch (window.DATA_TYPE || 1) {
            case 1:
                return n + ".json";
            case 2:
                return "jsc/" + n + ".json";
            case 3:
                return "jsc/" + n + ".zip"
        }
    }, parseData: function (n, o) {
        switch (window.DATA_TYPE || 1) {
            case 1:
            case 2:
                return void (Config[n] = o);
            case 3:
                var e = require("pako"), i = require("base64").Base64;
                return void (Config[n] = JSON.parse(e.inflate(i.atob(o), {to: "string"})))
        }
    }, getDataKeyVal: function (n, o, e, i) {
        if (Config[n]) if (Config[n][o]) {
            if (Config[n][o][e]) {
                var a = o + "_cache";
                Config[n][a] || (Config[n][a] = {});
                var r = Config[n][a][e];
                if (!r) {
                    r = {};
                    var t = o + "_fields", f = Config[n][o][e], g = Config[n][t];
                    if (!g) return f;
                    for (var s = 0, c = g.length; s < c; s++) r[g[s]] = f[s];
                    Config[n][a][e] = r
                }
                return r
            }
            0 != i && Log.debug("config_data_not_found", n, o, e)
        } else 0 != i && Log.debug("config_data_not_found", n, o); else 0 != i && Log.debug("config_data_not_found", n)
    }
};
gcore.CoreUtils = CoreUtils;
var GlobalEvent =
    {
        idx: 1, evts: {}, getInstance: function () {
            return this
        }, bind: function (t, e, s) {
            if (t) {
                if (e) {
                    this.evts.hasOwnProperty(t) || (this.evts[t] = {});
                    var n = this.idx++;
                    return this.evts[t][n] = {f: e, o: s}, {evt: t, id: n}
                }
                cc.log("evt_func===null")
            } else cc.log("evt_label===null")
        }, unbind: function (t) {
            this.evts.hasOwnProperty(t.evt) && (delete this.evts[t.evt][t.id], 0 == Object.keys(this.evts[t.evt]).length && delete this.evts[t.evt])
        }, fire: function (t) {
            if (this.evts.hasOwnProperty(t)) {
                var e = this.evts[t], s = cc.js.shiftArguments.apply(null, arguments);
                for (var n in e) e[n].f.apply(e[n].o, s)
            }
        }, EVT_SOCKET_CONNECT: "EVT_SOCKET_CONNECT", EVT_SOCKET_DISCONNECT: "EVT_SOCKET_DISCONNECT"
    };
gcore.GlobalEvent = GlobalEvent;
var Log = {
    debug: function () {
        if (DEBUG_LOG) return cc.log.apply(null, cc.js.array.appendObjectsAt(Array.prototype.slice.call(arguments), ["[debug]#"], 0))
    }, info: function () {
        if (INFO_LOG) return cc.log.apply(null, cc.js.array.appendObjectsAt(Array.prototype.slice.call(arguments), ["[info]#"], 0))
    }, error: function () {
        if (ERROR_LOG) return cc.error.apply(null, cc.js.array.appendObjectsAt(Array.prototype.slice.call(arguments), ["[error]#"], 0))
    }, socket: function () {
        if (SOCKET_LOG) return cc.log.apply(null, cc.js.array.appendObjectsAt(Array.prototype.slice.call(arguments), ["[socket]#"], 0))
    }
};
gcore.Log = Log;
var SysEnv = {
    getInstance: function () {
        return this
    }, get: function (t, e) {
        if (this[t]) return this[t];
        var n = cc.sys.localStorage.getItem(t);
        return n || (n = e), n && (this[t] = n), n
    }, set: function (t, e, n) {
        this[t] = e, 0 != n && cc.sys.localStorage.setItem(t, this[t])
    }, del: function (t) {
        delete this[t], cc.sys.localStorage.removeItem(t)
    }, clear: function () {
        cc.sys.localStorage.clear()
    }, setBool: function (t, e, n) {
        this.set(t, e.toString(), n)
    }, getBool: function (t) {
        return "false" != this.get(t)
    }, setInt: function (t, e, n) {
        this.set(t, e.toString(), n)
    }, getInt: function (t) {
        return Number(this.get(t, "0"))
    }, setObject: function (t, e, n) {
        this.set(t, JSON.stringify(e), n)
    }, getObject: function (t) {
        return JSON.parse(this.get(t, "{}"))
    }
};
gcore.SysEnv = SysEnv;
var Timer = {
    idx: 1, timer: {}, getInstance: function () {
        return this
    }, set: function (t, i, e, r) {
        return i = i || 1e3, e = e || 1, r || (r = this.idx++), this.del(r), this.timer[r] = window.setTimeout(function () {
            1 == e ? this.del(r) : this.set(t, i, e - 1, r), t()
        }.bind(this), i), r
    }, del: function (t) {
        this.timer.hasOwnProperty(t) && (window.clearTimeout(this.timer[t]), delete this.timer[t])
    }
};
gcore.Timer = Timer;