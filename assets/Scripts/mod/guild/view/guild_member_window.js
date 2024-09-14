// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      公会成员窗体
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");
var GuildConst = require("guild_const");
var CommonScrollView = require("common_scrollview");
var RoleController = require("role_controller");
var GuildMemberItem = require("guild_member_item");
var GuildEvent = require("guild_event");
var RoleEvent = require("role_event");

var GuildMemberWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_member_window");
        this.win_type = WinType.Mini;
        this.viewTag = SCENE_TAG.dialogue;
        this.ctrl = GuildController.getInstance();
        this.model = this.ctrl.getModel();
        this.my_guild_info = this.model.getMyGuildInfo();
        this.role_vo = RoleController.getInstance().getRoleVo();
    },


    openCallBack: function () {
        this.background = this.seekChild("background")
        this.background.scale = FIT_SCALE;
        this.main_panel = this.seekChild("main_panel");
        this.scroll_container = this.seekChild("scroll_container");
        this.desc = this.seekChild(this.main_panel, "desc", cc.Label);
        this.close_btn = this.seekChild("close_btn");

        this.exit_btn = this.seekChild(this.main_panel, "exit_btn");
        this.exit_btn_label = this.seekChild(this.exit_btn, "label", cc.Label);

        this.explain_btn = this.seekChild(this.main_panel, "explain_btn");
        this.extend_container = this.seekChild(this.main_panel, "extend_container");
        this.seekChild(this.main_panel, "win_title", cc.Label).string = Utils.TI18N("成员列表");
        this.seekChild(this.extend_container, "desc", cc.Label).string = Utils.TI18N("按钮中可执行任命、转让、移除等权限操作");
    },



    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openGuildMemberWindow(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openGuildMemberWindow(false)
        }.bind(this), 2)
        this.exit_btn.on(cc.Node.EventType.TOUCH_END, function () {
            this.ctrl.requestExitGuild();
        }, this)
        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            var pos = event.touch.getLocation();
            var config = Config.guild_data.data_const.game_rule;
            if (config)
                require("tips_controller").getInstance().showCommonTips(StringUtil.parse(config.desc), pos, null, null, 500);
        }, this)
        this.addGlobalEvent(GuildEvent.UpdateMyInfoEvent, function (key, value) {
            if (key == "members_num" || key == "members_max")
                this.updateMemberNum();
        }, this)
        this.addGlobalEvent(GuildEvent.UpdateMyMemberListEvent, function (type) {
            if (type == 0)
                return
            this.updateMemberList(type)
        }, this)
        this.addGlobalEvent(GuildEvent.UpdateAssistantNumEvent, function () {
            if (this.role_vo != null && this.role_vo.position != GuildConst.post_type.member)
                this.updateMemberNum();
        }, this)

        if (this.role_vo != null) {
            if (this.role_assets_event == null) {

                this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                    if (key == "gid") {
                        if (value == 0)
                            this.ctrl.openGuildMemberWindow(false);
                    } else if (key == "position")
                        this.updateExitStatus();
                }, this)
            }
        }
    },

    openRootWnd: function () {
        this.ctrl.requestGuildMemberList();
        this.updateMemberNum();
        this.updateExitStatus();
    },

    updateExitStatus: function () {
        if (this.role_vo == null)
            return
        if (this.role_vo.position == GuildConst.post_type.leader)
            this.exit_btn_label.string = Utils.TI18N("解散公会");
        else
            this.exit_btn_label.string = Utils.TI18N("退出公会");

        this.extend_container.active = this.role_vo.position != GuildConst.post_type.member;
    },

    //只有会长或者副会长才做这个处理
    updateMemberNum: function () {
        if (this.my_guild_info != null && this.role_vo != null) {
            if (this.role_vo.position == GuildConst.post_type.member)
                this.desc.string = cc.js.formatStr("人数：%s/%s", this.my_guild_info.members_num, this.my_guild_info.members_max);
            else {
                var config = Config.guild_data.data_post[Utils.getNorKey(GuildConst.post_type.assistant, this.my_guild_info.lev)];
                if (config != null) {
                    var num = this.model.getAssistantSum();
                    this.desc.string = cc.js.formatStr("%s%s/%s   %s%s/%s", Utils.TI18N("人数："), this.my_guild_info.members_num, this.my_guild_info.members_max, Utils.TI18N("副会长："), num, config.num)
                }
            }
        }
    },

    //打开窗体或者收到增删成员的时候才会更新
    updateMemberList: function (type) {
        var list = this.model.getGuildMemberList();
        if (list != null && Utils.next(list) != null) {
            if (this.scroll_view == null) {
                var size = this.scroll_container.getContentSize();
                var list_size = cc.size(size.width, size.height - 10);
                var setting = {
                    item_class: GuildMemberItem,      // 单元类
                    start_x: 4,                    // 第一个单元的X起点
                    space_x: 0,                    // x方向的间隔
                    start_y: 0,                    // 第一个单元的Y起点
                    space_y: 0,                   // y方向的间隔
                    item_width: 600,               // 单元的尺寸width
                    item_height: 135,              // 单元的尺寸height
                    row: 0,                        // 行数，作用于水平滚动类型
                    col: 1,                        // 列数，作用于垂直滚动类型
                    need_dynamic: true
                }
                this.scroll_view = new CommonScrollView()
                this.scroll_view.createScroll(this.scroll_container, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, list_size, setting, cc.v2(0.5, 0.5))
            }
            // if (type == 1) {
            list.sort(Utils.tableLowerSorter(["_index"]));
            if (this.scroll_view)
                this.scroll_view.setData(list);
            // } else {
            //     var sort_func = Utils.tableLowerSorter(["_index"]);
            //     this.scroll_view.resetAddPosition(list, sort_func);
            // }
        }
    },

    closeCallBack: function () {
        this.ctrl.openGuildMemberWindow(false);
        if (this.role_vo != null) {
            if (this.role_assets_event != null) {
                this.role_vo.unbind(this.role_assets_event);
                this.role_assets_event = null;
            }
        }
        if (this.scroll_view) {
            this.scroll_view.deleteMe();
            this.scroll_view = null
        }
    }

});

module.exports = GuildMemberWindow;