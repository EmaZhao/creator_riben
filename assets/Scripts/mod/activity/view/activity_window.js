// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     活动主界面
// <br/>Create: 2019-05-06 14:33:44
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActivityEvent = require("activity_event");
var ChatEvent          = require("chat_event");

var ActivityWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("activity", "activity_pc_window");
        this.viewTag = SCENE_TAG.pcRight;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.ctrl = arguments[0];
        // this.model = this.ctrl.getModel();

        this.iType = 1//默认1是开启 2是关闭
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.main_container = this.seekChild("main_container");
        this.title = this.seekChild("title");
        this.title.getComponent(cc.Label).string = Utils.TI18N("活动总览");
        this.scrollView = this.seekChild("scrollview");
        var scroll_view_size = this.scrollView.getContentSize();

        this.title = this.seekChild("title");
        this.close_btn = this.seekChild("close_btn");
        var ActivityItem = require("activity_item_panel");
        var setting = {
            item_class: ActivityItem,      // 单元类
            start_x: 0,                  // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 10,                    // y方向的间隔
            item_width: 650,               // 单元的尺寸width
            item_height: 171,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                         // 列数，作用于垂直滚动类型
            delay: 2,
            item_obj:{width:650,height:171},
        }
        
        var CommonScrollView = require("common_scrollview");
        this.scrollview_list = new CommonScrollView();
        this.scrollview_list.createScroll(this.scrollView, cc.v2(15,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(EventId.UPDATE_ROLE_ATTRIBUTE,function(key, value){
            if(key == "lev"){
                if(this.scrollview_list && Utils.next(this.dataInfo) != null){
                    this.scrollview_list.setData(this.dataInfo);
                }
            }
        }.bind(this));

        this.addGlobalEvent(ChatEvent.ChickCloseButton,(iType)=>{
          if(iType == 1){
            this.iType = 2;
            this.main_container.active = false;
            this.close_btn.rotation = 180;
          }else{
            this.iType = 1;
            this.main_container.active = true;
            this.close_btn.rotation = 0;
          }       
        });
        this.close_btn.on(cc.Node.EventType.TOUCH_END,function(){
          var iType = this.iType;
          if(this.iType == 1){
            this.iType = 2;
            this.main_container.active = false;
            this.close_btn.rotation = 180;
          }else{
            this.iType = 1;
            this.main_container.active = true;
            this.close_btn.rotation = 0;
          }
          gcore.GlobalEvent.fire(ActivityEvent.ChickCloseButton, iType);       
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
      var ActivityController = require("activity_controller");
      var model = ActivityController.getInstance().getModel();
      this.dataList =model.getActivityList(); 
      this.title.getComponent(cc.Label).string = "イベント一覧";
      let extend ={iType:2};
      let callBack = function(activity){
        var controller = require("action_controller");
        controller.getInstance().openActionMainPanel(true,null,activity.bid);
      };
      this.scrollview_list.setData(this.dataList,callBack,extend);
    },

    updateItemListRedStatus:function(){
        var item_list = this.scrollview_list.getItemList();
        if(item_list){
            for(var i in item_list){
                item_list[i].updateRedStatus();
            }
        }
    },

    refreshUI:function(){
      if(this.scrollview_list){
        var ActivityController = require("activity_controller");
        var model = ActivityController.getInstance().getModel();
        this.dataList = model.getActivityList();
        if(this.dataList.length>0){
          let extend ={iType:2};
          let callBack = function(activity){
            var controller = require("action_controller");
            controller.getInstance().openActionMainPanel(true,null,activity.bid);
          };
          this.scrollview_list.setData(this.dataList,callBack,extend);
        }
      }
    },
    closeCallBack:function(){
    },
    
})