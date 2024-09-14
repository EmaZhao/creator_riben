// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-08 15:12:20
// --------------------------------------------------------------------
var CommonScrollView = require("common_scrollview");
var GuildwarEvent = require("guildwar_event");
var GuildwarConst = require("guildwar_const");
var TimeTool = require("timetool");
var GuildwarAwardBoxItem = require("guildwar_award_box_item");

var PathTool = require("pathtool");
var Guildwar_award_boxWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_award_box_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = require("guildwar_controller").getInstance();
        this.model = this.ctrl.getModel();
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;
        var main_container = this.seekChild("main_container");
        this.time_tips_lb = this.seekChild(main_container, "time_tips", cc.Label);
        this.tips_txt_lb = this.seekChild(main_container, "tips_txt", cc.Label);
        this.tips_txt_lb.string = Utils.TI18N("宝箱在公会战结束后产生，成员每人可开启1次，试试你的手气吧！");
        this.title_label_lb = this.seekChild(main_container, "title_label", cc.Label);
        this.line_1_nd = this.seekChild(main_container, "line_1");
        this.line_2_nd = this.seekChild(main_container, "line_2");

        this.explain_btn = this.seekChild(main_container, "explain_btn");
        this.preview_btn = this.seekChild(main_container, "preview_btn");
        this.preview_btn.active = false;

        this.no_box_image_nd = this.seekChild(main_container, "no_box_image");

        var box_list = this.seekChild(main_container, "box_list")
        var tab_size = box_list.getContentSize();
        var setting = {
            item_class: GuildwarAwardBoxItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 6,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 6,                   // y方向的间隔
            item_width: 206,               // 单元的尺寸width
            item_height: 218,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 3,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.box_scrollview = new CommonScrollView()
        this.box_scrollview.createScroll(box_list, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
        Utils.getNodeCompByPath("main_container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("公会战奖励");
        Utils.getNodeCompByPath("main_container/no_box_image/label", this.root_wnd, cc.Label).string = Utils.TI18N("公会战尚未结算，暂无奖励内容");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openAwardBoxWindow(false);
        }.bind(this), 2)

        this.explain_btn.on(cc.Node.EventType.TOUCH_END, function (event) {
            Utils.playButtonSound(1);
            var pos = event.touch.getLocation();
            require("tips_controller").getInstance().showCommonTips(Config.guild_war_data.data_const.box_rule.desc, pos);
        });

        Utils.onTouchEnd(this.preview_btn, function () {
            this.ctrl.openAwardBoxPreview(true);
        }.bind(this), 1)

        //宝箱数据
        this.addGlobalEvent(GuildwarEvent.UpdateGuildWarBoxDataEvent, function (data) {
            this.setData(data);
        }, this)

        //玩家领取了宝箱
        this.addGlobalEvent(GuildwarEvent.UpdateMyAwardBoxEvent, function () {
            this.refreshTimeTips();
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.ctrl.requestAwardBoxData();
    },

    setData: function (data) {
        if (!data) return
        this.data = data;

        var box_data = this.model.getGuildWarBoxData();
        var cur_time = gcore.SmartSocket.getTime();

        //领取时间已到或进行中或没有宝箱数据
        if (this.data.end_time <= cur_time || Utils.next(box_data) == null) {
            this.no_box_image_nd.active = true;
            this.title_label_lb.node.active = false;
            this.time_tips_lb.node.active = false;
            this.line_1_nd.active = false;
            this.line_2_nd.active = false;
            this.box_scrollview.setVisible(false);
            this.box_scrollview.setData([]);
        } else {
            this.no_box_image_nd.active = false;
            this.title_label_lb.node.active = true;
            this.time_tips_lb.node.active = true;
            this.line_1_nd.active = true;
            this.line_2_nd.active = true;
            this.box_scrollview.setVisible(true);

            this.refreshTimeTips();

            if (this.data.result == GuildwarConst.box_type.gold) {
                this.title_label_lb.string = Utils.TI18N("公会战荣耀黄金宝箱");
            } else {
                this.title_label_lb.string = Utils.TI18N("公会战激励青铜宝箱");
            }
            this.box_scrollview.setData(box_data);
        }
    },

    //刷新领取状态
    refreshTimeTips: function () {
        if (this.data && this.time_tips_lb) {
            //是否有权限领取（活跃人员可以领取）
            if (this.data.status == 0) {
                this.time_tips_lb.string = cc.js.formatStr(Utils.TI18N("您此前处于不活跃状态，不可开启宝箱"));
                this.time_tips_lb.node.color = new cc.Color(217, 80, 20);
                this.openBoxAwardTimer(false);
            } else if (this.model.checkIsGetBoxAward()) {
                this.time_tips_lb.string = cc.js.formatStr(Utils.TI18N("您已开启过宝箱"));
                this.time_tips_lb.node.color = new cc.Color(36, 144, 3);
                this.openBoxAwardTimer(false);
            } else {
                var cur_time = gcore.SmartSocket.getTime();
                var left_time = this.data.end_time - cur_time;
                if (left_time < 0) {
                    left_time = 0;
                }
                this.time_tips_lb.string = cc.js.formatStr(Utils.TI18N("请在%s内领取宝箱"), TimeTool.getTimeFormat(left_time));
                this.time_tips_lb.node.color = new cc.Color(36, 144, 3);
                this.openBoxAwardTimer(true);
            }
        }
    },

    //剩余领取时间倒计时
    openBoxAwardTimer: function (status) {
        if (status == true) {
            if (!this.box_award_timer) {
                this.box_award_timer = gcore.Timer.set(function () {
                    if (this.data) {
                        var cur_time = gcore.SmartSocket.getTime();
                        var left_time = this.data.end_time - cur_time;
                        if (left_time < 0) {
                            left_time = 0;
                            gcore.Timer.del(this.box_award_timer);
                            this.box_award_timer = null;
                        }
                        this.time_tips_lb.string = cc.js.formatStr(Utils.TI18N("请在%s内领取宝箱"), TimeTool.getTimeFormat(left_time));
                    } else {
                        gcore.Timer.del(this.box_award_timer);
                        this.box_award_timer = null;
                    }
                }.bind(this), 1000, -1)
            }
        } else {
            if (this.box_award_timer != null) {
                gcore.Timer.del(this.box_award_timer);
                this.box_award_timer = null;
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if(this.box_scrollview){
            this.box_scrollview.deleteMe();
            this.box_scrollview = null;
        }
        this.openBoxAwardTimer(false);
        this.ctrl.openAwardBoxWindow(false)
    },
})