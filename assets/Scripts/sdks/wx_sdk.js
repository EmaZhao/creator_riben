
// window.PLATFORM = "wx";        // 平台号
// window.PACKAGE_VERSION = "0.0.2";
// window.CHANNEL = "h5sszg_wx";  // 渠道号
window.PACKAGE_NAME = "闪烁之光口袋版";  // 渠道号

var LoginController = require("login_controller");
var RoleController = require("role_controller");
var sha1 = require('sha1.min');

var WXSDK = function() {
    wx = null;
}

// 7dec9c4e4c26c46cf1a4e28a083f82bd
WXSDK.account_info = null;
WXSDK.user_info = null;

// 游戏加载完成、初始化SDK
WXSDK.initSDK = function() {
    console.log("微信SDK相关");
    console.log(window);

    if (!window.wx)  return;
    
    this.initTopInfo();
    
    wx.setKeepScreenOn({
        keepScreenOn: true
    })
    wx.onShow(function(res){
      wx.setKeepScreenOn({
        keepScreenOn: true
      })
    });

    wx.onHide(function(res){
      wx.setKeepScreenOn({
        keepScreenOn: false
      })
    });
    
    wx.showShareMenu({
      success: function() {
        wx.onShareAppMessage(() => ({
          title: '闪烁之光',
          imageUrl: '' // 图片 URL
        }))
      }
    })

    wx.getSetting({
      success: function(res) {
        cc.log(res);
        if (res.authSetting["scope.userInfo"]) {
          WXSDK.checkLoginStatus();
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
            borderRadius: 4
            }
          })
          button.show();
          button.onTap((res)=>{
            button.hide();
            WXSDK.checkLoginStatus();
            console.log(res)
          })
        }
      }
    });
}

WXSDK.initTopInfo = function() {
    var menuInfo = wx.getMenuButtonBoundingClientRect();
    var systemInfo = wx.getSystemInfoSync();
    window.WX_FIT = menuInfo.top / systemInfo.screenHeight * 0.8 || 0;
    console.log("微信小游戏菜单栏的适配值");
    cc.log(WX_FIT);
}

WXSDK.checkLoginStatus = function() {
  // 获取本地key
  try {
    var value = this.account_info = wx.getStorageSync('account_info')
    if (value) {
      WXSDK.checkSessionKey(value);
    } else {
      WXSDK.login();
    }
  } catch (e) {
    // Do something when catch error
  }
}


WXSDK.login = function() {
  if (window.wx) {
      wx.login({
          success (res) {
            if (res.code) {
                //发起网络请求
                cc.log("初始化登录信息返回");
                cc.log(res);
                wx.request({
                  url: 'https://s1-wx-h5sszg.shiyuegame.com/api.php/pf/wx/login/',
                  method: "POST",
                  data: {
                    js_code: res.code,
                    cps: "wxtest"
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
                            WXSDK.account_info = res.data.msg;
                            wx.setStorageSync('account_info', res.data.msg);
                            // 请求成功开始登录游戏
                            WXSDK.initUserInfo();
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

WXSDK.checkSessionKey = function(data) {
    cc.log("校验key是否过期");
      wx.checkSession({
        success () {
          // 没有失效，继续登录
          WXSDK.initUserInfo();
        },
        fail () {
          // session_key 已经失效，需要重新执行登录流程
          WXSDK.login();
        }
      })
    // wx.getUserInfo({
    //   success: function(res) {
    //     console.log("用户信息");
    //     console.log(res)

    //     // 请求access_token
    //     cc.log("发送到服务器校验是否过期");
    //     cc.log(data);

    //     wx.request({
    //       url: 'http://s1-release-h5sszg.shiyuegame.com/api.php/pf/wx/token',
    //       data: {
    //         cps: "wxtest"
    //       },
    //       header: {
    //         'content-type': 'application/json' // 默认值
    //       },
    //       success (res1) {
    //         if (res1 && res1.data) {
    //           cc.log("ASSESS_TOKEN返回");
    //           cc.log(res1);
    //           if (res1.data.error == 666) {    // 请求成功
    //             cc.log("校验ASSESS_TOKEN是否过期");
    //             var signature = sha1(res.rawData + data.session_key)
    //             wx.request({
    //               url: 'http://s1-release-h5sszg.shiyuegame.com/api.php/pf/wx/check_session',
    //               data: {
    //                 access_token: res1.data.msg.access_token,
    //                 openid: data.openid,
    //                 signature: signature,
    //                 cps: "wxtest",
    //               },
    //               header: {
    //                 'content-type': 'application/json' // 默认值
    //               },
    //               success (res) {
    //                 cc.log("校验结果");
    //                 cc.log(res);
    //                 if (res && res.data) {
    //                   if (res.data.error == 666) {    // 请求成功
    //                     try {
    //                         console.log("HHHHHHHHHHHHHHHHHHHHHHHHH");
    //                         console.log("校验成功开始登录游戏");
    //                     } catch (e) {

    //                     }
    //                   }
    //                 }
    //               }
    //             })


    //           }
    //         }
    //       }
    //     })

    //   },

    //   fail: function(res) {
    //     console.log("UUUUUUUUUUUUUUUUu");
    //     console.log(res)
    //   }
    // })
}

WXSDK.initUserInfo = function() {
      wx.getUserInfo({
        success: function(res) {
          WXSDK.user_info = res;
          cc.log("获取用户信息成功");
          cc.log(res);
          WXSDK.setLoginData(res);
        },

        fail: function(res) {
          cc.log("获取用户信息失败");
        }
      })
}

WXSDK.setLoginData = function(user_info) {
  this.user_info = user_info;
  this.sdkBackLogin();
}

// SDK登录成功回调
WXSDK.sdkBackLogin = function() {
  var login_data = {};
  login_data.usrName = "wx_" + this.account_info.openid;
  login_data.password = "wx123456";
  console.log("微信数据初始花成功，开始请求服务器列表");
  LoginController.getInstance().loginPlatformRequest(login_data);
}

WXSDK.pay = function(money, buyNum, prodId, productName, productDesc, extension, coinNum) {
  console.log("开始调用支付");
  var loginInfo = LoginController.getInstance().model.getLoginInfo();
  var roleVo = RoleController.getInstance().getRoleVo();
  if (roleVo == null) return;
  var severInfo = roleVo.srv_id.split("_");
  var platform = severInfo[0] || "";
  var zone_id = severInfo[1];

  var systemInfo = wx.getSystemInfoSync();
  var systemName = systemInfo.system;
  var pf = "";
  if(systemName.indexOf("iOS")>-1){
    // return;
  }else if(systemName.indexOf("Android")>-1){
    pf = "android";
  }
  var data = {
      openid: WXSDK.account_info.openid,
      time:WXSDK.account_info.time,
      sign:WXSDK.account_info.sign,
      zone_id: zone_id,
      pf: pf,
      cps: "wxtest"
    }
    
  wx.request({
    url: "https://"+loginInfo.host+"/api.php/pf/wx/balance",
    method: "POST",
    data: data,
    header: {
      'content-type': 'application/json' // 默认值
    },
    success (res) {
      console.log("请求余额",res);
      if (res && res.data) {
        if (res.data.error == 666) {    // 请求成功
          try {
              //时间戳
              var date_time = Math.ceil(Date.now() / 1000);

              productName = productName || (money * 10) + "钻石";
              var cps = "wxtest";
              var channel = CHANNEL;

              var _extension = roleVo.rid + "$$" + platform + "$$" + zone_id +
                "$$" + channel + "$$" + prodId + "$$" + productName + "$$" + cps + "$$" + date_time;
                  cc.log("拓展参数_extension==>", _extension)
                  var base_64 = require("base64").Base64;
                  _extension = base_64.encode(_extension);
                  cc.log("拓展参数_extension==222222222>", _extension)

              if(res.data.msg){
                if(res.data.msg.balance>=money*10){
                  wx.request({
                    url: "https://"+loginInfo.host+"/api.php/pf/wx/pay",
                    method: "POST",
                    data: {
                      openid: WXSDK.account_info.openid,
                      zone_id: zone_id,
                      pf: pf,
                      amt:money*10,
                      time:WXSDK.account_info.time,
                      sign:WXSDK.account_info.sign,
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
                          
                        }else if(res.data.error == 1){
                        }else if(res.data.error == -1){
                          console.log("充值失败")
                        }
                      }
                    }
                  })
                }else{
                    wx.requestMidasPayment({
                    mode:"game",
                    env:1,//
                    offerId:"1450021881",
                    currencyType:"CNY",
                    platform:pf,
                    buyQuantity:money*10,
                    zoneId:zone_id,

                    success:function(res){
                      console.log("支付回调成功");
                      
                      wx.request({
                        url: "https://"+loginInfo.host+"/api.php/pf/wx/pay",
                        method: "POST",
                        data: {
                          openid: WXSDK.account_info.openid,
                          zone_id: zone_id,
                          pf: pf,
                          amt:money*10,
                          time:WXSDK.account_info.time,
                          sign:WXSDK.account_info.sign,
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
                              
                            }else if(res.data.error == 1){
                            }else if(res.data.error == -1){
                              console.log("充值失败")
                            }
                          }
                        }
                      })
                    },

                    fail:function(res){
                      console.log("支付回调失败",res)
                    },
                    
                    complete:function(res){
                      console.log("支付回调complete",res)
                    }
                  })
                }
              }
          } catch (e) {

          }
        }
      }
    }
  })

  
  
  
}

WXSDK.loginGame = function() {
  var test_acount = LoginController.getInstance().getTestAccount();
  cc.log("使用了微信测试账号");
  cc.log(test_acount);

  // SDK请求登录游戏
  var login_data = {};
  if (test_acount) {
    login_data.account = test_acount;
  } else {
    login_data.account = "wx_" + this.account_info.openid;
  }
  login_data.rawData = this.user_info.rawData;
  login_data.signature = this.user_info.signature;
  login_data.channel = CHANNEL;
  login_data.package_name = PACKAGE_NAME;
  login_data.package_version = PACKAGE_VERSION;
  login_data.platform = PLATFORM;
  login_data.token = WXSDK.account_info.session_key;
  login_data.timestamp = WXSDK.account_info.time;
  login_data.sign = WXSDK.account_info.sign;

  LoginController.getInstance().cusSDKLogin(login_data);
}

// 通知服务器成功
WXSDK.submitLogin = function(url) {
    if (url) {
      var submit_url = "https://" + url + "/api.php/pf/wx/session";
      console.log(submit_url);
      console.log(WXSDK.account_info);

      wx.request({
        url: submit_url,
        method: "POST",
        data: {
          session_key: WXSDK.account_info.session_key,
          openid: WXSDK.account_info.openid,
          time:WXSDK.account_info.time,
          sign:WXSDK.account_info.sign,
          cps: "wxtest"
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

WXSDK.getCurrChannel = function() {

}

WXSDK.getSubChannel = function() {
  
}


WXSDK.loginLog = function() {
  var options = wx.getLaunchOptionsSync();
  console.log("xhj------------",options);
  
  if(options == null || options.query == null || options.query.weixinadinfo == null)return;
  
  var weixinadinfoArr = options.query.weixinadinfo.split(".");
  var aid = weixinadinfoArr[0];
  if(aid == null)return;

  var url = window.location.href;
  console.log("xhj+++++++++++++",url);
  wx.request({
    url: "",
    method: "POST",
    data: {
      sku: options.query.sku,
      app_id: options.query.app_id,
      sy_ad_id:options.query.sy_ad_id,
      channel_id:options.query.channel_id,
      gdt_vid: options.query.gdt_vid,
      weixinadinfo:options.query.weixinadinfo,
      sub_ad_id:aid,
      url:url,
    },
    header: {
      'content-type': 'application/json' // 默认值
    },
    success (res) {
      console.log("上报登录信息返回");
      console.log(res);
    }
  })
}

WXSDK.download_qrcode_png = function() {
      wx.request({
        url: 'https://s1-h5mlf-h5sszg.shiyuegame.com/api.php/pf/wx/token',
        method: "POST",
        data: {
          cps: "wxtest"
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success (res1) {
          if (res1.data.error == 666) {    // 请求成功
              //res1.data.msg.access_token,
              console.log("获取assess_token");
              console.log(res1);

              const query = wx.getLaunchOptionsSync();
              const scene = decodeURIComponent(query.scene);
              console.log("获取小游戏scene");
              console.log(query);
              console.log(scene);

              console.log("请求二维码相关")
              
          }
        },
      })

}

WXSDK.createGameClubButton = function () {
  var clubButton = wx.createGameClubButton({
    icon: 'green',
    style: {
        left: 10, 
        top: 76, 
        width: 40,
        height: 40
    }
  });
}

module.exports = WXSDK;