// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-18 09:25:07
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var MainSceneController = require("mainscene_controller");
var MainSceneConst = require("mainscene_const");

var HeroMainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_main_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
      this.tabList = [];
      this.tabListData = {}
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){

      this.initUI();//初始UI
      this.updateData();//更新数据
      this.updateUI();//刷新UI显示

    },

    initUI:function(){
      var mainConstainer = this.seekChild("main_container");
      for(let index in mainConstainer.children){
        let child = mainConstainer.children[index];
        let bg = child.getChildByName("Background");
        let mask = bg.getChildByName("mask");
        let lock = bg.getChildByName("lock");
        let label = bg.getChildByName("label");
        let rp = bg.getChildByName("tip_point");
        let bgAni = this.seekChild("sk_ani", sp.Skeleton);
        let effectPath = PathTool.getSpinePath("E51310", "action")
        this.loadRes(effectPath, (res_object)=> {
            bgAni.skeletonData = res_object;
            bgAni.setAnimation(0, PlayerAction.action, true)
        });
        mask.active = false;
        lock.active = false;
        label.active = false;
        child.index = index;
        child.lock =  lock;
        child.label = label;
        child.mask = mask;
        child.rp = rp;
        child.on(cc.Node.EventType.TOUCH_END,this.onChlickButton,this);
        this.tabList[index] = child;
        this.tabListData[index] = null;
      }
    },

    updateData:function(){//暂时没有锁的先默认 false
      for(let index in this.tabList){
        this.tabListData[index] = {}
        if(index == 0){
          this.tabListData[index].isLock = false;
          this.tabListData[index].desc = "";
          this.tabListData[index].label =  "";
        }else if(index == 1){
          var data = MainSceneController.getInstance().getBuildVo(MainSceneConst.MainacenBuild.seerpalace);
          this.tabListData[index].isLock = data.is_lock;
          this.tabListData[index].desc =  data.desc;
          this.tabListData[index].label =  cc.js.formatStr("%sで開放", data.activate[0][1]);
        }else if(index == 2){
          var data = MainSceneController.getInstance().getBuildVo(7);
          this.tabListData[index].isLock = data.is_lock;
          this.tabListData[index].desc =  data.desc;
          this.tabListData[index].label =  cc.js.formatStr("%sで開放", data.activate[0][1]);
        }else if(index == 3){
          var data = MainSceneController.getInstance().getBuildVo(MainSceneConst.MainacenBuild.fuse);
          this.tabListData[index].isLock = data.is_lock;
          this.tabListData[index].desc =  data.desc;
          this.tabListData[index].label =  cc.js.formatStr("%sで開放", data.activate[0][1]);
        }else if(index == 4){
          var data = MainSceneController.getInstance().getBuildVo(MainSceneConst.MainacenBuild.mall);
          this.tabListData[index].isLock = data.is_lock;
          this.tabListData[index].desc =  data.desc;
          this.tabListData[index].label =  cc.js.formatStr("%sで開放", data.activate[0][1]);
        }else if(index == 5){
          let mainUiController = require("mainui_controller")
          let max_dun_id = mainUiController.max_dun_id;
          let activateInfo = Config.function_data.data_base[8].activate[0];
          if (activateInfo[0] == "dun") {
            this.tabListData[index].isLock = (max_dun_id >= activateInfo[1])
          }
          this.tabListData[index].desc =  Config.function_data.data_base.desc;
          this.tabListData[index].label = Config.function_data.data_base.label;
        }
      }
    },

    updateUI:function(){
      for(let index in this.tabList){
        let child = this.tabList[index];
        let data = this.tabListData[index];
        if(data&&data.isLock){
          child.lock.active = true;
          child.mask.active = true;
          child.label.active = true;
          child.label.getComponent(cc.Label).string = data.label;
        }else{
          child.lock.active = false;
          child.mask.active = false;
          child.label.active = false;
        }
      }
      this.updataRedpointStatus();
    },

    updataRedpointStatus:function(){
      var rpdata =require("hero_controller").getInstance().getModel().getHeroMainRedPointData();
      let rpstatus = false;
      for (var index = 0;index<this.tabList.length;index++){
        let child = this.tabList[index];
        if(rpdata){
          rpstatus = rpdata[index+1];
        }
        if(!child.lock.active){
          child.rp.active = rpstatus;
        }
      }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
      this.addGlobalEvent(require("hero_event").Hero_Main_RedPoint_Event, function() 
      {
        this.updataRedpointStatus();
      }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        this.ctrl.openHeroMainWindow(false);
    },

    onChlickButton:function(event){
      Utils.playButtonSound(ButtonSound.Normal);
      var sender = event.target;
      var index = sender.index;
      if(index){
        let data = this.tabListData[index];
        if(data.isLock){
          message(Utils.TI18N(data.desc));
          return
        }
        if(index == 0){
          var hero_controller = require("hero_controller").getInstance();
          hero_controller.openHeroBagWindow(true);
        }else if(index == 1){
          var seerpalace = require("seerpalace_controller").getInstance();
          seerpalace.openSeerpalaceMainWindow(true);
        }else if(index == 2){
          var hero_ctl = require("hero_controller").getInstance();
          hero_ctl.openHeroResetWindow(true);
        }else if(index == 3){
          var hero_ctl = require("hero_controller").getInstance();
          hero_ctl.openHeroUpgradeStarFuseWindow(true);
        }else if(index == 4){
          var controller = require("forgehouse_controller")
          controller.getInstance().openForgeHouseView(true);
        }else{
          var controller = require("hallows_controller").getInstance();
          controller.openHallowsMainWindow(true);
        }
      }
    },

})