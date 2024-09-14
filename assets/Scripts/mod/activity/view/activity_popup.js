// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     活动主界面
// <br/>Create: 2019-05-06 14:33:44
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActivityEvent = require("activity_event");

var ActivityWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("activity", "activity_popup");
        this.viewTag = SCENE_TAG.top;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.ctrl = require("activity_controller").getInstance();
        // this.model = this.ctrl.getModel();

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
      this.iType = 0;//弹窗默认第一页
      this.pointListTab = [];
      this.pageItemList = [];
      this.lookNum = 0;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.main_container = this.seekChild("main_container");
        this.pointList = this.seekChild("point_list");
        this.scrollview = this.seekChild("scrollview");
        this.pageview =  this.seekChild("pageView");
        this.pageviewComponent = this.pageview.getComponent(cc.PageView);
        this.pageviewContent = this.pageview.getChildByName("view").getChildByName("content");
        this.title = this.seekChild("title");
        this.close_btn = this.seekChild("close_btn");
        this.right_btn = this.seekChild("right");
        this.left_btn = this.seekChild("left");
        this.click_nd = this.seekChild("click");
        this.click_nd.width =cc.winSize.width;
        this.click_nd.height = cc.winSize.height;
        this.title = this.main_container.getChildByName("content").getChildByName("title");
        this.title.getComponent(cc.Label).string = "イベント一覧";
        this.pageItem = this.pageviewContent.getChildByName("activity_pc_item");
        this.pageviewContent.removeAllChildren();
        this.indicator = this.pageview.getChildByName("indicator");
        this.indicator.active = false;
        this.pointList.active =true;
    },

    checkItme:function(){
      var posx = this.scrollview_list.getCurContainerPosX();
      var list = this.scrollview_list.getItemList();
      for(let index in list){
        if(index == this.iType){
          continue;
        }
        let item = list[index];
        if(item&&item.params){
          // cc.log(posx,item.x,item.params.width,Math.abs((posx+item.params.width/2) + item.x))
          if(Math.abs(-(posx-item.params.width/2)  - item.x)<item.params.width/2 ||Math.abs((posx+item.params.width/2) + item.x)<item.params.width/2){
            this.iType = Number(index);
            this.scrollview_list.scrollTo(index,0.5);
            this.updateActivityPoint();
            cc.log(this.iType,"MOVE--------------------------------------MOVE")
          }
        }
      }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

      this.close_btn.on(cc.Node.EventType.TOUCH_END,function(){
        if(this.lookNum <this.dataList.length){
          cc.log("未看完所有活动")
          return;
        }
        this.ctrl.openActivityPopup(false);
        var LoginPopupManager = require("LoginPopupManager")
        if(LoginPopupManager.getInstance().getIsPopupStatus()){
          gcore.GlobalEvent.fire(EventId.POPUP_DORUN);
        }
      }.bind(this));

      this.left_btn.on(cc.Node.EventType.TOUCH_END,function(){
        if(this.iType==0){
          cc.log("已经是第一页了")
          return;
        }
        this.iType--;
        this.pageviewComponent.scrollToPage(this.iType);
        // this.scrollview_list.scrollTo(this.iType,1);
        this.updateUI();
        this.updateActivityPoint();
      }.bind(this));
      this.right_btn.on(cc.Node.EventType.TOUCH_END,function(){
        if(this.iType == this.dataList.length){
          cc.log("已经是最后一页了")
          return;
        }
        this.iType++;
        this.pageviewComponent.scrollToPage(this.iType);
        // this.scrollview_list.scrollTo(this.iType,1);
        this.updateUI();
        this.updateActivityPoint();
      }.bind(this));
    },

    refreshPageItem:function(item){
      item.itemBG = item.getChildByName("main_container").getChildByName("itemBG");
      var data = Config.holiday_role_data.data_sub_activity;
      var data1 = Config.holiday_role_data.data_sub_personal_activity;
        var key = item.data.bid+"_"+item.data.camp_id;
        var info = data[key];
        if(!info){
          info = data1[key];
        }
        if(!info){
          return;
        }
        var res = info.res_bg+"_"+"big";
        LoaderManager.getInstance().loadRes("ui_res/bannerui/"+res+".png", function(res) {
          if(res){
            item.itemBG.getComponent(cc.Sprite).spriteFrame = res;
          }
        }.bind(this));
        item.on(cc.Node.EventType.TOUCH_END,(event)=>{
          var controller = require("action_controller");
          controller.getInstance().openActionMainPanel(true,null,item.data.bid);
          this.ctrl.openActivityPopup(false);
        })
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
      var ActivityController = require("activity_controller");
      var model = ActivityController.getInstance().getModel();
      this.dataList = model.getActivityList();
      this.pageviewComponent.removePageAtIndex();
      this.pageviewComponent.removeAllPages();
      this.pageview.on('touchmove', this.updateActivityPoint, this);
      this.pageview.on('touchend', this.updateActivityPoint, this);
      this.pageview.on('page-turning', this.updateActivityPoint, this);

      for(let index in this.dataList){
        let infoData = this.dataList[index];
        var item = cc.instantiate(this.pageItem);      
        if(item){
          item.data = infoData;
          item.index = index;
          this.pageItemList[index] = item;
        }
        this.pageview.getComponent(cc.PageView).addPage(item);
        this.refreshPageItem(item);
      }
      this.updateUI();
      if(this.dataList.length>1){
        var point_nd = this.pointList.getChildByName("point");
        point_nd.index = 0;
        this.pointListTab[point_nd.index] = point_nd;
        for(let i = 1;i<this.dataList.length;i++){
          var node = cc.instantiate(point_nd);
          node.index = i;
          this.pointListTab[i] = node;
          this.pointList.addChild(node);
        }
        this.updateActivityPoint();
        this.scheduleActivity();
      }else{
        this.left_btn.active =false;
        this.right_btn.active = false;
      }
      // this.scheduleActivity();
      this.close_btn.getChildByName("label").getComponent(cc.Label).string = "閉じる";
      this.right_btn.getChildByName("label").getComponent(cc.Label).string = "次へ";
      this.left_btn.getChildByName("label").getComponent(cc.Label).string = "前へ";
      return;
      var scroll_view_size = this.scrollview.getContentSize();
      var ActivityItem = require("activity_item_panel");
      var setting = {
          item_class: ActivityItem,      // 单元类
          start_x: 0,                  // 第一个单元的X起点
          space_x: 10,                    // x方向的间隔
          start_y: 0,                    // 第一个单元的Y起点
          space_y: 0,                    // y方向的间隔
          item_width: 552,               // 单元的尺寸width
          item_height: 690,              // 单元的尺寸height
          row: 1,                        // 行数，作用于水平滚动类型
          col: 0,                         // 列数，作用于垂直滚动类型
          delay: 2,
          item_obj:{width:552,height:690},
      }
      var CommonScrollView = require("common_scrollview");
      this.scrollview_list = new CommonScrollView();
      this.scrollview_list.createScroll(this.scrollview, cc.v2(0,0) , ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting);
      
      let extend ={iType:3};
      let callBack = function(activity){
        // var controller = require("welfare_controller");
        // controller.getInstance().openMainWindow(true,activity.bid);
        var controller = require("action_controller");
        controller.getInstance().openActionMainPanel(true,null,activity.bid);
        this.ctrl.openActivityPopup(false);
      };
      this.scrollview_list.setData(this.dataList, callBack, extend);
      this.scrollview_list.setInertiaEnabled(false);


      if(this.dataList.length>1){
        var point_nd = this.pointList.getChildByName("point");
        point_nd.index = 0;
        this.pointListTab[point_nd.index] = point_nd;
        for(let i = 1;i<this.dataList.length;i++){
          var node = cc.instantiate(point_nd);
          node.index = i;
          this.pointListTab[i] = node;
          this.pointList.addChild(node);
        }
        this.updateActivityPoint();
        this.scheduleActivity();
      }else{
        this.left_btn.active =false;
        this.right_btn.active = false;
      }
      
      
      
      //按钮
      this.close_btn.getChildByName("label").getComponent(cc.Label).string = "閉じる";
      this.right_btn.getChildByName("label").getComponent(cc.Label).string = "次へ";
      this.left_btn.getChildByName("label").getComponent(cc.Label).string = "前へ";
      

      this.updateUI();
    },

    scheduleActivity:function(){
      // this.key = setTimeout(()=>{
      //   this.iType = (this.iType+1)%this.dataList.length;
      //   this.scrollview_list.scrollTo(this.iType,1);
      //   this.updateActivityPoint()
      //   this.scheduleActivity();
      // },5000)
      this.key = setTimeout(()=>{
        this.iType = this.pageviewComponent.getCurrentPageIndex();
        this.iType = (this.iType+1)%this.dataList.length;
        this.pageviewComponent.scrollToPage(this.iType);
        this.scheduleActivity();  
        this.updateActivityPoint();
        this.updateUI();
      },5000)
    },

    updateActivityPoint:function(){
      this.updateUI();
      for(let index in this.pointListTab){
        let node = this.pointListTab[index];
        if(node.index == this.iType){
          node.getChildByName("select").active = true;
          node.getChildByName("mask").active = false;
        }else{
          node.getChildByName("select").active = false;
          node.getChildByName("mask").active = true;
        }
      }
    },

    updateUI:function(){
      this.iType = this.pageviewComponent.getCurrentPageIndex();
      for(let index in this.pageItemList){
        let node = this.pageItemList[index];
        if(node.index == this.iType){
          if(!node.is_Look){
            this.lookNum++;
            node.is_Look =true;
          }
        }
      }

      for(let index in this.indicator.children){
        let child = this.indicator.children[index];
        child.opacity = 255;
        if(index == this.iType){
          cc.log("------------------------");
          child.color = cc.color(255,255,255,255);
        }else{
          child.color = cc.color(0,0,0,255);
        }
      }
      //按钮状态
      if(this.iType == 0){
        this.left_btn.getChildByName("mask").active = true;
        this.right_btn.getChildByName("mask").active = false;
      }else if(this.iType == this.dataList.length -1){
        this.left_btn.getChildByName("mask").active = false;
        this.right_btn.getChildByName("mask").active = true;
      }else{
        this.left_btn.getChildByName("mask").active = false;
        this.right_btn.getChildByName("mask").active = false;
      }
      // cc.log(this.lookNum);
      if( this.lookNum >=  this.dataList.length){
        this.close_btn.getChildByName("mask").active = false;
      }else{
        this.close_btn.getChildByName("mask").active = true;
      }
    },

    closeCallBack:function(){
      if(this.cttl){
        this.ctrl.openActivityPopup(false);
      }
      if(this.key){
        clearTimeout(this.key);
        this.key = null;
      }
      if (this.scrollview_list){
        this.scrollview_list.deleteMe();
        this.scrollview_list = null;
      }
    },
    
})