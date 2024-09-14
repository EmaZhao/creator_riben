// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     活动 Item 项
// <br/>Create: 2019-05-06 14:34:33
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActivityConst = require("activity_const");
var ActivityController = require("activity_controller");
var ActionController = require("action_controller");

var Activity_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function (params) {
        this.prefabPath = PathTool.getPrefabPath("activity", "activity_pc_item");
        this.ctrl = ActivityController.getInstance();
        if(params){
          this.params = params;
        }
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
      this._time = 0;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        if(this.params){
          if(this.params.width){
            this.root_wnd.width = this.params.width;
          }
          if(this.params.height){
            this.root_wnd.height = this.params.height;
          }
        }
        this.mainContainer = this.root_wnd.getChildByName("main_container");

        // this.title = this.mainContainer.getChildByName("title");
        // this.itemMask = this.mainContainer.getChildByName("itemMask");
        // this.textLimit = this.itemMask.getChildByName("textLimit").getComponent(cc.Label);
        // this.textLimit.string = Utils.TI18N("敬请期待");
        // this.itemMask.zIndex = 11;
    
    
        this.textTimeStart = this.mainContainer.getChildByName("textTimeStart").getComponent(cc.Label);
        this.textTimeStart.string = "";
        this.textTimeStart.node.active = false;
        this.itemBG = this.mainContainer.getChildByName("itemBG");
        this.redPoint = this.mainContainer.getChildByName("redPoint");
        this.redPoint.active = false;
    },

    
    setData:function(data){
        this.activity = data;
        if(this.activity.bid == 91029){
          if(!this.activity.camp_id){
            this.activity.camp_id = 30001;
          }
        }
        this.refreshUI();
    },

    getData:function(){
        return this.activity;
    },

    addCallBack:function( value ){
        this.callback =  value;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.btnRule, function () {
        }.bind(this), 1)

        //当用户点击的时候记录鼠标点击状态
        this.root_wnd.on(cc.Node.EventType.TOUCH_START, function(event){
            var touches = event.getTouches();
            this.touch_began = touches[0].getDelta();
        },this);

 

        //当鼠标抬起的时候恢复状态
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function(event){
            var touches = event.getTouches();
            this.touch_end = touches[0].getDelta();
            var is_click = true;
            if(this.touch_began!=null){
                is_click = Math.abs(this.touch_end.x - this.touch_began.x) <= 20 &&
				        Math.abs(this.touch_end.y - this.touch_began.y) <= 20;
            }
            if(is_click == true){
                Utils.playButtonSound(ButtonSound.Normal);
                if(this.callback){
                    this.callback(this.activity);
                }
            }
        },this);

    },

    updateRedStatus:function(){
      if(this.activity){
        var vo = ActionController.getInstance().getHolidayAweradsStatus(this.activity.bid);
        var actionModel = ActionController.getInstance().getModel();
        var status = false;
        if(vo){
          status = vo.status;
        }else{
          if(actionModel.getGiftRedStatusByBid(this.activity.bid)){
            status = actionModel.getGiftRedStatusByBid(this.activity.bid)
          }
        }
        if (vo == null || status == false) {
          this.redPoint.active = false;
        } else {
          // this.redPoint.active = true;
        }
        this.activity.setRedPointStatus(status);
      }
    },

    updateTiem:function(){
      if(this.activity && this.root_wnd){
        var time = this.activity.getTime();
        if(time){
          // this.textTimeStart.node.active = true;
          this.textTimeStart.string = time;
        }else{
          this.textTimeStart.node.active = false;
        }
      }
    },

    setExtendData:function(extend){
      if(extend){
        this.iType = extend.iType;
      }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
      if(params&&params.call_back){
        // cc.log("---------------------------------")
        params.call_back(this.root_wnd);
      }
      this.refreshUI();
      if (this.function_time_ticket == null) {
          this.function_time_ticket = gcore.Timer.set(function () {
              // this.updateTiem();
              // this.updateRedStatus();
              // cc.log("------------------------------------")
          }.bind(this), 1000, -1)
      }
    },

    refreshUI:function(){
      if(this.activity && this.root_wnd){
        
        // this.updateRedStatus();
        // this.updateTiem()

        // this.title.getComponent(cc.Label).string = this.activity.title;

        //资源背景处理
        var data = Config.holiday_role_data.data_sub_activity;
        var data1 = Config.holiday_role_data.data_sub_personal_activity;
        var key = this.activity.bid+"_"+this.activity.camp_id;
        var info = data[key];
        if(!info){
          info = data1[key];
        }
        if(!info){
          return;
        }
        if(this.iType && info.res_bg){
          var res = info.res_bg;
          if(this.iType == ActivityConst.ActivityShowType.small){
              res = res+"_"+"small";
          }else if(this.iType ==  ActivityConst.ActivityShowType.middle){
              res = res+"_"+"middle"
          }else if(this.iType == ActivityConst.ActivityShowType.big){
              res = res+"_"+"big"
          }else{
              res = ""
          }
          LoaderManager.getInstance().loadRes("ui_res/bannerui/"+res+".png", function(res) {
            if(res){
              this.itemBG.getComponent(cc.Sprite).spriteFrame = res;
            }
          }.bind(this));
        }
      }
    },

    

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },
    

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
      if(this.function_time_ticket){
          gcore.Timer.del(this.function_time_ticket);
          this.function_time_ticket = null;
      }
    },
})