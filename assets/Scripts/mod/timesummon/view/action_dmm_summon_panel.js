// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-07-08 21:18:12
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimesummonEvent = require("timesummon_event")
var TimesummonController = require("timesummon_controller")
var TimeTool = require("timetool")
var SummonEvent = require("partnersummon_event");
var PartnersummonController = require("partnersummon_controller")
var MainUiController = require("mainui_controller")
var ActionConst = require("action_const")
var ActionDmmSummonPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.summonType = ActionConst.ActionRankCommonType.dmm_summon;
        this.prefabPath = PathTool.getPrefabPath("action", "action_time_summon_panel");
        this.ctrl = TimesummonController.getInstance()
        this.data_summon = Config.recruit_holiday_elite_data.data_summon
        this.data_action = Config.recruit_holiday_elite_data.data_action
        this.data_const = Config.recruit_holiday_elite_data.data_const
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.setPosition(0,0);
        let main_container = this.root_wnd.getChildByName("main_container")
        this.image_bg_sp = main_container.getChildByName("image_bg").getComponent(cc.Sprite)
        this.progress_txt = main_container.getChildByName("progress_txt")
        this.item_num_txt = main_container.getChildByName("item_num_txt")
        this.progress_bg = main_container.getChildByName("progressbg")
        this.itembg = main_container.getChildByName("itembg");
        this.progress_bg.active = false;
        this.itembg.active = false;
        this.progress_txt.active = false;
        this.item_num_txt.active = false;
    
        this.baodi_bg = main_container.getChildByName("baodi_bg");
        this.baodi_bg.active = false;
    
        this.award_btn = main_container.getChildByName("award_btn")
        this.award_btn.x = 360;
        this.preview_btn = main_container.getChildByName("preview_btn")
        this.preview_btn.active = false;
    
        this.summon_btn_1 = main_container.getChildByName("summon_btn_1");
        this.summon_btn_1.active = false;

        this.sp_zhe_nd = main_container.getChildByName("sp_zhe");
        this.sp_zhe_nd.getChildByName("New Label").getComponent(cc.Label).string = Utils.TI18N("5星の英雄1体確定");
        this.sp_zhe_nd.x = 360;
        this.summon_btn_10 = main_container.getChildByName("summon_btn_10")
        this.summon_btn_10.x = 360;
        this.summon_btn_10.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("招募10次")
        this.summon_prop_10_nd = this.summon_btn_10.getChildByName("summon_prop");
        this.summon_prop_sp = this.summon_prop_10_nd.getChildByName("summon_prop_item").getComponent(cc.Sprite)
        this.summon_10_num_lb = this.summon_prop_10_nd.getChildByName("summon_prop_num").getComponent(cc.Label)

        this.time_txt = main_container.getChildByName("time_txt").getComponent(cc.Label)
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(TimesummonEvent.Update_DMMSUMMON_Data_Event,function(data){
            this.setData(data)
        },this)
        // 召唤成功
        this.addGlobalEvent(SummonEvent.PartnerSummonSuccess, function() {
          if(!this.status){
            return;
          }
          this.playRecruitEffect();
        }.bind(this));
        this.summon_btn_10.on("click",function(){
            Utils.playButtonSound(1)
            // message("未开放");
            // return;
            if(this.data.charge_times>0){
              return;
            }
            if(this.checkHeroBagIsFull(10)) return;
            var buy_charge_id = this.data_const.package_id.val;
            if(buy_charge_id){
              let charge_config = Config.charge_data.data_charge_data[buy_charge_id]
              if(charge_config){
                  var sCallback = ()=>{
                    this.ctrl.requestDMMSummon();
                  }
                  SDK.pay(charge_config.val, 1, charge_config.id, charge_config.name, charge_config.product_desc,null,null,charge_config.pay_image, sCallback) 
              }
            }
        },this)
        this.award_btn.on("click",function(){
            Utils.playButtonSound(1)
            this.ctrl.openTimeSummonAwardView(true, this.action_config.group_id,this.data,true)
        },this)
       
    },

    
    checkHeroBagIsFull(times){
        // 判断英雄背包空间
        var HeroController = require("hero_controller");
        var hero_model = HeroController.getInstance().getModel();
        var hero_bag_info = hero_model.getHeroMaxCount();
        var limit_num = hero_bag_info.max_count - hero_bag_info.have_coutn;
        if (times > limit_num) {
            var str = Utils.TI18N("英雄列表已满，可通过提升贵族等级或购买增加英雄携带数量，是否前往购买？")
            var CommonAlert = require("commonalert");
            CommonAlert.show(str, Utils.TI18N("确定"), function() {
                var ActionController = require("action_controller")
                var hero_controller = require("hero_controller").getInstance();
                hero_controller.openHeroBagWindow(true);
                ActionController.getInstance().openActionSummonView(false);
            }, Utils.TI18N("取り消し"), function() {
            })
            return true
        }     
        return false;   
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
      // this.updateImageBg();
        this.status = true;
        this.ctrl.requestDMMSummonData()
    },
    setVisibleStatus(status){
        if(this.root_wnd && status){
            this.ctrl.requestDMMSummonData()
        }
        status = status|| false
        this.setVisible(status);
    },
    setData(data){
        if(!data)return;
        this.data = data;
        this.checkISPaySummon();
        this.action_config = this.data_action[this.data.camp_id]
        if(this.action_config && this.action_config.group_id){
            this.summon_config = this.data_summon[this.action_config.group_id]
        }
       
        this.time_txt.string = TimeTool.getYMD5(this.data.start_time) + "~" + TimeTool.getYMD5(this.data.end_time)
        this.updateImageBg();
        this.updateSummonBtnStatus();

    },

    checkISPaySummon(){
      if(this.data){
        if(this.data.charge_times>0){
          if(this.data.charge_times*10>this.data.reward_times){
            if(this.checkHeroBagIsFull(10)) return;
              this.ctrl.requestDMMSummon();
          }
        }
      }
    },
    
    updateImageBg(){
        if(this.summon_config && this.summon_config.res_id && (!this.cur_res_id || this.cur_res_id != this.summon_config.res_id)){
            let path = PathTool.getBigBg("timesummon/txt_cn_dmmsummon_" + this.summon_config.res_id,"jpg")
            this.loadRes(path,function(res){
                this.image_bg_sp.spriteFrame = res
            }.bind(this))
            this.cur_res_id = this.summon_config.res_id
        }
    },
    updateSummonBtnStatus(){
        
        if(this.data && this.summon_config){
            // -- 十连抽
          let path = PathTool.getUIIconPath("ty","Ty_Icon_Dmmdianshu_1_1","png");
          let charge_config = Config.charge_data.data_charge_data[this.data_const.package_id.val]
          this.summon_10_num_lb.string = charge_config.val;
          this.summon_prop_sp.node.scale = 0.8
          this.loadRes(path,function(res){
              this.summon_prop_sp.spriteFrame = res;
          }.bind(this))
          if(this.data.charge_times>0){
            Utils.setGreyButton(this.summon_btn_10.getComponent(cc.Button),true);
          }
        }
    },
    playRecruitEffect(){
        if(this.summonBg == null){ 
            this.summonBg = new cc.Node().addComponent(cc.Sprite)
            ViewManager.getInstance().addToSceneNode(this.summonBg.node,SCENE_TAG.dialogue)
            this.summonBg.node.scale = FIT_SCALE;
            this.summonBg.node.setPosition(0, 0)
            this.summonBg.node.setContentSize(cc.size(720,1280))
            this.summonBg.node.on("touchend",function(){
                this.summonBg.node.active = !this.summonBg.node.active;
                if(this.light_effect){
                    this.light_effect.paused = true;
                }
                this.animaComplete()
            },this)
        }else{
            this.summonBg.node.active = !this.summonBg.node.active;
        }
        let action_name = "action";
        if (this.summon_config){
            action_name = this.summon_config.action_name;
        }
        // 播放音效
        let music_name = "recruit_" + action_name;
        Utils.playEffectSound(AUDIO_TYPE.Recruit, music_name);
        this.handleLightEffect()
        //MainUiController.getInstance().setMainUIBottomStatus(false);
        MainUiController.getInstance().setMainUITopStatus(false);    
    },
   
    handleLightEffect(){
        if(this.summonBg && this.light_effect == null){
            this.light_effect = new cc.Node().addComponent(sp.Skeleton)
            this.summonBg.node.addChild(this.light_effect.node)
            this.light_effect.node.setPosition(0,0)
            this.light_effect.node.scale = 2.8;
            var model = PartnersummonController.getInstance().getModel();
            var recruit_data = model.getRecruitData();
            if (!recruit_data) return;
            var b = false;
            for(let index in recruit_data.partner_bids){
              let info = recruit_data.partner_bids[index]
              if(info){
                if(info.init_star == 5 ){
                  b = true;
                  break;
                }
              }
            }
            var effect_path = "";
            if(b){
              effect_path = "spine/E80002/action.atlas";
            }else{
              effect_path = "spine/E80001/action.atlas";
            }
            this.light_effect.setCompleteListener(this.animaComplete.bind(this))
            this.light_effect.node.active = true;
            this.loadRes(effect_path,function(recruit_sk){
                this.light_effect.skeletonData = recruit_sk;
                this.light_effect.setAnimation(0, "action");
            }.bind(this))
        }else if(this.light_effect){
            this.light_effect.setToSetupPose()
            this.light_effect.paused = false
            this.light_effect.setAnimation(0, "action");
        }
    },
   
    animaComplete(){
        cc.log("animaComplete")
        this.summonBg.node.active = false;
        MainUiController.getInstance().setMainUITopStatus(true); 
        this.light_effect.clearTracks();   
        this.light_effect.node.active = false;
        this.light_effect = null; 
          
        var PartnersummonController = require("partnersummon_controller")     
        PartnersummonController.getInstance().openSummonGainWindow(true,null,1);
    },
    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){
          this.status = false;
    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.summonBg){
            this.summonBg.node.destroy()
            this.summonBg = null;
        }
    },
})