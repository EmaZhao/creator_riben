// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会捐献面板
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");
var GuildConst = require("guild_const");
var CommonScrollView = require("common_scrollview");
var RoleController = require("role_controller");
var GuildEvent = require("guild_event");
var GuildDonateItem = require("guild_donate_item");

var GuildDonateWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_donate_window");
        this.win_type = WinType.Big;
        this.viewTag = SCENE_TAG.dialogue; 
        this.ctrl = GuildController.getInstance();
        this.model = this.ctrl.getModel();
        this.role_vo = RoleController.getInstance().getRoleVo();
        this.awards_list = {};
    },


    openCallBack: function () {
        this.main_panel = this.seekChild("main_panel");
        this.close_btn = this.seekChild(this.main_panel, "close_btn");
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        this.donate_container = this.seekChild("donate_container");
        this.progress_bar = this.seekChild("progress_bar", cc.ProgressBar);
        this.lev_title = this.seekChild("lev_title", cc.Label);
        this.exp_value = this.seekChild("exp_value", cc.Label);
        this.explain_btn = this.seekChild("explain_btn");
        this.total_width = this.progress_bar.node.getContentSize().width;
        this.start_x = 206-32;

        var config = Config.guild_data.data_const.day_exp_max;
        if (config) {
            for (var i in Config.guild_data.data_donate_box) {
                var v = gdata("guild_data", "data_donate_box", [i]);
                var awards = this.seekChild(cc.js.formatStr("awards_%s", Number(i)));
                awards.active = true;
                var container = awards.getChildByName("container");
                var skeleton = container.getComponent(sp.Skeleton);
                var value = awards.getChildByName("value").getComponent(cc.Label);
                value.string = v.box_val;
                var percent = v.box_val / config.val;
                awards.setPosition(this.start_x + this.total_width * percent, 270);
                var object = {};
                object.item = awards;
                object.container = container;
                object.status = GuildConst.status.normal;
                object.id = i;
                object.config = v;
                object.skeleton = skeleton;
                object.is_show_tips = true;
                this.awards_list[i] = object;
            }
        }

        this.desc = this.seekChild("desc", cc.RichText);
        var size = this.donate_container.getContentSize();
        var list_size = cc.size(size.width, size.height - 10);
        var setting = {
            item_class: GuildDonateItem,      // 单元类
            start_x: 4,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: -1,                   // y方向的间隔
            item_width: 614,               // 单元的尺寸width
            item_height: 187,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.scroll_view = new CommonScrollView()
        this.scroll_view.createScroll(this.donate_container, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5))

        Utils.getNodeCompByPath("main_panel/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("捐献");
        Utils.getNodeCompByPath("day_exp", this.root_wnd, cc.Label).string = Utils.TI18N("今日统计：");
        Utils.getNodeCompByPath("next_lev_title", this.root_wnd, cc.Label).string = Utils.TI18N("下一级：");
        Utils.getNodeCompByPath("notice", this.root_wnd, cc.Label).string = Utils.TI18N("每种捐献,每天只能捐献1次,每天5点重置");
    },



    registerEvent: function () {
        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            var config = Config.guild_data.data_const.game_rule1;
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(config.desc, pos);
        }, this)
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound("c_close");
            this.ctrl.openGuildDonateWindow(false);
        }, this)
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.openGuildDonateWindow(false);
        }, this)

        for (var i in this.awards_list) {
            const object = this.awards_list[i];
            object.item.on(cc.Node.EventType.TOUCH_END, function () {
                if (object.config) {
                    if (object.is_show_tips == true) {
                        var CommonAlert = require("commonalert");
                        CommonAlert.showItemApply(Utils.TI18N("当前捐献活跃度奖励"), object.config.rewards, null, Utils.TI18N("确定"), null, null, Utils.TI18N("奖励"), null, null, true)
                    } else {
                        this.ctrl.requestDonateBoxRewards(object.id);
                    }
                }
            }, this)
        }

        if (this.my_guild_info == null) {
            this.my_guild_info = this.model.getMyGuildInfo();
            this.addGlobalEvent(GuildEvent.UpdateMyInfoEvent, function (key, value) {
                if (key == "lev")
                    this.updateMyGuildLev();
            }, this)
        }

        this.addGlobalEvent(GuildEvent.UpdateDonateInfo, function () {
            this.updateDonateListStatus();
        }, this)


        this.addGlobalEvent(GuildEvent.UpdateDonateBoxStatus, function (id) {
            if (id != null) {
                var object = this.awards_list[id];
                if (object) {
                    object.is_show_tips = true;
                    object.status = GuildConst.status.finish;
                    if (object.skeleton) {
                        object.skeleton.setToSetupPose();
                        object.skeleton.clearTracks();
                        object.skeleton.setAnimation(0, PlayerAction.action_3, true);
                    }
                }
            } else
                this.updateDonateBoxList();
        }, this)
    },

    openRootWnd: function () {
        var config_list = Config.guild_data.data_donate;
        var list = [];
        for (var i in config_list) {
            list.push(config_list[i]);
        }
        this.scroll_view.setData(list);
        this.updateDonateBoxList();
        this.updateMyGuildLev();
    },

    //更新活跃度宝箱
    updateDonateBoxList: function () {
        var activity_value = this.model.getDonateActivityValue();
        this.exp_value.string = activity_value;
        var config = gdata("guild_data", "data_const", "day_exp_max");
        if (config == null)
            return
        this.progress_bar.progress = activity_value / config.val;

        for (var i in this.awards_list) {
            var object = this.awards_list[i];
            var config = object.config;
            var box_status = this.model.getDonateBoxStatus(object.id);
            var tmp_status = GuildConst.status.normal;
            if (box_status == true)
                tmp_status = GuildConst.status.finish;
            else {
                if (activity_value >= object.config.box_val)
                    tmp_status = GuildConst.status.activity;
                else
                    tmp_status = GuildConst.status.un_activity;
            }

            var box_action = PlayerAction.action_1;
            if (tmp_status == GuildConst.status.finish)
                box_action = PlayerAction.action_3;
            else if (tmp_status == GuildConst.status.activity)
                box_action = PlayerAction.action_2;

            if (tmp_status == GuildConst.status.activity)
                object.is_show_tips = false;
            else
                object.is_show_tips = true;

            if (object.skeleton.skeletonData) {
                if (tmp_status != object.status) {
                    object.status = tmp_status;
                    object.skeleton.setAnimation(0, box_action, true);
                }
            } else {
                var res_id = PathTool.getEffectRes(object.config.effect_id)
                var path = cc.js.formatStr("spine/%s/action.atlas", res_id)
                var _skeleton = object.skeleton
                this.createEffect(_skeleton, path, box_action);
            }
        }
    },

    //生成宝箱
    createEffect(_skeleton, path, box_action) {
        this.loadRes(path, (function (res) {
            _skeleton.skeletonData = res;
            _skeleton.setAnimation(0, box_action, true);
        }).bind(this))
    },

    //设置等级相关
    updateMyGuildLev: function () {
        if (this.my_guild_info == null)
            return
        this.lev_title.string = cc.js.formatStr(Utils.TI18N("公会等级：%s级"), this.my_guild_info.lev);

        var next_lv = this.my_guild_info.lev + 1;
        var config = gdata("guild_data", "data_guild_lev", [next_lv]);
        if (config == null)
            this.desc.string = Utils.TI18N("当前已达最大值！");
        else
            this.desc.string = StringUtil.parse(config.desc);
    },

    updateDonateListStatus: function () {
        var item_list = this.scroll_view.getItemList();
        if (item_list) {
            for (var k in item_list) {
                var v = item_list[k];
                if (v.updateDonateStatus)
                    v.updateDonateStatus();
            }
        }
    },

    closeCallBack: function () {
        this.ctrl.openGuildDonateWindow(false);
        if (this.scroll_view){
            this.scroll_view.DeleteMe()
        }
        this.scroll_view = null
    }

});

module.exports = GuildDonateWindow;