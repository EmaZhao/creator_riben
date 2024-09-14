// --------------------------------------------------------------------
// @author: (必填, 创建模块的人员)
// @description:
//     活动签到  id 991027
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool");
var WelfareEvent = require("welfare_event");
var WelfareController = require("welfare_controller");

var ActivityWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_fifteen_activity_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.ctrl = WelfareController.getInstance();

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
     this.dayList = [];
     
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
      if(window.IS_PC){
        this.mask_nd = this.seekChild("mask");
        this.mask_nd.setContentSize(2200,1280);
      }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
      this.addGlobalEvent(WelfareEvent.Update_Sign_Info, function (data) {
          this.createList(data)
      }, this)

      this.addGlobalEvent(WelfareEvent.Sign_Success, function (data) {
          this.createList(data);
      }, this)
      this.ctrl.sender14100();

     
    },

    createList: function (data) {
      var config = Config.checkin_data.data_award;
      this.month = data.month ? data.month: 1;
      this.activity = data;
      var data_list = Utils.deepCopy(config[this.month]);
      var has_day = data.day;
      var now_day = 0;
      var list = [];
      for (var k in data_list) {
          var v = data_list[k];
          if (data.status > 0) {
              if (k < has_day) {        //累计的
                  v.status = 3;       //已领取全部奖励
              } else if (k == has_day) {    //今天
                  v.status = 3;
              } else {    //之后的
                  v.status = 1
              }
              v.now_day = has_day
              now_day = has_day;
          } else if (data.status == 0) {
              if (k <= has_day) {       //累计的
                  v.status = 3;       //已领取全部奖励
              } else if (k == has_day + 1) {    //今天
                  v.status = 2;
              } else {      //之后的
                  v.status = 1;
              }
              v.now_day = has_day + 1;
              now_day = has_day + 1;
          }
          list.push(v);
      }
      
      list.sort(Utils.tableLowerSorter(["day"]))
      this.data = list;
      // console.error(list);
      this.refreshReward(list);
      
    },

    refreshReward:function(list){//刷新奖励显示
      this.container.removeAllChildren();
      var x = -350
      var y = 360+170;
      var LoginItem = require("action_seven_login_item_panel");
      for(let index in list){
        if(this.day_nd){
          let node = cc.instantiate(this.day_nd);
          this.container.addChild(node);
          if((index)%5 == 0 ){
            x = -350;
            y-= 170
          }else{
            x += 135;
          }
          node.x = x;
          node.y = y;
          var item = new LoginItem();
          item.index = Number(index);
          item.setParent(node);
          item.setData(Number(index),3);
          item.setActivity(this.data[item.index]);
          item.show();
          this.dayList[Number(index)] = item;
          item.addCallBack(function (i){
            this.selectByIndex(i);
          }.bind(this,index));
        }
      }
    },

    selectByIndex:function(index){
      let item = this.dayList[index];
      if(item.status == 1){
        message(Utils.TI18N("未到天数"));
      }else if(item.status == 2){
        this.ctrl.sender14101(this.activity);
      }else if(item.status == 3){
        message(Utils.TI18N("已经领取过啦"));
      }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
      this.main_panel = this.seekChild("main_panel");
      this.main_panel.scale = 0;
      this.main_panel.runAction(cc.scaleTo(0.2,1,1));
      this.main_panel.on(cc.Node.EventType.TOUCH_END,()=>{
          this.ctrl.openActivityWindow(false);
          var b = false;
          for(let info of this.dayList){
            if(info.status == 2){
              this.ctrl.sender14101(this.activity);
              b = true;
            }
          }
          if(!b){
            var LoginPopupManager = require("LoginPopupManager")
            if(LoginPopupManager.getInstance().getIsPopupStatus()){
              gcore.GlobalEvent.fire(EventId.POPUP_DORUN);
            }
          }
      });
      this.container = this.seekChild("container");
      this.day_nd = this.container.getChildByName("day1");
      this.container.removeAllChildren();
      
    },


   
    closeCallBack:function(){
      
    },
    
})