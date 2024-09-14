// window.PLATFORM = "sh_sdk";                 // 平台号
// window.CHANNEL = "";               // 深海小游戏安卓和苹果的渠道
window.PACKAGE_NAME = "闪烁之光口袋版";  // 渠道号
// window.PACKAGE_VERSION = "0.0.18";
window.SH_SDK_PID = "0";                 //深海小游戏区别安卓，苹果的pid ， 
window.SH_SDK_AND_PID = "P0006089";        //诗悦-闪烁之光马包-安卓
window.SH_SDK_IOS_PID = "P0006090";      //诗悦-闪烁之光马包-ios
window.SH_SDK_FOLLOW = true;                 //深海小游戏关注功能显隐 true:关闭  false：开启 

var ShSdk = require("shsdk");
var RoleController = require("role_controller");
var LoginController = require("login_controller");
var WelfareEvent = require("welfare_event");


var SHSDK = function() {

}

SHSDK.uid = null;
SHSDK.sign = null;
SHSDK.role_info = null;

// 判断是否授权
SHSDK.initSDK = function() {
    console.log("深海SDK相关");
    console.log(window);

   
      if (!window.wx)  return;
  
      this.initTopInfo();

      var systemInfo = wx.getSystemInfoSync();
      var systemName = systemInfo.system;
      
      window.PLATFORM = "sy";
      window.PLATFORM_NAME = "sy";

      if(systemName.indexOf("iOS")>-1){
        SH_SDK_PID = SH_SDK_IOS_PID;
      }else if(systemName.indexOf("Android")>-1){
        SH_SDK_PID = SH_SDK_AND_PID;
      }
      CHANNEL = SH_SDK_PID;
      ShSdk.init({
        package_code: SH_SDK_PID, //这是测试的切包编号，正式的请跟我们运营要
        // debug:true		//米大师沙箱支付控制
      });

      this.dataPlacement(10000);
      this.dataPlacement(20000);

      ShSdk.share(function(){
        //转发成功时调用这里代码
        console.log("ShSdk.share success callback");
      });

      wx.setKeepScreenOn({
        keepScreenOn: true
      })
      wx.onShow(function(res){
        if(res){
          gcore.GlobalEvent.fire(WelfareEvent.Update_SHWX_show_scene_val,res.scene);
        }
        wx.setKeepScreenOn({
          keepScreenOn: true
        })
      });

      wx.onHide(function(res){
        wx.setKeepScreenOn({
          keepScreenOn: false
        })
      });
      
      wx.getSetting({
        success: function(res) {
          cc.log(res);
          if (res.authSetting["scope.userInfo"]) {
            SHSDK.login();
          } else {
            var info = wx.getSystemInfoSync();
            var button = wx.createUserInfoButton({
                type: 'text',
                text: '',
                style: {
                  left: 0,
                  bottom: 0,
                  width: info.screenWidth,
                  height: info.screenHeight/2,
                  lineHeight: 40,
                  backgroundColor: '',
                  color: '#ffffff',
                  textAlign: 'center',
                  fontSize: 16,
                  borderRadius: 4,
                }
            })
            button.show();
            button.onTap((res)=>{
                button.hide();
                ShSdk.unionId(res);
                SHSDK.login();
                console.log(res)
            })
          }
        }
      });
},


SHSDK.login = function(){
  this.dataPlacement(30000);
  ShSdk.login(function(data) {
      this.dataPlacement(30001);
      //根据需要，做相应操作
      window.SH_SDK_TOKENID = data.tokenid;
      
      
      SHSDK.postFunc(function (result) {
        console.log(result)
        SHSDK.uid = result.msg.uid;
        SHSDK.sign = result.msg.sign;
        
        var login_data = {};
        login_data.usrName = "sh_" + SHSDK.uid;
        login_data.password = "wx123456";
        console.log("深海小游戏初始化成功，开始请求服务器列表");
        LoginController.getInstance().loginPlatformRequest(login_data);
    }.bind(this))
  });
}

SHSDK.postFunc = function (callback) {
  var xhr = cc.loader.getXMLHttpRequest();
  var url = "https://s1-h5mlf-h5sszg.shiyuegame.com/api.php/pf/diai/login/";
  url = url + "?tokenid=" + SH_SDK_TOKENID;
  url = url + "&cps=" + SH_SDK_PID;
  xhr.open("POST", url);
  //xhr.open("GET", ServerLink+link+"?"+parm,false);
  xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhr.send();
  xhr.onreadystatechange = function () {
      if (xhr.readyState == 4 && (xhr.status >= 200 && xhr.status <= 207)) {
          var result = JSON.parse(xhr.responseText);
          cc.log("result==>", result)
          if (result["error"] == -1) {
              message(result["msg"]);
              return;
          }
          SHSDK.dataPlacement(40000);
          callback(result);
      }
  };
}

// 计算小程序菜单位置
SHSDK.initTopInfo = function() {
    var menuInfo = wx.getMenuButtonBoundingClientRect();
    
    var systemInfo = wx.getSystemInfoSync();
    if(menuInfo.top>30){
      window.WX_FIT = menuInfo.top / systemInfo.screenHeight *0.7 || 0;
    }else{
      window.WX_FIT = menuInfo.top / systemInfo.screenHeight *0.1 || 0;
    }
    
    console.log("微信小游戏菜单栏的适配值");
    cc.log(WX_FIT);
}

// 链接游戏服，登陆游戏
SHSDK.loginGame = function () {
  var login_data = [];
  var _account = "sh_" + SHSDK.uid;
  var sign = SHSDK.sign;
  console.log("_account==>", _account);

  login_data = [
      { key: "channel", val: SH_SDK_PID },
      { key: "package_name", val: PACKAGE_NAME },
      { key: "package_version", val: PACKAGE_VERSION },
      { key: "platform", val: PLATFORM },
      { key: "account", val: _account },
      { key: "token", val: SH_SDK_TOKENID },
      { key: "sign", val: sign }
  ];

  console.log("login_data==>", login_data);

  LoginController.getInstance().cusSDKLogin_2(login_data);
}

SHSDK.pay = function(money, buyNum, prodId, productName, productDesc, extension, coinNum) {
    
    var payCallFunc = function(){
      var roleVo = RoleController.getInstance().getRoleVo();
      if (!roleVo) return;
      
      //时间戳
      var date_time = Math.ceil(Date.now() / 1000);

      //充值订单号
      var game_number = SH_SDK_PID;//游戏编号P******;
      game_number = game_number + "_" + SHSDK.uid;    //uid
      game_number = game_number + "_" + date_time;    //时间戳
      cc.log("充值订单号game_number==>", game_number)

      productName = productName || (money * 10) + "钻石";
      let loginData = LoginController.getInstance().getModel().getLoginData();
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

      //充值拓展内容
      var severInfo = roleVo.srv_id.split("_");
      var platform = severInfo[0] || "";
      var zone_id = severInfo[1];
      var cps = SH_SDK_PID;
      var channel = SH_SDK_PID;

      var _extension = roleVo.rid + "$$" + platform + "$$" + zone_id +
          "$$" + channel + "$$" + prodId + "$$" + productName + "$$" + cps + "$$" + date_time;
      cc.log("拓展参数_extension==>", _extension)
      var base_64 = require("base64").Base64;
      _extension = base_64.encode(_extension);
      cc.log("base64拓展参数_extension==>", _extension);

      
      
      var params = {
          game_no: game_number,   //游戏订单号，由前端拼接
          order_money: money * 100,                      //充值金额，单位 分
          order_name: productName,             //订单名称
          role_id: roleVo.rid,                       //角色id，必传项
          role_name: roleVo.name,                    //角色名,
          role_level: roleVo.lev,                      //角色等级，用于判断角色等级，控制充值入口，必传项
          server_id: srv_id,                        //区服id，必传项
          server_name: loginData.srv_name,              //区服名称，必传项
          ext: _extension                           //扩展信息，通知发货时会原样返回
        };
      
      console.log("充值数据",params);
      
      ShSdk.pay(params,
          function(data) {
              if (data.ret == 'SUCCESS') { //前端通知，不能做为实际发货的凭证，真实情况以服务端通知为准
                  console.log("支付完成");
                  wx.showModal({
                    title: "支付成功",
                    content: "支付成功"
                  });
              } else if (data.ret == 'YD_TIPS') {
                wx.showModal({
                  title: "温馨提示",
                  content: data.msg  //充值引导文字，由我们后台配置
                });
              } else if (data.ret =='NOT_ALLOW'){
                wx.showModal({
                  title: "支付失败",
                  content: "暂不支持支付"
                });
              }
              else {
                  console.log("支付取消或失败");
              }
          }.bind(this)
      );
    }.bind(this)
    require("tips_controller").getInstance().showFirstCharge(payCallFunc);
}

//主动拉起转发 可用于游戏内按钮事件触发，分享内容由我们这边后台配置，不需要传参，【支持传参，格式如：key=111&aaa=333】
// 传参模式：ShSdk.goShare('key=111&aaa=333');
// 不传参模式：ShSdk.goShare();
SHSDK.goShare = function (data) {
  if(data){
    ShSdk.goShare(data);
  }else{
    ShSdk.goShare();
  }
}

// 获取公众号关注状态接口【特别说明：目前还没有公众号，所以暂时没有关注回调信息】
SHSDK.subscribe = function () {
  ShSdk.subscribe(function(ret){
    //说明【关注状态->subscribe，1：已关注，0：取消关注，关注|取消关注时间->subscribe_time】
    console.log('公众号关注状态获取结果',ret);
  });
}

// 添加数据埋点推送方法，请在对应的节点上调用此方法
SHSDK.dataPlacement = function (actionId) {
  ShSdk.dataPlacement({
    action: actionId,
  });
}

// 客服
SHSDK.openCustomerServiceConversation = function () {
  if(window.wx){
    wx.openCustomerServiceConversation();
  }
}



SHSDK.setRoleInfo = function (data) {
  let loginData = LoginController.getInstance().getModel().getLoginData();
  if (loginData.srv_id == "") return;
  let roleVo = RoleController.getInstance().getRoleVo() || data;
  let srv_id;
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
  
  this.role_info = {
      role_id: roleVo && roleVo.rid || 0,									//角色ID
      role_name: roleVo && roleVo.name || "",								//角色名
      role_level: roleVo && roleVo.lev || 1,									    //角色等级
      server_id: srv_id,												//区服编号
      server_name: loginData.srv_name, 			//区服名称
      has_gold: roleVo && roleVo.getTotalGold() || 0,									  //角色所持有货币数
      vip_level: roleVo && roleVo.vip_lev || 0,												  //角色vip等级 没有可以传0
      role_power: roleVo && roleVo.power || 0, 									  //int 战力、武力之类角色的核心数值，没有可以传0
      create_time: roleVo && roleVo.reg_time || 0   //时间戳，单位：秒
  };
}

//角色登录提交
SHSDK.submitLogin = function () {
  if (gcore.SysEnv.get("shsdk_account") == this.uid) {
      return
  }
  gcore.SysEnv.set("shsdk_account", this.uid);

  this.setRoleInfo();

  console.log("角色登录提交一次--role_info==>", this.role_info);

  if (PLATFORM_TYPR == "SH_SDK") {
    ShSdk.enterGame(this.role_info, function (ret) {
      console.log('角色上报，返回支付情况', ret);
      if(ret.data.msg.sp!=null){
        window.IS_SHOW_CHARGE = ret.data.msg.sp;
      }
      if(ret.data.msg.follow!=null){
        window.SH_SDK_FOLLOW = ret.data.msg.follow;
      }
    });
    cc.log("登录上报方法成功-----")
  }
}

//创建角色信息上报
SHSDK.createRole = function (data) {
  this.dataPlacement(90200);
  this.setRoleInfo(data);

  cc.log("创角提交一次上报---->", this.role_info);
  
  ShSdk.createRole(this.role_info, function (ret) {
    console.log('角色上报，返回支付情况', ret);
    if(ret.data.msg.sp!=null){
      window.IS_SHOW_CHARGE = ret.data.msg.sp;
    }
    if(ret.data.msg.follow!=null){
      window.SH_SDK_FOLLOW = ret.data.msg.follow;
    }
  }.bind(this));
}

//角色升级信息上报
SHSDK.roleUpLevel = function (value) {
  this.setRoleInfo();
  if (this.role_info && this.role_info.create_time == 0) return

  if (value != null && value > 1) {
      this.role_info.role_level = value;
      console.log('角色升级信息上报', this.role_info);
      ShSdk.roleUpLevel(this.role_info, function (ret) {
        console.log('角色上报，返回支付情况', ret);
        if(ret.data.msg.sp!=null){
          window.IS_SHOW_CHARGE = ret.data.msg.sp;
        }
        
        if(ret.data.msg.follow!=null){
          window.SH_SDK_FOLLOW = ret.data.msg.follow;
        }
      }.bind(this));
      cc.log("角色升级上报提交--->", this.role_info);
  } else {
      cc.log("角色升级上报提交失败--->", this.role_info, value);
  }
}

SHSDK.sdkBackLogin = function () {
}

SHSDK.getCurrChannel = function () {

}

SHSDK.getSubChannel = function () {

}

SHSDK.setClipboardData = function (desc) {
  wx.setClipboardData({
    data: desc,
    success (res) {
      
    }
  })
}



module.exports = SHSDK;
