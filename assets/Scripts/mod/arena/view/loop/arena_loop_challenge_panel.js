// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 21:31:45
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool");
var ArenaEvent = require("arena_event");
var CommonScrollView = require("common_scrollview");
var ChallengeItem = require("arena_loop_challenge_item");

var Arena_loop_challengePanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_loop_challenge_panel");
        this.rleasePrefab = false;

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        this.startUpdate();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        this.is_ref_status = true; // 是否显示刷新按钮
        this.is_finish_awards = false; // 奖励item初始化

        var BackpackController = require("backpack_controller");
        this.bag_model = BackpackController.getInstance().getModel();
        this.item_eff = { "1": 109, "2": 109, "3": 108, "4": 108, "5": 110, "6": 110, "7": 110 };
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("protect_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("防守阵容");
        Utils.getNodeCompByPath("refresh_btn/ref_title", this.root_wnd, cc.Label).string = Utils.TI18N("刷新");
        Utils.getNodeCompByPath("my_log_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("挑战记录");
        Utils.getNodeCompByPath("Sprite_6/Text_5", this.root_wnd, cc.Label).string = Utils.TI18N("每周宝箱");
        Utils.getNodeCompByPath("challenge_shop/label", this.root_wnd, cc.Label).string = Utils.TI18N("竞技商店");
        Utils.getNodeCompByPath("score_container/title", this.root_wnd, cc.Label).string = Utils.TI18N("积分：");
        Utils.getNodeCompByPath("score_container/rank_title", this.root_wnd, cc.Label).string = Utils.TI18N("排名:");
        Utils.getNodeCompByPath("score_container/time_label_0", this.root_wnd, cc.Label).string = Utils.TI18N("距离结束:");

        this.list_container_nd = this.seekChild("list_container");

        // Info
        this.rank_num_lb = this.seekChild("rank_num", cc.Label);
        this.score_num_lb = this.seekChild("score_num", cc.Label);
        this.text_add_time_lb = this.seekChild("text_add_time", cc.Label);
        this.time_label_lb = this.seekChild("time_label", cc.Label);
        this.times_item_sp = this.seekChild("times_item", cc.Sprite);

        // Time
        this.ref_time_lb = this.seekChild("ref_time", cc.Label);
        this.ref_time_nd = this.seekChild("ref_time");
        this.ref_title_nd = this.seekChild("ref_title");
        this.refresh_btn = this.seekChild("refresh_btn", cc.Button);
        this.box_bar_nd = this.seekChild("box_bar", cc.ProgressBar);

        this.addtimes_btn_nd = this.seekChild("addtimes_btn");
        this.protect_btn_nd = this.seekChild("protect_btn");
        this.refresh_btn_nd = this.seekChild("refresh_btn");
        this.my_log_btn_nd = this.seekChild("my_log_btn");

        // 奖励
        this.change_num_lb = this.seekChild("change_num", cc.Label);
        this.tip_panel_nd = this.seekChild("tip_panel");
        this.tip_con_nd = this.seekChild("tip_con");
        this.iten_con_nd = this.seekChild("iten_con");
        this.item_num_lb = this.seekChild("item_num", cc.Label);

        // 商店
        this.challenge_shop_nd = this.seekChild("challenge_shop");
        this.log_red_tips = this.seekChild("tips");

        this.award_item = ItemsPool.getInstance().getItem("backpack_item");
        this.award_item.setParent(this.iten_con_nd);
        this.award_item.setExtendData({ scale: 0.8 });
        this.award_item.show();

        this.protect_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickProtectBtn, this);
        this.refresh_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickRefreshBtn, this);
        this.my_log_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickMyLogBtn, this);
        this.addtimes_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickAddBtn, this);
        this.tip_panel_nd.on(cc.Node.EventType.TOUCH_END, this.onClickTipPanel, this);
        this.challenge_shop_nd.on(cc.Node.EventType.TOUCH_END, this.onClickShopBtn, this);

        this.times_awards = {};
        this.bool_box_status = {}; // 1 未领取 2 可领取 3 已经领取
        for (var award_i = 1; award_i <= 7; award_i++) {
            this.times_awards[award_i] = {};
            var award_btn_nd = this.seekChild("box_btn" + award_i);
            award_btn_nd.award_tag = award_i;
            award_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickAwardItem, this);
            var award_nd = this.seekChild("box_" + award_i);
            this.times_awards[award_i]["btn_nd"] = award_btn_nd;
            this.times_awards[award_i]["root_nd"] = award_nd;
            this.times_awards[award_i]["num_lb"] = this.seekChild(award_nd, "num", cc.Label);
            this.times_awards[award_i]["item_sk"] = award_nd.getComponent(sp.Skeleton);
            this.bool_box_status[award_i] = 1;
        }

        this.initTimeAwards();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.addGlobalEvent(ArenaEvent.UpdateLoopChallengeList, function() {
            this.updateChallengeList();
        }.bind(this));

        this.addGlobalEvent(ArenaEvent.UpdateLoopChallengeTimesList, function(data) {
            if (this.is_finish_awards)
                this.updateTimesAwards();
        }.bind(this));

        this.addGlobalEvent(ArenaEvent.UpdateArena_Number, function() {
            this.updageWidgets();
        }.bind(this));

        this.addGlobalEvent(ArenaEvent.UpdateArenaRedStatus, function() {
            this.updateLogRedStatus();
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        // 请求挑战队列
        // this.ctrl.sender20208();     // 挑战次数奖励信息
        this.ctrl.sender20201(); // 挑战列表
        this.initChallenteList();
        this.updageWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        if (this.challenge_sv) {
            this.challenge_sv.deleteMe()
            this.challenge_sv = null;
        }
        if (this.award_item) {
            this.award_item.deleteMe()
            this.award_item = null;
        }
        var GuideEvent = require("guide_event");
        gcore.GlobalEvent.fire(GuideEvent.CloseTaskEffect);
    },

    updageWidgets: function() {
        if (!this.root_wnd) return;
        var loop_data = this.loop_data = this.model.getMyLoopData();
        if (!this.loop_data) return;


        this.rank_num_lb.string = loop_data.rank + "名";
        this.score_num_lb.string = loop_data.score;

        // 剩余挑战次数
        var item_id = Config.arena_data.data_const.arena_ticketcost.val[0][0];
        var item_num = this.bag_model.getBackPackItemNumByBid(item_id);
        this.has_num = loop_data.can_combat_num + item_num;
        // this.text_add_time_lb.string = this.has_num;
        this.text_add_time_lb.string = item_num;
        // 免费挑战次数
        this.free_num = loop_data.can_combat_num;

        if (!this.times_item_sp.spriteFrame) {
            var item_config = gdata("item_data", "data_unit1", item_id, false);
            var item_path = PathTool.getIconPath("item", item_config.icon);
            this.loadRes(item_path, function(item_sf) {
                this.times_item_sp.spriteFrame = item_sf;
            }.bind(this));
        }

        // 挑战结束时间
        var less_time = this.less_time = loop_data.end_time - gcore.SmartSocket.getTime();
        var less_time_str = TimeTool.getTimeFormat(less_time);

        // 刷新时间
        var refresh_time = this.refresh_time = loop_data.ref_time - gcore.SmartSocket.getTime();

        // 宝箱
        this.updateChallengeList();

        this.updateLogRedStatus();
    },

    onClickProtectBtn: function() {
        var PatrnerConst = require("partner_const");
        var HeroConst = require("hero_const");
        var hero_ctr = require("hero_controller").getInstance();
        hero_ctr.openFormGoFightPanel(true, PatrnerConst.Fun_Form.Arena, null, HeroConst.FormShowType.eFormSave);
    },

    onClickRefreshBtn: function() {
        this.ctrl.sender20206();
    },

    onClickMyLogBtn: function() {
        this.ctrl.openArenaLoopMyLogWindow(true);
    },

    update: function(dt) {
        if (this.less_time > 0) {
            this.less_time -= dt;
            var less_time_str = TimeTool.getTimeFormat(Math.ceil(this.less_time));
            if (this.time_label_lb.string !== less_time_str)
                this.time_label_lb.string = less_time_str;
        } else {

        }

        if (this.refresh_time > 0) {
            this.refresh_time -= dt;
            var refresh_time_str = TimeTool.getTimeFormat(Math.ceil(this.refresh_time));
            if (this.ref_time_lb.string !== refresh_time_str)
                this.ref_time_lb.string = refresh_time_str;

            if (this.is_ref_status) {
                this.is_ref_status = false;
                this.updateRefTimeStatus(false);
            }
        } else {
            if (!this.is_ref_status) {
                this.is_ref_status = true;
                this.updateRefTimeStatus(true)
            }
        }
    },

    updateRefTimeStatus: function(status) {
        if (status) {
            this.ref_title_nd.active = true;
            this.ref_time_nd.active = false;
            this.refresh_btn.interactable = true;
        } else {
            this.ref_title_nd.active = false;
            this.ref_time_nd.active = true;
            this.refresh_btn.interactable = false;
        }
    },

    initTimeAwards: function() {
        this.finis_award = 0;
        var award_cfg = this.award_cfg = Config.arena_data.data_season_num_reward;
        if (!award_cfg) return;

        var award_index = 1;
        for (var cfg_item_i in award_cfg) {
            var cfg_item = award_cfg[cfg_item_i];
            this.times_awards[award_index]["num_lb"].string = cfg_item.num;
            var effect_res = PathTool.getEffectRes(this.item_eff[award_index]);
            var effect_path = PathTool.getSpinePath(effect_res);
            this.loadRes(effect_path, function(award_index, item_sd) {
                this.times_awards[award_index]["item_sk"].skeletonData = item_sd;
                this.times_awards[award_index]["item_sk"].setAnimation(0, "action1", true);
                this.finis_award++;
                if (this.finis_award == 7) {
                    this.is_finish_awards = true;
                    this.updateTimesAwards();
                    this.finis_award = 0;
                }
            }.bind(this, award_index))

            award_index++;
        }
    },

    // 更新周挑战奖励
    updateTimesAwards: function() {
        var times_awards_data = this.times_awards_data = this.model.getChallengeTimesAwards();

        if (!times_awards_data) return;
        var times_str = cc.js.formatStr(Utils.TI18N("(挑战%s次)"), times_awards_data.had_combat_num);
        this.change_num_lb.string = times_str;
        var progress_num = 0 //times_awards_data.had_combat_num / 120;
        if (times_awards_data.had_combat_num >= 120) {
            progress_num = 1
        } else {
            var distance = 0
            var average = 1 / this.award_cfg.length
            for (let i = 0; i < this.award_cfg.length; ++i) {
                let v = this.award_cfg[i]
                if (times_awards_data.had_combat_num < v.num) {
                    let surplus = times_awards_data.had_combat_num - distance
                    let num = v.num - distance;
                    progress_num += (surplus / num * average)
                    break
                } else {
                    distance = v.num
                    progress_num += average
                }
            }
        }

        this.box_bar_nd.progress = progress_num;

        for (var award_i in this.bool_box_status) {
            var cfg_item = this.award_cfg[award_i - 1];
            if (times_awards_data.had_combat_num >= cfg_item.num) {
                this.bool_box_status[award_i] = 2;
                var had_gets = times_awards_data.num_list;
                for (var have_i in had_gets) {
                    if (had_gets[have_i].num == cfg_item.num) {
                        this.bool_box_status[award_i] = 3;
                        break;
                    }
                }
            } else {
                this.bool_box_status[award_i] = 1;
            }
        }

        // 设置按钮状态
        for (var btn_i in this.bool_box_status) {
            var action_name = "action1";
            if (this.bool_box_status[btn_i] == 2) {
                action_name = "action2";
            } else if (this.bool_box_status[btn_i] == 3) {
                action_name = "action3";
            }
            this.times_awards[btn_i]["item_sk"].setAnimation(0, action_name, true);
        }
    },

    onClickAwardItem: function(event) {
        var award_index = event.target.award_tag;
        if (this.bool_box_status[award_index] == 2) {
            this.ctrl.sender20209(this.award_cfg[award_index - 1].num);
        } else if (this.bool_box_status[award_index] == 1) {
            this.showRewardItems(award_index);
        }
    },

    showRewardItems: function(award_index) {
        this.tip_panel_nd.active = true;
        this.tip_con_nd.x = this.times_awards[award_index]["btn_nd"].x;

        var item_id = this.award_cfg[award_index - 1].items[0][0];
        this.award_item.setData(item_id);
        var item_num = this.award_cfg[award_index - 1].items[0][1];
        this.item_num_lb.string = "×" + item_num;
    },

    initChallenteList: function() {
        var scorll_size = this.list_container_nd.getContentSize();
        var size = cc.size(scorll_size.width, scorll_size.height);
        var setting = {
            item_class: ChallengeItem,
            start_x: 0,
            space_x: 0,
            start_y: 10,
            space_y: 10,
            item_width: 614,
            item_height: 132,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        this.challenge_sv = new CommonScrollView();
        this.challenge_sv.createScroll(this.list_container_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, size, setting, cc.v2(0, 0.5));
    },

    // 更新挑战列表
    updateChallengeList: function() {
        var challenge_list = this.model.getLoopChallengeList();
        this.challenge_sv.setData(challenge_list, this.onClickHeroExhibiton.bind(this), { has_num: this.has_num, free_num: this.free_num });
    },

    onClickHeroExhibiton: function() {

    },

    onClickAddBtn: function() {
        this.ctrl.openArenaLoopChallengeBuy(true);
    },

    onClickTipPanel: function() {
        if (this.tip_panel_nd.active)
            this.tip_panel_nd.active = false;
    },

    onClickShopBtn: function() {
        var MallConst = require("mall_const");
        var MallController = require("mall_controller");
        MallController.getInstance().openMallPanel(true, MallConst.MallType.ArenaShop);
    },

    updatePanelInfo: function() {
        this.updageWidgets();
    },

    updateLogRedStatus: function() {
        var log_red_status = this.model.getArenaLoopLogStatus();
        if (log_red_status) {
            this.log_red_tips.active = true;
        } else {
            this.log_red_tips.active = false;
        }
    },
})