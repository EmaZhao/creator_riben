// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-08-16 17:09:17
// --------------------------------------------------------------------
var PathTool = require("pathtool");
// var HallowsEvent = require("hallows_event");
var GuideController = require("guide_controller");
var GuideConst = require("guide_const");
var GuideEvent = require("guide_event");
// var HallowsController = require("hallows_controller");
var TaskEvent = require("task_event");
var TaskController = require("task_controller");

var Task_guideWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("drama", "task_guide_view");
        this.viewTag = SCENE_TAG.msg;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = GuideController.getInstance();
        this.model = this.ctrl.getModel();
        // this.hallow_ctrl = HallowsController.getInstance();
        // this.hallow_model = this.hallow_ctrl.getModel();
        this.task_ctrl = TaskController.getInstance();
        this.task_model = this.task_ctrl.getModel();

        this.step = 0;  //步数0开始，对应数组第0个
        this.timer_hander = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        if (game.views_js)
            game.views_js.cancelTouch();

        this.root_wg = this.root_wnd.getComponent(cc.Widget);
        if (window.FIT_SCALE > 1) {
            this.root_wg.isAlignTop = true;
            this.root_wg.isAlignBottom = true;
        }

        this.background_nd = this.seekChild("background");
        this.clip_con_nd = this.seekChild("clip_con");
        this.effect_con_nd = this.seekChild("effect_con");
        this.effect_con_sk = this.seekChild("effect_con", sp.Skeleton);

        // this.handleEffect(true);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {

        //界面点击，触发下一步特效
        this.addGlobalEvent(GuideEvent.TaskNextStep, function (data) {
            // cc.log(data, this.target_name)
            // if (this.root_name == "summonshow" && data == "confirm_btn") {
            //     this.effect_con_nd.active = false;
            // }
            // if (this.target_name) {
            //     if (this.target_name == data) {
            //         this.step += 1;
            //         this.findRootWndByCondition();
            //     } else {
            //         this.handleEffect(false);
            //     }
            // } else {
            //     this.handleEffect(false);
            // }
            if (data == "quick_btn" || data == "quick_add_btn" || data == "compound_btn") {
                if (this.target_name == data) {
                    this.step += 1;
                    this.findRootWndByCondition();
                } else {
                    this.handleEffect(false);
                }
            }
            if (data == "challenge_btn") {
                if (this.target_name == data) {
                    // this.findRootWndByCondition();
                    this.root_name = this.target_data[this.step + 1][0]
                } else {
                    this.handleEffect(false);
                }
            }
        }, this)

        //界面关闭，取消特效
        this.addGlobalEvent(GuideEvent.CloseTaskEffect, function () {
            this.handleEffect(false);
            this.model.setTaskGuideLastPos(null);
            this.step = 10;
            window.TASK_TIPS = false;
        }, this)
 
        // this.addGlobalEvent(HallowsEvent.UpdateHallowsTaskEvent, function () {
        //     if (this.config && this.effect_con_nd){
        //         this.effect_con_nd.active = this.hallow_model.getHallowsTaks(this.config.id).finish < 1;
        //         window.TASK_TIPS = this.effect_con_nd.active;
        //     }
        // }, this)

        this.addGlobalEvent(TaskEvent.UpdateMainQuestTask, function (data) {
            if (this.config && this.effect_con_nd) {
                this.effect_con_nd.active = data.finish < 1;
                window.TASK_TIPS = this.effect_con_nd.active;
            }
        }, this)

        this.addGlobalEvent(GuideEvent.OpenTaskEffect, function (node) {
            // if (node == this.target_data[this.step + 1][0]) {
            //     cc.log("node",node)
            // } else {
            //     this.handleEffect(false);
            //     this.model.setTaskGuideLastPos(null);
            //     this.step = 10;
            //     window.TASK_TIPS = false;
            // }
            if (node.task_tips) {
                this.target_root_wnd = node;
                this.effect_con_nd.active = false;
                this.step += 1;
                this.findTargetNode();
                return
            }
            if (node.name == "guide_main_view" || window.TASK_TIPS == false || node.name == "arena_loop_match_window") return
            if (this.root_name == "forge_house_window" || this.root_name == "guildboss_main_window") return
            this.target_root_wnd = node;
            this.effect_con_nd.active = false;
            this.step += 1;
            if(node.name == "battle_drama_reward_window"){
                this.step = 0;
            }
            this.findTargetNode();
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (config) {
        this.config = config;
        this.target_data = config.drama_eff;
        cc.log("target", this.target_data)
        this.step = 0;
        this.model.setTaskGuideLastPos(null);
        if (this.timer_hander)
            this.removeTimer();
        this.getTaskTipsEffectNd();
        this.findRootWndByCondition();
    },

    setVisibleStatus: function (status, config) {
        this.setVisible(status);
        this.model.setTaskGuideLastPos(null);
        // this.handleEffect(status);
        if (this.timer_hander)
            this.removeTimer();
        this.config = config;
        this.target_data = config.drama_eff;
        cc.log("target", this.target_data);
        this.step = 0;
        this.getTaskTipsEffectNd();
        this.findRootWndByCondition();
    },

    getTaskTipsEffectNd: function () {
        let node = require("mainui_controller").getInstance().getTaskTipsPanel();
        this.target = this.seekChild(node, "main");
        this.drawTargetRect();
    },

    //手指特效显示
    handleEffect: function (status) {
        if (status == false) {
            if (this.effect_con_sk) {
                this.effect_con_sk.setToSetupPose();
                this.effect_con_sk.clearTracks();
            }
        } else {
            if (this.effect_con_sk) {
                var eff_res = PathTool.getEffectRes(240);
                var eff_path = PathTool.getSpinePath(eff_res);
                this.loadRes(eff_path, function (res_object) {
                    this.effect_con_sk.skeletonData = res_object;
                    this.effect_con_sk.setAnimation(0, PlayerAction.action_1, true)
                }.bind(this))
            }
        }
    },


    findRootWndByCondition: function (num) {
        if (this.effect_con_nd.active) {
            this.effect_con_nd.active = false;
        }
        if (!this.target_data || !this.target_data[0]) {
            window.TASK_TIPS = false;
            return
        }
        if (this.target_data[this.step] == null) {
            this.handleEffect(false);
            window.TASK_TIPS = false;
            return
        }

        var root_name = this.target_data[this.step][0];
        cc.log(root_name)
        this.root_name = root_name;
        var root_wnd = null;
        if (root_name == "partner") {
            var HeroController = require("hero_controller");
            root_wnd = HeroController.getInstance().getHeroBagRoot()
        } else if (root_name == "battletopscene") {
            var BattleController = require("battle_controller");
            root_wnd = BattleController.getInstance().getDramaFightUI();
        } else if (root_name == "battlesceneview") {
            var BattleController = require("battle_controller");
            root_wnd = BattleController.getInstance().getCtrlBattleScene()
        } else if (root_name == "adventurescene") {
            root_wnd = AdventureController.getInstance().getAdventureRoot()
        } else if (root_name == "partnerform") {
            root_wnd = HeroController.getInstance().getHeroFormRoot()
        } else if (root_name == "partnereinfoview") {
            var HeroController = require("hero_controller");
            root_wnd = HeroController.getInstance().getHeroMianInfoRoot();
        } else if (root_name == "partnergofight") {
            var HeroController = require("hero_controller");
            root_wnd = HeroController.getInstance().getHeroGoFightRoot()
        } else if (root_name == "adventureevtview") {
            root_wnd = AdventureController.getInstance().getAdventureEvtRoot()
        } else if (root_name == "esecsiceview") {
            var EsecsiceController = require("esecsice_controller");
            root_wnd = EsecsiceController.getInstance().getEsecsiceRoot()
        } else if (root_name == "stonedunview") {
            var Stone_dungeonController = require("stone_dungeon_controller");
            root_wnd = Stone_dungeonController.getInstance().getStoneDungeonRoot()
        } else if (root_name == "varietystoreview") {
            var MallController = require("mall_controller");
            root_wnd = MallController.getInstance().getVarietyStoreRoot()
        } else if (root_name == "summon") {
            var PartnersummonController = require("partnersummon_controller");
            root_wnd = PartnersummonController.getInstance().getSummonItemRoot();
        } else if (root_name == "summonshow") {
            var PartnersummonController = require("partnersummon_controller");
            root_wnd = PartnersummonController.getInstance().getSummonShowRoot()
        } else if (root_name == "summonresult") {
            var PartnersummonController = require("partnersummon_controller");
            root_wnd = PartnersummonController.getInstance().getSummonResultRoot()
        } else if (root_name == "arenaloopview") {
            var ArenaController = require("arena_controller");
            root_wnd = ArenaController.getInstance().getArenaRoot()
        } else if (root_name == "voyageview") {
            var VoyageController = require("voyage_controller");
            root_wnd = VoyageController.getInstance().getVoyageMainRoot()
        } else if (root_name == "voyagedispatchview") {
            var VoyageController = require("voyage_controller");
            root_wnd = VoyageController.getInstance().getVoyageDispatchRoot()
        } else if (root_name == "forge_house_window") {
            var ForgeController = require("forgehouse_controller");
            root_wnd = ForgeController.getInstance().getForgeHouseRoot();
        }
        else if (root_name == "forge_artifact_panel") {
            var ForgeController = require("forgehouse_controller");
            root_wnd = ForgeController.getInstance().getForgeArtifactRoot();
        } else if (root_name == "guild_main_window") {
            var GuildController = require("guild_controller");
            root_wnd = GuildController.getInstance().getGuildMainRootWnd();
        } else if (root_name == "guildboss_main_window") {
            var GuildController = require("guildboss_controller");
            root_wnd = GuildController.getInstance().getGuildBossMainRootWnd();
        } else if (root_name == "battle_drama_reward_window") {
            var BattleDramaController = require("battle_drama_controller");
            root_wnd = BattleDramaController.getInstance().getDramaBattlePassRewardRoot();
        }
         else if (root_name == "backpack_window_3") {
            var BackpackController = require("backpack_controller");
            root_wnd = BackpackController.getInstance().getBackpackRoot();
        }
         else if (root_name == "backpack_comp_tips_window") {
            var TipsController = require("tips_controller");
            root_wnd = TipsController.getInstance().getCompTipsRoot();
        }
        this.target_root_wnd = root_wnd;

        // this.findTargetNode();

        if (this.target_root_wnd) {

            gcore.Timer.set(function () {
                this.findTargetNode();
            }.bind(this), 50, 1)
            if (this.timer_hander)
                this.removeTimer();
        } else {
            if (!this.timer_hander) {
                this.effect_con_nd.active = false;
                this.timer_hander = this.startUpdate(10, this.findRootWndByCondition.bind(this), 300);
            }
        }

        if (num && num >= 10) {
            this.effect_con_nd.active = false;
            this.step = 10;
            window.TASK_TIPS = false;
        }
    },

    delayPlayNextGuide: function (delay_time) {
        if (this.hasTicket("delayPlayNextGuide")) {
            this.delTicker("delayPlayNextGuide");
        }
        this.addTicket(this.findTargetNode.bind(this), delay_time, "delayPlayNextGuide");
    },

    removeTimer: function () {
        if (this.timer_hander) {
            this.stopUpdate(this.timer_hander);
            this.time_num = 0;
            this.timer_hander = null;
        }
    },

    //寻找目标界面的子节点
    findTargetNode: function (num) {
        if (!this.target_data[this.step]) {
            this.effect_con_nd.active = false;
            window.TASK_TIPS = false;
            return
        }
        let target_name = this.target_data[this.step][1];
        var real_name = GuideConst.NodeKeys[target_name];
        var name_info = GuideConst.getNameInfo(target_name);

        if (!real_name)
            real_name = target_name;

        if (name_info && name_info.length == 2) {
            if (name_info[0] == "tag") {
                this.target = this.seekChildByTag(this.target_root_wnd, name_info[1]);
                this.target_name = name_info[1]
            }
        } else {
            if (this.target_data[this.step][0] == "arenaloopview"  ) {
                this.target = this.seekChildByTag(this.target_root_wnd, real_name);
            } else if (this.target_data[this.step][0] == "forge_house_window" && real_name == "tab_btn_2") {
                let top = this.seekChild(this.target_root_wnd, "top_container")
                this.target = this.seekChild(top, real_name);
            } else {
                this.target = this.seekChild(this.target_root_wnd, real_name);
            }
            this.target_name = real_name;
        }
        cc.log("targe", this.target);

        if (this.target) {
            this.removeTimer();
            this.drawTargetRect();
        } else {
            if (!this.timer_hander) {
                this.time_num = 0;
                this.timer_hander = this.startUpdate(6, this.findTargetNode.bind(this), 1000);
            }
            //
            // return
        }

        if (num && num >= 5) {
            this.removeTimer();
            this.effect_con_nd.active = false;
            this.model.setTaskGuideLastPos(null);
            window.TASK_TIPS = false;
            // this.endPlayGuide(true);
        }
    },

    drawTargetRect: function () {
        if (this.target) {
            this.clip_con_nd.active = true;
            this.effect_con_nd.active = true;
            // this.background_bi.enabled = false;

            var target_pos_1 = this.target.convertToWorldSpaceAR(cc.v2(0, 0));
            var target_pos = this.root_wnd.convertToNodeSpaceAR(target_pos_1);
            if (target_pos.y < target_pos_1.y)
                target_pos.y = target_pos_1.y;
            var final_posX = target_pos.x + (0.5 - this.target.anchorX) * this.target.width;
            var final_posY = target_pos.y + (0.5 - this.target.anchorY) * this.target.height;
            var final_pos = cc.v2(final_posX, final_posY);

            cc.log(final_pos);

            this.clip_con_nd.position = final_pos;
            this.clip_con_nd.width = this.target.width;
            this.clip_con_nd.height = this.target.height;

            this.show_guide_step = true;
            if (this.show_guide_step) {  // 显示手指
                var last_pos = this.model.getTaskGuideLastPos();

                // 显示手指
                var action_name = PlayerAction.action_1;
                if (last_pos)
                    action_name = PlayerAction.action_2;
                var eff_res = PathTool.getEffectRes(240);
                var eff_path = PathTool.getSpinePath(eff_res);
                this.loadRes(eff_path, function (action_name, eff_sd) {
                    this.effect_con_sk.skeletonData = eff_sd;
                    this.effect_con_sk.setAnimation(0, action_name, true);
                }.bind(this, action_name));
                this.effect_con_nd.stopAllActions()
                if (last_pos) {
                    var move_dis = this.calDistanch(final_pos, last_pos);
                    var time = move_dis / GuideConst.Finger_Speed;
                    var call_func = cc.callFunc(function () {
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


            }
            this.model.setTaskGuideLastPos(final_pos);
        }
    },

    calDistanch: function (pos1, pos2) {
        return Math.sqrt(Math.pow((pos1.x - pos2.x), 2) + Math.pow((pos1.y - pos2.y), 2));
    },

    playNextGuide: function () {
        this.saveGuideStep()
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
                    this.findRootWndByCondition();
                }
            }
        }
    },

    endPlayGuide: function (is_skip) {
        cc.log("结束当前引导---" + this.act_config.id);
        this.step = 0;
        if (this.model)
            this.model.setTaskGuideLastPos(null);
    },

    saveGuideStep: function () {
        // if (this.config && this.config.over_step && this.config.over_step == this.guide_step) {
        //     if (!this.guide_cache_data[this.config.id])
        //         this.guide_cache_data[this.config.id] = {}
        //     this.guide_cache_data[this.config.id][this.config.over_step] = true;
        //     var RoleController = require("role_controller")
        //     var role_vo = RoleController.getInstance().getRoleVo();

        //     cc.sys.localStorage.setItem("task_guide_data" + role_vo.srv_id + role_vo.rid, JSON.stringify(this.guide_cache_data));
        // }
    },

    getEffectActive: function () {
        if (this.effect_con_nd) {
            return this.effect_con_nd.active
        }
        return false
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {

        this.removeTimer();
        this.ctrl.openTaskGuideWindow(false);
    },
})