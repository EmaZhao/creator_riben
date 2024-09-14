// --------------------------------------------------------------------
// @author: (必填, 创建模块的人员)
// @description:
//     活动签到  id 991027
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionEvent = require("action_event");
var TimeTool = require("timetool");

var ActivityWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_seven_activity_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.ctrl = require("action_controller").getInstance();
        this.status = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
      
      this.holiday_bid = 991027;
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
      
      this.addGlobalEvent(ActionEvent.UPDATE_HOLIDAY_SIGNLE,function(data){
        if (!data) return
        if (data.bid == this.holiday_bid){
            const list = [];
            data.aim_list.sort((a,b)=>{
              return a.aim - b.aim;
            })
            var b = false;
            for(let i=0 ;i<7;i++){
              const element = data.aim_list.shift();
              if(element.status == 1){
                  b = true
              }
              list.push(element);
            }
            if(!b && this.status == false){
              this.ctrl.openSevenActivityWindow(false);
              var LoginPopupManager = require("LoginPopupManager")
              if(LoginPopupManager.getInstance().getIsPopupStatus()){
                gcore.GlobalEvent.fire(EventId.POPUP_DORUN);
              }
              return;
            }
            this.status = true;
            data.aim_list = list;
            this.data = data;
            this.upadteDate();
            
        }  
      }.bind(this))
      this.ctrl.cs16603(this.holiday_bid);
      
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
      this.main_panel = this.seekChild("main_panel");
      this.seven_con = this.seekChild("seven_con");
      this.main_panel.scale = 0;
      this.key1 = setTimeout(()=>{this.main_panel.runAction(cc.scaleTo(0.2,1,1));},100);
      
      this.bg = this.seekChild("bg");
      this.main_panel.on(cc.Node.EventType.TOUCH_END,()=>{
        if(this.holiday_bid && this.data){
          this.ctrl.openSevenActivityWindow(false);
          var b = false;
          for(let info of this.dayList){
            if(info.activity.status == 1){
              this.ctrl.cs16604(this.holiday_bid,info.activity.aim);
              b = true;
            }
          }
          if(!b){
            var LoginPopupManager = require("LoginPopupManager")
            if(LoginPopupManager.getInstance().getIsPopupStatus()){
              gcore.GlobalEvent.fire(EventId.POPUP_DORUN);
            }
          }
        }
      });
      this.timeLabel = this.bg.getChildByName("label");
      
        // gcore.SmartSocket.getTime()
    },

    selectByIndex:function(index){
      let item = this.dayList[index];
      if(item.status == 0){
        message(Utils.TI18N("未到天数"));
      }else if(item.status == 1){
        if(this.holiday_bid && item.activity){
          this.ctrl.cs16604(this.holiday_bid,item.activity.aim)
        }
      }else if(item.status == 2){
        message(Utils.TI18N("已经领取过啦"));
      }
    },

    updateTime(){
      if(this.key){
        clearTimeout(this.key);
      }
      this.key = setTimeout(()=>{
        if(this.data){
          this.data.remain_sec -- ;
          var str = TimeTool.getTimeForFunction(this.data.remain_sec);
          this.timeLabel_cp.string = Utils.TI18N("残り時間:") + str;
        }
        this.updateTime();
      },1000)
    },

    upadteDate:function(){
      if(this.data){
        var LoginItem = require("action_seven_login_item_panel");
        for(let index in this.seven_con.children){
          let child = this.seven_con.children[index];
          child.removeAllChildren();
          var item = new LoginItem();
          item.index = Number(index);
          if(child.children.length>0){
            item.setActivity(this.data.aim_list[item.index]);
            continue;
          }
          item.setParent(child);
          item.setData(Number(index),2);
          item.setActivity(this.data.aim_list[item.index]);
          item.show();
          this.dayList[Number(index)] = item;
          item.addCallBack(function (i){
              this.selectByIndex(i);
          }.bind(this,index));
        }
        // var str1 =TimeTool.getYMD3(gcore.SmartSocket.getTime()+this.data.remain_sec - 7*TimeTool.day2s());
        // var str = TimeTool.getYMD3(gcore.SmartSocket.getTime()+this.data.remain_sec);
        // this.timeLabel.getComponent(cc.Label).string = str1 +"~"+str;
        var str = TimeTool.getTimeForFunction(this.data.remain_sec);
        this.timeLabel_cp = this.timeLabel.getComponent(cc.Label);
        this.timeLabel_cp.string = Utils.TI18N("残り時間:") + str;
        this.updateTime();
      }
    },

   
    closeCallBack:function(){
      if(this.key)
          clearTimeout(this.key);
      if(this.key1){
          clearTimeout(this.key1);
      }
    },
    
})