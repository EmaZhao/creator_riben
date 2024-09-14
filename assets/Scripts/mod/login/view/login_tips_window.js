// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     tips
// <br/>Create: 2019-05-06 14:33:44
// --------------------------------------------------------------------
var ActivityWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("login", "login_tips_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
      this.ctrl = require("login_controller").getInstance()
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.tips_btn = this.root_wnd.getChildByName("tips_btn");
        this.close_tips_btn = this.root_wnd.getChildByName("close_tips_btn");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.tips_btn.on(cc.Node.EventType.TOUCH_END,()=>{
          Utils.playButtonSound(1);
          this.ctrl.openLoginTipsWindow(false);
          if(this.callBack){
            Utils.playMusic(AUDIO_TYPE.SCENE, "s_001", true);
            var key = this.ctrl.model.getLoginInfo().account;
            gcore.SysEnv.set(cc.js.formatStr("%s_srv_name",key),this.ctrl.model.getLoginInfo().srv_name);
            this.callBack();
          }
          
        });
        this.close_tips_btn.on(cc.Node.EventType.TOUCH_END,()=>{
          Utils.playButtonSound(1)
          this.ctrl.openLoginTipsWindow(false);
          if(this.callBack){
            Utils.playMusic(AUDIO_TYPE.SCENE, "s_001", true);
            var key = this.ctrl.model.getLoginInfo().account;
            gcore.SysEnv.set(cc.js.formatStr("%s_srv_name",key),this.ctrl.model.getLoginInfo().srv_name);
            this.callBack();
          }
        });
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
      if(params && params.callBack){
        this.callBack = params.callBack;
      }
    },

    closeCallBack:function(){
    },
    
})