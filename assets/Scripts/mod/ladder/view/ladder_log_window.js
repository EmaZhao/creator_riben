// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     天梯战报
// <br/>Create: 2019-07-24 16:56:10
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var LadderController = require("ladder_controller");
var LadderGodLogItem = require("ladder_god_log_item");
var LadderMyLogItem = require("ladder_my_log_item");
var RoleController = require("role_controller");
var ChatConst = require("chat_const");
var LadderEvent = require("ladder_event");

var Ladder_logWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("ladder", "ladder_log_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.tab_list = {};
        this.color = new cc.Color(0xf5, 0xe0, 0xb9, 0xff);
        this.color_1 = new cc.Color(245, 224, 185, 255);
        this.color_2 = new cc.Color(105, 55, 5, 255);
        this.ctrl = LadderController.getInstance();
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        let container = this.seekChild("container");
        let win_title = this.seekChild("win_title");
        win_title.string = Utils.TI18N("战 报");

        this.title_bg = this.seekChild("title_bg");
        let enemy_title = this.seekChild(this.title_bg, "title_bg", cc.Label);
        enemy_title.string = Utils.TI18N("对手");
        let more_title = this.seekChild(this.title_bg, "more_title", cc.Label);
        more_title.string = Utils.TI18N("详细");

        this.share_panel = this.seekChild("share_panel");
        this.share_panel.active = false;
        let share_bg = this.seekChild("share_bg");
        this.share_bg = share_bg;
        this.btn_guild = this.seekChild(share_bg, "btn_guild");
        this.btn_world = this.seekChild(share_bg, "btn_world");
        this.btn_cross = this.seekChild(share_bg, "btn_cross");
        let guild_label = this.seekChild(share_bg, "guild_label", cc.Label);
        guild_label.string = Utils.TI18N("公会频道");
        let world_label = this.seekChild(share_bg, "world_label", cc.Label);
        world_label.string = Utils.TI18N("世界频道");
        let cross_label = this.seekChild(share_bg, "cross_label", cc.Label);
        cross_label.string = Utils.TI18N("跨服频道");

        let tab_container = this.seekChild(container, "tab_container");
        for (let i = 1; i <= 2; i++) {
            let object = {};
            let tab_btn = this.seekChild(tab_container, "tab_btn_" + i);
            if (tab_btn) {
                let title = tab_btn.getChildByName("title").getComponent(cc.Label);
                if (i == 1) {
                    title.string = Utils.TI18N("我的记录");
                } else if (i == 2) {
                    title.string = Utils.TI18N("大神风采");
                }
                title.node.color = this.color;
                let tips = tab_btn.getChildByName("tips");
                object.tab_btn = tab_btn;
                object.tab_btn_sp = tab_btn.getComponent(cc.Sprite);
                object.label = title;
                object.index = i;
                object.tips = tips;
                this.tab_list[i] = object;
            }
        }

        this.close_btn = this.seekChild("close_btn");
        this.confirm_btn = this.seekChild("confirm_btn");
        this.no_log_label = this.seekChild("no_log_label", cc.Label);
        this.no_log_image = this.seekChild("no_log_image");
        this.my_log_panel = this.seekChild("my_log_panel");
        this.god_log_panel = this.seekChild("god_log_panel");
        this.no_log_label.string = Utils.TI18N("暂无战报");

        var bgSize = this.my_log_panel.getContentSize();
        var tab_size = cc.size(bgSize.width, bgSize.height - 8);
        var setting = {
            item_class: LadderMyLogItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: -5,                    // 第一个单元的Y起点
            space_y: -5,                   // y方向的间隔
            item_width: 612,               // 单元的尺寸width
            item_height: 135,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.my_log_scrollview = new CommonScrollView()
        this.my_log_scrollview.createScroll(this.my_log_panel, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))

        var bgSize = this.my_log_panel.getContentSize();
        var tab_size = cc.size(bgSize.width, bgSize.height - 8);
        var setting = {
            item_class: LadderGodLogItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: -5,                    // 第一个单元的Y起点
            space_y: -5,                   // y方向的间隔
            item_width: 612,               // 单元的尺寸width
            item_height: 153,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.god_log_scrollview = new CommonScrollView()
        this.god_log_scrollview.createScroll(this.my_log_panel, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openLadderLogWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openLadderLogWindow(false);
        }.bind(this), 2)

        Utils.onTouchEnd(this.share_panel, function () {
            this.share_panel.active = false;
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_world, function () {
            if (this.replay_id != null && this.def_name && this.share_srv_id != null) {
                this.ctrl.requestShareVideo(this.replay_id, this.share_srv_id, ChatConst.Channel.World, this.def_name);
            }
            this.share_panel.active = false;
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_guild, function () {
            let role_vo = RoleController.getInstance().getRoleVo();
            if (role_vo && role_vo.gid != 0 && role_vo.gsrv_id != "") {
                if (this.replay_id != null && this.def_name && this.share_srv_id != null) {
                    this.ctrl.requestShareVideo(this.replay_id, this.share_srv_id, ChatConst.Channel.Gang, this.def_name);
                }
            } else {
                message(Utils.TI18N("暂无公会"));
            }
        }.bind(this), 1)

        Utils.onTouchEnd(this.btn_cross, function () {
            if (this.replay_id != null && this.def_name && this.share_srv_id != null) {
                this.ctrl.requestShareVideo(this.replay_id, this.share_srv_id, ChatConst.Channel.Gang, this.def_name);
            }
            this.share_panel.active = false;
        }.bind(this), 1)

        for (let k in this.tab_list) {
            let object = this.tab_list[k];
            if (object.tab_btn) {
                object.tab_btn.on(cc.Node.EventType.TOUCH_END, function () {
                    Utils.playButtonSound(1);
                    this.changeSelectedTab(object.index);
                }, this)
            }
        }

        this.addGlobalEvent(LadderEvent.UpdateLadderMyLogData, function (data) {
            this.my_log_replay_srv_id = data.replay_srv_id;
            if (data.log_list) {
                this.setMyLogData(data.log_list);
            }
        }, this)

        this.addGlobalEvent(LadderEvent.UpdateLadderGodLogData, function (data) {
            this.god_log_replay_srv_id = data.replay_srv_id;
            if (data.log_list) {
                this.setGodLogData(data.log_list);
            }
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (index) {
        index = index || 1;
        this.changeSelectedTab(index);
    },

    changeSelectedTab: function (index) {
        if (this.tab_object != null && this.tab_object.index == index) return
        if (this.tab_object) {
            // this.tab_object.tab_btn
            this.loadRes(PathTool.getUIIconPath("common", "common_2023"), function (sp) {
                this.tab_object.tab_btn_sp.spriteFrame = sp;
            }.bind(this))
            this.tab_object.label.node.color = this.color_1;
            this.tab_object = null;
        }

        this.tab_object = this.tab_list[index];
        if (this.tab_object) {
            this.loadRes(PathTool.getUIIconPath("common", "common_2021"), function (sp) {
                this.tab_object.tab_btn_sp.spriteFrame = sp;
            }.bind(this))
            this.tab_object.label.node.color = this.color_2;
        }

        this.__ctor__.title_bg.active = index == 1;
        this.my_log_scrollview.setRootVisible(index == 1);
        this.god_log_scrollview.setRootVisible(index == 2);

        if ((index == 1 && this.myLogData && Utils.next(this.myLogData)) != null || (index == 2 && this.godLogData && Utils.next(this.godLogData) != null)) {
            this.no_log_image.active = false;
            this.no_log_label.node.active = false;
        } else {
            this.no_log_image.active = true;
            this.no_log_label.node.active = true;
        }

        if (index == 1 && !this.init_my_log) {
            this.ctrl.requestMyLogData();
            this.init_my_log = true;
        } else if (index == 2 && !this.init_god_log) {
            this.ctrl.requestGodLogData();
            this.init_god_log = true;
        }
    },

    setMyLogData: function (myLogData) {
        if (this.tab_object == null || this.tab_object.index != 1) return
        this.myLogData = myLogData;
        if (myLogData && Utils.next(myLogData) != null) {
            this.my_log_scrollview.setRootVisible(true);
            this.no_log_image.active = false;
            this.no_log_label.node.active = false;

            let extend = {};
            extend.callback = function (world_pos, replay_id, name, srv_id) {
                this.replay_id = replay_id;
                this.def_name = name;
                this.share_srv_id = srv_id;
                let node_pos = this.share_panel.convertToNodeSpaceAR(world_pos);
                if (node_pos) {
                    this.share_bg.setPosition(cc.v2(node_pos.x - 32, node_pos.y + 70));
                    this.share_panel.active = true;
                }
            }.bind(this)
            extend.replay_srv_id = this.my_log_replay_srv_id;
            this.my_log_scrollview.setData(myLogData, null, extend);
        } else {
            this.my_log_scrollview.setRootVisible(false);
            this.no_log_image.active = true;
            this.no_log_label.active = true;
        }
    },

    setGodLogData: function (godLogData) {
        if (this.tab_object == null || this.tab_object.index != 2) return
        this.godLogData = godLogData;
        if (godLogData && Utils.next(godLogData) != null) {
            this.god_log_scrollview.setRootVisible(true);
            this.no_log_image.active = false;
            this.no_log_label.active = false;
            this.god_log_scrollview.setData(godLogData, null, this.god_log_replay_srv_id);
        } else {
            this.god_log_scrollview.setRootVisible(false);
            this.no_log_image.active = true;
            this.no_log_label.active = true;
        }
    },



    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.model.updateLadderRedStatus(LadderConst.RedType.BattleLog, false);
        if (this.my_log_scrollview) {
            this.my_log_scrollview.deleteMe();
            this.my_log_scrollview = null;
        }
        if (this.god_log_scrollview) {
            this.god_log_scrollview.deleteMe();
            this.god_log_scrollview = null;
        }
        this.ctrl.openLadderLogWindow(false);
    },
})