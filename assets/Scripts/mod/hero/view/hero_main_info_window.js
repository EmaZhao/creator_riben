// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-18 09:25:07
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroConst = require("hero_const");
var BaseRole = require("baserole");
var HeroEvent = require("hero_event");
var HeroCalculate = require("hero_calculate");
var MainUIController = require("mainui_controller");
var GuideEvent = require("guide_event");
var RoleEvent = require("role_event");
var RoleController = require("role_controller");

var HeroMainInfoWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_main_info_window");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.rleasePrefab = false;

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        var ActionController = require("action_controller")
        if(ActionController.getInstance().action_operate){
            ActionController.getInstance().action_operate.setVisible(false)
        }
        var StrongerController = require("stronger_controller")
        if(StrongerController.getInstance().main_win){
            StrongerController.getInstance().main_win.setVisible(false)
        }
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.role_vo = null;
        this.hero_list = [];
        this.setting = null;
        this.cur_tap = 1;          // 当前标签页
        this.draw_city_hero = RoleController.getInstance().getDrawData();
        this.cur_hero_Type = 1;//1是显示立绘，2是显示建模
        this.cur_spine_status = false;//默认角色spine不显示 
        this.plot_config = Config.adult_data.data_plot_unlock;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background_sp      = this.seekChild("background", cc.Sprite);
        this.main_container_nd  = this.seekChild("main_container");
        this.tab_container      = this.seekChild("tab_container");
        this.equip_container_nd = this.seekChild("equip_container");
        
        this.comment_btn_nd     = this.seekChild("comment_btn");
        this.lock_btn_nd        = this.seekChild("lock_btn");
        this.share_btn_nd       = this.seekChild("share_btn");
        this.close_btn_nd       = this.seekChild("close_btn");
        this.left_btn_nd        = this.seekChild("left_btn");
        this.right_btn_nd       = this.seekChild("right_btn");
        this.power_num_nd       = this.seekChild("power_num");
        this.power_num_cs       = this.power_num_nd.getComponent("CusRichText");
        //新增（主城立绘相关）
        this.set_bnt_nd         = this.seekChild("set_btn");
        this.hero_draw_icon_nd  = this.seekChild("hero_draw_icon");
        this.hero_draw_icon_nd.pos = this.hero_draw_icon_nd.getPosition(); 
        //新增spine动画
        this.hero_spine_icon_nd = this.seekChild("hero_spine_icon");
        this.hero_spine_icon_nd.active = false;
        
        // 立绘
        this.draw_btn_nd        = this.seekChild("draw_btn");

        // 剧情按钮
        this.plot_btn_nd        = this.seekChild("plot_btn");
        // this.play_plotBtn_ani();

        //皮肤
        this.skin_btn_nd        = this.seekChild("skin_btn");
        this.skin_btn_nd.active = false;
        this.hero_info_20_nd    = this.seekChild("hero_info_20");
        // hero
        this.star_node_nd       = this.seekChild("star_node");
        this.camp_icon_sp       = this.seekChild("camp_icon", cc.Sprite);
        this.name_lb            = this.seekChild("name", cc.Label);
        this.mode_node_nd       = this.seekChild("mode_node");
        this.lay_hero_nd        = this.seekChild("lay_hero");
        // this.lay_hero_nd.active = false;
        this.star_item_nd       = this.seekChild("star_item");
        this.hero_camp_bg_sp    = this.seekChild("hero_camp_bg", cc.Sprite);
        
        this.up_lev_act_nd      = this.seekChild("up_lev_act");
        this.up_lev_efc_sk      = this.seekChild("up_lev_efc", sp.Skeleton);
        
        // 锁定分享评论
        this.share_btn_nd       = this.seekChild("share_btn");
        this.lock_btn_nd        = this.seekChild("lock_btn");
        this.comment_btn_nd     = this.seekChild("comment_btn");
        this.lock_icon_sp       = this.seekChild("lock_icon", cc.Sprite);
        
        this.background         = this.seekChild("background");
        this.background.scale   = this.background.scale * FIT_SCALE;

        //英雄重生按钮
        this.rebirth_btn_nd     = this.seekChild("rebirth_btn");
        this.rebirth_btn_nd.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("返還アイテム");

        // 分享
        this.share_panel_nd     = this.seekChild("share_panel");
        this.share_btns = {};
        for (var share_i = 1; share_i <= 3; share_i++) {
            var share_btn = this.share_btns[share_i] = this.seekChild(this.share_panel_nd, "share_btn_" + share_i);
            share_btn.share_tag = share_i;
            
            share_btn.on(cc.Node.EventType.TOUCH_END, this.onClickChannelBtn, this);
        }

        // 升级动画
        this.attr_keys           = ["atk", "hp", "def", "speed"];
        this.attr_lbs           = {}
        for (var attr_i = 0; attr_i < 4; attr_i++) {
            this.attr_lbs[this.attr_keys[attr_i]] = this.seekChild(this.up_lev_act_nd, "attr_" + attr_i, cc.Label);
        }

        this.btn_taps = {};
        for (var tab_index = 1; tab_index <= 3; tab_index++) {
            // this.btn_taps[tab_index] = this.seekChild("tab_btn_" + tab_index);
            this.btn_taps[tab_index] = {};
            var cut_tab_nd = this.seekChild("tab_btn_" + tab_index);
            this.btn_taps[tab_index]["tab_nd"]     = cut_tab_nd;
            this.btn_taps[tab_index]["select_img"] = this.seekChild(cut_tab_nd, "select_img");
            this.btn_taps[tab_index]["normal_img"] = this.seekChild(cut_tab_nd, "normal_img");
            this.btn_taps[tab_index]["red_img"]    = this.seekChild(cut_tab_nd, "red_point");
            this.btn_taps[tab_index]["red_img"].active = false;

            cut_tab_nd.tab_tag = tab_index;
            cut_tab_nd.on(cc.Node.EventType.TOUCH_END, this.onClickTabBtn, this);
        }

        this.hero_model = new BaseRole();
        this.hero_model.setParent(this.mode_node_nd);
        // 装备面板
        var HeroMainEquipPanel = require("hero_main_equip_panel");
        this.equip_panel = new HeroMainEquipPanel(this.ctrl);
        this.equip_panel.setParent(this.equip_container_nd);
        this.equip_panel.show();

        // 培养
        var HeroMainTrainPanel = require("hero_mian_train_panel");
        this.train_panel = new HeroMainTrainPanel(this.ctrl);
        this.train_panel.setParent(this.tab_container);

        // 升星
        var HeroMainUpStarPanel = require("hero_main_upgrade_star_panel");
        this.up_star_panel = new HeroMainUpStarPanel(this.ctrl);
        this.up_star_panel.setParent(this.tab_container);

        // 天赋
        var HeroMainTalentPanel = require("hero_main_talent_panel");
        this.talent_panel = new HeroMainTalentPanel(this.ctrl);
        this.talent_panel.setParent(this.tab_container);
        this.up_lev_act_nd.active = false;

        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.left_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickLeftBtn, this);
        this.right_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickRightBtn, this);
        this.set_bnt_nd.on(cc.Node.EventType.TOUCH_END,this.onClickChangeDrawCity, this);

        this.share_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickShareBtn, this);
        this.lock_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickLockBtn, this);
        this.comment_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCommentBtn, this);
        this.share_panel_nd.on(cc.Node.EventType.TOUCH_END, this.onClickSharePanel, this);
        this.draw_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickDrawBtn, this);
        this.plot_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickPlotBtn, this);
        this.skin_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickSkinBtn, this);
        

        Utils.getNodeCompByPath("main_container/main_panel/tab_btn/tab_btn_1/label", this.root_wnd, cc.Label).string = Utils.TI18N("培养");
        Utils.getNodeCompByPath("main_container/main_panel/tab_btn/tab_btn_2/label", this.root_wnd, cc.Label).string = Utils.TI18N("升星");
        Utils.getNodeCompByPath("main_container/main_panel/tab_btn/tab_btn_3/label", this.root_wnd, cc.Label).string = Utils.TI18N("天赋领悟");
        //Utils.getNodeCompByPath("main_container/main_panel/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
        Utils.getNodeCompByPath("share_panel/channel_con/share_btn_1/New Node", this.root_wnd, cc.Label).string = Utils.TI18N("邻服频道");
        Utils.getNodeCompByPath("share_panel/channel_con/share_btn_2/New Node", this.root_wnd, cc.Label).string = Utils.TI18N("世界频道");
        Utils.getNodeCompByPath("share_panel/channel_con/share_btn_3/New Node", this.root_wnd, cc.Label).string = Utils.TI18N("公会频道");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        //是否有解锁且未领取奖励的成人剧情
        this.addGlobalEvent(HeroEvent.Hero_Get_Reward_Status, (data)=> {
          this.checkPlotStatus(data.plot_list);
        }, this);
        // 英雄信息返回
        this.addGlobalEvent(HeroEvent.Hero_Data_Update, function(hero_vo) {
            if (!hero_vo) return;
            if (hero_vo.partner_id == this.hero_vo.partner_id) {
                this.hero_vo = hero_vo;
                this.updateHeroInfo(hero_vo);
                // 更新红点信息
            }
        }.bind(this))

        // 装备穿戴
        this.addGlobalEvent(HeroEvent.Equip_Update_Event, function(data) {
            if (!this.hero_vo) return;
            if(data.partner_id == this.hero_vo.partner_id){
                this.hero_vo = data;
                this.updateHeroInfo(data);
            }   
        }.bind(this))

        //符文装备
        this.addGlobalEvent(HeroEvent.Artifact_Update_Event, function (data) {
            if (!this.hero_vo) return;
            if(data.partner_id == this.hero_vo.partner_id){
                this.hero_vo = data;
                this.updateHeroInfo(data);
            }
        }.bind(this));

        // 升级成功返回
        this.addGlobalEvent(HeroEvent.Hero_Level_Up_Success_Event, function() {
            if (!this.hero_vo) return;
            this.showLevelUpAction();
        }.bind(this));

        // 锁定
        this.addGlobalEvent(HeroEvent.Hero_Lock_Event, function() {
            if (!this.hero_vo  || this.show_model_type ==  HeroConst.BagTab.eBagPokedex) return;
            this.setLock();
        }.bind(this));
        
        this.addGlobalEvent(HeroEvent.Hero_Get_Talent_Event,function(list){
            if(!list)  return;
            if(!this.hero_vo) return 
            for(let i=0;i<list.length;++i){
				let v = list[i]
                if(v.partner_id == this.hero_vo.partner_id){
                    this.hero_vo = Utils.deepCopy1(this.model.getHeroById(v.partner_id)) 
                    this.updatePageRedPoint()  
                    break
				}
			}
        }.bind(this))

        Utils.onTouchEnd(this.hero_draw_icon_nd, ()=> {
            this.ctrl.onClickHeroToPlayVoice(this.library_config.voice_res);
        }, 1);
        Utils.onTouchEnd(this.hero_spine_icon_nd, ()=> {
          this.ctrl.onClickHeroToPlayVoice(this.library_config.voice_res);
        }, 1);

        Utils.onTouchEnd(this.rebirth_btn_nd,()=>{
            if(this.hero_vo.lev<=1){
                message(Utils.TI18N("この英雄は回帰できません"));
                return;
            }
            this.ctrl.openHeroRebirthWidow(true,this.hero_vo);
        },1)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.hero_vo = Utils.deepCopy1(params.hero_vo);
        this.hero_list = params.hero_list || [];
        this.setting = params.setting;
        this.callback = this.setting.callback;
        this.show_model_type = this.setting.show_model_type || HeroConst.BagTab.eBagHero;
        MainUIController.getInstance().changeHeroStatus(true);
        this.playHeroAnim = true;
        this.ctrl.sender11125(this.plot_config[this.hero_vo.bid].plot_id_list)

        if(window.TASK_TIPS)
        gcore.GlobalEvent.fire(GuideEvent.TaskNextStep,"hero_30402");//任务引导用到

        if(this.show_model_type == HeroConst.BagTab.eBagPokedex){
            this.skin_btn_nd.active = false;
            this.draw_btn_nd.active = false;
            this.plot_btn_nd.active = false;
            this.set_bnt_nd.active = false;
            this.hero_spine_icon_nd.active = false;
            this.cur_hero_Type = 2
        }
        // this.refreshDrawIcon();
        this.updateWidget();
            
    },
    //成人剧情状态
    checkPlotStatus:function(plot_list){
      var b = false;
      let role_vo = require("role_controller").getInstance().getRoleVo();
      for(let info of plot_list){
        if(info.val !=0){
          continue;
        }
        var list = info.plot_id.split("_");
        if(list[1] == 1){
          b = true;
        }else if(list[1] == 2 && this.hero_vo.lev >= 100){
          b = true;
        }
      }
      if(b){
        this.play_plotBtn_ani();
      }else{
        this.plot_btn_nd.stopAllActions();
        this.plot_btn_nd.scale = 1;
      }
    },

    //刷新立绘
    refreshDrawIcon:function(){
      if(!this.hero_vo || this.cur_hero_Type == 2){
        return;
      }
      this.cur_spine_status = false;
      this.hero_draw_icon_nd.active = true;
      this.hero_spine_icon_nd.active = false;
      var draw_res_id = this.hero_vo.draw_res|| "jinglingwangzi"; 
      this.library_config = gdata("partner_data", "data_partner_library", [this.hero_vo.bid]);
      var spine_res_list = this.library_config.spine_res_list;
      var config = gdata("partner_data", "data_partner_base", [this.hero_vo.bid]);
      var must_scale = 1
      var x = 0;
      var y = 0;
      if(this.hero_vo.star >=8 && config.awaken_draw_res){
        draw_res_id = config.awaken_draw_res;
      }
      var bg_res = PathTool.getIconPath("herodraw/herodrawres", draw_res_id);
      if (this.library_config) {
        if (this.library_config.hero_scale&&this.library_config.hero_scale !=0) {
            must_scale = this.library_config.hero_scale / 100;
        }
        if(this.library_config.hero_draw_offset.length>0){
          x = this.library_config.hero_draw_offset[0][0];
          y = this.library_config.hero_draw_offset[0][1];
        }
        if(this.hero_vo.star >=8){
          if (this.library_config.awaken_scale&&this.library_config.awaken_scale !=0) {
            must_scale = this.library_config.awaken_scale / 100;
          }
          if(this.library_config.awaken_draw_offset.length>0){
            x = this.library_config.awaken_draw_offset[0][0];
            y = this.library_config.awaken_draw_offset[0][1];
          }
        }
      }
      
      this.hero_draw_icon_nd.setPosition(this.hero_draw_icon_nd.pos.x+x,this.hero_draw_icon_nd.pos.y+y);
      this.hero_draw_icon_nd.scale = must_scale;
      this.hero_spine_icon_nd.setPosition(this.hero_draw_icon_nd.pos.x+x,this.hero_draw_icon_nd.pos.y+y);
      this.hero_spine_icon_nd.scale = must_scale;

        
      if( spine_res_list && spine_res_list.length>0){
        var spine_name =  spine_res_list[0][0];
        if(this.hero_vo.star &&this.hero_vo.star >=8){
          if(spine_res_list[0][1]){
            spine_name = spine_res_list[0][1];
          }
        }
        if(spine_name){
          this.cur_spine_status = true;
          this.hero_spine_icon_nd.active = true;
          this.hero_draw_icon_nd.active = false;
          var skeleton_res = "spine/"+spine_name+"/action.atlas"
          LoaderManager.getInstance().loadRes(skeleton_res, function (skeleton_data) {
            this.hero_spine_icon_nd.getComponent(sp.Skeleton).skeletonData = skeleton_data;
            this.hero_spine_icon_nd.getComponent(sp.Skeleton).setAnimation(0, "action",true);
          }.bind(this));
        }
      }else{
        if (this.hero_draw_icon_nd) {
          LoaderManager.getInstance().loadRes(bg_res, function (sp) {
                this.hero_draw_icon_nd.getComponent(cc.Sprite).spriteFrame = sp;
            }.bind(this))
        }
      }
      this.ctrl.stopPlayHeroVoice();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this.equip_panel)
            this.equip_panel.deleteMe();
        if (this.train_panel)
            this.train_panel.deleteMe();
        if (this.up_star_panel)
            this.up_star_panel.deleteMe();
        if (this.talent_panel)
            this.talent_panel.deleteMe();
        if(this.hero_model)
            this.hero_model.deleteMe()
        this.ctrl.openHeroMainInfoWindow(false);
        if(this.callback){
            this.callback();
            this.callback = null;
        }
        var ActionController = require("action_controller")
        if(ActionController.getInstance().action_operate){
            ActionController.getInstance().action_operate.setVisible(true)
        }
        var StrongerController = require("stronger_controller")
        if(StrongerController.getInstance().main_win){
            StrongerController.getInstance().main_win.setVisible(true)
        }
        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);
        MainUIController.getInstance().changeHeroStatus(false);        
        this.ctrl.stopPlayHeroVoice();
    },
    checkOpenByconfig(config){
        if(!config)  return;
        if(!this.hero_vo) return;
        if(config.pos_limit[0] == 'star'){
            let is_open = (this.hero_vo.star >= config.pos_limit[1])
            if(is_open){
                return {is_open:is_open}
            }else{
                return {is_open:is_open, tip:(`★${config.pos_limit[1]}で開放`)}
            }
        }
    },
    onClickTabBtn: function(event) {
        Utils.playButtonSound(ButtonSound.Tab);
        if (event.target.tab_tag === this.cur_tap)
            return;
        if (event.target.tab_tag > 0) {
            this.cur_tap = event.target.tab_tag;
            this.updateTab();
        }
    },

    updateWidget: function(hero_vo) {
        if(!this.hero_vo) return

        let skin_config = null;
        if(this.hero_vo.use_skin && this.hero_vo.use_skin != 0){
            skin_config = Config.partner_skin_data.data_skin_info[this.hero_vo.use_skin];
        }
        // 背景
        var camp_type = this.hero_vo.camp_type || HeroConst.CampType.eWater;
        var bg_res = null;
        if(skin_config && skin_config.hero_info_bg_res && skin_config.hero_info_bg_res != ""){
            bg_res = PathTool.getUIIconPath("bigbg/hero",skin_config.hero_info_bg_res);
        }else{
            bg_res = PathTool.getUIIconPath("bigbg/hero", HeroConst.CampBgRes[camp_type]);
        }
        if (!this.bg_res || this.bg_res !== bg_res) {
            this.loadRes(bg_res, function(bg_sf) {
                this.background_sp.spriteFrame = bg_sf;
                gcore.Timer.set(function () {
                    this.main_container_nd.active = true;
                  
                }.bind(this), 100, 1)
            }.bind(this));
            this.bg_res = bg_res;
        }

        // 阵容背景
        var camp_bg_path = null;
        if(skin_config && skin_config.hero_camp_res && skin_config.hero_camp_res != ""){
            if( skin_config.hero_camp_res == "null"){
                this.hero_camp_bg_sp.node.active = false;
            }else{
                camp_bg_path = PathTool.getUIIconPath("bigbg/hero", skin_config.hero_camp_res);
                this.hero_camp_bg_sp.node.active = true;
            }
        }else{
            this.hero_camp_bg_sp.node.active = true;
            camp_bg_path = PathTool.getUIIconPath("bigbg/hero", HeroConst.CampBottomBgRes[camp_type]);
        }
        this.loadRes(camp_bg_path, function(camp_bg_sf) {
            this.hero_camp_bg_sp.spriteFrame = camp_bg_sf;
        }.bind(this));

        // 英雄动画
        this.name_lb.string = this.hero_vo.name;

        var camp_res = PathTool.getHeroCampRes(this.hero_vo.camp_type);
        var common_res_path = PathTool.getUIIconPath("common",camp_res);
        this.loadRes(common_res_path, function(sf_obj){
            this.camp_icon_sp.spriteFrame = sf_obj;
        }.bind(this))

        // 战力
        this.power_num_cs.setNum(this.hero_vo.power);

        // 星星
        
        this.updateStars(this.hero_vo.star);
        this.updateSpine();
        this.updateRoleDraw();


        // if (!hero_vo || hero_vo.partner_id != this.hero_vo.partner_id)
        if(this.playHeroAnim){
            this.updateSpine();
            this.updateRoleDraw();
            this.playHeroAnim = false;
        }


        // 左右箭头
        var cur_index = 0;
        for (var hero_i in this.hero_list) {
            if (this.hero_list[hero_i].partner_id === this.hero_vo.partner_id) {
                cur_index = parseInt(hero_i);
                break;
            } 
        }

        if (cur_index == 0) {
            this.left_btn_nd.active = false;
            if (this.hero_list.length <= 1) {
                this.right_btn_nd.active = false;                
            }
        } else if (cur_index == this.hero_list.length - 1) {
            this.right_btn_nd.active = false;
        } else {
            this.left_btn_nd.active = true;
            this.right_btn_nd.active = true;
        }

        // 是否可以升星
        // this.is_show_up_star = true;
        if (this.show_model_type ==  HeroConst.BagTab.eBagHero) {
            var is_max_star = this.model.isMaxStarHero(this.hero_vo.bid, this.hero_vo.star);
            if (is_max_star) {
                this.is_show_up_star = false;
            } else {
                this.is_show_up_star = true;
            }

            this.setLock();
            this.updateEquipPanel();

            // 是否有天赋
            if (this.hero_vo.star >= 6) {
                this.is_show_talent = true;
            } else {
                this.is_show_talent = false;            
            }            
        } else {
            this.share_btn_nd.active = false;
            this.lock_btn_nd.active = false;
        }


        // 没有升星的英雄处理
        if (!this.is_show_up_star) {
            if (this.cur_tap == 2)
                this.cur_tap = 1;
            this.btn_taps["2"]["tab_nd"].active = false;            
        } else {
            this.btn_taps["2"]["tab_nd"].active = true;
        }
        // 天赋领悟
        if (!   this.is_show_talent) {
            if (this.cur_tap == 3)
                this.cur_tap = 1;
            this.btn_taps["3"]["tab_nd"].active = false;            
        } else {
            this.btn_taps["3"]["tab_nd"].active = true;            
        }

        // 立绘
        if (this.hero_vo.draw_res && this.cur_hero_Type == 1) {
            if(this.cur_spine_status){
              this.hero_spine_icon_nd.active = true;
            }else{
              this.hero_draw_icon_nd.active = true;
            }
            this.lay_hero_nd.active = false;
        } else {
            this.cur_hero_Type = 2;
            if(this.cur_spine_status){
              this.hero_spine_icon_nd.active = false;
            }else{
              this.hero_draw_icon_nd.active = false;
            }
            this.lay_hero_nd.active = true;
        }
        // this.refreshDrawIcon();
        this.updateTab();

        if(this.show_model_type == HeroConst.BagTab.eBagHero){
            if(this.model.isOpenTanlentByHerovo(this.hero_vo) && !this.hero_vo.ishaveTalentData()){
                this.ctrl.sender11099([{partner_id : this.hero_vo.partner_id}])
            }
            // if model:isOpenHolyEquipMentByHerovo(self.select_hero_vo) and not self.select_hero_vo:ishaveHolyEquipmentData() then
            //     controller:sender11092({{partner_id = self.select_hero_vo.partner_id}})
            // end
            
            // if not self.select_hero_vo:isInitAttr() then
            //     controller:sender11026({{partner_id = self.select_hero_vo.partner_id}})
            // end

            let bid_config = Config.partner_skin_data.data_partner_bid_info[this.hero_vo.bid];
            if(bid_config){
                // this.skin_btn_nd.active = true;
                let role_lv_cfg = Config.partner_skin_data.data_const["skin_open"];
                if(role_lv_cfg){
                    if(role_lv_cfg.val[0] == "lev"){
                        let role_vo = require("role_controller").getInstance().getRoleVo();
                        if(role_vo && role_vo.lev < role_lv_cfg.val[1]){
                            this.skin_btn_nd.active = false;
                        }
                    }
                }
            }else{
                this.skin_btn_nd.active = false;
            }
        }
    },

    // 更新装备面板
    updateEquipPanel: function() {
        this.equip_panel.updateHerovo(this.hero_vo);
    },

    setLock: function() {
        var lock_icon = "hero_info_6";
        if (this.hero_vo.dic_locks[HeroConst.LockType.eHeroLock]) {
            lock_icon = "hero_info_5";
        }
        var icon_path = PathTool.getUIIconPath("hero", lock_icon);
        this.loadRes(icon_path, function(lock_sf) {
            this.lock_icon_sp.spriteFrame = lock_sf;
        }.bind(this));
    },

    updateStars: function(star_num) {
        var star_res = "";
        var star_scal = 1;
        this.star_node_nd.destroyAllChildren();
        this.star_node_nd.width = 0;
        let star
        if (star_num > 0 && star_num <= 5) {
            star_res = "common_90074";
        } else if (star_num > 5 && star_num <= 9) {
            star_num = star_num - 5;
            star_res = "common_90075";
        } else if (star_num > 9) {
            star = star_num - 10
            star_num = 1;
            star_res = "common_90073";
            star_scal = 1.2;
        }

        for (var star_i = 0; star_i < star_num; star_i++) {
            var star_nd = cc.instantiate(this.star_item_nd);
            star_nd.scale = star_scal;
            var star_sp = star_nd.getComponent(cc.Sprite);
            var common_res_path = PathTool.getUIIconPath("common", star_res);
            this.loadRes(common_res_path, function(star_sp, sf_obj){
                star_sp.spriteFrame = sf_obj;
            }.bind(this, star_sp)) 
            this.star_node_nd.addChild(star_nd);
            if(star){
                let node = new cc.Node() 
                node.y = -1
                let lab = node.addComponent(cc.Label)
                lab.string = star 
                lab.fontSize = 15;
                lab.lineHeight = 16;
                lab.horizontalAlign = cc.macro.TextAlignment.CENTER;
                lab.verticalAlign = cc.macro.TextAlignment.CENTER;
                node.addComponent(cc.LabelOutline).color = new cc.color(0,0,0);
                star_nd.addChild(node)
            }
        }
    },

    updateSpine: function() {
        this.hero_model.setData(BaseRole.type.partner, this.hero_vo, PlayerAction.show, true, 1, {skin_id:this.hero_vo.use_skin});
        if(this.hero_vo.use_skin != 0){
            let skin_config = Config.partner_skin_data.data_skin_info[this.hero_vo.use_skin];
            if(skin_config && skin_config.hero_camp_res == "null"){
                this.hero_info_20_nd.active = false;
            }else{
                this.hero_info_20_nd.active = true;
            }
        }else{
            this.hero_info_20_nd.active = true;
        }
    },

    updateRoleDraw:function(){
      if(this.show_model_type == HeroConst.BagTab.eBagPokedex){
        return;
      }
      var bg_res;
      
      if(this.draw_city_hero && this.draw_city_hero.bid == this.hero_vo.bid &&this.draw_city_hero.partner_id == this.hero_vo.partner_id){
        if(this.draw_city_hero.star!=this.hero_vo.star){
            RoleController.getInstance().setDrawData(this.hero_vo);
            this.draw_city_hero.star = this.hero_vo.star;
        }
        bg_res = PathTool.getUIIconPath("hero","Juese_Icon_Duizhang_1_1");
      }else{
        bg_res = PathTool.getUIIconPath("hero","Juese_Icon_Duizhang_1_2");
      }
      LoaderManager.getInstance().loadRes(bg_res, function (sp) {
        this.set_bnt_nd.getComponent(cc.Sprite).spriteFrame = sp;
      }.bind(this));

      //将选择类型改为立绘
      this.cur_hero_Type = 1;
      this.refreshDrawIcon();
    },


    onClickCloseBtn: function() {
        Utils.playButtonSound(ButtonSound.Close);
        this.ctrl.openHeroMainInfoWindow(false);
    },

    updateTab: function() {
        if (this.show_model_type ==  HeroConst.BagTab.eBagPokedex) {    // 图鉴
            for (var tab_i in this.btn_taps) {
                this.btn_taps[tab_i]["tab_nd"].active = false;
            }
            this.train_panel.show(this.hero_vo);            
            this.up_star_panel.hide();
            this.equip_panel.hide();
            this.talent_panel.hide();
        } else {                                                        // 英雄背包
            var no_select_tabs = [];
            if (this.cur_tap === 1) {
                no_select_tabs = [2, 3];
                this.train_panel.show(this.hero_vo);
                if (this.up_star_panel.root_wnd)
                    this.up_star_panel.hide();
                if (this.talent_panel.root_wnd)
                    this.talent_panel.hide();                
            } else if (this.cur_tap === 2) {
                no_select_tabs = [1, 3];
                this.train_panel.hide();
                if (this.talent_panel.root_wnd)
                    this.talent_panel.hide();
                this.up_star_panel.show(this.hero_vo);
            } else if (this.cur_tap === 3) {
                no_select_tabs = [1, 2];
                this.train_panel.hide();                         
                if (this.up_star_panel.root_wnd)
                    this.up_star_panel.hide();                
                this.talent_panel.show(this.hero_vo);
            }

            // // 没有升星的英雄处理
            // if (!this.is_show_up_star) {
            //     this.cur_tap = 1;
            //     no_select_tabs = [2, 3];
            //     this.btn_taps["2"]["tab_nd"].active = false;
            //     this.train_panel.setVisible(true);
            //     this.up_star_panel.setVisible(false);
            // } else {
            //     this.btn_taps["2"]["tab_nd"].active = true;
            // }

            // if (!this.is_show_talent) {

            // }

            this.btn_taps[this.cur_tap]["select_img"].active = true;
            this.btn_taps[this.cur_tap]["normal_img"].active = false;

            for (var index_i in no_select_tabs) {            
                var no_select_tab = no_select_tabs[index_i];
                this.btn_taps[no_select_tab]["select_img"].active = false;
                this.btn_taps[no_select_tab]["normal_img"].active = true;
            }

            this.updatePageRedPoint();
        }
    },

    onClickRightBtn: function() {
        Utils.playButtonSound(ButtonSound.Normal);
        this.getNextVoByDis(1);
    },

    onClickLeftBtn: function() {
        Utils.playButtonSound(ButtonSound.Normal);        
        this.getNextVoByDis(-1)
    },

    onClickChangeDrawCity:function(){
      // if(this.draw_city_hero.bid == this.hero_vo.bid && this.draw_city_hero.star == this.hero_vo.star){
      //   return;
      // }
      // if(this.draw_city_hero == null){
        Utils.playButtonSound(ButtonSound.Normal);
        this.draw_city_hero.bid = this.hero_vo.bid;
        this.draw_city_hero.draw_res = this.hero_vo.draw_res;
        this.draw_city_hero.star = this.hero_vo.star;
        this.draw_city_hero.partner_id = this.hero_vo.partner_id;
        var config = gdata("partner_data", "data_partner_base", [this.hero_vo.bid]);
        if(this.hero_vo.star >=8 && config.awaken_draw_res){
          this.draw_city_hero.draw_res = config.awaken_draw_res;
        }
        var bg_res = PathTool.getUIIconPath("hero","Juese_Icon_Duizhang_1_1");
        LoaderManager.getInstance().loadRes(bg_res, function (sp) {
          this.set_bnt_nd.getComponent(cc.Sprite).spriteFrame = sp;
        }.bind(this));
        gcore.GlobalEvent.fire(RoleEvent.RefreshVertical,this.draw_city_hero);
      // }
    },

    updateHeroInfo: function(hero_vo) {
        if (!hero_vo) {
            if (!this.hero_vo) return;
        } else {
            if(this.hero_vo && hero_vo){
                if(this.hero_vo.partner_id == hero_vo.partner_id && this.hero_vo.star != hero_vo.star){
                    //英雄升星
                    if(hero_vo.star == 6 || hero_vo.star == 10){
                        this.playHeroAnim = true
                    }
                }else if(this.hero_vo.partner_id != hero_vo.partner_id){
                    //切换英雄
                    this.playHeroAnim = true
                }
            }
            this.hero_vo = Utils.deepCopy1(hero_vo);
        }

        this.updateWidget();
        this.train_panel.updateHerovo(this.hero_vo);
        if (this.show_model_type ==  HeroConst.BagTab.eBagHero) {     
            this.up_star_panel.updateHerovo(this.hero_vo);
            this.equip_panel.updateHeroInfo();
            this.talent_panel.updateHeroInfo(this.hero_vo);
        }
    },

    getNextVoByDis: function(dis) {
        if (!this.hero_vo) return;
        var cur_index = null;
        for (var hero_i in this.hero_list) {
            if (this.hero_list[hero_i].partner_id == this.hero_vo.partner_id) 
                cur_index = hero_i;
        }

        if (cur_index >= 0) {
            var next_index = parseInt(cur_index) + dis;
            if (next_index < 0) {
                this.left_btn_nd.active = false;
                return;
            } else if (next_index > this.hero_list.length - 1) {
                this.right_btn_nd.active = false;
                return;
            } else {
                this.right_btn_nd.active = true;
                this.left_btn_nd.active = true;                
            }

            this.updateHeroInfo(this.hero_list[next_index]);
            var bid = this.hero_list[next_index].bid
            this.ctrl.sender11125(this.plot_config[bid].plot_id_list);
        }
    },

    // 展示升级动画
    showLevelUpAction: function() {
        if (!this.hero_vo) return;
        for (var attr_i = 0; attr_i < 4; attr_i++) {
            var attr_name = Config.attr_data.data_key_to_name[this.attr_keys[attr_i]];
            let k = this.attr_keys[attr_i] +"2"
            // var attr_val = this.hero_vo[this.attr_keys[attr_i]]
            var attr_str = attr_name + " +" +  Math.ceil(this.hero_vo[k]/1000);
            this.attr_lbs[this.attr_keys[attr_i]].string = attr_str;
        }

        this.up_lev_act_nd.active = true;

        this.up_lev_act_nd.y = 200;
        this.up_lev_act_nd.opacity = 10;
        this.up_lev_act_nd.stopAllActions();

        var move_act = cc.moveTo(1, cc.v2(0, 280));
        var fade_act = cc.fadeIn(0.2);
        move_act.easing(cc.easeSineOut());
        // var ease_act = cc.easeSineOut(cc.moveTo(cc.v2(0, 10)));
        // ease_act
        var spa_act  = cc.spawn(move_act, fade_act);
        var node_act = cc.sequence(spa_act, cc.callFunc(function() {
            this.up_lev_act_nd.active = false;            
        }.bind(this)));

        this.up_lev_act_nd.runAction(node_act);
        this.showLevelUpEffect(true); 
    },

    // 播放升级特效
    showLevelUpEffect: function(status) {
        if (status) {
            var effect_id = PathTool.getEffectRes(185);
            var effect_path = PathTool.getSpinePath(effect_id);
            this.loadRes(effect_path, function(effect_sd) {
                this.up_lev_efc_sk.skeletonData = effect_sd;
                this.up_lev_efc_sk.setAnimation(0, "action");
            }.bind(this));
            Utils.playEffectSound(AUDIO_TYPE.COMMON, "c_levelup");
        } else {

        }
    }, 

    onClickShareBtn: function() {
        Utils.playButtonSound(ButtonSound.Normal);
        if (this.share_panel_nd && !this.share_panel_nd.active)
            this.share_panel_nd.active = true;
    },

    onClickLockBtn: function() {
        Utils.playButtonSound(ButtonSound.Normal);

        var is_lock = this.hero_vo.dic_locks[HeroConst.LockType.eHeroLock] || 0;
        if (is_lock === 0) {
            is_lock = 1;
        } else if (is_lock === 1) {
            is_lock = 0;
        }

        this.ctrl.sender11015(this.hero_vo.partner_id, is_lock);
    },

    onClickCommentBtn: function() {
        Utils.playButtonSound(ButtonSound.Normal);
        var PokedexController = require("pokedex_controller")
        PokedexController.getInstance().openCommentWindow(true, this.hero_vo);
    },

    onClickChannelBtn: function(event) {
        Utils.playButtonSound(ButtonSound.Normal);
        var ChatConst = require("chat_const");
        var channel = null;
        
        switch(event.target.share_tag) {
            case 1: {
                channel = ChatConst.Channel.Cross;
            }break;
            case 2: {
                channel = ChatConst.Channel.World;
            }break;
            case 3: {
                channel = ChatConst.Channel.Gang;
            }break;
        }
        
        if (channel)
            this.ctrl.sender11060(channel, this.hero_vo.partner_id);
    },

    onClickSharePanel: function() {
        Utils.playButtonSound(ButtonSound.Normal);
        if (this.share_panel_nd.active)
            this.share_panel_nd.active = false;
    },

    onClickDrawBtn: function() {
        Utils.playButtonSound(ButtonSound.Close);
        if(!this.hero_vo)return

        // var draw_res = this.hero_vo.draw_res;
        // var name = this.hero_vo.name;
        // if(draw_res == null){
        //     var config = Config.partner_data.data_partner_base[this.hero_vo.bid];
        //     if(config){
        //         draw_res = config.draw_res;
        //         name = config.name;
        //     }
        // }
        // if(draw_res && draw_res != ""){
        //     this.ctrl.openHeroLookDrawWindow(true, draw_res, name, this.hero_vo.bid);
        // }
        if(this.cur_hero_Type == 1){
          if(this.cur_spine_status){
            this.hero_spine_icon_nd.active = false;
          }else{
            this.hero_draw_icon_nd.active = false;
          }
          
          this.lay_hero_nd.active = true;
          this.cur_hero_Type = 2;
        }else{
          if(this.cur_spine_status){
            this.hero_spine_icon_nd.active = true;
          }else{
            this.hero_draw_icon_nd.active = true;
          }
          this.lay_hero_nd.active = false;
          this.cur_hero_Type = 1;
        }
    },

    onClickPlotBtn: function() {
        Utils.playButtonSound(ButtonSound.Normal);
        if(!this.hero_vo) return;
        this.model.setAdultStoryState(true);
        this.ctrl.openHeroPlotPanel(true, this.hero_vo.bid);
    },

    onClickSkinBtn:function(){
        Utils.playButtonSound(ButtonSound.Normal);
        if(!this.hero_vo) return
        this.ctrl.openHeroSkinWindow(true,this.hero_vo);
    },

    // 更新页签红点问题
    updatePageRedPoint: function() {
        if (this.show_model_type == HeroConst.BagTab.eBagHero) {
            //背包英雄的才显示红点
            for (var tap_i in this.btn_taps) {
                var tap_info = this.btn_taps[tap_i];
                if (tap_info["tab_nd"].active) {
                    if (tap_i == this.cur_tap) {             // 选中则没有
                        tap_info["red_img"].active = false;
                    } else {
                        var is_redpoint = false;
                        if (tap_i == HeroConst.MainInfoTab.eMainTrain) {
                            is_redpoint = HeroCalculate.getInstance().checkSingleHeroLevelUpRedPoint(this.hero_vo);
                        } else if (tap_i == HeroConst.MainInfoTab.eMainUpgradeStar) {
                            is_redpoint = HeroCalculate.getInstance().checkSingleHeroUpgradeStarRedPoint(this.hero_vo);
                        } else if (tap_i == HeroConst.MainInfoTab.eMainTalent) {
                            is_redpoint = HeroCalculate.getInstance().checkSingleHeroTalentSkillRedPoint(this.hero_vo);
                        } 
                        tap_info["red_img"].active = is_redpoint;
                    }
                }          
            }
        }
    },

    play_plotBtn_ani() {
        if(!this.plot_btn_nd) return;
        if(!this.plot_btn_nd.active) return;
        this.plot_btn_nd.stopAllActions();
        this.plot_btn_nd.scale = 1;
        this.plot_btn_nd.runAction(
            cc.repeat(
                cc.sequence(
                    cc.scaleTo(0.375, 1.2, 1.2), 
                    cc.scaleTo(0.375, 1, 1)
                ), 3)
        );
    }
})