// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     对阵列表
// <br/>Create: 2019-05-09 10:20:28
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var GuildwarBattleListItem = require("guildwar_battle_list_item");

var Guildwar_battle_listWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildwar", "guildwar_against_list_panel");
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
        var container = this.seekChild("main_container");

        this.close_btn = this.seekChild("close_btn");
        this.explain_btn = this.seekChild("explain_btn");

        this.time_label_lb = this.seekChild(container, "time_label", cc.Label);
        this.item_list_nd = this.seekChild(container, "item_list");
        this.my_item_bg_nd = this.seekChild(container, "image_3");

        this.time_label_lb.string = Config.guild_war_data.data_const.time_desc.desc || "";

        this.no_log_image_nd = this.seekChild("no_log_image");
        this.no_log_label_lb = this.seekChild("no_log_label", cc.Label);
        this.no_log_label_lb.string = Utils.TI18N("暂无其他对阵");
        this.tips_label_lb = this.seekChild("tips_label", cc.Label);

        var tab_size = this.item_list_nd.getContentSize();
        var setting = {
            item_class: GuildwarBattleListItem,      // 单元类
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
        this.box_scrollview.createScroll(this.item_list_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, tab_size, setting, cc.v2(0.5, 0.5))
        Utils.getNodeCompByPath("main_container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("战斗列表");
        Utils.getNodeCompByPath("main_container/title_label_1", this.root_wnd, cc.Label).string = Utils.TI18N("本盟对阵");
        Utils.getNodeCompByPath("main_container/title_label_2", this.root_wnd, cc.Label).string = Utils.TI18N("其他对阵");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openBattleListWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openBattleListWindow(false);
        }.bind(this), 2)
        Utils.onTouchEnd(this.explain_btn, function () {
            require("mainui_controller").getInstance().openCommonExplainView(true, Config.guild_war_data.data_explain);
        }.bind(this), 1)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function () {
        this.ctrl.requestGuildWarBattleList();
    },

    setData: function (data) {
        data.match_info = data.match_info || {};
        var guild_info = require("guild_controller").getInstance().getModel().getMyGuildInfo();

        //选出我方联盟对战数据
        var myGuildWarBattleInfo = {};
        var is_join = false;    //是否参与了匹配
        for (var k in data.match_info) {
            var v = data.match_info[k];
            if (v.g_id1 == guild_info.gid && v.g_sid1 == guild_info.gsrv_id) {
                if (v.g_id2 != 0) {
                    myGuildWarBattleInfo = data.match_info.splice(k, 1);
                }
                is_join = true;
                break
            } else if (v.g_id2 == guild_info.gid && v.g_sid2 == guild_info.gsrv_id) {
                if (v.g_id1 != 0) {
                    myGuildWarBattleInfo = data.match_info.splice(k, 1);
                }
                is_join = true;
                break
            }
        }

        this.data = [];
        //排除掉轮空的
        for (var i in data.match_info) {
            var v = data.match_info[i];
            if (v.g_id1 != 0 && v.g_id2 != 0) {
                this.data.push(v);
            }
        }

        var sortFunc = function (objA, objB) {
            if (objA.rank1 == 0 && objB.rank1 == 0) {
                return 1
            } else if (objA.rank1 != 0 && objB.rank1 == 0) {
                return -1
            } else if (objA.rank1 == 0 && objB.rank1 != 0) {
                return 1
            } else {
                return objA.rank1 - objB.rank1
            }
        }
        this.data.sort(sortFunc);
        if (myGuildWarBattleInfo && Utils.next(myGuildWarBattleInfo) != null) {
            this.tips_label_lb.node.active = false;
            if (!this.my_guildwar_battle_item) {
                this.my_guildwar_battle_item = new GuildwarBattleListItem();
                this.my_guildwar_battle_item.show();
                this.my_guildwar_battle_item.setParent(this.my_item_bg_nd);
                var item_bg_size = this.my_item_bg_nd.getContentSize();
                this.my_guildwar_battle_item.setPosition(0,- item_bg_size.height / 2)
                this.my_guildwar_battle_item.setData(myGuildWarBattleInfo[0]);
            }
        } else {
            this.tips_label_lb.string = true;
            if (is_join) {
                this.tips_label_lb.string = Utils.TI18N("本次公会战轮空");
            } else {
                this.tips_label_lb.string = Utils.TI18N("由于公会内活跃人数不足，无法参与本次公会战")
            }
        }

        if (this.data && Utils.next(this.data) != null) {
            this.box_scrollview.setData(this.data);
            this.no_log_image_nd.active = false;
            this.no_log_label_lb.node.active = false;
        } else {
            this.no_log_image_nd.active = true;
            if(this.no_log_image_sp == null){
                this.no_log_image_sp = this.no_log_image_nd.getComponent(cc.Sprite);
                this.loadRes(PathTool.getBigBg("bigbg_3"),function(sp){
                    this.no_log_image_sp.spriteFrame = sp;
                }.bind(this))
            }
            this.no_log_label_lb.node.active = true;
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if (this.box_scrollview) {
            this.box_scrollview.deleteMe();
            this.box_scrollview = null;
        }
        this.ctrl.openBattleListWindow(false);
    },
})