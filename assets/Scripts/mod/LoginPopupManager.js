// --------------------------------------------------------------------
// @author: 
// @description:
//      登录弹窗管理
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var TimeTool = require("timetool");
var RoleController = require("role_controller");
var RoleEvent = require("role_event");
var WelfareEvent = require("welfare_event")
//
let popupList = [
  {sort:1,func:(self)=>{self.checkActivityPopup()}},//节日签到
  {sort:2,func:(self)=>{self.checkNewPopup()}},//新人签到
  {sort:3,func:(self)=>{self.checkCommonPopup()}},//普通签到
  {sort:4,func:(self)=>{self.checkBannerPopup()}},//活动banner
]



window.LoginPopupManager = cc.Class({
    extends: cc.Component,
    

    ctor: function () {
        this.registerEvent();
        this.initSetting();
    },

    initSetting: function () {
      this.last_popup = null;//上一个弹窗
      popupList.sort((a,b)=>{
        return a.sort-b.sort;
      })
      const list = [];
      for(let info of popupList){
        list.push(info);
      }
      this.list = list ;
    },

    registerEvent: function () {
      gcore.GlobalEvent.bind(EventId.POPUP_DORUN, function () {
        this.doRun();
      }.bind(this));

      gcore.GlobalEvent.bind(RoleEvent.RefreshRoleLev, (function (key, val) {
        if(key == "lev"){
          if(val >=5){
            this.run();
          }
        } 
      }.bind(this)));

      gcore.GlobalEvent.bind(WelfareEvent.Update_Sign_Info, function (data) {
        this.bCheckCommonPopup = true;
      }, this)
      require("welfare_controller").getInstance().sender14100();
    },

    run:function(){
      var role_vo = RoleController.getInstance().getRoleVo();
      if(role_vo.lev<5){
          return;  
      }
      this.isPopup = true;//是否处于弹窗检测中
      this.doRun();
    },

    doRun(){
      this.closeLastPopup();
      if(this.list.length == 0){
        this.isPopup = false;
        var MainuiEvent = require("mainui_event");
        gcore.GlobalEvent.fire(EventId.GUIDE_TO_CONTINUE);
        gcore.GlobalEvent.fire(MainuiEvent.LOADING_ENTER_SCENE);
      }
      if(this.list.length>0 && this.isPopup){
        let info = this.list.shift();
        if(info&&info.func){
          info.func(this);
        }else{
          this.doRun();
        }
      }
    },

    getIsPopupStatus:function(){
      return this.isPopup ;
    },

    setPopupStatus:function(status){
      this.isPopup = status;
    },

    setLastPopup:function(object){
      this.last_popup = object;
    },

    closeLastPopup:function(){
      if(this.last_popup)
          this.last_popup.close();
          this.last_popup = null;
    },

    checkActivityPopup:function(){//活动弹窗
      var controller = require("action_controller").getInstance();
      var activityList = controller.getAllActionList();
      let activity = activityList[991027];
      var time = TimeTool.getYMD3(gcore.SmartSocket.getTime());
      var rid = RoleController.getInstance().getRoleVo().rid;
      
      var key = cc.js.formatStr("%s"+"_"+"activity"+"_"+"%s"+"_"+"%s",rid ,991027 ,time);
      var value  = this.getLocalStorageItem(key);
      if(activity && !value){
        //时间暂时不处理
        controller.openSevenActivityWindow(true);
        this.closeLastPopup();
        this.setLastPopup(controller.seven_activity_window);
        value = "true"
        this.setLocalStorageItem(key,value)
      }else{
        this.doRun();
      }
    },
    
    checkNewPopup:function(){//新手七日
      var controller = require("mainui_controller").getInstance();
      var ActionController = require("action_controller").getInstance();
      var activity = controller.getFunctionIconById(505);
      var time = TimeTool.getYMD3(gcore.SmartSocket.getTime());
      var rid = RoleController.getInstance().getRoleVo().rid;
      var key = cc.js.formatStr("%s"+"_"+"activity"+"_"+"%s"+"_"+"%s",rid ,505 ,time);
      var value  = this.getLocalStorageItem(key);
      if(activity && !value){
        //时间暂时不处理
        ActionController.openSevenLoginWin(true);
        this.closeLastPopup();
        this.setLastPopup(ActionController.seven_login_win);
        value = "true"
        this.setLocalStorageItem(key,value)
      }else{
        this.doRun();
      }
    },

    checkCommonPopup:function(){//常驻签到
      var WelfareController = require("welfare_controller");
      var time = TimeTool.getYMD3(gcore.SmartSocket.getTime());
      var rid = RoleController.getInstance().getRoleVo().rid;
      var key = cc.js.formatStr("%s"+"_"+"activity"+"_"+"%s"+"_"+"%s",rid , 8003 ,time);
      var value  = this.getLocalStorageItem(key);
      if(!value && this.bCheckCommonPopup){
        //时间暂时不处理
        WelfareController.getInstance().openActivityWindow(true);
        this.closeLastPopup();
        this.setLastPopup(WelfareController.getInstance().activity_window);
        value = "true"
        this.setLocalStorageItem(key,value)
      }else{
        this.doRun();
      }
    },

    checkBannerPopup:function(){
      var time = TimeTool.getYMD3(gcore.SmartSocket.getTime());
      var rid = RoleController.getInstance().getRoleVo().rid;
      var str = "banner";
      var key = cc.js.formatStr("%s"+"_"+"activity"+"_"+"%s"+"_"+"%s",rid ,str ,time);
      var value  = this.getLocalStorageItem(key);
      if(!value){
        var ActivityController = require("activity_controller");
        ActivityController.getInstance().openActivityPopup(true);
        this.closeLastPopup();
        this.setLastPopup(ActivityController.getInstance().activityPopup);
        value = "true";
        this.setLocalStorageItem(key,value);
      }else{
        this.doRun();
      }
      
    },

    setLocalStorageItem:function(key,value){
      if(cc.sys.localStorage){
        cc.sys.localStorage.setItem(key,value);
      }
    },

    getLocalStorageItem:function(key){
      var value = null;
      if(cc.sys.localStorage){
        value = cc.sys.localStorage.getItem(key);
      }
      return value;
    },

    removeLocalStorageItem:function(key){
      if(cc.sys.localStorage){
        cc.sys.localStorage.removeItem(key);
      }  
    },
   
});

LoginPopupManager.getInstance = function () {
    if (!LoginPopupManager.instance) {
      LoginPopupManager.instance = new LoginPopupManager();
    }
    return LoginPopupManager.instance;
}

module.exports = LoginPopupManager;