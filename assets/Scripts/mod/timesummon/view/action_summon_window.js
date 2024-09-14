// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-01-14 09:29:03
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ActionConst = require("action_const");
var ActionController = require("action_controller");
var SummonEvent = require("partnersummon_event"); 

var ActionSummonWindos = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("action", "action_summon_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.rleasePrefab = false;
        this.summonType = ActionConst.ActionRankCommonType.time_summon;
        this.limit_summon = null;
        this.elite_summon = null;
        this.dmm_summon = null;
    },


    openCallBack: function() {
        this.maincontainer = this.seekChild("main_container");
        this.limit_btn = this.seekChild("limitsummon_btn");
        this.limit_redPoint = this.limit_btn.getChildByName("point");
        this.elite_btn = this.seekChild("elitesummon_btn");
        this.elite_redPoint = this.elite_btn.getChildByName("point");
        this.dmmSummon_btn = this.seekChild("dmmsummon_btn");
        this.close_btn = this.seekChild("closeButton");
        // this.elite_btn.getChildByName("di").zIndex = -1;
        // this.elite_btn.getChildByName("bg").zIndex = 1;
        // this.limit_btn.getChildByName("di").zIndex = -1;
        // this.limit_btn.getChildByName("bg").zIndex = 1;
        this.select = this.seekChild("summon_select")
        let openlimit = ActionController.getInstance().checkActionExistByActionBid(ActionConst.ActionRankCommonType.time_summon)||ActionController.getInstance().checkActionExistByActionBid(ActionConst.ActionRankCommonType.old_time_summon);
        let openelite = ActionController.getInstance().checkActionExistByActionBid(ActionConst.ActionRankCommonType.elite_summon)||ActionController.getInstance().checkActionExistByActionBid(ActionConst.ActionRankCommonType.old_elite_summon);
        let openDmm = ActionController.getInstance().checkActionExistByActionBid(ActionConst.ActionRankCommonType.dmm_summon);
        this.limit_btn.active = openlimit;
        this.elite_btn.active = openelite;
        this.dmmSummon_btn.active = openDmm;
        if(openelite && openlimit && openDmm){
            this.dmmSummon_btn.x = -234;
            this.limit_btn.x = 4;
            this.elite_btn.x = 242;
            this.summonType = ActionConst.ActionRankCommonType.dmm_summon;
        }else if((openelite && openlimit)||(openDmm && openlimit)||(openDmm && openelite)){
          if(openelite && openlimit){
            this.limit_btn.x = -120;
            this.elite_btn.x = 118;
            this.summonType = ActionConst.ActionRankCommonType.time_summon;
          }else if(openDmm && openlimit){
            this.dmmSummon_btn.x = -120;
            this.limit_btn.x = 118;
            this.summonType = ActionConst.ActionRankCommonType.dmm_summon;
          }else{
            this.dmmSummon_btn.x = -120;
            this.elite_btn.x = 118;
            this.summonType = ActionConst.ActionRankCommonType.dmm_summon;
          }
        }else if(openlimit){
            this.limit_btn.x = 0;
            this.summonType = ActionConst.ActionRankCommonType.time_summon;
        }else if(openelite){
            this.elite_btn.x = 0;
            this.summonType = ActionConst.ActionRankCommonType.elite_summon;
        }else if(openDmm){
            this.dmmSummon_btn.x = 0;
            this.summonType = ActionConst.ActionRankCommonType.dmm_summon;
        }
        this.clicksummonTypeBtn(this.summonType);
        //ViewManager.getInstance().addToSceneNode(this.root_wnd, SCENE_TAG.top)
    },

    registerEvent: function() {
        // 召唤信息更新
        this.limit_btn.on('click',function(){
            this.clicksummonTypeBtn(ActionConst.ActionRankCommonType.old_time_summon)
            this.clicksummonTypeBtn(ActionConst.ActionRankCommonType.time_summon)
            this.updataRedPint();
        },this)
        this.elite_btn.on('click',function(){
            this.clicksummonTypeBtn(ActionConst.ActionRankCommonType.elite_summon)
            this.clicksummonTypeBtn(ActionConst.ActionRankCommonType.old_elite_summon)
            this.updataRedPint();
        },this)
        this.dmmSummon_btn.on('click',()=>{
            this.clicksummonTypeBtn(ActionConst.ActionRankCommonType.dmm_summon);
            this.updataRedPint();
        })
        this.close_btn.on('click',function(){
            Utils.playButtonSound("c_close");
            require("action_controller").getInstance().openActionSummonView(false);
        },this)

        this.addGlobalEvent(SummonEvent.PartnerSummonSuccess, function() {
          this.key = setTimeout(()=>{this.updataRedPint()},500)
        }.bind(this));
    },

    openRootWnd: function(params) {
        if(params.iType){
          this.summonType = params.iType;
        }
        this.clicksummonTypeBtn(this.summonType);
        this.initWidgets();
        this.updataRedPint();
    },

    updataRedPint(){
      // if(this.dmmSummon_btn.active){
      //   //不做处理
      // }
      if(this.elite_btn.active){
        var data = require("action_controller").getInstance().getHolidayAweradsStatus(require("action_const").ActionRankCommonType.elite_summon);
        if(!data){
          data = require("action_controller").getInstance().getHolidayAweradsStatus(require("action_const").ActionRankCommonType.old_elite_summon);
        }
        if(data &&data.status){
          this.elite_redPoint.active = true;
        }else{
          this.elite_redPoint.active = false;
        }
      }
      if(this.limit_btn.active){
        var data = require("action_controller").getInstance().getHolidayAweradsStatus(require("action_const").ActionRankCommonType.time_summon);
        if(!data){
          data = require("action_controller").getInstance().getHolidayAweradsStatus(require("action_const").ActionRankCommonType.old_time_summon);
        }
        if(data && data.status){
          this.limit_redPoint.active = true;
        }else{
          this.limit_redPoint.active = false;
        }
      }
    },
    clicksummonTypeBtn:function(summontype){
        this.summonType = summontype;
        if(this.summonType == ActionConst.ActionRankCommonType.time_summon||this.summonType == ActionConst.ActionRankCommonType.old_time_summon){
            this.select.parent = this.limit_btn;
        }else if(this.summonType == ActionConst.ActionRankCommonType.elite_summon||this.summonType == ActionConst.ActionRankCommonType.old_elite_summon){
            this.select.parent = this.elite_btn;
        }else{
            this.select.parent = this.dmmSummon_btn;
        }
        this.select.x = -0.6;
        this.select.zIndex = 10;
        this.select.active = true;

        let a = this.summonType == ActionConst.ActionRankCommonType.time_summon;
        if(this.summonType == ActionConst.ActionRankCommonType.time_summon||this.summonType == ActionConst.ActionRankCommonType.old_time_summon){
            if(!this.limit_summon){
                var panel =  Utils.createClass("action_time_summon_panel",120);
                panel.setParent(this.maincontainer);
                panel.setZIndex(-1);
                this.limit_summon = panel;
            }
            if(this.elite_summon){
                this.elite_summon.hide()
            }
            if(this.dmm_summon){
              this.dmm_summon.hide();
            }
            this.limit_summon.show();
        }else if(this.summonType == ActionConst.ActionRankCommonType.elite_summon||this.summonType == ActionConst.ActionRankCommonType.old_elite_summon){
            if(!this.elite_summon){
                var panel = Utils.createClass("elitesummon_panel",120);
                panel.setParent(this.maincontainer);
                panel.setZIndex(-1);
                this.elite_summon = panel;
            }
            if(this.limit_summon){
                this.limit_summon.hide();
            }
            if(this.dmm_summon){
              this.dmm_summon.hide();
            }
            this.elite_summon.show();
        }else{
            if(!this.dmm_summon){
              var panel = Utils.createClass("action_dmm_summon_panel");
              // this.maincontainer.addChild(panel);
              panel.setParent(this.maincontainer);
              panel.setZIndex(-1);
              this.dmm_summon = panel;
            }
            if(this.limit_summon ){
                this.limit_summon.hide();
            }
            if(this.elite_summon){
              this.elite_summon.hide()
            }
            this.dmm_summon.show();
        }
    },
    initWidgets: function() {

    },

    deleteMe: function() {
        this._super();
        if(this.elite_summon){
            this.elite_summon.deleteMe();
        }
        if(this.limit_summon){
            this.limit_summon.deleteMe();
        }
        if(this.dmm_summon){
            this.dmm_summon.deleteMe();
        }
        if(this.key){
          clearTimeout(this.key);
        }
    },

})