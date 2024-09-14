// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-11 17:51:19
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool");
var ArenaEvent = require("arena_event");
var BaseRole = require("baserole");
var RoleController = require("role_controller");
var RoleEvent = require("role_event");
var MainUiController = require("mainui_controller");

var ArenaEEnterLoopPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_enter_loop_view");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
        this.startUpdate();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        //Utils.getNodeCompByPath("btn_container/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
        Utils.getNodeCompByPath("btn_container/enter_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("进入挑战");
        Utils.getNodeCompByPath("dec_container/label_1", this.root_wnd, cc.Label).string = Utils.TI18N("我的积分：");
        Utils.getNodeCompByPath("dec_container/label_2", this.root_wnd, cc.Label).string = Utils.TI18N("我的排名：");
        Utils.getNodeCompByPath("dec_container/label_3", this.root_wnd, cc.Label).string = Utils.TI18N("挑战券数：");
        Utils.getNodeCompByPath("dec_container/label_4", this.root_wnd, cc.Label).string = Utils.TI18N("赛季时间：");
        Utils.getNodeCompByPath("dec_container/label_5", this.root_wnd, cc.Label).string = Utils.TI18N("系统提示：");
        Utils.getNodeCompByPath("dec_container/label_value_5", this.root_wnd, cc.Label).string = Utils.TI18N("赛季结束时将通过邮件发放排名奖励");
        Utils.getNodeCompByPath("dec_container/label_ly/label_value_6", this.root_wnd, cc.Label).string = Utils.TI18N("（这里是温馨提示）");
        Utils.getNodeCompByPath("worship", this.root_wnd, cc.Label).string = Utils.TI18N("被膜拜次数：");
        Utils.getNodeCompByPath("rank_2/desc", this.root_wnd, cc.Label).string = Utils.TI18N("虚位以待");
        Utils.getNodeCompByPath("rank_3/desc", this.root_wnd, cc.Label).string = Utils.TI18N("虚位以待");
        Utils.getNodeCompByPath("rank_1/desc", this.root_wnd, cc.Label).string = Utils.TI18N("虚位以待");

        this.close_btn_nd = this.seekChild("close_btn");
        this.enter_btn_nd = this.seekChild("enter_btn");
        this.worship_num_lb = this.seekChild("worship_num", cc.Label);
        this.buy_btn_nd = this.seekChild("buy_btn");
        this.tips_btn_nd = this.seekChild("tips_btn");
        this.red_tips_nd = this.seekChild("tips");
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.loadRes(PathTool.getBattleSingleBg("10005"), function(res) {
            this.background.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this))

        this.value_labels = {};
        for (var value_i = 1; value_i <= 6; value_i++) {
            this.value_labels[value_i] = this.seekChild("label_value_" + value_i, cc.Label);
        }

        // 展示相关
        this.rank_infos = {};
        for (var rank_i = 1; rank_i <= 3; rank_i++) {
            var rank_info = this.rank_infos[rank_i] = {};
            var rank_nd = this.seekChild("rank_" + rank_i);
            rank_info["role_name_nd"] = rank_nd.getChildByName("role_name");
            rank_info["role_name_lb"] = this.seekChild(rank_nd, "role_name", cc.Label);
            // 模型
            var model_nd = rank_nd.getChildByName("model")
            rank_info["role_model"] = new BaseRole();
            rank_info["role_model"].setParent(model_nd);
            // 膜拜
            var worship_btn_nd = rank_nd.getChildByName("worship_btn");
            worship_btn_nd.rank_tag = rank_i;
            worship_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickWorshipBtn, this);
            rank_info["worship_lb"] = this.seekChild(worship_btn_nd, "label", cc.Label);
            rank_info["worship_btn"] = worship_btn_nd.getComponent(cc.Button);
            rank_info["finger_sp"] = this.seekChild(worship_btn_nd, "finger", cc.Sprite);
            rank_info["desc_nd"] = rank_nd.getChildByName("desc");
        }

        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.enter_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickEnterBtn, this);
        this.buy_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickByBtn, this);
        this.tips_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickTipBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.addGlobalEvent(ArenaEvent.UpdateLoopChallengeStatueList, function(rank_list) {
            if (rank_list)
                this.updateStatueInfo(rank_list);
        }.bind(this));

        this.addGlobalEvent(RoleEvent.WorshipOtherRole, function(data) {
            if (data)
                this.updateOtherWorship(data);
        }.bind(this));

        this.addGlobalEvent(ArenaEvent.UpdateArena_Number, function() {
            this.updateWidgets();
        }.bind(this));

        this.addGlobalEvent(ArenaEvent.UpdateMyLoopData, function() {
            this.updateWidgets();
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.ctrl.sender20220();
        this.updateWidgets();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        if (this.rank_infos) {
            for (let i in this.rank_infos) {
                this.rank_infos[i]["role_model"].deleteMe()
                this.rank_infos[i] = null;
            }
            this.rank_infos = null;
        }
    },

    onClickCloseBtn: function() {
        Utils.playButtonSound("c_close");
        this.ctrl.openArenaEnterWindow(false);
    },

    onClickEnterBtn: function() {
        this.ctrl.requestOpenArenaLoopMathWindow(true);
    },

    updateWidgets: function() {
        var loop_data = this.loop_data = this.model.getMyLoopData();
        var cup_cfg = this.cup_cfg = this.model.getZoneConfigBySoure();

        if (loop_data && cup_cfg) {
            this.value_labels[1].string = loop_data.score; // 积分

            var rank_value = loop_data.rank;
            if (rank_value === 0)
                rank_value = Utils.TI18N("千里之外");
            this.value_labels[2].string = rank_value; // 排名   

            var BackpackController = require("backpack_controller");
            var bag_model = BackpackController.getInstance().getModel();

            var item_id = Config.arena_data.data_const.arena_ticketcost.val[0][0];
            var item_num = bag_model.getBackPackItemNumByBid(item_id);
            // this.value_labels[3].string = loop_data.can_combat_num;        // 可挑战次数
            this.value_labels[3].string = item_num;

            var less_time = loop_data.end_time - gcore.SmartSocket.getTime();
            var star_time_str = TimeTool.getMD(loop_data.start_time);
            var end_time_str = TimeTool.getMD(loop_data.end_time);
            var less_time_str = TimeTool.GetTimeFormatTwo(less_time);

            this.value_labels[4].string = star_time_str + "-" + end_time_str; // 可挑战次数
            this.value_labels[6].string = "（" + less_time_str + "）";
        }

        // role_vo
        var role_vo = RoleController.getInstance().getRoleVo();
        this.worship_num_lb.string = role_vo.worship || 0;

        // 红点
        if (loop_data.can_combat_num > 0) {
            this.red_tips_nd.active = true;
        } else {
            this.red_tips_nd.active = false;
        }
    },

    updateStatueInfo: function(rank_list) {
        this.rank_list = rank_list;
        if (rank_list) {
            for (let i in this.rank_infos) {
                let statue = this.rank_infos[i]
                let data = rank_list[i - 1]
                if (data) {
                    statue["role_name_nd"].active = true;
                    statue["role_name_lb"].string = data.name;
                    statue["worship_btn"].node.active = true;
                    statue["worship_lb"].string = data.worship;
                    statue["role_model"].setData(BaseRole.type.role, data.lookid, PlayerAction.show, true, 0.72, { scale: 0.72 });
                    if (data.worship_status) {
                        statue["worship_btn"].interactable = false;
                        statue["finger_sp"].setState(cc.Sprite.State.GRAY);
                    } else {
                        statue["worship_btn"].interactable = true;
                        statue["finger_sp"].setState(cc.Sprite.State.NORMAL);
                    }
                } else {
                    statue["role_name_nd"].active = false
                    statue["desc_nd"].active = true;
                    statue["worship_btn"].node.active = false;
                }
            }
            // for (var role_i=0;role_i < rank_list.length;++rank_list) {
            //     var role_info = rank_list[role_i];
            //     var rank_info = this.rank_infos[role_info.rank];
            //     rank_info["role_name_nd"].active = true;
            //     rank_info["role_name_lb"].string = role_info.name;
            //     rank_info["worship_lb"].string   = role_info.worship;
            //     rank_info["role_model"].setData(BaseRole.type.role, role_info.lookid, PlayerAction.show, true, 0.72);

            //     if (role_info.worship_status) {
            //         rank_info["worship_btn"].interactable = false;
            //         rank_info["finger_sp"].setState(cc.Sprite.State.GRAY);
            //     } else {
            //         rank_info["worship_btn"].interactable = true;
            //         rank_info["finger_sp"].setState(cc.Sprite.State.NORMAL);
            //     }
            // }
        }
    },

    onClickWorshipBtn: function(event) {
        var item_rank = event.target.rank_tag;
        var role_info = null;
        for (var role_i in this.rank_list) {
            if (this.rank_list[role_i].rank === item_rank) {
                role_info = this.rank_list[role_i];
                break;
            }
        }

        RoleController.getInstance().sender10316(role_info.rid, role_info.srv_id, role_info.rank);
    },

    updateOtherWorship: function(data) {
        var item_rank = data.idx;
        for (var role_i in this.rank_list) {
            if (this.rank_list[role_i].rank == item_rank) {
                this.rank_list[role_i].worship += 1;
                this.rank_list[role_i].worship_status = 1;
                this.updateStatueInfo(this.rank_list);
                break;
            }
        }
    },

    onClickByBtn: function() {
        this.ctrl.openArenaLoopChallengeBuy(true);
    },

    onClickTipBtn: function() {
        MainUiController.getInstance().openCommonExplainView(true, Config.arena_data.data_explain);
    },
})