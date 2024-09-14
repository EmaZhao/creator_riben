// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-09 16:24:04
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview")
var GuildwarAwardItem = require("guildwar_award_item");

var Guildwar_awardWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_award_list_panel");
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
        this.main_container = this.seekChild("main_container");
        this.close_btn = this.seekChild("close_btn");
        this.item_list = this.seekChild("item_list");

        var tab_size = this.item_list.getContentSize();
        var setting = {
            item_class: GuildwarAwardItem,      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: -4,                   // y方向的间隔
            item_width: 616,               // 单元的尺寸width
            item_height: 124,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型 
            col: 1,                        // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.box_scrollview = new CommonScrollView()
        this.box_scrollview.createScroll(this.item_list, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openGuildWarAwardWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openGuildWarAwardWindow(false);
        }.bind(this), 2)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {
        this.setData();
    },

    setData: function () {
        var award_data = this.getGuildWarAwardData();
        for (var i in award_data) {
            var data = award_data[i];
            var pre_num = 1;
            if (award_data[i - 1]) {
                pre_num = award_data[i - 1].num + 1;
            }
            data.pre_num = pre_num;
        }
        this.box_scrollview.setData(award_data);
    },

    getGuildWarAwardData: function () {
        var award_data = [];
        for (var k in Config.guild_war_data.data_award) {
            var v = Config.guild_war_data.data_award[k];
            var temp_data = Utils.deepCopy(v);
            award_data.push(temp_data)
        }
        award_data.sort(Utils.tableLowerSorter(["num"]));
        return award_data
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.box_scrollview) {
            this.box_scrollview.deleteMe();
            this.box_scrollview = null;
        }
        this.ctrl.openGuildWarAwardWindow(false);
    },
})