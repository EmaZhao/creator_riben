// window.PLATFORM = "qq";        // 平台号
// window.PACKAGE_VERSION = "_0_0_2";
// window.CHANNEL = "h5sszg_qq";  // 渠道号
window.PACKAGE_NAME = "闪烁之光口袋版";  // 渠道号

var LoginController = require("login_controller");
var RoleController = require("role_controller");
var VipEvent = require("vip_event")

var QQSDK = function() {

};

QQSDK.account_info = null;
QQSDK.user_info = null;

QQSDK.initSDK = function() {
    console.log("QQSDK相关");
    console.log(window);

   
      if (!window.qq)  return;
  
      this.initTopInfo();

      window.CHANNEL = "h5youyi_qq";
      window.PLATFORM_NAME = "wb";
      window.PLATFORM = "wb"; 
      
      qq.setKeepScreenOn({
        keepScreenOn: true
      })
      qq.onShow(function(res){
        qq.setKeepScreenOn({
          keepScreenOn: true
        })
      });

      qq.onHide(function(res){
        qq.setKeepScreenOn({
          keepScreenOn: false
        })
      });
      
      qq.showShareMenu({
        showShareItems: ['qq', 'qzone','wechatFriends', 'wechatMoment'],
        success: function() {
          qq.onShareAppMessage(() => ({
            
            imageUrl: "https://s2.ax1x.com/2019/09/21/nvzZlj.png" // 图片 URL
          }))
        }
      })

      qq.getSetting({
        success: function(res) {
          cc.log(res);
          if (res.authSetting["scope.userInfo"]) {
            QQSDK.checkLoginStatus();
          } else {
            var info = qq.getSystemInfoSync();
            var button = qq.createUserInfoButton({
                type: 'text',
                text: '',
                style: {
                  left: 0,//info.screenWidth/2-80,
                  top: info.screenHeight/2,//info.windowHeight - info.windowHeight/3,
                  width: info.screenWidth,//160,
                  height: info.screenHeight/2,//40,
                  lineHeight: 0,
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
                QQSDK.checkLoginStatus();
                console.log(res)
            })
          }
        }
      });
}


QQSDK.initTopInfo = function() {
    var menuInfo = qq.getMenuButtonBoundingClientRect();
    var systemInfo = qq.getSystemInfoSync();
    if(menuInfo.top>30){
      window.WX_FIT = menuInfo.top / systemInfo.screenHeight *0.7 || 0;
    }else{
      window.WX_FIT = menuInfo.top / systemInfo.screenHeight *0.1 || 0;
    }
    console.log("QQ小游戏菜单栏的适配值");
    cc.log(WX_FIT);
}

QQSDK.checkLoginStatus = function() {
  // 获取本地key
  try {
    var value = this.account_info = qq.getStorageSync('account_info')
    if (value) {
      QQSDK.checkSessionKey(value);
    } else {
      QQSDK.login();
    }
  } catch (e) {
    // Do something when catch error
  }
}


QQSDK.login = function() {
  if (window.qq) {
      qq.login({
          success (res) {
            if (res.code) {
                //发起网络请求
                cc.log("初始化登录信息返回");
                cc.log(res);
                qq.request({
                  url: 'https://s1-wb-h5sszg.shiyuegame.com/api.php/pf/qq/login',
                  method: "POST",
                  data: {
                    js_code: res.code,
                    cps: "qqtest"
                  },
                  header: {
                    'content-type': 'application/json' // 默认值
                  },
                  success (res) {
                    cc.log("服务器登录信息返回");
                    cc.log(res);
                    if (res && res.data) {
                      if (res.data.error == 666) {    // 请求成功
                        try {
                            console.log("保存用户信息到本地");
                            cc.log(res.data.msg);
                            QQSDK.account_info = res.data.msg;
                            qq.setStorageSync('account_info', res.data.msg);
                            // 请求成功开始登录游戏
                            QQSDK.initUserInfo();
                        } catch (e) {

                        }
                      }
                    }
                  }
                })
            } else {
                console.log('登录失败！' + res.errMsg)
            }
          }
    })
  }
}

QQSDK.checkSessionKey = function(data) {
    cc.log("校验key是否过期");
      qq.checkSession({
        success () {
          // 没有失效，继续登录
          QQSDK.initUserInfo();
        },
        fail () {
          // session_key 已经失效，需要重新执行登录流程
          QQSDK.login();
        }
      })
}

QQSDK.initUserInfo = function() {
      qq.getUserInfo({
        success: function(res) {
          QQSDK.user_info = res;
          cc.log("获取用户信息成功");
          cc.log(res);
          QQSDK.setLoginData(res);
        },

        fail: function(res) {
          cc.log("获取用户信息失败");
        }
      })
}

QQSDK.setLoginData = function(user_info) {
  this.user_info = user_info;
  this.sdkBackLogin();
}

// SDK登录成功回调
QQSDK.sdkBackLogin = function() {
  var login_data = {};
  login_data.usrName = "qq_" + this.account_info.openid;
  login_data.password = "qq123456";
  console.log("QQ数据初始花成功，开始请求服务器列表");
  LoginController.getInstance().loginPlatformRequest(login_data);
}

QQSDK.loginGame = function() {
  var test_acount = LoginController.getInstance().getTestAccount();
  cc.log("使用了QQ测试账号");
  cc.log(test_acount);

  // SDK请求登录游戏
  var login_data = {};
  if (test_acount) {
    login_data.account = test_acount;
  } else {
    login_data.account = "qq_" + this.account_info.openid;
  }
  login_data.rawData = this.user_info.rawData;
  login_data.signature = this.user_info.signature;
  login_data.channel = CHANNEL;
  login_data.package_name = PACKAGE_NAME;
  login_data.package_version = PACKAGE_VERSION;
  login_data.platform = PLATFORM;
  login_data.token = QQSDK.account_info.session_key;
  login_data.timestamp = QQSDK.account_info.time;
  login_data.sign = QQSDK.account_info.sign;

  LoginController.getInstance().cusSDKLogin(login_data);
}

// 通知服务器成功
QQSDK.submitLogin = function(url) {
    if (url) {
      var submit_url = "https://" + url + "/api.php/pf/qq/session";
      console.log(submit_url);
      console.log(QQSDK.account_info);

      qq.request({
        url: submit_url,
        method: "POST",
        data: {
          session_key: QQSDK.account_info.session_key,
          openid: QQSDK.account_info.openid,
          time:QQSDK.account_info.time,
          sign:QQSDK.account_info.sign,
          cps: "qqtest"
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success (res) {
          cc.log("服务器登录信息返回");
          cc.log(res);
          if (res && res.data) {
            console.log(res.data);
            if (res.data.error == 666) {    // 请求成功

            }
          }
        }
      })

    } 
}

QQSDK.getCurrChannel = function() {

}

QQSDK.canvasToTempFilePath = function() {
  var canvas = cc.game.canvas;
  
  canvas.toTempFilePath({
      x: 0,
      y: 510*canvas.height/1280,
      width: canvas.width,
      height: 550*canvas.height/1280,
      destWidth: 500,
      destHeight: 400,
      fileType:"jpg",

      success (res) {
          //.可以保存该截屏图片
          qq.shareAppMessage({
              imageUrl: res.tempFilePath
          })
      },
      fail (res) {
          //.可以保存该截屏图片
          qq.shareAppMessage({
            imageUrl: "https://s2.ax1x.com/2019/09/21/nvzZlj.png" // 图片 URL
          })
      },
  })

}

QQSDK.getSubChannel = function() {
  
}


// QQ小游戏余额查询
QQSDK.checkBalance = function() {
  var loginInfo = LoginController.getInstance().model.getLoginInfo();
  
  var data = {
      openid: this.account_info.openid,
      time:QQSDK.account_info.time,
      sign:QQSDK.account_info.sign,
      cps: "qqtest"
    }
    
  qq.request({
    url: "https://"+loginInfo.host+"/api.php/pf/qq/balance",
    method: "POST",
    data: data,
    header: {
      'content-type': 'application/json' // 默认值
    },
    success (res) {
      if (res && res.data) {
        if (res.data.error == 666) {    // 请求成功
          try {
              if(res.data.msg){
                gcore.GlobalEvent.fire(VipEvent.UPDATA_QQ_BALANCE,res.data.msg.remainder);
              }
          } catch (e) {

          }
        }
      }
    }
  })
}

//支付
QQSDK.pay = function(money, buyNum, prodId, productName, productDesc, extension, coinNum) {
  var payCallFunc = function(){
    var loginInfo = LoginController.getInstance().model.getLoginInfo();

    var roleVo = RoleController.getInstance().getRoleVo();
    if (roleVo == null) return;
    var severInfo = roleVo.srv_id.split("_");
    var platform = severInfo[0] || "";
    var zone_id = severInfo[1];

    var systemInfo = qq.getSystemInfoSync();
    var systemName = systemInfo.system;
    var pf = "";
    if(systemName.indexOf("iOS")>-1){
      // return;
    }else if(systemName.indexOf("Android")>-1){
      pf = "qq_m_qq-2001-android-2011";
    }

    //时间戳
    var date_time = Math.ceil(Date.now() / 1000);

    productName = productName || (money * 10) + "钻石";
    var cps = "qqtest";
    var channel = CHANNEL;

    var _extension = roleVo.rid + "$$" + platform + "$$" + zone_id +
          "$$" + channel + "$$" + prodId + "$$" + productName + "$$" + cps + "$$" + date_time;
      cc.log("拓展参数_extension==>", _extension)
      var base_64 = require("base64").Base64;
      _extension = base_64.encode(_extension);
    
    
    qq.request({
      url: "https://"+loginInfo.host+"/api.php/pf/qq/pre_pay",
      method: "POST",
      data: {
        openid: this.account_info.openid,
        zone_id: zone_id,
        pf: pf,
        amt:money*10,
        good_num: 1,
        time:QQSDK.account_info.time,
        sign:QQSDK.account_info.sign,
        app_remark:_extension,
        cps: cps
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        console.log("预下单返回");
        console.log(res);
        if (res && res.data) {
          if (res.data.error == 666) {    // 请求成功
            try {
                qq.requestMidasPayment({
                  prepayId:res.data.msg.prepayId,
                  starCurrency:money*10,
                  success:function(res){
                    console.log("支付回调成功",res)
                  },

                  fail:function(res){
                    console.log("支付回调失败",res)
                  },
                  
                  complete:function(res){
                    console.log("支付回调complete",res)
                  }
                })
            } catch (e) {

            }
          }
        }
      }
    })
  }.bind(this);
  require("tips_controller").getInstance().showFirstCharge(payCallFunc);
};




module.exports = QQSDK;