// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      登录数据管理
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var LoginEvent = require("login_event");
var LoginPlatform = require("login_platform");
var ServerData = {
    ["sh"] : {
            ["1"]:"英雄之路",
        }
    ,["shmix"]:{
        ["1"]:"风王结界",
        ["2"]:"魔力领域",
    }
}
var LoginModel = cc.Class({

    ctor: function () {
        this.server_list = [];
        this.login_info = {};   //登入游戏数据
        this.isSocket = false;
    },

    properties: {
    },

    initConfig: function () {
        // this.login_info.platform = PLATFORM_NAME //暂时的
        this.login_info.ip = "";
        this.login_info.port = "";
        this.login_info.role_count = "0";
        this.login_info.status = "0";      // 默认的服务器拥挤状态
        this.login_info.isNew = false;     // 是否是新服
        this.login_info.isClose = false;   // 是否关服
        this.login_info.host = "";         // host
        this.login_info.open_time = 0;
        this.login_info.srv_name = "";
        this.login_info.srv_id = "";
        this.login_info.main_srv_id = "";
        this.login_info.rid = 0;
        this.login_info.usrName = "";
        this.login_info.password = "";
        this.login_info.tuijianCareer = 0;  // 推荐职业 来源于 10100
        this.login_info.platform_flag = ""; // 平台标签

        // 从本地缓存读取最后一次使用的账号和密码
        this.login_info.usrName = gcore.SysEnv.get("user_name") || "";
        this.login_info.password = gcore.SysEnv.get("password") || "";
    // this.loginData.usrNameList = SysEnv:getInstance():getTable(SysEnv.keys.usrNameList)

    },

    //获取登录数据
    getLoginInfo: function () {
        return this.login_info;
    },
    // http://localhost:7456/193.112.64.90/server_list/role_h5.php?type=json&platform=sy&chanleId=dev&account=T37JzBUi4LQ&srvid=&start=0&num=1&time=1725881546
    // 请求默认服务器信息
    requestDefaultServer: function () {
        //1默认 0所有
        var account = this.login_info.account || '';
        var srv_id = "";
        let str_ = "srv_id" + this.login_info.usrName;
        console.log("---服务器---", str_,gcore.SysEnv.get(str_))
        if(gcore.SysEnv.get(str_)){
            srv_id = gcore.SysEnv.get(str_)
        }
        var time = gcore.SmartSocket.getTime();
        //var url = SERVER_LIST_URL + "?platform=" + PLATFORM + "&chanleId=" + CHANNEL + "&account=" + account + "&srvid=" + srv_id + "&start=0&num=1"+"&time="+time;//默认
        //var url1 = SERVER_LIST_URL + "?platform=" + PLATFORM + "&chanleId=" + CHANNEL + "&account=" + account + "&srvid=" + srv_id + "&start=0&num=0"+"&time="+time;//所有
        //var url = SERVER_LIST_URL + "?type=json&platform=" + 1 + "&chanleId=" + 1 + "&account=" + 1 + "&srvid=" + 1 + "&start=0&num=1"+"&time="+1;//默认
        var url = SERVER_LIST_URL + "?type=json&platform=" + PLATFORM + "&chanleId=" + CHANNEL + "&account=" + account + "&srvid=" + srv_id + "&start=0&num=1"+"&time="+time;//
        var url1 = url;//所有
        cc.loader.load(url, (function (err, json) {
            cc.log("默认服务器列表");
            var objs = JSON.parse(json);
            cc.log(objs);
            this.handleDefaultServer(objs);
            cc.loader.load(url1, (function (err, json) {
                var objs1 = JSON.parse(json);
                this.handleAllServer(objs1)
            }).bind(this));
        }).bind(this));
    },

    // 获取默认服务器列表
    requestDefaultServerList: function(account, platform) {
        account = account || this.loginData.usrName || "";
        platform = platform || PLATFORM_NAME;
        this.account = account;
        this.platform = platform;
        var srv_id = "";
        // console.log("---服务器---", gcore.SysEnv.get("srv_id"))
        // if(gcore.SysEnv.get("srv_id")){
        //     srv_id = gcore.SysEnv.get("srv_id")
        // }
        let str_ = "srv_id" + this.login_info.usrName;
        console.log("---服务器---",str_, gcore.SysEnv.get(str_))
        if(gcore.SysEnv.get(str_)){
            srv_id = gcore.SysEnv.get(str_)
        }
        var channelId = LoginPlatform.getInstance().getChannel();
        var finalChannelId = LoginPlatform.getInstance().getFinalChannel();
        if (!finalChannelId)
            finalChannelId = CHANNEL;
        // if (channelId)
            // account = channelId + "_" + account;
        var time = gcore.SmartSocket.getTime();
        var url = SERVER_LIST_URL + "?platform=" + platform + "&chanleId=" + finalChannelId + "&account=" + account + "&srvid=" + srv_id + "&start=0&num=1"+"&time="+time; //默认
        var url1 = SERVER_LIST_URL + "?platform=" + platform + "&chanleId=" + finalChannelId + "&account=" + account + "&srvid=" + srv_id + "&start=0&num=0"+"&time="+time; //所有        
        console.log("请求服务器列表链接" + url);
        cc.loader.load(url, function (err, json) {
            var objs = JSON.parse(json);
            this.handleSDKDefaultServer(objs, account, platform);
            cc.log(objs);
            if(USE_SDK == true && PLATFORM_TYPR == "SH_SDK"){
                SDK.dataPlacement(75000);
            }
            cc.loader.load(url1, (function (err, json) {
                var objs1 = JSON.parse(json);
                this.handleAllServer(objs1)
            }).bind(this));            
        }.bind(this))

    },

    // 获取所有服务列表
    requestAllDefaultServerList: function() {
        
    },


    handleSDKDefaultServer: function(objs, account, platform) {
        var data = objs.data || objs.msg;
        if (typeof data != 'object') {
            return;
        }
        if (this.login_info.srv_name) {
            return;
        }
        var server = this.convertServerInfo(this.getDefServer(data));
        this.setCurServer(server);
        gcore.GlobalEvent.fire(LoginEvent.LOGIN_EVENT_DEFSERVER_SUCCESS);        
    },

    //随机数组
    randomDefServer(arr){
      var i =arr.length ,t,j;
      while(i>0){
        j = Math.floor(Math.random()*i);
        i--;
        t = arr[i];
        arr[i]=arr[j];
        arr[j]=t;
      }
      return arr.pop();
    },

    //默认一个服务器给玩家
    getDefServer(data){
        var key = this.login_info.account;
        var serverTime = gcore.SmartSocket.getTime();
        var srv_name = gcore.SysEnv.get(cc.js.formatStr("%s_srv_name",key)) || "";
        var defserver = null;
        if(srv_name == ""){
          const arr = [];
          for(let index in data.server_list){
              let info = data.server_list[index];
              var serverOpenTime = info.open_time || info.begin_time;
              if(info.isnew == "1" && serverOpenTime <= serverTime){
                arr.push(index);
              }
          }
          let i = "";
          if(arr.length >0){
            i = this.randomDefServer(arr);
          }else{
            for(let index = 0;index<data.server_list.length;index++){
              arr.push(index);
            }
            i = this.randomDefServer(arr);
          }
        
          if(i!= null || i!=""){
            defserver = data.server_list[i];
          }
        }else{
          for(let info of data.server_list){
            if(info.srv_name == srv_name){
              defserver = info;
              break;
            } 
          }
        }
        if(defserver == null){
          defserver = data.default_zone;
        }
        return defserver;
    },

    // 处理默认服务器信息
    handleDefaultServer: function (objs) {
        var data = objs.data || objs.msg;
        if (typeof data != 'object') {
            return;
        }
        if (this.login_info.srv_name) {
            return;
        }
        var server = this.convertServerInfo(this.getDefServer(data));
        this.setCurServer(server);
        gcore.GlobalEvent.fire(LoginEvent.LOGIN_EVENT_DEFSERVER_SUCCESS);
    },

    handleAllServer: function (objs) {
        var data = objs.data || objs.msg;
        if (typeof data != 'object') {
            return;
        }
        this.server_list = []
        for (let i = 0; i < data.server_list.length; ++i) {
            let list = Utils.deepCopy(this.convertServerInfo(data.server_list[i]))
            this.server_list.push(list)
        }

    },

    // 服务器信息数据转换
    convertServerInfo: function (server) {
        return {
            srv_name: server.name || server.srv_name
            , srv_id: server.srv_id || server.platform + "_" + server.zone_id
            , ip: server.ip || server.host
            , host: server.host || server.ip
            , port: server.port
            , ws: server.ws || "ws"
            , zone_id: server.zone_id
            , platform: server.platform
            , main_srv_id: server.main_srv_id
            , is_close: server.maintain == 1
            , is_try: server.first_zone == 1
            , is_new: Number(server.isnew) == 1
            , is_recomed: server.recomed == 1
            , open_time: server.open_time || server.begin_time
            , roles: server.roles || []
            , group_num: server.group_num || 1
            , group_id: server.group_id || 1
        };
    },

    // 设置当前服务器信息
    setCurServer: function (server) {
        this.login_info.ip = server.ip;
        this.login_info.host = server.host;
        this.login_info.port = server.port;
        this.login_info.ws = server.ws;
        this.login_info.srv_id = server.srv_id;
        this.login_info.platform = server.platform;
        this.login_info.zone_id = server.zone_id;
        this.login_info.srv_name = server.srv_name;
        this.login_info.open_time = server.open_time;
        this.login_info.is_close = server.is_close;
        this.login_info.is_new = server.is_new;
        gcore.GlobalEvent.fire(LoginEvent.LOGIN_EVENT_CUR_SERVER_UPDATE);
    },

    // 查找指定服务器信息
    findServer: function (srv_id) {
        if (srv_id) {        
            for (var srv_i in this.server_list) {
                if (this.server_list[srv_i].srv_id == srv_id) {
                    return this.server_list[srv_i]
                }
            }
        }
        return null;
    },
    //获取服务器列表
    getServerList() {
        return this.server_list;
    },
    //获取对应服务器信息
    getServerInfo(index) {
        if (this.server_list[index]) {
            return this.server_list[index];
        }
    },
    //获取当前服务器名称
    getSvrName: function (srv_id) {
        if (this.server_list == null || srv_id == null) {
            return ""
        }
        for (var i in this.server_list) {
            var v = this.server_list[i];
            if (v.srv_id == srv_id) {
                return v.srv_name;
            }
        }
        return ""
    },

    setIsSocket(bool) {
        this.isSocket = bool;
    },

    getLoginData: function() {
        return this.login_info;
    },

    checkReloadServerData(data){
        let now = gcore.SmartSocket.getTime()
        this.check_time = this.check_time || 0;
        if(now - this.check_time > 10){
            this.check_time = now
            if(this.account && this.platform){
                this.requestDefaultServerList(this.account,this.platform)
            }
        }

    },

    setFirstRoleData:function(data){
        this.first_role_data = data;
    },

    getFirstRoleData:function(){
        return this.first_role_data;
    },

    getSrvGroupNameByGroupId:function(group_id){
        if(group_id == null)  return "";

        let srv_cfg = ServerData[PLATFORM_NAME]
        if(srv_cfg){
            return srv_cfg[group_id]
        }
        return ""
        // if(group_id == null)  return "";
        // let platform_id  = 1
        // if(PLATFORM_NAME == "sh"){
        //     platform_id = 1
        // }else if(PLATFORM_NAME == "shmix"){
        //     platform_id = 2
        // }
        // let srv_cfg = ServerData[group_id]
        // if(srv_cfg){
        //     return srv_cfg[platform_id] || ""
        // }
        // return ""
    },
});

module.exports = LoginModel;
