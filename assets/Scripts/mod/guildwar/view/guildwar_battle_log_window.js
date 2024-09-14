// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     战场日志
// <br/>Create: 2019-05-09 10:20:57
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var GuildwarBattleLogItem = require("guildwar_battle_log_item");

var Guildwar_battle_logWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_battle_log_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.tab_list = {};
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
        this.color_1 = new cc.Color(245, 224, 185, 255);
        this.color_2 = new cc.Color(105, 55, 5, 255);
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        var tab_container = this.seekChild("tab_container");
        for (var i = 1; i < 3; i++) {
            var object = {};
            var tab_btn = this.seekChild(tab_container, "tab_btn_" + i);
            if (tab_btn) {
                var title = tab_btn.getChildByName("title").getComponent(cc.Label);
                var btn = tab_btn.getComponent(cc.Button);
                if (i == 1) {
                    title.string = Utils.TI18N("战场日志");
                } else if (i == 2) {
                    title.string = Utils.TI18N("我的日志");
                }
                title.node.color = new cc.Color(0xf5, 0xe0, 0xb9, 0xff);
                var tips = tab_btn.getChildByName("tips");
                object.tab_btn = tab_btn;
                object.label = title;
                object.index = i;
                object.tips = tips;
                object.btn = btn;
                this.tab_list[i] = object;
            }
        }
        this.close_btn = this.seekChild("close_btn");
        this.confirm_btn = this.seekChild("confirm_btn");
        this.log_panel = this.seekChild("log_panel");
        this.no_log_label_nd = this.seekChild("no_log_label");
        this.no_log_iamge_nd = this.seekChild("no_log_image");

        var tab_size = this.log_panel.getContentSize();
        var setting = {
            item_class: GuildwarBattleLogItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 612,               // 单元的尺寸width
            item_height: 163,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型 
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.box_scrollview = new CommonScrollView()
        this.box_scrollview.createScroll(this.log_panel, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openBattleLogWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openBattleLogWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.confirm_btn, function () {
            this.ctrl.openBattleLogWindow(false);
        }.bind(this), 2)
        for (var k in this.tab_list) {
            const object = this.tab_list[k];
            if (object.tab_btn) {
                object.tab_btn.on(cc.Node.EventType.TOUCH_END, function () {
                    this.changeSelectedTab(object.index);
                }, this)
            }
        }
    },

    changeSelectedTab: function (index) {
        if (this.tab_object != null && this.tab_object.index == index) return
        if (this.tab_object) {
            this.tab_object.label.node.color = this.color_1;
            this.tab_object.btn.interactable = false;
            this.tab_object = null;
        }
        this.tab_object = this.tab_list[index];
        if (this.tab_object) {
            this.tab_object.label.node.color = this.color_2;
            this.tab_object.btn.interactable = true;
        }
        if (this.data && Utils.next(this.data) != null) {
            this.refreshLogList();
        }
    },

    refreshLogList: function () {
        if (this.tab_object && this.tab_object.index) {
            if (this.tab_object.index == 1) {
                if (this.all_log_data && Utils.next(this.all_log_data) != null) {
                    this.box_scrollview.setData(this.all_log_data);
                } else {
                    for (var i in this.data) {
                        var lData = this.data[i];
                        var is_win = false;
                        for (var k in lData.int_args) {
                            var args = lData.int_args[k];
                            if (args.key == 5) {
                                is_win = args.val == 1;
                                break
                            }
                        }
                        if (is_win) {
                            this.all_log_data.push(lData);
                        }
                    }
                    this.box_scrollview.setData(this.all_log_data);
                }
                if (this.all_log_data && Utils.next(this.all_log_data) != null) {
                    this.no_log_iamge_nd.active = false;
                    this.no_log_label_nd.active = false;
                } else {
                    this.no_log_iamge_nd.active = true;
                    this.no_log_label_nd.active = true;
                }
            } else {
                if (this.my_log_data && Utils.next(this.my_log_data) != null) {
                    this.box_scrollview.setData(this.my_log_data);
                } else {
                    var role_vo = require("role_controller").getInstance().getRoleVo();
                    for (var i in this.data) {
                        var lData = this.data[i];
                        if (role_vo.rid == lData.rid1 && role_vo.srv_id == lData.srv_id1) {
                            this.my_log_data.push(lData);
                        }
                    }
                    this.box_scrollview.setData(this.my_log_data);
                }
                if (this.my_log_data && Utils.next(this.my_log_data) != null) {
                    this.no_log_iamge_nd.active = false;
                    this.no_log_label_nd.active = false;
                } else {
                    this.no_log_iamge_nd.active = true;
                    this.no_log_label_nd.active = true;
                }
            }
        }
    },

    setData: function (data) {
        this.data = data;
        this.all_log_data = [];
        this.my_log_data = [];
        this.refreshLogList();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (index) {
        index = index || 1;
        this.changeSelectedTab(index);
        this.ctrl.requestBattleLogData();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.box_scrollview) {
            this.box_scrollview.deleteMe();
            this.box_scrollview = null;
        }
        this.ctrl.openBattleLogWindow(false);
    },
})