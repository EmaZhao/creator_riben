// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-07 15:32:46
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var EsecsiceController = require("esecsice_controller");
var EsecsiceConst = require("esecsice_const");
var MainSceneController = require("mainscene_controller");
var sceneConst = require("scene_const");

var EsecsiceMainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("esercise", "esercise_main_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    initConfig:function(){
      this.tabList = [];
      this.tabListData = {}
    },

      // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
      openCallBack:function(){

        this.initUI();//初始UI
        this.updateData();
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
        let effectPath = PathTool.getSpinePath("E51311", "action")
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


    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
      this.addGlobalEvent(require("esecsice_const").Esecsice_Main_RedPoint_Event, function() 
      {
        this.updataRedpointStatus();
      }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){

    },

    updateData:function(){//暂时没有锁的先默认 false
      for(let index in this.tabList){
        this.tabListData[index] = {}
        var RoleController = require("role_controller");
        var roleData = RoleController.getInstance().getRoleVo();
        if(index == 0){
          var data = Config.dailyplay_data.data_exerciseactivity[EsecsiceConst.execsice_index.stonedungeon];
          // cc.log(roleData.lev,data.activate[0][1]);
          this.tabListData[index].isLock = !(roleData.lev >= data.activate[0][1]);
          this.tabListData[index].desc =  data.lock_desc;
          this.tabListData[index].label =  cc.js.formatStr("%sで開放", data.activate[0][1]);
        }else if(index == 1){
          var data = Config.dailyplay_data.data_exerciseactivity[EsecsiceConst.execsice_index.heroexpedit];
          this.tabListData[index].isLock = !(roleData.lev >= data.activate[0][1]);;
          this.tabListData[index].desc =  data.lock_desc;
          this.tabListData[index].label =  cc.js.formatStr("%sで開放", data.activate[0][1]);
        }else if(index == 2){
          var data = MainSceneController.getInstance().getBuildVo(sceneConst.CenterSceneBuild.adventure);
          this.tabListData[index].isLock = data.is_lock;
          this.tabListData[index].desc =  data.desc;
          this.tabListData[index].label =  cc.js.formatStr("%sで開放", data.activate[0][1]);
        }else if(index == 3){
          var data = MainSceneController.getInstance().getBuildVo(sceneConst.CenterSceneBuild.arena);
          this.tabListData[index].isLock = data.is_lock;
          this.tabListData[index].desc =  data.desc;
          this.tabListData[index].label =  cc.js.formatStr("%sで開放", data.activate[0][1]);
        }else if(index == 4){
          var data = Config.dailyplay_data.data_exerciseactivity[EsecsiceConst.execsice_index.honourfane];
          this.tabListData[index].isLock = !(roleData.lev >= data.activate[0][1]);;
          this.tabListData[index].desc =  data.lock_desc;
          this.tabListData[index].label =  cc.js.formatStr("%sで開放", data.activate[0][1]);
        }else if(index == 5){
          var data = Config.dailyplay_data.data_exerciseactivity[EsecsiceConst.execsice_index.endless];
          this.tabListData[index].isLock = !(roleData.lev >= data.activate[0][1]);;
          this.tabListData[index].desc =  data.lock_desc;
          this.tabListData[index].label =  cc.js.formatStr("%sで開放", data.activate[0][1]);
        }else{
          var data = MainSceneController.getInstance().getBuildVo(sceneConst.CenterSceneBuild.startower);
          this.tabListData[index].isLock = data.is_lock;
          this.tabListData[index].desc =  data.desc;
          this.tabListData[index].label =  cc.js.formatStr("%sで開放", data.activate[0][1]);
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
      var rpdata =require("esecsice_controller").getInstance().getModel().getEsecsiceMainRedPointData();
      let rpstatus = false;
      for (var index = 0;index<this.tabList.length;index++){
        let child = this.tabList[index];
        if(rpdata){
          rpstatus = rpdata[index];
        }
        if(!child.lock.active){
          child.rp.active = rpstatus;
        }
      }
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
          EsecsiceController.getInstance().switchEcecsiceActivityView(EsecsiceConst.execsice_index.stonedungeon);
        }else if(index == 1){
          EsecsiceController.getInstance().switchEcecsiceActivityView(EsecsiceConst.execsice_index.heroexpedit);
        }else if(index == 2){
          require("adventureactivity_controller").getInstance().openAdventureActivityMainWindow(true);
        }else if(index == 3){
          var ArenaController = require("arena_controller");
          ArenaController.getInstance().requestOpenArenWindow(true);
        }else if(index == 4){
          EsecsiceController.getInstance().switchEcecsiceActivityView(EsecsiceConst.execsice_index.honourfane);
        }else if(index == 5){
          EsecsiceController.getInstance().switchEcecsiceActivityView(EsecsiceConst.execsice_index.endless);
        }else{
          var Battleconst = require("battle_const");
          require("mainui_controller").getInstance().requestOpenBattleRelevanceWindow(Battleconst.Fight_Type.StarTower);
        }
      }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
            EsecsiceController.getInstance().openEsecsiceMainView(false);
    },

});
