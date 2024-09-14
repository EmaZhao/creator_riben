// window.PACKAGE_VERSION = "0.1.19";
// window.CHANNEL = "";               // 深海融合的爱微游、疯狂游乐园的渠道
window.PACKAGE_NAME = "闪烁之光口袋版";  // 渠道号
window.SH_RH_PID = "0";                 //深海融合区别爱微游，游乐园的pid ， 
// window.AIWEIYOU_PID = "PM001163";        //爱微游PID：PM001163   
// window.YOULECHANG_PID = "PM001164";      //游乐场PID：PM001164
window.SH_RH_IS_SUBSCRIBE = false         //是否关注过了
window.SH_RH_IS_SHARE = false         //是否分享过了
window.SH_RH_IS_REALNAME = false         //是否实名过了
window.SH_RH_IS_WALLOW = true           //是否防沉迷
window.SH_RH_IS_SHOW_SUBSCRIBE = false       //是否显示关注功能
window.SH_RH_IS_SHOW_SHARE = false           //是否显示分享功能
window.SH_RH_IS_SHOW_REALNAME = false        //是否显示实名功能
window.SH_RH_IS_SHOW_BINDPHONE = false        //是否显示手机绑定功能

var LoginController = require("login_controller");
var RoleController = require("role_controller");
var WelfareController = require("welfare_controller");

var SH_RH = function () {
    this.uid = null;
};

//游戏加载完成、初始化SDK
SH_RH.initSDK = function () {
    cli_log.log_activate_device(); //加载文件开始上报激活设备
    cli_log.log_flash();
    this.login();
};

//调起SDK登录界面
SH_RH.login = function () {
    console.log("PACKAGE_VERSION=====>", PACKAGE_VERSION);
    console.log("调用深海融合SDK登录");
    if (!window.ShSdk) return
    console.log(ShSdk);
    // message("登录成功！");

    //游戏加载完成上报
    if (cli_log && cli_log.log_loading_end) {
        cli_log.log_loading_end();
    };

    if (!ShSdk) return;
    ShSdk.login(function (data) {
        console.log("深海融合SDK登录结果")
        window.SH_RH_TOKENID = data.tokenid;
        var href = window.location.href;
        var arr = href.split("?");
        let list = {};
        for (var i = 0; i < arr.length; i++) {
            var pair = arr[i].split("&");
            for (let j = 0; j < pair.length; j++) {
                var _arr = pair[j].split("=");
                list[_arr[0]] = _arr[1];
            }
        }
        window.SH_RH_PID = list["pid"];
        window.CHANNEL = window.SH_RH_PID;

        if (window.CHANNEL == "PM001318") {       //大混服
            window.PLATFORM_NAME = "shmix";
        } else {          //爱微游，疯狂游乐场
            window.PLATFORM_NAME = "sh"
        }
        // console.log("list==》", list);

        if (list["focus"] != null) {
            window.SH_RH_IS_SUBSCRIBE = Number(list["focus"]) == 1;
        }
        if (list["verify"] != null) {
            window.SH_RH_IS_REALNAME = Number(list["verify"]) == 1;
        }
        if (list["wallow" != null]) {
            window.SH_RH_IS_WALLOW = Number(list["wallow"]) == 1;
        }
        // console.log("获取到的window.SH_RH_PID==>", window.SH_RH_PID)

        this.postFunc(function (result) {
            this.uid = result.msg.uid;
            this.sign = result.msg.sign;
            // this.qd_uid = result.msg.uid;

            var login_data = {};
            login_data.usrName = "shrh_" + this.uid;
            login_data.password = "wx123456";

            //注册账号完成上报
            if (cli_log && cli_log.log_reg_account) {
                cli_log.log_reg_account(login_data.usrName);
            };

            // console.log("深海融合初始化成功，开始请求服务器列表", result);
            LoginController.getInstance().loginPlatformRequest(login_data);
        }.bind(this))


        // if (window.SH_RH_PID == "PM001164") {
        //     this.subscribe({ apiType: 'isSubscribe' });
        // }
        // this.subscribe({ apiType: 'isSubscribe' });
        this.subscribe({ apiType: 'enabled' });
        this.share({ apiType: 'enabled' });
        if (PLATFORM_NAME == "shmix") {
            this.bindphone({ apiType: 'enabled' });
            this.realname({ apiType: 'enabled' });
        }
    }.bind(this));
}

SH_RH.postFunc = function (callback) {
    var xhr = cc.loader.getXMLHttpRequest();
    var url = "https://s1-h5mlf-h5sszg.shiyuegame.com/api.php/pf/diai/login/";
    url = url + "?tokenid=" + SH_RH_TOKENID;
    url = url + "&cps=" + SH_RH_PID;
    xhr.open("POST", url);
    //xhr.open("GET", ServerLink+link+"?"+parm,false);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhr.send();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
            var result = JSON.parse(xhr.responseText);
            // console.log("result==>", result)
            if (result["error"] == -1) {
                message(result["msg"]);
                return;
            }
            callback(result);
        }
    };
}

SH_RH.sdkBackLogin = function () {
}

SH_RH.getCurrChannel = function () {
    return window.CHANNEL
}

SH_RH.getSubChannel = function () {

}

SH_RH.getSign = function () {
    return this.sign || ""
}

SH_RH.getUid = function () {
    return this.uid || "";
}


// 链接游戏服，登陆游戏
SH_RH.loginGame = function () {
    var login_data = [];
    var _account = "shrh_" + this.uid;
    var sign = this.sign;
    // console.log("_account==>", _account);

    login_data = [
        { key: "channel", val: SH_RH_PID },
        { key: "package_name", val: PACKAGE_NAME },
        { key: "package_version", val: PACKAGE_VERSION },
        { key: "platform", val: PLATFORM },
        { key: "account", val: _account },
        { key: "token", val: SH_RH_TOKENID },
        { key: "sign", val: sign }
    ];

    // console.log("login_data==>", login_data);

    LoginController.getInstance().cusSDKLogin_2(login_data);
}

//充值
SH_RH.pay = function (money, buyNum, prodId, productName, productDesc, extension, coinNum) {
    var payCallFunc = function () {
        let loginData = LoginController.getInstance().getModel().getLoginData();
        if (loginData.srv_id == "") return;
        var roleVo = RoleController.getInstance().getRoleVo();
        if (roleVo == null) return;
        let srv_id = "";
        if (roleVo && roleVo.srv_id) {
            srv_id = roleVo.srv_id;
        } else if (loginData.srv_id) {
            srv_id = loginData.srv_id;
        }
        let index = srv_id.indexOf("_");
        if (index != -1) {
            srv_id = Number(srv_id.slice(index + 1, srv_id.length));
        } else {
            srv_id = 0;
        }

        // productName = productName || (money * 10) + "钻石";
        let p_name = this.chargeData[Number(money)];
        if(PLATFORM_NAME == "shmix"){
            p_name = this.chargeData2[Number(money)];
        }
        productName = p_name;
        // productDesc = productDesc || productName;

        //时间戳
        var date_time = Math.ceil(Date.now() / 1000);

        //充值订单号
        var game_number = SH_RH_PID;//游戏编号PM******;
        game_number = game_number + "_" + this.uid;    //uid
        game_number = game_number + "_" + date_time;    //时间戳

        // console.log("充值订单号game_number==>", game_number)

        //充值拓展内容
        var severInfo = roleVo.srv_id.split("_");
        var platform = severInfo[0] || "";
        var zone_id = severInfo[1];
        var cps = SH_RH_PID;
        var channel = SH_RH_PID;

        var _extension = roleVo.rid + "$$" + platform + "$$" + zone_id +
            "$$" + channel + "$$" + prodId + "$$" + productName + "$$" + cps + "$$" + date_time;
        // console.log("拓展参数_extension==>", _extension)
        var base_64 = require("base64").Base64;
        _extension = base_64.encode(_extension);
        // console.log("base64拓展参数_extension==>", _extension);
        var params = {
            game_no: game_number,//游戏订单号，由前端拼接
            order_money: money * 100,//充值金额，单位 分
            order_name: productName,//订单名称
            role_name: roleVo.name,//角色名,
            role_id: roleVo.rid,//角色ID
            role_level: roleVo.lev,//角色等级
            server_id: srv_id,//区服编号
            server_name: loginData.srv_name, //区服名称
            ext: _extension  //扩展信息，通知发货时会原样返回
        };
        // console.log("充值params==>", params);

        ShSdk.pay(params, function (data) {
            var msg = "";
            // console.log("充值返回data==>", data)
            if (data.ret == "SUCCESS") {      //前端通知，不能做为实际发货的凭证，真实情况以服务端通知为准
                msg = Utils.TI18N("充值完成");
            } else {
                msg = Utils.TI18N("关闭充值");
            }
            message(Utils.TI18N("充值返回：" + msg));
        }.bind(this))
    }.bind(this)
    require("tips_controller").getInstance().showFirstCharge(payCallFunc)
    //'game_code','channel_code','ifa','system','sys_ver','uid','game_no','order_money','order_name','role_name','server_id' ,'ext'

}

SH_RH.setRoleInfo = function (data) {
    let loginData = LoginController.getInstance().getModel().getLoginData();
    if (loginData.srv_id == "") return;
    let roleVo = RoleController.getInstance().getRoleVo() || data;
    // console.log("roleVo,data===", roleVo, data)
    let srv_id = "";
    if (roleVo && roleVo.srv_id) {
        srv_id = roleVo.srv_id;
    } else if (loginData.srv_id) {
        srv_id = loginData.srv_id;
    }
    let index = srv_id.indexOf("_");
    if (index != -1) {
        srv_id = Number(srv_id.slice(index + 1, srv_id.length));
    } else {
        srv_id = 0;
    }
    let r_id = roleVo.rid;
    if (PLATFORM_NAME == "sh") {
        r_id = this.uid;
    }
    this.role_info = {
        role_id: r_id || 0,//角色ID
        role_name: roleVo && roleVo.name || "",//角色名
        role_level: roleVo && roleVo.lev || 1,//角色等级
        server_id: srv_id,//区服编号
        server_name: loginData.srv_name, //区服名称
        has_gold: roleVo && roleVo.getTotalGold() || 0,//角色所持有货币数
        vip_level: roleVo && roleVo.vip_lev || 0,//角色vip等级 没有可以不传或传0
        role_power: roleVo && roleVo.power || 0, //int 战力、武力之类角色的核心数值，没有可以传0（尽量上传）
        create_time: roleVo && roleVo.reg_time || 0 //角色创建时间，时间戳，单位：秒
    };
    // console.log("role_info==>", this.role_info, roleVo);
}

//创建角色
SH_RH.createRole = function (data) {
    this.setRoleInfo(data);

    // console.log("创角提交一次上报---->", this.role_info);
    ShSdk.createRole(this.role_info);
}

//创建角色2次提交
SH_RH.createRole2 = function (data) {
    // this.setRoleInfo(data);
    console.log("创角提交二次上报---->", data);
    ShSdk.createRole(data);
}

//角色登录提交
SH_RH.submitLogin = function () {
    // if (gcore.SysEnv.get("shrh_account") == this.uid) {
    //     return
    // }
    // gcore.SysEnv.set("shrh_account", this.uid);


    // if (this.role_info && this.role_info.rid == 0 || this.role_info.reg_time == 0) {
    this.setRoleInfo();
    // }

    console.log("角色登录提交一次--role_info==>", this.role_info);

    if (PLATFORM_TYPR == "SH_RH") {
        try {
            //ShSdk.enterGame(this.role_info);		//try是为了兼容历史版本
            console.log("登录上报方法成功-----")
        } catch (err) {
            //ShSdk.neterGame(this.role_info);
            console.log("登录上报方法成功------")
        }
    }
}

//角色升级
SH_RH.roleUpLevel = function (value) {
    this.setRoleInfo();
    if (this.role_info && this.role_info.reg_time == 0) return
    if (value != null && value > 1) {
        this.role_info.role_level = value;
        //ShSdk.roleUpLevel(this.role_info);
        // console.log("角色升级上报提交--->", this.role_info);
    } else {
        // console.log("角色升级上报提交失败--->", this.role_info, value);
    }
}

//关注
//传入param
SH_RH.subscribe = function (obj) {
    //var params = { apiType: 'enabled' };//apiType 请求类型:enabled:获取关注功能是否允许设置，isSubscribe:是否已关注，askShow:请求调起关注二维码
    var params = obj;
    try {
        ShSdk.subscribe(params, function (data) {
            //data= {cpStatus:0};
            //cpStatus:0 失败，1成功
            console.log("关注回调：",params, data);
            // message("关注回调data.cpStatus=" + data.cpStatus)
            if (params.apiType == "enabled") {
                if (Number(data.cpStatus) == 0) {     //不允许
                    window.SH_RH_IS_SHOW_SUBSCRIBE = false;
                    console.log("关注回调：不允许")
                } else {     //      已关注
                    window.SH_RH_IS_SHOW_SUBSCRIBE = true;
                    console.log("关注回调：允许")
                    this.subscribe({ apiType: 'isSubscribe' });
                }
            } else if (params.apiType == "isSubscribe") {
                // console.log("请求到的关注状态：", data)
                // message("获取到的关注状态：" + data.cpStatus);
                if (Number(data.cpStatus) == 0) {     //未关注
                    window.SH_RH_IS_SUBSCRIBE = false;
                    // message("未关注");
                } else {     //      已关注
                    window.SH_RH_IS_SUBSCRIBE = true;
                    // message("已关注");
                }
            } else if (params.apiType == "askShow") {
                if (data.cpStatus == 0) {     //失败
                    // console.log("调用未成功,未关注", data)
                } else {     //      调用成功
                    // console.log("调用成功", data)
                }
            }
            params = {apiType:"null"};
        }.bind(this));
    } catch (err) {
        console.log("subscribe_err:", err);
    }
}
//分享配置
SH_RH.share = function (params) {
    // var params = { apiType: "enabled", shareParam: "" };
    /*说明:
        1.params 中apiType（enabled|setShare）表示:
        enabled：获取关注功能是否允许设置
        setShare:设置（请求）分享

        2.params 中shareParam,设置分享的内容，setShare时，并且需要配置分享内容配置有效，具体内容格式：
            shareParam={
                    title: string;//标题 
                    desc: string;//描述
                    imgUrl: string;//选填，分享的图片url（类图文）
            }
    */
    try {
        ShSdk.shareSdk(params, function (data) {
            //data= {cpStatus:0};
            //cpStatus:0 失败，1成功
            console.log("分享回调params",params,data);
            if (params.apiType == "enabled") {
                if (Number(data.cpStatus) == 0) {     //不允许
                    window.SH_RH_IS_SHOW_SHARE = false;
                    console.log("分享回调：不允许")
                } else {
                    window.SH_RH_IS_SHOW_SHARE = true;
                    console.log("分享回调：允许")
                }
            }
            if (data.cpStatus == 0) {     //      失败
                // console.log("分享调起失败！", data);
            } else {      //成功
                // console.log("分享调起成功！", data)
            }
            params = {apiType:"null"};
        }.bind(this));
    } catch (err) {
        console.log("shareSdk_err:", err);
    }

    if (this.share_callback == null) {
        this.shareCallback();
        this.share_callback = true;
    }
}

//分享回调
SH_RH.shareCallback = function () {
    // console.log("分享回调方法加载")
    try {
        ShSdk.setShareCallback(function (data) {
            // console.log(data)
            //data= {type:"timeline","msg":"success"};
            /*说明：
                type（timeline|friend） 分享类型：timeline 朋友圈，friend 好友;
                msg 分享结果：success表示分享成功，cancel表示取消或失败;
            */
            if (data.msg == "success") {
                window.SH_RH_IS_SHARE = true;
                WelfareController.getInstance().shrhShareStatus();
                if (data.type == "timeline") {
                    message(Utils.TI18N("分享朋友圈成功!"));
                } else {
                    message(Utils.TI18N("分享好友成功!"));
                }
            } else {
                message(Utils.TI18N("分享失败！"))
            }
        });
    } catch (err) {
        console.log("shareCallback_err:", err);
    }
}

//实名认证
SH_RH.realname = function (params) {
    // console.log("实名认证进入", params)
    ShSdk.realname(params, function (data) {
        console.log("实名data",params,data)
        if (data.ret == 'SUCCESS') {
            if (params.apiType == "enabled") {
                window.SH_RH_IS_SHOW_REALNAME = true;
                console.log("需要实名。。。")
            }else{
                window.SH_RH_IS_REALNAME = true;
                console.log("实名成功==>", data);
            }
            WelfareController.getInstance().shrhRealNameStatus(true);
        } else {    //未实名
            // console.log("关闭实名认证==>", data);
            if (params.apiType == "enabled") {    ////大混服屏蔽实名
                window.SH_RH_IS_REALNAME = true;
                window.SH_RH_IS_SHOW_REALNAME = false;
                // WelfareController.getInstance().shrhRealNameStatus(true);
                console.log("不需要实名。。。")
            }
        }
        params = {apiType:"null"};
    });
}

//绑定手机
SH_RH.bindphone = function (params) {
    console.log("手机绑定回调：", params)
    ShSdk.bindphone(params, function (data) {
        console.log("手机绑定回调：", params, data)
        if (data.ret == 'SUCCESS') {
            if (params.apiType == "enabled") {//允许
                window.SH_RH_IS_SHOW_BINDPHONE = true;
                console.log("手机绑定回调：允许")
            } else if (params.apiType == "askShow") {
                WelfareController.getInstance().send16698();
            }
        } else {
            if (params.apiType == "enabled") {
                window.SH_RH_IS_SHOW_BINDPHONE = false;
                console.log("手机绑定回调：不允许")
            } else if (params.apiType == "askShow") {
            }
        }
        params = {apiType:"null"};
    });
}

SH_RH.logout = function () {
    ShSdk.logout();
}

//聊天室监控
SH_RH.chatMonitor = function (data) {
    return
    let loginData = LoginController.getInstance().getModel().getLoginData();
    if (loginData.srv_id == "") return;
    let roleVo = RoleController.getInstance().getRoleVo() || data;
    let srv_id = "";
    if (roleVo && roleVo.srv_id) {
        srv_id = roleVo.srv_id;
    } else if (loginData.srv_id) {
        srv_id = loginData.srv_id;
    }
    let index = srv_id.indexOf("_");
    if (index != -1) {
        srv_id = Number(srv_id.slice(index + 1, srv_id.length));
    } else {
        srv_id = 0;
    }
    let gameid = "";
    let key = "";
    let _sign = "gameid=" + gameid + "&type=" + data.type + "&uid=" + this.qd_uid + "&key=" + key;

    ShSdk.chatMonitor({
        type: data.type || 4,//聊天类型, //(1:私聊，2:房间，3:区服(单服)，4:世界(全服)，5:帮会)
        serverid: srv_id,//消息发送者区服id, //(选服界面的显示的区服id，数字部分)
        uid: this.qd_uid,//消息发送者平台uid,
        nick: roleVo.name,//消息发送者角色名,
        fromch: "爱微游",//消息发送者渠道名称（爱微游用户填：爱微游）,
        touid: data.to_srv_id,//消息接收者平台uid，房间聊天时为房间id，其他情况可以为空,
        tonick: data.to_name,//消息接收者角色名，私聊不能为空，其他情况可以为空,
        toch: "爱微游",//消息接收者渠道名称，私聊不能为空，其他情况可以为空,
        msg: data.msg,//消息内容,
        ip: 1,//用户IP,
        sign: 1,//MD5(gameid={gameid}&type={type}&uid={uid}&key={key}), key通过平台分配
    })
}

//选择服务器 dataType为1；创建角色的时候，dataType为2；进入游戏时，dataType为3；等级提升时，dataType为4；退出游戏时，
SH_RH.sdkSubmitUserData = function (dataType, rdata) {
    return
    let loginData = LoginController.getInstance().getModel().getLoginData();
    if (loginData && loginData.srv_id == "") return;
    if (dataType == 1) {
        if (cli_log && cli_log.log_select_server) {
            cli_log.log_select_server(loginData.usrName);
        };
        if (!this.log_select_flag) return
        this.log_select_flag = true;
    } else if (dataType == 2) {
        if (cli_log && cli_log.log_create_role) {
            cli_log.log_create_role(loginData.usrName);
        };
    }
    // let account = LoginPlatForm.getInstance().getInfo().openid;
    // let roleVo = RoleController.getInstance().getRoleVo() || rdata;
    // let srv_id;
    // if (roleVo && roleVo.srv_id) {
    //     srv_id = roleVo.srv_id;
    // } else if (loginData.srv_id) {
    //     srv_id = loginData.srv_id;
    // }
    // let index = srv_id.indexOf("_");
    // if (index != -1) {
    //     srv_id = Number(srv_id.slice(index + 1, srv_id.length));
    // } else {
    //     srv_id = 0;
    // }
    // let serverId = srv_id;  //serverId(roleVo && roleVo.srv_id || loginData.srv_id)
    // let serverName = loginData.srv_name;
    // let roleId = roleVo && roleVo.rid || 0;
    // let roleName = roleVo && roleVo.name || "";
    // let roleCTime = roleVo && roleVo.reg_time || 0;
    // let roleLev = roleVo && roleVo.lev || 1;
    // let vipLev = roleVo && roleVo.vip_lev || 0;
    // let gold = roleVo && roleVo.gold || 0;
    // let power = roleVo && roleVo.power || 0;
    // var data_info = { dataType: dataType, gold: gold, roleId: roleID, roleName: roleName, roleLev: roleLev, serverId: serverId, vipLev: vipLev, roleCTime: roleCTime, };
}

//充值常量表 gold->name
SH_RH.chargeData = {
    [6]: "普通充值6元",
    [30]: "普通充值30元",
    [68]: "普通充值68元",
    [98]: "普通充值98元",
    [128]: "普通充值128元",
    [198]: "普通充值198元",
    [328]: "普通充值328元",
    [648]: "普通充值648元",
    [18]: "等级礼包",
    [1]: "1元礼包",
    [3]: "3元礼包",
    [12]: "v2礼包",
    [448]: "每周常驻礼包",
    [50]: "中档红包",
}

SH_RH.chargeData2 = {
    [6]: "60钻石",
    [30]: "300钻石",
    [68]: "680钻石",
    [98]: "980钻石",
    [128]: "1280钻石",
    [198]: "1980钻石",
    [328]: "3280钻石",
    [648]: "6480钻石",
    [18]: "等级礼包",
    [1]: "1元礼包",
    [3]: "3元礼包",
    [12]: "v2礼包",
    [448]: "每周常驻礼包",
    [50]: "中档红包",
}

module.exports = SH_RH;