//日志上报
//zys
var LOG_TYPE = {
    device: "device"
    , flash: "flash"
    , advice: "advice"
    , load_start: "load_start"
    , load_end: "load_end"
    , reg_acc: "reg_acc"
    , select_srv: "select_srv"
    , create_role: "create_role"
    , get_def_srv: "get_def_srv"
    , enter_city: "enter_city"
}

//是否记录日志
var _is_log = true;
_is_log = _is_log && LOG_URL != null

window.cli_log = {

    //日志上报
    log_to_web: function (url_type, log_args) {
        return
        if (!_is_log) return
        let url = LOG_URL + url_type;
        // console.log("上报开始url===", url)
        let date_time = Math.ceil(Date.now() / 1000);
        let body = "?date_time=" + this.log_url_encode(date_time);
        let sign = this.getSignValue(date_time);
        body = body + "&sign=" + sign;
        for (let k in log_args) {
            body = body + "&" + k + "=" + this.log_url_encode(log_args[k]);
        }
        url = url + body;
        console.log(url_type,log_args.step)
        // console.log("push_log==>", url);
        let xhr = cc.loader.getXMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
                var result = JSON.parse(xhr.responseText);
                // console.log("result==>", result)
                if (result["success"] == false) {
                    // console.log(result["message"]);
                    return;
                }
            }
        }.bind(this);
        xhr.send();
    },

    getSignValue: function (date_time) {
        return
        var value = "";
        var key = SIGN_KEY;
        value = value + PLATFORM_TYPR;
        value = value + date_time;
        value = value + key;

        var MD5 = require("md5.min");
        value = MD5(value);
        value = value.toLowerCase();
        return value
    },

    //上报信息到注册服
    log_to_idfa_web: function (body) {
        // if (!window.CONF_IDFA_WEB) return
        // let url = window.CONF_IDFA_WEB
    },

    //url编码
    log_url_encode: function (str) {
        return
        str = String(str);
        let _str = str;
        str = str.replace(/\n/g, "\\r\\n");
        let format = function (c) {
            return cc.js.formatStr("%%%02X", c.charCodeAt(0))
        }
        str = str.replace("([^%w ])", format);
        str = str.replace(" ", "+");
        // console.log(_str, "=====url_str======>", str)
        return str
    },

    //获取设备基本信息
    log_get_device_info: function () {
        return
        let channel = window.CHANNEL;
        let pro = "h5sszg";
        let plat = PLATFORM_NAME;
        return {
            device_id: SDK ? SDK.getUid() : "1"     //暂时用uid代替
            , device_type: 1    //暂时没获取
            , os: cc.sys.os
            , carrier: ""       //暂时没获取
            , network_type: cc.sys.getNetworkType() == 1 ? "wifi" : "数据"
            , resolution: ''
            , product_name: pro
            , platform_name: plat
            , channel_name: channel
        }
    },

    //获取日志当前标识
    log_flag: function (key, val) {
        return
        if (!_is_log) return false
        val = val || 1;
        let str = "";
        if (PLATFORM_TYPR == "SH_RH") {
            str = "shrh_log_flag";
        }
        let uid = "";
        if (SDK) {
            uid = SDK.getUid();
        } else {
            uid = "3";
        }
        console.log(uid,key,val)
        console.log("日志bool==",gcore.SysEnv.get(str) == cc.js.formatStr("uid=%s&key=%s&val=%s", uid, key, val),gcore.SysEnv.get(str),cc.js.formatStr("uid=%s&key=%s&val=%s", uid, key, val))
        if (gcore.SysEnv.get(str) == cc.js.formatStr("uid=%s&key=%s&val=%s", uid, key, val)) {
            return false
        } else {
            gcore.SysEnv.set(str, cc.js.formatStr("uid=%s&key=%s&val=%s", uid, key, val));
            return true
        }
    },

    //设备激活
    log_activate_device: function () {
        return
        if (this.log_flag(LOG_TYPE.device)) {  //未上报过 上报一次
            let log = this.log_get_device_info();
            this.log_to_web("/device/activation", log);
        }
    },

    //闪屏 step.1
    log_flash: function () {
        return
        if (this.log_flag(LOG_TYPE.flash)) {   //未上报过 上报一次
            let log = this.log_get_device_info();
            log.step = 1;
            this.log_to_web("/entry/step", log);
        }
    },

    // 忠告 step.2
    log_advice: function () {
        return
        if (this.log_flag(LOG_TYPE.advice)) {    //未上报过 上报一次
            let log = this.log_get_device_info();
            log.step = 2;
            this.log_to_web("/entry/step", log);
        }
    },

    //加载游戏开始 step.3
    log_loading_start: function () {
        return
        if (this.log_flag(LOG_TYPE.load_start)) {    //未上报过 上报一次
            let log = this.log_get_device_info();
            log.step = 3;
            this.log_to_web("/entry/step", log);
        }
    },

    // 加载游戏结束 step.4
    log_loading_end: function () {
        return
        if (this.log_flag(LOG_TYPE.load_end)) {    //未上报过 上报一次
            let log = this.log_get_device_info();
            log.step = 4;
            this.log_to_web("/entry/step", log);
        }
    },

    //注册账号 step.5
    log_reg_account: function (account) {
        return
        if (this.log_flag(LOG_TYPE.reg_acc)) {    //未上报过 上报一次
            let log = this.log_get_device_info();
            log.step = 5;
            log.account_id = account;
            log.account_name = account;
            this.log_to_web("/entry/step", log);
        }
    },

    //选服 step.6
    log_select_server: function (account) {
        return
        if (this.log_flag(LOG_TYPE.select_srv)) {    //未上报过 上报一次
            let log = this.log_get_device_info();
            log.step = 6;
            log.account_id = account;
            log.account_name = account;
            this.log_to_web("/entry/step", log);
        }
    },

    //创建角色 step.7
    log_create_role: function (account) {
        return
        this.log_select_server(account);//防止有选服地方没处理到
        if (this.log_flag(LOG_TYPE.select_srv)) {    //未上报过 上报一次
            let log = this.log_get_device_info();
            log.step = 7;
            log.account_id = account;
            log.account_name = account;
            this.log_to_web("/entry/step", log);
        }
    },

    //起名 step.8
    log_enter_city: function (account) {
        return
        if (this.log_flag(LOG_TYPE.enter_city)) {    //未上报过 上报一次
            let log = this.log_get_device_info();
            log.step = 8;
            log.account_id = account;
            log.account_name = account;
            this.log_to_web("/entry/step", log);
        }
    },

    //获取到默认服 step.9
    log_get_def_srv: function (account) {
        return
        this.log_enter_city(account);//防止有选服地方没处理到
        if (this.log_flag(LOG_TYPE.get_def_srv)) {    //未上报过 上报一次
            let log = this.log_get_device_info();
            log.step = 9;
            log.account_id = account;
            log.account_name = account;
            this.log_to_web("/entry/step", log);
        }
    },
}

// cli_log.log_activate_device(); //加载文件开始上报激活设备
// cli_log.log_flash();
// cli_log.log_advice();
// console.log("is_log===", _is_log, cc.sys.getNetworkType() == 1 ? "wifi" : "数据", cc.sys.os);