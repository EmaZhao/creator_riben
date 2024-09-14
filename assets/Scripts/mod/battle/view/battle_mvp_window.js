// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-22 11:57:11
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BattleConst = require("battle_const");
var PlayerHead = require("playerhead");
var RoleController = require("role_controller");
var BattleController = require("battle_controller");
var BattleEvent = require("battle_event");
var CommonScrollView = require("common_scrollview");
var BattleDramaHookRewardListPanel = require("battle_drama_hook_reward_list_panel");

var Battle_mvpWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_mvp_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.data = arguments[0];

        var data = this.data;
        this.result = data.result
        this.reward_list = data.item_rewards || {}
        this.fight_type = data.combat_type || BattleConst.Fight_Type.Darma
        this.partner_bid = data.partner_bid || 0
        this.partner_hurt = data.partner_hurt || 0
        this.partner_total_hurt = data.partner_total_hurt || 0
        this.role_exp = data.exp || 0
        this.role_lv = data.lev || 1
        this.role_nowlv = data.new_lev || 1
        this.role_nowexp = data.new_exp || 0;
        this.use_skin = data.use_skin || 0;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ani_isover = false
        this.item_list = {}

        this.role_vo = RoleController.getInstance().getRoleVo();
        this.ctrl = BattleController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.main_container = this.seekChild("container");
        this.main_container.zIndex = 1;
        this.containerSize = this.main_container.getContentSize();

        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;

        this.auto_combat_num_lb = this.seekChild(this.main_container, "auto_combat_num", cc.Label);
        this.auto_combat_num_lb.node.active = false;

        this.seekChild("pic_mvp").zIndex = 1;

        this.time_label_rt = this.seekChild(this.main_container, "time_label", cc.RichText);
        this.time_label_rt.string = Utils.TI18N("5秒后关闭");
        this.time_label_rt.node.active = false;
        this.comfirm_btn = this.seekChild(this.main_container, "comfirm_btn");
        this.harm_btn = this.seekChild(this.main_container, "harm_btn");

        if (this.data && Utils.next(this.data) != null) {
            this.harm_btn.active = true;
        } else {
            this.harm_btn.active = false;
        }

        this.special_sk = this.seekChild(this.main_container, "play_effect", sp.Skeleton);


        //进度条
        this.progress_bg_nd = this.seekChild(this.main_container, "sprite_3");
        this.sprite_4_nd = this.seekChild(this.main_container, "sprite_4");
        this.progress_pb = this.seekChild(this.main_container, "sprite_3", cc.ProgressBar);
        this.progress_pb.progress = 0;
        this.proTxt_lb = this.seekChild(this.main_container, "proTxt", cc.Label);
        this.progress_bg_nd.active = false;

        //延迟0.3秒显示进度条动画
        Utils.delayRun(this.root_wnd, 0.3, function () {
            this.showProgressEffect();
        }.bind(this))

        //头像
        var sp_2 = this.seekChild(this.main_container, "sprite_2");
        this.head_icon = new PlayerHead();
        this.head_icon.setParent(sp_2);
        this.head_icon.show();
        this.head_icon.setScale(0.8);
        this.head_icon.setPosition(0, 0);
        this.head_icon.setHeadRes(this.role_vo.face_id);

        //等级
        this.roleLvTxt_lb = this.seekChild(this.main_container, "roleLvTxt", cc.Label);
        this.roleLvTxt_lb.string = cc.js.formatStr("Lv.%d", this.role_nowlv);

        var partner_config = Config.partner_data.data_partner_base[this.partner_bid];
        let skin_config = Config.partner_skin_data.data_skin_info[this.use_skin];

        this.mvp_con_nd = this.seekChild("mvp_con");

        //名称和立绘
        var pic_bg = this.seekChild(this.mvp_con_nd, "pic_bg");
        this.bust_icon_sp = this.seekChild("bustIcon", cc.Sprite);
        pic_bg.zIndex = 1;
        this.roleNameTxt_lb = this.seekChild(pic_bg, "roleNameTxt", cc.Label);
        if (partner_config) {
            this.roleNameTxt_lb.string = partner_config.name;
            var bustid = null;
            if(skin_config){
                bustid = skin_config.bustid;
            }else{
                bustid = partner_config.bustid;
            }

            var bust_res = PathTool.getPartnerBustRes(bustid);
            this.loadRes(bust_res, function (bg_sf) {
                this.bust_icon_sp.spriteFrame = bg_sf;
            }.bind(this));
        }

        //伤害输出
        var hurtTxt_lb = this.seekChild(pic_bg, "hurtTxt", cc.Label);
        var hurtPercent = cc.js.formatStr("%s", Math.floor(this.partner_hurt / this.partner_total_hurt * 100)) + "%";
        hurtTxt_lb.string = cc.js.formatStr("%d(%s)", Math.ceil(Number(this.partner_hurt)), hurtPercent);

        //显示特效
        this.handleEffect(true);

        this.scroll_con_nd = this.seekChild(this.main_container, "scroll_con");
        var tab_size = this.scroll_con_nd.getContentSize();
        var setting = {
            item_class: BattleDramaHookRewardListPanel,      // 单元类
            start_x: 94,                    // 第一个单元的X起点
            space_x: 20,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 120,               // 单元的尺寸width
            item_height: 180,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 4,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.scroll_view = new CommonScrollView();
        this.scroll_view.createScroll(this.scroll_con_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
        this.rewardViewUI();
        Utils.getNodeCompByPath("container/getlabel", this.root_wnd, cc.Label).string = Utils.TI18N("获得物品");
        Utils.getNodeCompByPath("mvp_con/pic_bg/hurtTitle", this.root_wnd, cc.Label).string = Utils.TI18N("总伤害输出");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.comfirm_btn, function () {
            if (this.ani_isover) {
                this.ctrl.openFinishView(false, this.fight_type)
            }
        }.bind(this), 1)
        Utils.onTouchEnd(this.harm_btn, function () {
            if (this.data && Utils.next(this.data) != null) {
                this.ctrl.openBattleHarmInfoView(true, this.data);
            }
        }.bind(this), 1)
    },

    showProgressEffect: function () {
        var baseCurMaxExp = Config.role_data.data_role_attr[this.role_lv].exp_max;
        var basePercent = this.role_exp / baseCurMaxExp;
        var maxPercent = this.role_nowexp / baseCurMaxExp;
        if (this.role_lv != this.role_nowlv) {//有升级
            maxPercent = 1;
        }
        if (this.data.auto_num && this.data.auto_num > 0) {
            this.auto_combat_num_lb.node.active = true;
            this.auto_combat_num_lb.string = cc.js.formatStr(Utils.TI18N("已连续通过关卡数：%s"), this.data.auto_num);
        }

        this.progress_pb.progress = basePercent;
        this.proTxt_lb.string = cc.js.formatStr("%d/%d", Number(this.role_exp), Number(baseCurMaxExp));
        this.progress_bg_nd.active = true;

        var call_back = function () {
            basePercent = basePercent + 0.01;
            if (basePercent > maxPercent) {
                if (this.role_lv == this.role_nowlv) {
                    baseCurMaxExp = Config.role_data.data_role_attr[this.role_nowlv].exp_max;
                    basePercent = this.role_nowexp / baseCurMaxExp;
                    this.progress_pb.progress = basePercent;
                    this.proTxt_lb.string = cc.js.formatStr("%d/%d", this.role_nowexp, Number(baseCurMaxExp))
                    gcore.Timer.del("mvp_progress_timer");
                } else {
                    //播放升级特效
                    if (this.progressEffect == null) {
                        this.progressEffect = this.seekChild(this.sprite_4_nd, "effect", sp.Skeleton);
                        var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(275));
                        this.loadRes(res, function (res_object) {
                            this.progressEffect.skeletonData = res_object;
                            this.progressEffect.setAnimation(0, PlayerAction.action, false)
                        }.bind(this))
                    } else {
                        this.progressEffect.setAnimation(0, PlayerAction.action, false)
                    }
                    this.role_lv = this.role_lv + 1;
                    basePercent = 0;
                    maxPercent = 1;
                    baseCurMaxExp = Config.role_data.data_role_attr[this.role_lv].exp_max;
                    if (this.role_lv == this.role_nowlv) {
                        maxPercent = this.role_nowexp / Config.role_data.data_role_attr[this.role_nowlv].exp_max;
                    }
                }
            } else {
                this.progress_pb.progress = basePercent;
                this.proTxt_lb.string = cc.js.formatStr("%d/%d", Math.ceil(baseCurMaxExp * basePercent), Number(baseCurMaxExp))
            }
        }.bind(this)
        gcore.Timer.set(call_back, 10, -1, "mvp_progress_timer");
    },

    handleEffect: function (status) {
        if (status == false) {
            if (this.special_sk) {
                this.special_sk.setToSetupPose();
                this.special_sk.clearTracks();
                this.special_sk.node.active = false;
            }
            if (this.progressEffect) {
                this.progressEffect.setToSetupPose();
                this.progressEffect.clearTracks();
                this.progressEffect.node.active = false;
            }
        } else {
            if (this.special_sk) {
                this.special_sk.node.active = true;
                var res = cc.js.formatStr("spine/%s/action.atlas", PathTool.getEffectRes(274))
                this.loadRes(res, function (res_object) {
                    this.special_sk.skeletonData = res_object;
                    this.special_sk.setAnimation(1, PlayerAction.action_1, false)
                }.bind(this))
            }
        }
    },

    //奖励界面
    rewardViewUI: function () {
        if (!this.reward_list) return
        this.scroll_view.setData(this.reward_list, null, { is_show_name: true });

        Utils.delayRun(this.main_container, 0.5, function () {
            this.ani_isover = true;
            this.updateTimer();
        }.bind(this))
    },

    updateTimer: function () {
        this.time_label_rt.node.active = true;
        this.comfirm_btn.active = true;
        var time = 5;
        var call_back = function () {
            time = time - 1
            var new_time = Math.ceil(time);
            var str = new_time + Utils.TI18N("秒后关闭");
            if (this.time_label_rt) {
                this.time_label_rt.string = str;
            }
            if (new_time <= 0) {
                gcore.Timer.del("mvp_close_timer");
                this.ctrl.openFinishView(false, this.fight_type);
            }
        }.bind(this)
        gcore.Timer.set(call_back, 1000, -1, "mvp_close_timer");
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function () {
        Utils.playButtonSound("c_win");
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.root_wnd.stopAllActions();
        this.main_container.stopAllActions();

        gcore.Timer.del("mvp_close_timer");
        gcore.Timer.del("mvp_progress_timer");
        require("hero_controller").getInstance().openEquipTips(false)
        require("tips_controller").getInstance().closeAllTips();
        

        if (this.fight_type == BattleConst.Fight_Type.Darma) {
            gcore.GlobalEvent.fire(BattleEvent.MOVE_DRAMA_EVENT, this.fight_type);
        }
        this.handleEffect(false)
        if (this.model.getBattleScene() && this.ctrl.getIsSameBattleType(this.fight_type)) {
            this.model.result(this.data, null)
        }
        if (this.scroll_view) {
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }
        this.ctrl.openFinishView(false, this.fight_type)
        gcore.Timer.set(function() {
            gcore.GlobalEvent.fire(BattleEvent.CLOSE_RESULT_VIEW, this.fight_type);
        }.bind(this), 200, 1)
       
    },
})