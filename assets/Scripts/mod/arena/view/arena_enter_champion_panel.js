// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-11 17:51:59
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool");
var ArenaEvent = require("arena_event");
var BaseRole = require("baserole");
var ArenaConst = require("arena_const");
var RoleController = require("role_controller");
var RoleEvent = require("role_event");
var HeroController = require("hero_controller")
var PatrnerConst = require("partner_const");
var HeroConst = require("hero_const");

var ArenaEnterChampionPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("arena", "arena_enter_champion_view");

        this.ctrl = arguments[0];
        this.model = this.ctrl.getChamPionModel();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {
        this.honor_list = { "1": "battle_champion", "2": "battle_secondplace", "3": "battle_thirdplace" };
        this.const_cfg = Config.arena_champion_data.data_const;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        Utils.getNodeCompByPath("worship", this.root_wnd, cc.Label).string = Utils.TI18N("被膜拜次数：");
        Utils.getNodeCompByPath("dec_container/label_1", this.root_wnd, cc.Label).string = Utils.TI18N("当前赛程：");
        Utils.getNodeCompByPath("dec_container/label_2", this.root_wnd, cc.Label).string = Utils.TI18N("当前排名：");
        Utils.getNodeCompByPath("dec_container/label_3", this.root_wnd, cc.Label).string = Utils.TI18N("历史最高排名：");
        Utils.getNodeCompByPath("dec_container/label_4", this.root_wnd, cc.Label).string = Utils.TI18N("赛季时间：");
        Utils.getNodeCompByPath("dec_container/label_5", this.root_wnd, cc.Label).string = Utils.TI18N("系统提示：");
        Utils.getNodeCompByPath("dec_container/label_value_5", this.root_wnd, cc.Label).string = Utils.TI18N("赛季结束时将通过邮件发放排名奖励");
        Utils.getNodeCompByPath("dec_container/label_ly/label_value_6", this.root_wnd, cc.Label).string = Utils.TI18N("（这里是温馨提示）");
        //Utils.getNodeCompByPath("btn_container/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
        Utils.getNodeCompByPath("btn_container/fight_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("我的布阵");
        Utils.getNodeCompByPath("btn_container/enter_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("进入挑战");

        this.close_btn_nd = this.seekChild("close_btn");
        this.enter_btn_nd = this.seekChild("enter_btn");
        this.rank_btn_nd = this.seekChild("rank_btn");
        this.fight_btn_nd = this.seekChild("fight_btn");
        this.champion_step_rt = this.seekChild("label_value_1", cc.RichText);
        this.worship_num_lb = this.seekChild("worship_num", cc.Label);
        this.tips_btn_nd = this.seekChild("tips_btn");
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        this.loadRes(PathTool.getBattleSingleBg("10005"), function(res) {
            this.background.getComponent(cc.Sprite).spriteFrame = res
        }.bind(this))
        this.value_labels = {};
        for (var value_i = 2; value_i <= 6; value_i++) {
            this.value_labels[value_i] = this.seekChild("label_value_" + value_i, cc.Label);
        }

        // 展示相关
        this.rank_infos = {};
        for (var rank_i = 1; rank_i <= 3; rank_i++) {
            var rank_info = this.rank_infos[rank_i] = {};
            var rank_nd = this.seekChild("rank_" + rank_i);
            // info
            rank_info["role_name_nd"] = rank_nd.getChildByName("role_name");
            rank_info["role_name_lb"] = this.seekChild(rank_nd, "role_name", cc.Label);
            rank_info["honor_nd"] = rank_nd.getChildByName("honor");
            rank_info["honor_sp"] = this.seekChild(rank_nd, "honor", cc.Sprite);
            rank_info["desc_nd"] = rank_nd.getChildByName("desc");
            rank_info["desc_lb"] = this.seekChild(rank_nd, "desc", cc.Label);
            rank_info["desc_lb"].string = Utils.TI18N("虚位以待");
            // 模型
            var model_nd = rank_nd.getChildByName("model");
            rank_info["role_model"] = new BaseRole();
            rank_info["role_model"].setParent(model_nd);
            // 膜拜
            var worship_btn_nd = rank_nd.getChildByName("worship_btn");
            rank_info["worship_btn_nd"] = worship_btn_nd;
            worship_btn_nd.rank_tag = rank_i;
            rank_info["worship_lb"] = this.seekChild(worship_btn_nd, "label", cc.Label);
            worship_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickWorshipBtn, this);
            rank_info["worship_btn"] = worship_btn_nd.getComponent(cc.Button);
            rank_info["finger_sp"] = this.seekChild(worship_btn_nd, "finger", cc.Sprite);
        }

        this.close_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickCloseBtn, this);
        this.enter_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickEnterBtn, this);
        this.rank_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickRankBtn, this);
        this.tips_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickTipBtn, this);
        this.fight_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickFightBtn, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.addGlobalEvent(ArenaEvent.UpdateChampionTop3Event, function(rank_list) { // 排名信息
            if (rank_list)
                this.updateStatueInfo(rank_list);
        }.bind(this));

        this.addGlobalEvent(ArenaEvent.UpdateChampionBaseInfoEvent, function(base_info) { // 冠军赛基础信息
            if (base_info)
                this.updateBaseInfo();
        }.bind(this));

        this.addGlobalEvent(ArenaEvent.UpdateChampionRoleInfoEvent, function(role_info) { // 冠军赛个人信息
            if (role_info)
                this.updateRoleInfo();
        }.bind(this));

        this.addGlobalEvent(RoleEvent.WorshipOtherRole, function(data) {
            if (data)
                this.updateOtherWorship(data);
        }.bind(this));
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {
        this.ctrl.sender20280();
        this.updateBaseInfo();
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {
        for (let i in this.rank_infos) {
            if (this.rank_infos[i].role_model) {
                this.rank_infos[i].role_model.deleteMe();
                this.rank_infos[i].role_model = null;
            }
        }
        this.rank_infos = null;
    },

    // 更新冠军赛基础信息
    updateBaseInfo: function() {
        var base_info = this.base_info = this.model.getBaseInfo();
        var role_info = this.role_info = this.model.getRoleInfo();

        var normal_rt = 　"<outline=1 color=#000000>%s</outline><outline=1 color=#000000><color=#4af915>%s</color></outline>"
        var noopen_rich = 　"<outline=1 color=#000000>%s</outline>"

        var status_str = "";
        if (base_info.step == ArenaConst.champion_step.unopened) { // 未开启
            status_str = cc.js.formatStr(noopen_rich, Utils.TI18N("暂未开启"));
        } else if (base_info.step == ArenaConst.champion_step.score) { // 选拔赛
            if (base_info.step_status == ArenaConst.champion_step_status.unopened) { // 未开始
                status_str = cc.js.formatStr(noopen_rich, Utils.TI18N("选拔赛"), Utils.TI18N("暂未开启"));
            } else { // 进行中
                status_str = cc.js.formatStr(noopen_rich, Utils.TI18N("选拔赛"), Utils.TI18N("正式进行"));
            }
        } else if (base_info.step == ArenaConst.champion_step.match_32) { // 32强
            if (base_info.step_status == ArenaConst.champion_step_status.unopened) { // 未开始
                status_str = cc.js.formatStr(noopen_rich, Utils.TI18N("32强赛"), Utils.TI18N("暂未开启"));
            } else { // 进行中
                status_str = cc.js.formatStr(noopen_rich, Utils.TI18N("32强赛"), Utils.TI18N("正式进行"));
            }
        } else if (base_info.step == ArenaConst.champion_step.match_4) { // 4强
            if (base_info.step_status == ArenaConst.champion_step_status.over) { // 已经结束
                status_str = cc.js.formatStr(noopen_rich, Utils.TI18N("冠军赛已结束"));
            } else { //　正在进行
                status_str = cc.js.formatStr(noopen_rich, Utils.TI18N("4强赛"), Utils.TI18N("正式进行"));
            }
        }
        this.champion_step_rt.string = status_str;

        if (role_info.rank === 0) {
            this.value_labels[2].string = Utils.TI18N("未上榜");
        } else {
            this.value_labels[2].string = role_info.rank;
        }

        if (role_info.best_rank === 0) {
            this.value_labels[3].string = Utils.TI18N("未上榜");
        } else {
            this.value_labels[3].string = role_info.best_rank;
        }


        var less_time = this.less_time = base_info.step_status_time - gcore.SmartSocket.getTime();
        if (less_time < 0) {
            less_time = 0;
            if (this.update_timer) {
                this.stopUpdate();
                this.update_timer = null;
            }
        } else {
            if (!this.update_timer)
                this.update_timer = this.startUpdate();
        }



        var star_time_str = TimeTool.getMD(base_info.start_time);
        var end_time_str = TimeTool.getMD(base_info.end_time);
        var less_time_str = TimeTool.GetTimeFormatTwo(less_time);

        this.value_labels[4].string = star_time_str + "-" + end_time_str; // 可挑战次数
        this.value_labels[6].string = "（" + "残り時間：" + less_time_str + "）";

        var role_vo = RoleController.getInstance().getRoleVo();

        this.worship_num_lb.string = role_vo.worship || 0;
    },

    // 更新冠军赛个人信息
    updateRoleInfo: function() {

    },

    // 更新排名信息
    updateStatueInfo: function(rank_list) {
        this.rank_list = rank_list;
        if (rank_list) {
            for (var i in this.rank_infos) {
                let rank_info = this.rank_infos[i]
                var data = rank_list[i - 1];
                // var rank_info = this.rank_infos[role_info.rank];
                if (!data) {
                    rank_info["role_name_nd"].active = false;
                    rank_info["desc_nd"].active = true;
                    rank_info["honor_nd"].active = false;
                    rank_info["worship_btn_nd"].active = false;
                    continue;
                }

                rank_info["worship_btn_nd"].active = true;
                rank_info["desc_nd"].active = false;
                rank_info["role_name_nd"].active = true;
                rank_info["honor_nd"].active = true;
                cc.log(rank_info["role_name_lb"])
                rank_info["role_name_lb"].string = data.name;
                rank_info["worship_lb"].string = data.worship;
                rank_info["role_model"].setData(BaseRole.type.role, data.lookid, PlayerAction.show, true, 0.72, { scale: 0.72 });

                if (data.worship_status) {
                    rank_info["worship_btn"].interactable = false;
                    rank_info["finger_sp"].setState(cc.Sprite.State.GRAY);
                } else {
                    rank_info["worship_btn"].interactable = true;
                    rank_info["finger_sp"].setState(cc.Sprite.State.NORMAL);
                }
                // 称号
                var consr_cfg_item = this.const_cfg[this.honor_list[data.rank]];
                var honor_cfg_item = Config.honor_data.data_title[consr_cfg_item.val];
                var res_path = PathTool.getIconPath("honor", "txt_cn_honor_" + honor_cfg_item.res_id);
                this.loadRes(res_path, function(honor_sp, honor_sf) {
                    honor_sp.spriteFrame = honor_sf;
                }.bind(this, rank_info["honor_sp"]))
            }
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

    onClickCloseBtn: function() {
        this.ctrl.openArenaEnterWindow(false);
    },

    onClickEnterBtn: function() {
        this.ctrl.openArenaChampionMatchWindow(true);
    },

    onClickRankBtn: function() {
        this.ctrl.openArenaChampionRankWindow(true);
    },

    onClickFightBtn: function() {
        HeroController.getInstance().openFormGoFightPanel(true, PatrnerConst.Fun_Form.ArenaChampion, null, HeroConst.FormShowType.eFormSave);
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

    onClickTipBtn: function() {
        var MainUiController = require("mainui_controller");
        MainUiController.getInstance().openCommonExplainView(true, Config.arena_champion_data.data_explain);
    },

    update: function(dt) {
        if (this.less_time > 0) {
            this.less_time -= dt;
        } else {
            this.less_time = 0;
            this.stopUpdate();
            this.update_timer = null;
        }

        var time_str = TimeTool.GetTimeFormatTwo(Math.ceil(this.less_time));
        var final_str = "(" + cc.js.formatStr(Utils.TI18N("残り時間："), time_str) + ")";
        if (final_str != this.value_labels[6].string)
            this.value_labels[6].string = final_str;
    },

})