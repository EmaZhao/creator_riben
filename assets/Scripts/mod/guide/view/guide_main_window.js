// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-18 10:16:14
// --------------------------------------------------------------------
var PathTool   = require("pathtool");
var GuideConst = require("guide_const");
var GuideEvent = require("guide_event");


// stopAllActions

var Guide_mainWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("drama", "guide_main_view");
        this.viewTag    = SCENE_TAG.msg;             //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type   = WinType.Full;                  //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function() {
        this.adjust_guide_timer = null;
        this.timer_hander = null;
        this.time_num = 0;
        // var RoleController = require("role_controller")
        // var role_vo = RoleController.getInstance().getRoleVo();
        // var guide_cache_data = cc.sys.localStorage.getItem("guide_data" + role_vo.srv_id + role_vo.rid) || {};             
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function() {
        // cc.log("99999999999999999999");

        if (game.views_js)
            game.views_js.cancelTouch();

        this.root_wg = this.root_wnd.getComponent(cc.Widget);
        if (window.FIT_SCALE > 1) {
            this.root_wg.isAlignTop = true;
            this.root_wg.isAlignBottom = true;            
        }

        this.background_nd = this.seekChild("background");
        this.clip_con_nd   = this.seekChild("clip_con");
        this.clip_mask_nd  = this.seekChild("clip_mask");

        this.skip_btn_nd   = this.seekChild("skip_btn");
        this.skip_btn_wd = this.skip_btn_nd.getComponent(cc.Widget);
        if(USE_SDK == true && (PLATFORM_TYPR == "WX_SDK" || PLATFORM_TYPR == "SH_SDK" || PLATFORM_TYPR == "QQ_SDK")){
            this.skip_btn_wd.top = 150;
        }
        this.effect_con_nd = this.seekChild("effect_con");
        
        this.background_bi = this.seekChild("background", cc.BlockInputEvents);
        this.background_bi.enabled = true;
        this.effect_con_sk = this.seekChild("effect_con", sp.Skeleton);

        // 表现层信息
        this.guide_clip_nd = this.seekChild("guide_clip");
        this.clip_mask_bl  = this.seekChild("guide_clip", cc.BlockInputEvents);
        this.guide_mask_nd = this.seekChild("guide_mask");
        this.guide_mask_nd.width = this.guide_mask_nd.width * window.FIT_SCALE;
        if(window.IS_PC)
            this.guide_mask_nd.width = cc.winSize.width;
            this.guide_mask_nd.height = cc.winSize.height;

        // msg
        this.msg_bg_nd     = this.seekChild("msg_bg");
        this.msg_txt_nd    = this.seekChild("msg_txt");
        this.msg_txt_rt    = this.seekChild("msg_txt", cc.RichText);
        this.mas_con_nd    = this.seekChild("mas_con");

        // this.adjust_guide_timer = this.startUpdate(10, this.adjustGuide.bind(this), 500);
        // this.background_nd.scale = FIT_SCALE;

        this.clip_mask_nd.on(cc.Node.EventType.TOUCH_END, this.onClickMaskBg, this);
        this.skip_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickSkipBtn, this);

        // if (this.act_config)
        //     this.addGuid(this.act_config);
    },

    openCacheView: function() {
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function() {
        // 断线之后的处理
        this.re_link_game_event = gcore.GlobalEvent.bind(EventId.EVT_RE_LINK_GAME, function() {
            if (this.background_bi.enabled)
                this.background_bi.enabled = false;
        }.bind(this))

        gcore.GlobalEvent.bind(gcore.GlobalEvent.EVT_SOCKET_DISCONNECT, (function(){
            this.disconnect();
        }).bind(this));

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params) {
        cc.log("99999999999999999");
        if (this.act_config) {
            cc.log("2222222");
            this.playGuide(this.act_config)
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function() {

    },

    addGuid: function (guide_cfg) {
        cc.log("4444");
        this.act_config = guide_cfg;
        if (this.root_wnd) {
            cc.log("555");
            this.playGuide(guide_cfg);
        }
    },

    playGuide: function(config) {
        if (game.views_js && !this.root_wnd) {
            game.views_js.forBidTouch()
        }
        
        gcore.GlobalEvent.fire(GuideEvent.NewPlayerGuideStart);

        cc.log("当前正在执行的引导配置表");
        cc.log(config);
        this.config = config;
        if (!config)
            return;

        this.background_bi.enabled = true;

        this.act_list = Utils.deepCopy(config.act);
        this.cur_zone_list = {};

        this.need_save = false;
        this.guide_step = 0;
        this.guide_cache_data = {};
        // this.guide_cache_data = RoleEnv:getInstance():get(RoleEnv.keys.guide_step_list, {})
        this.playNextGuide();
        this.showSkipBtn();
    },

    checkDoNextGuide: function() {
        if (this.target) {
            // self.target:setTouchEnabled(false)
        }

        this.saveGuideStep();

        // this.setSwallowTouches(true)
        // self.rect = null;

        // 关闭所有窗体
        this.background_bi.enabled = true;

        if (this.close_all) {
            Utils.closeAllWindow();
        }

        if (!this.need_save) {
            this.readyDoNextGuide()
        } else {
            if (!this.act_config) {
                this.endPlayGuide()
                return;
            }
            this.ctrl.send11121(this.act_config.id, this.guide_step);
        }
    },

    doNextGuideFromServer: function(id, step) {
        if (!this.act_config) return;
        if (this.act_config.id != id || this.guide_step != step) return;
        this.readyDoNextGuide();
    },

    readyDoNextGuide: function() {
        cc.log("准备执行下一步的操作");
        // if (this.notice_container && not tolua.isnull(this.notice_container)) {
        //     this.notice_container.setVisible(false);
        // }
        // if (this.backgroundLayer && not tolua.isnull(this.backgroundLayer)) {
        //     this.backgroundLayer.setVisible(false);
        // }
        // if (this.clipNode && not tolua.isnull(this.clipNode)) {
        //     this.clipNode.setVisible(false);
        // }
        // if (this.guide_effect && not tolua.isnull(this.guide_effect)) {
        //     doStopAllActions(this.guide_effect);
        //     this.guide_effect.setVisible(false);
        // }
        // if (this.guide_tips_bg && not tolua.isnull(this.guide_tips_bg)) {
        //     this.guide_tips_bg.setVisible(false);
        // }
        // if (this.txt_tips && not tolua.isnull(this.txt_tips)) {
        //     this.txt_tips.setVisible(false);
        // }
        // if (this.target && not tolua.isnull(this.target) && this.target.clearGuideListener) {
        //     this.target.clearGuideListener()
        // }
        // if (this.target)
        //     this.target.off();
        this.hideSKipBtn();

        if (this.guide_clip_nd.active)
            this.guide_clip_nd.active = false;        

        if (this.clip_con_nd.active)
            this.clip_con_nd.active = false;

        if (this.effect_con_nd.active)
            this.effect_con_nd.active = false;

        // this.background_bi.enabled = true;
        if (!this.clip_mask_bl.enabled)
            this.clip_mask_bl.enabled = true;

        if (this.mas_con_nd.active)
            this.mas_con_nd.active = false;

        this.target = null;

        if (this.delay == 0) {
            this.playNextGuide();
        } else {
            this.delayPlayNextGuide(this.delay);
        }
    },

    delayPlayNextGuide: function(delay_time) {
        if (this.hasTicket("delayPlayNextGuide")) {
            this.delTicker("delayPlayNextGuide");
        }
        this.addTicket(this.playNextGuide.bind(this), delay_time, "delayPlayNextGuide");
    },

    playNextGuide: function() {
        this.saveGuideStep()
        this.clearTargetInfo()
        if (!this.act_list || this.act_list.length == 0) {
            this.endPlayGuide()
        } else {
            this.target_data = this.act_list.shift();
            this.guide_step = this.guide_step + 1;

            cc.log("当前步骤的数据");
            cc.log(this.target_data);

            // 判断当前步骤是否已经做过了,
            if (this.guide_cache_data[this.act_config.id] && this.guide_cache_data[this.act_config.id][this.guide_step] && !this.cur_zone_list[this.guide_step]) {
                this.playNextGuide();
            } else {
                if (this.target_data) {
                    var first_act = this.target_data[0];
                    switch(first_act) {
                        case "checkstatus": {
                            this.findRootWndByParams4();
                        }
                        break;                        
                        case "openview": {
                            this.findRootWndByParams3();
                        }
                        break;
                        case "conditonstatus": {
                            this.findRootWndByCondition();
                        }
                        break;
                        case "emptystep": {
                            this.playNextGuide();
                        }
                        break;
                        default: {
                            if (this.target_data.length == 2) {
                                this.findRootWndByParams2()
                            } else {
                                this.findTargetByParams()                                
                            }
                        }
                    } 

                    // 超过5秒就出现跳过引导
                    // this.addSkipTimeTicket()
                    this.showSkipBtn();
                }
            }
        }
    },

    addSkipTimeTicket: function() {

    },

    findRootWndByCondition: function() {
        if (!this.target_data || !this.target_data[3]) return;

        var root_name = this.target_data[1]
        this.delay = this.target_data[2]
        var root_wnd = null;
        if (root_name == "partner") {
            var HeroController = require("hero_controller");
            root_wnd = HeroController.getInstance().getHeroBagRoot(this.getFinishCB.bind(this))
        }else if(root_name == "partnermainwindow"){
            var HeroController = require("hero_controller");
            root_wnd = HeroController.getInstance().getHeroMainWindowRoot(this.getFinishCB.bind(this));
        } else if (root_name == "battletopscene") {
            var BattleController = require("battle_controller");
            root_wnd = BattleDramaController.getInstance().getDramaFightUI(this.getFinishCB.bind(this));
        } else if (root_name == "battlesceneview") {
            var BattleController = require("battle_controller");
            root_wnd = BattleController.getInstance().getCtrlBattleScene(this.getFinishCB.bind(this)) 
        } else if (root_name == "mainui") {
            var MainuiController = require("mainui_controller");
            var MainuiConst = require("mainui_const");
            var new_btn_index = MainuiController.getInstance().getMainUIIndex();
            if (new_btn_index != MainuiConst.new_btn_index.main_scene) {
                root_wnd = MainuiController.getInstance().getMainUiRoot(this.getFinishCB.bind(this));
                // root_wnd = MainuiController.getInstance().getMainUiRoot();                
            } else {
                this.getFinishCB();
            }
        } else if (root_name == "adventurescene") {
            root_wnd = AdventureController.getInstance().getAdventureRoot()
        } else if (root_name == "partnerform") {
            root_wnd = HeroController.getInstance().getHeroFormRoot()
        } else if (root_name == "partnereinfoview") {
            var HeroController = require("hero_controller");
            root_wnd = HeroController.getInstance().getHeroMianInfoRoot(this.getFinishCB.bind(this));
        } else if (root_name == "partnergofight") {
            var HeroController = require("hero_controller");
            root_wnd = HeroController.getInstance().getHeroGoFightRoot(this.getFinishCB.bind(this))
        } else if (root_name == "hallowsactivitywindow") {
            var HallowsController = require("hallows_controller");
            root_wnd = HallowsController.getInstance().getHallowsActivityRoot(this.getFinishCB.bind(this))
        } else if (root_name == "hallowspreview") {
            var HallowsController = require("hallows_controller");
            root_wnd = HallowsController.getInstance().getHallowsPreviewRoot(this.getFinishCB.bind(this))
        } else if (root_name == "hallowswindow") {
            var HallowsController = require("hallows_controller");
            root_wnd = HallowsController.getInstance().getHallowsRoot(this.getFinishCB.bind(this))
        } else if (root_name == "adventureevtview") {
            root_wnd = AdventureController.getInstance().getAdventureEvtRoot()
        } else if (root_name == "esecsiceview") {
            var EsecsiceController = require("esecsice_controller");            
            root_wnd = EsecsiceController.getInstance().getEsecsiceRoot(this.getFinishCB.bind(this))
        } else if (root_name == "stonedunview") {
            var Stone_dungeonController = require("stone_dungeon_controller");
            root_wnd = Stone_dungeonController.getInstance().getStoneDungeonRoot(this.getFinishCB.bind(this))
        } else if (root_name == "varietystoreview") {
            var MallController = require("mall_controller");
            root_wnd = MallController.getInstance().getVarietyStoreRoot(this.getFinishCB.bind(this))
        }else if(root_name == "libraryplotpanel"){
            var HeroController = require("hero_controller");
            root_wnd = HeroController.getInstance().getLibraryPlotRoot(this.getFinishCB.bind(this))
        }else if(root_name == "commonalerwin"){
            var HeroController = require("hero_controller");
            root_wnd = HeroController.getInstance().getLibraryPlotCommonAlertRoot(this.getFinishCB.bind(this))
        }
    },

    getFinishCB: function(target_root_wnd) {
        if (!target_root_wnd) {
            // 这个时候走第二种
            var act_list = this.target_data[3][1];
            if (act_list && act_list.length >0) {
                this.act_list = Utils.deepCopy(act_list);
                this.guide_step = 0;
            }
        } else {
            this.target_root_wnd = target_root_wnd;
            var act_list = this.target_data[3][0];
            if (act_list && act_list.length > 0) {
                this.act_list = Utils.deepCopy(act_list);
                this.guide_step = 0;
            }
        }
        this.playNextGuide();
    },

    params2RootWndCB: function(roow_wnd) {
        if (roow_wnd && roow_wnd.active) {
            if (this.delay == 0) {
                this.playNextGuide();
            } else {
                this.delayPlayNextGuide(this.delay);
            }
        } else {
            this.endPlayGuide(true);
        }
    },

    findRootWndByParams2:　function(num) {
        if (this.target_data && this.target_data.length == 2) {
            var root_name = this.target_data[0];
            this.delay = this.target_data[1] || 0;

            if (root_name == "mainui") {
                var MainuiController = require("mainui_controller");
                this.target_root_wnd = MainuiController.getInstance().getMainUiRoot()
            } else if (root_name == "summon") {
                var PartnersummonController = require("partnersummon_controller");
                this.target_root_wnd = PartnersummonController.getInstance().getSummonItemRoot();
            } else if (root_name == "summonshow") {
                var PartnersummonController = require("partnersummon_controller");                
                this.target_root_wnd = PartnersummonController.getInstance().getSummonShowRoot()                
            } else if (root_name == "summonresult") {
                var PartnersummonController = require("partnersummon_controller");                
                this.target_root_wnd = PartnersummonController.getInstance().getSummonResultRoot()
            } else if (root_name == "partner") {
                var HeroController = require("hero_controller");
                this.target_root_wnd = HeroController.getInstance().getHeroBagRoot();
            }else if(root_name == "partnermainwindow"){
              var HeroController = require("hero_controller");
                this.target_root_wnd = HeroController.getInstance().getHeroMainWindowRoot();
            } else if (root_name == "partnerform") {
                var HeroController = require("hero_controller");
                this.target_root_wnd = HeroController.getInstance().getHeroFormRoot()
            } else if (root_name == "battlesceneview") {
                this.target_root_wnd = BattleController.getInstance().getCtrlBattleScene() 
            } else if (root_name == "partnereinfoview") {
                var HeroController = require("hero_controller");
                this.target_root_wnd = HeroController.getInstance().getHeroMianInfoRoot()
            } else if (root_name == "partnergofight") {
                var HeroController = require("hero_controller");
                this.target_root_wnd = HeroController.getInstance().getHeroGoFightRoot()
            } else if (root_name == "battlequickview") {
                var BattleDramaController = require("battle_drama_controller");
                this.target_root_wnd = BattleDramaController.getInstance().getDramBattleQuickRoot() 
            } else if (root_name == "battletophookrewards") {
                var BattleDramaController = require("battle_drama_controller");
                this.target_root_wnd = BattleDramaController.getInstance().getDramaBattleHookRewardRoot()
            } else if (root_name == "battletoppassrewards") {
                var BattleDramaController = require("battle_drama_controller");
                this.target_root_wnd = BattleDramaController.getInstance().getDramaBattlePassRewardRoot();
            } else if (root_name == "battletopscene") {
                var BattleController = require("battle_controller");
                this.target_root_wnd = BattleController.getInstance().getDramaFightUI();
            } else if (root_name == "getitemview") {
                var MainuiController = require("mainui_controller");
                this.target_root_wnd = MainuiController.getInstance().getItemExhibtionRoot() 
            } else if (root_name == "backpack") {
                var BackpackController = require("backpack_controller");
                this.target_root_wnd = BackpackController.getInstance().getBackpackRoot() 
            } else if (root_name == "backpacksell") {
                this.target_root_wnd = BackpackController.getInstance().getBackpackSellRoot()
            } else if (root_name == "arenaloopview") {
                var ArenaController = require("arena_controller");
                this.target_root_wnd = ArenaController.getInstance().getArenaRoot()
            } else if (root_name == "guildinitview") {
                this.target_root_wnd = GuildController.getInstance().getGuildInitRoot()
            } else if (root_name == "startowerview") {
                var StartowerController = require("startower_controller");
                this.target_root_wnd = StartowerController.getInstance().getStarTowerRoot() 
            } else if (root_name == "startowerchallengeview") {
                var StartowerController = require("startower_controller");                
                this.target_root_wnd = StartowerController.getInstance().getStarTowerChallengeRoot() 
            } else if (root_name == "auguryview") {
                this.target_root_wnd = AuguryController.getInstance().getAuguryRoot()
            } else if (root_name == "summonshowview") {
                this.target_root_wnd = PartnersummonController.getInstance().getSummonShowRoot() 
            } else if (root_name == "mallview") {
                this.target_root_wnd = MallController.getInstance().getMallRoot() 
            } else if (root_name == "adventurescene") {
                this.target_root_wnd = AdventureController.getInstance().getAdventureRoot()
            } else if (root_name == "adventureevtview") {
                this.target_root_wnd = AdventureController.getInstance().getAdventureEvtRoot()
            } else if (root_name == "adventurenextfloor") {
                this.target_root_wnd = AdventureController.getInstance().getNextAlertRoot()
                var BattleDramaController = require("battle_drama_controller");
                this.target_root_wnd = BattleDramaController.getInstance().getBattleQingbaoRoot() 
            } else if (root_name == "battleqingbaoview") {
            } else if (root_name == "tipssourceroot") {
                this.target_root_wnd = BackpackController.getInstance().getItemTipsSourceRoot() 
            } else if (root_name == "skybattleresult") {
                this.target_root_wnd = BattleController.getInstance().getFinishView(BattleConst.Fight_Type.Adventrue)
            } else if (root_name == "activitywindow") {
                this.target_root_wnd = ActivityController.getInstance().getActivityRoot()
            } else if (root_name == "hallowswindow") {
                var HallowsController = require("hallows_controller");
                this.target_root_wnd = HallowsController.getInstance().getHallowsRoot()
            } else if (root_name == "hallowsactivitywindow") {
                var HallowsController = require("hallows_controller");                
                this.target_root_wnd = HallowsController.getInstance().getHallowsActivityRoot()
            } else if (root_name == "hallowspreview") {
                var HallowsController = require("hallows_controller");
                this.target_root_wnd = HallowsController.getInstance().getHallowsPreviewRoot()
            } else if (root_name == "comptipsview") {
                var TipsController = require("tips_controller");
                this.target_root_wnd = TipsController.getInstance().getCompTipsRoot();
            } else if (root_name == "esecsiceview") {
                var EsecsiceController = require("esecsice_controller");
                this.target_root_wnd = EsecsiceController.getInstance().getEsecsiceRoot()
            } else if (root_name == "stonedunview") {
                var Stone_dungeonController = require("stone_dungeon_controller");
                this.target_root_wnd = Stone_dungeonController.getInstance().getStoneDungeonRoot()
            } else if (root_name == "varietystoreview") {
                var MallController = require("mall_controller");
                this.target_root_wnd = MallController.getInstance().getVarietyStoreRoot()
            } else if (root_name == "sevenloginview") {
                var ActionController = require("action_controller");
                this.target_root_wnd = ActionController.getInstance().getSevenLoginRoot()
            } else if (root_name == "welfareview") {
                var WelfareController = require("welfare_controller");
                this.target_root_wnd = WelfareController.getInstance().getWelfareRoot()
            } else if (root_name == "treasureview") {
                var ActionController = require("action_controller");                
                this.target_root_wnd = ActionController.getInstance().getTreasureRoot()
            } else if (root_name == "voyageview") {
                var VoyageController = require("voyage_controller");
                this.target_root_wnd = VoyageController.getInstance().getVoyageMainRoot()
            } else if (root_name == "strongerview") {
                var StrongerController = require("stronger_controller");
                this.target_root_wnd = StrongerController.getInstance().getStrongerRoot()
            } else if (root_name == "seerpalaceview") {
                var SeerpalaceController = require("seerpalace_controller");
                this.target_root_wnd = SeerpalaceController.getInstance().getSeerpalaceMainRoot()
            } else if (root_name == "voyagedispatchview") {
                var VoyageController = require("voyage_controller");
                this.target_root_wnd = VoyageController.getInstance().getVoyageDispatchRoot()
            } else if(root_name == "libraryplotpanel"){
              var HeroController = require("hero_controller");
              this.target_root_wnd = HeroController.getInstance().getLibraryPlotRoot()
            }else if(root_name == "commonalerwin"){
              var HeroController = require("hero_controller");
              this.target_root_wnd = HeroController.getInstance().getLibraryPlotCommonAlertRoot()
            }

            if (this.target_root_wnd) {                
                if (this.delay == 0) {
                    this.playNextGuide();
                } else {
                    this.delayPlayNextGuide(this.delay);
                }
                if (this.timer_hander)
                    this.removeTimer();
            } else {
                if (!this.timer_hander) {
                    // this.time_num = 0;
                    this.timer_hander = this.startUpdate(10, this.findRootWndByParams2.bind(this), 1000);
                }
            }

            // this.time_num++;
            if (num &&  num >= 9) {
                this.removeTimer()
                this.endPlayGuide(true);                
            }  
        }
    },

    findRootWndByParams3: function() {
        if (!this.target_data) return;
        var root_name = this.target_data[1];
        this.delay = this.target_data[2];
        // newfirstrecharge
        if (root_name == "firstrecharge") {
            ActionController.getInstance().openFirstChargeView(true)
        } else if (root_name == "newfirstrecharge" || root_name == "firstrecharge1") {
            var NewFirstChargeController = require("newfirstcharge_controller");
            NewFirstChargeController.getInstance().openNewFirstChargeView(true)
        } 

        if (this.delay == 0) {
            this.playNextGuide()
        } else {
            this.delayPlayNextGuide(this.delay)
        }
    },

    //==============================--
    //desc:根据4个参数查找对象,主要用于主场景的移动顺便只想对象以及检测窗体状态
    //time:2017-08-21 10:14:38
    //@return 
    //==============================--
    findRootWndByParams4: function() {
        if (!this.target_data) return;
        var root_name = this.target_data[1];
        var taget_id = this.target_data[2];
        this.delay = this.target_data[3];
        if (root_name == "centercity") {
            var MainSceneController = require("mainscene_controller");
            //引导找建筑，新界面不适用。
            // MainSceneController.getInstance().getCenterCityBuildById(taget_id, function(build_item) {
            //     if (build_item && build_item.root_wnd) {
            //         MainSceneController.getInstance().moveToBuild(taget_id);
            //         this.target_root_wnd = build_item.root_wnd;
            //         if (this.delay == 0) {
            //             this.playNextGuide()
            //         } else {
            //             this.delayPlayNextGuide(this.delay)
            //         }
            //     } else {
            //         this.endPlayGuide(true);
            //     }
            // }.bind(this));
        }
    },

    findTargetByParams: function() {
        if (this.target_data) {
            this.target_type = this.target_data[0];                // 是根据名字查找还是根据tag查找
            this.delay = this.target_data[1] || 0;                // 处理完当前引导之后,到下一个引导的间隔事件
            this.target_name = this.target_data[2];                // 需要查找的对象的标志,可能是name或者tag
            var target_clickback = this.target_data[3] || 0;      // 是否是自身点击返回
            this.need_save = this.target_data[4] || 0;            // 如果需要保存的话,那么就要配置这个步骤为1,如果是2就是记录自己,并且记录上一步,同时如果这个需要记录,则会跟服务器交互,一般是消耗材料的步骤
            this.close_all = this.target_data[5] || 0;            // 是否需要关闭所有窗体
            this.wait_delay = this.target_data[6] || 0;           // 如果配置了时间,则表示这一步,不是需要点击处理的,而是等这个时间自动下一步
            this.show_guide_step = this.target_data[7] || true;   // 有一类窗体不需要显示也不需要显示手指到的,这个时候就用这个参数控制            
            this.figer_off_x = this.target_data[8] || 0;          // 引导的偏移x
            this.figer_off_y = this.target_data[9] || 0;          // 引导的偏移y
            this.guide_msg = this.target_data[10] || "";          // 引导描述框的内容描述
            this.sprite_off_x = this.target_data[11] || 0;        // 引导描述框的偏移x
            this.sprite_off_y = this.target_data[12] || 0;        // 引导描述框的偏移y
            this.sprite_flip = this.target_data[13] || 0;         // 引导描述框的翻转

            this.bg_opacity = typeof this.target_data[14] == "number" ? this.target_data[14] : 100;

            // this.bg_opacity = this.target_data[14] || 100;        // 压黑背景透明度

            this.sound_name = this.target_data[15] || "";         // 引导音效

            this.findTargetByRootND();
        }

    },

    findTargetByRootND: function(num) {
        if (this.target_type == "name") {
            var real_name = GuideConst.NodeKeys[this.target_name];
            var name_info = GuideConst.getNameInfo(this.target_name);

            if (!real_name)
                real_name = this.target_name;

            if (name_info && name_info.length == 2) {
                if (name_info[0] == "tag") {
                    this.target = this.seekChildByTag(this.target_root_wnd, name_info[1]);
                }
            } else {
                this.target = this.seekChild(this.target_root_wnd, real_name);
            }
        } else if (this.target_type == "tag") {
            this.target = this.seekChildByTag(this.target_root_wnd, this.target_name);
        }

        if (this.target) {
            this.removeTimer();
            this.drawTargetRect();
            if (this.wait_delay == 0) {
                this.once_hander = this.target.once(cc.Node.EventType.TOUCH_END, function() {
                    if (this.act_config)
                        this.checkDoNextGuide();
                    this.showSkipBtn();
                    // if (this.delay > 0) {
                    //     this.addTicket(this.checkDoNextGuide.bind(this), this.delay);
                    // } else {                    
                    //     this.checkDoNextGuide();
                    // }
                }, this);
            } else {
                this.delayPlayNextGuide(this.wait_delay);
            }
        } else {
            if (!this.timer_hander) {
                this.time_num = 0;
                this.timer_hander = this.startUpdate(6, this.findTargetByRootND.bind(this), 1000);                
            }
        }

        if (num && num >= 5) {
            this.removeTimer();
            this.endPlayGuide(true);
        }

    },

    saveGuideStep: function() {
        if (this.config && this.config.over_step && this.config.over_step == this.guide_step) {
            if (!this.guide_cache_data[this.config.id])
                this.guide_cache_data[this.config.id] = {}
            this.guide_cache_data[this.config.id][this.config.over_step] = true;
            var RoleController = require("role_controller")
            var role_vo = RoleController.getInstance().getRoleVo();
            
            cc.sys.localStorage.setItem("guide_data" + role_vo.srv_id + role_vo.rid, JSON.stringify(this.guide_cache_data));
        }
    },

    clearTargetInfo: function() {

    },

    endPlayGuide: function(is_skip) {
        cc.log("结束当前引导---" + this.act_config.id);
        this.guide_step = 0;

        gcore.GlobalEvent.fire(GuideEvent.NewPlayerGuideClose);

        if (this.hasTicket("delayPlayNextGuide")) {
            this.delTicker("delayPlayNextGuide");
        }

        if (this.ctrl)
            this.ctrl.startPlayGuide(false, this.act_config.id, is_skip);

        if (this.model)
            this.model.setGuideLastPos(null);

        this.background_bi.enabled = false;

        this.act_config = null;

        this.hideSKipBtn();
    },

    findNodeByName: function() {

    },

    findNodeByTag: function() {

    },

    removeTimer: function() {
        if (this.timer_hander) {
            this.stopUpdate(this.timer_hander);
            this.time_num = 0;
            this.timer_hander = null;
        }
    },

    drawTargetRect: function() {
        if (this.target) {
            this.clip_con_nd.active = true;
            this.effect_con_nd.active = true;
            // this.background_bi.enabled = false;

            var target_pos_1 = this.target.convertToWorldSpaceAR(cc.v2(0, 0));
            var target_pos = this.root_wnd.convertToNodeSpaceAR(target_pos_1);
            if (target_pos.y < target_pos_1.y)
                target_pos.y = target_pos_1.y;
            var final_posX = target_pos.x + (0.5 - this.target.anchorX) * this.target.width + this.figer_off_x || 0;
            var final_posY = target_pos.y + (0.5 - this.target.anchorY) * this.target.height; 
            if(!window.IS_PC){
              var _y = (cc.winSize.height - 1280)/2;
              final_posY = final_posY - _y;
            }
            
            var final_pos  = cc.v2(final_posX, final_posY);        

            this.clip_con_nd.position = final_pos;
            this.clip_con_nd.width = this.target.width;
            this.clip_con_nd.height = this.target.height;
            
            this.effect_con_nd.position = final_pos;
            

            if (this.bg_opacity > 0) {
                this.guide_clip_nd.active = true;
                this.guide_clip_nd.position = final_pos;
                // this.guide_clip_nd.width = this.target.width;
                // this.guide_clip_nd.height = this.target.height;
            } else {
                this.guide_clip_nd.active = false;
            }


            if (this.show_guide_step) {  // 显示手指
                var last_pos = this.model.getGuideLastPos();

                // 显示手指
                var action_name = PlayerAction.action_1;
                if (last_pos)
                    action_name = PlayerAction.action_2;
                var eff_res = PathTool.getEffectRes(240);
                var eff_path = PathTool.getSpinePath(eff_res);
                this.loadRes(eff_path, function(action_name, eff_sd) {
                    this.effect_con_sk.skeletonData = eff_sd;
                    this.effect_con_sk.setAnimation(0, action_name, true);
                    this.background_bi.enabled = false;
                }.bind(this, action_name));
                this.effect_con_nd.stopAllActions()
                if (last_pos) {
                    var move_dis = this.calDistanch(final_pos, last_pos);
                    var time = move_dis /  GuideConst.Finger_Speed;
                    var call_func = cc.callFunc(function() {
                        this.clip_mask_bl.enabled = false;
                        this.effect_con_sk.setAnimation(0, PlayerAction.action_1, true);
                        this.finish_action = true;
                    }, this);
                    var move_act = cc.moveTo(time, final_pos);
                    var act_queqe = cc.sequence(move_act, call_func);
                    this.effect_con_nd.runAction(act_queqe);
                    this.finish_action = false;
                } else {
                    this.effect_con_nd.position = final_pos;
                }

                if (this.guide_msg == "") {
                    this.showNoticeContainer();
                } else {
                    this.showLittleSpiritAndTips(final_pos);
                    if (this.effect_con_nd.active) {
                        // this.effect_con_nd.active = false;
                        this.showNoticeContainer()                        
                    }
                }
            } else {
                this.background_bi.enabled = false;
            }

            // 显示小精灵
            this.model.setGuideLastPos(final_pos);
        }
    },

    onClickMaskBg: function() {
        if (this.effect_con_nd.active && this.effect_con_sk.skeletonData && this.effect_con_sk.animation == "action1") {
            if (!this.notice_effect) {
                this.notice_effect_nd = new cc.Node();
                this.root_wnd.addChild(this.notice_effect_nd);
                this.notice_effect = this.notice_effect_nd.addComponent(sp.Skeleton);
                this.notice_effect.setEndListener(this.noticeAnimaEnd.bind(this));
                this.notice_effect_nd.position = this.effect_con_nd.position;                
                var spine_res = PathTool.getEffectRes("198");
                var spine_path = PathTool.getSpinePath(spine_res);
                this.loadRes(spine_path, function(notice_sd) {
                    this.notice_effect.skeletonData = notice_sd;
                    this.notice_effect.setAnimation(0, "action", false);
                }.bind(this));
            } else {
                this.notice_effect_nd.position = this.effect_con_nd.position;
                this.notice_effect_nd.active = true;                
                if (this.notice_effect.skeletonData) {
                    this.notice_effect.setAnimation(0, "action", false);                    
                }
            }
        }
    },

    noticeAnimaEnd: function() {
        this.notice_effect.clearTracks();
        this.notice_effect_nd.active = false;
    },

    onClickSkipBtn: function() {
        this.endPlayGuide(true);
    },

    calDistanch: function(pos1, pos2) {
        return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
    },

    showNoticeContainer: function() {

    },

    showLittleSpiritAndTips: function(tar_pos) {
        this.mas_con_nd.active = true;

        this.msg_txt_rt.string = this.guide_msg;
        this.msg_bg_nd.height = this.msg_txt_nd.height + 30;

        this.updateGuideTipsBgPos(tar_pos);
    },

    updateGuideTipsBgPos: function(tar_pos) {
        var original_size = this.root_wnd.getContentSize();
        // 确定x的值
        var is_x_filp = false;
        var final_x = tar_pos.x;
        if (tar_pos.x < original_size.width * 0.5) {
            is_x_filp = false;
            final_x = tar_pos.x + this.msg_bg_nd.width * 0.5;
        } else {
            is_x_filp = true;
            final_x = tar_pos.x - this.msg_bg_nd.width * 0.5;            
        }

        // 确定
        var is_y_filp = false;
        var final_y = tar_pos.y;
        if (tar_pos.y < original_size.height * 0.5) {
            is_y_filp = false;
            final_y = tar_pos.y + this.clip_con_nd.height;
        } else {
            is_y_filp = true;
            final_y = tar_pos.y - this.clip_con_nd.height;   
        }

        if (is_x_filp) {
            this.msg_bg_nd.scaleX = -1;
        } else {
            this.msg_bg_nd.scaleX = 1;            
        }

        if (is_y_filp) {
            this.msg_bg_nd.scaleY = -1;
            this.msg_bg_nd.y += 10;
        } else {
            this.msg_bg_nd.scaleY = 1;            
            this.msg_bg_nd.y = 0;
        }

        this.mas_con_nd.position = cc.v2(final_x, final_y);
    },

    showSkipBtn: function() {
        if (this.act_config && this.act_config.skip) {
            if (this.hasTicket("skip_btn_show"))
                this.delTicker("skip_btn_show");
            if (this.skip_btn_nd.active)
                this.skip_btn_nd.active = false;

            this.addTicket(function() {
                this.skip_btn_nd.active = true;
                var btn_act = this.getSkipBtnAct();
                this.skip_btn_nd.runAction(btn_act);
            }.bind(this), 5, "skip_btn_show")
        } else {
            this.skip_btn_nd.active = false;
        }
    },

    hideSKipBtn: function() {
        if (this.hasTicket("skip_btn_show"))
            this.delTicker("skip_btn_show");
        this.skip_btn_nd.stopAllActions();
        this.skip_btn_nd.active = false;        
    },

    getSkipBtnAct: function() {
        var fadein = cc.fadeIn(0.7);
        var fadeout = cc.fadeOut(0.4);
        return cc.repeatForever(cc.sequence(fadein,fadeout))
    },

    adjustGuide: function() {
        if (this.clip_con_nd.active && this.finish_action) {
            var target_pos = this.target.convertToWorldSpaceAR(cc.v2(0, 0));
            target_pos = this.root_wnd.convertToNodeSpaceAR(target_pos);
            var final_posX = target_pos.x + (0.5 - this.target.anchorX) * this.target.width + this.figer_off_x || 0;
            var final_posY = target_pos.y + (0.5 - this.target.anchorY) * this.target.height; 
            var final_pos  = cc.v2(final_posX, final_posY);
            if (this.clip_con_nd.x !== final_pos.x || this.clip_con_nd.y !== final_pos.y) {
                this.clip_con_nd.x = final_pos.x;
                this.clip_con_nd.y = final_pos.y;                
            }
        }
    },

    resetGuide: function() {
        cc.log("断线重连重新执行引导");
        // Utils.closeAllWindow();
        if (!this.act_config) return;

        var MainuiController = require("mainui_controller");
        var MainuiConst = require("mainui_const");
        MainuiController.getInstance().changeMainUIStatus(MainuiConst.new_btn_index.main_scene);

        if (this.timer_hander) {
            this.stopUpdate(this.timer_hander);
            this.time_num = 0;
            this.timer_hander = null;
        }

        if (this.hasTicket("delayPlayNextGuide"))
            this.delTicker("delayPlayNextGuide");

        this.hideSKipBtn();


        if (this.guide_clip_nd.active)
            this.guide_clip_nd.active = false;        

        if (this.clip_con_nd.active)
            this.clip_con_nd.active = false;

        if (this.effect_con_nd.active)
            this.effect_con_nd.active = false;

        this.background_bi.enabled = false;

        if (this.mas_con_nd.active)
            this.mas_con_nd.active = false;

        this.wait_status_time_ticket = gcore.Timer.set(function(){   

            if (this.model)
                this.model.setGuideLastPos(null);

            this.playGuide(this.act_config);
        }.bind(this), 1000, 1)
    },

    disconnect: function() {
        this.background_bi.enabled = true;        
    }
    
})