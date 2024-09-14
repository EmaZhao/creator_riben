// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     联盟战 进攻一览
// <br/>Create: 2019-05-09 16:23:14
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var GuildwarAttkLookItem = require("guildwar_attk_look_item");

var Guildwar_attk_lookWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_attk_look_window");
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
        this.challenge_lb = this.seekChild("challenge_label",cc.Label);
        this.close_btn = this.seekChild("close_btn");
        this.confirm_btn = this.seekChild("confirm_btn");
        this.confirm_btn_lb = this.seekChild(this.confirm_btn, "label", cc.Label);
        this.list_panel = this.seekChild("list_panel");

        var tab_size = this.list_panel.getContentSize();
        var setting = {
            item_class: GuildwarAttkLookItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 616,               // 单元的尺寸width
            item_height: 124,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型 
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.box_scrollview = new CommonScrollView()
        this.box_scrollview.createScroll(this.list_panel, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openAttkLookWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openAttkLookWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.confirm_btn, function () {
            this.ctrl.openAttkLookWindow(false);
        }.bind(this), 2)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.setData();
    },

    setData: function () {
        //挑战次数
        var challenge_count = this.model.getGuildWarChallengeCount();
        var max_count = Config.guild_war_data.data_const.challange_time_limit.val;
        this.challenge_lb.string = cc.js.formatStr(Utils.TI18N("挑战次数：%s/%s"), (max_count - challenge_count), max_count);
        var enemy_position_data = this.model.getEnemyGuildWarPositionList();
        var sortFunc = function (objA, objB) {
            if (objA.hp == objB.hp) {
                return objA.pos - objB.pos
            } else {
                return objB.hp - objA.hp
            }
        }
        enemy_position_data.sort(sortFunc);
        this.box_scrollview.setData(enemy_position_data);
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.box_scrollview) {
            this.box_scrollview.deleteMe();
            this.box_scrollview = null;
        }
        this.ctrl.openAttkLookWindow(false);
    },
})