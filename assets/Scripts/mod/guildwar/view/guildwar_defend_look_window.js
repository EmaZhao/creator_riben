// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-11 16:23:58
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var GuildwarDefendLookItem = require("guildwar_defend_look_item");
var GuildwarBattleArrayPanel = require("guildwar_battle_array_panel");

var Guildwar_defend_lookWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_defend_look_window");
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
        this.container = this.seekChild("container");
        this.close_btn = this.seekChild("close_btn");
        this.no_vedio_image_nd = this.seekChild("no_vedio_image");
        this.no_vedio_nd = this.seekChild("no_vedio_label");
        this.time_label_lb = this.seekChild("time_label", cc.Label);
        this.list_panel = this.seekChild("list_panel");

        this.time_label_lb.string = Config.guild_war_data.data_const.time_desc.desc || "";

        var tab_size = this.list_panel.getContentSize();
        var setting = {
            item_class: GuildwarDefendLookItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 616,               // 单元的尺寸width
            item_height: 218,              // 单元的尺寸height
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
            this.ctrl.openDefendLookWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openDefendLookWindow(false);
        }.bind(this), 2)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.ctrl.requestPositionDefendData(params.g_id, params.g_sid, params.pos);
    },

    setData: function (data) {
        data = data || {};

        //敌方阵容
        if (!this.enemy_battle_array_panel) {
            this.enemy_battle_array_panel = new GuildwarBattleArrayPanel();
            this.enemy_battle_array_panel.show();
            this.enemy_battle_array_panel.setParent(this.container);
            this.enemy_battle_array_panel.setPanelContentSize(cc.size(616, 190));
            this.enemy_battle_array_panel.setPosition(0, 260);
        }
        var battle_array_data = {};
        var partner_list = [];
        for (var k in data.defense) {
            partner_list.push(data.defense[k]);
        }
        battle_array_data.partner_list = partner_list;
        battle_array_data.power = data.power;
        battle_array_data.formation_type = data.formation_type;
        battle_array_data.formation_lev = data.formation_lev;
        this.enemy_battle_array_panel.setData(battle_array_data);

        //防守列表
        if (data.guild_war_role_log && Utils.next(data.guild_war_role_log) != null) {
            this.box_scrollview.setData(data.guild_war_role_log);
            this.no_vedio_image_nd.active = false;
            this.no_vedio_nd.active = false;
        } else {
            this.no_vedio_image_nd.active = true;
            this.no_vedio_nd.active = true;
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.box_scrollview) {
            this.box_scrollview.deleteMe();
            this.box_scrollview = null;
        }
        if (this.enemy_battle_array_panel) {
            this.enemy_battle_array_panel.deleteMe();
            this.enemy_battle_array_panel = null;
        }
        this.ctrl.openDefendLookWindow(false);
    },
})